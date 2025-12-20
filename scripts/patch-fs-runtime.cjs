const fs = require('fs');
const path = require('path');

// Patch fs.readlink and fs.readlinkSync to handle EISDIR on Windows mapped drives
const originalReadlink = fs.readlink;
const originalReadlinkSync = fs.readlinkSync;
const originalPromisesReadlink = fs.promises ? fs.promises.readlink : null;

fs.readlink = function(path, options, callback) {
  // console.log('readlink called for:', path);
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  originalReadlink(path, options, (err, linkString) => {
    if (err && err.code === 'EISDIR') {
      // If it's a directory but readlink was called, it might be treated as a symlink check
      // Return an EINVAL error which is what readlink returns for non-symlinks
      const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      newErr.code = 'EINVAL';
      newErr.errno = -4071; // EINVAL errno
      newErr.syscall = 'readlink';
      newErr.path = path;
      return callback(newErr);
    }
    callback(err, linkString);
  });
};

fs.readlinkSync = function(path, options) {
  try {
    return originalReadlinkSync(path, options);
  } catch (err) {
    if (err.code === 'EISDIR') {
      const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      newErr.code = 'EINVAL';
      newErr.errno = -4071;
      newErr.syscall = 'readlink';
      newErr.path = path;
      throw newErr;
    }
    throw err;
  }
};

if (originalPromisesReadlink) {
    fs.promises.readlink = async function(path, options) {
        try {
            return await originalPromisesReadlink(path, options);
        } catch (err) {
            if (err.code === 'EISDIR') {
                const newErr = new Error(`EINVAL: invalid argument, readlink '${path}'`);
                newErr.code = 'EINVAL';
                newErr.errno = -4071;
                newErr.syscall = 'readlink';
                newErr.path = path;
                throw newErr;
            }
            throw err;
        }
    };
}

// Helper for retries
function shouldRetry(err) {
    return err && (err.code === 'UNKNOWN' || err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES' || err.code === 'EAGAIN');
}

function isDebugEnabled() {
    return process.env.FS_PATCH_DEBUG === '1';
}

function sleep(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {}
}

const MAX_RETRIES = 50;
const RETRY_DELAY = 200;

function isIgnorableNextTypesPath(p) {
    if (!p || typeof p !== 'string') return false;
    const normalized = p.replace(/\\/g, '/');
    return normalized.endsWith('/.next/types') || normalized.includes('/.next/types/');
}

// Patch lstat to retry on UNKNOWN error
const originalLstat = fs.lstat;
const originalLstatSync = fs.lstatSync;

fs.lstatSync = function(path, options) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        try {
            return originalLstatSync(path, options);
        } catch (err) {
            if (shouldRetry(err) && retries > 1) {
                // console.log(`[Patch] Retrying lstatSync on ${path} due to ${err.code}`);
                retries--;
                sleep(50 + Math.random() * 100);
                continue;
            }
            throw err;
        }
    }
};

fs.lstat = function(...args) {
    const callback = args.pop();
    const path = args[0];
    
    if (typeof callback !== 'function') {
        args.push(callback);
        return originalLstat.apply(this, args);
    }

    let retries = MAX_RETRIES;
    
    const attempt = () => {
        const wrappedCallback = (err, stats) => {
            if (shouldRetry(err) && retries > 0) {
                retries--;
                setTimeout(attempt, RETRY_DELAY + Math.random() * 100);
            } else {
                callback(err, stats);
            }
        };
        
        originalLstat.apply(this, [...args, wrappedCallback]);
    };
    
    attempt();
};

// Patch open/readFileSync to retry on UNKNOWN
const originalOpenSync = fs.openSync;
const originalReadFileSync = fs.readFileSync;

fs.openSync = function(path, flags, mode) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        try {
            return originalOpenSync(path, flags, mode);
        } catch (err) {
            if (shouldRetry(err) && retries > 1) {
                // console.log(`[Patch] Retrying openSync on ${path} due to ${err.code}`);
                retries--;
                sleep(RETRY_DELAY + Math.random() * 100);
                continue;
            }
            throw err;
        }
    }
};

fs.readFileSync = function(path, options) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        try {
            return originalReadFileSync(path, options);
        } catch (err) {
            if (shouldRetry(err) && retries > 1) {
                // console.log(`[Patch] Retrying readFileSync on ${path} due to ${err.code}`);
                retries--;
                sleep(RETRY_DELAY + Math.random() * 100);
                continue;
            }
            throw err;
        }
    }
};

// Patch realpath/realpathSync to retry on UNKNOWN
const originalRealpath = fs.realpath;
const originalRealpathSync = fs.realpathSync;

fs.realpathSync = function(path, options) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        try {
            return originalRealpathSync(path, options);
        } catch (err) {
            if (shouldRetry(err) && retries > 1) {
                // console.log(`[Patch] Retrying realpathSync on ${path} due to ${err.code}`);
                retries--;
                sleep(RETRY_DELAY + Math.random() * 100);
                continue;
            }
            throw err;
        }
    }
};
// Preserve properties like native
Object.assign(fs.realpathSync, originalRealpathSync);

fs.realpath = function(path, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    
    let retries = MAX_RETRIES;

    const attempt = () => {
        const cb = (err, resolvedPath) => {
            if (shouldRetry(err) && retries > 0) {
                // console.log(`[Patch] Retrying realpath on ${path} due to ${err.code}`);
                retries--;
                setTimeout(attempt, RETRY_DELAY + Math.random() * 100);
            } else {
                callback(err, resolvedPath);
            }
        };

        if (options) {
            originalRealpath(path, options, cb);
        } else {
            originalRealpath(path, cb);
        }
    };

    attempt();
};
// Preserve properties like native
Object.assign(fs.realpath, originalRealpath);

// Patch stat/statSync to retry on UNKNOWN
const originalStat = fs.stat;
const originalStatSync = fs.statSync;

fs.statSync = function(path, options) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        try {
            return originalStatSync(path, options);
        } catch (err) {
            if (shouldRetry(err) && retries > 1) {
                // console.log(`[Patch] Retrying statSync on ${path} due to ${err.code}`);
                retries--;
                sleep(RETRY_DELAY + Math.random() * 100);
                continue;
            }
            throw err;
        }
    }
};

fs.stat = function(...args) {
    const callback = args.pop();
    
    if (typeof callback !== 'function') {
        args.push(callback);
        return originalStat.apply(this, args);
    }

    let retries = MAX_RETRIES;
    
    const attempt = () => {
        const wrappedCallback = (err, stats) => {
            if (shouldRetry(err) && retries > 0) {
                retries--;
                setTimeout(attempt, RETRY_DELAY + Math.random() * 100);
            } else {
                callback(err, stats);
            }
        };
        
        originalStat.apply(this, [...args, wrappedCallback]);
    };
    
    attempt();
};

// Patch mkdir/mkdirSync to retry on EPERM
const originalMkdir = fs.mkdir;
const originalMkdirSync = fs.mkdirSync;

fs.mkdirSync = function(path, options) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        try {
            return originalMkdirSync(path, options);
        } catch (err) {
            if (shouldRetry(err) && retries > 1) {
                console.log(`[Patch] Retrying mkdirSync on ${path} due to ${err.code}`);
                retries--;
                sleep(RETRY_DELAY + Math.random() * 100);
                continue;
            }
            throw err;
        }
    }
};

fs.mkdir = function(...args) {
    const callback = args[args.length - 1];
    
    if (typeof callback !== 'function') {
        return originalMkdir.apply(this, args);
    }

    const argsWithoutCb = args.slice(0, -1);
    let retries = MAX_RETRIES;
    
    const attempt = () => {
        const wrappedCallback = (err, result) => {
            if (shouldRetry(err) && retries > 0) {
                console.log(`[Patch] Retrying mkdir on ${argsWithoutCb[0]} due to ${err ? err.code : 'unknown'}`);
                retries--;
                setTimeout(attempt, RETRY_DELAY + Math.random() * 100);
            } else {
                callback(err, result);
            }
        };
        
        originalMkdir.apply(this, [...argsWithoutCb, wrappedCallback]);
    };
    
    attempt();
};

// Patch readdir/readdirSync to retry on EPERM
const originalReaddir = fs.readdir;
const originalReaddirSync = fs.readdirSync;

fs.readdirSync = function(path, options) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
        try {
            return originalReaddirSync(path, options);
        } catch (err) {
            // Windows can keep file handles open under .next/types (TS server, antivirus, indexers),
                if (isDebugEnabled()) {
                    // eslint-disable-next-line no-console
                    console.log(`[Patch] Retrying mkdirSync on ${path} due to ${err.code}`);
                }
            // build artifact, treat it as empty rather than failing the build.
            if (isIgnorableNextTypesPath(path) && (err?.code === 'EPERM' || err?.code === 'EACCES')) {
                return [];
            }
            if (shouldRetry(err) && retries > 1) {
                retries--;
                sleep(RETRY_DELAY + Math.random() * 100);
                continue;
            }
            throw err;
        }
    }
};

fs.readdir = function(...args) {
    const callback = args[args.length - 1];
    
    if (typeof callback !== 'function') {
        return originalReaddir.apply(this, args);
    }

    const argsWithoutCb = args.slice(0, -1);
    let retries = MAX_RETRIES;
    
    const attempt = () => {
        const wrappedCallback = (err, files) => {
            if (err && isIgnorableNextTypesPath(argsWithoutCb[0]) && (err.code === 'EPERM' || err.code === 'EACCES')) {
                return callback(null, []);
            }
            if (shouldRetry(err) && retries > 0) {
                retries--;
                setTimeout(attempt, RETRY_DELAY + Math.random() * 100);
            } else {
                callback(err, files);
            }
        };
        
        originalReaddir.apply(this, [...argsWithoutCb, wrappedCallback]);
    };
    
    attempt();
};

// Patch rmdir/rmdirSync and rm/rmSync to tolerate locked `.next/types` on Windows.
// Next's build can attempt to remove this artifact directory between phases.
const originalRmdir = fs.rmdir;
const originalRmdirSync = fs.rmdirSync;

if (typeof originalRmdirSync === 'function') {
    fs.rmdirSync = function(p, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return originalRmdirSync(p, options);
            } catch (err) {
                if (isIgnorableNextTypesPath(p) && (err?.code === 'EPERM' || err?.code === 'EACCES' || err?.code === 'ENOTEMPTY')) {
                    return;
                }
                if (shouldRetry(err) && retries > 1) {
                    retries--;
                    sleep(RETRY_DELAY + Math.random() * 100);
                    continue;
                }
                throw err;
            }
        }
    };
}

if (typeof originalRmdir === 'function') {
    fs.rmdir = function(...args) {
        const callback = args[args.length - 1];

        if (typeof callback !== 'function') {
            return originalRmdir.apply(this, args);
        }

        const argsWithoutCb = args.slice(0, -1);
        const p = argsWithoutCb[0];
        let retries = MAX_RETRIES;

        const attempt = () => {
            const wrappedCallback = (err) => {
                if (err && isIgnorableNextTypesPath(p) && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOTEMPTY')) {
                    return callback(null);
                }

                if (shouldRetry(err) && retries > 0) {
                    retries--;
                    setTimeout(attempt, RETRY_DELAY + Math.random() * 100);
                } else {
                    callback(err);
                }
            };

            originalRmdir.apply(this, [...argsWithoutCb, wrappedCallback]);
        };

        attempt();
    };
}

const originalRm = fs.rm;
const originalRmSync = fs.rmSync;

if (typeof originalRmSync === 'function') {
    fs.rmSync = function(p, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return originalRmSync(p, options);
            } catch (err) {
                if (isIgnorableNextTypesPath(p) && (err?.code === 'EPERM' || err?.code === 'EACCES' || err?.code === 'ENOTEMPTY')) {
                    return;
                }
                if (shouldRetry(err) && retries > 1) {
                    retries--;
                    sleep(RETRY_DELAY + Math.random() * 100);
                    continue;
                }
                throw err;
            }
        }
    };
}

if (typeof originalRm === 'function') {
    fs.rm = function(...args) {
        const callback = args[args.length - 1];

        if (typeof callback !== 'function') {
            return originalRm.apply(this, args);
        }

        const argsWithoutCb = args.slice(0, -1);
        const p = argsWithoutCb[0];
        let retries = MAX_RETRIES;

        const attempt = () => {
            const wrappedCallback = (err) => {
                if (err && isIgnorableNextTypesPath(p) && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOTEMPTY')) {
                    return callback(null);
                }

                if (shouldRetry(err) && retries > 0) {
                    retries--;
                    setTimeout(attempt, RETRY_DELAY + Math.random() * 100);
                } else {
                    callback(err);
                }
            };

            originalRm.apply(this, [...argsWithoutCb, wrappedCallback]);
        };

        attempt();
    };
}

// Patch fs.promises
if (fs.promises) {
    const originalPromisesMkdir = fs.promises.mkdir;
    fs.promises.mkdir = async function(path, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return await originalPromisesMkdir.call(fs.promises, path, options);
            } catch (err) {
                if (shouldRetry(err) && retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY + Math.random() * 100));
                    continue;
                }
                throw err;
            }
        }
    };

    const originalPromisesReaddir = fs.promises.readdir;
    fs.promises.readdir = async function(path, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return await originalPromisesReaddir.call(fs.promises, path, options);
            } catch (err) {
                if (isIgnorableNextTypesPath(path) && (err?.code === 'EPERM' || err?.code === 'EACCES')) {
                    return [];
                }
                if (shouldRetry(err) && retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY + Math.random() * 100));
                    continue;
                }
                throw err;
            }
        }
    };

    const originalPromisesStat = fs.promises.stat;
    fs.promises.stat = async function(path, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return await originalPromisesStat.call(fs.promises, path, options);
            } catch (err) {
                if (shouldRetry(err) && retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY + Math.random() * 100));
                    continue;
                }
                throw err;
            }
        }
    };

    const originalPromisesLstat = fs.promises.lstat;
    fs.promises.lstat = async function(path, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return await originalPromisesLstat.call(fs.promises, path, options);
            } catch (err) {
                if (shouldRetry(err) && retries > 1) {
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY + Math.random() * 100));
                    continue;
                }
                throw err;
            }
        }
    };

    const originalPromisesRmdir = fs.promises.rmdir;
    if (typeof originalPromisesRmdir === 'function') {
        fs.promises.rmdir = async function(path, options) {
            let retries = MAX_RETRIES;
            while (retries > 0) {
                try {
                    return await originalPromisesRmdir.call(fs.promises, path, options);
                } catch (err) {
                    if (isIgnorableNextTypesPath(path) && (err?.code === 'EPERM' || err?.code === 'EACCES' || err?.code === 'ENOTEMPTY')) {
                        return;
                    }
                    if (shouldRetry(err) && retries > 1) {
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY + Math.random() * 100));
                        continue;
                    }
                    throw err;
                }
            }
        };
    }

    const originalPromisesRm = fs.promises.rm;
    if (typeof originalPromisesRm === 'function') {
        fs.promises.rm = async function(path, options) {
            let retries = MAX_RETRIES;
            while (retries > 0) {
                try {
                    return await originalPromisesRm.call(fs.promises, path, options);
                } catch (err) {
                    if (isIgnorableNextTypesPath(path) && (err?.code === 'EPERM' || err?.code === 'EACCES' || err?.code === 'ENOTEMPTY')) {
                        return;
                    }
                    if (shouldRetry(err) && retries > 1) {
                        retries--;
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY + Math.random() * 100));
                        continue;
                    }
                    throw err;
                }
            }
        };
    }
}

if (isDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log('Patched fs.readlink for EISDIR and added retries for UNKNOWN/EPERM errors');
}

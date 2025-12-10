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

function sleep(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {}
}

const MAX_RETRIES = 50;
const RETRY_DELAY = 200;

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

// Patch fs.promises
if (fs.promises) {
    const originalPromisesMkdir = fs.promises.mkdir;
    fs.promises.mkdir = async function(path, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return await originalPromisesMkdir(path, options);
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
                return await originalPromisesReaddir(path, options);
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

    const originalPromisesStat = fs.promises.stat;
    fs.promises.stat = async function(path, options) {
        let retries = MAX_RETRIES;
        while (retries > 0) {
            try {
                return await originalPromisesStat(path, options);
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
                return await originalPromisesLstat(path, options);
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
}

console.log('Patched fs.readlink for EISDIR and added retries for UNKNOWN/EPERM errors');

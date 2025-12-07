const fs = require('fs');
let gfs;
try { gfs = require('graceful-fs'); } catch (e) {}

function convertError(e, path) {
  if (e && e.code === 'EISDIR') {
    console.log('PATCHING EISDIR for ' + path);
    const err = new Error('EINVAL: invalid argument, readlink \'' + path + '\'');
    err.code = 'EINVAL';
    return err;
  }
  return e;
}

function patchModule(mod, name) {
  if (!mod) return;
  console.log('Patching ' + name);
  const originalReadlinkSync = mod.readlinkSync;
  const originalReadlink = mod.readlink;
  const originalRealpathSync = mod.realpathSync;
  const originalRealpath = mod.realpath;

  if (originalReadlinkSync) {
    mod.readlinkSync = function(path, options) {
      try {
        return originalReadlinkSync.call(mod, path, options);
      } catch (e) {
        throw convertError(e, path);
      }
    };
  }

  if (originalReadlink) {
    mod.readlink = function(path, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      originalReadlink.call(mod, path, options, (err, linkString) => {
        if (err) {
          return callback(convertError(err, path));
        }
        callback(null, linkString);
      });
    };
  }

  if (originalRealpathSync) {
    mod.realpathSync = function(path, options) {
      try {
        return originalRealpathSync.call(mod, path, options);
      } catch (e) {
        if (e.code === 'EISDIR') {
           console.log('PATCHING REALPATH EISDIR for ' + path);
           return path; // Return path as is
        }
        throw e;
      }
    };
  }

  if (originalRealpath) {
    mod.realpath = function(path, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      originalRealpath.call(mod, path, options, (err, resolvedPath) => {
        if (err && err.code === 'EISDIR') {
          console.log('PATCHING REALPATH EISDIR for ' + path);
          return callback(null, path);
        }
        callback(err, resolvedPath);
      });
    };
  }

  if (mod.promises) {
      const originalPromisesReadlink = mod.promises.readlink;
      if (originalPromisesReadlink) {
          mod.promises.readlink = async function(path, options) {
              try {
                  return await originalPromisesReadlink.call(mod.promises, path, options);
              } catch (e) {
                  throw convertError(e, path);
              }
          };
      }
  }
}

patchModule(fs, 'fs');
patchModule(gfs, 'graceful-fs');
console.log('FS/GFS Readlink/Realpath Patch Applied');

const fs = require('fs');
const path = require('path');

// Patch fs.readlink and fs.readlinkSync to handle EISDIR on Windows mapped drives
const originalReadlink = fs.readlink;
const originalReadlinkSync = fs.readlinkSync;
const originalPromisesReadlink = fs.promises.readlink;

fs.readlink = function(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
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

if (fs.promises && fs.promises.readlink) {
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

console.log('Patched fs.readlink for EISDIR');

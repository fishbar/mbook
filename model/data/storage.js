'use strict';

const fs = require('fs');
const log = require('../../lib/log');
const path = require('path');

const fileTypes = {
  md: ['.md', '.MD', '.readme', '.README']
};

class Storage {
  _sync() {
    this.resolvePath = null;
    this.isDirectory = null;
    this.data = null;
  }

  resolve(resolvePath) {
    this.resolvePath = path.resolve(resolvePath);
  }

  constructor(fileOrDirectory, defaultData) {
    this._sync();

    try {
      this.resolve(fileOrDirectory);
      let stats = fs.lstatSync(this.resolvePath);
      this.isDirectory = stats.isDirectory();
      if (this.isDirectory) {
        this.data = this.iterateDirectory(fileOrDirectory.split(path.sep).pop(), this.resolvePath);
      } else {
        this.data = JSON.parse(fs.readFileSync(this.resolvePath));
      }
    } catch (e) {
      if (defaultData && path.extname(fileOrDirectory)) {
        this.data = defaultData;
      }
      // log.error(e.stack);
    }
  }

  checkFileType(filename) {
    let extname = path.extname(filename);
    switch (true) {
      case fileTypes.md.indexOf(extname) > -1:
        return 'md';
      default:
        return '';
    }
  }

  pack(relativePath, isDirectory) {
    if (isDirectory) {
      return {
        name: relativePath,
        type: 1,
        objectType: null,
        children: []
      };
    } else {
      if (relativePath[0] !== '.') {
        return {
          name: relativePath,
          type: 2,
          objectType: this.checkFileType(relativePath)
        };
      }
    }
  }

  // see: http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
  iterateDirectory(fileOrDirectory, resolvePath) {
    let branch = this.pack(fileOrDirectory, true);
    fs.readdirSync(resolvePath).forEach(_fileOrDirectory => {
      let _path = path.join(resolvePath, _fileOrDirectory);
      let stats = fs.lstatSync(_path);
      if (stats.isDirectory()) {
        this.iterateDirectory(_fileOrDirectory, _path);
      } else {
        let item = this.pack(_fileOrDirectory);
        item && branch.children.push(item);
      }
    });
    return branch;
  }

  save(data) {
    log.info('save file or directory: ' + JSON.stringify(data));
    if (this.isDirectory) {
      fs.mkdirSync(data);
      let relativePath = data.split(path.sep).pop();
      this.data.children.push(this.pack(relativePath, true));
    } else {
      fs.writeFileSync(this.resolvePath, JSON.stringify(data, null, 2));
    }
  }

  getData() {
    return this.data;
  }
}

module.exports = Storage;

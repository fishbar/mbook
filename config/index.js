/*!
 * mbook: config/index.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2016-07-24 11:52:58
 * CopyRight 2016 (c) Fish And Other Contributors
 */
'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const userConfigPath = path.join(os.homedir(), '.mbook.json');

let defaultConfig = {
  debug: true,
  bookspace: {
    defaultRoot: path.join(os.homedir(), 'bookspace'),
    root: null,
    /**
     * 所有的book列表
     * @type {Object}
     */
    books: [],
    /**
     * 最近打开列表
     * @type {Object}
     */
    history: []
  },
  logs: {
    sys: {
      level: 'DEBUG'
    }
  }
};


let userConfig = {};
try {
  userConfig = require(userConfigPath);
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    fs.writeFileSync(userConfigPath, JSON.stringify(defaultConfig, null, 2));
  } else {
    console.error('loading app config failed', e.message); // eslint-disable-line
  }
}

let envConfig = {};
try {
  envConfig = require(path.join(__dirname, './config.js'));
} catch (e) {
  // do nothing
}

let config = {};
Object.defineProperties(config, {
  save: {
    value: function () {
      fs.writeFileSync(userConfigPath, JSON.stringify(config, null, 2));
    },
    writable: true
  },
  reload: {
    value: function () {
      delete require.cache[userConfigPath];
      let userConfig = require(userConfigPath);
      _.merge(config, userConfig);
    },
    writable: true
  }
});

config = _.merge(config, defaultConfig, envConfig, userConfig);

module.exports = config;

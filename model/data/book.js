'use strict';

const fsp = require('fs-promise');
const path = require('path');
const marked = require('marked');

const EventEmitter = require('events').EventEmitter;

/**
 * @class Book
 */
class Book extends EventEmitter {
  /**
   * [constructor description]
   * @param  {Object} option
   *         - root {String} book abs root
   */
  constructor(option) {
    super();
    this.root = option.root;
    this.menuFile = path.join(option.root, './SUMMARY.md');
  }
  * loadMenu() {
    let data = yield fsp.readFile(this.menuFile);
    let tokens = marked.lexer(data.toString());
    let res = this.parse(tokens);
    return res;
  }
  * loadFile(file) {
    let fpath = path.join(this.root, file);
    let data = yield fsp.readFile(fpath);
    return data.toString();
  }
  * saveFile(file, data) {
    let fpath = path.join(this.root, file);
    console.log('---', fpath);
    yield fsp.mkdirs(path.dirname(fpath));
    yield fsp.writeFile(fpath, data);
  }
  parse(tokens) {
    let stack = [];
    var root = {
      id: 'root',
      text: 'root'
    };
    let currentItem = root;
    let currentList;
    let self = this;
    let tmp;
    tokens.forEach(function (n) {
      switch (n.type) {
        case 'heading':
          break;
        case 'list_start':
          currentItem.children = [];
          currentList = currentItem.children;
          break;
        case 'list_item_start':
          stack.push(currentItem);
          currentItem = {};
          currentList.push(currentItem);
          break;
        case 'text':
          tmp = self.parseText(n.text);
          currentItem.text = tmp.name;
          currentItem.id = tmp.link;
          break;
        case 'list_item_end':
          currentItem = stack.pop();
          currentList = currentItem.children;
          break;
        case 'list_end':
          break;
      }
    });
    return root.children;
  }
  parseText(txt) {
    let len = txt.length;
    let i;
    for (i = 1; i < len; i++) {
      if (txt[i] === ']' && txt[i - 1] !== '\\') {
        break;
      }
    }
    let name = txt.substr(1, i - 1);
    let link = txt.substr(i + 2, len - i - 3);
    return {name: name, link: link};
  }
}

module.exports = Book;

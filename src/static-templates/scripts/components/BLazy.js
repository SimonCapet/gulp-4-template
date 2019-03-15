"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var BLazy = require("blazy");

var BLazyComponent =
/** @class */
function () {
  function BLazyComponent(context) {
    this.context = context;
    this.options = {
      selector: '[data-component="blazy"]',
      breakpoints: [{
        width: 420,
        src: 'data-src-small'
      }]
    };
    this.blazyObject = new BLazy(this.options);
  }

  return BLazyComponent;
}();

exports.default = BLazyComponent;
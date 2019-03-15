"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var prevent_scrolling_1 = require("prevent-scrolling");

var template = require('../../render-components/_Dialog.pug');

var BASE_CLASS = "Dialog";
var DISPLAY_CLASS = BASE_CLASS + "--display";
var OVERLAY_CLASS = BASE_CLASS + "--overlay";
var OPEN_CLASS = BASE_CLASS + "--open";
var ANIMATION_DURATION = 325;

var Dialog =
/** @class */
function () {
  function Dialog(context, renderClose) {
    if (renderClose === void 0) {
      renderClose = true;
    }

    var _this = this;

    this.context = document.createElement('div');
    this.context.className = BASE_CLASS;
    this.context.innerHTML = template({
      content: context.getAttribute('data-content'),
      renderClose: renderClose
    });
    document.body.appendChild(this.context);
    this.dialog = this.context.querySelector("." + BASE_CLASS + "__dialog");
    this.close = this.dialog.querySelector("." + BASE_CLASS + "__close");
    this.inner = this.dialog.querySelector("." + BASE_CLASS + "__inner");

    if (renderClose) {
      this.context.addEventListener('click', this.closeDialog.bind(this));
      this.close.addEventListener('click', this.closeDialog.bind(this));
    }

    var id = context.getAttribute('data-id');
    var triggers = [].slice.call(document.querySelectorAll("[data-dialog=\"" + id + "\"]"));
    triggers.forEach(function (trigger) {
      return trigger.addEventListener('click', _this.openDialog.bind(_this));
    });
  }

  Dialog.prototype.openDialog = function () {
    var _this = this;

    this.context.classList.add(DISPLAY_CLASS);
    prevent_scrolling_1.PreventScrolling(this.inner);
    setTimeout(function () {
      _this.context.classList.add(OVERLAY_CLASS);

      _this.dialog.setAttribute('open', 'true');

      setTimeout(function () {
        _this.context.classList.add(OPEN_CLASS);
      }, ANIMATION_DURATION);
    }, 10);
  };

  Dialog.prototype.closeDialog = function (event) {
    var _this = this;

    if (event.target === this.context || event.target === this.close) {
      this.context.classList.remove(OPEN_CLASS);
      setTimeout(function () {
        _this.context.classList.remove(OVERLAY_CLASS);

        _this.dialog.setAttribute('open', 'false');

        setTimeout(function () {
          _this.context.classList.remove(DISPLAY_CLASS);

          prevent_scrolling_1.ReEnableScrolling();
        }, ANIMATION_DURATION + 10);
      }, ANIMATION_DURATION);
    }
  };

  return Dialog;
}();

exports.default = Dialog;
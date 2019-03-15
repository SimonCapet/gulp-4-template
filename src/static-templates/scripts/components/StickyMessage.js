"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var viewport_details_1 = require("viewport-details");

var tick_manager_1 = require("tick-manager");

var StickyMessage =
/** @class */
function () {
  /**
   * StickyMessage constructor
   * @param context - The HTMLElement with [data-component='sticky-message']
   */
  function StickyMessage(context) {
    this.context = context;
    this.stickyMessage = context;
    this.siteWrapper = document.querySelector('.SiteWrapper');
    this.racHeader = document.querySelector('header:first-of-type'); // Binding functions to the next animation frame

    tick_manager_1.AddTick(this.tick.bind(this));
    this.updateSticky();
  }

  StickyMessage.prototype.tick = function () {
    var viewportDetails = viewport_details_1.GetViewportDetails();

    if (viewportDetails.resized) {
      this.updateSticky();
    }
  };
  /**
   * Updates the position top of the sticky message according to the height of the RAC header.
   * Updates the container of the sticky message with the appropriate padding-top.
   */


  StickyMessage.prototype.updateSticky = function () {
    this.stickyMessage.style.top = this.racHeader.clientHeight + "px";
    this.siteWrapper.style.paddingTop = this.stickyMessage.clientHeight + "px";
  };

  return StickyMessage;
}();

exports.default = StickyMessage;
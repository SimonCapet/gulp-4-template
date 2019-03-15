"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var viewport_details_1 = require("viewport-details");

var tick_manager_1 = require("tick-manager");

var CoverBundlesSticky =
/** @class */
function () {
  /**
   * CoverBundlesSticky constructor
   * @param context - The HTMLElement with [data-component='cover-bundles']
   */
  function CoverBundlesSticky(context) {
    this.context = context; // Initialising properties

    this.coverBundlesCTA = document.querySelector('.CoverBundles__cta .Btn');
    this.coverBundlesSticky = context;
    this.stickyVisibleClass = 'CoverBundles__sticky--visible';
    this.ctaHiddenClass = 'CoverBundles__Btn--hidden';
    this.DesktopWidth = 1024; // Binding functions to the next animation frame

    tick_manager_1.AddTick(this.tick.bind(this)); // Updating the sticky CTA on load

    this.updateSticky();
  }

  CoverBundlesSticky.prototype.tick = function () {
    var viewportDetails = viewport_details_1.GetViewportDetails();

    if (viewportDetails.resized || viewportDetails.scrolled) {
      this.updateSticky();
    }
  };
  /**
   * Shows/hides sticky CTA on mobile based on the window scrolling position
   */


  CoverBundlesSticky.prototype.updateSticky = function () {
    var viewportDetails = viewport_details_1.GetViewportDetails();
    this.coverBundlesCTAOffset = this.coverBundlesCTA.offsetTop;

    if (viewportDetails.width > this.DesktopWidth || window.pageYOffset <= this.coverBundlesCTAOffset) {
      this.hideSticky();
    } else {
      this.showSticky();
    }
  };

  CoverBundlesSticky.prototype.hideSticky = function () {
    this.coverBundlesCTA.classList.remove(this.ctaHiddenClass);
    this.coverBundlesSticky.classList.remove(this.stickyVisibleClass);
  };

  CoverBundlesSticky.prototype.showSticky = function () {
    this.coverBundlesCTA.classList.add(this.ctaHiddenClass);
    this.coverBundlesSticky.classList.add(this.stickyVisibleClass);
  };

  return CoverBundlesSticky;
}();

exports.default = CoverBundlesSticky;
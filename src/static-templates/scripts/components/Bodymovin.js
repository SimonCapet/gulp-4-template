"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var viewport_details_1 = require("viewport-details");

var tick_manager_1 = require("tick-manager");

var bodymovin = require('../../../../node_modules/bodymovin/build/player/bodymovin.min.js');

var MOBILE_MAX_WIDTH = 1023;

var BodymovinComponent =
/** @class */
function () {
  function BodymovinComponent(context) {
    this.context = context;
    this.viewport = viewport_details_1.GetViewportDetails();
    this.JSONUrlDesktop = context.dataset.jsonUrlDesktop;
    this.JSONUrlMobile = context.dataset.jsonUrlMobile;
    this.animationDiv = document.querySelector('.BMAnimation'); // Binding functions to the next animation frame

    tick_manager_1.AddTick(this.tick.bind(this)); // Initialiasing the desktopAnimationUsed that will be used in updateAnimation()

    if (this.viewport.width <= MOBILE_MAX_WIDTH) {
      this.desktopAnimationUsed = true;
    } else {
      this.desktopAnimationUsed = false;
    }

    this.updateAnimation();
  }

  BodymovinComponent.prototype.tick = function () {
    this.viewport = viewport_details_1.GetViewportDetails();

    if (this.viewport.resized) {
      this.updateAnimation();
    }
  };
  /**
   * Initialises the bodymovin plugin with the passed JSON object.
   * @param JSONObject:{} JSON that contains the bodymovin animation.
   */


  BodymovinComponent.prototype.loadAnimation = function (JSONObject) {
    this.animation = bodymovin.loadAnimation({
      container: this.animationDiv,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: JSONObject
    });
  };
  /**
   * Updates the JSON file that bodymovin uses when the viewport moves
   * from desktop to mobile and vice versa.
   */


  BodymovinComponent.prototype.updateAnimation = function () {
    if (this.viewport.width > MOBILE_MAX_WIDTH && !this.desktopAnimationUsed) {
      this.animationDiv.innerHTML = '';
      this.loadAnimation(this.JSONUrlDesktop);
      this.desktopAnimationUsed = true;
    }

    if (this.viewport.width <= MOBILE_MAX_WIDTH && this.desktopAnimationUsed) {
      this.animationDiv.innerHTML = '';
      this.loadAnimation(this.JSONUrlMobile);
      this.desktopAnimationUsed = false;
    }
  };

  return BodymovinComponent;
}();

exports.default = BodymovinComponent;
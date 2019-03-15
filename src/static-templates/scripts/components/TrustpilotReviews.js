"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var scroll_to_position_1 = require("scroll-to-position");

var TrustpilotReviews =
/** @class */
function () {
  function TrustpilotReviews(context) {
    this.context = context;
    this.currentIndex = 0;
    this.container = context.querySelector('.Trustpilot__reviews-container');
    this.children = Array.prototype.slice.call(context.querySelectorAll('.TrustpilotReview'));
    this.showMoreButton = context.querySelector('.Trustpilot__show-more');
    this.topMask = context.querySelector('.Trustpilot__reviews-mask-top');
    this.bottomMask = context.querySelector('.Trustpilot__reviews-mask-bottom');
    this.showMoreButton.addEventListener('click', this.showNext.bind(this));
  }

  TrustpilotReviews.prototype.showNext = function () {
    var _this = this;

    if (this.currentIndex + 1 === this.children.length) {
      return;
    }

    this.currentIndex += 1;
    scroll_to_position_1.ScrollTo(this.children[this.currentIndex], {
      offset: [0, -this.children[0].offsetTop],
      scrollContainer: this.container
    });

    if (this.isFinalCardInView()) {
      this.bottomMask.classList.add('Trustpilot__reviews-mask--complete');
      this.showMoreButton.classList.add('Trustpilot__show-more--complete');
    }

    setTimeout(function () {
      if (_this.isCardCutOffAtTop()) {
        _this.topMask.classList.remove('Trustpilot__reviews-mask--complete');
      } else {
        _this.topMask.classList.add('Trustpilot__reviews-mask--complete');
      }
    }, 100);
  };

  TrustpilotReviews.prototype.isFinalCardInView = function () {
    var finalCardRectangle = this.children[this.children.length - 1].getBoundingClientRect();
    var containerRectangle = this.container.getBoundingClientRect();
    return this.currentIndex + 1 >= this.children.length || finalCardRectangle.top <= containerRectangle.bottom;
  };

  TrustpilotReviews.prototype.isCardCutOffAtTop = function () {
    var containerRectangle = this.container.getBoundingClientRect();
    var cutOffCard = this.children.find(function (c) {
      var rectangle = c.getBoundingClientRect();
      return rectangle.top < containerRectangle.top && rectangle.bottom > containerRectangle.top;
    });
    return cutOffCard != null;
  };

  return TrustpilotReviews;
}();

exports.default = TrustpilotReviews;
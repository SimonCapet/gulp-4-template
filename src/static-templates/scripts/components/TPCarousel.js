"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var viewport_details_1 = require("viewport-details");

var tick_manager_1 = require("tick-manager");

var Siema = require('siema'); // Siema carousel options


var TPCarouselOptions = {
  duration: 300,
  easing: 'ease-out',
  startIndex: 0,
  draggable: true,
  threshold: 20,
  loop: false
};

var TPCarousel =
/** @class */
function () {
  function TPCarousel(context) {
    var _this = this;

    this.context = context;
    this.tpReviews = [].slice.call(document.querySelectorAll('.TPReview'));
    this.carouselOptions = __assign({
      selector: this.context,
      perPage: {
        769: 3
      },
      onChange: function () {
        // Swiping as many slides as the perPage property
        var swipeRemainder = _this.carouselObj.currentSlide % _this.carouselObj.perPage;

        if (swipeRemainder !== 0) {
          // On next slide swipe, go next() to as many slides as the remainder
          if (_this.previousActiveSlide < _this.carouselObj.currentSlide) {
            _this.carouselObj.next(swipeRemainder);
          } else {
            _this.carouselObj.prev(swipeRemainder);
          }
        } else {
          _this.updateNav();

          _this.previousActiveSlide = _this.carouselObj.currentSlide;
        }
      }
    }, TPCarouselOptions);
    this.prevArrow = document.querySelector('.TPCarousel__arrow--left');
    this.nextArrow = document.querySelector('.TPCarousel__arrow--right');
    this.dotNav = document.querySelector('.TPCarousel__dots');
    this.dotNavActiveClass = 'TPCarousel__dot--active'; // Adding event listeners

    this.prevArrow.addEventListener('click', function () {
      return _this.carouselObj.prev(_this.carouselObj.perPage, _this.updateNav.bind(_this));
    });
    this.nextArrow.addEventListener('click', function () {
      return _this.carouselObj.next(_this.carouselObj.perPage, _this.updateNav.bind(_this));
    }); // Initialiase the carousel only when there are 2+ carousel items

    if (this.tpReviews.length > 1) {
      this.carouselObj = new Siema(this.carouselOptions);
      this.previousActiveSlide = 0;
      tick_manager_1.AddTick(function () {
        var viewport = viewport_details_1.GetViewportDetails();

        if (viewport.resized || viewport.orientationChanged) {
          _this.carouselObj.goTo(0);

          _this.updateNav();

          _this.updateSlides();
        }
      });
      this.updateNav();
      this.updateSlides();
    }

    document.body.addEventListener('touchstart', function (e) {}); // fix for preventscrolling messing with events
  }
  /**
   * Pagination functionality
   * @param e: Event
   */


  TPCarousel.prototype.goTo = function (e) {
    e.preventDefault();
    var elem = e.target;
    var goToPage = parseInt(elem.getAttribute('data-goto'), 10);
    this.carouselObj.goTo(goToPage);
  };
  /**
   * Adds custom classes to the carousel track and slides.
   * Currently relying on HTML structure as Siema doesn't provide
   * configuration options for this.
   */


  TPCarousel.prototype.updateSlides = function () {
    this.carouselWrapper = this.context.querySelector('div:first-of-type');
    this.carouselSlides = [].slice.call(this.carouselWrapper.querySelectorAll(':scope > div'));
    this.carouselWrapper.classList.add('TPCarousel__track');
    this.carouselSlides.forEach(function (carouselSlide) {
      return carouselSlide.classList.add('TPCarousel__slide');
    });
  };

  TPCarousel.prototype.updateNav = function () {
    this.updateArrows();
    this.updateDots();
  };

  TPCarousel.prototype.updateDots = function () {
    var _this = this;

    var numberOfDots = this.tpReviews.length / this.carouselObj.perPage;
    var dotsHTML = '';

    for (var i = 0; i < numberOfDots; i++) {
      dotsHTML += "<button class=\"TPCarousel__dot\" data-goto=\"" + i * this.carouselObj.perPage + "\" type=\"button\"></button>";
    }

    this.dotNav.innerHTML = dotsHTML;
    this.dotNavItems = [].slice.call(document.querySelectorAll('.TPCarousel__dot'));
    this.dotNavItems.forEach(function (dotNavItem) {
      return dotNavItem.addEventListener('click', _this.goTo.bind(_this));
    });
    this.dotNavItems.forEach(function (dotNavItem) {
      return dotNavItem.classList.remove(_this.dotNavActiveClass);
    });
    this.dotNavItems[Math.abs(this.carouselObj.currentSlide / this.carouselObj.perPage)].classList.add(this.dotNavActiveClass);
  };

  TPCarousel.prototype.updateArrows = function () {
    this.prevArrow.removeAttribute('disabled');
    this.nextArrow.removeAttribute('disabled');

    switch (Math.abs(this.carouselObj.currentSlide)) {
      case 0:
        this.prevArrow.disabled = true;
        break;

      case this.tpReviews.length - this.carouselObj.perPage:
        this.nextArrow.disabled = true;
        break;
    }
  };

  return TPCarousel;
}();

exports.default = TPCarousel;
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

var Siema = require('siema');

var DESKTOP_WIDTH = 1024; // Siema carousel options

var coverBundlesCarouselOptions = {
  duration: 300,
  easing: 'ease-out',
  startIndex: 0,
  draggable: true,
  threshold: 20,
  loop: false
};

var CoverBundlesCarousel =
/** @class */
function () {
  function CoverBundlesCarousel(context) {
    var _this = this;

    this.context = context; // Initializing object properties

    this.coverBundles = [].slice.call(document.querySelectorAll('.CoverBundle'));
    this.carouselOptions = __assign({
      selector: this.context.querySelector('.CoverBundles__items'),
      onChange: function () {
        _this.printActiveSlide();

        _this.updateNav();
      }
    }, coverBundlesCarouselOptions);
    this.prevArrow = document.querySelector('.CoverBundles__prev');
    this.nextArrow = document.querySelector('.CoverBundles__next');
    this.dotNav = [].slice.call(document.querySelectorAll('.CoverBundles__dot'));
    this.dotNavActiveClass = 'CoverBundles__dot--active'; // Adding event listeners

    this.prevArrow.addEventListener('click', function () {
      return _this.carouselObj.prev(1, _this.updateNav.bind(_this));
    });
    this.nextArrow.addEventListener('click', function () {
      return _this.carouselObj.next(1, _this.updateNav.bind(_this));
    });
    this.dotNav.forEach(function (dotNavItem) {
      return dotNavItem.addEventListener('click', _this.goTo.bind(_this));
    });
    tick_manager_1.AddTick(function () {
      var viewport = viewport_details_1.GetViewportDetails();

      if (viewport.resized) {
        _this.init();
      }
    });
    this.init();
    document.body.addEventListener('touchstart', function (e) {}); // fix for preventscrolling messing with events
  }
  /**
   * Initializes or destroys the carousel based on the viewport width.
   */


  CoverBundlesCarousel.prototype.init = function () {
    var viewport = viewport_details_1.GetViewportDetails();

    if (this.coverBundles.length <= 1 && !this.carouselInitialised) {
      this.context.classList.add('CoverBundles__carousel--one');
      this.carouselInitialised = true;
    } else if (viewport.width < DESKTOP_WIDTH && !this.carouselInitialised) {
      this.carouselObj = new Siema(this.carouselOptions);
      this.printActiveSlide();
      this.updateNav();
      this.carouselInitialised = true;
      this.context.classList.add('CoverBundles__carousel--initialised');
    } else if (viewport.width >= DESKTOP_WIDTH && this.carouselInitialised) {
      this.carouselObj.destroy(true);
      this.carouselInitialised = false;
    } else if (viewport.width >= DESKTOP_WIDTH && !this.carouselInitialised) {
      this.context.classList.add('CoverBundles__carousel--initialised');
    }
  };
  /**
   * Prints an active class on the current carousel slide.
   */


  CoverBundlesCarousel.prototype.printActiveSlide = function () {
    var _this = this;

    this.coverBundles.forEach(function (slide, i) {
      i === _this.carouselObj.currentSlide ? _this.coverBundles[i].classList.add('CoverBundle--active') : _this.coverBundles[i].classList.remove('CoverBundle--active');
    });
  };
  /**
   * Pagination functionality
   * @param e: Event
   */


  CoverBundlesCarousel.prototype.goTo = function (e) {
    e.preventDefault();
    var elem = e.target;
    var goToPage = parseInt(elem.getAttribute('data-goto'), 10);
    this.carouselObj.goTo(goToPage);
  };

  CoverBundlesCarousel.prototype.updateNav = function () {
    this.updateArrows();
    this.updateDots();
  };

  CoverBundlesCarousel.prototype.updateDots = function () {
    var _this = this;

    this.dotNav.forEach(function (dotNavItem) {
      return dotNavItem.classList.remove(_this.dotNavActiveClass);
    });
    this.dotNav[this.carouselObj.currentSlide].classList.add(this.dotNavActiveClass);
  };

  CoverBundlesCarousel.prototype.updateArrows = function () {
    this.prevArrow.removeAttribute('disabled');
    this.nextArrow.removeAttribute('disabled');

    switch (this.carouselObj.currentSlide) {
      case 0:
        this.prevArrow.disabled = true;
        break;

      case this.coverBundles.length - 1:
        this.nextArrow.disabled = true;
        break;
    }
  };

  return CoverBundlesCarousel;
}();

exports.default = CoverBundlesCarousel;
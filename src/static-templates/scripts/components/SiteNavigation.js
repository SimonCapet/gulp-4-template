"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var prevent_scrolling_1 = require("prevent-scrolling");

var scroll_to_position_1 = require("scroll-to-position");

var utils_1 = require("../../../scripts/utils");

var SiteNavigation =
/** @class */
function () {
  function SiteNavigation(elem) {
    this.header = document.querySelector('.SiteHeader');
    this.mobileTrigger = document.querySelector('.SiteNavigation__toggle');
    this.navigation = this.header.querySelector('.SiteNavigation');
    this.listItems = [].slice.call(this.navigation.querySelectorAll('.SiteNavigation__item'));
    this.subLevelTriggers = [].slice.call(this.navigation.querySelectorAll('.SiteNavigation__sub-level-toggle'));
    this.siteWrapper = document.querySelector('.SiteWrapper');
    this.openClassName = 'SiteNavigation__item--open';
    this.mobileNavBreakpoint = 768;
    this.init();
  }

  SiteNavigation.prototype.init = function () {
    var _this = this;

    window.addEventListener('resize', function () {
      var previousViewportWidth = _this.viewportWidth;

      var openSubLevel = _this.navigation.querySelector("." + _this.openClassName);

      _this.setViewportWidth();

      if (previousViewportWidth < _this.mobileNavBreakpoint && _this.viewportWidth >= _this.mobileNavBreakpoint && _this.navigation.classList.contains('SiteNavigation--open')) {
        _this.closeNavigation();
      }

      if (openSubLevel) {
        var subWrapper = openSubLevel.querySelector('.SiteNavigation__sub-wrapper');
        document.querySelector("." + _this.openClassName).classList.remove(_this.openClassName);
        subWrapper.style.height = '';
      }
    });
    this.setViewportWidth();
    this.mobileTrigger.addEventListener('click', this.toggleNavigation.bind(this));
    this.listItems.forEach(function (listItem) {
      listItem.addEventListener('mouseover', _this.openSubLevel.bind(_this));
      listItem.addEventListener('touchstart', _this.cancelNavigationIfNotOpen.bind(_this));
      listItem.addEventListener('mouseout', _this.closeSubLevel.bind(_this));
    });
    this.subLevelTriggers.forEach(function (trigger) {
      return trigger.addEventListener('click', _this.toggleSubLevel.bind(_this));
    });
  };

  SiteNavigation.prototype.toggleNavigation = function () {
    this.mobileTrigger.classList.contains('SiteNavigation__toggle--open') ? this.closeNavigation() : this.openNavigation();
  };

  SiteNavigation.prototype.openNavigation = function () {
    this.mobileTrigger.classList.add('SiteNavigation__toggle--open');
    this.navigation.classList.add('SiteNavigation--open');
    this.siteWrapper.classList.add('SiteWrapper--navigation-open');
    prevent_scrolling_1.PreventScrolling(this.navigation);
  };

  SiteNavigation.prototype.closeNavigation = function () {
    this.mobileTrigger.classList.remove('SiteNavigation__toggle--open');
    this.navigation.classList.remove('SiteNavigation--open');
    this.siteWrapper.classList.remove('SiteWrapper--navigation-open');
    prevent_scrolling_1.ReEnableScrolling();
  };

  SiteNavigation.prototype.toggleSubLevel = function (event) {
    event.stopPropagation();
    var listItem = event.target.parentElement;
    listItem.classList.contains(this.openClassName) ? this.closeSubLevel(event) : this.openSubLevel(event);
  };

  SiteNavigation.prototype.openSubLevel = function (event) {
    var _this = this;

    var listItem = event.target.closest('.SiteNavigation__item');
    var siblings = utils_1.getAllSiblings(listItem, false);
    var subWrapper = listItem.querySelector('.SiteNavigation__sub-wrapper');
    var subWrapperInner = subWrapper.querySelector('.SiteNavigation__sub-wrapper-inner');

    if (this.viewportWidth >= this.mobileNavBreakpoint) {
      siblings.forEach(function (sibling) {
        return sibling.classList.remove(_this.openClassName);
      });
      listItem.classList.add(this.openClassName);
    } else if (this.viewportWidth < this.mobileNavBreakpoint && event.type !== 'mouseover') {
      siblings.forEach(function (sibling) {
        sibling.classList.remove(_this.openClassName);
        var siblingSubWrapper = sibling.querySelector('.SiteNavigation__sub-wrapper');

        if (siblingSubWrapper) {
          siblingSubWrapper.style.height = '';
        }
      });
      listItem.classList.add(this.openClassName);
      subWrapper.style.height = subWrapperInner.offsetHeight + "px";
      setTimeout(function () {
        return scroll_to_position_1.ScrollTo(listItem, {
          scrollContainer: _this.navigation
        });
      }, 250);
    }
  };

  SiteNavigation.prototype.closeSubLevel = function (event) {
    var listItem = document.querySelector("." + this.openClassName);
    var mouseEvent = event;
    var targetElement = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);

    if (listItem && targetElement && (!targetElement.closest("." + this.openClassName) || targetElement.classList.contains('SiteNavigation__link') || targetElement.classList.contains('SiteNavigation__sub-level-toggle'))) {
      var subWrapper = listItem.querySelector('.SiteNavigation__sub-wrapper');

      if (this.viewportWidth >= this.mobileNavBreakpoint) {
        document.querySelector("." + this.openClassName).classList.remove(this.openClassName);
      } else if (this.viewportWidth < this.mobileNavBreakpoint && event.type !== 'mouseout') {
        document.querySelector("." + this.openClassName).classList.remove(this.openClassName);
        subWrapper.style.height = '0';
      }
    }
  };

  SiteNavigation.prototype.cancelNavigationIfNotOpen = function () {
    if (!event.target.closest('.SiteNavigation__item').classList.contains(this.openClassName)) {
      event.preventDefault();
      this.openSubLevel(event);
    }
  };

  SiteNavigation.prototype.setViewportWidth = function () {
    this.viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  };

  return SiteNavigation;
}();

exports.default = SiteNavigation;
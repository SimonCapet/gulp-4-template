"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var SiteRibbon =
/** @class */
function () {
  function SiteRibbon(elem) {
    this.header = document.querySelector('.SiteHeader');
    this.scrolledClass = 'SiteHeader--scrolled';
    this.init();
  }

  SiteRibbon.prototype.init = function () {
    window.addEventListener('scroll', this.toggleRibbon.bind(this));
  };

  SiteRibbon.prototype.toggleRibbon = function () {
    var scrollPosition = window.scrollY ? window.scrollY : window.pageYOffset;

    if (scrollPosition > 0) {
      this.hideRibbon();
    } else {
      this.showRibbon();
    }
  };

  SiteRibbon.prototype.showRibbon = function () {
    this.header.classList.remove(this.scrolledClass);
  };

  SiteRibbon.prototype.hideRibbon = function () {
    this.header.classList.add(this.scrolledClass);
  };

  return SiteRibbon;
}();

exports.default = SiteRibbon;
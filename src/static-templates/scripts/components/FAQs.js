"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var scroll_to_position_1 = require("scroll-to-position"); // import { getAllSiblings } from 'scripts/utils'; !This import was not being used in front-end!


var FAQs =
/** @class */
function () {
  function FAQs(elem) {
    this.faqs = [].slice.call(document.querySelectorAll('.FAQ'));
    this.faqQuestions = [].slice.call(document.querySelectorAll('.FAQ__question'));
    this.faqWrapper = document.querySelector('.FAQ__wrapper');
    this.openClass = 'FAQ--open';
    this.init();
  }

  FAQs.prototype.init = function () {
    var _this = this;

    window.addEventListener('resize', this.setViewportWidth.bind(this));
    this.setViewportWidth();
    this.faqQuestions.forEach(function (faqQuestion) {
      return faqQuestion.addEventListener('click', _this.toggleFAQ.bind(_this));
    });
  };

  FAQs.prototype.toggleFAQ = function (event) {
    var question = event.target;
    var faq = question.closest('.FAQ');

    if (faq.classList.contains(this.openClass)) {
      this.closeFAQ(faq);
    } else {
      this.openFAQ(faq);
    }
  };

  FAQs.prototype.openFAQ = function (faq) {
    var _this = this;

    var answer = faq.querySelector('.FAQ__answer');
    var answerInner = answer.querySelector('.FAQ__answer-inner');
    var currentlyOpenFaq = document.querySelector('.FAQ--open');

    if (currentlyOpenFaq) {
      this.closeFAQ(currentlyOpenFaq);
    }

    if (this.viewportWidth < 768) {
      setTimeout(function () {
        return scroll_to_position_1.ScrollTo([0, _this.getTopOffset(faq) - 80]);
      }, 500);
    }

    faq.classList.add(this.openClass);
    answer.style.height = answerInner.offsetHeight + "px";
  };

  FAQs.prototype.closeFAQ = function (faq) {
    var answer = faq.querySelector('.FAQ__answer');
    faq.classList.remove(this.openClass);
    answer.style.height = '0';
  };

  FAQs.prototype.setViewportWidth = function () {
    this.viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  };

  FAQs.prototype.getTopOffset = function (elem) {
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var top = box.top + scrollTop - clientTop;
    return Math.round(top);
  };

  return FAQs;
}();

exports.default = FAQs;
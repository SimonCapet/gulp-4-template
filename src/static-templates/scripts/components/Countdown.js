"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var MILLISECONDS_IN_DAY = 86400000;
var MILLISECONDS_IN_HOUR = 3600000;
var MILLISECONDS_IN_MINUTE = 60000;
var MILLISECONDS_IN_SECOND = 1000;

var Countdown =
/** @class */
function () {
  function Countdown(context) {
    this.context = context;
    var dateArg = context.getAttribute('data-date').split(' ');
    var dateParts = dateArg[0].split('/');
    var timeParts = dateArg[1].split(':');
    this.endDate = new Date(parseInt(dateParts[2], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10), parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), parseInt(timeParts[2], 10));
    this.numbers = [].slice.call(document.querySelectorAll('.Countdown__numbers')).map(function (elem) {
      return new CountdownNumber(elem);
    });
    this.setTime();
  }

  Countdown.prototype.setTime = function () {
    var _this = this;

    var timeRemaining = this.endDate.getTime() - new Date().getTime();
    var days = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_DAY), 0);
    timeRemaining -= days * MILLISECONDS_IN_DAY;
    var hours = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_HOUR), 0);
    timeRemaining -= hours * MILLISECONDS_IN_HOUR;
    var minutes = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_MINUTE), 0);
    timeRemaining -= minutes * MILLISECONDS_IN_MINUTE;
    var seconds = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_SECOND), 0);
    var remainingString = "" + this.padNumber(days) + this.padNumber(hours) + this.padNumber(minutes) + this.padNumber(seconds);
    remainingString.split('').forEach(function (number, index) {
      return _this.numbers[index].SetNumber(parseInt(number, 10));
    });

    if (days > 0 || hours > 0 || minutes > 0 || seconds > 0) {
      setTimeout(this.setTime.bind(this), 1000);
    }
  };

  Countdown.prototype.padNumber = function (number) {
    return number.toString().padStart(2, '0');
  };

  return Countdown;
}();

exports.default = Countdown;

var CountdownNumber =
/** @class */
function () {
  function CountdownNumber(context) {
    this.context = context;
    this.currentNumber = 0;
    this.playing = false;
    this.numbers = [].slice.call(context.querySelectorAll('.CountdownNumber'));
    this.numbersLength = this.numbers.length;
  }

  CountdownNumber.prototype.SetNumber = function (number) {
    var _this = this;

    if (number !== this.currentNumber) {
      this.currentNumber = number;
      this.numbers.forEach(function (elem, index) {
        if (index === number) {
          elem.classList.add('CountdownNumber--active');
        } else {
          elem.classList.remove('CountdownNumber--active');
        }

        if (index === number + 1 || number === _this.numbersLength - 1 && index === 0) {
          elem.classList.add('CountdownNumber--before');
        } else {
          elem.classList.remove('CountdownNumber--before');
        }

        if (_this.playing) {
          elem.classList.remove('CountdownNumber--inactive');
        }
      });
      this.playing = true;
    }
  };

  return CountdownNumber;
}();
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Offer =
/** @class */
function () {
  function Offer(context) {
    this.context = context;
    this.journeys = [];
    this.findJourneys();
  }

  Offer.prototype.findJourneys = function () {// const rows = [].slice.call(this.context.querySelectorAll('.Offer__row'));
    // // const journeys = <[HTMLElement[]]>[];
    //
    // rows.forEach(row => {
    // 	const cells = [].slice.call(row.getElementsByTagName('TD'));
    //
    // 	cells.forEach((cell: HTMLElement, index: number) => {
    // 		let journey: HTMLElement[] = journeys[index];
    //
    // 		if (!journey) {
    // 			journey = [];
    //
    // 			journeys.push(journey);
    // 		}
    //
    // 		if (cell.className) {
    // 			journey.push(cell);
    // 		}
    // 	});
    // });
    // this.journeys = journeys.map(cells => new Journey(cells, this.deHighlightAll.bind(this), this.highlightDefault.bind(this)));
  };

  Offer.prototype.deHighlightAll = function () {
    this.journeys.forEach(function (journey) {
      return journey.SetHighlighted(false);
    });
  };

  Offer.prototype.highlightDefault = function () {
    var defaultHighlighted = this.journeys.find(function (journey) {
      return journey.DefaultHighlighted;
    });

    if (defaultHighlighted) {
      defaultHighlighted.SetHighlighted(true);
    }
  };

  return Offer;
}();

exports.default = Offer;

var Journey =
/** @class */
function () {
  function Journey(cells, deHighlightAll, highlightDefault) {
    this.cells = cells;
    this.deHighlightAll = deHighlightAll;
    this.highlightDefault = highlightDefault;
    this.didTouch = false;
    this.setDefaultHighlighted();
    this.addEventListeners();
  }

  Journey.prototype.SetHighlighted = function (highlighted) {
    this.cells.forEach(function (cell) {
      var highlightedClass = cell.className.includes('OfferSaving') ? 'OfferSaving--highlighted' : 'Offer__cell--highlighted';

      if (highlighted) {
        cell.classList.add(highlightedClass);
      } else {
        cell.classList.remove(highlightedClass);
      }
    });
  };

  Journey.prototype.setDefaultHighlighted = function () {
    this.DefaultHighlighted = !!this.cells.find(function (cell) {
      return cell.className.includes('--highlighted');
    });
  };

  Journey.prototype.addEventListeners = function () {
    var _this = this;

    this.cells.forEach(function (cell) {
      cell.addEventListener('touchstart', _this.handleTouchStart.bind(_this));
      cell.addEventListener('mouseover', _this.handleMouseOver.bind(_this));
      cell.addEventListener('mouseout', _this.handleMouseOut.bind(_this));
    });
  };

  Journey.prototype.handleTouchStart = function () {
    var _this = this;

    this.didTouch = true;
    setTimeout(function () {
      _this.didTouch = false;
    }, 200);
  };

  Journey.prototype.handleMouseOver = function (event) {
    if (!this.didTouch) {
      this.deHighlightAll();
      this.SetHighlighted(true);
    }
  };

  Journey.prototype.handleMouseOut = function () {
    this.SetHighlighted(false);
    this.highlightDefault();
  };

  return Journey;
}();
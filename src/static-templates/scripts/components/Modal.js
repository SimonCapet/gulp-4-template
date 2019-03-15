"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var viewport_details_1 = require("viewport-details");

var prevent_scrolling_1 = require("prevent-scrolling");

var CONFIG = {
  BACKDROP_TRANSITION_DURATION: 200
};

var Modal =
/** @class */
function () {
  function Modal(modal) {
    this.modal = modal;
    this.modalOpen = false;
    this.id = this.modal.getAttribute('data-modal');
    this.modalBackdrop.appendChild(modal);
    this.triggers = [].slice.call(document.querySelectorAll(".Modal__trigger[data-modal='" + this.id + "']"));
    this.closeButton = this.modal.querySelector('.Modal__cross');
    this.scrollableArea = this.modal.querySelector('.Modal__inner');
    this.init();
  }

  Object.defineProperty(Modal.prototype, "modalBackdrop", {
    get: function () {
      if (!this._modalBackdrop) {
        this._modalBackdrop = document.querySelector('.Modals');
      }

      if (!this._modalBackdrop) {
        this._modalBackdrop = document.createElement('div');
        this._modalBackdrop.className = 'Modals Modals--hidden';
        document.body.appendChild(this._modalBackdrop);
      }

      return this._modalBackdrop;
    },
    enumerable: true,
    configurable: true
  });

  Modal.prototype.init = function () {
    var _this = this;

    this.modalBackdrop.addEventListener('click', this.closeModal.bind(this));
    this.modal.addEventListener('click', function (event) {
      return event.stopPropagation();
    });
    this.triggers.forEach(function (trigger) {
      return trigger.addEventListener('click', _this.openModal.bind(_this));
    });
    this.closeButton.addEventListener('click', this.closeModal.bind(this));
    window.addEventListener('keyup', function (event) {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        _this.closeModal();
      }
    }, true);
  };

  Modal.prototype.openModal = function () {
    var _this = this;

    this.showBackdrop().then(function () {
      _this.modal.setAttribute('open', '');

      setTimeout(function () {
        return _this.modal.classList.add('Modal--open');
      }, 10);
    });
  };

  Modal.prototype.showBackdrop = function () {
    var _this = this;

    return new Promise(function (resolve) {
      if (_this.modalBackdrop.classList.contains('Modals--hidden')) {
        _this.modalOpen = true;
        prevent_scrolling_1.PreventScrolling(_this.scrollableArea);
        _this.scrollableArea.scrollTop = 0;

        _this.scrollableArea.focus();

        _this.setHeight(true);

        _this.modalBackdrop.classList.remove('Modals--hidden');

        _this.modalBackdrop.classList.remove('Modals--closing');

        setTimeout(function () {
          _this.modalBackdrop.classList.add('Modals--visible');

          setTimeout(resolve, CONFIG.BACKDROP_TRANSITION_DURATION);
        }, 10);
      } else {
        resolve();
      }
    });
  };

  Modal.prototype.closeModal = function () {
    var _this = this;

    this.modalBackdrop.classList.remove('Modals--visible');
    this.modalBackdrop.classList.add('Modals--closing');
    setTimeout(function () {
      _this.modalOpen = false;

      _this.modalBackdrop.classList.add('Modals--hidden');

      _this.modal.classList.remove('Modal--open');

      _this.modal.removeAttribute('open');

      prevent_scrolling_1.ReEnableScrolling();
    }, CONFIG.BACKDROP_TRANSITION_DURATION);
  };

  Modal.prototype.setHeight = function (firstRun) {
    if (this.modalOpen) {
      var viewport = viewport_details_1.GetViewportDetails();

      if (firstRun || viewport.resized) {
        var height = viewport.height;
        this.modalBackdrop.style.height = height + "px";
      }

      requestAnimationFrame(this.setHeight.bind(this));
    }
  };

  return Modal;
}();

exports.default = Modal;
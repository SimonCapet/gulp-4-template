if ((<any>window).Element && !Element.prototype.remove) {
	Element.prototype.remove = function remove() {
		if (this.parentNode) {
			this.parentNode.removeChild(this);
		}
	};
}

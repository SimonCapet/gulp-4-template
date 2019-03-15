export default class Offer {
	private journeys: Journey[] = [];

	constructor(private context: HTMLElement) {
		this.findJourneys();
	}

	private findJourneys(): void {
		// const rows = [].slice.call(this.context.querySelectorAll('.Offer__row'));
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
	}

	private deHighlightAll(): void {
		this.journeys.forEach(journey => journey.SetHighlighted(false));
	}

	private highlightDefault(): void {
		const defaultHighlighted = this.journeys.find(journey => journey.DefaultHighlighted);

		if (defaultHighlighted) {
			defaultHighlighted.SetHighlighted(true);
		}
	}
}

class Journey {
	public DefaultHighlighted: boolean;
	private didTouch = false;

	constructor(private cells: HTMLElement[], private deHighlightAll: Function, private highlightDefault: Function) {
		this.setDefaultHighlighted();
		this.addEventListeners();
	}

	public SetHighlighted(highlighted: boolean): void {
		this.cells.forEach(cell => {
			const highlightedClass = cell.className.includes('OfferSaving') ? 'OfferSaving--highlighted' : 'Offer__cell--highlighted';

			if (highlighted) {
				cell.classList.add(highlightedClass);
			} else {
				cell.classList.remove(highlightedClass);
			}
		});
	}

	private setDefaultHighlighted(): void {
		this.DefaultHighlighted = !!this.cells.find(cell => cell.className.includes('--highlighted'));
	}

	private addEventListeners(): void {
		this.cells.forEach(cell => {
			cell.addEventListener('touchstart', this.handleTouchStart.bind(this));
			cell.addEventListener('mouseover', this.handleMouseOver.bind(this));
			cell.addEventListener('mouseout', this.handleMouseOut.bind(this));
		});
	}

	private handleTouchStart(): void {
		this.didTouch = true;

		setTimeout(() => {
			this.didTouch = false;
		}, 200);
	}

	private handleMouseOver(event: MouseEvent) {
		if (!this.didTouch) {
			this.deHighlightAll();
			this.SetHighlighted(true);
		}
	}

	private handleMouseOut(): void {
		this.SetHighlighted(false);
		this.highlightDefault();
	}
}

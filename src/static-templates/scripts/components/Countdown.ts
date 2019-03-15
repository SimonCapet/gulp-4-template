const MILLISECONDS_IN_DAY = 86400000;
const MILLISECONDS_IN_HOUR = 3600000;
const MILLISECONDS_IN_MINUTE = 60000;
const MILLISECONDS_IN_SECOND = 1000;

export default class Countdown {
	private endDate: Date;
	private numbers: CountdownNumber[];

	constructor(private context: HTMLElement) {
		const dateArg = context.getAttribute('data-date').split(' ');
		const dateParts = dateArg[0].split('/');
		const timeParts = dateArg[1].split(':');

		this.endDate = new Date(
			parseInt(dateParts[2], 10),
			parseInt(dateParts[1], 10) - 1,
			parseInt(dateParts[0], 10),
			parseInt(timeParts[0], 10),
			parseInt(timeParts[1], 10),
			parseInt(timeParts[2], 10)
		);

		this.numbers = [].slice.call(document.querySelectorAll('.Countdown__numbers')).map(elem => new CountdownNumber(elem));

		this.setTime();
	}

	private setTime(): void {
		let timeRemaining = this.endDate.getTime() - new Date().getTime();

		const days = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_DAY), 0);
		timeRemaining -= days * MILLISECONDS_IN_DAY;

		const hours = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_HOUR), 0);
		timeRemaining -= hours * MILLISECONDS_IN_HOUR;

		const minutes = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_MINUTE), 0);
		timeRemaining -= minutes * MILLISECONDS_IN_MINUTE;

		const seconds = Math.max(Math.floor(timeRemaining / MILLISECONDS_IN_SECOND), 0);

		const remainingString = `${this.padNumber(days)}${this.padNumber(hours)}${this.padNumber(minutes)}${this.padNumber(seconds)}`;

		remainingString.split('').forEach((number, index) => this.numbers[index].SetNumber(parseInt(number, 10)));

		if (days > 0 || hours > 0 || minutes > 0 || seconds > 0) {
			setTimeout(this.setTime.bind(this), 1000);
		}
	}

	private padNumber(number: number): string {
		return number.toString().padStart(2, '0');
	}
}

class CountdownNumber {
	private numbers: HTMLElement[];
	private numbersLength: number;
	private currentNumber = 0;
	private playing = false;

	constructor(private context: HTMLElement) {
		this.numbers = [].slice.call(context.querySelectorAll('.CountdownNumber'));
		this.numbersLength = this.numbers.length;
	}

	public SetNumber(number: number): void {
		if (number !== this.currentNumber) {
			this.currentNumber = number;

			this.numbers.forEach((elem, index) => {
				if (index === number) {
					elem.classList.add('CountdownNumber--active');
				} else {
					elem.classList.remove('CountdownNumber--active');
				}

				if (index === number + 1 || (number === this.numbersLength - 1 && index === 0)) {
					elem.classList.add('CountdownNumber--before');
				} else {
					elem.classList.remove('CountdownNumber--before');
				}

				if (this.playing) {
					elem.classList.remove('CountdownNumber--inactive');
				}
			});

			this.playing = true;
		}
	}
}

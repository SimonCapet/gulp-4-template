export enum EYesNoType {
	Yes = 'Y',
	No = 'N',
}

export namespace EYesNoType {
	export function fromYesNoString(yesNoString: 'Yes' | 'No') {
		return yesNoString === 'Yes' ? EYesNoType.Yes : EYesNoType.No;
	}

	export function invert(input: EYesNoType) {
		return input === EYesNoType.Yes ? EYesNoType.No : EYesNoType.Yes;
	}
}

export interface IDialog {
	id: string;
	content?: string;
	component?: any;
	componentInputs?: any;
	open: boolean;
	hideCloseButton?: boolean;
}

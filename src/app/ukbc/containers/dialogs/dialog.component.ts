import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	OnDestroy,
	OnChanges,
	ComponentFactoryResolver,
	ViewContainerRef,
	AfterContentInit,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { PreventScrolling, ReEnableScrolling } from 'prevent-scrolling';
import { UAParser } from 'ua-parser-js';

import * as fromRoot from 'ukbc/reducers';
import { CloseDialogAction } from 'ukbc/actions/dialog.actions';
import { IDialog } from 'ukbc/models';

const BLOCK_CLASS = 'Dialog';
const OVERLAY_CLASS = `${BLOCK_CLASS}--overlay`;
const OPEN_CLASS = `${BLOCK_CLASS}--open`;
const ANIMATION_DURATION = 325;

const ua = new UAParser();
const browser = ua.getBrowser();

@Component({
	selector: 'ukbc-dialog',
	templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnDestroy, AfterContentInit, OnChanges {
	@Input() config: IDialog;
	@Input() shouldBeOpen: boolean;
	@ViewChild('overlay') overlay: ElementRef;
	@ViewChild('close') close: ElementRef;
	@ViewChild('dialog') dialog: ElementRef;
	@ViewChild('inner') inner: ElementRef;
	@ViewChild('dynamic', {
		read: ViewContainerRef,
	})
	viewContainerRef: ViewContainerRef;

	public IsOpen: boolean;
	public Classes = '';
	public ShowCloseButton: boolean;
	public OuterHeight: string;
	public InnerMaxHeight: string;

	private onClose: Function;

	private runSafariHack = browser.name === 'Mobile Safari' && parseFloat(browser.version) < 11.3;
	private scrollYBeforeOpen: number;

	constructor(private componentFactoryResolver: ComponentFactoryResolver, private store: Store<fromRoot.State>) {}

	public ngAfterContentInit(): void {
		this.ShowCloseButton = !this.config.hideCloseButton;
	}

	public ngOnChanges(): void {
		if (this.shouldBeOpen && !this.IsOpen) {
			this.openDialog();
		} else if (!this.shouldBeOpen && this.IsOpen) {
			this.closeDialog();
		}
	}

	public ngOnDestroy(): void {
		ReEnableScrolling();
	}

	public Close(event: MouseEvent): void {
		if (this.ShowCloseButton && (event.target === this.overlay.nativeElement || event.target === this.close.nativeElement)) {
			this.store.dispatch(new CloseDialogAction(this.config.id));
		}
	}

	private openDialog(): void {
		if (this.runSafariHack) {
			this.scrollYBeforeOpen = window.pageYOffset;
		}

		this.IsOpen = true;
		this.ShowCloseButton = !this.config.hideCloseButton;

		setTimeout(() => {
			if (this.ContentIsComponent) {
				this.loadComponent();
			}
		}, 0);

		setTimeout(() => {
			this.Classes += ` ${OVERLAY_CLASS}`;

			if (!this.runSafariHack) {
				PreventScrolling(this.inner.nativeElement);
			}

			setTimeout(() => {
				this.Classes += ` ${OPEN_CLASS}`;
			}, ANIMATION_DURATION);
		}, 10);
	}

	private closeDialog(): void {
		this.Classes = this.Classes.replace(OPEN_CLASS, '');

		setTimeout(() => {
			this.Classes = this.Classes.replace(OVERLAY_CLASS, '');
			if (this.runSafariHack) {
				window.scrollTo(0, this.scrollYBeforeOpen);
			} else {
				ReEnableScrolling();
			}

			setTimeout(() => {
				if (this.onClose) {
					this.onClose();
				}
				this.IsOpen = false;
			}, ANIMATION_DURATION);
		}, ANIMATION_DURATION);
	}

	private setOnClose(callback: Function): void {
		this.onClose = callback;
	}

	private loadComponent(): void {
		this.config.componentInputs = { ...this.config.componentInputs, setOnClose: this.setOnClose.bind(this) };
		const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.config.component);
		const componentRef = this.viewContainerRef.createComponent(componentFactory);
		Object.assign(componentRef.instance, this.config.componentInputs);
	}

	public get ContentIsComponent(): boolean {
		return !this.config.content;
	}
}

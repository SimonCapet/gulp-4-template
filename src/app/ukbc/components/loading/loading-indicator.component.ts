import { Component, Input } from '@angular/core';

@Component({
	selector: 'ukbc-loading-indicator',
	templateUrl: './loading-indicator.component.html',
	styleUrls: ['./loading-indicator.component.scss'],
})
export class LoadingIndicatorComponent {
	@Input() title: string;
	@Input()
	set isLoading(isLoading: boolean) {
		if (this.IsLoading !== isLoading) {
			setTimeout(() => {
				this.setLoaderClasses();
			}, 100);

			this.IsLoading = isLoading;
		}
	}

	public IsLoading: boolean;
	public LoaderClasses: string;

	private setLoaderClasses(): void {
		this.LoaderClasses = this.IsLoading ? 'Loader--loading' : '';
	}
}

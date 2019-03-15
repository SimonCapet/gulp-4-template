export abstract class ValidatedStepComponent {
	public abstract get isValid(): boolean;
	public abstract ShowValidationErrors(): void;
}

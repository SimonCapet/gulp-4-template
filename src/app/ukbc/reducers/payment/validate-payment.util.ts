import { IPayment } from 'ukbc/models';
import { IValidated } from 'shared/models';
import { validate } from 'shared/services';

import { EPaymentType, EPurchaseType } from 'ukbc/enums';
import { directDebitDetailsValidator, cardPaymentValidator, cardPaymentWithCollectionDateValidator } from 'ukbc/validation-rules';

export function ValidatePayment(payment: IPayment): IValidated<IPayment> {
	if (payment.paymentType === EPaymentType.DirectDebit) {
		return validate(directDebitDetailsValidator, payment);
	} else {
		return validate(payment.purchaseType === EPurchaseType.Annual ? cardPaymentValidator : cardPaymentWithCollectionDateValidator, payment);
	}
}

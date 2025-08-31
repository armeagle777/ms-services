import {
   Matches,
   Validate,
   ValidateIf,
   IsOptional,
   ValidationArguments,
   ValidatorConstraint,
   ValidatorConstraintInterface,
} from 'class-validator';

// Ensure at least one field exists
@ValidatorConstraint({ name: 'atLeastOne', async: false })
export class AtLeastOneField implements ValidatorConstraintInterface {
   validate(_: any, args: ValidationArguments) {
      const obj = args.object as any;
      return !!(obj.ssn || obj.cardSerial);
   }

   defaultMessage(args: ValidationArguments) {
      return 'Provide at least one parameter: ssn or cardSerial';
   }
}

export class GetDiagnosis {
   @ValidateIf((o) => o.ssn !== undefined)
   @Matches(/^(?:\d{10}|[A-Za-z]\d{4}[A-Za-z]\d{4})$/, {
      message:
         'Invalid ssn format. Must be exactly 10 characters: either all digits, or letter + 4 digits + letter + 4 digits (e.g., X1234Y1234).',
   })
   ssn?: string;

   @ValidateIf((o) => o.cardSerial !== undefined)
   @Matches(/^[A-Za-z]{2}(\d{5}|\d{7})$/, {
      message: 'Invalid cardSerial format. Must be 2 letters followed by 5 or 7 digits.',
   })
   cardSerial?: string;

   @Validate(AtLeastOneField)
   dummy?: any;
}

import {
   IsNotEmpty,
   IsOptional,
   IsString,
   Validate,
   ValidationArguments,
   ValidatorConstraint,
   ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'policeVarchSearchFields', async: false })
export class PoliceVarchSearchFields implements ValidatorConstraintInterface {
   validate(_: unknown, args: ValidationArguments) {
      const body = args.object as PoliceVarchDto;
      const hasSsnAndPassport = this.hasValue(body.ssn) && this.hasValue(body.passport);
      const hasPersonalData =
         this.hasValue(body.firstName) &&
         this.hasValue(body.lastName) &&
         this.hasValue(body.birthDate);

      return hasSsnAndPassport || hasPersonalData;
   }

   defaultMessage() {
      return 'Provide either ssn and passport, or firstName, lastName and birthDate';
   }

   private hasValue(value?: string) {
      return typeof value === 'string' && value.trim().length > 0;
   }
}

export class PoliceVarchDto {
   @IsOptional()
   @IsString()
   @IsNotEmpty()
   ssn?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   firstName?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   lastName?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   patronomicName?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   birthDate?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   passport?: string;

   @Validate(PoliceVarchSearchFields)
   searchFields?: unknown;
}

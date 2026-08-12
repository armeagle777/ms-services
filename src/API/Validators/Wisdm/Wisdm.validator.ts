import {
   registerDecorator,
   ValidationArguments,
   ValidationOptions,
   ValidatorConstraint,
   ValidatorConstraintInterface,
} from 'class-validator';

import {
   WISDM_COUNTRY_CODE_PATTERN,
   WISDM_DATE_FORMAT,
   WISDM_DIN_MAX_LENGTH,
   WISDM_DIN_MIN_LENGTH,
} from 'src/Core/Wisdm/Constants/wisdm.rules.constants';
import {
   cleanDin,
   compareWisdmDates,
   isFutureWisdmDate,
   isPastWisdmDate,
   isValidDin,
   isValidWisdmDate,
   isValidWisdmMonth,
} from 'src/Core/Wisdm/Helpers/wisdm.helpers';

/**
 * Reusable class-validator constraints for the WISDM field rules (§3.1.1).
 *
 * These live at the API layer so a malformed request is rejected by the global
 * `ValidationPipe` with a 400 before any SOAP call is attempted — INTERPOL rejects the
 * same values with a functional error, and a round trip to Lyon is a slow way to learn
 * that a date is not `YYYYMMDD`. The rules themselves are implemented once in
 * `src/Core/Wisdm/Helpers/wisdm.helpers.ts` and only wrapped here.
 */

@ValidatorConstraint({ name: 'isWisdmDin', async: false })
class IsWisdmDinConstraint implements ValidatorConstraintInterface {
   validate(value: unknown): boolean {
      return typeof value === 'string' && isValidDin(value);
   }

   defaultMessage(args: ValidationArguments): string {
      const cleaned = cleanDin(String(args.value ?? ''));
      return `${args.property} must contain between ${WISDM_DIN_MIN_LENGTH} and ${WISDM_DIN_MAX_LENGTH} alphanumeric characters after cleaning (received ${cleaned.length}).`;
   }
}

/** Document Identification Number: 5–25 `[A-Za-z0-9]` characters once cleaned. */
export function IsWisdmDin(validationOptions?: ValidationOptions) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         options: validationOptions,
         validator: IsWisdmDinConstraint,
      });
   };
}

@ValidatorConstraint({ name: 'isWisdmDate', async: false })
class IsWisdmDateConstraint implements ValidatorConstraintInterface {
   validate(value: unknown): boolean {
      return typeof value === 'string' && isValidWisdmDate(value);
   }

   defaultMessage(args: ValidationArguments): string {
      return `${args.property} must be a real calendar date in ${WISDM_DATE_FORMAT} format.`;
   }
}

/** `YYYYMMDD`, rejecting impossible calendar dates such as `20250230`. */
export function IsWisdmDate(validationOptions?: ValidationOptions) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         options: validationOptions,
         validator: IsWisdmDateConstraint,
      });
   };
}

@ValidatorConstraint({ name: 'isPastWisdmDate', async: false })
class IsPastWisdmDateConstraint implements ValidatorConstraintInterface {
   validate(value: unknown): boolean {
      return typeof value === 'string' && isPastWisdmDate(value);
   }

   defaultMessage(args: ValidationArguments): string {
      return `${args.property} must be a ${WISDM_DATE_FORMAT} date that is not in the future.`;
   }
}

/** §3.1.1 — date of theft and document issuance date cannot exceed insertion date. */
export function IsPastWisdmDate(validationOptions?: ValidationOptions) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         options: validationOptions,
         validator: IsPastWisdmDateConstraint,
      });
   };
}

@ValidatorConstraint({ name: 'isFutureWisdmDate', async: false })
class IsFutureWisdmDateConstraint implements ValidatorConstraintInterface {
   validate(value: unknown): boolean {
      return typeof value === 'string' && isFutureWisdmDate(value);
   }

   defaultMessage(args: ValidationArguments): string {
      return `${args.property} must be a ${WISDM_DATE_FORMAT} date in the future.`;
   }
}

/** §3.1.1 — the record retention date must be in the future. */
export function IsFutureWisdmDate(validationOptions?: ValidationOptions) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         options: validationOptions,
         validator: IsFutureWisdmDateConstraint,
      });
   };
}

@ValidatorConstraint({ name: 'isAfterWisdmDate', async: false })
class IsAfterWisdmDateConstraint implements ValidatorConstraintInterface {
   validate(value: unknown, args: ValidationArguments): boolean {
      const [relatedProperty] = args.constraints as [string];
      const relatedValue = (args.object as Record<string, unknown>)[relatedProperty];

      // Only enforce the ordering when both dates are present and parseable; the
      // individual @IsWisdmDate constraints report malformed values on their own.
      if (typeof value !== 'string' || typeof relatedValue !== 'string') return true;

      const comparison = compareWisdmDates(value, relatedValue);
      return comparison === null ? true : comparison > 0;
   }

   defaultMessage(args: ValidationArguments): string {
      const [relatedProperty] = args.constraints as [string];
      return `${args.property} must be after ${relatedProperty}.`;
   }
}

/** §3.1.1 — the expiry date must be after the issuance date. */
export function IsAfterWisdmDate(relatedProperty: string, validationOptions?: ValidationOptions) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         constraints: [relatedProperty],
         options: validationOptions,
         validator: IsAfterWisdmDateConstraint,
      });
   };
}

@ValidatorConstraint({ name: 'isNotBeforeWisdmDate', async: false })
class IsNotBeforeWisdmDateConstraint implements ValidatorConstraintInterface {
   validate(value: unknown, args: ValidationArguments): boolean {
      const [relatedProperty] = args.constraints as [string];
      const relatedValue = (args.object as Record<string, unknown>)[relatedProperty];

      if (typeof value !== 'string' || typeof relatedValue !== 'string') return true;

      const comparison = compareWisdmDates(value, relatedValue);
      return comparison === null ? true : comparison >= 0;
   }

   defaultMessage(args: ValidationArguments): string {
      const [relatedProperty] = args.constraints as [string];
      return `${args.property} cannot be earlier than ${relatedProperty}.`;
   }
}

/** §3.1.1 — the date of theft must be at or after the document issuance date. */
export function IsNotBeforeWisdmDate(
   relatedProperty: string,
   validationOptions?: ValidationOptions,
) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         constraints: [relatedProperty],
         options: validationOptions,
         validator: IsNotBeforeWisdmDateConstraint,
      });
   };
}

@ValidatorConstraint({ name: 'isIcpoCountryCode', async: false })
class IsIcpoCountryCodeConstraint implements ValidatorConstraintInterface {
   validate(value: unknown): boolean {
      return (
         typeof value === 'string' && WISDM_COUNTRY_CODE_PATTERN.test(value.trim().toUpperCase())
      );
   }

   defaultMessage(args: ValidationArguments): string {
      return `${args.property} must be a 2 or 3 letter ICPO country code from IPSGT_ICPO_Countries (e.g. ARM).`;
   }
}

/**
 * Shape check only. Membership of `IPSGT_ICPO_Countries` cannot be verified locally —
 * pull the reference table via the WISDM reference-tables endpoint and cache it if you
 * need a strict check before submitting.
 */
export function IsIcpoCountryCode(validationOptions?: ValidationOptions) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         options: validationOptions,
         validator: IsIcpoCountryCodeConstraint,
      });
   };
}

@ValidatorConstraint({ name: 'isWisdmMonth', async: false })
class IsWisdmMonthConstraint implements ValidatorConstraintInterface {
   validate(value: unknown): boolean {
      return typeof value === 'string' && isValidWisdmMonth(value);
   }

   defaultMessage(args: ValidationArguments): string {
      return `${args.property} must be a period in YYYYMM format.`;
   }
}

/** `YYYYMM`, used by the monthly activity statistics (§3.2.3). */
export function IsWisdmMonth(validationOptions?: ValidationOptions) {
   return function (object: object, propertyName: string) {
      registerDecorator({
         target: object.constructor,
         propertyName,
         options: validationOptions,
         validator: IsWisdmMonthConstraint,
      });
   };
}

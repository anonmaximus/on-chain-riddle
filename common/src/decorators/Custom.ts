import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

type ICustomValidation = (value: any, args: ValidationArguments) => boolean;

@ValidatorConstraint({ async: false })
class Validator implements ValidatorConstraintInterface {
	async validate(value: any, args: ValidationArguments) {
		return args.constraints[0](value, args);
	}
}

export default function Custom(validate: ICustomValidation, validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "Custom",
			target: object.constructor,
			propertyName: propertyName,
			constraints: [validate],
			options: validationOptions ?? {},
			validator: Validator,
		});
	};
}

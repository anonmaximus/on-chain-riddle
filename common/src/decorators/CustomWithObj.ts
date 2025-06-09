import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

type ICustomValidation = (value: any, obj: any, args: ValidationArguments) => boolean;

@ValidatorConstraint({ async: false })
class Validator implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		// On passe l'objet courant (args.object) en plus de la valeur
		return args.constraints[0](value, args.object, args);
	}
}

export default function CustomWithObj(validate: ICustomValidation, validationOptions?: ValidationOptions) {
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

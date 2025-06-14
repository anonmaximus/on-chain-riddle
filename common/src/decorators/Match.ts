import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

export function Match(property: string, validationOptions?: ValidationOptions) {
	return (object: any, propertyName: string) => {
		registerDecorator({
			name: "match",
			target: object.constructor,
			propertyName,
			options: validationOptions ?? {},
			constraints: [property],
			validator: MatchConstraint,
		});
	};
}

@ValidatorConstraint({ name: "match" })
export class MatchConstraint implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		const [relatedPropertyName] = args.constraints;
		const relatedValue = (args.object as any)[relatedPropertyName];
		return value === relatedValue;
	}
}

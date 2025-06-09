/**
 * This class should be implemented by the UserService class and registered in the DI container
 */
export default class RuleServiceClassToken {
	public async exists(_id: string): Promise<boolean> {
		throw new Error("The RuleServiceClassToken class should be implemented by the RuleService class and registered in the DI container");
	}
}

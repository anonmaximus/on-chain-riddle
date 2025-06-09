/**
 * This class should be implemented by the UserService class and registered in the DI container
 */
export default class UserServiceClassToken {
	public async exists(_id: string): Promise<boolean> {
		throw new Error("The UserServiceClassToken class should be implemented by the UserService class and registered in the DI container");
	}
}

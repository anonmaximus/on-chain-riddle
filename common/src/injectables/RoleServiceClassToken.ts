/**
 * This class should be implemented by the UserService class and registered in the DI container
 */
export default class RoleServiceClassToken {
	public async exists(_id: string): Promise<boolean> {
		throw new Error("The RoleServiceClassToken class should be implemented by the RoleService class and registered in the DI container");
	}
}

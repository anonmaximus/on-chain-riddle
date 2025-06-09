import FileServiceClassToken from "./FileServiceClassToken";
import RoleServiceClassToken from "./RoleServiceClassToken";
import RuleServiceClassToken from "./RuleServiceClassToken";
import UserServiceClassToken from "./UserServiceClassToken";

export default abstract class Di {
	private static userService: UserServiceClassToken;
	private static roleService: RoleServiceClassToken;
	private static ruleService: RuleServiceClassToken;
	private static fileService: FileServiceClassToken;

	public static getUserService() {
		if (!this.userService) throw new Error("UserService not set");
		return this.userService;
	}

	public static setUserService(userService: UserServiceClassToken) {
		this.userService = userService;
	}

	public static getRoleService(roleService?: RoleServiceClassToken) {
		if (!this.roleService) throw new Error("RoleService not set");
		return this.roleService;
	}

	public static setRoleService(roleService: RoleServiceClassToken) {
		this.roleService = roleService;
	}

	public static getRuleService(ruleService?: RuleServiceClassToken) {
		if (!this.ruleService) throw new Error("RuleService not set");
		return this.ruleService;
	}

	public static setRuleService(ruleService: RuleServiceClassToken) {
		this.ruleService = ruleService;
	}

	public static getFileService(fileService?: FileServiceClassToken) {
		if (!this.fileService) throw new Error("FileService not set");
		return this.fileService;
	}

	public static setFileService(fileService: FileServiceClassToken) {
		this.fileService = fileService;
	}
}

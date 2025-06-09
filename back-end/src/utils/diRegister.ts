import RoleService from "#Services/RoleService";
import RuleService from "#Services/RuleService";
import UserService from "#Services/UserService";
import Di from "common/injectables/Di";
import { container } from "tsyringe";

Di.setUserService(container.resolve(UserService));
Di.setRoleService(container.resolve(RoleService));
Di.setRuleService(container.resolve(RuleService));


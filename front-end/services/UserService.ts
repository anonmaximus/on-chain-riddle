import UserApi from "@/api/UserApi";
import UserResponseResource from "common/resources/User/UserResponseResource";
import { container, singleton } from "tsyringe";

@singleton()
export default class UserService {
	private api: UserApi = container.resolve(UserApi);

	public async get(id: string): Promise<UserResponseResource> {
		return this.api.get(id);
	}
}

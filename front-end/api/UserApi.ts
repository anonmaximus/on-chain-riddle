import UserResponseResource from "common/resources/User/UserResponseResource";
import { singleton } from "tsyringe";

import BaseApi from "./BaseApi";

@singleton()
export default class UserApi extends BaseApi {
	private baseurl = `${this.apiUrl}/users`;

	public async get(id: string) {
		const url = `${this.baseurl}/${id}`;
		return this.getRequest<UserResponseResource>(url);
	}
}

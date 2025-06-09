import JwtPairResource from "common/resources/Auth/JwtPairResource";
import UserPreSignRequestResource from "common/resources/User/UserPreSignRequestResource";
import UserPreSignResponseResource from "common/resources/User/UserPreSignResponseResource";
import UserSignInRequestResource from "common/resources/User/UserSignInRequestResource";
import { singleton } from "tsyringe";

import BaseApi from "./BaseApi";

@singleton()
export default class AuthApi extends BaseApi {
	private baseurl = `${this.apiUrl}/auth`;

	public async preSign(userRequestRegisterResource: UserPreSignRequestResource) {
		const url = `${this.baseurl}/pre-sign`;
		return this.postRequest<UserPreSignResponseResource>(url, { ...userRequestRegisterResource });
	}

	public signIn(userRequestLoginResource: UserSignInRequestResource) {
		const url = `${this.baseurl}/sign-in`;
		return this.postRequest<JwtPairResource>(url, { ...userRequestLoginResource });
	}

	public logout() {
		const url = `${this.baseurl}/logout`;
		return this.postRequest(url);
	}
}

import AuthApi from "@/api/AuthApi";
import JwtPairResource from "common/resources/Auth/JwtPairResource";
import UserPreSignRequestResource from "common/resources/User/UserPreSignRequestResource";
import UserPreSignResponseResource from "common/resources/User/UserPreSignResponseResource";
import UserSignInRequestResource from "common/resources/User/UserSignInRequestResource";
import { container, singleton } from "tsyringe";

@singleton()
export default class AuthService {
	private api: AuthApi = container.resolve(AuthApi);

	public async preSign(resource: UserPreSignRequestResource): Promise<UserPreSignResponseResource> {
		return this.api.preSign(resource);
	}

	public async signIn(resource: UserSignInRequestResource): Promise<JwtPairResource> {
		return this.api.signIn(resource);
	}

    public async logout() {
        return this.api.logout();
    }
}

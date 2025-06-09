import { singleton } from "tsyringe";

@singleton()
export default class CookieService {
	private cookie: string | null = null;
	private jwtPairString: string | null = null;

	public getJwtPairString() {
		if (typeof window === "undefined") {
			return null;
		}

		let jwtPairString: string | undefined = undefined;

		// preserve recomputation of jwtPairString if cookie has not changed
		if (this.cookie === document.cookie) return this.jwtPairString;

		this.cookie = document.cookie;

		// else extract jwtPair from cookie
		for (const segment of this.cookie.split(";")) {
			const [key, value] = segment.split("=").map((c) => c.trim());

			if (key !== "jwtPair") continue;
			jwtPairString = value?.trim();
			break;
		}

		if (!jwtPairString) return (this.jwtPairString = null);

		this.jwtPairString = decodeURIComponent(jwtPairString);

		return this.jwtPairString;
	}
}

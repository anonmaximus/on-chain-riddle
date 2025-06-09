import CookieService from "@/services/CookieService";
import { container } from "tsyringe";

export enum ContentType {
	Json = "application/json",
	FormData = "multipart/form-data;",
	Zip = "application/zip",
}

const cookieService = container.resolve(CookieService);

export default abstract class BaseApi {
	protected readonly apiUrl = `${process.env["NEXT_PUBLIC_API_URL"]}/api/v1`;

	protected buildHeaders(contentType: ContentType) {
		const headers = new Headers();
		if (contentType === ContentType.Json) headers.set("Content-Type", contentType);
		return headers;
	}

	protected buildBody(body: { [key: string]: unknown }): string {
		return JSON.stringify(body);
	}

	protected async getRequest<T>(url: string, body?: { [key: string]: unknown }) {
		const request = async () => {
			return fetch(url, {
				method: "GET",
				credentials: "include",
				headers: this.buildHeaders(ContentType.Json),
				body: body ? this.buildBody(body) : undefined,
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async postRequest<T>(url: string, body: { [key: string]: unknown } = {}) {
		const request = async () => {
			return fetch(url, {
				method: "POST",
				credentials: "include",
				headers: this.buildHeaders(ContentType.Json),
				body: this.buildBody(body),
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async postRequestFormdata<T>(url: string, body: FormData) {
		const request = async () => {
			return fetch(url, {
				method: "POST",
				credentials: "include",
				headers: this.buildHeaders(ContentType.FormData),
				body: body,
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async putRequest<T>(url: string, body: { [key: string]: unknown } = {}) {
		const request = async () => {
			return fetch(url, {
				method: "PUT",
				credentials: "include",
				headers: this.buildHeaders(ContentType.Json),
				body: this.buildBody(body),
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async putRequestFormdata<T>(url: string, body: FormData) {
		const request = async () => {
			return fetch(url, {
				method: "PUT",
				credentials: "include",
				headers: this.buildHeaders(ContentType.FormData),
				body: body,
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async patchRequest<T>(url: string, body: { [key: string]: unknown } = {}) {
		const request = async () => {
			return fetch(url, {
				method: "PATCH",
				credentials: "include",
				headers: this.buildHeaders(ContentType.Json),
				body: this.buildBody(body),
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async deleteRequest<T>(url: string, body: { [key: string]: unknown } = {}) {
		const request = async () => {
			return fetch(url, {
				method: "DELETE",
				credentials: "include",
				headers: this.buildHeaders(ContentType.Json),
				body: this.buildBody(body),
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async patchFormDataRequest<T>(url: string, body: FormData) {
		const request = async () => {
			return fetch(url, {
				method: "PATCH",
				credentials: "include",
				headers: this.buildHeaders(ContentType.FormData),
				body,
			});
		};

		return request().then((response) => this.processResponse<T>(response));
	}

	protected async processResponse<T>(response: Response): Promise<T> {
		let responseContent: unknown;

		await BaseApi.dispatchCookieOnChangeEvent();

		const contentType = response.headers.get("content-type");

		if (contentType?.includes("application/json")) {
			responseContent = await response.json();
		} else if (contentType?.includes("application/zip")) {
			responseContent = await response.blob();
		} else {
			responseContent = await response.text();
		}

		if (!response.ok) {
			return Promise.reject(responseContent);
		}

		return responseContent as T;
	}

	protected static dispatchCookieOnChangeEvent = (() => {
		let previousJwt: string | null = null;

		const mayDispatchEvent = async () => {
			try {
				const jwtPair = cookieService.getJwtPairString();
				if (previousJwt !== jwtPair) {
					previousJwt = jwtPair;
					// Dispatch de l'événement uniquement côté client
					if (typeof window !== "undefined") {
						document.dispatchEvent(
							new CustomEvent("jwt_cookie_change", {
								detail: jwtPair,
							}),
						);
					}
				}
				return Promise.resolve(jwtPair);
			} catch (error) {
				return Promise.reject(error);
			}
		};

		// Appel initial uniquement côté client
		if (typeof window !== "undefined") {
			mayDispatchEvent();
		}
		return mayDispatchEvent;
	})();
}

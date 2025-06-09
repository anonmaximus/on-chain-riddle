import HttpCodes from "../HttpCodes";

export default class HttpException extends Error {
	constructor(
		message: string,
		public httpCode: HttpCodes = HttpCodes.UNKNOWN_ERROR,
	) {
		super(message);
	}
}

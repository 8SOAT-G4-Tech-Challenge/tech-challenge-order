export class BaseException {
	public statusCode: number;

	public message: string;

	public name: string;

	constructor(message: string, name: string, statusCode: number) {
		this.message = message;
		this.name = name;
		this.statusCode = statusCode;
	}
}

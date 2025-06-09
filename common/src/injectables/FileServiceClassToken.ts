/**
/**
 * This class should be implemented by the FileService class and registered in the DI container
 */
export default class FileServiceClassToken {
	public async exists(_id: string): Promise<boolean> {
		throw new Error("The FileServiceClassToken class should be implemented by the FileService class and registered in the DI container");
	}
}

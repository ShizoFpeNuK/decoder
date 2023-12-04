import { GPG } from "gpg-ts/dist/gpg.js";

export class customGPG {
	//* Функция расшифровки файлов
	static decryptFileWithPassphrase = (
		file: string | Buffer,
		passphrase: string,
		args?: string[],
		callback?: (err: Error, success: Buffer, errorMsg: string) => void,
	) => {
		const defaultArgs: string[] = ["--passphrase", passphrase];
		GPG.decrypt(file, defaultArgs.concat(args || []), (err, success, error) =>
			callback?.(err, success, error),
		);
	};

	// * Сохранение ключа в памяти
	static importKey = (
		key: string | Buffer,
		args?: string[],
		callback?: (err: Error, msg: string, errorMsg: string) => void,
	) => {
		GPG.importKey(key, args || [], (err, msg, errorMsg) => callback?.(err, msg, errorMsg));
	};

	// * Верификация файла посредством подписи
	static verifySignature = (
		signURL: string,
		fileURL: string,
		args?: string[],
		callback?: (err: Error, success: Buffer, errorMsg: string) => void,
	) => {
		const defaultArgs: string[] = ["--verify", signURL, fileURL];
		GPG.call("", defaultArgs.concat(args || []), (err, success, errorMsg) =>
			callback?.(err, success, errorMsg),
		);
	};
}

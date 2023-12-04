import fs from "node:fs";
import crc32 from "crc/crc32";
import * as readline from "node:readline/promises";
import { createURL } from "./utils/createURL.ts";
import { customGPG } from "./utils/gpg/customGPG.ts";
import { distributionByDir } from "./utils/distributionByDir.ts";
import { createProgramFiles } from "./utils/createProgramFiles.ts";
import { stdin as input, stdout as output } from "node:process";
import { MESSAGE_GPG, NAME_DIRECTORY, PATTERN } from "./utils/enumNames.ts";

// * Пользовательский ввод пути к директории файла
const rl = readline.createInterface({ input, output });
const pathToFiles = await rl.question("Укажите путь к директории с файлами: ");
rl.close();

// * Чтение файлов из директории files
console.log("Чтение файлов...");
const files = fs.readdirSync(pathToFiles);
console.log("Прочитано файлов: ", files.length);

createProgramFiles();
distributionByDir(files, pathToFiles);

/**
 * * Задержки в работе программы, так как GPG работает в
 * * нескольких потоках и асинхронно
 */
const delay: number[] = [5000, 7000];
const encryptFiles = fs.readdirSync(NAME_DIRECTORY.FILES);
console.log("Сравнение контрольных сумм...");

/**
 * * Проверка на совпадение хэш-сумм
 * * и расшифровка небракованных файлов при совпадении
 */
encryptFiles.forEach((name) => {
	const file = fs.readFileSync(createURL(NAME_DIRECTORY.FILES, name));
	const CRC32 = crc32(file).toString(16);

	const splitName = name.split(".")[0].split("_");
	let hashSum = splitName[2];

	/**
	 * * Функция crc32 удаляет первые нули,
	 * * поэтому удаляются нули и из названия файла
	 */
	while (hashSum[0] === "0") {
		hashSum = hashSum.slice(1);
	}

	if (hashSum === CRC32) {
		//* Запись расшифрованных небракованных файлов в директорию outputFiles
		const passphrase = file.toString("hex").slice(-Number(splitName[0]) * 2);
		customGPG.decryptFileWithPassphrase(file, passphrase, [], (_, success, error) => {
			if (success.length !== 0 && error.includes(MESSAGE_GPG.ENCRYPTED_DATA)) {
				fs.writeFileSync(createURL(NAME_DIRECTORY.OUTPUT_FILES, name), success);
			}
		});
	}
});

console.log("Чтение подписей...");
const signs = fs.readdirSync(NAME_DIRECTORY.SIGNS);
const partKeys: string[] = Array.from({ length: signs.length });

// * Поиск среди расшифрованных файлов частей ключа
setTimeout(() => {
	const outputFiles = fs.readdirSync(NAME_DIRECTORY.OUTPUT_FILES);
	console.log("Расшифрованных небракованных файлов: ", outputFiles.length);

	console.log("Чтение публичного ключа...");
	const publicKey = fs.readFileSync("pub_bbso_23.key");
	customGPG.importKey(publicKey);

	console.log("Поиск частей ключа...");
	signs.forEach((nameSign) => {
		const numberSign = nameSign.split(".")[0].split("_")[1];

		outputFiles.forEach((nameFile) => {
			const outputFileURL = createURL(NAME_DIRECTORY.OUTPUT_FILES, nameFile);
			const signURL = createURL(NAME_DIRECTORY.SIGNS, nameSign);

			const file = fs.readFileSync(outputFileURL).toString();

			if (
				file.includes(PATTERN.CHUNK1 + numberSign) ||
				file.includes(PATTERN.CHUNK2 + numberSign)
			) {
				/**
				 * * Проверка на подпись и удаление файлов, не содержащих часть ключа
				 * * Размещение частей ключа в массиве по порядку номеров подписей
				 */
				customGPG.verifySignature(signURL, outputFileURL, [], (_, __, error) => {
					if (
						error.includes(MESSAGE_GPG.GOOD_SIGNATURE_EN) ||
						error.includes(MESSAGE_GPG.GOOD_SIGNATURE_RU)
					) {
						const key = file.split(`${PATTERN.CHUNK2}${numberSign} -> `)[1].split(" ")[0];
						partKeys.splice(Number(numberSign) - 1, 1, key);
						return;
					}
					fs.unlinkSync(outputFileURL);
				});
			}
		});
	});
}, delay[0]);

// * Сборка ключа из его частей
setTimeout(() => {
	const key = partKeys.join("");
	console.log("Полученный ключ: ", key);

	console.log("Расшифровка целевого файла...");
	const target = fs.readdirSync(NAME_DIRECTORY.TARGET);
	const targetFile = fs.readFileSync(createURL(NAME_DIRECTORY.TARGET, target[0]));
	customGPG.decryptFileWithPassphrase(targetFile, key, [], (_, success) => {
		console.log("Полученная фраза: ", success.toString().split(PATTERN.TARGET)[1].split("\n")[0]);
	});
}, delay[1]);

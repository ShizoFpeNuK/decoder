import fs from "node:fs";
import crc32 from "crc/crc32";
import { GPG } from "gpg-ts/dist/gpg.js";
import { NAME_DIRECTORY } from "./nameDirectory.js";

// * Кол-во файлов в директории dir
const files = fs.readdirSync(NAME_DIRECTORY.FILES);

if (!fs.existsSync(NAME_DIRECTORY.OUTPUT_FILES)) {
	fs.mkdirSync(NAME_DIRECTORY.OUTPUT_FILES);
}

// files.forEach((name) => {
// 	// * Получение хэш-суммы
// 	const file = fs.readFileSync(NAME_DIRECTORY.FILES + name);
// 	const CRC32 = crc32(file).toString(16);
// 	const splitName = name.split(".")[0].split("_");
// 	let hashSum = splitName[2];

// 	while (hashSum[0] === "0") {
// 		hashSum = hashSum.slice(1);
// 	}

// 	// * Получение хэш-суммы из названия файла
// 	if (hashSum === CRC32) {
// 		const fileHex = file.toString("hex"); // Нет смысла
// 		const passphrase = fileHex.slice(-Number(splitName[0]) * 2);

// 		const args: string[] = ["--passphrase", passphrase];

// 		GPG.decrypt(file, args, (_, success, error) => {
// 			if (success.length !== 0 && error.includes("gpg: AES256.CFB encrypted data")) {
// 				fs.writeFileSync(NAME_DIRECTORY.OUTPUT_FILES + name, success);
// 			}
// 		});
// 	}
// });

const outputFiles = fs.readdirSync(NAME_DIRECTORY.OUTPUT_FILES);
const signs = fs.readdirSync(NAME_DIRECTORY.SIGNS);
const publicKey = fs.readFileSync("pub_bbso_23.key");
GPG.importKey(publicKey, [], () => {});

signs.forEach((nameSign) => {
	const sign = fs.readFileSync(NAME_DIRECTORY.SIGNS + nameSign);
	const numberSign = nameSign.split(".")[0].split("_")[1];

	outputFiles.forEach((nameFile) => {
		const file = fs.readFileSync(NAME_DIRECTORY.OUTPUT_FILES + nameFile).toString();

		if (file.includes("CHUNK KEY # " + numberSign) || file.includes("CHUNK KEY #  " + numberSign)) {
			GPG.call(
				"",
				["--verify", NAME_DIRECTORY.SIGNS + nameSign, NAME_DIRECTORY.OUTPUT_FILES + nameFile],
				(_, __, error) => {
          if (error.includes("Отпечаток первичного ключа:")) {
            console.log(error);
          }
				},
			);
		}
	});
});

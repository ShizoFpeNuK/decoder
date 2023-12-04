import fs from "node:fs";
import { createURL } from "./createURL.js";
import { NAME_DIRECTORY } from "./enumNames.js";

// * Распределение файлов по папкам
export const distributionByDir = (files: string[], pathToDir: string) => {
	files.forEach((name) => {
		if (name.includes("chunk")) {
			fs.copyFileSync(createURL(pathToDir, name), createURL(NAME_DIRECTORY.SIGNS, name));
			return;
		}

		if (name.includes("target")) {
			fs.copyFileSync(createURL(pathToDir, name), createURL(NAME_DIRECTORY.TARGET, name));
			return;
		}

		fs.copyFileSync(createURL(pathToDir, name), createURL(NAME_DIRECTORY.FILES, name));
	});
};

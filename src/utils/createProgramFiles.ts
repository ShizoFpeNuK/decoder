import fs from "node:fs";
import { NAME_DIRECTORY } from "./enumNames.js";

// * Создание директорий для работы программы
export const createProgramFiles = () => {
	if (fs.existsSync(NAME_DIRECTORY.OUTPUT_FILES)) {
		fs.rmSync(NAME_DIRECTORY.OUTPUT_FILES, { recursive: true });
		fs.mkdirSync(NAME_DIRECTORY.OUTPUT_FILES);
	} else {
		fs.mkdirSync(NAME_DIRECTORY.OUTPUT_FILES);
	}

	if (fs.existsSync(NAME_DIRECTORY.SIGNS)) {
		fs.rmSync(NAME_DIRECTORY.SIGNS, { recursive: true });
		fs.mkdirSync(NAME_DIRECTORY.SIGNS);
	} else {
		fs.mkdirSync(NAME_DIRECTORY.SIGNS);
	}

	if (fs.existsSync(NAME_DIRECTORY.TARGET)) {
		fs.rmSync(NAME_DIRECTORY.TARGET, { recursive: true });
		fs.mkdirSync(NAME_DIRECTORY.TARGET);
	} else {
		fs.mkdirSync(NAME_DIRECTORY.TARGET);
	}

	if (fs.existsSync(NAME_DIRECTORY.FILES)) {
		fs.rmSync(NAME_DIRECTORY.FILES, { recursive: true });
		fs.mkdirSync(NAME_DIRECTORY.FILES);
	} else {
		fs.mkdirSync(NAME_DIRECTORY.FILES);
	}
};

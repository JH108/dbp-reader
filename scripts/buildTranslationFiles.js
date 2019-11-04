const fs = require('fs');
const glob = require('glob');
const promisify = require('util').promisify;
const mkdirpSync = require('mkdirp').sync;
const last = require('lodash/last');
const path = require('path');

const readFile = promisify(fs.readFile);
const globFile = promisify(glob);

const MESSAGES_PATTERN = path.join(
	__dirname,
	'../app/components/AccountSettings/messages.js',
);
const LANG_DIR = '../languages-test/locales/';
const LANG_PATTERN = '../languages-test/locales/*.json';

const init = async () => {
	console.log('MESSAGES_PATTERN', MESSAGES_PATTERN);
	const filenames = await globFile('../app/**/messages.js');
	const filenamePromises = filenames.map(async (file) => {
		const filePath = path.join(__dirname, file);
		const fileBuffer = await readFile(filePath);
		const fileData = Buffer.from(fileBuffer).toString('utf8');

		return fileData;
	});

	const filenameData = await Promise.all(filenamePromises);
	console.log('Files globbed', filenameData.length);
	// Might not be the best way to get all the messages, maybe a refactor to move
	// the message objects into JSON would be better
	const parsedFiles = filenameData.map((data) => {
		const regex = new RegExp(/.*export default defineMessages\((.*)\}/gim);
		return data.match(regex);
	});
	console.log(parsedFiles);
	return parsedFiles;
};

init().catch((error) => {
	console.log('Error gathering messages', error);
});

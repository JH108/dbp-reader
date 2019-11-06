/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable arrow-parens */
const fs = require("fs");
const glob = require("glob");
const promisify = require("util").promisify;
const mkdirpSync = require("mkdirp").sync;
const last = require("lodash/last");
const path = require("path");

const readFile = promisify(fs.readFile);
const globFile = promisify(glob);

const MESSAGE_FILES_PATTERN = "../app/**/messages.js";
const LANG_DIR = "../languages-test/locales/";
const LANG_PATTERN = "../languages-test/locales/*.json";

/** Structure
 * Steps
 * 1. Gather all messages from application
 * 2. Create files for each desired translation
 * 3. Pull translation messages from remote location (api or google sheets)
 * 4. Write new message files containing updated translations
 *
 * Modules
 * - ReadFiles
 * - GetTranslations
 * - WriteFiles
 *
 * Example Output
 * {
 *   "app.components.BooksTable.header": "This is the BooksTable component !",
 *   "app.components.ChapterButton.header": "This is the ChapterButton component !",
 *   "app.components.HomePage.header": "This is HomePage component!",
 *   "app.components.Logo.header": "This is the Logo component !",
 * }
 */
// TODO: Extract Regex declarations into properties on the TranslationGenerator class
// TODO: Extract reuseable string manipulation into properties on the TranslationGenerator class
class TranslationGenerator {
  // If the glob function needs to grow put it here
  async globFiles() {}

  async readFiles(searchPattern) {
    // Get filenames
    const filenames = await globFile(searchPattern);
    // Map files to promises
    const filenamePromises = filenames.map(async file => {
      const filePath = path.join(__dirname, file);
      const fileBuffer = await readFile(filePath);
      const fileData = Buffer.from(fileBuffer).toString("utf8");

      return fileData;
    });
    // Resolve promises to get the concatenated text for all files
    const filenameData = await Promise.all(filenamePromises);
    console.log("Files globbed", filenameData.length);
    // Might not be the best way to get all the messages, maybe a refactor to move
    // the message objects into JSON would be better
    const parsedFiles = filenameData.map((data, i) => {
      const messageObjectRegex = new RegExp(
        /export default defineMessages\(\{(.*)\}/gms
      );
      const matchedData = data.match(messageObjectRegex);
      const normMatchedData =
        matchedData && matchedData[0] ? matchedData[0] : "";
      const parsedText = normMatchedData.replace(/\n\t/g, "");
      const messagePairRegex = new RegExp(
        /id: (['"]app\.[containers|components].*?['"],defaultMessage: (['"].*?['"]))/
      );
      const messagePairs = parsedText.match(messagePairRegex);
      // const strippedData = data.replace(/\n/gm, ";;");
      if (i === 0) {
        console.log("matchedData", matchedData);
        console.log("parsedText", parsedText);
        console.log("messagePairs", messagePairs);
        // console.log("strippedData.match(regex)", strippedData.match(regex));
      }
      return parsedText;
    });

    return parsedFiles;
  }

  async getTranslations() {}

  async writeFile() {}
}

const init = async () => {
  const translationGenerator = new TranslationGenerator();
  const messageFiles = await translationGenerator.readFiles(
    MESSAGE_FILES_PATTERN
  );

  await translationGenerator.getTranslations(messageFiles);
};

init().catch(error => {
  console.log("Error in init function", error);
});

/* eslint-enable */

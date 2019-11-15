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
const writeFile = promisify(fs.writeFile);
const globFile = promisify(glob);

const MESSAGE_FILES_PATTERN: string = "../../app/**/messages.js";
const LANG_DIR: string = "../../languages-test/locales/";
const LANG_PATTERN: string = "../../languages-test/locales/*.json";

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
// TODO: Extract all default messages into json files and then update the js files to import them
// Going the path of using regex is going to be too unstable and will require more effort
class TranslationGenerator {
  // If the glob function needs to grow put it here
  async globFiles() {}

  public messageObjectRegex = new RegExp(
    /export default defineMessages\(\{(.*)\}/gms
  );
  // Has issues around the [\s|^\}] part, the regex is being too greedy...

  public messagePairRegex = new RegExp(
    /(?<id>id:\s*['"]app\.(components|containers).*?['"])(,\s*)(?<defaultMessage>defaultMessage:\s*['"].*?['"])/g
  );

  public removeNewlineAndTab = (data: string) => data.replace(/\n\t/g, "");

  async readFiles(searchPattern: string) {
    // Get filenames
    const filenames = await globFile(searchPattern);
    // Map files to promises
    const filenamePromises = filenames.map(async (file: string) => {
      const filePath = path.join(file);
      const fileBuffer = await readFile(filePath);
      const fileData = Buffer.from(fileBuffer).toString("utf8");

      return [file, fileData];
    });
    // Resolve promises to get the concatenated text for all files
    const filenameData = await Promise.all(filenamePromises);

    const parsedFilePromises = filenameData.map(
      async ([fileName, data]: string): Promise<string> => {
        const matchedData = data.match(this.messageObjectRegex);
        const normMatchedData =
          matchedData && matchedData[0] ? matchedData[0] : "";
        const parsedText = this.removeNewlineAndTab(normMatchedData);
        const slicedText = parsedText.slice(30);
        const messageJson = JSON.stringify(slicedText);
        console.log("START TEXT FOR:");
        await this.writeFile(fileName, messageJson);

        console.log("END TEXT FOR:");

        return fileName;
      }
    );
    const parsedFiles = Promise.all(parsedFilePromises);

    return parsedFiles;
  }

  async getTranslations(messagesToGet: string[]) {}

  async writeFile(fileName: string, data: string) {
    const normFileName = fileName.replace(/\.js$/, ".json");
    console.log("normFileName", normFileName);
    console.log("data", data);
    const result = await writeFile(normFileName, data);
    return result;
  }
}

const init = async () => {
  const translationGenerator = new TranslationGenerator();
  const messageFiles = await translationGenerator.readFiles(
    MESSAGE_FILES_PATTERN
  );

  console.log("messageFiles", messageFiles && messageFiles.length);

  await translationGenerator.getTranslations(messageFiles);
};

init().catch(error => {
  console.log("Error in init function", error);
});

/* eslint-enable */

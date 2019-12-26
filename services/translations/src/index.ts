/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable arrow-parens */
const fs = require("fs");
const glob = require("glob");
const promisify = require("util").promisify;
const mkdirpSync = require("mkdirp").sync;
const last = require("lodash/last");
const merge = require("lodash/merge");
const path = require("path");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const globFile = promisify(glob);

/** Structure
 * Steps
 * 1. Gather all messages from application
 * 2. Create files for each desired translation
 * 3. Determine which translation to update
 * 4. Pull translation messages from remote location (api or google sheets)
 * 5. Write new message files containing updated translations
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
  constructor(baseJSON?: {}) {
    if (baseJSON) {
      this.messages = baseJSON;
    }
  }
  private messages: {};
  private MESSAGE_FILES_PATTERN: string = "../../app/**/messages.json";
  private LANG_DIR: string = "../../languages-test/locales/";
  private LANG_PATTERN: string = "../../languages-test/locales/*.json";
  private messageObjectRegex = new RegExp(
    /export default defineMessages\(\{(.*)\}/gms
  );
  private messagePairRegex = new RegExp(
    /(?<id>id:\s*['"]app\.(components|containers).*?['"])(,\s*)(?<defaultMessage>defaultMessage:\s*['"].*?['"])/g
  );
  private matchJsonFilePaths = (filePath: string) => filePath.match(/\.json$/);

  private async handleReturnedData(fileName: string, data: {}) {
    // update the local messages object with the new messages retrieved from the JSON files
    // overwrites the existing key on this.messages
    const updatedKeys: { [pathName: string]: string } = {};
    const dataEntries = Object.entries(data);
    dataEntries.forEach(
      ([key, value]: [string, { id: string; defaultMessage: string }]) => {
        updatedKeys[value.id] = value.defaultMessage;
      }
    );
    // Need to get the file path and add it to these as keys
    this.messages = merge(this.messages, updatedKeys);

    return fileName;
  }

  public removeNewlineAndTab = (data: string) => data.replace(/\n\t/g, "");

  async globFiles(searchPattern: string) {
    const fileNames = await globFile(searchPattern);

    return fileNames;
  }

  async readFiles(searchPattern: string = this.MESSAGE_FILES_PATTERN) {
    // Get filenames
    const filenames = await this.globFiles(searchPattern);
    // Map files to promises
    const filenamePromises = filenames.map(async (file: string) => {
      const filePath = path.join(file);
      const fileBuffer = await readFile(filePath);
      const fileData = Buffer.from(fileBuffer).toString("utf8");
      let jsonData = fileData;

      if (this.matchJsonFilePaths(filePath)) {
        jsonData = JSON.parse(fileData);
      }

      return [file, jsonData];
    });
    // Resolve promises to get the concatenated text for all files
    const filenameData = await Promise.all(filenamePromises);

    const parsedFilePromises = filenameData.map(
      ([fileName, data]: string): Promise<string> => {
        return this.handleReturnedData(fileName, data);
      }
    );
    const parsedFiles = Promise.all(parsedFilePromises);

    return parsedFiles;
  }

  // All messages used in the app
  async gatherMessages(messagePattern?: string) {
    await this.readFiles(messagePattern);

    return this.messages;
  }

  async getTranslations(
    translationsToGet: string[],
    messages: { [propName: string]: string }
  ) {
    console.log("TRANSLATIONS:", translationsToGet);
    // Create a temp file for each with the given messages
    // Fetch external messages and replace current local messages
    // Read the current local messages and overwrite the given messages
    for (let i = 0; i < translationsToGet.length; i++) {
      const translation = translationsToGet[i];
      const fileName = path.join(__dirname, `${translation}.json`);
      await this.writeFile(fileName, JSON.stringify(messages), true);
    }
  }

  async writeFile(fileName: string, data: string, dryrun?: boolean) {
    const normFileName = path.join(
      __dirname,
      "temp-files",
      fileName.replace(/\.js$/, ".json")
    ); // New file place
    console.log("NORM FILE:", normFileName);

    if (dryrun) {
      return `Wrote: ${normFileName}...`;
    }

    const result = await writeFile(normFileName, data);

    return result;
  }
}

const init = async (translations: string[], messagePattern?: string) => {
  const translationGenerator = new TranslationGenerator();
  const messages = await translationGenerator.gatherMessages();

  await translationGenerator.getTranslations(translations, messages);
};

init(["en", "ru", "ar", "es", "th"]).catch(error => {
  console.log("Error in init function", error);
});

/* eslint-enable */

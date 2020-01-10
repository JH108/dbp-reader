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
const fetchTranslationData = require("./googleApis").default;

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
    // TODO: Use fs-stat to check for the folders existence and create if necessary
    // Create a temp file for each with the given messages
    for (let i = 0; i < translationsToGet.length; i++) {
      const translation = translationsToGet[i];
      console.log("translation", translation);
      const fileName = path.join(__dirname, `${translation}.json`);
      await this.writeFile(fileName, JSON.stringify(messages), false); // Create the new temp files
      // Fetch external messages based on the current translation and replace current local messages
      const newMessages: {
        [propName: string]: string;
      } = await fetchTranslationData(translation); // Might want this to be a map of sheet id to iso3

      // Read the current local messages and overwrite with the new messages
      const combinedMessages = merge(messages, newMessages);
      await this.writeFile(fileName, JSON.stringify(combinedMessages), false);
      // TODO: Add js-beautify to format the json files after they are updated
    }
  }

  async writeFile(fileName: string, data: string, dryrun?: boolean) {
    const normFileName = fileName.match(/([a-zA-Z]{2,3}\.json$)/);
    const filePath = path.join(
      __dirname,
      "..",
      "temp-files",
      normFileName ? normFileName[0] : ""
    );

    // Need to make sure the folder exists
    if (dryrun) {
      return `Wrote: ${filePath}...`;
    }

    const result = await writeFile(filePath, data);

    return result;
  }
}

const init = async (translations: string[], messagePattern?: string) => {
  console.log("INIT: fetching the following translations...", translations);
  const translationGenerator = new TranslationGenerator();
  const messages = await translationGenerator.gatherMessages();

  await translationGenerator.getTranslations(translations, messages);
};

// Edit the list below to change which translations are fetched
// TODO: Turn this into a CLI for easy updates to the languages
init(["en", "ru", "ar", "es", "th"]).catch(error => {
  console.log("Error in init function", error);
});

/* eslint-enable */

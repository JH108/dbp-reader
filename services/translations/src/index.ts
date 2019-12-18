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

  private async handleReturnedJSON(fileName: string, data: string) {
    // Need a helper method to resolve the files that are strings and one to resolve the JSON objects
    const matchedData = data.match(this.messageObjectRegex);
    const normMatchedData = matchedData && matchedData[0] ? matchedData[0] : "";
    const parsedText = this.removeNewlineAndTab(normMatchedData);
    const slicedText = parsedText.slice(30);
    const messageJson = JSON.stringify(slicedText);
    // Do something else here like check to see if the json file already exists
    await this.writeFile(fileName, messageJson, true);

    return messageJson;
  }

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
    // Example: app.components.AccountSettings.header instead of just header
    this.messages = merge(this.messages, updatedKeys);

    // return this.messages;
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
        // Data is JSON and can be parsed
        // console.log("filePath", filePath);
        jsonData = JSON.parse(fileData);
      }
      // console.log("\nFILE-PATH:", filePath, "\n");
      // console.log("\nDATA:", typeof jsonData, "\n");

      return [file, jsonData];
    });
    // Resolve promises to get the concatenated text for all files
    const filenameData = await Promise.all(filenamePromises);

    const parsedFilePromises = filenameData.map(
      ([fileName, data]: string): Promise<string> => {
        if (typeof data !== "string") {
          return this.handleReturnedData(fileName, data);
        } else {
          return this.handleReturnedJSON(fileName, data);
        }
      }
    );
    const parsedFiles = Promise.all(parsedFilePromises);
    console.log("Parsed Files: ", parsedFiles);

    return this.messages;
  }

  async getTranslations(messagesToGet: string[]) {}

  async writeFile(fileName: string, data: string, dryrun?: boolean) {
    const normFileName = fileName.replace(/\.js$/, ".json");

    if (dryrun) {
      return `Wrote: ${normFileName}...`;
    }

    const result = await writeFile(normFileName, data);

    return result;
  }
}

const init = async (messagePattern?: string) => {
  const translationGenerator = new TranslationGenerator();
  const messageFiles = await translationGenerator.readFiles(messagePattern);

  console.log("messageFiles", messageFiles);

  // await translationGenerator.getTranslations(messageFiles);
};

init().catch(error => {
  console.log("Error in init function", error);
});

/* eslint-enable */

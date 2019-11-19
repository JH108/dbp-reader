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

  private handleReturnedJSON(data: {}) {
    // update the local messages object with the new messages retrieved from the JSON files
    return this.messages;
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
      let fileData = "";
      console.log("filePath.match(/$.json/)", filePath.match(/$\.json/));
      console.log("filePath.match(/.json$/)", filePath.match(/\.json$/));

      if (filePath.match(/$\.json/)) {
        // JSON can be imported
        const json = require(filePath);
        fileData = JSON.parse(json);
      } else {
        // Everything else needs to be read and parsed
        const fileBuffer = await readFile(filePath);
        fileData = Buffer.from(fileBuffer).toString("utf8");
      }
      console.log("\nFILE-PATH:", filePath, "\n");
      console.log("\nDATA:", fileData, "\n");

      return [file, fileData];
    });
    // Resolve promises to get the concatenated text for all files
    const filenameData = await Promise.all(filenamePromises);

    const parsedFilePromises = filenameData.map(
      async ([fileName, data]: string): Promise<string> => {
        if (typeof data !== "string") {
          this.handleReturnedJSON(data);
        } else {
          // Need a helper method to resolve the files that are strings and one to resolve the JSON objects
          const matchedData = data.match(this.messageObjectRegex);
          const normMatchedData =
            matchedData && matchedData[0] ? matchedData[0] : "";
          const parsedText = this.removeNewlineAndTab(normMatchedData);
          const slicedText = parsedText.slice(30);
          const messageJson = JSON.stringify(slicedText);
          // Do something else here like check to see if the json file already exists
          await this.writeFile(fileName, messageJson, true);
        }
        return fileName;
      }
    );
    const parsedFiles = Promise.all(parsedFilePromises);

    return parsedFiles;
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

  console.log("messageFiles", messageFiles && messageFiles.length);

  await translationGenerator.getTranslations(messageFiles);
};

init().catch(error => {
  console.log("Error in init function", error);
});

/* eslint-enable */

const fs = require("fs");
const globSync = require("glob").sync;
const mkdirpSync = require("mkdirp").sync;
const last = require("lodash/last");

const MESSAGES_PATTERN = "../app/**/messages.js";
const LANG_DIR = "../languages-test/locales/";
const LANG_PATTERN = "../languages-test/locales/*.json";

// Try to delete current json files from public/locales
// try {
//   fs.unlinkSync("../languages-test/locales/*.json");
// } catch (error) {
//   console.log(error);
// }

// Merge translated json files (es.json, fr.json, etc) into one object
// so that they can be merged with the Aggregated "en" object below

// const mergedTranslations = globSync(LANG_PATTERN)
//   .map(filename => {
//     const locale = last(filename.split("/")).split(".json")[0];
//     return { [locale]: JSON.parse(fs.readFileSync(filename, "utf8")) };
//   })
//   .reduce((acc, localeObj) => {
//     return { ...acc, ...localeObj };
//   }, {});

// Aggregates the default messages that were extracted from the app's
// React components. An error will be thrown if
// there are messages in different components that use the same `id`. The result
// is a flat collection of `id: message` pairs for the app's default locale.

const defaultMessages = globSync(MESSAGES_PATTERN).map(filename => {
  console.log("filename", filename);
  return filename;
});
console.log(defaultMessages);
//   .map(file => JSON.parse(file))
//   .reduce((collection, descriptors) => {
//     descriptors.forEach(({ id, defaultMessage }) => {
//       if (collection.hasOwnProperty(id)) {
//         throw new Error(`Duplicate message id: ${id}`);
//       }
//       collection[id] = defaultMessage;
//     });

//     return collection;
//   }, {});

// Create a new directory that we want to write the aggregate messages to
// mkdirpSync(LANG_DIR);

// Merge aggregated default messages with the translated json files and
// write the messages to this directory
// fs.writeFileSync(
//   `${LANG_DIR}data.json`,
//   JSON.stringify({ en: defaultMessages, ...mergedTranslations }, null, 2)
// );

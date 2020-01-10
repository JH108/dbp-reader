const fetch = require("isomorphic-fetch");
// const flatten = require("lodash/flatten");
// Base Url
// https://docs.google.com/spreadsheets/d/1KjetxTRxmwStF54tM76CfkFEV042_MSstfF8_fzRBX8/edit#gid=1495712534
const format = "tsv"; // Format you'd like to parse. `tsv` or `csv`
const id = "1KjetxTRxmwStF54tM76CfkFEV042_MSstfF8_fzRBX8"; // The Google Sheet ID found in the URL of your Google Sheet.
// ["en", "ru", "ar", "es", "th"] will each need to be mapped once the appropriate sheets are created
const iso3ToSheetIdMap: any = {
  en: 0,
  ar: 1495712534
};

// TODO: Extract this into a general "get something from google sheets module" and fix the types
const getTranslationSheetData = async (iso3: string) => {
  const sheetId = iso3ToSheetIdMap[iso3];
  console.log("".padStart(80, "-"));

  if (!sheetId && sheetId !== 0) {
    return {};
  }

  const body = await fetch(
    `https://docs.google.com/spreadsheets/d/${id}/export?format=${format}&id=${id}&gid=${sheetId}&ndplr=1`
  ).then((body: any) => body.text());

  const bodyArray = body.split(/\n/i);
  // All the titles are in the first row of data and the values follow
  const valuesArray = bodyArray.slice(1);
  // Might bring this back at a later point in time, likely when we become concerned with updating the remote values
  // const titlesArray = flatten(
  //   bodyArray
  //     .slice(0, 1)
  //     .map((titles: any) => titles.replace("\r", "").split("\t"))
  // );

  const lineEntries = valuesArray
    .map((item: string) => item.replace("\r", "").split("\t"))
    .map((entry: string[]) => {
      const [key, original, translation] = entry;

      return { key, original, translation };
    })
    .reduce(
      (
        messages: { [propName: string]: string },
        message: { key: string; original: string; translation: string }
      ) => ({
        ...messages,
        [message.key]: message.translation || message.original
      }),
      {}
    );

  return lineEntries;
};

export default getTranslationSheetData;

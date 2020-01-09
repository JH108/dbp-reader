const fetch = require("isomorphic-fetch");
// Base Url
// https://docs.google.com/spreadsheets/d/1KjetxTRxmwStF54tM76CfkFEV042_MSstfF8_fzRBX8/edit#gid=1495712534
const format = "tsv"; // Format you'd like to parse. `tsv` or `csv`
const id = "1KjetxTRxmwStF54tM76CfkFEV042_MSstfF8_fzRBX8"; // The Google Sheet ID found in the URL of your Google Sheet.
// ["en", "ru", "ar", "es", "th"]
const iso3ToSheetIdMap: any = {
  en: 0,
  ar: 1495712534
};

// TODO: Extract this into a general "get something from google sheets module"
// FIXME: Seems to break if a function is used on the google sheet
const getTranslationSheetData = async (iso3: string) => {
  const sheetId = iso3ToSheetIdMap[iso3];
  if (!sheetId && sheetId !== 0) {
    return {};
  }

  const body = await fetch(
    `https://docs.google.com/spreadsheets/d/${id}/export?format=${format}&id=${id}&gid=${sheetId}&ndplr=1`
  ).then((body: any) => body.text());

  console.log("body", body);

  const bodyArray = body.split(/\n/i);
  // All the titles are in the first row of data and the values follow
  const valuesArray = bodyArray.slice(1);
  const titlesArray = bodyArray
    .slice(0, 1)
    .map((titles: any) => titles.replace("\r", "").split("\t"))
    .reduce((a: any, c: any) => [...a, c]);

  console.log("titles", titlesArray);

  const lineEntries = valuesArray
    .map((item: any) => item.replace("\r", "").split("\t"))
    .map((entry: any) => {
      console.log("entry", entry);
      return entry;
    });
  console.log("lineEntries", lineEntries);

  // @ts-ignore
  const sections: any = Object.values(
    lineEntries.reduce(
      (a: any, c: any) => ({
        ...a,
        [c.section]: {
          screen: c.section,
          source: c.section,
          name: c.section_name,
          screens: []
        }
      }),
      {}
    )
  ).reduce((a: any, c) => [...a, c], []);

  lineEntries
    .map((e: any) => ({
      name: e.name,
      locked: JSON.parse(e.locked),
      link: `http://${e.url}`,
      screen: e.tile_image,
      isWebview: e.url !== "native",
      source: e.tile_image,
      section: e.section
    }))
    .forEach((entry: any) =>
      sections
        .find((s: any) => {
          return entry.section === s.screen;
        })
        .screens.push(entry)
    );

  console.log("sections", sections);

  return sections;
};

export default getTranslationSheetData;

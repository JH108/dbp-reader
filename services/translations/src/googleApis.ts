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
  const valuesArray = bodyArray.slice(1);
  const titlesArray = bodyArray
    .slice(0, 1)
    .map((titles: any) => titles.replace("\r", "").split("\t"))
    .reduce((a: any, c: any) => [...a, c]);

  const lineEntries = valuesArray
    .map((item: any) => item.replace("\r", "").split("\t"))
    .map((entry: any) => ({
      [titlesArray[0]]: entry[0],
      [titlesArray[1]]: entry[1],
      [titlesArray[2]]: entry[2],
      [titlesArray[3]]: entry[3],
      [titlesArray[4]]: entry[4].toLowerCase(),
      [titlesArray[5]]: entry[5]
    }));
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

  console.log("sections", sections);

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

# Goal

- Set the active font family based on the active version
- First version to implement is Kurdish Behdini

## Steps

- Define the font in the `theme_config/font.json` file and on the `font` object in `themes.js` line 20.
- When the version is changed also fetch the `.ttf` file from the server either before the text or just after. You can use [webfontloader](https://www.npmjs.com/package/webfontloader) to load your hosted font, example is below. Alternatively you can import the fonts like the other google fonts on line 19 of `variables.scss`; this would be simpler than using [webfontloader](https://www.npmjs.com/package/webfontloader), but would have some slight performance implications.

  ```javascript
  WebFont.load({
  	google: {
  		families: ['font-family-for-kurdish-behdini'],
  	},
  });
  ```

- Call `applyFontFamily` from `themes.js` with the key in the `fonts` map that will select the new font.
- Change the `fontFamily` back to the cached version once the version changes, unless the next version also has a new font

## Development Needed

- Create saga for fetching a `.ttf` file based on the active version
- Add logic for when to fetch the `.ttf`
  - This should probably go in `handleVersionListClick` that starts on line 171 in `app/components/VersionList/index.js`
  - Needs to dispatch the appropriate action once a version that has a `.ttf` is selected

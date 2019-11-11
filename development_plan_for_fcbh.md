# Goal

- Set the active font family based on the active version
- First version to implement is Kurdish Behdini

## Steps

- When the version is changed also fetch the `.ttf` file from the server either before the text or just after
- Call `applyFontFamily` from `themes.js` with the path to the `.ttf` as its only parameter
- Change the `fontFamily` back to the cached version once the version changes, unless the next version also has a new font

## Development Needed

- Create saga for fetching a `.ttf` file based on the active version
- Add logic for when to fetch the `.ttf`
  - This should probably go in `handleVersionListClick` that starts on line 171 in `app/components/VersionList/index.js`
  - Needs to dispatch the appropriate action once a version that has a `.ttf` is selected

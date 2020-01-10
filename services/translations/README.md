# Translations Module for the DBP-Reader

## Important Links

The URL where the translations are currently stored. The first approach will have all translations hosted in a Google Sheet, future development could include using an API to access translation files from a database.

- [Base Url](https://docs.google.com/spreadsheets/d/1KjetxTRxmwStF54tM76CfkFEV042_MSstfF8_fzRBX8/edit#gid=1495712534)

## Goals

1. Increase the speed of adding new translations.
2. Reduce the need for code changes when adding translations.
3. Build a solid foundation for enabling users to add translations through a GUI.

## Intended Use - (CLI)

- Display all available translations
- Update an existing translation
- Add a new translation
- Update all existing translations with the new fields added in the UI

## Process

- Gather all fields used in UI into a single base JSON file
- Copy the fields from the base JSON file into a file for each available translation
- Use the existing translation information to overwrite the fields in the new translation files

## Example Usage

...

### TODO

1. Finish the project
2. Fill out example usage
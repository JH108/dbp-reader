import { createSelector } from 'reselect';

/**
 * Direct selector to the textSelection state domain
 */
const selectTextSelectionDomain = (state) => state.get('textSelection');

/**
 * Other specific selectors
 */
const selectCountries = () => createSelector(
	selectTextSelectionDomain,
	(substate) => {
		const countries = substate.get('countries');

		return countries.filter((country) => country.get('languages').size > 0);
	}
);

const selectTexts = () => createSelector(
	selectTextSelectionDomain,
	(substate) => substate.get('texts')
);

const selectLanguages = () => createSelector(
	selectTextSelectionDomain,
	(substate) => {
		const countryMap = substate.get('countries');
		const languages = substate.get('languages');
		const activeCountry = substate.get('activeCountryName');
		const activeCountryLanguages = countryMap.getIn([activeCountry, 'languages']);

		if (activeCountryLanguages && activeCountry !== 'ANY') {
			return languages.filter((language) => activeCountryLanguages.has(language.get('iso_code')));
		}
		return languages;
	}
);

/**
 * Default selector used by TextSelection
 */

const makeSelectTextSelection = () => createSelector(
	selectTextSelectionDomain,
	(substate) => substate.toJS()
);

export default makeSelectTextSelection;
export {
	selectTextSelectionDomain,
	selectTexts,
	selectLanguages,
	selectCountries,
};

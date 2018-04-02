/*
 *
 * HomePage constants
 *
 */

export const GET_CHAPTER_TEXT = 'app/HomePage/GET_CHAPTER_TEXT';
export const GET_HIGHLIGHTS = 'app/HomePage/GET_HIGHLIGHTS';
export const LOAD_CHAPTER_TEXT = 'app/HomePage/LOAD_CHAPTER_TEXT';
export const LOAD_HIGHLIGHTS = 'app/HomePage/LOAD_HIGHLIGHTS';
export const SET_ACTIVE_BOOK_NAME = 'app/HomePage/SET_ACTIVE_BOOK_NAME';
export const SET_ACTIVE_CHAPTER = 'app/HomePage/SET_ACTIVE_CHAPTER';
export const SET_ACTIVE_NOTES_VIEW = 'app/HomePage/SET_ACTIVE_NOTES_VIEW';
export const TOGGLE_CHAPTER_SELECTION = 'app/HomePage/TOGGLE_CHAPTER_SELECTION';
export const TOGGLE_SETTINGS_MODAL = 'app/HomePage/TOGGLE_SETTINGS_MODAL';
export const TOGGLE_SEARCH_MODAL = 'app/HomePage/TOGGLE_SEARCH_MODAL';
export const TOGGLE_NOTES_MODAL = 'app/HomePage/TOGGLE_NOTES_MODAL';
// export const TOGGLE_MENU_BAR = 'app/HomePage/TOGGLE_MENU_BAR';
export const TOGGLE_PROFILE = 'app/HomePage/TOGGLE_PROFILE';
export const TOGGLE_VERSION_SELECTION = 'app/HomePage/TOGGLE_VERSION_SELECTION';
export const TOGGLE_INFORMATION_MODAL = 'app/HomePage/TOGGLE_INFORMATION_MODAL';
export const TOGGLE_FIRST_LOAD_TEXT_SELECTION = 'app/HomePage/TOGGLE_FIRST_LOAD_TEXT_SELECTION';
export const ACTIVE_TEXT_ID = 'app/HomePage/ACTIVE_TEXT_ID';
export const LOAD_BOOKS = 'app/TextSelection/LOAD_BOOKS';
export const LOAD_AUDIO = 'app/TextSelection/LOAD_AUDIO';
export const GET_BOOKS = 'app/TextSelection/GET_BIBLES_BOOKS';
export const GET_AUDIO = 'app/TextSelection/GET_AUDIO';
export const SET_SELECTED_BOOK_NAME = 'app/TextSelection/SET_SELECTED_BOOK_NAME';
export const SET_ACTIVE_NOTE = 'app/Notes/SET_ACTIVE_NOTE';
export const UPDATE_THEME = 'app/Settings/UPDATE_THEME';
export const UPDATE_FONT_TYPE = 'app/Settings/UPDATE_FONT_TYPE';
export const UPDATE_FONT_SIZE = 'app/Settings/UPDATE_FONT_SIZE';
export const TOGGLE_READERS_MODE = 'app/Settings/TOGGLE_READERS_MODE';
export const TOGGLE_CROSS_REFERENCES = 'app/Settings/TOGGLE_CROSS_REFERENCES';
export const TOGGLE_RED_LETTER = 'app/Settings/TOGGLE_RED_LETTER';
export const TOGGLE_JUSTIFIED_TEXT = 'app/Settings/TOGGLE_JUSTIFIED_TEXT';
export const TOGGLE_ONE_VERSE_PER_LINE = 'app/Settings/TOGGLE_ONE_VERSE_PER_LINE';
export const TOGGLE_VERTICAL_SCROLLING = 'app/Settings/TOGGLE_VERTICAL_SCROLLING';
export const UPDATE_SELECTED_TEXT = 'app/HomePage/UPDATE_SELECTED_TEXT';
export const INIT_APPLICATION = 'app/HomePage/INIT_APPLICATION';
export const TOGGLE_SETTINGS_OPTION = 'app/HomePage/TOGGLE_SETTINGS_OPTION';
export const TOGGLE_SETTINGS_OPTION_AVAILABILITY = 'app/HomePage/TOGGLE_SETTINGS_OPTION_AVAILABILITY';
export const ADD_HIGHLIGHTS = 'app/HomePage/ADD_HIGHLIGHTS';
export const TOGGLE_AUTOPLAY = 'app/HomePage/TOGGLE_AUTOPLAY';

export const languageToNameTable = {
	af: 'Afrikaans',
	sq: 'Albanian',
	ar: 'Arabic (Standard)',
	'ar-dz': 'Arabic (Algeria)',
	'ar-bh': 'Arabic (Bahrain)',
	'ar-eg': 'Arabic (Egypt)',
	'ar-iq': 'Arabic (Iraq)',
	'ar-jo': 'Arabic (Jordan)',
	'ar-kw': 'Arabic (Kuwait)',
	'ar-lb': 'Arabic (Lebanon)',
	'ar-ly': 'Arabic (Libya)',
	'ar-ma': 'Arabic (Morocco)',
	'ar-om': 'Arabic (Oman)',
	'ar-qa': 'Arabic (Qatar)',
	'ar-sa': 'Arabic (Saudi Arabia)',
	'ar-sy': 'Arabic (Syria)',
	'ar-tn': 'Arabic (Tunisia)',
	'ar-ae': 'Arabic (U.A.E.)',
	'ar-ye': 'Arabic (Yemen)',
	// ar: 'Aragonese',
	hy: 'Armenian',
	as: 'Assamese',
	ast: 'Asturian',
	az: 'Azerbaijani',
	eu: 'Basque',
	bg: 'Bulgarian',
	be: 'Belarusian',
	bn: 'Bengali',
	bs: 'Bosnian',
	br: 'Breton',
	my: 'Burmese',
	ca: 'Catalan',
	ch: 'Chamorro',
	ce: 'Chechen',
	zh: 'Chinese',
	'zh-hk': 'Chinese (Hong Kong)',
	'zh-cn': 'Chinese (PRC)',
	'zh-sg': 'Chinese (Singapore)',
	'zh-tw': 'Chinese (Taiwan)',
	cv: 'Chuvash',
	co: 'Corsican',
	cr: 'Cree',
	hr: 'Croatian',
	cs: 'Czech',
	da: 'Danish',
	nl: 'Dutch (Standard)',
	'nl-be': 'Dutch (Belgian)',
	en: 'English',
	'en-au': 'English (Australia)',
	'en-bz': 'English (Belize)',
	'en-ca': 'English (Canada)',
	'en-ie': 'English (Ireland)',
	'en-jm': 'English (Jamaica)',
	'en-nz': 'English (New Zealand)',
	'en-ph': 'English (Philippines)',
	'en-za': 'English (South Africa)',
	'en-tt': 'English (Trinidad & Tobago)',
	'en-gb': 'English (United Kingdom)',
	'en-us': 'English (United States)',
	'en-zw': 'English (Zimbabwe)',
	eo: 'Esperanto',
	et: 'Estonian',
	fo: 'Faeroese',
	// fa: 'Farsi',
	fj: 'Fijian',
	fi: 'Finnish',
	fr: 'French (Standard)',
	'fr-be': 'French (Belgium)',
	'fr-ca': 'French (Canada)',
	'fr-fr': 'French (France)',
	'fr-lu': 'French (Luxembourg)',
	'fr-mc': 'French (Monaco)',
	'fr-ch': 'French (Switzerland)',
	fy: 'Frisian',
	fur: 'Friulian',
	// gd: 'Gaelic (Scots)',
	'gd-ie': 'Gaelic (Irish)',
	gl: 'Galacian',
	ka: 'Georgian',
	de: 'German (Standard)',
	'de-at': 'German (Austria)',
	'de-de': 'German (Germany)',
	'de-li': 'German (Liechtenstein)',
	'de-lu': 'German (Luxembourg)',
	'de-ch': 'German (Switzerland)',
	el: 'Greek',
	gu: 'Gujurati',
	ht: 'Haitian',
	he: 'Hebrew',
	hi: 'Hindi',
	hu: 'Hungarian',
	is: 'Icelandic',
	id: 'Indonesian',
	iu: 'Inuktitut',
	ga: 'Irish',
	it: 'Italian (Standard)',
	'it-ch': 'Italian (Switzerland)',
	ja: 'Japanese',
	kn: 'Kannada',
	ks: 'Kashmiri',
	kk: 'Kazakh',
	km: 'Khmer',
	ky: 'Kirghiz',
	tlh: 'Klingon',
	ko: 'Korean',
	'ko-kp': 'Korean (North Korea)',
	'ko-kr': 'Korean (South Korea)',
	la: 'Latin',
	lv: 'Latvian',
	lt: 'Lithuanian',
	lb: 'Luxembourgish',
	mk: 'FYRO Macedonian',
	ms: 'Malay',
	ml: 'Malayalam',
	mt: 'Maltese',
	mi: 'Maori',
	mr: 'Marathi',
	mo: 'Moldavian',
	nv: 'Navajo',
	ng: 'Ndonga',
	ne: 'Nepali',
	no: 'Norwegian',
	nb: 'Norwegian (Bokmal)',
	nn: 'Norwegian (Nynorsk)',
	oc: 'Occitan',
	or: 'Oriya',
	om: 'Oromo',
	fa: 'Persian',
	'fa-ir': 'Persian/Iran',
	pl: 'Polish',
	pt: 'Portuguese',
	'pt-br': 'Portuguese (Brazil)',
	pa: 'Punjabi',
	'pa-in': 'Punjabi (India)',
	'pa-pk': 'Punjabi (Pakistan)',
	qu: 'Quechua',
	rm: 'Rhaeto-Romanic',
	ro: 'Romanian',
	'ro-mo': 'Romanian (Moldavia)',
	ru: 'Russian',
	'ru-mo': 'Russian (Moldavia)',
	sz: 'Sami (Lappish)',
	sg: 'Sango',
	sa: 'Sanskrit',
	sc: 'Sardinian',
	gd: 'Scots Gaelic',
	sd: 'Sindhi',
	si: 'Singhalese',
	sr: 'Serbian',
	sk: 'Slovak',
	sl: 'Slovenian',
	so: 'Somani',
	sb: 'Sorbian',
	es: 'Spanish',
	'es-ar': 'Spanish (Argentina)',
	'es-bo': 'Spanish (Bolivia)',
	'es-cl': 'Spanish (Chile)',
	'es-co': 'Spanish (Colombia)',
	'es-cr': 'Spanish (Costa Rica)',
	'es-do': 'Spanish (Dominican Republic)',
	'es-ec': 'Spanish (Ecuador)',
	'es-sv': 'Spanish (El Salvador)',
	'es-gt': 'Spanish (Guatemala)',
	'es-hn': 'Spanish (Honduras)',
	'es-mx': 'Spanish (Mexico)',
	'es-ni': 'Spanish (Nicaragua)',
	'es-pa': 'Spanish (Panama)',
	'es-py': 'Spanish (Paraguay)',
	'es-pe': 'Spanish (Peru)',
	'es-pr': 'Spanish (Puerto Rico)',
	'es-es': 'Spanish (Spain)',
	'es-uy': 'Spanish (Uruguay)',
	'es-ve': 'Spanish (Venezuela)',
	sx: 'Sutu',
	sw: 'Swahili',
	sv: 'Swedish',
	'sv-fi': 'Swedish (Finland)',
	'sv-sv': 'Swedish (Sweden)',
	ta: 'Tamil',
	tt: 'Tatar',
	te: 'Teluga',
	th: 'Thai',
	tig: 'Tigre',
	ts: 'Tsonga',
	tn: 'Tswana',
	tr: 'Turkish',
	tk: 'Turkmen',
	uk: 'Ukrainian',
	hsb: 'Upper Sorbian',
	ur: 'Urdu',
	ve: 'Venda',
	vi: 'Vietnamese',
	vo: 'Volapuk',
	wa: 'Walloon',
	cy: 'Welsh',
	xh: 'Xhosa',
	ji: 'Yiddish',
	zu: 'Zulu',
};

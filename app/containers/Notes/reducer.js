/*
 *
 * Notes reducer
 *
 */

import { fromJS } from 'immutable';
import {
	LOAD_USER_NOTES,
} from 'containers/Profile/constants';
import {
	SET_ACTIVE_CHILD,
	TOGGLE_VERSE_TEXT,
	TOGGLE_ADD_VERSE_MENU,
	SET_ACTIVE_PAGE_DATA,
	SET_PAGE_SIZE,
	TOGGLE_PAGE_SELECTOR,
	initialNotesListForTesting,
} from './constants';

const initialState = fromJS({
	activeChild: 'notes',
	// activePageData: [],
	activePageData: initialNotesListForTesting.slice(0, 10),
	// listData: [],
	listData: initialNotesListForTesting,
	isAddVerseExpanded: false,
	isVerseTextVisible: false,
	pageSelectorState: false,
	paginationPageSize: 10,
});

function notesReducer(state = initialState, action) {
	switch (action.type) {
	case SET_ACTIVE_CHILD:
		return state.set('activeChild', action.child);
	case TOGGLE_VERSE_TEXT:
		return state.set('isVerseTextVisible', !state.get('isVerseTextVisible'));
	case TOGGLE_ADD_VERSE_MENU:
		return state.set('isAddVerseExpanded', !state.get('isAddVerseExpanded'));
	case SET_ACTIVE_PAGE_DATA:
		return state.set('activePageData', action.page);
	case SET_PAGE_SIZE:
		return state.set('paginationPageSize', action.size);
	case TOGGLE_PAGE_SELECTOR:
		return state.set('pageSelectorState', !state.get('pageSelectorState'));
	case LOAD_USER_NOTES:
		return state.set('listData', action.noteData);
	default:
		return state;
	}
}

export default notesReducer;
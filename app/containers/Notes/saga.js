import { take, cancel, takeLatest, call, put } from 'redux-saga/effects';
import request from 'utils/request';
import { LOCATION_CHANGE } from 'react-router-redux';
import {
	ADD_NOTE,
	ADD_NOTE_SUCCESS,
	UPDATE_NOTE,
	DELETE_NOTE,
	LOAD_USER_NOTES,
	GET_USER_NOTES,
	GET_CHAPTER_FOR_NOTE,
	LOAD_CHAPTER_FOR_NOTE,
	SET_ACTIVE_PAGE_DATA,
	SET_PAGE_SIZE,
} from './constants';

export function* getChapterForNote({ note }) {
	// console.log(note);
	const chapter = note.chapter;
	const bibleId = note.bible_id;
	const bookId = note.book_id;
	const reqUrl = `https://api.bible.build/bibles/${bibleId}/${bookId}/${chapter}?bucket=${process.env.DBP_BUCKET_ID}&key=${process.env.DBP_API_KEY}&v=4&book_id=${bookId}&chapter_id=${chapter}`;

	try {
		const response = yield call(request, reqUrl);
		// console.log(response);

		yield put({ type: LOAD_CHAPTER_FOR_NOTE, text: response.data.filter((v) => v.verse_start <= note.verse_end && v.verse_start >= note.verse_start) });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('error getting chapter for note', err); // eslint-disable-line no-console
		}
	}
}
// TODO: Figure out a way to get new notes after a user has added/deleted/updated to their notebook
export function* updateNote({ userId, data }) {
	const requestUrl = `https://api.bible.build/users/${userId}/notes?key=${process.env.DBP_API_KEY}&v=4&pretty&project_id=${process.env.NOTES_PROJECT_ID}`;
	const formData = new FormData();

	Object.entries(data).forEach((item) => formData.set(item[0], item[1]));
	// formData.append('project_id', process.env.NOTES_PROJECT_ID);

	const options = {
		body: formData,
		method: 'PUT',
	};
	// console.log('updating note with', data, '\nfor this id', userId);
	try {
		const response = yield call(request, requestUrl, options);
		// console.log('update user note response', response);
		if (response.success) {
			yield put({ type: ADD_NOTE_SUCCESS, response });
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

export function* deleteNote({ userId, noteId }) {
	const requestUrl = `https://api.bible.build/users/${userId}/notes?key=${process.env.DBP_API_KEY}&v=4&pretty&note_id=${noteId}&project_id=${process.env.NOTES_PROJECT_ID}`;
	const options = {
		method: 'DELETE',
	};
	// console.log('deleting note for userid and noteid', userId, noteId);
	try {
		const response = yield call(request, requestUrl, options);

		if (response.success) {
			// console.log('successfully deleted note!', response);
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	 header: 'POST',
			// 	 body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}
// Probably need a getBookmarks function
export function* getNotes({ userId, params = {} }) {
	// Need to adjust how I paginate the notes here and in other places as well
	// response.current_page = activePage
	// response.per_page = perPage
	// pages = totalPages
	// notes = response.data
	const requestUrl = `https://api.bible.build/users/${userId}/notes?key=${process.env.DBP_API_KEY}&v=4&pretty&project_id=${process.env.NOTES_PROJECT_ID}`;
	const urlWithParams = Object.entries(params).reduce((acc, param) => acc.concat(`&${param[0]}=${param[1]}`), requestUrl);
	// console.log('params given to get note saga', params);
	// // console.log('with params', urlWithParams);
	// console.trace();
	try {
		const response = yield call(request, urlWithParams);
		// const noteData = {
		// 	notes: response.data,
		// 	page: response.current_page,
		// 	pageSize: response.per_page,
		// 	pages: response.total,
		// };
		// console.log('get note response current page, last page and per page', response.current_page, response.last_page, response.per_page);

		yield put({
			type: LOAD_USER_NOTES,
			listData: response.data,
			activePage: response.current_page,
			totalPages: response.last_page,
			pageSize: response.per_page,
		});
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

// Add bookmark is separate and is in the homepage saga file
export function* addNote({ userId, data }) {
	const requestUrl = `https://api.bible.build/users/${userId}/notes?key=${process.env.DBP_API_KEY}&v=4&pretty&project_id=${process.env.NOTES_PROJECT_ID}`;
	const formData = new FormData();

	Object.entries(data).forEach((item) => formData.set(item[0], item[1]));
	// formData.append('project_id', process.env.NOTES_PROJECT_ID);

	const options = {
		body: formData,
		method: 'POST',
	};
	// console.log('Adding note for userid', userId, '\nwith data', data);
	try {
		const response = yield call(request, requestUrl, options);
		// console.log('add user note response', response);
		if (response.success) {
			yield put({ type: ADD_NOTE_SUCCESS, response });
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

// Individual exports for testing
export default function* notesSaga() {
	const addNoteSaga = yield takeLatest(ADD_NOTE, addNote);
	const getNotesSaga = yield takeLatest(GET_USER_NOTES, getNotes);
	const updateNoteSaga = yield takeLatest(UPDATE_NOTE, updateNote);
	const deleteNoteSaga = yield takeLatest(DELETE_NOTE, deleteNote);
	const getChapterSaga = yield takeLatest(GET_CHAPTER_FOR_NOTE, getChapterForNote);
	const setPageSize = yield takeLatest(SET_PAGE_SIZE, getNotes);
	const setActivePage = yield takeLatest(SET_ACTIVE_PAGE_DATA, getNotes);
	// console.log('Loaded notes saga');
	yield take(LOCATION_CHANGE);
	yield cancel(addNoteSaga);
	yield cancel(getNotesSaga);
	yield cancel(getChapterSaga);
	yield cancel(updateNoteSaga);
	yield cancel(deleteNoteSaga);
	yield cancel(setPageSize);
	yield cancel(setActivePage);
}

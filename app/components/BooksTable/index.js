/**
 *
 * BooksTable
 *
 */

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { getChapterText } from '../../containers/HomePage/actions';
import LoadingSpinner from '../LoadingSpinner';
import ChaptersContainer from '../ChaptersContainer';
import {
	selectAuthenticationStatus,
	selectUserId,
	selectAudioType,
} from '../../containers/HomePage/selectors';
import {
	selectActiveTextId,
	selectBooks,
	selectActiveBookName,
	selectActiveChapter,
	selectAudioObjects,
	selectHasTextInDatabase,
	selectFilesetTypes,
	selectLoadingBookStatus,
} from './selectors';

class BooksTable extends React.PureComponent {
	// eslint-disable-line react/prefer-stateless-function
	state = {
		selectedBookName:
			this.props.initialBookName || this.props.activeBookName || '',
		updateScrollTop: false,
	};

	componentDidMount() {
		if (this.button && this.container) {
			this.container.scrollTop = this.button.offsetTop - 54 - 10;
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.active !== this.props.active && nextProps.active) {
			this.setState({ selectedBookName: nextProps.activeBookName });
		}
	}

	getChapterText = ({ bible, book, chapter }) =>
		this.props.dispatch(
			getChapterText({
				bible,
				book,
				chapter,
				audioObjects: this.props.audioObjects,
				hasTextInDatabase: this.props.hasTextInDatabase,
				formattedText: this.props.filesetTypes.text_formatt,
				userId: this.props.userId,
				userAuthenticated: this.props.userAuthenticated,
			}),
		);

	setScrollTop = (book, positionBefore, scrollTopBefore) => {
		const positionAfter = book.parentElement.offsetTop; // not sure about parentElement

		if (positionBefore > positionAfter) {
			const newScrollTop = scrollTopBefore - (positionBefore - positionAfter);

			this.container.scrollTop = newScrollTop;
		}
	};

	handleBookClick = (e, name) => {
		typeof e.persist === 'function' && e.persist(); // eslint-disable-line no-unused-expressions
		const positionBefore = e.target.parentElement.offsetTop;
		const scrollTopBefore = this.container.scrollTop;

		if (this.state.selectedBookName === name) {
			this.setState(
				() => ({
					selectedBookName: '',
				}),
				() => {
					this.setScrollTop(e.target);
				},
			);
		} else {
			this.setState(
				() => ({
					selectedBookName: name,
				}),
				() => {
					this.setScrollTop(e.target, positionBefore, scrollTopBefore);
				},
			);
		}
	};

	isElementInViewport = (el) => {
		const rect = el.getBoundingClientRect();

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <=
				(window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	};

	handleChapterClick = () => {
		this.props.closeBookTable();
	};

	handleRef = (el, name) => {
		this[name] = el;
	};

	render() {
		const {
			books,
			audioType,
			activeTextId,
			activeChapter,
			activeBookName,
			loadingBooks,
		} = this.props;
		const { selectedBookName } = this.state;

		if (loadingBooks) {
			return <LoadingSpinner />;
		}
		return (
			<div className="chapter-selection-section">
				<div
					ref={(el) => this.handleRef(el, 'container')}
					className="book-container"
				>
					{books.get('OT')
						? [
								<div key={'ot_title_key'} className={'testament-title'}>
									<h3>Old Testament</h3>
								</div>,
								books.get('OT') &&
									books.get('OT').map((book) => (
										<div
											className={'book-button'}
											ref={
												(book.get('name') || book.get('name_short')) ===
												selectedBookName
													? (el) => this.handleRef(el, 'button')
													: null
											}
											key={(book.get('name') || book.get('name_short')).concat(
												book.get('book_id'),
											)}
											id={(book.get('name') || book.get('name_short')).concat(
												book.get('book_id'),
											)}
											onClick={(e) =>
												this.handleBookClick(
													e,
													book.get('name') || book.get('name_short'),
												)
											}
										>
											<h4
												className={
													(book.get('name') || book.get('name_short')) ===
													selectedBookName
														? 'active-book'
														: ''
												}
											>
												{book.get('name') || book.get('name_short')}
											</h4>
											<ChaptersContainer
												bookName={book.get('name')}
												audioType={audioType}
												bookNameShort={book.get('name_short')}
												activeTextId={activeTextId}
												activeChapter={activeChapter}
												handleChapterClick={this.handleChapterClick}
												chapters={book.get('chapters')}
												selectedBookName={selectedBookName}
												activeBookName={activeBookName}
												bookId={book.get('book_id')}
												book={book}
											/>
										</div>
									)),
						  ]
						: null}
					{books.get('NT')
						? [
								<div key={'nt_title_key'} className={'testament-title'}>
									<h3>New Testament</h3>
								</div>,
								books.get('NT').map((book) => (
									<div
										className={'book-button'}
										ref={
											(book.get('name') || book.get('name_short')) ===
											selectedBookName
												? (el) => this.handleRef(el, 'button')
												: null
										}
										key={(book.get('name') || book.get('name_short')).concat(
											book.get('book_id'),
										)}
										id={(book.get('name') || book.get('name_short')).concat(
											book.get('book_id'),
										)}
										onClick={(e) =>
											this.handleBookClick(
												e,
												book.get('name') || book.get('name_short'),
											)
										}
									>
										<h4
											className={
												(book.get('name') || book.get('name_short')) ===
												selectedBookName
													? 'active-book'
													: ''
											}
										>
											{book.get('name') || book.get('name_short')}
										</h4>
										<ChaptersContainer
											bookName={book.get('name')}
											audioType={audioType}
											bookNameShort={book.get('name_short')}
											activeTextId={activeTextId}
											activeChapter={activeChapter}
											handleChapterClick={this.handleChapterClick}
											chapters={book.get('chapters')}
											selectedBookName={selectedBookName}
											activeBookName={activeBookName}
											bookId={book.get('book_id')}
											book={book}
										/>
									</div>
								)),
						  ]
						: null}
					{books.get('AP')
						? [
								<div key={'ap_title_key'} className={'testament-title'}>
									<h3>Apocrypha</h3>
								</div>,
								books.get('AP').map((book) => (
									<div
										className={'book-button'}
										ref={
											(book.get('name') || book.get('name_short')) ===
											selectedBookName
												? (el) => this.handleRef(el, 'button')
												: null
										}
										key={(book.get('name') || book.get('name_short')).concat(
											book.get('book_id'),
										)}
										id={(book.get('name') || book.get('name_short')).concat(
											book.get('book_id'),
										)}
										onClick={(e) =>
											this.handleBookClick(
												e,
												book.get('name') || book.get('name_short'),
											)
										}
									>
										<h4
											className={
												(book.get('name') || book.get('name_short')) ===
												selectedBookName
													? 'active-book'
													: ''
											}
										>
											{book.get('name') || book.get('name_short')}
										</h4>
										<ChaptersContainer
											bookName={book.get('name')}
											audioType={audioType}
											bookNameShort={book.get('name_short')}
											activeTextId={activeTextId}
											activeChapter={activeChapter}
											handleChapterClick={this.handleChapterClick}
											chapters={book.get('chapters')}
											selectedBookName={selectedBookName}
											activeBookName={activeBookName}
											bookId={book.get('book_id')}
											book={book}
										/>
									</div>
								)),
						  ]
						: null}
				</div>
			</div>
		);
	}
}

BooksTable.propTypes = {
	dispatch: PropTypes.func,
	closeBookTable: PropTypes.func,
	books: PropTypes.object,
	audioObjects: PropTypes.array,
	userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	audioType: PropTypes.string,
	activeTextId: PropTypes.string,
	activeBookName: PropTypes.string,
	initialBookName: PropTypes.string,
	activeChapter: PropTypes.number,
	loadingBooks: PropTypes.bool,
	userAuthenticated: PropTypes.bool,
	hasTextInDatabase: PropTypes.bool,
	active: PropTypes.bool,
	filesetTypes: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
	books: selectBooks(),
	activeTextId: selectActiveTextId(),
	activeBookName: selectActiveBookName(),
	activeChapter: selectActiveChapter(),
	audioObjects: selectAudioObjects(),
	hasTextInDatabase: selectHasTextInDatabase(),
	filesetTypes: selectFilesetTypes(),
	loadingBooks: selectLoadingBookStatus(),
	userAuthenticated: selectAuthenticationStatus(),
	userId: selectUserId(),
	audioType: selectAudioType(),
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

const withConnect = connect(
	mapStateToProps,
	mapDispatchToProps,
);

export default compose(withConnect)(BooksTable);

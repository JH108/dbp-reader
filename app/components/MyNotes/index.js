/**
*
* MyNotes
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import matchSorter from 'match-sorter';
import { Link } from 'react-router-dom';
import SvgWrapper from 'components/SvgWrapper';
import Pagination from 'components/Pagination';
import PageSizeSelector from 'components/PageSizeSelector';
// import styled from 'styled-components';
class MyNotes extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
	state = {
		// Need to reset this once user goes from notes to bookmarks
		filterText: '',
	}
	// Need this for when a user has edited a note and come back here
	componentDidMount() {
		if (this.props.sectionType === 'notes') {
			this.props.getNotes({ limit: this.props.pageSize, page: this.props.activePage });
		}
	}

	// componentDidUpdate() {
	// 	console.log('Component updated');
	// }

	// componentWillReceiveProps(nextProps) {
	// 	if (this.props.pageSize !== nextProps.pageSize || this.props.activePage !== nextProps.activePage) {
	// 		console.log('There were differences');
	// 		this.props.getNotes({ limit: nextProps.pageSize, page: nextProps.activePage });
	// 	}
	// }

	getNoteReference(listItem) {
		const verseRef = listItem.verse_end && !(listItem.verse_end === listItem.verse_start) ? `${listItem.verse_start}-${listItem.verse_end}` : listItem.verse_start;
		const { vernacularNamesObject } = this.props;

		return `${vernacularNamesObject[listItem.book_id]} ${listItem.chapter}:${verseRef} - (${listItem.bible_id})`;
	}

	getFormattedNoteDate(timestamp) {
		const date = timestamp.slice(0, 10).split('-');

		return `${date[1]}.${date[2]}.${date[0].slice(2)}`;
	}

	getFilteredPageList = (pageData) => {
		const filterText = this.state.filterText;

		return matchSorter(pageData, filterText, { keys: ['notes', 'bible_id', 'book_id', 'chapter', 'verse_start', 'updated_at'] });
	}

	getFilteredHighlights = (highlights) => {
		const filterText = this.state.filterText;

		return matchSorter(highlights, filterText, { keys: ['book_id', 'chapter', 'verse_start'] });
	}

	getHighlightReference = (h) => `${h.bible_id} - ${h.book_id} - ${h.chapter}:${h.verse_start === h.verse_end || !h.verse_end ? h.verse_start : `${h.verse_start}-${h.verse_end}`} - (${h.bible_id})`

	handleSearchChange = (e) => this.setState({ filterText: e.target.value })

	handlePageClick = (page) => this.props.setActivePage({ limit: this.props.pageSize, page });

	handleClick = (listItem) => {
		if (this.props.sectionType === 'notes') {
			this.props.setActiveNote({ note: listItem });
			this.props.setActiveChild('edit');
		}
	}

	handleSettingPageSize = (pageSize) => this.props.setPageSize({ limit: pageSize, page: 1 })

	render() {
		const {
			sectionType,
			listData,
			highlights,
			activePage,
			pageSize,
			totalPages,
			pageSelectorState,
			togglePageSelector,
		} = this.props;
		const filteredPageData = sectionType === 'highlights' ? this.getFilteredHighlights(highlights) : this.getFilteredPageList(listData);
		// console.log(this.getFilteredPageList(activePageData));
		// console.log(highlights);
		// console.log(this.props);
		// Use concept like this to enhance modularity
		// const dataTypes = {
		// 	highlights,
		// 	notes: listData,
		// 	bookmarks: [],
		// };
		// const dataToMap = dataTypes[sectionType];
		// console.log('highlights in my notes', highlights);
		// console.log('active page data', activePageData);
		// console.log('list data', listData);

		return (
			<div className="list-sections">
				<div className="searchbar">
					<span className={'input-wrapper'}>
						<SvgWrapper className={'icon'} svgid={'search'} />
						<input onChange={this.handleSearchChange} value={this.state.filterText} placeholder={`SEARCH ${sectionType.toUpperCase()}`} />
					</span>
				</div>
				<section className="note-list">
					{
						sectionType === 'notes' ? (
							filteredPageData.map((listItem) => (
								<div role="button" tabIndex={0} onClick={() => this.handleClick(listItem)} key={listItem.id} className="list-item">
									<div className="date">{this.getFormattedNoteDate(listItem.created_at)}</div>
									<div className="title-text">
										<h4 className="title">{this.getNoteReference(listItem)}</h4>
										<p className="text">{listItem.notes}</p>
									</div>
								</div>
							))
						) : null
					}
					{
						sectionType === 'highlights' ? filteredPageData.map((highlight) => (
							<Link to={`/${highlight.bible_id}/${highlight.book_id}/${highlight.chapter}/${highlight.verse_start}`} role="button" tabIndex={0} key={highlight.id} className="list-item">
								<div className="title-text">
									<h4 className="title">{this.getHighlightReference(highlight)}</h4>
								</div>
							</Link>
						)) : null
					}
					{
						sectionType === 'bookmarks' ? (
							filteredPageData.filter((n) => n.bookmark)).map((listItem) => (
								<Link to={`/${listItem.bible_id}/${listItem.book_id}/${listItem.chapter}/${listItem.verse_start}`} role="button" tabIndex={0} key={listItem.id} className="list-item">
									<div className="date">{this.getFormattedNoteDate(listItem.created_at)}</div>
									<div className="title-text">
										<h4 className="title">{this.getNoteReference(listItem)}</h4>
									</div>
								</Link>
						)) : null
					}
				</section>
				<div className="pagination">
					<Pagination
						onChangePage={this.handlePageClick}
						activePage={activePage}
						totalPages={totalPages}
					/>
					<PageSizeSelector togglePageSelector={togglePageSelector} pageSelectorState={pageSelectorState} pageSize={pageSize} setPageSize={this.handleSettingPageSize} />
				</div>
			</div>
		);
	}
}

MyNotes.propTypes = {
	setActiveChild: PropTypes.func.isRequired,
	setActiveNote: PropTypes.func.isRequired,
	setActivePage: PropTypes.func.isRequired,
	togglePageSelector: PropTypes.func.isRequired,
	setPageSize: PropTypes.func.isRequired,
	getNotes: PropTypes.func.isRequired,
	listData: PropTypes.array.isRequired,
	highlights: PropTypes.array,
	sectionType: PropTypes.string.isRequired,
	vernacularNamesObject: PropTypes.object,
	pageSize: PropTypes.number.isRequired,
	totalPages: PropTypes.number,
	activePage: PropTypes.number,
	pageSelectorState: PropTypes.bool.isRequired,
};

export default MyNotes;

import url from './hrefLinkOrAsLink';

export default ({
	books,
	chapter,
	bookId,
	textId,
	verseNumber,
	text: chapterText,
	isHref,
}) => {
	if (verseNumber && chapterText.length) {
		const nextVerse = parseInt(verseNumber, 10) + 1 || 1;
		const lastVerse = chapterText.length;

		// Handles the verses
		if (nextVerse <= lastVerse && nextVerse > 0) {
			// The next verse is within a valid range
			return url({ textId, bookId, chapter, nextVerse, isHref });
		} else if (nextVerse < 0) {
			// The next verse is below 0 and thus invalid
			return url({ textId, bookId, chapter, nextVerse: '1', isHref });
		} else if (nextVerse > lastVerse) {
			// Next verse is above the last verse in the chapter and thus is invalid
			return url({ textId, bookId, chapter, nextVerse: lastVerse, isHref });
		}
		return url({ textId, bookId, chapter, nextVerse: verseNumber, isHref });
	} else if (verseNumber) {
		const nextVerse = parseInt(verseNumber, 10) + 1 || 1;

		if (nextVerse && nextVerse > 0) {
			// The next verse is within a valid range
			return url({ textId, bookId, chapter, nextVerse, isHref });
		} else if (nextVerse < 0) {
			// The next verse is below 0 and thus invalid

			return url({ textId, bookId, chapter, nextVerse: '1', isHref });
			// Need to find a way to do this for formatted text
			// Next verse is above the last verse in the chapter and thus is invalid
		}
		// Worst case just go back to the same verse (In hindsight this may not be the best...)
		return url({ textId, bookId, chapter, nextVerse: verseNumber, isHref });
	}

	// Handles the chapters
	const activeBook = books.find(
		(book) => book.book_id.toLowerCase() === bookId.toLowerCase(),
	);
	// This relies on the books list already being sorted in ascending book_order
	const nextBook = books.find(
		(book) =>
			book.book_order === activeBook.book_order + 1 ||
			book.book_order > activeBook.book_order,
	);
	const maxChapter = activeBook.chapters.length;
	// console.log('nextBook', nextBook);
	// If the next book in line doesn't exist and we are already at the last chapter just return
	if (!nextBook && chapter === maxChapter) {
		return url({ textId, bookId, chapter });
	}

	if (chapter === maxChapter) {
		// Need to get the first chapter of the next book
		return url({
			textId,
			bookId: nextBook.book_id,
			chapter: nextBook.chapters[0],
			isHref,
		});
	}

	const chapterIndex = activeBook.chapters.findIndex(
		(c) => c === chapter || c > chapter,
	);
	const nextChapterNumber =
		activeBook.chapters[chapterIndex] === chapter
			? activeBook.chapters[chapterIndex + 1]
			: activeBook.chapters[chapterIndex];

	return url({
		textId,
		bookId,
		chapter: nextChapterNumber,
		isHref,
	});
};

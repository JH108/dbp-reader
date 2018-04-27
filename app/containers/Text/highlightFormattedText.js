// Optional third arg for testing purposes
const createFormattedHighlights = (highlights, formattedTextString, DomCreator) => {
	// TODO: Major! If the starting index in a verse is past the end of the verse then start the highlight on the next line
	/* NOTES
	* 1. Need to subtract 1 from any addition of highlight_start + highlighted_words, this is because the result is the length not the index
	* todo check and see if this function fully supports overlapping highlights
	* */
	/* Notes on Logic for function
	* Iterate over each verse
	* Find all the highlights for a single verse
	* Apply all highlights for that verse
	* If the highlight goes past the end of the verse
	* Create a new highlight that has the update range and a start verse of the next verse in line
	* */

	// Sort the highlights
	const sortedHighlights = highlights.sort((a, b) => {
		if (a.verse_start < b.verse_start) return -1;
		if (a.verse_start > b.verse_start) return 1;
		if (a.verse_start === b.verse_start) {
			if (a.highlight_start < b.highlight_start) return -1;
			if (a.highlight_start > b.highlight_start) return 1;
		}
		return 0;
	});
	// console.log('sortedHighlights', sortedHighlights);
	try {
		// Set the env for testing purposes
		const env = process.env.NODE_ENV;
		// Instantiate the string -> html parser
		const parser = env === 'test' ? () => {} : new DOMParser();
		// console.log('XMLSerializer', typeof XMLSerializer);
		// Instantiate the html -> serializer
		const serializer = env === 'test' ? () => {} : new XMLSerializer();
		// const serializer = () => {};
		// Instantiate jsDOM for creating a mock dom (needed for testing)
		const jsDOM = env === 'test' ? new DomCreator(formattedTextString) : undefined;
		// Set the xml document based on whether this is live or a test
		const xmlDoc = env === 'test' ? jsDOM.window.document : parser.parseFromString(formattedTextString, 'text/xml');

		// Used this before getting all the data ids
		// const arrayOfVerses = [...xmlDoc.getElementsByClassName('v')];
		let charsLeftAfterVerseEnd = 0; // the number of characters that were not used in the previous highlight
		let continuingColor = ''; // the color of the last highlight
		let lastVerseNumber = 0; // the verse number of the last verse to have highlights applied

		const ad = [...xmlDoc.querySelectorAll('[data-id]')].slice(1); // Get all verse elements (the first element with data-id is a div which is why I slice at 1)

		// console.log('------------------------------------------------------------------------');

		// Iterate over all the verses
		ad.forEach((verseElement) => {
			// Get all the children
			/*
				Note node: <span class='note'><a class='footnote'>*</a></span>
				Text node: Adam and Eve had a son
				Emphasis node: <add>was</add>
				Highlight node: <em class="text-highlighted" style="...">and they called him Able</em>
			*/
			const children = verseElement.childNodes.length ? [...verseElement.childNodes] : [verseElement];
			// Parse the verse data-id to get the verse number
			const verseNumber = parseInt(verseElement.attributes['data-id'].value.split('_')[1], 10);
			const newChildren = [];
			let combinedSectionLength = 0;

			children.forEach((originalVerse) => {
				// If this is the first child and the highlight_start is greater than its length set newHighlightStart
				// Clone each node because it has to be removed and then added again to preserve the original html and add the highlight
				const verse = originalVerse.cloneNode(true);
				// Check if this child node is a note
				const isNote = (!!verse.attributes && verse.attributes.class.value === 'note');
				// Remove the child since I already cloned it
				verseElement.removeChild(originalVerse);
				// Verse already started -> need to treat it like a new verse
				const sameVerse = verseNumber === lastVerseNumber;

				// Get all of the highlights that start in this verse
				const highlightsStartingInVerse = sortedHighlights.filter((highlight) => highlight.verse_start === verseNumber);

				// Get the text for a verse (really just a section of a verse)
				let verseText = verse.textContent.split('');
				// If the highlight start is greater than this sections length
				// update the start to be highlight_start - verseText.length
				// use the new highlight start in the next section of the verse
				if (!isNote) {
				// If the node is a footnote then skip over it
					if (sameVerse && children.length > 1) {
						// console.log('Children in the same verse but more than 1 child');
						const newData = handleVerseSection({
							combinedSectionLength,
							highlightsStartingInVerse,
							charsLeftAfterVerseEnd,
							continuingColor,
							verseText,
						});

						verseText = newData.verseText;
						charsLeftAfterVerseEnd = newData.charsLeftAfterVerseEnd;
						continuingColor = newData.continuingColor;
						combinedSectionLength += newData.sectionLength;
					} else if (!sameVerse && children.length > 1) {
						// console.log('Children not in the same verse but more than 1 child');
						const newData = handleVerseSection({
							combinedSectionLength,
							highlightsStartingInVerse,
							charsLeftAfterVerseEnd,
							continuingColor,
							verseText,
						});

						verseText = newData.verseText;
						charsLeftAfterVerseEnd = newData.charsLeftAfterVerseEnd;
						continuingColor = newData.continuingColor;
						combinedSectionLength += newData.sectionLength;
					} else if (sameVerse) {
						// If the verse has the same index as the last one
						// console.log('same verse text', sameVerse);
						try {
							const newData = handleSameVerse({
								charsLeftAfterVerseEnd,
								continuingColor,
								verseText,
							});

							verseText = newData.verseText;
							charsLeftAfterVerseEnd = newData.charsLeftAfterVerseEnd;
							continuingColor = newData.continuingColor;
						} catch (e) {
							if (process.env.NODE_ENV === 'development') {
								console.warn('Error in handleNewVerse', e); // eslint-disable-line no-console
							}
						}
					} else {
						// If the node is not in the same verse as the previous one
						// console.log('new verse', verseNumber);
						try {
							const newData = handleNewVerse({
								highlightsStartingInVerse,
								charsLeftAfterVerseEnd,
								continuingColor,
								verseText,
							});

							verseText = newData.verseText;
							charsLeftAfterVerseEnd = newData.charsLeftAfterVerseEnd;
							continuingColor = newData.continuingColor;
						} catch (e) {
							if (process.env.NODE_ENV === 'development') {
								console.warn('Error in handleNewVerse', e); // eslint-disable-line no-console
							}
						}
					}
				}
				// Create a blank node to use in the case that the current node is a text node
				const newNonTextNode = xmlDoc.createElement('span');
				if (verse.nodeType === 3) {
					// this is a text node and cannot have inner html so I need a new element to be able to add the highlight
					newNonTextNode.innerHTML = verseText.join('');
				} else if (!isNote) {
					// Set the inner html for this verse - this overrides any other styling that had been inside that verse
					verse.innerHTML = verseText.join(''); // eslint-disable-line no-param-reassign
				}
				newChildren.push(verse.nodeType === 3 ? newNonTextNode : verse);
				// console.log('new inner html', verse.innerHTML);
				// Use charsLeft to highlight as much of this verse as possible, then carry its value over into the next verse
				// Save this verse number as the new 'previous verse number'
				lastVerseNumber = verseNumber;
			});

			// Append all of the updated child nodes to the original verse node
			newChildren.forEach((child) => {
				verseElement.appendChild(child);
			});
		});

		return env === 'test' ? xmlDoc.querySelectorAll('body')[0].innerHTML : serializer.serializeToString(xmlDoc);
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('Failed applying highlight to formatted text', error); // eslint-disable-line no-console
		}
		if (process.env.NODE_ENV === 'test') {
			console.log('Failed applying highlight to formatted text', error); // eslint-disable-line no-console
		}
		// If there was an error just return the text with no highlights
		return formattedTextString;
	}
};

function handleSameVerse({ verseText, charsLeftAfterVerseEnd: passedCharsLeft, continuingColor: passedColor }) {
	let charsLeftAfterVerseEnd = passedCharsLeft;
	const continuingColor = passedColor;
	// let charsLeft = charsLeftAfterVerseEnd;
	// let hStart = 0;
	// console.log('handling same verse', charsLeftAfterVerseEnd);

	if (charsLeftAfterVerseEnd) {
		// console.log('this verse has a highlight that did not start in it');
		verseText.splice(0, 1, `<em class="text-highlighted" style="background:${continuingColor}">${verseText[0]}`);
		if (charsLeftAfterVerseEnd > verseText.length) {
			// multi verse highlight
			// console.log('whole verse is highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(verseText.length - 1, 1, `${verseText[verseText.length - 1]}</em>`);
			charsLeftAfterVerseEnd -= verseText.length;
		} else if (charsLeftAfterVerseEnd === verseText.length) {
			// console.log('the whole verse is not highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(charsLeftAfterVerseEnd - 1, 1, `${verseText[charsLeftAfterVerseEnd - 1]}</em>`);
			charsLeftAfterVerseEnd = 0;
		} else {
			// console.log('the whole verse is not highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(charsLeftAfterVerseEnd - 1, 1, `${verseText[charsLeftAfterVerseEnd - 1]}</em>`);
			charsLeftAfterVerseEnd = 0;
		}
	}

	return {
		verseText,
		charsLeftAfterVerseEnd,
		continuingColor,
	};
}

/* @children: children of current verse @charsLeftAfterVerseEnd: characters left from last verse @continuingColor: color from last verse */
function handleVerseSection({ combinedSectionLength, highlightsStartingInVerse, verseText, charsLeftAfterVerseEnd: passedCharsLeft, continuingColor: passedColor }) {
	// Case 1: Handle a highlight that is continuing from the previous section
	let charsLeftAfterVerseEnd = passedCharsLeft;
	let continuingColor = passedColor;
	let charsLeft = charsLeftAfterVerseEnd; // Need this separate from charsLeftAfterEnd because I may end up updating that value and still need this one
	let hStart = 0;
	const sectionLength = verseText.length; // May not be the case
	// Adds the length of the previous sections together to get the length relative to the highlight start
	// const trueSectionLength = sectionLength + combinedSectionLength;
	// console.log('section length', sectionLength);
	// console.log('combined section length', combinedSectionLength);

	// Handle the cases where there were characters left over from the previous highlight - Still needs some work
	if (charsLeftAfterVerseEnd) {
		// console.log('this section has a highlight that did not start in it', charsLeftAfterVerseEnd);
		verseText.splice(0, 1, `<em class="text-highlighted" style="background:${continuingColor}">${verseText[0]}`);
		if (charsLeftAfterVerseEnd > verseText.length) {
			// multi verse highlight
			// console.log('whole verse is highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(verseText.length - 1, 1, `${verseText[verseText.length - 1]}</em>`);
			charsLeftAfterVerseEnd -= verseText.length;
		} else if (charsLeftAfterVerseEnd === verseText.length) {
			// console.log('the whole verse is not highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(charsLeftAfterVerseEnd - 1, 1, `${verseText[charsLeftAfterVerseEnd - 1]}</em>`);
			charsLeftAfterVerseEnd = 0;
		} else {
			// console.log('the whole verse is not highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(charsLeftAfterVerseEnd - 1, 1, `${verseText[charsLeftAfterVerseEnd - 1]}</em>`);
			charsLeftAfterVerseEnd = 0;
		}

		return {
			verseText,
			charsLeftAfterVerseEnd,
			continuingColor,
			sectionLength,
		};
	}

	// Case 2: Handle a highlight that is beginning in this verse
	highlightsStartingInVerse.forEach((h, i) => {
		// Next highlight
		const nh = highlightsStartingInVerse[i + 1];
		// The start of the highlight minus the combined lengths of the preceding sections will equal the highlight start relative to the whole verse
		const trueHighlightStart = h.highlight_start - combinedSectionLength;
		// Sets the actual index for the verse since this could be the 2nd or 3rd node inside the verse
		// Highlights are sorted by highlight_start so the first index has the very first highlight
		// Also need to check and see if the highlight can fit in this child node of the verse
		// console.log('The highlight starts in this section', (verseText.length + prevSectionsLength) >= h.highlight_start && !(prevSectionsLength >= h.highlight_start));
		// console.log('The true index inside verse', trueVerseIndex);
		// console.log('true highlight start', trueHighlightStart);
		if ((i === 0 || charsLeft === 0) && (sectionLength) > trueHighlightStart) {
			// If the length of the previous sections plus the length of this one is greater than the start of the highlight
			// And the length of the previous sections is not greater than the start of the highlight
			// console.log('Found highlight start');
			verseText.splice(trueHighlightStart, 1, `<em class="text-highlighted" style="background:${h.highlighted_color ? h.highlighted_color : 'inherit'}">${verseText[trueHighlightStart]}`);
			hStart = trueHighlightStart;
		}
		/* ESSENTIALLY GATHERS ALL OVERLAPPING HIGHLIGHTS */
		// if the next highlight start is less than the end of this highlight and there is a next highlight
		if (nh && nh.highlight_start <= ((h.highlighted_words + trueHighlightStart) - 1)) {
			// check if the furthest highlighted character for this highlight is greater than the furthest character for the next highlight
			// console.log('Next highlight start is lower than the end of this one');
			// Todo: The function breaks here if there is one highlight overlapping multiple other highlights
			if (((h.highlighted_words + trueHighlightStart) - 1) >= ((nh.highlight_start + nh.highlighted_words) - 1)) {
				// If the end of this highlight is greater than the end of the next highlight
				// the next highlight will be contained within this highlight and doesn't need to be accounted for
				// console.log('current test should apply highlight here', h);
				charsLeft = h.highlighted_words;
			} else {
				// If the end of this highlight was not greater than the end of the next one, then it must not contain the next highlight
				// in this case the next highlight will continue to extend past where this one ends
				charsLeft = (nh.highlighted_words + nh.highlight_start) - 1;
			}

			/* IS SINGLE VERSE NON-OVERLAPPING */
			// I think both of the conditions below are exactly the same...
		} else if ((charsLeft + trueHighlightStart) <= (verseText.length) && ((h.highlighted_words + trueHighlightStart) - 1) < (verseText.length)) {
			// If the characters left plus the start of the highlight are less than the verse length and this highlight is less than the verse length
			// This highlight doesn't go past the end of the verse
			if (charsLeft === 0) {
				// This highlight was not overlapped by another and the highlight was not started in a child node before this one
				// If there are not any characters left to highlight then close the em tag at the index where the highlight ends
				verseText.splice((h.highlighted_words + trueHighlightStart) - 1, 1, `${verseText[(h.highlighted_words + trueHighlightStart) - 1]}</em>`);
			} else {
				// Since there are characters left to highlight close the em tag at the index that will expend those characters
				verseText.splice((charsLeft + trueHighlightStart) - 1, 1, `${verseText[(charsLeft + trueHighlightStart) - 1]}</em>`);
				charsLeft = 0;
			}

			/* IS MULTI-VERSE */
		} else if (((charsLeft + hStart) > verseText.length || ((h.highlighted_words + trueHighlightStart) - 1) > verseText.length) && hStart) {
			// If the characters left to highlight plus where the highlight started is greater than the verse length or the highlight is longer than the verse

			// diff between highlight start and verse end
			const diff = verseText.length - hStart;

			// Close the em tag at the end of the verse since this highlight goes on into the next verse
			verseText.splice(verseText.length - 1, 1, `${verseText[verseText.length - 1]}</em>`);

			// If the remaining characters in this highlight is greater than the characters leftover
			// Set the characters left as this highlights remaining
			// else leave the characters leftover

			if (charsLeft === 0 || (h.highlighted_words - diff) > charsLeft) {
				// If the previous highlight was completed set the characters left to equal the space remaining un-highlighted in the verse
				charsLeft = h.highlighted_words - diff;
				// console.log('Chars left is correct for first highlight', h.highlighted_words === 174 && charsLeft === 70);
			} else {
				// Subtract the number of characters applied from the number left
				charsLeft -= diff;
			}
			// Set the variables needed for the next verse to continue this highlight
			charsLeftAfterVerseEnd = charsLeft;
			continuingColor = h.highlighted_color;
		}
		// Face I made when I found out highlight_start is a string while everything else is an integer... ( ‾ ʖ̫ ‾)
		// If the current highlight overlaps another highlight before it. example v5 - v19, v3 - v6 = v3 - v19
		// If the current highlight overlaps another highlight after it. example v1 - v6, v5 - v9 = v1 - v9
		// If the current highlight encompasses another highlight. example v1 - v12, v4 - v6 = v1 - v12
		// If the current highlight is encompassed by another highlight. example v4 - v6, v1 - v12 = v1 - v12
		// New acc so I don't introduce side effects - mostly so eslint leaves me alone ( ͡~ ͜ʖ ͡°)
	});

	return {
		verseText,
		charsLeftAfterVerseEnd,
		continuingColor,
		sectionLength,
	};
}

function handleNewVerse({ highlightsStartingInVerse, verseText, charsLeftAfterVerseEnd: passedCharsLeft, continuingColor: passedColor }) {
	let charsLeftAfterVerseEnd = passedCharsLeft;
	let continuingColor = passedColor;
	let charsLeft = charsLeftAfterVerseEnd; // Need this separate from charsLeftAfterEnd because I may end up updating that value and still need this one
	let hStart = 0;

	// Handle the cases where there were characters left over from the previous highlight
	if (charsLeftAfterVerseEnd && highlightsStartingInVerse.length === 0) {
		// console.log('this verse has a highlight that did not start in it', charsLeftAfterVerseEnd);
		verseText.splice(0, 1, `<em class="text-highlighted" style="background:${continuingColor}">${verseText[0]}`);
		if (charsLeftAfterVerseEnd > verseText.length) {
			// multi verse highlight
			// console.log('whole verse is highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(verseText.length - 1, 1, `${verseText[verseText.length - 1]}</em>`);
			charsLeftAfterVerseEnd -= verseText.length;
		} else if (charsLeftAfterVerseEnd === verseText.length) {
			// console.log('the whole verse is not highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(charsLeftAfterVerseEnd - 1, 1, `${verseText[charsLeftAfterVerseEnd - 1]}</em>`);
			charsLeftAfterVerseEnd = 0;
		} else {
			// console.log('the whole verse is not highlighted', charsLeftAfterVerseEnd, verseText.length);
			verseText.splice(charsLeftAfterVerseEnd, 1, `${verseText[charsLeftAfterVerseEnd]}</em>`);
			charsLeftAfterVerseEnd = 0;
		}
	}
	// Todo: Implement code below
	// else if (charsLeftAfterVerseEnd) {
	// 	// Apply previous highlight up until the first highlight in this verse starts
	// 	const firstHighlightStart = highlightsStartingInVerse[0].highlight_start;
	// 	// console.log('firstHighlightStart', firstHighlightStart);
	// 	// console.log('firstHighlightStart > charsLeftAfterVerseEnd', firstHighlightStart > charsLeftAfterVerseEnd);
	// 	// console.log('!(firstHighlightStart === 0)', !(firstHighlightStart === 0));
	// 	// End of previous highlight is before the first highlight in this verse
	// 	if (charsLeftAfterVerseEnd < firstHighlightStart) {
	// 		verseText.splice(0, 1, `<em class="text-highlighted" style="background:${continuingColor}">${verseText[0]}`);
	//
	// 		verseText.splice(charsLeftAfterVerseEnd, 1, `</em>${verseText[charsLeftAfterVerseEnd]}`);
	//
	// 		charsLeftAfterVerseEnd = 0;
	// 	} else if (!(firstHighlightStart === 0)) {
	// 		// console.log('firstHighlightStart is not equal to zero and is less than charsLeftAfterVerseEnd');
	// 		verseText.splice(0, 1, `<em class="text-highlighted" style="background:${continuingColor}">${verseText[0]}`);
	//
	// 		// May not need to subtract 1 here - highlight start might be an index instead of a length
	// 		verseText.splice(firstHighlightStart - 1, 1, `${verseText[firstHighlightStart - 1]}</em>`);
	// 		charsLeftAfterVerseEnd -= (firstHighlightStart - 1);
	// 		// console.log('charsLeftAfterVerseEnd', charsLeftAfterVerseEnd);
	// 	}
	// }

	highlightsStartingInVerse.forEach((h, i) => {
		// Next highlight
		const nh = highlightsStartingInVerse[i + 1];
		// Sets the actual index for the verse since this could be the 2nd or 3rd node inside the verse
		// Highlights are sorted by highlight_start so the first index has the very first highlight
		// Also need to check and see if the highlight can fit in this child node of the verse
		// console.log('The highlight starts in this section', (verseText.length + prevSectionsLength) >= h.highlight_start && !(prevSectionsLength >= h.highlight_start));
		// console.log('The true index inside verse', trueVerseIndex);
		if ((i === 0 || charsLeft === 0) && (verseText.length) >= h.highlight_start) {
			// If the length of the previous sections plus the length of this one is greater than the start of the highlight
			// And the length of the previous sections is not greater than the start of the highlight
			verseText.splice(h.highlight_start, 1, `<em class="text-highlighted" style="background:${h.highlighted_color ? h.highlighted_color : 'inherit'}">${verseText[h.highlight_start]}`);
			hStart = h.highlight_start;
		}
		/* ESSENTIALLY GATHERS ALL OVERLAPPING HIGHLIGHTS */
		// if the next highlight start is less than the end of this highlight and there is a next highlight
		if (nh && nh.highlight_start <= ((h.highlighted_words + h.highlight_start) - 1)) {
			// check if the furthest highlighted character for this highlight is greater than the furthest character for the next highlight
			// console.log('Next highlight start is lower than the end of this one');
			// Todo: The function breaks here if there is one highlight overlapping multiple other highlights
			if (((h.highlighted_words + h.highlight_start) - 1) >= ((nh.highlight_start + nh.highlighted_words) - 1)) {
				// If the end of this highlight is greater than the end of the next highlight
				// the next highlight will be contained within this highlight and doesn't need to be accounted for
				// console.log('current test should apply highlight here', h);
				charsLeft = h.highlighted_words;
			} else {
				// If the end of this highlight was not greater than the end of the next one, then it must not contain the next highlight
				// in this case the next highlight will continue to extend past where this one ends
				charsLeft = (nh.highlighted_words + nh.highlight_start) - 1;
			}

			/* IS SINGLE VERSE NON-OVERLAPPING */
			// I think both of the conditions below are exactly the same...
		} else if ((charsLeft + h.highlight_start) <= (verseText.length) && ((h.highlighted_words + h.highlight_start) - 1) < (verseText.length)) {
			// If the characters left plus the start of the highlight are less than the verse length and this highlight is less than the verse length
			// This highlight doesn't go past the end of the verse
			if (charsLeft === 0) {
				// This highlight was not overlapped by another and the highlight was not started in a child node before this one
				// If there are not any characters left to highlight then close the em tag at the index where the highlight ends
				verseText.splice((h.highlighted_words + h.highlight_start) - 1, 1, `${verseText[(h.highlighted_words + h.highlight_start) - 1]}</em>`);
			} else {
				// Since there are characters left to highlight close the em tag at the index that will expend those characters
				verseText.splice((charsLeft + h.highlight_start) - 1, 1, `${verseText[(charsLeft + h.highlight_start) - 1]}</em>`);
				charsLeft = 0;
			}

			/* IS MULTI-VERSE */
		} else if ((charsLeft + hStart) > verseText.length || ((h.highlighted_words + h.highlight_start) - 1) > verseText.length) {
			// If the characters left to highlight plus where the highlight started is greater than the verse length or the highlight is longer than the verse

			// console.log('charsLeft + hStart', charsLeft + hStart);
			// console.log('(h.highlighted_words + h.highlight_start) - 1', (h.highlighted_words + h.highlight_start) - 1);
			// diff between highlight start and verse end
			if (!(verseText.length < h.highlight_start)) {
				const diff = verseText.length - hStart;

				// Close the em tag at the end of the verse since this highlight goes on into the next verse
				verseText.splice(verseText.length - 1, 1, `${verseText[verseText.length - 1]}</em>`);

				// If the remaining characters in this highlight is greater than the characters leftover
				// Set the characters left as this highlights remaining
				// else leave the characters leftover

				if (charsLeft === 0 || (h.highlighted_words - diff) > charsLeft) {
					// If the previous highlight was completed set the characters left to equal the space remaining un-highlighted in the verse
					charsLeft = h.highlighted_words - diff;
					// console.log('Chars left is correct for first highlight', h.highlighted_words === 174 && charsLeft === 70);
				} else {
					// Subtract the number of characters applied from the number left
					charsLeft -= diff;
				}
				// Set the variables needed for the next verse to continue this highlight
				charsLeftAfterVerseEnd = charsLeft;
				continuingColor = h.highlighted_color;
			} else {
				// May not want everything else to trigger this
				charsLeftAfterVerseEnd = h.highlighted_words;
				continuingColor = h.highlighted_color;
			}
			// Face I made when I found out highlight_start is a string while everything else is an integer... ( ‾ ʖ̫ ‾)
			// If the current highlight overlaps another highlight before it. example v5 - v19, v3 - v6 = v3 - v19
			// If the current highlight overlaps another highlight after it. example v1 - v6, v5 - v9 = v1 - v9
			// If the current highlight encompasses another highlight. example v1 - v12, v4 - v6 = v1 - v12
			// If the current highlight is encompassed by another highlight. example v4 - v6, v1 - v12 = v1 - v12
			// New acc so I don't introduce side effects - mostly so eslint leaves me alone ( ͡~ ͜ʖ ͡°)
		}
	});

	return {
		verseText,
		charsLeftAfterVerseEnd,
		continuingColor,
	};
}

export default createFormattedHighlights;

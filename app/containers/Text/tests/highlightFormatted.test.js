// import { XMLSerializer } from 'xmldom';
import { JSDOM } from 'jsdom';
import highlightFormattedText from '../highlightFormattedText';
// import sampleText, { result } from './sampleText';
// global.XMLSerializer = XMLSerializer;
// import sampleHighlights from './sampleHighlights.json';
// Can't test formatted text because of XMLSerializer not being available

describe('highlightFormattedText', () => {
	it('Should be a function', () => {
		expect(typeof highlightFormattedText).toBe('function');
	});
	it('Should return a string', () => {
		const sampleHighlights = [];
		const text = '<span class="verse1 v-num v-1">1&#160;</span><span class="v GEN1_1" data-id="GEN1_1"> In the beginning God created the heaven and the earth. </span>';

		expect(typeof highlightFormattedText(sampleHighlights, text, JSDOM)).toBe('string');
	});
	it('Case: 1 Should apply a highlight that contains a footnote without removing the footnote', () => {
		const sampleHighlights = [
			{
				id: 1,
				bible_id: 'ENGESV',
				book_id: 'GEN',
				chapter: 1,
				verse_start: 1,
				highlight_start: 18,
				highlighted_words: 11,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_1 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_1" data-nextid="GEN2" lang="eng"><div class="c">1</div><p><span class="verse1 v-num v-1">1&#160;</span><span class="v GEN1_1" data-id="GEN1_1">In the beginning, God<span class=\'note\' id=\'note-0\'><a href="#footnote-0" class="key">*</a></span> created the heavens and the earth.</span></p></div>';
		const result = `<div class="chapter section ENGWEB_2_GEN_1 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_1" data-nextid="GEN2" lang="eng"><div class="c">1</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN1_1" data-id="GEN1_1"><span>In the beginning, <em class="text-highlighted" style="background:linear-gradient(rgba(${sampleHighlights[0].highlighted_color}),rgba(${sampleHighlights[0].highlighted_color}))">God</em></span><span class="note" id="note-0"><a href="#footnote-0" class="key">*</a></span><span><em class="text-highlighted" style="background:linear-gradient(rgba(${sampleHighlights[0].highlighted_color}),rgba(${sampleHighlights[0].highlighted_color}))"> created</em> the heavens and the earth.</span></span></p></div>`;

		expect(highlightFormattedText(sampleHighlights, sampleText, JSDOM)).toEqual(result);
	});
	it('Case: 2 Should apply a highlight that has a highlight start after several elements within the text', () => {
		const highlights = [{
			id: 99,
			bible_id: 'ENGWEB',
			book_id: 'GEN',
			chapter: 4,
			verse_start: 1,
			highlight_start: 91,
			highlighted_words: 5,
			highlighted_color: '255,221,34,.25',
		}];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1">The man knew<span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span> Eve his wife. She conceived,<span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span> and gave birth to Cain, and said, “I have gotten a man with Yahweh’s help.”</span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2">Again she gave birth, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1"><span>The man knew</span><span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span><span> Eve his wife. She conceived,</span><span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span><span> and gave birth to Cain, and said, “I have gotten <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">a man</em> with Yahweh’s help.”</span></span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2"><span>Again she gave birth, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 3 Should apply an array of highlights that are in two different verses that contain additional markup', () => {
		const highlights = [
			{
				id: 99,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 1,
				highlight_start: 91,
				highlighted_words: 5,
				highlighted_color: '255,221,34,.25',
			},
			{
				id: 100,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 2,
				highlight_start: 0,
				highlighted_words: 20,
				highlighted_color: '255,221,34,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1">The man knew<span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span> Eve his wife. She conceived,<span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span> and gave birth to Cain, and said, “I have gotten a man with Yahweh’s help.”</span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2">Again she gave birth, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1"><span>The man knew</span><span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span><span> Eve his wife. She conceived,</span><span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span><span> and gave birth to Cain, and said, “I have gotten <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">a man</em> with Yahweh’s help.”</span></span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Again she gave birth</em>, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 4 Should apply a highlight to a verse that does not contain any other markup', () => {
		const highlights = [
			{
				id: 99,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 2,
				highlight_start: 0,
				highlighted_words: 20,
				highlighted_color: '255,221,34,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2">Again she gave birth, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Again she gave birth</em>, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 5 Should apply an array of highlights to verses that do not contain any other markup', () => {
		const highlights = [
			{
				id: 99,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 1,
				highlight_start: 91,
				highlighted_words: 5,
				highlighted_color: '255,221,34,.25',
			},
			{
				id: 100,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 2,
				highlight_start: 0,
				highlighted_words: 20,
				highlighted_color: '255,221,34,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1">The man knew Eve his wife. She conceived, and gave birth to Cain, and said, “I have gotten a man with Yahweh’s help.”</span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2">Again she gave birth, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1"><span>The man knew Eve his wife. She conceived, and gave birth to Cain, and said, “I have gotten <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">a man</em> with Yahweh’s help.”</span></span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Again she gave birth</em>, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 6 Should highlight a verse that has multiple parent elements', () => {
		const highlights = [
			{
				id: 199,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 2,
				highlight_start: 0,
				highlighted_words: 11,
				highlighted_color: '255,221,34,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span>The Mighty One, God, Yahweh, speaks,</span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span>and calls the earth from sunrise to sunset. </span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Out of Zion</em>, the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 7 Should apply highlight that spans multiple elements with the same data-id', () => {
		const highlights = [
			{
				id: 199,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 1,
				highlight_start: 0,
				highlighted_words: 80,
				highlighted_color: '255,221,34,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">The Mighty One, God, Yahweh, speaks,</em></span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth from sunrise to sunset. </em></span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span>Out of Zion, the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 8 Should apply an array of highlights that span multiple elements with the same data-id', () => {
		const highlights = [
			{
				id: 199,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 1,
				highlight_start: 0,
				highlighted_words: 80,
				highlighted_color: '255,221,34,.25',
			},
			{
				id: 200,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 2,
				highlight_start: 0,
				highlighted_words: 54,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">The Mighty One, God, Yahweh, speaks,</em></span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth from sunrise to sunset. </em></span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Out of Zion, the perfection of beauty,</em></span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">God shines out. </em></span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 9 Should apply highlight that spans multiple elements with the same data-id and starts in the second one', () => {
		const highlights = [
			{
				id: 199,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 1,
				highlight_start: 36,
				highlighted_words: 44,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span>The Mighty One, God, Yahweh, speaks,</span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth from sunrise to sunset. </em></span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span>Out of Zion, the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 10 Should apply an array of highlights where first highlight is overlapped by the second and they have different verse elements', () => {
		const highlights = [
			{
				id: 199,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 1,
				highlight_start: 0,
				highlighted_words: 80,
				highlighted_color: '255,221,34,.25',
			},
			{
				id: 200,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 1,
				highlight_start: 36,
				highlighted_words: 44,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">The Mighty One, God, Yahweh, speaks,</em></span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth from sunrise to sunset. </em></em></span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span>Out of Zion, the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 11 Should apply a highlight that spans multiple verses', () => {
		const highlights = [
			{
				id: 199,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 1,
				highlight_start: 0,
				highlighted_words: 134,
				highlighted_color: '255,221,34,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">The Mighty One, God, Yahweh, speaks,</em></span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth from sunrise to sunset. </em></span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Out of Zion, the perfection of beauty,</em></span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">God shines out. </em></span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 12 Should apply an array of highlights that are in two different verses where the first highlight spans 2 verses and second is in the second verse', () => {
		const highlights = [
			{
				id: 99,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 1,
				highlight_start: 91,
				highlighted_words: 46,
				highlighted_color: '255,221,34,.25',
			},
			{
				id: 100,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 2,
				highlight_start: 46,
				highlighted_words: 26,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1">The man knew<span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span> Eve his wife. She conceived,<span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span> and gave birth to Cain, and said, “I have gotten a man with Yahweh’s help.”</span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2">Again she gave birth, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span><span class="verse3 v-num v-3">3&nbsp;</span><span class="v GEN4_3" data-id="GEN4_3">God saw the light, and saw that it was good. God divided the light from the darkness.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1"><span>The man knew</span><span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span><span> Eve his wife. She conceived,</span><span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span><span> and gave birth to Cain, and said, “I have gotten <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">a man with Yahweh’s help.”</em></span></span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Again she gave birth</em>, to Cain’s brother Abel. <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Abel was a keeper of sheep</em>, but Cain was a tiller of the ground.</span></span><span class="verse3 v-num v-3">3&nbsp;</span><span class="v GEN4_3" data-id="GEN4_3"><span>God saw the light, and saw that it was good. God divided the light from the darkness.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 13 Should apply an array of highlights that do not overlap across multiple segments', () => {
		const highlights = [
			{
				id: 304,
				bible_id: 'ENGWEB',
				book_id: 'LUK',
				chapter: 17,
				verse_start: 5,
				highlight_start: 0,
				highlighted_words: 12,
				highlighted_color: '17,170,255,.25',
			},
			{
				id: 305,
				bible_id: 'ENGWEB',
				book_id: 'LUK',
				chapter: 17,
				verse_start: 6,
				highlight_start: 4,
				highlighted_words: 28,
				highlighted_color: '85,187,68,.25',
			},
			{
				id: 306,
				bible_id: 'ENGWEB',
				book_id: 'LUK',
				chapter: 17,
				verse_start: 6,
				highlight_start: 56,
				highlighted_words: 29,
				highlighted_color: '136,102,170,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_72_LUK_17 ENGWEB eng LUK latin" dir="ltr" data-id="ENGWEB_72_LUK_17" data-nextid="LUK18" data-previd="LUK16" lang="eng">\n<div class="c">17</div><p><span class="verse5 v-num v-5">5&nbsp;</span><span class="v LUK17_5" data-id="LUK17_5">The apostles said to the Lord, “Increase our faith.”</span>\n</p><p><span class="verse6 v-num v-6">6&nbsp;</span><span class="v LUK17_6" data-id="LUK17_6">The Lord said, <span class=\'wj\'>“If you had faith like a grain of mustard seed, you would tell this sycamore tree, ‘Be uprooted, and be planted in the sea,’ and it would obey you. </span></span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_72_LUK_17 ENGWEB eng LUK latin" dir="ltr" data-id="ENGWEB_72_LUK_17" data-nextid="LUK18" data-previd="LUK16" lang="eng">\n<div class="c">17</div><p><span class="verse5 v-num v-5">5&nbsp;</span><span class="v LUK17_5" data-id="LUK17_5"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">The apostles</em> said to the Lord, “Increase our faith.”</span></span>\n</p><p><span class="verse6 v-num v-6">6&nbsp;</span><span class="v LUK17_6" data-id="LUK17_6"><span>The <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Lord said, </em></span><span class="wj"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">“If you had faith</em> like a grain of mustard<em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[2].highlighted_color}),rgba(${highlights[2].highlighted_color}))"> seed, you would tell this sy</em>camore tree, ‘Be uprooted, and be planted in the sea,’ and it would obey you. </span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 14 Should apply two highlights that overlap in the same verse and the verse only has a single text node', () => {
		const highlights = [
			{
				id: 320,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 3,
				highlight_start: 42,
				highlighted_words: 13,
				highlighted_color: '136,102,170,.25',
			},
			{
				id: 321,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 3,
				highlight_start: 49,
				highlighted_words: 12,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="verse3 v-num v-3">3&nbsp;</span><span class="v JER1_3" data-id="JER1_3">It came also in the days of Jehoiakim the son of Josiah, king of Judah, to the end of the eleventh year of Zedekiah, the son of Josiah, king of Judah, to the carrying away of Jerusalem captive in the fifth month.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="verse3 v-num v-3">3&nbsp;</span><span class="v JER1_3" data-id="JER1_3"><span>It came also in the days of Jehoiakim the <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">son of </em><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Josiah</em>, king</em> of Judah, to the end of the eleventh year of Zedekiah, the son of Josiah, king of Judah, to the carrying away of Jerusalem captive in the fifth month.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 15 When two highlights start and end at the same index the highlight with the greater id should be the color that is kept', () => {
		const highlights = [
			{
				id: 329,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 9,
				highlight_start: 5,
				highlighted_words: 29,
				highlighted_color: '85,187,68,.25',
			},
			{
				id: 330,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 9,
				highlight_start: 5,
				highlighted_words: 29,
				highlighted_color: '17,170,255,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_9" data-id="JER1_9">Then Yahweh stretched out his hand, and touched my mouth. Then Yahweh said to me, “Behold, I have put my words in your mouth.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_9" data-id="JER1_9"><span>Then <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Yahweh stretched out his hand</em></em>, and touched my mouth. Then Yahweh said to me, “Behold, I have put my words in your mouth.</span></span></p></div>`;
		// Below is how I would prefer the result to look, but the above has the same affect on the display so I am fine with it for now
		// const expectedResult = `<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_9" data-id="JER1_9"><span>Then <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Yahweh stretched out his hand</em>, and touched my mouth. Then Yahweh said to me, “Behold, I have put my words in your mouth.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 16 When two highlights start and end at the same index and the older highlight is longer than the new highlight', () => {
		const highlights = [
			{
				id: 331,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 11,
				highlight_start: 0,
				highlighted_words: 17,
				highlighted_color: '136,102,170,.25',
			},
			{
				id: 332,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 11,
				highlight_start: 0,
				highlighted_words: 8,
				highlighted_color: '221,102,170,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_11" data-id="JER1_11">Moreover Yahweh’s word came to me, saying, “Jeremiah, what do you see?”</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_11" data-id="JER1_11"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Moreover</em> Yahweh’s</em> word came to me, saying, “Jeremiah, what do you see?”</span></span></p></div>`;
		// Below is how I would prefer the result to look, but the above has the same affect on the display so I am fine with it for now
		// const expectedResult = `<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_11" data-id="JER1_11"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Moreover</em><em className="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))"> Yahweh’s</em> word came to me, saying, “Jeremiah, what do you see?”</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 17 Should apply three highlights that overlap in the space of one same verse and the verse only has a single text node', () => {
		const highlights = [
			{
				id: 320,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 3,
				highlight_start: 42,
				highlighted_words: 13,
				highlighted_color: '136,102,170,.25',
			},
			{
				id: 321,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 3,
				highlight_start: 49,
				highlighted_words: 12,
				highlighted_color: '85,187,68,.25',
			},
			{
				id: 322,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 3,
				highlight_start: 57,
				highlighted_words: 4,
				highlighted_color: '17,170,255,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="verse3 v-num v-3">3&nbsp;</span><span class="v JER1_3" data-id="JER1_3">It came also in the days of Jehoiakim the son of Josiah, king of Judah, to the end of the eleventh year of Zedekiah, the son of Josiah, king of Judah, to the carrying away of Jerusalem captive in the fifth month.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="verse3 v-num v-3">3&nbsp;</span><span class="v JER1_3" data-id="JER1_3"><span>It came also in the days of Jehoiakim the <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">son of </em><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Josiah</em>, <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[2].highlighted_color}),rgba(${highlights[2].highlighted_color}))">king</em></em> of Judah, to the end of the eleventh year of Zedekiah, the son of Josiah, king of Judah, to the carrying away of Jerusalem captive in the fifth month.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 18 Should apply newer highlight that is contained within an older highlight', () => {
		const highlights = [
			{
				id: 333,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 12,
				highlight_start: 5,
				highlighted_words: 17,
				highlighted_color: '17,170,255,.25',
			},
			{
				id: 334,
				bible_id: 'ENGWEB',
				book_id: 'JER',
				chapter: 1,
				verse_start: 12,
				highlight_start: 12,
				highlighted_words: 4,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_12" data-id="JER1_12">Then Yahweh said to me, “You have seen well; for I watch over my word to perform it.”</span></p></div>';
		const expectedText = `<div class="chapter section ENGWEB_25_JER_1 ENGWEB eng JER latin" dir="ltr" data-id="ENGWEB_25_JER_1" data-nextid="JER2" data-previd="ISA66" lang="eng"><div class="c">1</div><p><span class="v JER1_12" data-id="JER1_12"><span>Then <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Yahweh <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">said</em> to me</em>, “You have seen well; for I watch over my word to perform it.”</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedText);
	});
	it('Case: 19 Should apply a highlight that starts in the second section of a Psalm', () => {
		const highlights = [
			{
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				highlight_start: 36,
				highlighted_color: '80,165,220,.25',
				highlighted_words: 19,
				id: 536,
				reference: 'Psalms 50:1',
				verse_start: 1,
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span>The Mighty One, God, Yahweh, speaks,</span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth</em> from sunrise to sunset. </span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span>Out of Zion, the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 20 Should apply a highlight that starts in the first section of a Psalm and ends in the second section', () => {
		const highlights = [
			{
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				highlight_start: 0,
				highlighted_color: '80,165,220,.25',
				highlighted_words: 55,
				id: 536,
				reference: 'Psalms 50:1',
				verse_start: 1,
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">The Mighty One, God, Yahweh, speaks,</em></span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth</em> from sunrise to sunset. </span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span>Out of Zion, the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 21 Should apply a highlight that starts in the second section of a Psalm and goes into the third section', () => {
		const highlights = [
			{
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				highlight_start: 36,
				highlighted_color: '80,165,220,.25',
				highlighted_words: 56,
				id: 536,
				reference: 'Psalms 50:1',
				verse_start: 1,
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse1 v-num v-1">2&#160;</span><span class="v PSA50_1" data-id="PSA50_1">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span>The Mighty One, God, Yahweh, speaks,</span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">and calls the earth from sunrise to sunset. </em></span></div><div class="q"><span class="verse1 v-num v-1">2&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Out of Zion,</em> the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 22 Should apply a highlight in a verse that also has a footnote without the footnote breaking it', () => {
		const highlights = [
			{
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 2,
				highlight_start: 0,
				highlighted_color: '84,185,72,.25',
				highlighted_words: 6,
				id: 550,
				reference: 'Genesis 2:18',
				verse_start: 18,
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_2 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_2_GEN_2" data-nextid="GEN2" data-previd="GEN2" lang="eng"> <div class="c">2</div><span class="v GEN2_18" data-id="GEN2_18">Yahweh God said, “It is not good for the man to be alone. I will make him a helper comparable to<span class="note" id="note-4"><a href="#footnote-4" class="key">*</a></span> him.”</span></div>';
		const expectedResult = `<div class="chapter section ENGWEB_2_GEN_2 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_2_GEN_2" data-nextid="GEN2" data-previd="GEN2" lang="eng"> <div class="c">2</div><span class="v GEN2_18" data-id="GEN2_18"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Yahweh</em> God said, “It is not good for the man to be alone. I will make him a helper comparable to</span><span class="note" id="note-4"><a href="#footnote-4" class="key">*</a></span><span> him.”</span></span></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 23 Should apply a highlight on top of a prexisting one when there is a footnote in the verse and they are different colors', () => {
		const highlights = [
			{ bible_id: 'ENGWEB', reference: 'Matthew 5:5', chapter: 5, book_id: 'MAT', highlighted_color: '80,165,220,.25', highlight_start: 0, verse_start: 5, id: 563, highlighted_words: 37 },
			{ bible_id: 'ENGWEB', reference: 'Matthew 5:5', chapter: 5, book_id: 'MAT', highlighted_color: '208,105,169,.25', highlight_start: 0, verse_start: 5, id: 564, highlighted_words: 37 },
		];
		const sampleText = '<div class="chapter section ENGWEB_70_MAT_5 ENGWEB eng MAT latin" dir="ltr" data-id="ENGWEB_70_MAT_5" data-nextid="MAT6" data-previd="MAT4" lang="eng"><div class="c">5</div><div class="q"><span class="verse5 v-num v-5">5&#160;</span><span class="v MAT5_5" data-id="MAT5_5"><span class=\'wj\'>Blessed are the gentle,</span></span></div><div class="q MAT5_5" data-id="MAT5_5"><span class=\'wj\'>for they shall inherit the earth.</span><span class=\'note\' id=\'note-1777\'><a href="#footnote-1777" class="key">*</a></span><span class=\'note\' id=\'note-1778\'><a href="#footnote-1778" class="key">†</a></span></div></div>';
		const expectedResult = `<div class="chapter section ENGWEB_70_MAT_5 ENGWEB eng MAT latin" dir="ltr" data-id="ENGWEB_70_MAT_5" data-nextid="MAT6" data-previd="MAT4" lang="eng"><div class="c">5</div><div class="q"><span class="verse5 v-num v-5">5&nbsp;</span><span class="v MAT5_5" data-id="MAT5_5"><span class="wj"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">Blessed are the gentle,</em></em></span></span></div><div class="q MAT5_5" data-id="MAT5_5"><span class="wj"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">for they shall</em></em> inherit the earth.</span><span class="note" id="note-1777"><a href="#footnote-1777" class="key">*</a></span><span class="note" id="note-1778"><a href="#footnote-1778" class="key">†</a></span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 24 Should apply an array of highlights that start in the same verse and both extend past the end of the verse', () => {
		const highlights = [
			{
				id: 99,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 1,
				highlight_start: 91,
				highlighted_words: 46,
				highlighted_color: '255,221,34,.25',
			},
			{
				id: 100,
				bible_id: 'ENGWEB',
				book_id: 'GEN',
				chapter: 4,
				verse_start: 1,
				highlight_start: 66,
				highlighted_words: 96,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1">The man knew<span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span> Eve his wife. She conceived,<span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span> and gave birth to Cain, and said, “I have gotten a man with Yahweh’s help.”</span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2">Again she gave birth, to Cain’s brother Abel. Abel was a keeper of sheep, but Cain was a tiller of the ground.</span><span class="verse3 v-num v-3">3&nbsp;</span><span class="v GEN4_3" data-id="GEN4_3">God saw the light, and saw that it was good. God divided the light from the darkness.</span></p></div>';
		const expectedResult = `<div class="chapter section ENGWEB_2_GEN_4 ENGWEB eng GEN latin" dir="ltr" data-id="ENGWEB_2_GEN_4" data-nextid="GEN5" data-previd="GEN3" lang="eng"> <div class="c">4</div><p><span class="verse1 v-num v-1">1&nbsp;</span><span class="v GEN4_1" data-id="GEN4_1"><span>The man knew</span><span class="note" id="note-6"><a href="#footnote-6" class="key">*</a></span><span> Eve his wife. She conceived,</span><span class="note" id="note-7"><a href="#footnote-7" class="key">*</a></span><span> and gave birth to Cain, <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">and said, “I have gotten <em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">a man with Yahweh’s help.”</em></em></span></span><span class="verse2 v-num v-2">2&nbsp;</span><span class="v GEN4_2" data-id="GEN4_2"><span><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))"><em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[1].highlighted_color}),rgba(${highlights[1].highlighted_color}))">Again she gave birth</em>, to Cain’s brother Abel.</em> Abel was a keeper of sheep, but Cain was a tiller of the ground.</span></span><span class="verse3 v-num v-3">3&nbsp;</span><span class="v GEN4_3" data-id="GEN4_3"><span>God saw the light, and saw that it was good. God divided the light from the darkness.</span></span></p></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
	it('Case: 25 Should apply highlight that spans multiple elements with the same data-id and starts in the second one where the starting index is not zero', () => {
		const highlights = [
			{
				id: 199,
				bible_id: 'ENGWEB',
				book_id: 'PSA',
				chapter: 50,
				verse_start: 1,
				highlight_start: 38,
				highlighted_words: 42,
				highlighted_color: '85,187,68,.25',
			},
		];
		const sampleText = '<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&#160;</span><span class="v PSA50_1" data-id="PSA50_1">The Mighty One, God, Yahweh, speaks,</span> </div><div class="q PSA50_1" data-id="PSA50_1">and calls the earth from sunrise to sunset. </div><div class="q"><span class="verse2 v-num v-2">2&#160;</span><span class="v PSA50_2" data-id="PSA50_2">Out of Zion, the perfection of beauty,</span> </div><div class="q PSA50_2" data-id="PSA50_2">God shines out. </div>';
		const expectedResult = `<div class="chapter section ENGWEB_20_PSA_50 ENGWEB eng PSA latin" dir="ltr" data-id="ENGWEB_20_PSA_50" data-nextid="PSA51" data-previd="PSA49" lang="eng"> <div class="c">50</div> <h3>A Psalm by Asaph. </h3><div class="q"><span class="verse1 v-num v-1">1&nbsp;</span><span class="v PSA50_1" data-id="PSA50_1"><span>The Mighty One, God, Yahweh, speaks,</span></span> </div><div class="q PSA50_1" data-id="PSA50_1"><span>an<em class="text-highlighted" style="background:linear-gradient(rgba(${highlights[0].highlighted_color}),rgba(${highlights[0].highlighted_color}))">d calls the earth from sunrise to sunset. </em></span></div><div class="q"><span class="verse2 v-num v-2">2&nbsp;</span><span class="v PSA50_2" data-id="PSA50_2"><span>Out of Zion, the perfection of beauty,</span></span> </div><div class="q PSA50_2" data-id="PSA50_2"><span>God shines out. </span></div></div>`;

		expect(highlightFormattedText(highlights, sampleText, JSDOM)).toEqual(expectedResult);
	});
});

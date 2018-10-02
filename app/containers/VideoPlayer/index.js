import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import Hls from 'hls.js';
import { openVideoPlayer, closeVideoPlayer, setHasVideo } from './actions';
import SvgWrapper from '../../components/SvgWrapper';
import VideoControls from '../../components/VideoControls';
import VideoList from '../../components/VideoList';
import VideoProgressBar from '../../components/VideoProgressBar';
import deepDifferenceObject from '../../utils/deepDifferenceObject';
import request from '../../utils/request';
import { selectHasVideo } from './selectors';
// import makeSelectHomePage from '../HomePage/selectors';
// import { openVideoPlayer, closeVideoPlayer, getVideoList } from './actions';
// import injectReducer from '../../utils/injectReducer';
// import injectSaga from '../../utils/injectSaga';
// import reducer from './reducer';
// import saga from './sagas';

class VideoPlayer extends React.PureComponent {
	state = {
		playerOpen: false,
		volume: 1,
		paused: true,
		elipsisOpen: false,
		currentTime: 0,
		playlist: [],
		currentVideo: {},
	};

	componentDidMount() {
		const { fileset } = this.props;
		this.initHls();
		this.checkForBooks({
			filesetId: fileset ? fileset.id : '',
			bookId: this.props.bookId || '',
			chapter: this.props.chapter,
		});
		if (this.videoRef) {
			this.getVideos({
				filesetId: fileset ? fileset.id : '',
				bookId: this.props.bookId || '',
				chapter: this.props.chapter,
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		const { fileset } = nextProps;

		if (
			nextProps.bookId !== this.props.bookId ||
			nextProps.chapter !== this.props.chapter ||
			Object.keys(deepDifferenceObject(nextProps.fileset, this.props.fileset))
				.length
		) {
			this.checkForBooks({
				filesetId: fileset ? fileset.id : '',
				bookId: nextProps.bookId || '',
				chapter: nextProps.chapter,
			});
			this.getVideos({
				filesetId: fileset ? fileset.id : '',
				bookId: nextProps.bookId || '',
				chapter: nextProps.chapter,
			});
		} else if (
			nextProps.hasVideo !== this.props.hasVideo &&
			nextProps.hasVideo
		) {
			this.getVideos({
				filesetId: fileset ? fileset.id : '',
				bookId: nextProps.bookId || '',
				chapter: nextProps.chapter,
			});
		}
	}

	componentWillUnmount() {
		if (this.hls && this.hls.media) {
			this.hls.media.removeEventListener(
				'timeupdate',
				this.timeUpdateEventListener,
			);
			this.hls.media.removeEventListener('seeking', this.seekingEventListener);
			this.hls.media.removeEventListener('seeked', this.seekedEventListener);
		}
	}

	getVideos = async ({ filesetId, bookId, chapter }) => {
		// console.log('filesetId, bookId', filesetId, bookId);
		if (!filesetId) return;
		const requestUrl = `${
			process.env.BASE_API_ROUTE
		}/bibles/filesets/${filesetId}?key=${
			process.env.DBP_API_KEY
		}&v=4&type=video_stream&bucket=dbp-vid&book_id=${bookId}&chapter_id=${chapter}`;

		try {
			const response = await request(requestUrl);
			// console.log('all the vids', response);

			if (response.data) {
				const playlist = response.data
					.filter(
						(video) =>
							video.book_id === bookId && video.chapter_start === chapter,
					)
					.map((video) => ({
						title: `${video.book_name} ${video.chapter_start}`,
						id: `${video.book_id}_${video.chapter_start}_${video.verse_start}`,
						source: video.path,
						duration: video.duration || 300,
					}));

				this.setState({
					playlist: playlist.slice(1),
					currentVideo: playlist[0],
				});
				this.initVideoStream();
				if (!this.props.hasVideo) {
					this.props.dispatch(setHasVideo({ state: true }));
				}
			} else {
				this.setState({ playlist: [], currentVideo: {} });
				if (this.props.hasVideo) {
					this.props.dispatch(setHasVideo({ state: false }));
				}
			}
		} catch (err) {
			if (process.env.NODE_ENV === 'development') {
				console.log('Error getting video playlist', err); // eslint-disable-line no-console
			}
		}
	};

	setVideoRef = (el) => {
		this.videoRef = el;
	};

	setCurrentTime = (time) => {
		if (this.hls.media) {
			// console.log('Setting hls media time');
			this.hls.media.currentTime = time;
			this.setState({ currentTime: time });
		} else {
			// console.log('Setting video ref time');
			this.videoRef.currentTime = time;
			this.setState({ currentTime: time });
		}
	};

	checkForBooks = async ({ filesetId, bookId, chapter }) => {
		console.log('running check for books', filesetId, bookId, chapter);
		if (!filesetId) return;
		const reqUrl = `${
			process.env.BASE_API_ROUTE
		}/bibles/filesets/${filesetId}/books?key=${
			process.env.DBP_API_KEY
		}&bucket=dbp-vid&fileset_type=video_stream&v=4`;

		try {
			const res = await request(reqUrl);
			console.log('res', res);

			if (res.data) {
				const hasVideo = !!res.data.filter(
					(stream) =>
						stream.book_id === bookId && stream.chapters.includes(chapter),
				).length;
				console.log('has video', hasVideo);
				this.props.dispatch(setHasVideo({ state: hasVideo }));
			} else {
				this.props.dispatch(setHasVideo({ state: false }));
			}
		} catch (err) {
			if (process.env.NODE_ENV === 'development') {
				console.log('Error checking for context', err); // eslint-disable-line no-console
			}
		}
	};

	handleVideoClick = () => {
		const { paused } = this.state;

		if (paused) {
			this.playVideo();
		} else {
			this.pauseVideo();
		}
	};

	handleThumbnailClick = (video) => {
		this.setState(
			(state) => ({
				playlist: state.playlist
					.filter((v) => v.id !== video.id)
					.concat([state.currentVideo])
					.sort(this.sortPlaylist),
				currentVideo: video,
			}),
			() => {
				// console.log('The current video ref', this.videoRef);
				this.playVideo();
			},
		);
	};

	initHls = () => {
		this.hls = new Hls();
		this.hls.on(Hls.Events.ERROR, (event, data) => {
			if (data.fatal) {
				// console.log('There was a fatal hls error', event, data);
				switch (data.type) {
					case Hls.ErrorTypes.NETWORK_ERROR:
						this.hls.startLoad();
						break;
					case Hls.ErrorTypes.MEDIA_ERROR:
						this.hls.recoverMediaError();
						break;
					default:
						this.hls.destroy();
						break;
				}
			}
		});
	};

	initVideoStream = () => {
		const { currentVideo } = this.state;
		if (!this.hls) {
			this.initHls();
		}
		if (currentVideo.source) {
			// console.log('loading source');
			// this.hls.loadSource(currentVideo.source);
			this.hls.attachMedia(this.videoRef);
			if (this.hls.media && typeof this.hls.media.poster !== 'undefined') {
				this.hls.media.poster = currentVideo.poster;
			}
			this.hls.media.addEventListener(
				'timeupdate',
				this.timeUpdateEventListener,
			);
			this.hls.media.addEventListener('seeking', this.seekingEventListener);
			this.hls.media.addEventListener('seeked', this.seekedEventListener);
			this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
				// console.log('Adding poster for video');
				// console.log('manifest was parsed');
				if (this.videoRef && typeof this.videoRef.poster !== 'undefined') {
					this.videoRef.poster = currentVideo.poster;
				}
			});
		}
	};

	timeUpdateEventListener = (e) => {
		this.setState({
			currentTime: e.target.currentTime,
		});
	};

	seekingEventListener = (e) => {
		this.setState({
			currentTime: e.target.currentTime,
		});
	};

	seekedEventListener = (e) => {
		this.setState({
			currentTime: e.target.currentTime,
		});
	};

	sortPlaylist = (a, b) => a.id > b.id;

	playVideo = () => {
		const { currentVideo } = this.state;
		if (currentVideo.source) {
			if (this.hls.media) {
				// console.log('playing from hls media');
				this.hls.media.play();
				this.setState({ paused: false });
			} else {
				// console.log('loading source in else');
				this.hls.loadSource(currentVideo.source);
				this.hls.attachMedia(this.videoRef);
				this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
					this.videoRef.play();
					this.setState({ paused: false });
				});
			}
		}
	};

	pauseVideo = () => {
		this.videoRef.pause();
		this.setState({ paused: true, elipsisOpen: false });
	};

	closePlayer = () => {
		this.setState({ playerOpen: false, paused: true });
		this.props.dispatch(closeVideoPlayer());
	};

	openPlayer = () => {
		this.setState({ playerOpen: true });
		this.props.dispatch(openVideoPlayer());
	};

	toggleFullScreen = () => {
		const isFullScreen = !!(
			document.fullScreen ||
			document.webkitIsFullScreen ||
			document.mozFullScreen ||
			document.msFullscreenElement ||
			document.fullscreenElement
		);

		if (isFullScreen) {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
		} else if (this.videoRef) {
			if (this.videoRef.requestFullscreen) {
				this.videoRef.requestFullscreen();
			} else if (this.videoRef.mozRequestFullScreen) {
				this.videoRef.mozRequestFullScreen();
			} else if (this.videoRef.webkitRequestFullScreen) {
				this.videoRef.webkitRequestFullScreen();
			} else if (this.videoRef.msRequestFullscreen) {
				this.videoRef.msRequestFullscreen();
			}
		}
	};

	toggleElipsis = () => {
		this.setState((currentState) => ({
			elipsisOpen: !currentState.elipsisOpen,
		}));
	};

	updateVolume = (volume) => {
		this.videoRef.volume = volume;
		this.setState({ volume });
	};

	get playButton() {
		const { paused } = this.state;

		return (
			<SvgWrapper
				onClick={this.playVideo}
				className={paused ? 'play-video show-play' : 'play-video hide-play'}
				fill={'#fff'}
				svgid={'play_video'}
				viewBox={'0 0 90 40'}
			/>
		);
	}

	render() {
		const {
			playerOpen,
			playlist,
			volume,
			paused,
			elipsisOpen,
			currentVideo,
			currentTime,
		} = this.state;
		const { hasVideo } = this.props;
		console.log('playlist', playlist);
		console.log('currentVideo', currentVideo);
		console.log('hasVideo', hasVideo);
		// Don't bother rendering anything if there is no video for the chapter
		if (!hasVideo) {
			return null;
		}
		/* eslint-disable jsx-a11y/media-has-caption */
		return [
			<div
				key={'video-player-container'}
				className={
					playerOpen
						? 'video-player-container active'
						: 'video-player-container'
				}
			>
				<div className={'video-player'}>
					<div
						className={
							paused
								? 'play-video-container show-play'
								: 'play-video-container hide-play'
						}
					>
						<span className={'play-video-title'}>
							{currentVideo.title || 'Loading'}
						</span>
						{this.playButton}
					</div>
					<video ref={this.setVideoRef} onClick={this.handleVideoClick} />
					<VideoProgressBar
						paused={paused}
						currentTime={currentTime}
						duration={currentVideo.duration || 300}
						setCurrentTime={this.setCurrentTime}
					/>
					<VideoControls
						paused={paused}
						pauseVideo={this.pauseVideo}
						toggleElipsis={this.toggleElipsis}
						toggleFullScreen={this.toggleFullScreen}
						updateVolume={this.updateVolume}
						volume={volume}
					/>
					<VideoList
						elipsisOpen={elipsisOpen}
						toggleElipsis={this.toggleElipsis}
						handleThumbnailClick={this.handleThumbnailClick}
						playlist={playlist}
					/>
				</div>
				<div onClick={this.closePlayer} className={'black-bar'}>
					<SvgWrapper className={'up-arrow'} svgid={'arrow_up'} />
				</div>
			</div>,
			<div
				key={'black-bar-key'}
				onClick={this.openPlayer}
				className={playerOpen ? 'black-bar closed' : 'black-bar'}
			>
				<SvgWrapper className={'gospel-films'} svgid={'gospel_films'} />
			</div>,
		];
		/* eslint-enable jsx-a11y/media-has-caption */
	}
}

VideoPlayer.propTypes = {
	dispatch: PropTypes.func.isRequired,
	fileset: PropTypes.object.isRequired,
	bookId: PropTypes.string.isRequired,
	chapter: PropTypes.number.isRequired,
	hasVideo: PropTypes.bool.isRequired,
	// videoList: PropTypes.array.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
	dispatch,
});

const mapStateToProps = createStructuredSelector({
	// homepage: makeSelectHomePage(),
	// videoList: selectVideoList(),
	hasVideo: selectHasVideo(),
});

const withConnect = connect(
	mapStateToProps,
	mapDispatchToProps,
);

// const withReducer = injectReducer({ key: 'videoPlayer', reducer });
// const withSaga = injectSaga({ key: 'videoPlayer', saga})

export default compose(withConnect)(VideoPlayer);
// export default compose(withConnect, withReducer, withSaga)(VideoPlayer);

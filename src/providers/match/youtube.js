const youtubedl = require('youtube-dl');
import {
	YOUTUBE_MATCH_BASE
} from '../../helpers/constant';
import { Type } from '../../helpers/type';
import {
	parse_youtube_match
} from '../../helpers/collection';
import { is_online } from '../../helpers/internet';
import { get_closest_track_match } from '../../helpers/util';

export const match = (opts, callback) => {
	const video_ids = opts.video_ids;
	if (video_ids && video_ids.length > 0) {
		get_url(video_ids, res => {
			is_online(res, res1 => {
				const data = {
					meta: { opts },
					result: {
						type: Type.YOUTUBE_MATCH,
						match: res1
					}
				}
				callback(false, data);
			});
		});
	} else {
		callback(true, null);
	}
}

export const match_fast = (opts, callback) => {
	let video_ids = opts.video_ids;
	if (video_ids && video_ids.length > 0) {
		video_ids = video_ids.map(x => {
			return {
				type: Type.YOUTUBE_TRACK,
				width: null,
				height: null,
				download_url: 'http://youtubeinmp3.com/fetch/?video=' + YOUTUBE_MATCH_BASE + x,
				id: x,
				extension: '.m4a'
			}
		})
		is_online(video_ids, res => {
			const data = {
				meta: { opts },
				result: {
					type: Type.YOUTUBE_MATCH,
					match: res
				}
			}
			callback(false, data);
		});
	} else {
		callback(true, null);
	}
}

const get_url = (video_ids, callback) => {
	const videos = [];
	let requests = video_ids.map((x, index) => {
		const video_url = YOUTUBE_MATCH_BASE + x;

		return new Promise((resolve, reject) => {
			youtubedl.getInfo(video_url, ['--format=18'], { cwd: __dirname, maxBuffer: 1000 * 1024 }, (error, response) => {
				if (!error && response) {
					videos.push(parse_youtube_match(response.formats.filter(x => x.format !== undefined), x));
				}
				resolve();
			});
		});
	});

	Promise.all(requests)
		.then(() => callback(videos.filter(x => x.download_url !== null && x.download_url !== undefined)));
}
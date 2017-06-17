const parallel = require('run-parallel');
import { make_request } from '../../helpers/internet';
import {
	LASTFM_ALBUM_INFO, LASTFM_ARTIST_INFO, LASTFM_TRACK_INFO,
	LASTFM_SEARCH_TRACK, LASTFM_SEARCH_ALBUM, LASTFM_SEARCH_ARTIST,
	LASTFM_SIMILAR_TRACK, LASTFM_SIMILAR_ARTIST,
	LASTFM_TOP_ARTIST_TRACK, LASTFM_TOP_ARTIST_ALBUM,
	LASTFM_TOP_ARTISTS, LASTFM_TOP_TRACKS,
	LASTFM_AUTOCORRECT, LASTFM_JSON_FORMAT,
	LASTFM_API, LASTFM_LIMIT, LASTFM_PAGE, LASTFM_DEFAULT_API
} from '../../helpers/constant';
import { Type } from '../../helpers/type';
import {
	parse_lastfm_artists, parse_lastfm_tracks, parse_lastfm_album_info,
	parse_lastfm_artist_info, parse_lastfm_albums, parse_lastfm_track_info
} from '../../helpers/collection';


export const search = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	const query = opts.query || null;
	if (query && api_key) {
		const page = opts.page || 1;
		const limit = opts.limit || 10;
		const auto_correct = opts.auto_correct || 0;

		const common = query + LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_LIMIT + limit + LASTFM_PAGE + page + LASTFM_API + api_key;

		const url_track = LASTFM_SEARCH_TRACK + common;
		const url_artist = LASTFM_SEARCH_ARTIST + common;
		const url_album = LASTFM_SEARCH_ALBUM + common;

		parallel({
			_artists: x => make_request(url_artist, x),
			_tracks: x => make_request(url_track, x),
			_albums: x => make_request(url_album, x)
		},
			(error, response) => {

				if (response) {
					const total = Math.max(response._tracks.results['opensearch:totalResults'],
						response._artists.results['opensearch:totalResults'],
						response._albums.results['opensearch:totalResults'])

					let next_page = page;
					if (total && (page * limit) < total) {
						next_page += 1;
					} else {
						next_page = null;
					}
					const data = {
						meta: { opts, total, next_page },
						result: {
							type: Type.LASTFM_SEARCH,
							artists: parse_lastfm_artists(response._artists.results.artistmatches.artist)
								.sort((a, b) => (b.listeners) - (a.listeners)),
							tracks: parse_lastfm_tracks(response._tracks.results.trackmatches.track)
								.sort((a, b) => (b.listeners) - (a.listeners)),
							albums: parse_lastfm_albums(response._albums.results.albummatches.album)
						}
					}

					callback(false, data);
				} else {
					callback(true, null);
				}
			});
	} else {
		callback(true, null);
	}
}

export const artist_info = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	const artist_name = opts.artist_name || null;
	if (api_key && artist_name) {
		const auto_correct = opts.auto_correct || 0;
		const common = artist_name + LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_API + api_key;

		const url_artist_info = LASTFM_ARTIST_INFO + common;

		parallel({
			_artist_info: x => make_request(url_artist_info, x),
		}, (error, response) => {
			if (response) {
				const artist = response._artist_info.artist;
				const data = {
					meta: { opts },
					result: parse_lastfm_artist_info(artist)
				}
				callback(true, data);
			} else {
				callback(true, null);
			}
		});
	} else {
		callback(true, null);
	}
}

export const album_info = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	const artist_name = opts.artist_name || null;
	const album_name = opts.album_name || null
	if (api_key && artist_name && album_name) {
		const auto_correct = opts.auto_correct || 0;
		const common = album_name + '&artist=' + artist_name + LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_API + api_key;

		const url_album_info = LASTFM_ALBUM_INFO + common;

		parallel({
			_album_info: x => make_request(url_album_info, x)
		}, (error, response) => {
			if (response) {
				const album = response._album_info.album;
				const data = {
					meta: { opts },
					result: parse_lastfm_album_info(album)
				}
				callback(true, data);
			} else {
				callback(true, null);
			}
		});
	} else {
		callback(true, null);
	}
}



export const track_info = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	const artist_name = opts.artist_name || null;
	const track_name = opts.track_name || null
	if (api_key && artist_name && track_name) {

		const auto_correct = opts.auto_correct || 0;
		const common = track_name + '&artist=' + artist_name + LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_API + api_key;

		const url_track_info = LASTFM_TRACK_INFO + common;

		parallel({
			_track_info: x => make_request(url_track_info, x)
		}, (error, response) => {
			if (response) {
				const track = response._track_info.track;
				const data = {
					meta: { opts },
					result: parse_lastfm_track_info(track)
				}
				callback(true, data);
			} else {
				callback(true, null);
			}
		});
	} else {
		callback(true, null);
	}
}


export const artist_top_albums = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	const artist_name = opts.artist_name || null;
	if (api_key && artist_name) {

		const auto_correct = opts.auto_correct || 0;
		const limit = opts.limit || 10;

		const common = artist_name + LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_API + api_key + LASTFM_LIMIT + limit;

		const url_artist_album = LASTFM_TOP_ARTIST_ALBUM + common;

		parallel({
			_artist_albums: x => make_request(url_artist_album, x)
		}, (error, response) => {
			if (response) {
				const data = {
					meta: { opts },
					result: {
						type: Type.LASTFM_SEARCH,
						albums: parse_lastm_albums(response._artist_albums.topalbums.album)
					}
				}
				callback(true, data);
			} else {
				callback(true, null);
			}
		});
	} else {
		callback(true, null);
	}
}



export const artist_top_tracks = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	const artist_name = opts.artist_name || null;
	if (api_key && artist_name) {

		const auto_correct = opts.auto_correct || 0;
		const limit = opts.limit || 10;

		const common = artist_name + LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_API + api_key + LASTFM_LIMIT + limit;

		const url_artist_track = LASTFM_TOP_ARTIST_TRACK + common;

		parallel({
			_artist_tracks: x => make_request(url_artist_track, x)
		}, (error, response) => {
			if (response) {
				const data = {
					meta: { opts },
					result: {
						type: Type.LASTFM_SEARCH,
						tracks: parse_lastfm_tracks(response._artist_tracks.toptracks.track)
					}
				}
				callback(true, data);
			} else {
				callback(true, null);
			}
		});
	} else {
		callback(true, null);
	}
}


export const trending_artist = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	if (api_key) {

		const auto_correct = opts.auto_correct || 0;
		const limit = opts.limit || 10;

		const common = LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_API + api_key + LASTFM_LIMIT + limit;

		const url_trending_artist = LASTFM_TOP_ARTISTS + common;

		parallel({
			_trending_artists: x => make_request(url_trending_artist, x)
		}, (error, response) => {
			if (response) {

				const data = {
					meta: { opts },
					result: {
						type: Type.LASTFM_SEARCH,
						artists: parse_lastfm_artists(response._trending_artists.artists.artist)
					}
				}
				callback(true, data);
			} else {
				callback(true, null);
			}
		});
	} else {
		callback(true, null);
	}
}

export const trending_tracks = (opts, callback) => {
	const api_key = opts.api_key || LASTFM_DEFAULT_API || null;
	if (api_key) {

		const auto_correct = opts.auto_correct || 0;
		const limit = opts.limit || 10;

		const common = LASTFM_AUTOCORRECT + auto_correct + LASTFM_JSON_FORMAT +
			LASTFM_API + api_key + LASTFM_LIMIT + limit;

		const url_trending_track = LASTFM_TOP_TRACKS + common;

		parallel({
			_trending_tracks: x => make_request(url_trending_track, x)
		}, (error, response) => {
			if (response) {
				const data = {
					meta: { opts },
					result: {
						type: Type.LASTFM_SEARCH,
						tracks: parse_lastfm_tracks(response._trending_tracks.tracks.track)
					}
				}
				callback(true, data);
			} else {
				callback(true, null);
			}
		});
	} else {
		callback(true, null);
	}
}


export const artist_artwork = (opts, callback) => {
	artist_info(opts, (e, s) => {
		if (s) {
			const data = {
				meta: s.meta,
				result: {
					type: Type.LASTFM_IMAGE,
					images: s.result.images
				}
			}
			callback(false, data);
		} else {
			callback(true, null);
		}
	})
}



export const album_artwork = (opts, callback) => {
	album_info(opts, (e, s) => {
		if (s) {
			const data = {
				meta: s.meta,
				result: {
					type: Type.LASTFM_IMAGE,
					images: s.result.images
				}
			}
			callback(false, data);
		} else {
			callback(true, null);
		}
	})
}
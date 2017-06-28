import { artist_artwork as d_artist_artwork, album_artwork as d_album_artwork } from '../providers/meta/deezer';
import { artist_artwork as l_artist_artwork, album_artwork as l_album_artwork } from '../providers/meta/lastfm';
import { track_artwork as y_track_artwork } from '../providers/meta/youtube';
//now first search info deezer then into lastfm

export const artist_artwork = (opts, callback) => {
	//while getting from deezer artist_name is required
	d_artist_artwork(opts, (error, response) => {
		if (error || (response && response.result && response.result.images.length < 1)) {
			//while getting from lastfm artist_name & api_key is required
			l_artist_artwork(opts, (err, res) => {
				callback(err, res);
			});
		} else {
			callback(error, response)
		}
	});
}

export const album_artwork = (opts, callback) => {
	//while getting from deezer album_name is required
	d_album_artwork(opts, (error, response) => {
		if (error || (response && response.result && response.result.images.length < 1)) {
			//while getting from lastfm artist_name, album_name & api_key is required
			l_album_artwork(opts, (err, res) => {
				callback(err, res);
			});
		} else {
			callback(error, response)
		}
	});
}

export const track_artwork = (opts, callback) => {
	y_track_artwork(opts, (error, response) => {
		callback(error, response);
	})
}
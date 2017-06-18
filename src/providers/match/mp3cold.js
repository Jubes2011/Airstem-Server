const request = require('request');
const cheerio = require('cheerio');
import { make_request } from '../../helpers/internet';
import {
	MP3COLD_BASE, MP3COLD_LAST
} from '../../helpers/constant';
import { Type } from '../../helpers/type';
import { get_closest_track_match } from '../../helpers/util';


export const match = (opts, callback) => {
	const name = opts.name || null;
	const artist_name = opts.artist_name || null;
	if (name || artist_name) {
		const common = (name && artist_name) ? `${artist_name.split(' ').join('-')}-${name.split(' ').join('-')}`
			: name ? name.split(' ').join('-') : artist_name.split(' ').join('-');

		const url_match = MP3COLD_BASE + common + MP3COLD_LAST;

		request(url_match, (error, response, html) => {
			if (!error && response.statusCode == 200) {
				// Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
				let items = [];
				const $html = cheerio.load(response.body);
				$html('div.news_list').children().each(function (i, e) {
					const attr = e.attribs.class || null;
					if (attr && attr.includes('show')) {
						const detail_div = $html(this).children();
						const download_div = detail_div.last().prev().children();
						items.push({
							type: Type.MP3COLD_TRACK,
							download_url: download_div.first().attr('href') + download_div.first().attr('download') || null,
							stream_url: download_div.first().attr('href') + download_div.first().attr('download') || null,
							song_length: null,
							title: detail_div.first().children().text() || null,
							bit_rate: detail_div.first().next().text().split('|')[0].trim().split(' ')[1] || null,
							size: detail_div.first().next().text().split('|')[2].trim().split(' ')[2] || null
						})
					}
				});

				items = items.filter(x => (x.title && x.title.trim())
					&& (x.download_url !== null && x.download_url !== undefined &&
						x.stream_url !== null && x.stream_url !== undefined));

				items = items.map(x => {
					return Object.assign(x, {
						download_url: 'http://www.mp3cold.com' + x.download_url,
						stream_url: 'http://www.mp3cold.com' + x.stream_url
					})
				})

				console.log(items);

				const data = {
					meta: { opts },
					result: {
						type: Type.MP3COLD_MATCH,
						match: opts.manual_match ? items : get_closest_track_match(common, items, 'title', 50)
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

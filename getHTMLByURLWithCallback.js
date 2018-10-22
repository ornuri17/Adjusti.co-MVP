// Properties
	// NPM Packages
		const rp = require('request-promise');
		const cheerio = require('cheerio');

module.exports = (URL, callback) => {
	return new Promise((resolve, reject) => {
		const options = {
		  uri: URL,
		  transform: async function (body) {
		    return await cheerio.load(body);
		  }
		};

		rp(options)
	  .then(async ($) => {
				resolve(await callback($));
	  	})
	  .catch((err) => {
	    console.log(err);
	  });
  });
}
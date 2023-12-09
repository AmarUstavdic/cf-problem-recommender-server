const cheerio = require('cheerio');


function findHandle(data, handle) {
    for (let i = 0; i < data.length; i++) {
        if (data.charAt(i) === handle.charAt(0)) {
            let found = true;
            for (let j = 1; j < handle.length; j++) {
                if (data.charAt(i + j) !== handle.charAt(j)) {
                    found = false;
                    break;
                }
            }
            if (found) {
                console.log('Welcome,', handle);
                return;
            }
        }
    }
    console.log('Handle not found:', handle);
}


function parseCsrf(data) {
    const $ = cheerio.load(data);
    return $('.csrf-token').attr('data-csrf');
}

function parseFtaa(data) {
    const ftaaRegex = /window\._ftaa\s*=\s*"([^"]+)"/;
    const ftaaMatch = data.match(ftaaRegex);
    return ftaaMatch ? ftaaMatch[1] : '';
}

function parseBfaa(data) {
    const bfaaRegex = /window\._bfaa\s*=\s*"([^"]+)"/;
    const bfaaMatch = data.match(bfaaRegex);
    return bfaaMatch ? bfaaMatch[1] : '';
}

module.exports = { findHandle, parseCsrf, parseFtaa, parseBfaa }
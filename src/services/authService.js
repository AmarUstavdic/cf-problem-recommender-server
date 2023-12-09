const userModel = require('../models/userModel');
const { findHandle, parseCsrf, parseFtaa, parseBfaa } = require('../utils/authServiceUtils')
const axios = require('axios');
const qs = require('qs');
const fs = require('fs').promises;
const tough = require('tough-cookie');
const CookieJar = tough.CookieJar;
const Cookie = tough.Cookie;


// storing cookie jars for users, since each user handle is unique we can use that
const userCookieJars = {};
function getCookieJarForUser(handle) {
    if (!userCookieJars[handle]) {
        userCookieJars[handle] = new CookieJar();
    }
    return userCookieJars[handle];
}




async function getUserByUsername(handle) {
    return userModel.getUserByUsername(handle);
}

async function authenticateCodeforcesUser(handle, password) {

    const cookieJar = getCookieJarForUser(handle);

    // configuration to get to login page of Codeforces
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://codeforces.com/enter',
        headers: {
            'authority': 'codeforces.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.6',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Chromium";v="118", "Brave";v="118", "Not=A?Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'sec-gpc': '1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
        }
    };

    let cookie;

    await axios.request(config)
        .then((response) => {
            console.log("get #01:", response.status, ' Getting Cookies')
            const setCookieHeaders = response.headers['set-cookie'];
            if (setCookieHeaders) {
                setCookieHeaders.forEach(setCookieHeader => {
                    const cookie = Cookie.parse(setCookieHeader, { loose: true });
                    cookieJar.setCookieSync(cookie, 'https://codeforces.com');
                });
            }
        })
        .catch((error) => {
            console.log(error);
        });

    config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://codeforces.com/enter',
        headers: {
            'authority': 'codeforces.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.6',
            'cache-control': 'no-cache',
            'cookie': cookieJar.getCookieStringSync('https://codeforces.com'),
            'pragma': 'no-cache',
            'sec-ch-ua': '"Chromium";v="118", "Brave";v="118", "Not=A?Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'sec-gpc': '1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
        }
    };


    let res;
    await axios.request(config).then((response) => {
        res = response.data
        console.log('get #02:', response.status, 'Getting csrf, ftaa and bfaa')

        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            setCookieHeaders.forEach(setCookieHeader => {
                const cookie = Cookie.parse(setCookieHeader, { loose: true });
                cookieJar.setCookieSync(cookie, 'https://codeforces.com');
            });
        }
    }).catch((error) => {
        console.log(error);
    });


    let csfr = parseCsrf(res);
    let ftaa = parseFtaa(res);
    let bfaa = parseBfaa(res);


    const qs = require('qs');
    let data = qs.stringify({
        'csrf_token': csfr,
        'action': 'enter',
        'ftaa': ftaa,
        'bfaa': bfaa,
        'handleOrEmail': handle,
        'password': password,
        '_tta': '91'
    });

    config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://codeforces.com/enter',
        headers: {
            'authority': 'codeforces.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.6',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            'cookie': cookieJar.getCookieStringSync('https://codeforces.com'),
            'origin': 'https://codeforces.com',
            'pragma': 'no-cache',
            'referer': 'https://codeforces.com/enter',
            'sec-ch-ua': '"Chromium";v="118", "Brave";v="118", "Not=A?Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Linux"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'sec-gpc': '1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
        },
        data: data
    };

    await axios.request(config)
        .then((response) => {
            console.log('post #03:', response.status, 'loging in');

            findHandle(response.data, handle);

            // Save the response.body to a file
            //fs.writeFile('data.html', response.data, 'utf-8');

            const setCookieHeaders = response.headers['set-cookie'];
            if (setCookieHeaders) {
                setCookieHeaders.forEach(setCookieHeader => {
                    const cookie = Cookie.parse(setCookieHeader, { loose: true });
                    cookieJar.setCookieSync(cookie, 'https://codeforces.com');
                });
            }

            console.log('Cookies: ', cookieJar.getCookieStringSync('https://codeforces.com'))
        })
        .catch((error) => {
            console.log(error);
        });

}





async function saveUser(user) {
    return userModel.saveUser(user);
}

module.exports = {
    getUserByUsername,
    authenticateCodeforcesUser,
    saveUser
};

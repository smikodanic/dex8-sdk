/**
 * $ node 31askJSON_POST.js <url> <body_str>
 * Example shows how to proceed body as a string in JSON format.
 */
const chalk = require('chalk');
const HttpClient = require('../HttpClient');
const url = process.argv[2];
const body_str = process.argv[3]; // this is String
console.log('asked url:: POST', url);


const getJSON = async() => {
  const opts = {
    encodeURI: false,
    timeout: 3000,
    retry: 1,
    retryDelay: 1300,
    maxRedirects: 0,
    headers: {
      'authorization': '',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36', // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
      'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      'cache-control': 'no-cache',
      'host': '',
      'accept-encoding': 'gzip',
      'connection': 'close', // keep-alive
      'content-type': 'text/html; charset=UTF-8'
    }
  };

  try {
    const dhc = new HttpClient(opts);
    const answer = await dhc.askJSON(url, 'POST', body_str);

    console.log('answer:\n', answer);

  } catch (err) {
    throw err;
  }
};


getJSON().catch(err => chalk.red(console.error(err)));





/**
 * $ node 01paresUrl.js <url>
 */

const HttpClient = require('../HttpClient');
const url = process.argv[2];

console.log('url:: ', url);

const opts = {
  encodeURI: true
};

const httpClient = new HttpClient(opts);
const url2 = httpClient._correctUrl(url);

console.log('corrected url:: ', url2);

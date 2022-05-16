/**
 * $ node 10askOnce_GET.js <url>
 * $ node 10askOnce_GET.js http://www.adsuu.com
 * $ node 10askOnce_GET.js http://api.dex8.com
 */
const chalk = require('chalk');
const util = require('util');
const HttpClient = require('../../helpers/httpClient/HttpClient');
const url = process.argv[2];

console.log('asked url:: GET', url);


const getUrl = async () => {
  const dhc = new HttpClient(); // dex8 http client instance
  const answer = await dhc.askOnce(url);
  console.log('answer:');
  console.log(util.inspect(answer, false, 3, true));
};


getUrl().catch(err => {
  console.log(chalk.red(err));
});





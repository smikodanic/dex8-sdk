/**
 * $ node 10askOnce_GET.js <url>
 */
const chalk = require('chalk');
const util = require('util');
const HttpClient = require('../HttpClient');
const url = process.argv[2];

console.log('asked url:: GET', url);


const getUrl = async() => {
  try {
    const dhc = new HttpClient(); // dex8 http client instance
    const answer = await dhc.askOnce(url);

    console.log('answer:');
    console.log(util.inspect(answer, false, 3, true));

  } catch (err) {
    throw err;
  }
};


getUrl().catch(err => {
  console.log(chalk.red(err));
});





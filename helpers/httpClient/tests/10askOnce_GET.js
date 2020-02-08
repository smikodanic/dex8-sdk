/**
 * $ node 10askOnce_GET.js <url>
 */

const HttpClient = require('../HttpClient');
const url = process.argv[2];

console.log('asked url:: GET', url);


const getUrl = async() => {
  try {
    const dhc = new HttpClient(); // dex8 http client instance
    const answer = await dhc.askOnce(url);

    console.log('answer:\n', answer);

  } catch (err) {
    throw err;
  }
};


getUrl().catch(console.error);





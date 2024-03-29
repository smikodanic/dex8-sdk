/**
 * $ node 21ask_GET.js <url>
 */
const util = require('util');
const HttpClient = require('../../helpers/httpClient/HttpClient');
const url = process.argv[2];

console.log('asked url:: GET', url);


const getUrl = async () => {

  const opts = {
    encodeURI: false,
    timeout: 8000,
    retry: 3,
    retryDelay: 5500,
    maxRedirects: 3,
    headers: {
      'authorization': '',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
      'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      'cache-control': 'no-cache',
      'host': '',
      'accept-encoding': 'gzip',
      'connection': 'close', // keep-alive
      'content-type': 'text/html; charset=UTF-8'
    }
  };


  try {
    const dhc = new HttpClient(opts); // dex8 http client instance
    const answer = await dhc.ask(url);

    console.log('answer:');
    console.log(util.inspect(answer, false, 3, true));

  } catch (err) {
    throw err;
  }
};


getUrl().catch(console.error);





const inquirer = require('inquirer');
const path = require('path');
const fse = require('fs-extra');
const { HttpClient } = require('../../index.js');


module.exports = async () => {

  const questions = [
    { type: 'input', name: 'username', message: 'username:', default: '' },
    { type: 'input', name: 'password', message: 'password', default: '' }
  ];

  try {

    // init httpClient
    const opts = {
      encodeURI: false,
      timeout: 3000,
      retry: 1,
      retryDelay: 1300,
      maxRedirects: 0,
      headers: {
        'authorization': '',
        'user-agent': 'DEX8-SDK',
        'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        'cache-control': 'no-cache',
        'host': '',
        'accept-encoding': 'gzip',
        'connection': 'close', // keep-alive
        'content-type': 'application/json; charset=UTF-8'
      }
    };
    const dhc = new HttpClient(opts);

    // send POST /sdk/login request
    const url = 'http://localhost:8001/sdk/login';
    const body =  await inquirer.prompt(questions); // {username, passsword}
    const answer = await dhc.askJSON(url, 'POST', body);


    // create config file
    const filePath = path.join(__dirname, '../../conf.js');
    const fileContent = 'module.exports = ' + JSON.stringify(answer.res.content, null, 2);
    await fse.ensureFile(filePath);
    await fse.writeFile(filePath, fileContent, {encoding: 'utf8'} );

    if (fse.pathExists(filePath)) {
      console.log(`Login was successful and ${filePath} was created.`);
    }


  } catch (err) {
    throw err;
  }

};

/**
 * Download DEX8 task.
 * $ dex8 download <task_id>
 */
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const { HttpClient } = require('../../index.js');
const config = require('../../config.js');



module.exports = async (task_id) => {
  const taskFolder = process.cwd();

  /*** 1) get conf.js  (which is created after successful login) ***/
  const confPath = path.join(taskFolder, 'conf.js');
  const tf = await fse.pathExists(confPath);
  if (!tf) { throw new Error(`File "conf.js" is not created. Please login.`); }
  const conf = require(confPath);

  /*** 2) send API request to /sdk/download/:task_id ***/
  // init httpClient
  const opts = {
    encodeURI: false,
    timeout: 3000,
    retry: 1,
    retryDelay: 1300,
    maxRedirects: 0,
    headers: {
      'authorization': conf.jwtToken,
      'user-agent': 'DEX8-SDK',
      'accept': 'application/json', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      'cache-control': 'no-cache',
      'host': '',
      'accept-encoding': 'gzip',
      'connection': 'close', // keep-alive
      'content-type': 'application/json; charset=UTF-8'
    }
  };
  const dhc = new HttpClient(opts);

  // send POST /sdk/login request
  const url = `${config.apiBaseURL}/sdk/download/${task_id}`;
  const answer = await dhc.askJSON(url, 'GET', {});
  // console.log(answer);

  const task = answer.res.content.task;
  const files = answer.res.content.files;
  if (!task) { throw new Error(`Task ${task_id} does not exists.`); }



  ///// 3) create JS files
  const promisesF = [];
  files.forEach(f => {
    console.log('Creating ', f.name);
    const filePath = path.join(taskFolder, f.name);
    const promis = fse.ensureFile(filePath).then(() => fse.writeFile(filePath, f.content, {encoding:'utf8', flag:'w'}));
    promisesF.push(promis);
  });


  await new Promise(resolve => setTimeout(resolve, 400)); // delay


  ///// 4) create manifest.json
  console.log('Creating manifest.json');
  const files2 = files.map(f => {
    // const f_cloned = Object.assign({}, f); // clone file object because we don't want to modify files array
    const f_cloned = {...f}; // clone file object because we don't want to modify files array
    delete f_cloned.content;
    delete f_cloned.user_id;
    delete f_cloned.task_id;
    delete f_cloned.created_at;
    delete f_cloned.updated_at;
    delete f_cloned.__v;
    delete f_cloned._id;
    return f_cloned;
  });
  const manifest = {
    title: task.title,
    description: task.description,
    thumbnail: task.thumbnail,
    category: task.category,
    files: files2,
    howto: ''
  };
  const filePath1 = path.join(taskFolder, 'manifest.json');
  const promis1 = fse.ensureFile(filePath1).then(() => fse.writeJson(filePath1, manifest, {spaces: 2}));
  promisesF.push(promis1);


  await new Promise(resolve => setTimeout(resolve, 400)); // delay


  ///// 5) create howto.html
  console.log('Creating howto.html');
  const filePath2 = path.join(taskFolder, 'howto.html');
  const promis2 = fse.ensureFile(filePath2).then(() => fse.writeFile(filePath2, task.howto, {encoding:'utf8', flag:'w'}));
  promisesF.push(promis2);


  await new Promise(resolve => setTimeout(resolve, 400));


  ///// 5) check if all files are created successfully
  return Promise.all(promisesF).catch(err => console.log(err));

};



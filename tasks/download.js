/**
 * Download dex8 task from command line.
 * $ node download 5ca624999f940fb607901836
 */
const BPromise = require('bluebird');
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const got = require('got');
const conf = require('./conf');
const authLib = require('../server/app/lib/authLib');


const download = async () => {

  ///// 1) get task
  const task_id = process.argv[2]; // 5ca624999f940fb607901836
  const url = `/customer/tasks/${task_id}`;
  const authorization = conf.api.authorization;
  const gotOpts = {
    baseUrl: conf.api.base_url,
    method: 'GET',
    headers: {authorization},
    json: true,
    followRedirect: false
  };
  const gotResponse = await got(url, gotOpts).catch(err => console.log(err)); // API request GET http://127.0.0.1:8001/api/customer/tasks/5ca624999f940fb607901836
  // console.log('\n\ngotResponse::', gotResponse);
  if (!gotResponse) {
    return console.log(chalk.red(`Task ${task_id} does not exists.`));
  } else if (gotResponse && gotResponse.statusCode !== 200) {
    return console.log(chalk.red('Status code is not 200.'));
  }

  const task = gotResponse.body.data;
  // console.log('task:: ', JSON.stringify(task, null, 4));

  const task_title2 = task.title.replace(/\s/g, '-');
  const task_category2 = task.category.replace(/\s/g, '-');
  const taskFolder = path.join(__dirname, task_category2, task_title2);
  // console.log(taskFolder);


  ///// 2) remove task folder if already exists
  await fse.remove(taskFolder);

  const promisesF = [];

  ///// 3) create JS files
  task.files.forEach(f => {
    console.log('Creating ', f.name);

    // decode secrets.js
    if (f.name === 'secrets.js') {
      f.content = authLib.base64ToStrStrong(f.content);
    }

    const filePath = path.join(taskFolder, f.name);
    const promis = fse.ensureFile(filePath).then(() => fse.writeFile(filePath, f.content, {encoding:'utf8', flag:'w'}));
    promisesF.push(promis);
  });


  await new BPromise(resolve => setTimeout(resolve, 400));


  ///// 4) create manifest.json
  console.log('Creating manifest.json');
  const files = task.files.map(f => {
    // const f_cloned = Object.assign({}, f); // clone file object because we don't want to modify task.files array
    const f_cloned = {...f}; // clone file object because we don't want to modify task.files array
    f_cloned.content = '';
    delete f_cloned._id;
    return f_cloned;
  });
  const manifest = {
    title: task.title,
    description: task.description,
    thumbnail: task.thumbnail,
    category: task.category,
    robot_ids: task.robot_ids,
    database_id: task.database_id,
    files,
    howto: ''
  };
  const filePath1 = path.join(taskFolder, 'manifest.json');
  const promis1 = fse.ensureFile(filePath1).then(() => fse.writeJson(filePath1, manifest, {spaces: 2}));
  promisesF.push(promis1);


  await new BPromise(resolve => setTimeout(resolve, 400));


  ///// 5) create howto.html
  console.log('Creating howto.html');
  const filePath2 = path.join(taskFolder, 'howto.html');
  const promis2 = fse.ensureFile(filePath2).then(() => fse.writeFile(filePath2, task.howto, {encoding:'utf8', flag:'w'}));
  promisesF.push(promis2);


  await new BPromise(resolve => setTimeout(resolve, 400));


  ///// 5) check if all files are created successfully
  return BPromise.all(promisesF).catch(err => console.log(err));

};


download()
  .then((res) => {
    if (!res) {
      console.log(chalk.red('Task files are NOT downloaded.'));
    } else {
      console.log(chalk.green('Task files are downloaded.'));
    }
  })
  .catch((err) => console.log(err));



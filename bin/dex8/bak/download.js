/**
 * Download DEX8 task from command line:
 * =====================================================
 * $ node download <task_id>
 * =====================================================
 * For example: $ node download 5ca624999f940fb607901836
 */
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const requestHTTP = require('./requestHTTP.js');
const conf = require('./conf.js');



const download = async () => {

  ///// 1) get task
  const task_id = process.argv[2]; // 5ca624999f940fb607901836
  if (!task_id) { throw new Error('task_id is not defined.'); }

  const url = conf.api.base_url + `/customer/tasks/download/terminal/${task_id}`;
  const Authorization = conf.api.authorization;
  const headers = {
    'Content-Type': 'application/json',
    Authorization
  };

  const httpResp = await requestHTTP(url, 'GET', headers); // {meta, data}
  if (!!httpResp && !!httpResp.data && !!httpResp.data.stack) {
    throw new Error(httpResp.data.message);
  }

  const task = httpResp.data.task;
  const files = httpResp.data.files;
  if (!task) { throw new Error(`Task ${task_id} does not exists.`); }



  ///// 2) remove task folder if already exists
  const taskFolder = path.join(__dirname, task.category, task.title);
  await fse.remove(taskFolder);



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


download()
  .then((res) => {
    console.log(chalk.green('Task files are downloaded.'));
  })
  .catch(err => {
    console.log(chalk.red(err.message));
    console.log(err);
  });



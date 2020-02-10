/**
 * This function upload files from a task.
 * Task and files are uploaded to mongoDB collections.
 */
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const requestHTTP = require('./requestHTTP.js');
const conf = require('./conf.js');
const cmd = process.argv[1]; // upload | uploadall


const uploadFunc = async (taskFolderParam) => {

  ///// 1) GET TASK folder
  let taskFolder; // <task_category>/<task_name>  e.g.  demo/001input
  if (/uploadall/.test(cmd)) { // $ node uploadall demo
    taskFolder = taskFolderParam;
  } else { // $ node upload demo/022database
    taskFolder = process.argv[2];
  }
  const upfiles = await fse.readdir(taskFolder);
  // console.log(upfiles);



  ///// 2) checks
  // check if files contain 'manifest' file
  const hasManifest = upfiles.find(fName => fName === 'manifest.json');
  if (!hasManifest) { console.log(chalk.red('Uploaded task must contain "manifest.json" file.')); return; }

  // check if files contain 'main' file
  const hasMain = upfiles.find(fName => fName === 'main.js');
  if (!hasMain) { console.log(chalk.red('Uploaded task must contain "main.js" file.')); return; }



  ///// 3) read manifest
  const manifestPath = path.join(taskFolder, 'manifest.json');
  const manifest = fse.readJsonSync(manifestPath);
  // console.log(manifest);



  ///// 4) define task_uploaded, object which will be sent to API
  const task_uploaded = manifest;
  for (let i = 0; i < upfiles.length; i++) {
    const fileName = upfiles[i]; // ['fileName']
    console.log('Reading ', fileName);

    const filePath = path.join(taskFolder, fileName);
    fse.readFile(filePath, 'utf8')
      .then(fileContent => {

        if (fileName === 'howto.html') { // howto.html
          task_uploaded.howto = fileContent;
        } else if (/.+\.js$/.test(fileName)) { // js files
          task_uploaded.files = task_uploaded.files.map(f => {
            if (f.name === fileName) {
              f.content = fileContent;
            }
            return f;
          });
        }

      })
      .catch(err => console.log(chalk.red(err)));

    await new Promise(resolve => setTimeout(resolve, 400)); // some time delay to read file and perform operations
  } // \for

  await new Promise(resolve => setTimeout(resolve, 400)); // some additional time delay before API request



  ///// 5) upload task_uploaded object
  // console.log('\ntask_uploaded:: ', task_uploaded);

  // API request POST http://127.0.0.1:8001/api/customer/tasks/upload
  const url = conf.api.base_url + '/customer/tasks/upload';
  const Authorization = conf.api.authorization;
  const headers = {
    'Content-Type': 'application/json',
    Authorization
  };
  const httpResp = await requestHTTP(url, 'POST', headers, task_uploaded); // {meta, data}
  // console.log(httpResp);

  return httpResp;



};






module.exports = uploadFunc;

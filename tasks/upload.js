/**
 * Upload dex8 task from command line.
 * $ node upload dex8-tests/001ff-serialAll
 */
const fse = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const got = require('got');
const conf = require('./conf');


/**** 1) GET TASK folder ****/
const taskFolder = process.argv[2]; // dex8-tests/ff-serialAll
const upfiles = fse.readdirSync(taskFolder);
// console.log(upfiles);


const upload = async () => {
  // check if files contain 'manifest' file
  const hasManifest = upfiles.find(fName => fName === 'manifest.json');
  if (!hasManifest) {console.log(chalk.red('Uploaded task must contain "manifest.json" file.')); return; }

  // check if files contain 'main' file
  const hasMain = upfiles.find(fName => fName === 'main.js');
  if (!hasMain) {console.log(chalk.red('Uploaded task must contain "main.js" file.')); return; }


  ///// 1) read manifest
  const manifestPath = path.join(taskFolder, 'manifest.json');
  const manifest = fse.readJsonSync(manifestPath);
  // console.log(manifest);


  ///// 2) define task_uploaded, object which will be sent to API
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

    await new Promise(resolve => setTimeout(resolve, 100)); // some time delay to read file and perform operations
  } // \for

  await new Promise(resolve => setTimeout(resolve, 100)); // some additional time delay before API request


  ///// 3) upload task_uploaded object
  console.log('\ntask_uploaded:: ', task_uploaded);
  const url = '/customer/tasks/upload';
  const authorization = conf.api.authorization;
  const gotOpts = {
    baseUrl: conf.api.base_url,
    method: 'POST',
    headers: {authorization},
    json: true,
    body: task_uploaded,
    followRedirect: false
  };
  const gotResponse = await got(url, gotOpts).catch(err => console.log(err)); // API request POST http://127.0.0.1:8001/api/customer/tasks/upload

  return gotResponse;

};


upload()
  .then(gotResponse => {
    // console.log('\n\ngotResponse::', gotResponse);
    if (!gotResponse) {
      console.log(chalk.red('Task is not uploaded.'));
    } else if (gotResponse && gotResponse.statusCode !== 200) {
      console.log(chalk.red('Status code is not 200.'));
    } else {
      console.log(chalk.green('Task is uploaded.'));
    }
  });

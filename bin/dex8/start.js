/**
 * Start dex8 task from command line.
 *
 * LONG ECHO PRINT
 * $ dex8 start
 *
 * SHORT ECHO PRINT
 * $ dex8 start --short
 */
const fse = require('fs-extra');
const moment = require('moment');

const path = require('path');
const dex8sdkPath = path.join(__dirname, '../../index.js');
const dex8sdk = require(dex8sdkPath);



/**
  * Get present time in short format
  */
const shortNow = () => {
  return moment().format('D.M.YYYY h:m:s');
};






module.exports = async (optionsObj) => {

  // option values
  const short = optionsObj.short;
  const input_selected = optionsObj.input;


  /**** 1) GET manifest.json ****/
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifest = require(manifestPath);


  /**** 2) GET TASK TITLE ****/
  const task_title = manifest.title;


  /**** 3) INITIALIZE helper INSTANCES ****/
  const ff = new dex8sdk.FunctionFlow();
  const echo = new dex8sdk.Echo();
  const mongo = new dex8sdk.Mongo();


  // string messages instead of whole object printed in linux console
  echo.short = !!short;



  /**** 4) send START message to console ****/
  echo.log(`Task "${task_title}" started on ${shortNow()}`);



  /**** 5) GET main & input ****/
  const mainPath = path.join(process.cwd(), 'main.js');
  const mainExists = await fse.pathExists(mainPath);
  if (!mainExists) { console.log(dex8sdk.chalk.red(`Task "${task_title}" does not have "main.js" file.`)); return;}
  // delete require.cache[mainPath];
  const main = require(mainPath);

  let input;
  if (!!input_selected) {
    const input_selectedPath = path.join(process.cwd(), input_selected);
    const inputExists = await fse.pathExists(input_selectedPath);
    if (!inputExists) { console.log(dex8sdk.chalk.red(`Input file does not exists: ${input_selected}`)); return;}
    // delete require.cache[input_selectedPath];
    input = require(input_selectedPath);
  }



  /**** 6) EXECUTE main ****/
  try {
    const lib = {...dex8sdk, ff, echo, mongo};
    const output = await main(input, lib);
    echo.log('output:: ', output);
    echo.log(`Task "${task_title}" is ended on ${shortNow()}`);
  } catch (err) {
    echo.error(err);
    await ff.delay(1300);
    echo.error(new Error(`Task "${task_title}" exited with error on ${shortNow()}`));
  }

};


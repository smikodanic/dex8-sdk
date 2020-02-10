/**
 * Start dex8 task from command line.
 *
 * LONG ECHO PRINT
 * $ dex8 start
 *
 * SHORT ECHO PRINT
 * $ dex8 start --short
 */
const path = require('path');
const moment = require('moment');
const fse = require('fs-extra');
const chalk = require('chalk');

const dex8sdkPath = path.join(__dirname, '../../index.js');
const { FunctionFlow, Echo, Mongo } = require(dex8sdkPath);



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


  /**** 1) GET mnifest.json ****/
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  const manifest = await fse.readJSON(manifestPath);


  /**** 2) GET TASK TITLE ****/
  const task_title = manifest.title;


  /**** 3) INITIALIZE helper INSTANCES ****/
  const ff = new FunctionFlow();
  const echo = new Echo();
  const mongo = new Mongo();

  // string messages instead of whole object printed in linux console
  echo.short = !!short;



  /**** 3) send START message to console ****/
  echo.log(`Task "${task_title}" started on ${shortNow()}`);



  /**** 4) GET main & input ****/
  const mainPath = path.join(process.cwd(), 'main.js');
  const mainExists = await fse.pathExists(mainPath);
  if (!mainExists) { console.log(chalk.red(`Task "${task_title}" does not have "main.js" file.`)); return;}
  // delete require.cache[mainPath];
  const main = require(mainPath);

  let input;
  if (!!input_selected) {
    const input_selectedPath = path.join(process.cwd(), input_selected);
    const inputExists = await fse.pathExists(input_selectedPath);
    if (!inputExists) { console.log(chalk.red(`Input file does not exists: ${input_selected}`)); return;}
    // delete require.cache[input_selectedPath];
    input = require(input_selectedPath);
  }



  /**** 6) EXECUTE main ****/
  try {
    const lib = {ff, echo, mongo};
    const output = await main(input, lib);
    // console.log('output:: ', output);
    echo.log(`Task "${task_title}" is ended on ${shortNow()}`);
  } catch (err) {
    echo.error(new Error(`Task "${task_title}" exited with error on ${shortNow()}`));
    await ff.delay(1300);
    echo.error(err);
  }

};

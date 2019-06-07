/**
 * Start dex8 task from command line.
 * $ node start 001ff-serialAll
 */
require('rootpath')();
const chalk = require('chalk');
const moment = require('moment');
const fse = require('fs-extra');
const dex8lib = require('../dex8lib');

// add to FunctionFlow library
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const got = require('got');
const BPromise = require('bluebird');




/**** 1) GET TASK TITLE ****/
const task_title = process.argv[2]; // dex8-tests/ff-serialAll


/**** 2) send START message to console ****/
const msg = `Task "${task_title}" is started on ${moment().toDate()}`;
console.log(chalk.green(msg));


/**** 3) GET main ****/
const mainPath = `./${task_title}/main.js`;
delete require.cache[mainPath]; // IMPORTANT!!! delete require cache because we want always to have updated task files
const main = require('./' + mainPath);


/**** 4) CREATE FunctionFlow INSTANCE ****/
const ff = new dex8lib.FunctionFlow();


/**** 5) INJECT LIBRARIES to FunctionFlow ****/
// dex8lib.TaskEcho
const taskEcho = new dex8lib.TaskEcho();
const echo = taskEcho.echo.bind(taskEcho);
const echoAct = taskEcho.echoAct.bind(taskEcho);
const echoMsg = taskEcho.echoMsg.bind(taskEcho);
const echoErr = taskEcho.echoErr.bind(taskEcho);
// dex8lib.Mongo
const dbPath = `./${task_title}/database.json`;
let mongo;
if (fse.existsSync(dbPath)) {
  const database = fse.readJSONSync(dbPath);
  const uri = `mongodb://${database.host_port}/${database.dbname}`;
  const username = database.username;
  const password = database.password;
  const options = database.options;
  const mo_config = {uri, username, password, options};
  mongo = new dex8lib.Mongo(mo_config, null, null, null);
}
// dex8lib.Randomize
const randomize = new dex8lib.Randomize();
//// inject
ff.libInject({ff, echo, echoAct, echoMsg, echoErr, mongo, randomize}); // dex8lib libraries
ff.libAdd({puppeteer, cheerio, got, chalk, BPromise, moment}); // external libraries


/**** 5) EXECUTE main ****/
main(ff)
  .then(output => {
    console.log('output:: ', output);
    exitTask();
  })
  .catch(err => {
    console.log('ERR-main:: ', err);
    exitTask();
  });



// exit nodejs process e.g. DEX8 task
const exitTask = () => {
  setTimeout(() => {
    console.log(chalk.green(`DEX8 Task "${task_title}" finished.`));
    process.exit();
  }, 2100);
};

#!/usr/bin/env node

const program = require('commander');
const pkg = require('../../package.json');

const args = process.argv;


const login = require('./login.js');
const init = require('./init.js');
const del = require('./del.js');
const start = require('./start.js');
const upload = require('./upload.js');




/**
 * Get dex8-sdk version.
 * $dex8 -v
 */
program
  .version(pkg.version)
  .option('-v --version', 'Print dex8 version.');


/**
 *Login with username:password and if succesful create ./conf.js config file.
 * $dex8 login
 */
program
  .command('login')
  .description('Login to DEX8 web panel and get JWT.')
  .action(login);


/**
 * Initialize new DEX8 task by coping folder "task_template".
 * $dex8 init <taskName>
 */
program
  .command('init <taskName>')
  .description('Initialize new task. Creates folder with initial files.')
  .action(init);


/**
 * Delete complete task. Be careful when using this.
 * $dex8 del <taskName>
 */
program
  .command('del <taskName>')
  .alias('delete')
  .description('Delete a task. Be careful with this command !!!')
  .action(del);


/**
 * Start DEX8 task
 * $dex8 start
 */
program
  .command('start')
  .option('-s, --short', 'Prints compact and short output.')
  .option('-i, --input <inp>', 'Select input file, for example "my_input.js".')
  .description('Start DEX8 task with or without input file.')
  .action(start);


/**
 * Upload DEX8 task
 * $dex8 upload                 - upload task from current working directory
 * $dex8 upload -t <taskName>   - upload task by name
 * $dex8 upload -all            - upload all DEX8 tasks
 */
program
  .command('upload')
  .alias('u')
  .description('Upload DEX8 task.')
  .option('-t, --task <taskName>', 'Upload a task defined by name.')
  .option('-a, --all', 'Upload all DEX8 tasks.')
  .action(upload);


/**
 * Download DEX8 task
 * $dex8 download   - downlaod task from current working directory
 */
program
  .command('download')
  .alias('d')
  .description('Download DEX8 task.')
  .option('-t, --task <taskName>', 'Download a task defined by name.')
  .option('-i, --id <task_id>', 'Download a task defined by _id.')
  .action(upload);






program.parse(args);

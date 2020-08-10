#!/usr/bin/env node

const program = require('commander');
const pkg = require('../../package.json');

const args = process.argv;


const login = require('./login.js');
const logout = require('./logout.js');
const init = require('./init.js');
const del = require('./del.js');
const start = require('./start.js');
const upload = require('./upload.js');
const update = require('./update.js');
const download = require('./download.js');


program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false);


/**
 * Get dex8-sdk version.
 * $dex8 -v
 */
program
  .version(pkg.version)
  .option('-v --version', 'Print dex8 version.');


/**
 * Login with username:password and if successful create "conf.js" config file.
 * $dex8 login
 */
program
  .command('login')
  .description('Login to DEX8 platform and create "conf.js".')
  .action(login);


/**
 * Logout e.g. delete "conf.js" file.
 * It is recommended to logout when developer finish with development job because "conf.js" file will be deleted with all sensitive data.
 * $dex8 login
 */
program
  .command('logout')
  .description('Logout e.g. delete "conf.js" file.')
  .action(logout);


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
  .command('delete <taskName>')
  .alias('rm')
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
 * Update task details
 * This command will update task details written in manifest.json and howto.html.
 * Altgough same can be done with "$dex8 upload" this is much faster because it will not change files.
 * $dex8 update
 */
program
  .command('update')
  .description('Update task details e.g. manifest.json and howto.html.')
  .action(update);


/**
 * Download DEX8 task
 * $dex8 download <task_id> - download task to current working directory
 * "task_id" is mongoDB ObjectId , for example: 5e20355c72cdfa2127619493
 */
program
  .command('download <task_id>')
  .alias('d')
  .description('Download DEX8 task.')
  .action(download);






program.parse(args);

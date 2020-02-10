#!/usr/bin/env node

const program = require('commander');
const pkg = require('../../package.json');

const args = process.argv;


const login = require('./login.js');
const init = require('./init.js');
const del = require('./del.js');





/**
 * Get dex8-sdk version.
 * $dex8 -v
 */
program.version(pkg.version)
  .option('-v --version', 'print pm2 version');

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
  .description('Delete a task. Be careful with this !!!')
  .action(del);






program.parse(args);

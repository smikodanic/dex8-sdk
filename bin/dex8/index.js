#!/usr/bin/env node

const program = require('commander');
const pkg = require('../../package.json');


const login = require('./login.js');



// version
program.version(pkg.version)
  .option('-v --version', 'print pm2 version');


const args = process.argv;


program
  .command('login')
  .description('Login to DEX8 web panel and get JWT.')
  .action(login);






program.parse(args);

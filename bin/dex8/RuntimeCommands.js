const readline = require('readline');
const chalk = require('chalk');
const path = require('path');
const fse = require('fs-extra');





class RuntimeCommands {

  constructor(ff) {
    this.ff = ff;
    this.flag;
  }



  /**
   * Listen for the runtime commands
   */
  listen() {

    // readline
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.on('line', async (line) => {
      line = line.replace(/\s+/g, ' ').trim();

      if (line === '') {
        // console.log('');
      } else if (line === 'p') {
        console.log(':paused\n');
        this._pause();
      } else if (line === 'r') {
        console.log(':resumed\n');
        this._resume();
      } else if (line === 's') {
        console.log(':stoped\n');
        this._stop();
      } else if (line === 'k') {
        console.log(':killed\n');
        this._kill();

      } else if (/input/i.test(line) && /\.json/i.test(line)) {
        console.log(':input loaded\n');
        this._loadInput(line);
      } else if (line === 'i') {
        this._showInput();

      } else if (line === 'x') {
        console.log(':show x');
        this._showX();
      } else if (/^x.*\=/.test(line)) {
        console.log(':set x field');
        this._setupXfield(line);

      } else if (line === 'e') {
        console.log(':eval');
        rl.prompt(); // show > prompt
        this.flag = 'eval';
      } else if (this.flag === 'eval') {
        this._evaluate(line); // > console.log('my test');
        this.flag = undefined; // reset flag

      } else if (line === 'f') {
        console.log(':func');
        rl.prompt(); // show > prompt
        this.flag = 'func';
      } else if (this.flag === 'func') {
        this._exeFunction(line); // > console.log(lib);
        this.flag = undefined; // reset flag

      } else {
        console.log(`:serial task(s) execution @status:${this.ff.status}\n`);
        if (this.ff.status === 'start') { this.ff.stop(); this.ff.start(); }
        else if (this.ff.status === 'stop') { this.ff.start(); }
        else if (this.ff.status === 'pause') { this.ff.status = 'stop'; this.ff.start(); }
        await this._exeSerial(line); // line: 'openLoginPage, login'
        this.ff.stop();
      }

    });
  }




  /************ PRIVATES *********/
  /**
   * Pause Functionflow functions.
   * Notice: currently running function will finish completely and next function will be paused.
   */
  _pause() {
    try {
      this.ff.pause();
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }


  /**
   * Resume paused Functionflow function.
   */
  _resume() {
    try {
      this.ff.start();
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }


  /**
   * Stop Functionflow function.
   */
  _stop() {
    try {
      this.ff.stop();
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }


  /**
   * Kill the NodeJS process.
   */
  _kill() {
    process.exit(1);
  }



  /**
   * Reload the input JSON file. Input must be injected into the ff.lib -> ff.LibAdd({input});
   * @param {String} inputFile - myInput2.json
   */
  _loadInput(inputFile) {
    try {
      const inputFile_path = path.join(process.cwd(), inputFile);
      delete require.cache[inputFile_path]; // IMPORTANT!!! Delete npm cache because we want to have fresh file data
      this.ff.lib.input = require(inputFile_path);
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }



  /**
   * Show the input JSON file. Input must be injected into the ff.lib -> ff.LibAdd({input});
   */
  _showInput() {
    try {
      console.log(this.ff.lib.input);
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }



  /**
   * Show the "x" a transitional variable.
   */
  _showX() {
    try {
      console.log(this.ff.x);
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }



  /**
   * Setup "x.field" value.
   * For example: x.product.name = ' Red car ' or x.product.name = " Red car"
   */
  _setupXfield(line) {
    try {
      const matched = line.match(/(.*)\s*=\s*(.*)/);

      // get property name
      const prop = matched[1].trim(); // x.product.name

      // get value
      let val = matched[2].trim(); // ' Red car '
      val = val.replace(/^\'/, '').replace(/\'$/, ''); // remove single quote '
      val = val.replace(/^\"/, '').replace(/\"$/, ''); // remove double quote "
      val = this._typeConvertor(val);

      const propSplitted = prop.split('.'); // ['x', 'product', 'name']
      let i = 1;
      let obj = this.ff;
      for (const prop of propSplitted) {
        if (i !== propSplitted.length) { // not last property
          obj[prop] = {};
          obj = obj[prop];
        } else { // on last property associate the value
          obj[prop] = val;
        }
        i++;
      }

      console.log(`new value:: ${prop} = ${val}`);

    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }


  /**
   * Convert string into integer, float or boolean.
   * @param {string} value
   * @returns {string | number | boolean | object}
   */
  _typeConvertor(value) {
    function isJSON(str) {
      try { JSON.parse(str); }
      catch (err) { return false; }
      return true;
    }

    if (!!value && !isNaN(value) && !/\./.test(value)) { // convert string into integer (12)
      value = parseInt(value, 10);
    } else if (!!value && !isNaN(value) && /\./.test(value)) { // convert string into float (12.35)
      value = parseFloat(value);
    } else if (value === 'true' || value === 'false') { // convert string into boolean (true)
      value = JSON.parse(value);
    } else if (isJSON(value)) {
      value = JSON.parse(value);
    }

    return value;
  }



  /**
    * Execute functions serially.
    * @param {String} files - 'login.js, extractData.js'
    */
  async _exeSerial(files) {

    const files_arr = files.split(',');

    try {

      const funcs = [];

      for (let f of files_arr) {

        f = f.trim();
        let file_path = path.join(process.cwd(), f);
        if (!/\.js/.test(f)) { file_path += '.js'; } // add .js extension

        const tf = await fse.pathExists(file_path); // check if file exists

        let func;
        if (tf) {
          delete require.cache[file_path]; // IMPORTANT!!! Delete npm cache because we want to have fresh file data
          func = require(file_path);
          funcs.push(func);
        } else {
          throw new Error(`Function NOT FOUND: ${file_path}`);
        }

      }

      await this.ff.serial(funcs);

    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }



  /**
   * Evaluate JS code. Simmilar to $node command.
   * @param {String} code - JS code
   */
  _evaluate(code) {
    try {
      eval(code);
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }



  /**
   * Execute FunctionFlow function code with x, lib parameters.
   * @param {String} ff_code - JS code for functionflow function (x, lib) => { ...ff_code... }
   */
  async _exeFunction(ff_code) {
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
      const func = new AsyncFunction('x', 'lib', ff_code);
      await this.ff.one(func);
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }







}


module.exports = RuntimeCommands;

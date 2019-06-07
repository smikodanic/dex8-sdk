/**
 * Control function flow.
 * There are 3 ways how to define functions;
 *
 * 1. ==== named ====
 * const funcDefs = [
 *  {name: 'fja1', desc: 'Fja1 description.', body: 'console.log(55)'},
 *  {name: 'fja2', desc: 'Fja2 description.', body: 'return Promise.resolve(x + 1)'}
 * ];
 *
 * 2. ==== anonymous ====
 * const funcDefs = [
 *  'console.log(55)',
 *  'return Promise.resolve(x + 1)'
 * ];
 *
 * 3. ==== function ====
 * function fja1(x){...}
 * const fja2 = function(x) {...};
 * const fja3 = (x) => {...}
 * const funcDefs = [fja1, fja2, fja3];
 */

const util = require('util');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const Randomize = require('../randomize/Randomize');
const randomize = new Randomize();


class FunctionFlow {

  constructor() {
    // general properties
    this.lastExecuted = {method: '', args: []}; // last executed method (used in repeatLast)
    this.delayID; // setTimeout ID
    this.acc = {}; // accumulator for using object properties inside defined functions function(x){this.acc.something = {a: 3, b: 8}}
    this.lib = {}; // injected libraries like Bluebird promises, Cheerio, Puppeteer, ...etc.

    // status properties
    this.status = 'start', // start | stop | pause
    this.msPause = 600000; // maximal pause interval: (600000 ms = 10 minutes)

    // repeat properties
    this.repeat = {
      i: 1, // iteration counter
      x: null
    };
  }


  /**
   * Register functions (named or anonymous) and create FunctionFlow object.
   * @param {Array} funcDefs
   * @return {Object} - FunctionFlow Object
   */
  register(funcDefs) {
    // convert function definitions into real functions
    if (this.areAllFunctions(funcDefs)) {
      this.funcs = funcDefs;
    } else if (this.areAllAnonymous(funcDefs)) {
      this.funcs = this.setAnonymousFunctions(funcDefs);
    } else if (this.areAllNamed(funcDefs)) {
      this.funcs = this.setNamedFunctions(funcDefs);
    } else {
      throw new Error('Some or all functions have bad definition.');
    }
  }



  /************************** C H E C K E R S ************************/

  /**
   * Check if all functions are functions.
   * @param funcDefs - array of function definitions
   */
  areAllFunctions(funcDefs) {
    if (!funcDefs) throw new Error('Functions are not defined.');
    const funcdefsFilt = funcDefs.filter(funcDef => {
      return (typeof funcDef === 'function');
    });
    const tf = (funcdefsFilt.length === funcDefs.length);
    // console.log('areAllFunctions:: ', tf);
    return tf;
  }

  /**
   * Check if all function definitions are anonymous.
   * @param funcDefs - array of function definitions
   */
  areAllAnonymous(funcDefs) {
    if (!funcDefs) throw new Error('Functions are not defined.');
    const funcdefsFilt = funcDefs.filter(funcDef => {
      return (typeof funcDef === 'string');
    });
    const tf = (funcdefsFilt.length === funcDefs.length);
    // console.log('areAllAnonymous:: ', tf);
    return tf;
  }

  /**
   * Check if all function definitions are named e.g. have funcdefs.name property.
   * @param funcDefs - array of function definitions
   */
  areAllNamed(funcDefs) {
    if (!funcDefs) throw new Error('Functions are not defined.');
    const funcdefsFilt = funcDefs.filter(funcDef => {
      return !!funcDef.name && (typeof funcDef == 'object');
    });
    const tf = (funcdefsFilt.length === funcDefs.length);
    // console.log('areAllNamed:: ', tf);
    return tf;
  }


  /************************** S E T T E R S   &   G E T T E R S ************************/

  /**
   * Convert function definitions into real functions.
   * @param {Array} funcDefs
   */
  setAnonymousFunctions(funcDefs) {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const funcs = funcDefs.map((funcDef, key) => { // 'return Promise.resolve(x + 1)'
      let func;
      try {
        func =  new AsyncFunction(['x', 'lib'], funcDef); // creates function(x) {return Promise.resolve(x + 1)}
      } catch (err) {
        throw new Error(`Anonymous function have bad definition. key: ${key}.`);
      }
      return func;
    });
    return funcs;
  }
  setNamedFunctions(funcDefs) {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const funcs = funcDefs.map((funcDef, key) => { // {name: 'fja2', body: 'return Promise.resolve(x + 1)'}
      let func;
      try {
        func = new AsyncFunction(['x', 'lib'], funcDef.body); // creates function(x) {return Promise.resolve(x + 1)}
      } catch (err) {
        throw new Error(`Named function key: ${key}, name: "${funcDef.name}" have bad definition.`);
      }
      func = this.setName(func, funcDef.name);
      return func;
    });
    return funcs;
  }


  /**
   * Set function name.
   * @param {Function} func
   * @param {String} funcName
   */
  setName(func, funcName) {
    Object.defineProperty(func, 'name', { value: funcName });
    return func;
  }

  /**
   * Get function name.
   * @param {Function} func
   */
  getName(func) {
    return func.name;
  }

  /**
   * Get function body.
   * @param {Function} func
   */
  getBody(func) {
    const content = func.toString();
    const body = content.match(/{[\w\W]*}/ig);
    return body[0];
  }

  /**
   * Get function as string.
   * @param {Function} func
   */
  getFuncStr(func) {
    return func.toString();
  }




  /************************** L I B R A R Y - this.lib ************************/

  /**
   * Inject libraries like Bluebird promises, Cheerio, Puppeteer, ...etc. and use it as lib.puppeteer inside function
   * @param {Object} lib - injected libraries used in func(x, lib) - {puppeteer, cherrio, ...}
   */
  libInject(lib) {
    this.lib = lib;
  }

  /**
   * Add libraries to libraries already injected by libInject()
   * @param {Object} lib2 - libraries which will be added to existing this.lib
   */
  libAdd(lib2) {
    this.lib = Object.assign(this.lib, lib2);
  }

  /**
   * Remove all libraries.
   */
  libEmpty() {
    this.lib = null;
  }

  /**
   * List all libraries.
   * @returns {Array}
   */
  libList() {
    const lib_arr = this.lib ? Object.keys(this.lib) : [];
    return lib_arr;
  }




  /****************************** S E R I A L ******************************/
  /*************************************************************************/

  /**
   * Execute all defined functions in serial order.
   * input------>|--func1-->|msDelay|--func2-->|msDelay|--func3-->|msDelay| ... |--funcEnd-->|msDelay|------>output
   *
   * @param {any} input - input value
   * @param {Number} msDelay - delay after each function in miliseconds
   * @param {Boolean} debug - print to console
   */
  async serialAll(input, msDelay, debug) {
    this.lastExecuted = {method: this.serialAll.name, args: Array.from(arguments)};
    let x = input;
    let i = 0;
    for (const func of this.funcs) {
      if (this.status === 'stop')  { break; } // breaks for() loop (stops all functions and exit)
      if (this.status === 'jumpfunction')  { if (this.jumpTo === i) {this.status = '';} else {i++; continue;} } // stop current function and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove();} // make big delay
      x = await func(x, this.lib);
      if (debug) this.debug(this.serialAll.name, i, msDelay, func, x);
      await this.delay(msDelay);
      this.delayRemove();
      i++;
    }
    return x;
  }

  /**
   * Execute range of defined functions (from-to) in serial order.
   *   (from=3, to=5)
   * input------>|--func3-->|msDelay|--func4-->|msDelay|--func5-->|msDelay|------>output
   * @param {any} input - input value
   * @param {Number} from - funcs array index
   * @param {Number} to - - funcs array index
   * @param {Number} msDelay - put delay after each function in miliseconds
   * @param {Boolean} debug - print to console
   */
  async serialRange(input, from, to, msDelay, debug) {
    this.lastExecuted = {method: this.serialRange.name, args: Array.from(arguments)};
    let x = input;
    let func;
    for (let i = from; i <= to; i++) {
      if (this.status === 'stop')  { break; } // breaks for() loop (stops all functions and exit)
      if (this.status === 'jumpfunction')  { if (this.jumpTo === i) {this.status = '';} else {continue;} } // stop current function and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove();} // make big delay
      func = this.funcs[i];
      x = await func(x, this.lib);
      if (debug) this.debug(this.serialRange.name, i, msDelay, func, x);
      await this.delay(msDelay);
      this.delayRemove();
    }
    return x;
  }

  /**
   * Take any defined function and execute in serial order. Those functions can be in any order.
   *    ([0,3,2])
   * input------>|--func0-->|msDelay|--func3-->|msDelay|--func2-->|msDelay|------>output
   * @param {any} input - input value
   * @param {Array} funcIndexes - indexes of selected functions [0, 3, 2]
   * @param {Number} msDelay - put delay after each function in miliseconds
   * @param {Boolean} debug - print to console
   */
  async serialAny(input, funcIndexes, msDelay, debug) {
    this.lastExecuted = {method: this.serialAny.name, args: Array.from(arguments)};
    let x = input;
    let func, i;
    for (let j = 0; j < funcIndexes.length; j++) { // j is index in [0,3,2]
      if (this.status === 'stop')  { break; } // breaks for() loop (stops all functions and exit)
      if (this.status === 'jumpfunction')  { if (this.jumpTo === j) {this.status = '';} else {continue;} } // stop current function and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove();} // make big delay
      i = +funcIndexes[j]; // i is index in funcDefs
      func = this.funcs[i];
      x = await func(x, this.lib);
      if (debug) this.debug(this.serialAny.name, i, msDelay, func, x);
      await this.delay(msDelay);
      this.delayRemove();
    }
    return x;
  }




  /***************************** P A R A L E L L *******************************/
  /*****************************************************************************/

  /**
   * Take any defined function and execute simultaneously. All defined functions must return fulfilled values.
   * Returned value is array.
   *          --> |--------- func2(x) ---------->   |
   * -- input --> |--------- func4(x) ------->      |msDelay|---> [r2, r4, r8]
   *          --> |--------- func8(x) ------------->|
   * @param {any} input - input value
   * @param {Array} funcIndexes - indexes of selected functions [2, 4, 8]
   * @param {Number} msDelay - put delay after last function is finished
   * @param {Boolean} debug - print to console
   */
  async parallelAny(input, funcIndexes, msDelay, debug) {
    const x = input;
    this.lastExecuted = {method: this.parallelAny.name, args: Array.from(arguments)};
    const promisArr = funcIndexes.map(funcIndex => {
      return this.funcs[funcIndex](x, this.lib);
    });
    const outputArr = await Promise.all(promisArr);
    if (debug) this.debug(this.parallelAny.name, 0, msDelay, {name: ''}, outputArr);
    await this.delay(msDelay);
    this.delayRemove();
    return outputArr;
  }



  /**
   * Run functions in paralell. First function must return fulfilled value.
   * Returned value is resolved value from first executed function.
   *          --> |--------- func2(x) --------|-->
   * -- input --> |--------- func4(x) ------->|msDelay|---> r4
   *          --> |--------- func8(x) --------|----->
   * @param {any} input - input value
   * @param {Array} funcIndexes - indexes of selected functions [2, 4, 8]
   * @param {Number} msDelay - put delay after last function is finished
   * @param {Boolean} debug - print to console
   */
  async parallelRace(input, funcIndexes, msDelay, debug) {
    const x = input;
    this.lastExecuted = {method: this.parallelRace.name, args: Array.from(arguments)};
    const promisArr = funcIndexes.map(funcIndex => {
      return this.funcs[funcIndex](x, this.lib);
    });
    const outputArr = await Promise.race(promisArr);
    if (debug) this.debug(this.parallelRace.name, 0, msDelay, {name: ''}, outputArr);
    await this.delay(msDelay);
    this.delayRemove();
    // process.nextTick(() => process.exit()); // should close all setTimeout(s)
    return outputArr;
  }




  /***************************** R E P E A T *******************************/
  /*************************************************************************/

  /**
   * Set input in function arguments.
   * @param {any} input
   */
  setArgInput(args, input) {
    args.shift(); // remove first element from beginning of array e.g. remove 'input'
    args.unshift(input); // add 'input' argument to the beginning of 'args' array
    return args;
  }

  /**
   * Repeat last executed FunctionFlow method n times.
   * |--serialAll-->|--serialRange-->|--serialAny-------------->|msDelay|----> output
   *                                 |                          |1     n|
   *                                 |<------repeatLast n-------|<------|
   * @param {any} input - input value
   * @param {Number} n - how many times to repeat last method
   * @param {Number} msDelay - delay after each iteration
   * @param {Boolean} debug - print to console
   */
  async repeatLast(input, n, msDelay, debug) {
    let x = input;
    const method = this.lastExecuted.method;
    let args = this.setArgInput(this.lastExecuted.args, x);

    for (let i = 1; i <= n; i++) {
      if (this.status === 'stop')  { break; } // breaks for() loop
      if (this.status === 'jumprepeat')  { if (this.jumpTo === i) {this.status = '';} else {continue;} } // stop current iteration and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove();} // make big delay

      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatLast/' + method, util.inspect(args, {depth: 0, colors: true}));

      x = await this[method](...args);
      args = this.setArgInput(args, x);

      this.repeat.i = i;
      this.repeat.x = x;

      await this.delay(msDelay);
      this.delayRemove();
    }
    return x;
  }

  /**
   * Repeat FunctionFlow method n times.
   * for() loop is used.
   * input-->|--'serialRange'---------->|msDelay|----> output
   *         |                          |1     n|
   *         |<------repeatFor n--------|<------|
   * @param {Object} execute - define what to execute {method: 'serialRange', args: [input, from, to, msDelay, debug]}
   * @param {Number} n - number of iterations
   * @param {Number} msDelay - delay after each iteration
   * @param {Boolean} debug - print to console
   */
  async repeatFor(execute, n, msDelay, debug) {
    let x = this.repeat.input || execute.args[0]; // input
    execute.args = this.setArgInput(execute.args, x);
    for (let i = this.repeat.i; i <= n; i++) {
      if (this.status === 'stop')  { break; } // breaks for() loop
      if (this.status === 'jumprepeat')  { if (this.jumpTo === i) {this.status = '';} else {continue;} } // stop current iteration and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove();} // make big delay

      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatFor/' + execute.method, util.inspect(execute.args, {depth: 0, colors: true}), this.repeat);

      x = await this[execute.method](...execute.args);
      execute.args = this.setArgInput(execute.args, x);

      this.repeat.i = i;
      this.repeat.x = x;

      await this.delay(msDelay);
      this.delayRemove();
    }
    return x;
  }


  /**
   Take any defined function and execute in serial order. Those functions can be in any order.
   Repeat process n times. Output of previous iteration is input for next iteration.

   *   ([0,3,2])
   * input------>|--func0-->|msDelay|--func3-->|msDelay|--func2-->|msDelay|------>output
   *          |                                                                |
   *          |<---------------------------- n --------------------------------|
   *
   * @param {any} input - input value
   * @param {Array} funcIndexes - indexes of selected functions [0, 3, 2]
   * @param {Number} msDelay - put delay after each function in miliseconds
   * @param {Boolean} debug - print to console
   */
  async repeatAny(input, funcIndexes, n, msDelay, debug) {
    let x = input; // input

    /* execute iterations */
    for (let i = this.repeat.i; i <= n; i++) {
      if (this.status === 'stop')  { break; } // breaks for() loop
      if (this.status === 'jumprepeat')  { if (this.jumpTo === i) {this.status = '';} else {continue;} } // stop current iteration and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove();} // make big delay

      this.repeat.i = i;
      this.repeat.x = x;
      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatAny', this.repeat);

      /* execute functions one by one, serially */
      const serialAnyFunction = async () => {
        let y = x, funcInd, func; // output of previous iteration is input for next iteration
        for (let j = 0; j < funcIndexes.length; j++) {
          if (this.status === 'stop')  { break; } // breaks while() loop
          if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove();} // make big delay
          funcInd = funcIndexes[j];
          func = this.funcs[funcInd];
          y = await func(y, this.lib);
          if (debug) this.debug(func.name, funcInd, msDelay, func, y);
          await this.delay(msDelay);
          this.delayRemove();
        }
        return y; // output is returned to next iteration
      };

      x = await serialAnyFunction();

    }

    return x;
  }


  /**
   * Repeat FunctionFlow method n times in background.
   * Input is forwad to output immediatelly and will not wait for repeatInterval to finish.
   * This method is not sending output but accumulate it in this.acc property.
   * Useful to run some iteration in background. This method can not be controlled with start, stop, pause and jump.
   * setInterval() is used.
   * input--> -------------------------------> ----> output
   *      -->|msDelay|--'serialRange'-------->|
   *         |                                |
   *         |<--------repeatInterval n-------|
   * @param {Object} execute - define what to execute {method: 'serialRange', args: [input, from, to, msDelay, debug]}
   * @param {Number} n - number of iterations
   * @param {Number} msDelay - delay before each iteration
   * @param {Boolean} debug - print to console
   */
  async repeatInterval(execute, n, msDelay, debug) {
    let x = execute.args[0]; // input
    execute.args = this.setArgInput(execute.args, x);
    let i = 1;
    const intervalID = setInterval(async () => {
      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatInterval/' + execute.method, util.inspect(execute.args, {depth: 0, colors: true}));
      x = await this[execute.method](...execute.args);
      execute.args = this.setArgInput(execute.args, x);
      this.iteration = i;
      if (i === n) { // on last iteration
        clearInterval(intervalID);
        this.acc.repeatInterval = x;
      } else {
        i += 1;
      }
    }, msDelay);
    return x;
  }




  /*************************** C O M M A N D S ****************************/
  /************************************************************************/

  /**
   * Stop repetitions.
   */
  stop(debug) {
    this.status = 'stop';
    if (debug) console.log('=== STOP ===');
    return this.status;
  }


  /**
   * Pause repetitions.
   */
  pause(debug) {
    this.status = 'pause';
    if (debug) console.log('=== PAUSE ===');
    return this.status;
  }


  /**
   * Start/restart repetitions.
   */
  start(debug) {
    this.status = 'start';
    if (debug) console.log('=== START/RESTART ===');
    eventEmitter.emit('start');
    return this.status;
  }


  /**
   * Stop current repetition, and jump to other one.
   * @param {Number} i - function index of funcs array or repeat iteration number (determines to which function or repeat iteration to jump)
   * @param {String} jumpType - 'function' | 'repeat' (jumping type)
   *
   * Caution:
   *   Most common mistake is in serialAny(input, funcIndexes, msDelay, debug) where you should use index of funcIndexes array, not index off funcs array !!!
   */
  jump(i, jumpType, debug) {

    if (jumpType === 'function' || jumpType === 'repeat') {
      this.status = 'jump' + jumpType;
    } else {
      this.status = 'jumpfunction'; // default
    }

    this.jumpTo = i;
    if (debug) console.log('=== JUMP to ' + jumpType + ' ' + i + ' ===');
    return [this.status, this.i];
  }


  /**
   * Make delay.
   * @param {Number} msDelay - delay in miliseconds. If msDelay=-1 then infinite delay.
   */
  delay(msDelay) {
    const promis = new Promise(resolve => {
      this.delayID = setTimeout(resolve, msDelay);

      if (this.status === 'pause') {
        eventEmitter.on('start', () => {
          resolve();
        });
      }

    });
    return promis;
  }



  /**
   * Randomize delay between min and max miliseconds.
   * @param {Number} msDelayMin - min miliseconds: 3000
   * @param {Number} msDewlayMax - max miliseconds: 5000
   */
  delayRnd(msDelayMin, msDelayMax) {
    const msDelay = randomize.integerBetween(msDelayMin, msDelayMax);
    return this.delay(msDelay);
  }



  /**
   * Remove delay instantly.
   */
  delayRemove() {
    clearTimeout(this.delayID);
  }




  /*************************** H E L P E R S ******************************/
  /************************************************************************/

  /**
   * Debug function execution.
   * @param {Number} i
   * @param {Function} func
   * @param {Mixed} x
   */
  debug(methodName, i, msDelay, func, x) {
    console.info('--- ' + methodName + ' --- [' + i + '](' + msDelay + ') ' + func.name + ' -> ' + util.inspect(x, {depth: 0, colors: true}) + '\n');
  }


}




module.exports = FunctionFlow; // CommonJS Modules
// export { FunctionFlow }; // ES6 module

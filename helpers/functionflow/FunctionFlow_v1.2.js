/**
 * Control function flow.
 * There are 3 ways how to define functions;
 *
 * 1. ==== function ====
 * function fja1(x){...}
 * const fja2 = function(x) {...};
 * const fja3 = (x) => {...}
 * const funcDefs = [fja1, fja2, fja3];
 *
 *
 * 2. ==== anonymous ====
 * const funcDefs = [
 *  'console.log(55)',
 *  'return Promise.resolve(x + 1)'
 * ];
 *
 *
 * 3. ==== named ====
 * const funcDefs = [
 *  {name: 'fja1', desc: 'Fja1 description.', body: 'console.log(55)'},
 *  {name: 'fja2', desc: 'Fja2 description.', body: 'return Promise.resolve(x + 1)'}
 * ];
 *
 */

const util = require('util');
const events = require('events');
const eventEmitter = new events.EventEmitter();




class FunctionFlow {

  constructor() {
    this.funcs = [];

    // general properties
    this.lastExecuted = {method: '', args: []}; // last executed FunctionFlow method (used in repeatLastMethod)
    this.delayID; // setTimeout ID
    this.acc = {}; // accumulator for using object properties inside defined functions function(x){this.acc.something = {a: 3, b: 8}} (used in repeatInBackground
    this.lib = {}; // injected libraries like Bluebird promises, Cheerio, Puppeteer, ...etc.

    // status properties
    this.status = 'start', // start | stop | pause | 'next' | 'jumpfunction' | 'jumprepeat'
    this.msPause = 365 * 24 * 60 * 60 * 1000; // maximal pause interval: (31 536 000 000 ms = 365 days)
    this.jumpTo = undefined; // jump to which function index or repeat iteration

    // repeat properties
    this.repeat = {
      i: 0, // iteration counter
      x: null
    };
  }


  /**
   * Register functions (named or anonymous) and create FunctionFlow object.
   * @param {Array} funcDefs
   * @return {any} - FunctionFlow Object
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
      this.funcs = [];
      throw new Error('Some or all functions have bad definition.');
    }
  }



  /*============================== C H E C K E R S ==============================*/

  /**
   * Check if all function definitions are real functions.
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



  /*============================== S E T T E R S   &   G E T T E R S ==============================*/

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




  /*============================== L I B R A R Y - this.lib ==============================*/

  /**
   * Inject libraries like Bluebird promises, Cheerio, Puppeteer, ...etc. and use it as lib.puppeteer inside function
   * @param {any} lib - injected libraries used in func(x, lib) - {puppeteer, cherrio, ...}
   */
  libInject(lib) {
    this.lib = lib;
  }

  /**
   * Add libraries to libraries already injected by libInject()
   * @param {any} lib2 - libraries which will be added to existing this.lib
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





  /*============================== FUNCTION  METHODS ==============================*/

  /****************************** A) S E R I A L ******************************/
  /**
   * Execute certain function
   * @param {*} x
   * @param {*} i
   * @param {*} debug
   * @param {*} msDelay
   */
  async exeFunc(x, msDelay, debug, methodName, i) {
    const func = this.funcs[i];
    x = await func(x, this.lib);
    if (debug) this.debug(methodName, i, msDelay, func, x);
    await this.delay(msDelay);
    this.delayRemove();
    return x;
  }

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
    for (let i = 0; i < this.funcs.length; i++) {
      if (this.status === 'stop') { break; } // breaks for() loop (stops all functions and exit)
      if (this.status === 'pause') { await this.delay(this.msPause); this.delayRemove(); } // make big delay
      if (this.status === 'jumpfunction') { if (this.jumpTo === i) {this.status = 'start';} else {continue;} } // stop current function and jump to another
      if (this.status === 'next') { this.status = 'start'; break; } else { x = await this.exeFunc(x, msDelay, debug, this.serialAll.name, i); } // stop this method and continue with next
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
    for (let i = from; i <= to; i++) {
      if (this.status === 'stop') { break; } // breaks for() loop (stops all functions and exit)
      if (this.status === 'pause') { await this.delay(this.msPause); this.delayRemove(); } // make big delay
      if (this.status === 'jumpfunction') { if (this.jumpTo === i) {this.status = 'start';} else {continue;} } // stop current function and jump to another
      if (this.status === 'next') { this.status = 'start'; break; } else { x = await this.exeFunc(x, msDelay, debug, this.serialRange.name, i); } // stop this method and continue with next
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
    for (let j = 0; j < funcIndexes.length; j++) { // j is index in [0,3,2]
      const i = +funcIndexes[j]; // i is index in funcDefs e.g. of this.funcs
      if (this.status === 'stop') { break; } // breaks for() loop (stops all functions and exit)
      if (this.status === 'pause') { await this.delay(this.msPause); this.delayRemove(); } // make big delay
      if (this.status === 'jumpfunction') { if (this.jumpTo === j) {this.status = 'start';} else {continue;} } // stop current function and jump to another
      if (this.status === 'next') { this.status = 'start'; break; } else { x = await this.exeFunc(x, msDelay, debug, this.serialAny.name, i); } // stop this method and continue with next
    }
    return x;
  }



  /**
   * Execute just one function.
   * input------>|--func1-->|msDelay|-------->output
   * @param {any} input - input value
   * @param {Number} i - funcs array index
   * @param {Number} msDelay - put delay after each function in miliseconds
   * @param {Boolean} debug - print to console
   */
  async one(input, i, msDelay, debug) {
    this.lastExecuted = {method: this.one.name, args: Array.from(arguments)};
    let x = input;
    if (this.status === 'stop')  { return x; }
    if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove(); } // make big delay
    x = await this.exeFunc(x, msDelay, debug, this.one.name, i);
    return x;
  }




  /***************************** B) P A R A L E L L *******************************/

  /**
   * Take any defined function and execute simultaneously. All defined functions must return fulfilled promises.
   * Returned value is an array of resolved values.
   *          --> |--------- func2(x) ---------->---|
   * -- input --> |--------- func4(x) ------->------|msDelay|---> [r2, r4, r8]
   *          --> |--------- func8(x) ------------->|
   * @param {any} input - input value
   * @param {Array} funcIndexes - indexes of selected functions [2, 4, 8]
   * @param {Number} msDelay - put delay after last function is finished
   * @param {Boolean} debug - print to console
   */
  async parallelAnyAll(input, funcIndexes, msDelay, debug) {
    const x = input;
    this.lastExecuted = {method: this.parallelAnyAll.name, args: Array.from(arguments)};
    const promisArr = funcIndexes.map(funcIndex => {
      return this.funcs[funcIndex](x, this.lib);
    });
    const outputArr = await Promise.all(promisArr);
    if (debug) this.debug(this.parallelAnyAll.name, 0, msDelay, {name: ''}, outputArr);
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
  async parallelAnyRace(input, funcIndexes, msDelay, debug) {
    const x = input;
    this.lastExecuted = {method: this.parallelAnyRace.name, args: Array.from(arguments)};
    const promisArr = funcIndexes.map(funcIndex => {
      return this.funcs[funcIndex](x, this.lib);
    });
    const output = await Promise.race(promisArr);
    if (debug) this.debug(this.parallelAnyRace.name, 0, msDelay, {name: ''}, output);
    await this.delay(msDelay);
    this.delayRemove();
    // process.nextTick(() => process.exit()); // should close all setTimeout(s)
    return output;
  }




  /*============================== ITERATION  METHODS ==============================*/

  /**
   * Set input for function method (serialAll, serialRange, serialAny, parallelAny, parallelRace, ...) on every new iteration (repeat).
   * Output of last function in repeat method will be input of first function in that repeat method.
   * @param {Array} args - array of FunctionFlow method arguments
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
   *                                 |<------repeatLastMethod n-------|<------|
   * @param {any} input - input value
   * @param {Number} n - how many times to repeat last method
   * @param {Number} msDelay - delay after each iteration
   * @param {Boolean} debug - print to console
   */
  async repeatLastMethod(input, n, msDelay, debug) {
    let x = input;
    const method = this.lastExecuted.method;
    let args = this.setArgInput(this.lastExecuted.args, x);

    for (let i = 1; i <= n; i++) {
      if (this.status === 'stop')  { break; } // breaks for() loop
      if (this.status === 'jumprepeat')  { if (this.jumpTo === i) {this.status = 'start';} else {continue;} } // stop current iteration and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove(); } // make big delay

      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatLastMethod/' + method, util.inspect(args, {depth: 0, colors: true}));

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
   * @param {any} execute - define what to execute, for example: {method: 'serialRange', args: [input, from, to, msDelay, debug]}
   * @param {Number} n - number of iterations
   * @param {Number} msDelay - delay after each iteration
   * @param {Boolean} debug - print to console
   */
  async repeatMethod(execute, n, msDelay, debug) {
    let x = this.repeat.input || execute.args[0]; // input
    execute.args = this.setArgInput(execute.args, x);
    for (let i = 1; i <= n; i++) {
      if (this.status === 'stop')  { break; } // breaks for() loop
      if (this.status === 'jumprepeat')  { if (this.jumpTo === i) {this.status = 'start';} else {continue;} } // stop current iteration and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove(); } // make big delay

      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatMethod/' + execute.method, util.inspect(execute.args, {depth: 0, colors: true}), this.repeat);

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
   * Select defined functions in any order and execute them serially n times.
   * Output of previous iteration is input for next iteration.
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
  async repeatAnyFunction(input, funcIndexes, n, msDelay, debug) {
    let x = input; // input

    /* execute iterations */
    for (let i = 1; i <= n; i++) {
      if (this.status === 'stop')  { break; } // breaks for() loop
      if (this.status === 'jumprepeat')  { if (this.jumpTo === i) {this.status = 'start';} else {continue;} } // stop current iteration and jump to another
      if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove(); } // make big delay

      this.repeat.i = i;
      this.repeat.x = x;
      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatAnyFunction', this.repeat);

      /* execute functions one by one, serially */
      const serialAnyFunction = async () => {
        let y = x; // output of previous iteration is input for next iteration
        let funcInd;
        let func;
        for (let j = 0; j < funcIndexes.length; j++) {
          if (this.status === 'stop')  { break; } // breaks while() loop
          if (this.status === 'pause')  { await this.delay(this.msPause); this.delayRemove(); } // make big delay
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
   * Input is forwad to output immediatelly and will not wait for repeatInBackground to finish.
   * This method is not sending output but accumulate it in this.acc property.
   * Useful to run some iteration in background. This method can not be controlled with start, stop, pause and jump.
   * setInterval() is used.
   * input--> -------------------------------> ----> output
   *      -->|msDelay|--'serialRange'-------->|
   *         |                                |
   *         |<--------repeatInBackground n-------|
   * @param {any} execute - define what to execute {method: 'serialRange', args: [input, from, to, msDelay, debug]}
   * @param {Number} n - number of iterations
   * @param {Number} msDelay - delay before each iteration
   * @param {Boolean} debug - print to console
   */
  async repeatInBackground(execute, n, msDelay, debug) {
    let x = execute.args[0]; // input
    execute.args = this.setArgInput(execute.args, x);
    let i = 1;
    const intervalID = setInterval(async () => {
      if (debug) console.log('\n-------------- ' + i + '. (' + msDelay + ') repeatInBackground/' + execute.method, util.inspect(execute.args, {depth: 0, colors: true}));
      x = await this[execute.method](...execute.args);
      execute.args = this.setArgInput(execute.args, x);
      this.iteration = i;
      if (i === n) { // on last iteration
        clearInterval(intervalID);
        this.acc.repeatInBackground = x;
      } else {
        i += 1;
      }
    }, msDelay);
    return x;
  }




  /*============================== COMMANDS ==============================*/

  /**
   * Stop FunctionFlow.
   */
  stop(debug) {
    this.status = 'stop';
    if (debug) this.debug2(this.stop.name);
  }


  /**
   * Pause FunctionFlow.
   */
  pause(debug) {
    this.status = 'pause';
    if (debug) this.debug2(this.pause.name);
  }


  /**
   * Start/restart FunctionFlow.
   */
  start(debug) {
    this.status = 'start';
    if (debug) this.debug2(this.start.name);
    eventEmitter.emit('start');
  }


  /**
   * Jump to serial function forward. Can't jump backward.
   * Jump to certain function defined in serial... method (serialAll, serialRange, serialAny ...etc.)
   * and continue with other functions used in serie.
   * @param {Number} i - function index of funcs array (0,1,2,3,...)
   * NOTICE:
   *  1) i must be contained within defined method: serialRange, serialAny,
   *  2) For parameter i in serialAny(input, funcIndexes, msDelay, debug) use index of funcIndexes array, not index off funcs array
   *  3) jumpFunction can not go backward. For example if jumpFunction is used in function with index 3 then we can not use jumpFunction(2).
   */
  jumpFunction(i, debug) {
    this.status = 'jumpfunction';
    this.jumpTo = i; // index of funcs[] array or funcIndexes[] array if serialAny() is used
    if (debug) this.debug2(`JUMP to function i:${i}`); // i >= 0 (0,1,2,3,...)
  }


  /**
   * Jump to repeat iteration number.
   * Stop current repetition (iteration), and jump to another.
   * @param {Number} i - repeat iteration number (0,1,2,3,...) e.g. this.repeat.i;
   */
  jumpRepeat(i, debug) {
    this.status = 'jumprepeat';
    this.jumpTo = i; // iteration number
    if (debug) this.debug2(`JUMP to repeat iteration i:${i}`); // i > 0 (1,2,3,...)
  }


  /**
   * Stop current FunctionFlow, serial method and continue with next serial or parallel method.
   * Use it as ff.next(false) inside function.
   * @param {any} input - input value
   * @param {Boolean} debug - print to console
   */
  next(debug) {
    this.status = 'next';
    if (debug) this.debug2(this.next.name);
  }





  /*============================== TIME HELPERS ==============================*/

  /**
   * Make delay.
   * @param {Number} msDelay - delay in miliseconds. If msDelay=-1 then infinite delay.
   */
  delay(msDelay) {
    const promis = new Promise(resolve => {

      if (this.status === 'pause') {
        eventEmitter.on('start', () => {
          resolve();
        });
      } else {
        this.delayID = setTimeout(resolve, msDelay);
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
    const diff = msDelayMax - msDelayMin;
    let msDelay = msDelayMin + diff * Math.random(); // Math.random() gives number between 0 and 1
    msDelay = Math.round(msDelay);
    return this.delay(msDelay);
  }



  /**
   * Remove delay instantly.
   */
  delayRemove() {
    clearTimeout(this.delayID);
  }




  /*============================== HELPERS ==============================*/

  /**
   * Debug function execution.
   * @param {Number} i
   * @param {Function} func
   * @param {Mixed} x
   */
  debug(methodName, i, msDelay, func, x) {
    console.log('--- ' + methodName + ' --- [' + i + '](' + msDelay + ') ' + func.name + ' -> ' + util.inspect(x, {depth: 0, colors: true}) + '\n');
  }


  /**
   * Debug function execution.
   * @param {String} methodName
   */
  debug2(methodName) {
    console.log('   ===' + methodName + '===');
  }




}









module.exports = FunctionFlow; // CommonJS Modules
// export FunctionFlow; // ES6 module

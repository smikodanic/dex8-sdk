/**
 * FunctionFlow helper.
 */

const util = require('util');
const events = require('events');
const eventEmitter = new events.EventEmitter();





class FunctionFlow {

  /**
   * @param {Object} opts - options: {debug, msDelay}
   */
  constructor(opts = {}) {
    // general properties
    this.debug = opts.debug; // to use debugger or not
    this.msDelay = opts.msDelay || 0; // delay after each function

    // function arguments - func(x, lib)
    this.x;
    this.lib;

    // operational properties
    this.status = 'start', // start | stop | pause
    this.delayID; // setTimeout ID
    this.goTo; // go to funcs index (a function within serial(funcs) method)

    // iteration properties
    this.lastExecuted = {method: '', args: []}; // last executed FunctionFlow bundle method (serial, one, parallel, ...)
    this.iteration = 0; // current iteration in repeat method
    this.iteration_max; // max number of iterations which can be reached by repeat() method - defined with n in repeat(n) method
    this.jumpTo; // jump to repeat() iteration
  }



  /*============================== OPTIONS ==============================*/
  /**
   * Set FunctionFlow options.
   * @param {Object} opts - {debug, msDelay}
   */
  setOpts(opts) {
    this.debug = opts.debug;
    this.msDelay = opts.msDelay;
  }



  /*============================== INPUT - this.x ==============================*/
  /**
   * Inject input into function first parameter - func(x, lib)
   * @param {Object} x - injected input - {a: 8, b: 'Something ...'}
   */
  xInject(input) {
    if (input) {
      this.x = input;
    } else {
      throw new Error('Input is injected in FunctionFlow but it is not defined.');
    }
  }

  /**
   * Remove input.
   */
  xRemove() {
    this.x = undefined;
  }



  /*============================== LIBRARY - this.lib ==============================*/
  /**
   * Inject libraries like Bluebird promises, Cheerio, Puppeteer, ...etc. into function second parameter - func(x, lib)
   * @param {Object} lib - injected library - {BPromis, puppeteer, cheerio}
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
  libRemove() {
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





  /*============================== FUNCTION  BUNDLES ==============================*/

  /****************************** A) S E R I A L ******************************/
  /**
   * Execute funcs functions one by one.
   * input------>|--f0-->|msDelay|--f3-->|msDelay|--f2-->|msDelay|------>output
   * @param {Array} funcs - array of functions - [f0, f3, f2]
   */
  async serial(funcs) {
    this.lastExecuted = {method: this.serial.name, args: Array.from(arguments)};

    let i = 0;
    while (i < funcs.length) {

      // redefine i with this.goTo
      if (!!this.goTo && this.goTo >=0 && this.goTo < funcs.length) {
        i = this.goTo; // redefine i
        this.goTo = undefined; // reset goTo
      }

      const func = funcs[i];

      if (this.debug) { this._debugger1(this.serial.name, func, i); }

      this.x = await func(this.x, this.lib);

      if (!!this.msDelay) { await this._delayFunction(this.msDelay); }

      if (this.status === 'pause') { await this._delayPause(this.msPause); }
      if (this.status === 'stop') { break; }
      if (this.status === 'next') { this.status = 'start'; break; }


      i++;
    } // \for


    return this.x;
  }



  /**
   * Execute just one function.
   * input------>|--func1-->|msDelay|-------->output
   * @param {Function} func - a function which will be executed once
   */
  async one(func) {
    this.lastExecuted = {method: this.one.name, args: Array.from(arguments)};
    if (this.debug) { this._debugger1(this.one.name, func, 0); }

    this.x = await func(this.x, this.lib);

    if (!!this.msDelay) { await this._delayFunction(this.msDelay); }

    if (this.status === 'pause') { await this._delayPause(this.msPause); }

    return this.x;
  }





  /***************************** B) P A R A L E L L *******************************/

  /**
   * Take any defined function and execute simultaneously. All defined functions must return fulfilled promises.
   * Input is same for all functions.
   * Returned value is an array of resolved values.
   *          --> |--------- f2(x) ---------->---|
   * -- input --> |--------- f4(x) ------->------|msDelay|---> [r2, r4, r8]
   *          --> |--------- f8(x) ------------->|
    * @param {Array} funcs - array of functions - [f2, f4, f8]
   */
  async parallelAll(funcs) {
    this.lastExecuted = {method: this.parallelAll.name, args: Array.from(arguments)};
    if (this.debug) { this._debugger1(this.parallelAll.name, {name: ''}, 'all'); }

    const promisArr = funcs.map(func => {
      return func(this.x, this.lib);
    });

    this.x = await Promise.all(promisArr);

    if (!!this.msDelay) { await this._delayFunction(this.msDelay); }

    return this.x;
  }



  /**
   * Run functions in paralell. Fastest function must return fulfilled promise.
   * Returned value is value from first resolved function.
   *          --> |--------- f2(x) --------|-->
   * -- input --> |--------- f4(x) ------->|msDelay|---> r4
   *          --> |--------- f8(x) --------|----->
    * @param {Array} funcs - array of functions - [f2, f4, f8]
   */
  async parallelRace(funcs) {
    this.lastExecuted = {method: this.parallelRace.name, args: Array.from(arguments)};
    if (this.debug) { this._debugger1(this.parallelRace.name, {name: ''}, 'race'); }

    const promisArr = funcs.map(func => {
      return func(this.x, this.lib);
    });

    this.x = await Promise.race(promisArr);

    if (!!this.msDelay) { await this._delayFunction(this.msDelay); }

    return this.x;
  }





  /*============================== ITERATION  METHODS ==============================*/

  /**
   * Repeat last executed FunctionFlow bundle method n times.
   * input -->|----------serial------------->|----> output
   *          |                             n|
   *          |<---------repeat n------------|
   * @param {Number} n - how many times to repeat last method
   */
  async repeat(n) {
    this.iteration = 0; // resetting iteration
    this.iteration_max = n; // max number of iterations
    const method = this.lastExecuted.method;
    const args = this.lastExecuted.args;

    let i = 1;
    while (i <= n) {
      // redefine i with this.jumpTo
      if (!!this.jumpTo && this.jumpTo >=0) {
        i = this.jumpTo; // redefine i
        this.jumpTo = undefined; // reset jumpTo
      }

      this.iteration = i;
      if (this.debug) { this._debugger2(this.iteration, this.repeat.name, method); }

      this.x = await this[method](...args);

      if (this.status === 'pause')  { await this._delayPause(this.msPause); }
      if (this.status === 'stop')  { break; }

      i++;
    }

    return this.x;
  }






  /*============================== COMMANDS ==============================*/
  /**
   * Stop FunctionFlow only if status is 'start'.
   */
  stop() {
    if (this.debug) { this._debugger3(this.stop.name); }

    if (this.status === 'start') {
      this.status = 'stop';
    } else {
      throw new Error('Stop not allowed. Status must be "start".');
    }
  }


  /**
   * Pause FunctionFlow only if status is 'start'.
   */
  pause() {
    if (this.debug) { this._debugger3(this.pause.name); }

    if (this.status === 'start') {
      this.status = 'pause';
    } else {
      throw new Error('Pause not allowed. Status must be "start".');
    }
  }


  /**
   * Start/restart FunctionFlow only if status is 'pause' or 'stop'.
   */
  start() {
    if (this.debug) { this._debugger3(this.start.name); }

    if (this.status === 'pause' || this.status === 'stop') {
      this.status = 'start';
      eventEmitter.emit('start');
      this.delayRemove();
    } else {
      throw new Error('Start not allowed. Status must be "pause" or "stop".');
    }
  }


  /**
   * Go to function used in serial(funcs) method.
   * When that function is executed continue with next function in funcs array.
   * @param {Number} goTo - funcs array index in serial(funcs) -- 0 >= goTo > funcs.length
   */
  go(goTo) {
    if (this.debug) { this._debugger3(this.go.name, ` to function ${goTo}`); }

    const funcs = this.lastExecuted.args[0];

    // prechecks
    if (!Number.isInteger(goTo)) { throw new Error('Index "goTo" must be integer.'); }
    else if (goTo < 0) { throw new Error('Index "goTo" can not be negative number.'); }
    else if (goTo >= funcs.length) { throw new Error(`Index "goTo" should be less then ${funcs.length}`); }

    this.goTo = goTo;
  }


  /**
   * Stop execution of all funcs functions in serial(funcs) method and continue with next serial or parallel method.
   * Use it as ff.next() inside function.
   * "next" will work only inside serial() method.
   */
  next() {
    if (this.debug && this.lastExecuted.method === 'serial') { this._debugger3(this.next.name); }
    this.status = 'next';
  }



  /**
   * Jump to iteration number defined in repeat(n) method.
   * When that iteration is executed continue with next iteration in repeat(n) method.
   * @param {Number} jumpTo - redefined iteration -- 0 >= jumpTo > n   (n is max number of iterations)
   */
  jump(jumpTo) {
    if (this.debug) { this._debugger3(this.jump.name, ` to iteration ${jumpTo}`); }

    // prechecks
    if (!Number.isInteger(jumpTo)) { throw new Error('Iteration "jumpTo" must be integer.'); }
    else if (jumpTo < 0) { throw new Error('Iteration "jumpTo" can not be negative number.'); }

    this.jumpTo = jumpTo;
  }


  /**
   * Breaks all iterations defined in repeat(n)
   */
  break() {
    this.jumpTo = Infinity;
  }






  /*============================== HELPERS ==============================*/
  /**
   * Make delay.
   * @param {Number} ms - delay in miliseconds. If ms=-1 then infinite delay.
   */
  delay(ms) {
    this.delayRemove(); // initially remove previous delays
    if (this.debug) { this._debugger3(this.delay.name, ms); }

    const promis = new Promise(resolve => {
      this.delayID = setTimeout(resolve, ms); // keep promis in 'pending' state until setTimeout is not finished
    });

    return promis;
  }


  /**
   * Randomize delay between min and max miliseconds.
   * @param {Number} msMin - min miliseconds: 3000
   * @param {Number} msMax - max miliseconds: 5000
   */
  delayRnd(msMin = 0, msMax = 1000) {
    const diff = msMax - msMin;
    let ms = msMin + diff * Math.random(); // Math.random() gives number between 0 and 1
    ms = Math.round(ms);
    return this.delay(ms);
  }


  /**
   * Remove delay instantly.
   */
  delayRemove() {
    clearTimeout(this.delayID);
  }







  /*============================== PRIVATE METHODS ==============================*/
  /*=============================================================================*/

  /*============================== DELAYS ==============================*/
  /**
   * Make delay after function.
   * @param {Number} msDelay - delay in miliseconds. If msDelay=-1 then infinite delay.
   */
  _delayFunction(msDelay) {
    this.delayRemove(); // initially remove previous delays
    const promis = new Promise(resolve => {
      this.delayID = setTimeout(resolve, msDelay); // keep promis in 'pending' state until setTimeout is not finished
    });

    return promis;
  }


  /**
   * Make big, pause delay.
   */
  _delayPause() {
    this.delayRemove(); // initially remove previous delays

    /* promis will be resolved either by eventEmitter or by setTimeout */
    const promis = new Promise(resolve => {
      // keep promis in 'pending' state until 'start' event come
      if (this.status === 'pause') {
        eventEmitter.on('start', () => {
          resolve();
        });
      }

      // keep promis in 'pending' state until setTimeout is not finished
      this.delayID = setTimeout(resolve, 3 * 24 * 60 * 60 * 1000); // delay of 3 days
    });

    return promis;
  }


  /*============================== DEBUGGERS ==============================*/
  /**
   * Debug function execution.
   * @param {String} methodName - FunctionFlow method name
   * @param {Function} func - function
   * @param {Number} i - function index
   */
  _debugger1(methodName, func, i) {
    console.log(`\n--- ${methodName} --- ${this.status} --- [${i}] ${func.name} (${this.msDelay} ms) --- x:: ${util.inspect(this.x, {depth: 0, colors: true})}`);
  }

  /**
   * Debug repetitions (iteration).
   * @param {Number} i - repeat iteration number
   * @param {String} repeatMethod - FunctionFlow repeat method name
   * @param {String} methodName - FunctionFlow method name
   */
  _debugger2 (i, repeatMethod, methodName) {
    console.log(`\n\n-------------- ${i}. ${repeatMethod}/${methodName} --------------`);
  }

  /**
   * Debug commands.
   * @param {String} methodName
   */
  _debugger3(methodName, label) {
    console.log(`\n   === ${methodName} ${label || ''} ===\n`);
  }








}









module.exports = FunctionFlow; // CommonJS Modules
// export FunctionFlow; // ES6 module

# FunctionFlow
FunctionFlow is DEX8&copy; library for controlling JS functions.


## Library Injection
FunctionFlow has **lib** injection
```javascript
/** Inject these 2 libraries*/
const BPromise = require('bluebird');
const util = require('util');

const dex8lib = require('dex8lib');
const ff = new dex8lib.FunctionFlow();

// inject libraries
ff.libInject({util, BPromise});

// register functions
const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); console.log(libs.util.inspect(libs.BPromise)); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'}
];
const ff = FunctionFlow.register(funcDefs);

// then define functions as
function (x, lib) { ... }
(x, lib) => { ... }
```


## Function Registration
FunctionFlow should register functions before they are ised.
Use try-catch blcok to cach error during registration.
```javascript
const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\\\'fja3\\\', x); return x + 1;'}, // bad function definition
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'}
];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}
```


## Jumps
FunctionFlow **jump(i, jumpType, debug)** method makes jump to a certain iteration in serial... or repeat... method.
- *i* is function or repeat iteration
- *jumpType* can be 'function' or 'repeat'. Default is 'function'.

-- 'function' means jump to certain function iteration i (iteration in serial... methods)
-- 'repeat' means jump to certain repeat iteration i (iteration in repeat... methods)

```javascript
const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'},
  {name: 'fja7', body: 'console.log(\'fja7\', x); return x + 1;'},
  {name: 'fja8', body: 'console.log(\'fja8\', x); return x + 1;'}, // jump here after 3000ms
  {name: 'fja9', body: 'console.log(\'fja9\', x); return x + 1;'},
  {name: 'fja10', body: 'console.log(\'fja10\', x); return x + 1;'},
];

try {
  ff.register(funcDefs);
} catch(err) { // catch registration errors
  console.log(err);
}

async function main(ff) {

  // JUMP
  setTimeout(function () {
    // ff.jump(-1, true); // breaks loop after fja2
    // ff.jump(0, true); // breaks loop after fja2
    ff.jump(7, 'function', true); // jump to fja8
  }, 3000);

  const debug = true;
  const msDelay = 2000; //ms
  const input = 5;
  const output = await ff.serialAll(input, msDelay, debug);

  return output;
}
```

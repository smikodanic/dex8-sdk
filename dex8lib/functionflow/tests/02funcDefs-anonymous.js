const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

// anonymous definitions
const funcDefs = [
  'console.log(\'fja1\', x); return x + 1;',
  'console.log(\'fja2\', x); return x + 1;',
  'console.log(\'fja3\', x); return x + 1;',
  'console.log(\'fja4\', x); return x + 1;',
  'console.log(\'fja5\', x); return x + 1;',
  'console.log(\'fja6\', x); return x + 1;'
];


ff.register(funcDefs);

ff.funcs.forEach(func => {
  console.log('\n');
  // console.log(func);
  // console.log(ff.getName(func));
  // console.log(ff.getBody(func));
  console.log(ff.getFuncStr(func));
});


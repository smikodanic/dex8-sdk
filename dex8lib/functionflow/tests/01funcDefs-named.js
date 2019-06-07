const FunctionFlow = require('../FunctionFlow');
const ff = new FunctionFlow();

// named definitions (objects with name property)
const funcDefs = [
  {name: 'fja1', body: 'console.log(\'fja1\', x); return x + 1;'},
  {name: 'fja2', body: 'console.log(\'fja2\', x); return x + 1;'},
  {name: 'fja3', body: 'console.log(\'fja3\', x); return x + 1;'},
  {name: 'fja4', body: 'console.log(\'fja4\', x); return x + 1;'},
  {name: 'fja5', body: 'console.log(\'fja5\', x); return x + 1;'},
  {name: 'fja6', body: 'console.log(\'fja6\', x); return x + 1;'}
];

ff.register(funcDefs);

ff.funcs.forEach(func => {
  console.log('\n');
  // console.log(func);
  console.log(ff.getName(func));
  // console.log(ff.getBody(func));
  console.log(ff.getFuncStr(func));
});



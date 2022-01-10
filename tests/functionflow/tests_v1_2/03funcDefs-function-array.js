const FunctionFlow = require('../index.js').v1_2;
const ff = new FunctionFlow();


// function definitions (Function type)
function fja1(x) {
  console.log(x);
  return x + 1;
}

const fja2 = function (x) {
  console.log(x);
  return x + 2;
};

const fja3 = (x) => {
  console.log(x);
  return x + 3;
};


const funcDefs = [fja1, fja2, fja3];
ff.register(funcDefs);

ff.funcs.forEach(func => {
  console.log('\n');
  // console.log(func);
  // console.log(ff.getName(func));
  // console.log(ff.getBody(func));
  console.log(ff.getFuncStr(func));
});

const FunctionFlow = require('../../../helpers/functionflow/FunctionFlow_v2.2');
const ff = new FunctionFlow({ debug: true, msDelay: 1000 });

// functions
const f1 = async (x, lib) => {
  const ff = lib.ff;
  console.log('f1', x);
  ff.pause();
  return x + 1;
};





const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    const y = await ff.one(f1);

    await ff.delay(5000);

    ff.start(); // re start

    return y; // or return ff.x;

  } catch (err) {
    throw err;
  }
};





const inp = 5;
const lib = { ff };

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));


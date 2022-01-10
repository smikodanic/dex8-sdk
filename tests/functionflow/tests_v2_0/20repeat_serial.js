const FunctionFlow = require('../index.js').v2_0;
const ff = new FunctionFlow({debug: true, msDelay: 400});

// functions
const f1 = (x, lib) => {
  console.log('f1', x);
  return x + 1;
};

const f2 = (x, lib) => {
  console.log('f2', x);
  return x + 1;
};

const f3 = (x, lib) => {
  console.log('f3', x);
  return x + 1;
};





const main = async (input, lib) => {
  const ff = lib.ff;

  try {
    ff.xInject(input);
    ff.libInject(lib);

    await ff.serial([f1, f2, f3]);
    const y = await ff.repeat(3); // repeats ff.serial

    return y; // or return ff.x;

  } catch(err) {
    throw err;
  }
};





const inp = 5;
const lib = {ff};

main(inp, lib)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));

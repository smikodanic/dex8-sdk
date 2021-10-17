const { FunctionFlow } = require('../../index.js');
const ff = new FunctionFlow({ debug: true, msDelay: 800 });

// functions
const f1 = (x, lib) => {
  x++;
  console.log('f1-return', x);
  console.log('lib.serialRepeatIteration::', lib.serialRepeatIteration);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2-return', x);
  console.log('lib.serialRepeatIteration::', lib.serialRepeatIteration);
  return x;
};

const f3 = (x, lib) => {
  x++;
  console.log('f3-return', x);
  console.log('lib.serialRepeatIteration::', lib.serialRepeatIteration);
  return x;
};






const main = async (input, library) => {
  const ff = library.ff;

  try {
    ff.xInject(input);
    ff.libInject(library);

    const n = 3;

    const y = await ff.serialRepeat([f1, f2, f3, f1], n);
    await ff.delay(3400);

    console.log(ff.lib); // serialEachElement should be deleted

    return y; // or return ff.x;

  } catch (err) {
    throw err;
  }
};



const inp = 5;
const library = { ff };

main(inp, library)
  .then(res => console.log('RES:: ', res))
  .catch(err => console.error('ERR:: ', err));


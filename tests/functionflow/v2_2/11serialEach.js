const FunctionFlow = require('../../../helpers/functionflow/FunctionFlow_v2.2');
const ff = new FunctionFlow({ debug: true, msDelay: 800 });

// functions
const f1 = (x, lib) => {
  x++;
  console.log('f1-return', x);
  console.log('lib.serialEachElement::', lib.serialEachElement);
  return x;
};

const f2 = (x, lib) => {
  x++;
  console.log('f2-return', x);
  console.log('lib.serialEachElement::', lib.serialEachElement);
  return x;
};

const f3 = (x, lib) => {
  x++;
  console.log('f3-return', x);
  console.log('lib.serialEachElement::', lib.serialEachElement);
  return x;
};






const main = async (input, library) => {
  const ff = library.ff;

  try {
    ff.xInject(input);
    ff.libInject(library);

    const arr = ['Joe', 'Ann', 'Mary'];

    const y = await ff.serialEach([f1, f2, f3, f1], arr);
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


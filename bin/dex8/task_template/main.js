const f1 = require('./f1');


module.exports = async (input, lib) => {
  const echo = lib.echo;
  const ff = lib.ff;

  // define x (transitional context variable)
  const x = input;
  echo.log('x::', input);

  ff.setOpts({debug: false, msDelay: 1300});
  ff.xInject(x);
  ff.libInject(lib);


  const y = await ff.one(f1);
  await ff.delay(3400);

  echo.log('y::', y);
  return y; // or return ff.x;
};

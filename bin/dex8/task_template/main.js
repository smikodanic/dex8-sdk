const f1 = require('./f1');


module.exports = async (input, lib) => {
  const echo = lib.echo;
  const ff = lib.ff;
  ff.setOpts({debug: false, msDelay: 1200});
  ff.xInject(input);
  ff.libInject(lib);

  echo.log('input::', input);

  const y = await ff.one(f1);
  await ff.delay(3400);

  echo.log('output::', y);
  return y; // or return ff.x;
};

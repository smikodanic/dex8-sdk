module.exports = async (input, lib) => {
  const ff = lib.ff;
  ff.setOpts({debug: true, msDelay: 2100});
  const echo = lib.echo;

  echo.log('   a = ', input.a);
  await ff.delay(1300);
  echo.log(input.password, input.password_1, input.MyPAssword_1, input.PasswordNotExists);
  await ff.delay(3400);

  return input;
};

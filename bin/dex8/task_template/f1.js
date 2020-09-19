module.exports = (x, lib) => {
  const echo = lib.echo;

  x.a++;
  echo.log('f1::', x);
  return x;
};

module.exports = (x, lib) => {
  x++;
  lib.echo.log('f1::', x);
  return x;
};

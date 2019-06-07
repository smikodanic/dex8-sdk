module.exports = async function (x, lib) { // no need for async because there's no await inside
  const err = new Error('Some intentional error.');
  lib.echoErr(err);
  x = x + 1;
  lib.echoMsg('func_err::', x);
  return x;
};

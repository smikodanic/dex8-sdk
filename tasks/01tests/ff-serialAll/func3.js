module.exports = async (x, lib) => { // no need for async because there's no await inside
  x = x + 1;
  lib.echoMsg('fja 3::', x);
  return x;
};

module.exports = async function (input, lib) {
  console.log('fja 1::', input);
  lib.echoMsg('Ovo radi super', 'pa daa');
  lib.echoMsg('fja 1::', input);

  return input + 1;
};

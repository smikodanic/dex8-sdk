module.exports = async function (input, lib) {
  console.log('fja 1::', input);
  lib.echoMsg('This works great', 'yeah');
  lib.echoMsg('fja 1::', input);

  return input + 1;
};

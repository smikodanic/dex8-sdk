module.exports = async function (x, lib) { // no need for async because there's no await inside
  lib.echoMsg('First part of lib.echoMsg() method works great', '+also second', '+and third');
  x = x + 1;
  const msgObj = await lib.echoMsg('fja 1::', x);
  console.log('msgObj:: ', msgObj);
  return x;
};

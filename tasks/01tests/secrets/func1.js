const secrets = require('./secrets');

module.exports = async function (x, lib) { // no need for async because there's no await inside
  console.log('fja 1::', x);
  lib.echoMsg('+++username:', secrets.username, '\n+++password:', secrets.password);
  return x + 1;
};

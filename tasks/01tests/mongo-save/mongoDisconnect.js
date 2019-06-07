module.exports = (x, lib) => {
  lib.mongo.disconnect(); // disconnect from mongodb server
  lib.echoMsg('Mongodb disconnected!');
  return x;
};

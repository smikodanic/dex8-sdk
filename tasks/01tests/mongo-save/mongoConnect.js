module.exports = function (x, lib) {
  lib.mongo.connect(); // connect to mongodb server
  lib.mongo.compileModel('mongo-save-test');
  lib.echoMsg('Mongodb connected!');
  return x;
};

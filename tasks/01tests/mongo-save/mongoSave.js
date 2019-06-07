/**
 * Notice: Use async-await when ff.repeat() methods are used.
 */
module.exports = async (x, lib) => {
  // save x object to mongo
  await lib.mongo.save(x).then(xNew => {
    lib.echoMsg('saved:: ', xNew);
  });
  return x;
};

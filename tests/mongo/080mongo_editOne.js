const { Mongo } = require('../../index.js');

const main = async () => {
  // connection
  const mo_uri = 'mongodb://dex8_freeuser:freedom@5.189.161.70:27017/dex8-freepool03';
  const mongo = new Mongo();
  await mongo.connect(mo_uri);

  const collectionName = 'mongo-test';

  // compile 'mongo-testMD'
  await mongo.compileModel(collectionName); // model compiled with the generic schema

  // take a model
  mongo.useModel(collectionName);

  // edit a doc
  const moQuery = { url: 'http://added.com' };
  const docNew = { url: 'http://addizmjena.net' };
  const doc = await mongo.editOne(moQuery, docNew);
  console.log('edited doc::', doc);

  // disconnection
  await mongo.disconnect();
};


main().catch(console.log);


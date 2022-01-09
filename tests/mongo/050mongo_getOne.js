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

  // fetch the doc
  const moQuery = { url: 'http://added.com' };
  const sort = '-created_at';
  const select = '_id url text';
  const doc = await mongo.getOne(moQuery, sort, select);
  console.log('doc::', doc);

  // disconnection
  await mongo.disconnect();
};


main().catch(console.log);


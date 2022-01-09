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

  // list the docs
  const moQuery = {};
  const limit = 20;
  const skip = 0;
  const sort = '-updated_at';
  const select = 'url depth created_at updated_at';
  const resp = await mongo.list(moQuery, limit, skip, sort, select);
  console.log('resp::', JSON.stringify(resp, null, 4));

  // disconnection
  await mongo.disconnect();
};


main().catch(console.log);


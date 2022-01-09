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

  // create new doc
  const doc = {
    url: 'http://added.com',
    text: 'Lorem ipsum',
    depth: 55
  };
  mongo.add(doc)
    .then(docNew => {
      console.log(`New doc added to dex8-freepool03/${collectionName} collection:`);
      console.log(docNew);
      mongo.disconnect();
    });

  // disconnection
  await mongo.disconnect();
};


main().catch(console.log);


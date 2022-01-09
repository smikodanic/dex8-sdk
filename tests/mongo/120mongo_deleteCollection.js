const { Mongo } = require('../../index.js');

const main = async () => {
  // connection
  const mo_uri = 'mongodb://dex8_freeuser:freedom@5.189.161.70:27017/dex8-freepool03';
  // const mo_uri = 'mongodb+srv://test:freedom@testni-cluster0.vveso.mongodb.net/test-db?retryWrites=true&w=majority';
  const mongo = new Mongo();
  await mongo.connect(mo_uri);

  await new Promise(r => setTimeout(r, 2100));

  // delete the collection
  const resp = await mongo.deleteCollection('probni-coll');
  console.log('resp::', resp);

  // disconnection
  await mongo.disconnect();
};


main().catch(console.log);


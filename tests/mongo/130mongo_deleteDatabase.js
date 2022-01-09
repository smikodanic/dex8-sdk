const { Mongo } = require('../../index.js');

const main = async () => {
  // connection
  // const mo_uri = 'mongodb://dex8_freeuser:freedom@5.189.161.70:27017/dex8-freepool03';
  const mo_uri = 'mongodb+srv://test:freedom@testni-cluster0.vveso.mongodb.net/test-db?retryWrites=true&w=majority'; // user must have Atlas admin or dbAdmin role
  const mongo = new Mongo();
  await mongo.connect(mo_uri);

  await new Promise(r => setTimeout(r, 2100));

  // delete the db
  const resp = await mongo.deleteDatabase();
  console.log('resp::', resp);  // resp:: true

  // disconnection
  await mongo.disconnect();
};


main().catch(console.log);


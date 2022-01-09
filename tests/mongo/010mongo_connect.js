const { Mongo } = require('../../index.js');

const main = async () => {
  // mongo instance
  const mongo = new Mongo();

  // test connection
  const mo_uri = 'mongodb://dex8_freeuser:freedom@5.189.161.70:27017/dex8-freepool03';
  await mongo.connect(mo_uri);

  await new Promise(r => setTimeout(r, 2100));

  // test disconnection
  await mongo.disconnect();
};


main().catch(console.log);


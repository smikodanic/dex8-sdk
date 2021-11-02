const Mongo = require('../Mongo');

const user_id = '5c9b45a89f940fb607901810';
const robot_id = '5c9b45a89f940fb607901830';
const task_id = '5c9b45a89f940fb607901820';
const mongo = new Mongo(user_id, robot_id, task_id);


// establish connection
const mo_uri = 'mongodb://dex8_freeuser:freedom5@5.189.161.70:27017/dex8-freepool01';
mongo.connect(mo_uri);


// compile 'mongo-testMD'
mongo.compileModel('mongo-test');
mongo.useModel('mongo-test');


const moQuery = {}; // delete all docs

mongo.deleteMulti(moQuery)
  .then(respDel => {
    console.log(respDel); // { ok: 1, n: 2 }
    mongo.disconnect();
  })
  .catch(console.log);


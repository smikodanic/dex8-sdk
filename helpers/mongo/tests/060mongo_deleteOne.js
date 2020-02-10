const Mongo = require('../Mongo');

const user_id = '5c9b45a89f940fb607901810';
const robot_id = '5c9b45a89f940fb607901830';
const task_id = '5c9b45a89f940fb607901820';
const mongo = new Mongo(user_id, robot_id, task_id);


// establish connection
const mo_uri = 'mongodb://5.189.161.70:27017/dex8-dev-pool-free01';
const mo_usr = 'dex8_freeuser';
const mo_pass = 'freedom5';
mongo.connect(mo_uri, mo_usr, mo_pass);


// compile 'mongo-testMD'
mongo.compileModel('mongo-test');


const moQuery = {_id: '5e2075e08893ed7590ce2ab4'};

mongo.deleteOne(moQuery)
  .then(docDel => {
    console.log(docDel); // deleted doc
    mongo.disconnect();
  })
  .catch(console.log);


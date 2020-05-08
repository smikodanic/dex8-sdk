const Mongo = require('../Mongo');

const user_id = '5c9b45a89f940fb607901810';
const robot_id = '5c9b45a89f940fb607901830';
const task_id = '5c9b45a89f940fb607901820';
const mongo = new Mongo(user_id, robot_id, task_id);


// establish connection
const mo_uri = 'mongodb://dex8_freeuser:freedom5@5.189.161.70:27017/dex8-dev-pool-free01';
mongo.connect(mo_uri);


// compile 'mongo-testMD'
mongo.compileModel('mongo-test');
mongo.useModel('mongo-test');

const moQuery = {url: 'http://added.com'};
const sort = '-created_at';
const select = 'robot_id url text created_at';

mongo.getOne(moQuery, sort, select)
  .then(doc => {
    console.log(doc);
    mongo.disconnect();
  })
  .catch(console.log);


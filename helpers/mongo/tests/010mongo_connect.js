const Mongo = require('../Mongo');

// mongo instance
const user_id = '5c9b45a89f940fb607901810';
const robot_id = '5c9b45a89f940fb607901830';
const task_id = '5c9b45a89f940fb607901820';
const mongo = new Mongo(user_id, robot_id, task_id);


// test connection
const mo_uri = 'mongodb://dex8_freeuser:freedom5@5.189.161.70:27017/dex8-dev-pool-free01';
// const mo_uri = 'mongodb+srv://dex8_freeuser:12345@cluster0-n4qix.mongodb.net/dex8-dev-pool-free01?retryWrites=true&w=majority'; // test cloud.mongodb.com
mongo.connect(mo_uri);


// test disconnection
setTimeout(() => {
  console.log('==== disconnect ====');
  mongo.disconnect();
}, 2100);

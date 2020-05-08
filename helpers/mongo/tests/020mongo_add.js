const Mongo = require('../Mongo');

const user_id = '5c9b45a89f940fb607901810';
const robot_id = '5c9b45a89f940fb607901830';
const task_id = '5c9b45a89f940fb607901820';
const mongo = new Mongo(user_id, robot_id, task_id);


// establish connection
const mo_uri = 'mongodb://dex8_freeuser:freedom5@5.189.161.70:27017/dex8-dev-pool-free01';
// const mo_uri = 'mongodb+srv://dex8_freeuser:12345@cluster0-n4qix.mongodb.net/dex8-dev-pool-free01?retryWrites=true&w=majority'; // test cloud.mongodb.com
mongo.connect(mo_uri);


// compile 'mongo-testMD'
mongo.compileModel('mongo-test');
mongo.useModel('mongo-test');


let doc = {
  url: 'http://added.com',
  text: 'Lorem ipsum',
  depth: 55
};

// append user_id, robot_id and task_id
doc = {...doc, ...mongo.ids};

mongo.add(doc)
  .then(docNew => {
    console.log('docNew:: ', docNew);
    mongo.disconnect();
  })
  .catch(console.log);


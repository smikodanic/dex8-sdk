const Mongo = require('../Mongo');

const user_id = '5c9b45a89f940fb607901810';
const task_id = '5c9b45a89f940fb607901820';
const robot_id = '5c9b45a89f940fb607901830';
const mongo = new Mongo(user_id, task_id, robot_id);


// establish connection
const uri = 'mongodb://5.189.161.70:27017/dex8-pool-01';
const user = 'ms_user';
const pass = '12345';
mongo.connect(uri, user, pass);


// compile 'dex8lib-mongo-testMD'
mongo.compileModel('dex8lib-mongo-test');


const doc = {
  url: 'http://saved.com',
  text: 'Saved Lorem ipsum',
  depth: 2
};

mongo.save(doc)
  .then(docNew => {
    console.log('docNew:: ', docNew);
    mongo.disconnect();
  })
  .catch(console.log);


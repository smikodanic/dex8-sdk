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


let doc = {
  url: 'http://saved.com',
  text: 'Saved Lorem ipsum',
  depth: 2
};


// append user_id, robot_id and task_id
doc = {...doc, ...mongo.ids};

mongo.save(doc)
  .then(docNew => {
    console.log('docNew:: ', docNew);
    mongo.disconnect();
  })
  .catch(console.log);


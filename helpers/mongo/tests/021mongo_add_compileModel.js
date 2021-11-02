const Schema = require('mongoose').Schema;
const Mongo = require('../Mongo');

const user_id = '5c9b45a89f940fb607901810';
const robot_id = '5c9b45a89f940fb607901830';
const task_id = '5c9b45a89f940fb607901820';
const mongo = new Mongo(user_id, robot_id, task_id);


// establish connection
const mo_uri = 'mongodb://dex8_freeuser:freedom5@5.189.161.70:27017/dex8-freepool01';
mongo.connect(mo_uri);


// schema
const options = {
  collection: 'mongo-test', // default collection
  _id: true, // disable _id
  id: false, // set virtual id property
  autoIndex: true, // auto-create indexes in mognodb collection on mongoose restart
  minimize: true, // remove empty objects
  // safe: true, // pass errors to callback
  strict: true, // values not defined in schema will not be saved in db
  validateBeforeSave: true, // validate doc before saving. prevent saving false docs
  timestamps: { // create timestamps for each doc 'created_at' & 'updated_at'
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  new: true,
  // skipVersioning: { myProp: true }, // prevent changing version __v when 'myProp' is updated
  // versionKey: '_myV', // replace __v with _myV (not needed in most cases)
};


const Sch = new Schema({
  // fields from the CSV file
  url: { type: String, required: 'URL is required.' },
  text: String,
  depth: Number
}, options);



const main = async () => {

  // compile 'mongo-testMD'
  await mongo.compileModel(Sch);


  mongo.useModel('mongo-test');


  let doc = {
    url: 'http://schema.com',
    text: 'New schema',
    depth: 88
  };

  // append user_id, robot_id and task_id
  doc = {...doc, ...mongo.ids};

  mongo.add(doc)
    .then(docNew => {
      console.log('docNew:: ', docNew);
      mongo.disconnect();
    })
    .catch(console.log);

}

main();



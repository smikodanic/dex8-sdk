const mongoose = require('mongoose');
const CommonMethods = require('./CommonMethods');


class StorageModel extends CommonMethods {

  constructor(conn, collection) {
    // mongoose schema options (https://mongoosejs.com/docs/api.html#Schema)
    const opts = {
      collection,
      _id: true, // disable _id
      id: false, // set virtual id property
      autoIndex: true, // auto-create indexes in mognodb collection on mongoose restart
      minimize: true, // remove empty objects
      strict: false, // values not defined in schema will not be saved in db
      validateBeforeSave: true, // validate doc before saving. Prevent saving false docs
      timestamps: { // create timestamps for each doc 'created_at' & 'updated_at'
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    };

    const Schema = mongoose.Schema;

    // define schema
    const schema = new Schema({
      user_id: Schema.Types.ObjectId, // users._id
      robot_id: Schema.Types.ObjectId, // robots._id
      task_id: Schema.Types.ObjectId // tasks._id
    }, opts);

    // define model
    const model = conn.model(`${collection}MD`, schema); // if mongoose.createConnection() is used
    // const model = mongoose.model(`${collection}MD`, schema); // if mongoose.connection() is used

    super(model);

    this.schema = schema;
    this.model = model;
  }



}


module.exports = StorageModel;

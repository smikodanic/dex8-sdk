const chalk = require('chalk');
const BPromise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = BPromise;
const StorageModel = require('./models/StorageModel');



class Mongo {


  /**
   * Construct object
   * @param {*} mo_config - {uri, username, password}
   * @param {*} user_id - MongoDB ObjectId
   * @param {*} task_id - MongoDB ObjectId
   * @param {*} robot_id - MongoDB ObjectId
   */
  constructor(mo_config, user_id, task_id, robot_id) {
    this.mo_uri = mo_config.uri; // string: mongodb://5.189.161.70:27017/dex8-pool-01
    this.mo_user = mo_config.username;
    this.mo_pass = mo_config.password;
    this.user_id = user_id;
    this.task_id = task_id;
    this.robot_id = robot_id;
    this.conn; // NativeConnection
    this.model = null;
  }


  onEvent() {
    this.conn.on('error', (err) => {
      console.error(chalk.red(this.mo_uri, err, 'readyState:' + this.conn.readyState));
    });
    this.conn.on('connected', () => {
      console.log(chalk.blue(this.mo_uri, '-connected'));
    });
    this.conn.on('open', () => {
      // console.log(chalk.blue(dbConfig.uri, '-connection open'));
    });
    this.conn.on('reconnected', () => {
      console.log(chalk.blue(this.mo_uri, '-connection reconnected'));
    });
    this.conn.on('disconnected', () => {
      console.log(chalk.blue(this.mo_uri, '-connection disconnected'));
    });
    process.on('SIGINT', () => {
      mongoose.disconnect(() => {
        console.log(chalk.blue(this.mo_uri, '-disconnected on app termination by SIGINT'));
        process.exit(0);
      });
    });
  }

  /**
   * Connect to mongodb server.
   */
  connect() {
    const opts = {
      useNewUrlParser: true,
      autoIndex: true,
      bufferCommands: true,
      user: this.mo_user,
      pass: this.mo_pass
    };
    this.conn = mongoose.createConnection(this.mo_uri, opts);
    this.onEvent();
  }


  /**
   * Disconnect from mongodb server.
   */
  disconnect() {
    this.conn.close();
  }


  /**
   * Create mongoose model
   * @param {*} collection
   */
  compileModel(collection) {
    this.model = new StorageModel(this.conn, collection);
  }





  /**
   *
   * @param {String} collection - mongoose collection name
   * @param {Object} doc - mongoose doc (object) to be saved
   */
  add(doc) {
    doc.user_id = this.user_id;
    doc.task_id = this.task_id;
    doc.robot_id = this.robot_id;
    return this.model.addDoc(doc);
  }


  /**
   *
   * @param {String} collection - mongoose collection name
   * @param {Object} doc - mongoose doc (object) to be saved
   */
  save(doc) {
    doc.user_id = this.user_id;
    doc.task_id = this.task_id;
    doc.robot_id = this.robot_id;
    return this.model.saveDoc(doc);
  }


  /**
   *
   * @param {String} collection - mongoose collection name
   * @param {Object} moQuery - mongo query
   * @param {Number} limit
   * @param {Number} limiskipt
   * @param {String} sort
   * @param {String} select
   */
  list(moQuery, limit, skip, sort, select) {
    return this.model.listDocs(moQuery, limit, skip, sort, select);
  }


  /**
   *
   * @param {String} collection - mongoose collection name
   * @param {Object} moQuery - mongo query
   * @param {String} sort
   * @param {String} select
   */
  getOne(moQuery, sort, select) {
    return this.model.getOneDoc(moQuery, sort, select);
  }


  /**
   *
   * @param {String} collection - mongoose collection name
   * @param {Object} moQuery - mongo query
   */
  deleteOne(moQuery) {
    return this.model.deleteOneDoc(moQuery);
  }


  /**
   *
   * @param {String} collection - mongoose collection name
   * @param {Object} moQuery - mongo query
   */
  deleteMany(moQuery) {
    return this.model.deleteManyDocs(moQuery);
  }


  /**
   *
   * @param {String} collection - mongoose collection name
   * @param {Object} moQuery - mongo query
   * @param {Object} docNew - new, updated document
   */
  editOne(moQuery, docNew) {
    const updOpts = {
      new: true, // return updated document as 'result'
      upsert: false, // whether to create the doc if it doesn't match (false)
      runValidators: false, // validators validate the update operation against the model's schema
      strict: false, // values not defined in schema will not be saved in db (default is defined in schema options, and can be overwritten here)
      // sort: {created_at: -1} // if multiple results are found, sets the sort order to choose which doc to update
    };
    return this.model.editOneDoc(moQuery, docNew, updOpts);
  }



}


module.exports = Mongo;

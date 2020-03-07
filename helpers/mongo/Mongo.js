const chalk = require('chalk');
const mongoose = require('mongoose');
const StorageModel = require('./models/StorageModel');



class Mongo {


  /**
   * Construct object
   * @param {String} user_id - users._id
   * @param {String} robot_id - robts._id
   * @param {String} task_id - tasks._id
   */
  constructor(user_id, robot_id, task_id) {
    this.user_id = user_id;
    this.robot_id = robot_id;
    this.task_id = task_id;

    this.mo_uri;
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
   * @param {String} mo_uri - mongodb://5.189.161.70:27017/dex8-pool-01
   * @param {String} mo_usr - mongodb username
   * @param {String} mo_pass - mongodb password
   */
  async connect(mo_uri) {
    this.mo_uri = mo_uri;
    const opts = {
      keepAlive: 30000,
      connectTimeoutMS: 5000,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      autoIndex: true,
      bufferCommands: true
    };
    this.conn = mongoose.createConnection(this.mo_uri, opts);
    this.onEvent();
    return this.conn;
  }



  /**
   * Disconnect from mongodb server.
   */
  disconnect() {
    this.conn.close();
  }


  /**
   * List database collections
   */
  listDBCollections() {
    return this.conn.db.listCollections().toArray();
  }


  /**
   * Delete database collections
   * @param {*} collectionName - collection name
   */
  deleteCollection(collectionName) {
    return this.conn.collections[collectionName].drop();
  }


  /**
   * Delete database
   */
  deleteDatabase() {
    return this.conn.db.dropDatabase();
  }


  /**
   * Create mongoose model.
   * @param {String} collection - mongodb collection name
   */
  compileModel(collectionName) {
    this.model = new StorageModel(this.conn, collectionName);
  }


  /**
   * Add doc to collection.
   * @param {Object} doc - mongoose document (object) to be saved
   */
  add(doc) {
    doc.user_id = this.user_id;
    doc.robot_id = this.robot_id;
    doc.task_id = this.task_id;
    return this.model.addDoc(doc);
  }


  /**
   * Save doc to collection.
   * @param {Object} doc - mongoose doc (object) to be saved
   */
  save(doc) {
    doc.user_id = this.user_id;
    doc.robot_id = this.robot_id;
    doc.task_id = this.task_id;
    return this.model.saveDoc(doc);
  }


  /**
   * List documents.
   * @param {Object} moQuery - mongo query
   * @param {Number} limit
   * @param {Number} skip
   * @param {String} sort
   * @param {String} select
   */
  list(moQuery, limit, skip, sort, select) {
    return this.model.listDocs(moQuery, limit, skip, sort, select);
  }


  /**
   * Get a doc.
   * @param {Object} moQuery - mongo query
   * @param {String} sort
   * @param {String} select
   */
  getOne(moQuery, sort, select) {
    return this.model.getOneDoc(moQuery, sort, select);
  }


  /**
   * Delete a doc.
   * @param {Object} moQuery - mongo query
   */
  deleteOne(moQuery) {
    return this.model.deleteOneDoc(moQuery);
  }


  /**
   * Delete docs.
   * @param {Object} moQuery - mongo query
   */
  deleteMany(moQuery) {
    return this.model.deleteManyDocs(moQuery);
  }


  /**
   * Update a doc.
   * @param {Object} moQuery - mongo query
   * @param {Object} docNew - new, updated document
   */
  editOne(moQuery, docNew, updOpts) {
    if (!updOpts) {
      updOpts = {
        new: true, // return updated document as 'result'
        upsert: false, // whether to create the doc if it doesn't match (false)
        runValidators: false, // validators validate the update operation against the model's schema
        strict: false, // values not defined in schema will not be saved in db (default is defined in schema options, and can be overwritten here)
      // sort: {created_at: -1} // if multiple results are found, sets the sort order to choose which doc to update
      };
    }
    return this.model.editOneDoc(moQuery, docNew, updOpts);
  }



}


module.exports = Mongo;

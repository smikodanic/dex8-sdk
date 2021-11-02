const chalk = require('chalk');
const mongoose = require('mongoose');
const genericSchema = require('./schema/Generic');


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

    this.ids = {user_id, robot_id, task_id};

    this.mo_uri;
    this.conn; // NativeConnection
    this.model = null; // currently used model
    this.compiledModels = []; // array of all compiled models
  }



  /***************** SERVER  *****************/
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
   * https://mongoosejs.com/docs/connections.html
   * @param {String} mo_uri - mongodb://user:pass@5.189.161.70:27017/dex8-pool-01
   */
  async connect(mo_uri) {
    this.mo_uri = mo_uri;
    const opts = {
      keepAlive: 30000,
      connectTimeoutMS: 5000,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useCreateIndex: true,
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





  /***************** DATABASE  *****************/
  /**
   * Delete database
   */
  deleteDatabase() {
    return this.conn.db.dropDatabase();
  }



  /***************** COLLECTIONS  *****************/
  /**
   * List database collections
   */
  showCollections() {
    return this.conn.db.listCollections().toArray();
  }


  /**
   * Delete database collections
   * @param {*} collectionName - collection name
   */
  deleteCollection(collectionName) {
    return this.conn.collections[collectionName].drop();
  }




  /***************** DOCUMENTS  *****************/
  /**
   * Create mongoose model.
   * @param {Object | String} moSchema - mongoose.Schema or collectionName
   */
  async compileModel(moSchema) {

    //// define collectionName and sch
    let collectionName, sch;

    if (!moSchema) {
      // use genericSchema shema if other schema is not defined
      collectionName = genericSchema.options.collection;
      sch = genericSchema;
    }
    else if (typeof moSchema === 'string') { // when collectionName is used instead of mongoose Schema (to be compatible with old method)
      collectionName = moSchema;
      genericSchema.options.collection = collectionName;
      sch = genericSchema;
    } else {
      collectionName = moSchema.options.collection;
      sch = moSchema;
    }

    //// compile model and push to compiledModels
    this.model = this.conn.model(`${collectionName}MD`, sch); // if mongoose.createConnection() is used
    this.compiledModels.push(this.model);
    await new Promise(resolve => setTimeout(resolve, 100)); // small delay
  }


  /**
   * Use mongoose model according to the selected collection name.
   * Define current model for methods: add, save, list, getOne, deleteOne, deleteMany, ...
   * @param {String} collectionName - mongodb collection name
   */
  useModel(collectionName) {
    this.model = this.compiledModels.find(compiledModel => {
      const tf = compiledModel.collection.collectionName === collectionName;
      // console.log(compiledModel.collection.collectionName, collectionName, ' =>', tf);
      return tf;
    });
    if (!this.model) { throw new Error(`Model not found for "${collectionName}" collection.`); }
  }


  /**
   * Save doc to collection.
   * @param {Object} doc - mongoose doc (object)
   */
  save(doc) {
    const docObj = new this.model(doc);
    return docObj.save();
  }


  /**
   * Add doc to collection.
   * @param {Object | Array} doc - object or array of objects
   */
  add(doc) {
    return this.model.create(doc);
  }



  /**
   * Bulk insertion.
   * @param {Array} docs - array of objects
   * @param {Object} insOpts - https://mongoosejs.com/docs/api/model.html#model_Model.insertMany
   */
  insertMulti(docs, insOpts) {
    if (!insOpts) {
      insOpts = {
        ordered: false, // (true) if true, will fail fast on the first error encountered and don't execute the remaining writes
        rawResult: true, // (false) will return inserted docs
        lean: false, // (false) if true skip schema validation
        limit: null // (null) limits the number of documents being processed
      };
    }
    return this.model.insertMany(docs, insOpts);
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
    return this.model
      .countDocuments(moQuery)
      .then(resultsNum => {
        return this.model
          .find(moQuery)
          .limit(limit)
          .skip(skip)
          .sort(sort)
          .select(select)
          .exec()
          .then(resultsArr => {
            const results = {
              success: true,
              count: resultsNum,
              data: resultsArr
            };
            return results;
          });
      });
  }


  /**
   * List documents without counting.
   * @param {Object} moQuery - mongo query
   * @param {Number} limit
   * @param {Number} skip
   * @param {String} sort
   * @param {String} select
   */
  listFast(moQuery, limit, skip, sort, select) {
    return this.model
      .find(moQuery)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .select(select)
      .exec();
  }


  /**
   * Get a doc.
   * @param {Object} moQuery - mongo query
   * @param {String} sort
   * @param {String} select
   */
  getOne(moQuery, sort, select) {
    return this.model
      .findOne(moQuery)
      .sort(sort)
      .select(select)
      .exec();
  }


  /**
   * Delete a doc.
   * @param {Object} moQuery - mongo query
   */
  deleteOne(moQuery) {
    return this.model.findOneAndDelete(moQuery);
  }


  /**
   * Delete docs.
   * @param {Object} moQuery - mongo query
   */
  deleteMulti(moQuery) {
    return this.model.deleteMany(moQuery);
  }


  /**
   * Update a doc.
   * @param {Object} moQuery - mongo query
   * @param {Object} docNew - new, updated document
   * @param {Object} updOpts - https://mongoosejs.com/docs/api/model.html#model_Model.findOneAndUpdate
   */
  editOne(moQuery, docNew, updOpts) {
    if (!updOpts) {
      updOpts = {
        new: true, // (false) return updated document as 'result'
        lean: true, // mongoose will return the document as a plain JavaScript object rather than a mongoose document
        strict: false, // values not defined in schema will not be saved in db (default is defined in schema options, and can be overwritten here)
        upsert: false, // whether to create the doc if it doesn't match (false)
        runValidators: false, // (false) validators validate the update operation against the model's schema
        // sort: {created_at: -1} // if multiple results are found, sets the sort order to choose which doc to update
      };
    }
    return this.model.findOneAndUpdate(moQuery, docNew, updOpts);
  }



  /**
   * Count docs by the mongo query.
   * @param {Object} moQuery - mongo query
   */
  countDocs(moQuery) {
    return this.model.countDocuments(moQuery);
  }




}


module.exports = Mongo;

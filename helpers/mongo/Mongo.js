const chalk = require('chalk');
const mongoose = require('mongoose');
const genericSchema = require('./schema/Generic');


class Mongo {

  constructor() {
    this.mo_uri;
    this.conn; // NativeConnection
    this.model = null; // currently used model
    this.compiledModels = []; // array of all compiled models
  }



  /***************** SERVER  *****************/
  /**
   * Connect to mongodb server. Multiple connections are possible.
   * https://mongoosejs.com/docs/connections.html
   * @param {string} mo_uri - mongodb://user:pass@5.189.161.70:27017/dex8-pool-01
   * @returns {Promise<void>}
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

    const prom = new Promise((resolve, reject) => {
      this.conn = mongoose.createConnection(this.mo_uri, opts);

      // MONGO CONNECTION EVENTS
      this.conn.on('connected', () => {
        const msg = this.mo_uri + ' -connected';
        console.log(chalk.blue(msg));
        resolve(msg);
      });

      this.conn.on('error', err => {
        console.error(chalk.red(this.mo_uri, err, 'readyState:' + this.conn.readyState));
        reject(err);
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

    });

  }


  /**
   * Disconnect from mongodb server.
   * @returns {Promise<void>}
   */
  async disconnect() {
    await new Promise(r => setTimeout(r, 1300));
    this.conn.close();
  }




  /***************** DATABASE  *****************/
  /**
   * Delete database
   * @returns {Promise<boolean>}
   */
  deleteDatabase() {
    return this.conn.db.dropDatabase();
  }



  /***************** COLLECTIONS  *****************/
  /**
   * List database collections
   * @returns {Promise<Array>}
   */
  showCollections() {
    return this.conn.db.listCollections().toArray();
  }


  /**
   * Delete database collections
   * @param {string} collectionName - collection name
   * @returns {Promise<boolen>}
   */
  deleteCollection(collectionName) {
    return this.conn.db.dropCollection(collectionName);
  }




  /***************** DOCUMENTS  *****************/
  /**
   * Create mongoose model and push it in the "this.compiledModels" array.
   * @param {Object|string} moSchema - mongoose.Schema or collectionName
   * @returns {Promise<void>}
   */
  async compileModel(moSchema) {

    //// define collectionName and sch
    let collectionName, sch;

    if (!moSchema) {
      // use genericSchema shema if other schema is not defined
      collectionName = genericSchema.options.collection;
      sch = genericSchema;
    } else if (typeof moSchema === 'string') { // when collectionName is used instead of mongoose Schema (to be compatible with old method)
      collectionName = moSchema;
      genericSchema.options.collection = collectionName;
      sch = genericSchema;
    } else {
      collectionName = moSchema.options.collection;
      sch = moSchema;
    }

    //// compile model and push to compiledModels
    this.model = this.conn.model(`${collectionName}MD`, sch); // if mongoose.createConnection() is used
    // console.dir(this.model.collection, { depth: 2 });

    this.compiledModels.push(this.model);
    await new Promise(resolve => setTimeout(resolve, 100)); // small delay
  }


  /**
   * Use mongoose model according to the selected collection name.
   * Define current model for methods: add, save, list, getOne, deleteOne, deleteMany, ...
   * @param {string} collectionName - mongodb collection name
   * @returns {void}
   */
  useModel(collectionName) {
    this.model = this.compiledModels.find(compiledModel => {
      const tf = compiledModel.collection.collectionName === collectionName;
      // console.log(compiledModel.collection.collectionName, '===' ,collectionName, ' =>', tf);
      return tf;
    });
    if (!this.model) { throw new Error(`Model not found for "${collectionName}" collection.`); }
  }


  /**
   * Save doc to collection.
   * @param {Object} doc - mongoose doc (object)
   * @returns {Promise<Object>}
   */
  save(doc) {
    const docObj = new this.model(doc);
    return docObj.save();
  }


  /**
   * Add doc to collection.
   * @param {Object|Array} doc - object or array of objects
   * @returns {Promise<Object>}
   */
  add(doc) {
    return this.model.create(doc);
  }



  /**
   * Bulk insertion.
   * @param {Array} docs - array of objects
   * @param {Object} insOpts - https://mongoosejs.com/docs/api/model.html#model_Model.insertMany
   * @returns {Promise<Object>}
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
   * @returns {Promise<Object>}
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
   * @returns {Promise<Object>}
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
   * @returns {Promise<Object>}
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
   * @returns {Promise<Object>}
   */
  deleteOne(moQuery) {
    return this.model.findOneAndDelete(moQuery);
  }


  /**
   * Delete docs.
   * @param {Object} moQuery - mongo query
   * @returns {Promise<Object>}
   */
  deleteMulti(moQuery) {
    return this.model.deleteMany(moQuery);
  }


  /**
   * Update a doc.
   * @param {Object} moQuery - mongo query
   * @param {Object} docNew - new, updated document
   * @param {Object} updOpts - https://mongoosejs.com/docs/api/model.html#model_Model.findOneAndUpdate
   * @returns {Promise<Object>}
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
   * Update a doc.
   * @param {Object} moQuery - mongo query
   * @param {Object} docNew - new, updated document
   * @param {Object} updOpts - https://mongoosejs.com/docs/api/model.html#model_Model.findOneAndUpdate
   * @returns {Promise<Object>}
   */
  editMulti(moQuery, docNew, updOpts) {
    if (!updOpts) {
      // default options https://mongoosejs.com/docs/api.html#query_Query-findOneAndUpdate
      updOpts = {
        strict: true,
        upsert: false,
        writeConcern: null,
        omitUndefined: false
      };
    }
    return this.model.updateMany(moQuery, docNew, updOpts);
  }



  /**
   * Count docs by the mongo query.
   * @param {Object} moQuery - mongo query
   * @returns {Promise<number>}
   */
  countDocs(moQuery) {
    return this.model.countDocuments(moQuery);
  }




}


module.exports = Mongo;

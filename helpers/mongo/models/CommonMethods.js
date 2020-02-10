const mongoose = require('mongoose');


class CommonModel {

  constructor(model) {
    this.model = model;
  }


  addDoc(docObj) {
    return this.model.create(docObj);
  }


  saveDoc(docObj) {
    const doc = new this.model(docObj);
    return doc.save();
  }


  listDocs(moQuery, limit, skip, sort, select) {
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


  getOneDoc(moQuery, sort, select) {
    return this.model
      .findOne(moQuery)
      .sort(sort)
      .select(select)
      .exec();
  }


  deleteOneDoc(moQuery) {
    return this.model.findOneAndDelete(moQuery);
  }


  deleteManyDocs(moQuery) {
    return this.model.deleteMany(moQuery);
  }


  editOneDoc(moQuery, docNew, updOpts) {
    return this.model.findOneAndUpdate(moQuery, docNew, updOpts);
  }


}


module.exports = CommonModel;

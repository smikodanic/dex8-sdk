/**
 * Read and write data into the CSV file.
 */
const fse = require('fs-extra');



class CSV {

  /**
   * @param {Object} opts - CSV file options
   * {
   *  filePath: './input.csv',
   *  encoding: 'utf8',
   *  mode: '0664',
   *  fields: ['url', 'name'],
   *  fieldDelimiter: ',',
   *  fieldWrapper: '"',
   *  rowDelimiter: '\n',
   * }
   */
  constructor(opts) {
    // NodeJS fs writeFile and appendFile options (https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback)
    this.filePath = opts.filePath;
    this.encoding = opts.encoding || 'utf8';
    this.mode = opts.mode || 0o664;

    // CSV file options
    this.fields = opts.fields; // array of CSV fields
    this.fieldDelimiter = opts.fieldDelimiter !== undefined ? opts.fieldDelimiter : ',';
    this.fieldWrapper = opts.fieldWrapper !== undefined ? opts.fieldWrapper : ''; // when field is JSON then use empty string as field delimiter
    this.rowDelimiter = opts.rowDelimiter !== undefined ? opts.rowDelimiter : '\n';

    // header
    this.header = this._fields2header();
  }




  /**
   * Create CSV file if it does not exist.
   * If the file that is requested to be created is in directories that do not exist, these directories are created.
   * If the file already exists, it is NOT MODIFIED.
   * @return {void}
   */
  async createFile() {
    if (!this.filePath) { throw new Error('File path is not defined.'); }
    if (!this.fields) { throw new Error('CSV fields are not defined.'); }
    await fse.ensureFile(this.filePath);
  }




  /**
   * Add fields into the CSV Header.
   * CAUTION: Old content is deleted so only headers will exist in the CSV file after this method is used.
   * @return {void}
   */
  async addHeader() {
    const opts = {
      encoding: this.encoding,
      mode: this.mode,
      flag: 'w'
    };
    await fse.writeFile(this.filePath, this.header, opts);
  }




  /**
   * Write multiple CSV rows.
   * CAUTION: Old content will be overwritten when this method is used.
   * @param {Array} rows - array of objects or array of primitive values
   * @return {void}
   */
  async writeRows(rows) {
    // A. convert array of objects into the string
    let rows_str = this._rows2str(rows);

    // B. add CSV header
    rows_str = this.header + rows_str;

    // C. write a row into the CSV file
    const opts = {
      encoding: this.encoding,
      mode: this.mode,
      flag: 'w'
    };
    await fse.writeFile(this.filePath, rows_str, opts);
  }




  /**
   * Append multiple CSV rows. New content will be added to the old content.
   * @param {Array} rows - array of objects or array of primitive values
   * @return {void}
   */
  async appendRows(rows) {
    // A. convert array of objects into the string
    const rows_str = this._rows2str(rows);

    // B. append a row into the CSV file
    const opts = {
      encoding: this.encoding,
      mode: this.mode,
      flag: 'a'
    };
    await fse.appendFile(this.filePath, rows_str, opts);
  }





  /**
   * Read CSV rows and convert it into the array of objects.
   * @param {boolean} convertType - if true convert JSON to object and other types, default is true
   * @param {string} csvTxt - the text from the CSV file (Notice: First row contains fields, for example: "name", "age", "company")
   * @return {Array} - array of objects where each element (object) is one CSV row
   */
  async readRows(convertType = true, csvTxt) {
    const opts = {
      encoding: this.encoding,
      flag: 'r'
    };
    const rows_str = csvTxt || await fse.readFile(this.filePath, opts);

    // convert string into array
    let rows = rows_str.split(this.rowDelimiter);

    // remove first element/row e.g. CSV header
    rows.shift();

    // remove empty rows
    rows = rows.filter(row => !!row);

    // correct row fields
    const splitter = this.fieldWrapper + this.fieldDelimiter + this.fieldWrapper;
    rows = rows.map(row => {
      const row_str_arr = row.split(splitter);  // split by , or  ","
      const rowObj = {};
      this.fields.forEach((field, key) => {
        let fieldValue = row_str_arr[key];
        if (!fieldValue) { rowObj[field] = ''; return; }

        fieldValue = fieldValue.replace(/ {2,}/g, ' '); // replace 2 or more empty spaces with only one
        fieldValue = fieldValue.trim(); // trim start & end of the string
        fieldValue = fieldValue.replace(/^\"/, '').replace(/\"$/, ''); // remove " from the beginning and the end
        // fieldValue = fieldValue.replace(/\'/g, '"'); // single quote ' to double quoted " (to ge valid JSON)

        if (!!convertType) { fieldValue = this._typeConvertor(fieldValue); }
        // console.log('fieldValue::', typeof fieldValue, fieldValue);

        rowObj[field] = fieldValue;
      });

      return rowObj;
    });


    return rows;
  }




  /**
   * Find CSV row by query and update it with doc.
   * @param {object} query - find row by query: {name: 'John', age: 22}
   * @param {object} doc - update found rows with doc: {name: 'John Doe', age: 23, company: 'Cloud Ltd'}
   * @return {{count:number, rows_updated: object[]}} - count of updated rows
   */
  async updateRows(query, doc) {
    const rows = await this.readRows(false) || [];

    let count = 0;

    // find & update rows
    const rows_updated = rows.map(row => {
      // filter row to be updated
      const tf = this._searchLogic(row, query);

      // update a row
      if (tf) {
        count++;
        for (const row_field of Object.keys(row)) {
          // update only row fields contained in the doc, other fields will remain same
          if (Object.keys(doc).includes(row_field)) {
            row[row_field] = doc[row_field] || '';
          }
        }
      }

      return row;
    });

    await this.writeRows(rows);

    const update_res = { count, rows_updated };
    return update_res;
  }



  /**
   * Find CSV row by the query.
   * @param {object} query - find row by query: {name: 'John', age: 22}
   * @return {object[]} - found rows
   */
  async findRows(query) {
    const rows = await this.readRows(true) || [];

    if (!query || (query instanceof Object && Object.keys(query).length === 0)) { return rows; } // when findRows() or findRows({}) is used

    // find rows
    const rows_found = rows.filter(row => {
      const tf = this._searchLogic(row, query);
      return tf;
    });

    return rows_found;
  }




  /**
   * Get fields array from the first (header) row.
   * For example if header is "name", "age", "company"  => ['name', 'age', 'company']
   * @param {string} csvTxt - CSV file content
   * @returns {Array} - array of fields
   */
  extractFields(csvTxt) {
    const rows = csvTxt.split(this.rowDelimiter);
    const first_row = rows[0];

    let splitter = this.fieldWrapper + this.fieldDelimiter + this.fieldWrapper; // "name","age","company"
    if (first_row.indexOf(splitter) == -1) { splitter = this.fieldDelimiter; } // name,age,company


    let fields = first_row.split(splitter); // split by ","
    if (!fields.length) { throw new Error(`Fields are not extracted from CSV text. Splitter: ${splitter}`); }

    fields = fields.map(field => {
      field = field.trim();
      field = field.replace(/^\"/, '').replace(/\"$/, ''); // remove " from the beginning
      return field;
    });

    this.fields = fields;

    return fields;
  }








  /***************************** PRIVATE ****************************/
  /******************************************************************/

  /**
   * Convert this.fields array to string which is the first row (header) in the CSV file.
   * @returns {string}
   */
  _fields2header() {
    const fields = this.fields.map(field => this.fieldWrapper + field + this.fieldWrapper); // ['"name"', '"age"']
    const header = fields.join(this.fieldDelimiter) + this.rowDelimiter; // "name","age"\n
    return header;
  }


  /**
   * Convert array of rows to string.
   * Argument "rows" can be an array of objects: [{url: 'www.site1.com', name: 'Peter'}, ...] where url and name must be in the this.fields
   * Argument "rows" can be an array of arrays: [['www.site1.com', 'Peter'], ...] where array elements must have same order as in the this.fields
   * @param {any[]} rows - rows
   * @returns {string}
   */
  _rows2str(rows) {
    let rows_str = '';
    rows.forEach(row => {
      this.fields.forEach((field, key) => {
        const fieldValue = Array.isArray(row) ? this._get_fieldValue(row, key) : this._get_fieldValue(row, field);
        if (key + 1 < this.fields.length) { rows_str += fieldValue + this.fieldDelimiter; }
        else { rows_str += fieldValue; }
      });
      rows_str += this.rowDelimiter;
    });
    return rows_str;
  }


  /**
   * Get field value from the row object after some corrections
   * @param {object} row - CSV row in the object format: {url: 'www.site1.com', name: 'Peter'}
   * @param {string} field - field of the row object: 'url'
   * @return {string} - row field in the string format. if the value is object then it is stringified
   */
  _get_fieldValue(row, field) {
    // correct & beautify field value
    let fieldValue = row[field];

    // convert into the string because CSV fields are strings
    if (fieldValue === undefined) {
      fieldValue = '';
    } else if (typeof fieldValue === 'object') {
      fieldValue = JSON.stringify(fieldValue); // convert object into string
      fieldValue = fieldValue.replace(/\"/g, '\'');
    } else if (typeof fieldValue === 'number') {
      fieldValue = fieldValue.toString();
    } else if (typeof fieldValue === 'boolean') {
      fieldValue = fieldValue ? 'true' : 'false';
    }

    fieldValue = fieldValue.slice(0, 2000); // reduce number of characters
    fieldValue = fieldValue.replace(/\"/g, '\"'); // escape double quotes
    fieldValue = fieldValue.replace(/ {2,}/g, ' '); // replace 2 or more empty spaces with just one space
    fieldValue = fieldValue.replace(/\n|\r/g, ''); // remove new line and carriage returns
    fieldValue = fieldValue.trim(); // trim start & end of the string
    fieldValue = this.fieldWrapper + fieldValue + this.fieldWrapper; // wrap into double quotes "..."

    return fieldValue;
  }


  /**
   * Convert string into integer, float or boolean.
   * @param {string} value
   * @returns {string | number | boolean | object}
   */
  _typeConvertor(value) {
    function isJSON(value) {
      try { JSON.parse(value); }
      catch (err) { return false; }
      return true;
    }

    if (!!value && !isNaN(value) && !/\./.test(value)) { // convert string into integer (12)
      value = parseInt(value, 10);
    } else if (!!value && !isNaN(value) && /\./.test(value)) { // convert string into float (12.35)
      value = parseFloat(value);
    } else if (value === 'true' || value === 'false') { // convert string into boolean (true)
      value = JSON.parse(value);
    } else if (isJSON(value)) {
      value = JSON.parse(value);
    }

    return value;
  }


  /**
   * Test CSV row against query. Query is simmilar to MongoDB -> $eq, $ne, $gt, ....
   * @param {object} row - CSV row in object format
   * @param {object} query - query for the row object, for example: {name: {$regex: /john/i}}
   * @returns {boolean}
   */
  _searchLogic(row, query) {
    const props = Object.keys(query);
    let tf = true;

    for (const prop of props) {
      const $eq = query[prop].$eq; // query -> {name: {$eq: 'Johnny'}}
      const $ne = query[prop].$ne; // {name: {$ne: 'Johnny'}}
      const $gt = query[prop].$gt; // {age: {$gt: 22}}
      const $gte = query[prop].$gte; // {age: {$gte: 22}}
      const $lt = query[prop].$lt; // {name: {$lt: 22}}
      const $lte = query[prop].$lte; // {name: {$lte: 22}}
      const $regex = query[prop].$regex; // {name: {$regex: /Joh/i}}
      const $in = query[prop].$in; // {name: {$in: ['John', 'Mark']}}
      const $exists = query[prop].$exists; // {user_id: {$exists: false}}

      if ($eq !== undefined) {
        tf = tf && row[prop] === query[prop].$eq;
      } else if ($ne !== undefined) {
        tf = tf && row[prop] !== query[prop].$ne;
      } else if ($gt !== undefined) {
        tf = tf && row[prop] > query[prop].$gt;
      } else if ($gte !== undefined) {
        tf = tf && row[prop] >= query[prop].$gte;
      } else if ($lt !== undefined) {
        tf = tf && row[prop] < query[prop].$lt;
      } else if ($lte !== undefined) {
        tf = tf && row[prop] <= query[prop].$lte;
      } else if ($regex !== undefined) {
        tf = tf && $regex.test(row[prop]);
      } else if ($in !== undefined) {
        tf = tf && query[prop].$in.indexOf(row[prop]) !== -1;
      } else if ($exists !== undefined) {
        const extProps = Object.keys(row);
        if ($exists === true) { tf = tf && extProps.indexOf(prop) !== -1; }
        else if ($exists === false) { tf = tf && extProps.indexOf(prop) === -1; }
      } else {
        tf = tf && row[prop] === query[prop];
      }

    }
    return tf;
  }




}








module.exports = CSV;

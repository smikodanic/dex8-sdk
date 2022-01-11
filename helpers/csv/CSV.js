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
   *  delimiter: ','
   * }
   */
  constructor(opts) {
    // NodeJS fs writeFile and appendFile options (https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback)
    this.filePath = opts.filePath;
    this.encoding = opts.encoding || 'utf8';
    this.mode = opts.mode || 0o664;

    // CSV file options
    this.fields = opts.fields; // array of CSV fields
    this.fieldDelimiter = opts.fieldDelimiter || ',';
    this.rowDelimiter = opts.rowDelimiter || '\n';

    // derivates
    this.header = this.fields.join() + this.rowDelimiter;
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
   * @return {Array} - array of objects where each element (object) is one CSV row
   */
  async readRows(convertType = true) {
    const opts = {
      encoding: this.encoding,
      flag: 'r'
    };
    const rows_str = await fse.readFile(this.filePath, opts);

    // convert string into array
    let rows = rows_str.split(this.rowDelimiter);

    // remove first element/row e.g. CSV header
    rows.shift();

    // remove empty rows
    rows = rows.filter(row => !!row);

    // convert rows into the objects
    rows = rows.map(row => {
      const row_str_arr = row.split(this.fieldDelimiter);
      const rowObj = {};
      this.fields.forEach((field, key) => {
        let fieldValue = row_str_arr[key];

        fieldValue = fieldValue.replace(/ {2,}/g, ' '); // replace 2 or more empty spaces with only one
        fieldValue = fieldValue.trim(); // trim start & end of the string
        fieldValue = fieldValue.replace(/^\"/, '').replace(/\"$/, ''); // remove " from the beginning and the end
        fieldValue = fieldValue.replace(/\'/g, '"'); // single quote ' to double quoted " (to ge valid JSON)

        // find {} or [] and convert JSON to object
        // if (toObject && ((/^\{/.test(fieldValue) && /\}$/.test(fieldValue)) || (/^\[/.test(fieldValue) && /\]$/.test(fieldValue)))) {
        //   fieldValue = JSON.parse(fieldValue);
        // }

        if (!!convertType) { fieldValue = this._typeConvertor(fieldValue); }
        // console.log('fieldValue::', typeof fieldValue, fieldValue);

        rowObj[field] = fieldValue;
      });

      return rowObj;
    });


    return rows;
  }








  /***************************** PRIVATE ****************************/
  /******************************************************************/

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
   * @param {Object} row - CSV row in the object format: {url: 'www.site1.com', name: 'Peter'}
   * @param {String} field - field of the row object: 'url'
   * @return {String} - row field in the string format. if the value is object then it is stringified
   */
  _get_fieldValue(row, field) {
    // correct & beautify field value
    let fieldValue = row[field];

    if (!fieldValue && fieldValue !== 0) { fieldValue = ''; }

    // convert into the string because CSV fields are strings
    if (typeof fieldValue === 'object') {
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
    fieldValue = '"' + fieldValue + '"'; // wrap into double quotes "..."

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




}








module.exports = CSV;

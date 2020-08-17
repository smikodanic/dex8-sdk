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
  constructor (opts) {
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
   * @param {Array} rows - array of objects, for example: [{url: 'www.site1.com', name: 'Peter'}, {url: 'www.site2.com', name: 'John'}]
   * @return {void}
   */
  async writeRows(rows) {
    // A. convert array of objects into the string
    let rows_str = '';
    rows.forEach(row => {

      this.fields.forEach((field, key) => {

        const fieldValue = this._get_fieldValue(row, field);

        // append field value
        if (key + 1 < this.fields.length) {
          rows_str += fieldValue + this.fieldDelimiter;
        } else {
          rows_str += fieldValue;
        }

      });

      rows_str += this.rowDelimiter;
    });


    // B. write a row into the CSV file
    rows_str = this.header + rows_str; // add CSV header

    const opts = {
      encoding: this.encoding,
      mode: this.mode,
      flag: 'w'
    };
    await fse.writeFile(this.filePath, rows_str, opts);
  }




  /**
   * Append multiple CSV rows. New content will be added to the old content.
   * @param {Array} rows - array of objects, for example: [{url: 'www.site1.com', name: 'Peter'}, {url: 'www.site2.com', name: 'John'}]
   * @return {void}
   */
  async appendRows(rows) {
    // A. convert array of objects into the string
    let rows_str = '';
    rows.forEach(row => {

      this.fields.forEach((field, key) => {

        const fieldValue = this._get_fieldValue(row, field);

        // append field value
        if (key + 1 < this.fields.length) {
          rows_str += fieldValue + this.fieldDelimiter;
        } else {
          rows_str += fieldValue;
        }

      });

      rows_str += this.rowDelimiter;
    });


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
   * @return {Array} - array of objects where each element (object) is one CSV row
   */
  async readRows() {
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
        fieldValue = fieldValue.replace(/^\"/, '');
        fieldValue = fieldValue.replace(/\"$/, '');

        // convert {} or []
        if ((/^\{/.test(fieldValue) && /\}$/.test(fieldValue)) || (/^\[/.test(fieldValue) && /\]$/.test(fieldValue))) {
          fieldValue = JSON.parse(fieldValue);
        }

        rowObj[field] = fieldValue;
      });

      return rowObj;
    });


    return rows;
  }








  /***************************** PRIVATE ****************************/
  /******************************************************************/

  /**
   * Get field value from the row object after some corrections
   * @param {Object} row - CSV row in the object format: {url: 'www.site1.com', name: 'Peter'}
   * @param {String} field - field of the row object: 'url'
   * @return {String} - row field in the string format. if the value is object then it is stringified
   */
  _get_fieldValue(row, field) {
    // correct & beautify field value
    let fieldValue = row[field];

    if (!fieldValue && fieldValue !== 0) {
      fieldValue = '';
    }

    // convert into the string because CSV fields are strings
    if (typeof fieldValue === 'object') {
      fieldValue = JSON.stringify(fieldValue); // convert object into string
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






}








module.exports = CSV;

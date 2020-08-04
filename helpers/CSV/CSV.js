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
    this.filePath = opts.filePath;
    this.removeExisting = true; // remove existing CSV file before creating new one

    // NodeJS fs options (https://nodejs.org/api/fs.html)
    this.encoding = opts.encoding || 'utf8';
    this.mode = opts.mode || '0664';
    this.flag = opts.flag || 'a+'; // https://nodejs.org/api/fs.html#fs_file_system_flags

    this.fields = opts.fields; // array of CSV fields
    this.fieldDelimiter = opts.fieldDelimiter || ',';
    this.rowDelimiter = opts.rowDelimiter || '\n';
  }



  /**
   * 1. create CSV file if it does not exist
   * 2. add headers
   */
  async prepareFile() {
    if (!this.filePath) {
      throw new Error('File path is not defined.');
    }
    if (!this.fields) {
      throw new Error('CSV fields are not defined.');
    }

    if (fse.pathExistsSync(this.filePath) && this.removeExisting) {
      fse.remove(this.filePath);
    }
    await fse.ensureFile(this.filePath);

    const header = this.fields.join() + this.rowDelimiter;
    const opts = {
      encoding: this.encoding,
      mode: this.mode,
      flag: this.flag
    };
    await fse.writeFile(this.filePath, header, opts);
  }



  /**
   * Append new CSV rows.
   * @param {Array} rows - array of objects, for example: [{url: 'www.site1.com', name: 'Peter'}, {url: 'www.site2.com', name: 'John'}]
   */
  async writeRows(rows) {
    // convert array into string
    let rows_str = '';
    rows.forEach(row => {

      this.fields.forEach((field, key) => {

        // correct & beautify field value
        let fieldValue = row[field];

        if (!fieldValue) {
          fieldValue = '';
        }

        if (typeof fieldValue === 'object') {
          fieldValue = JSON.stringify(fieldValue); // convert obvject into string
        }

        fieldValue = fieldValue.slice(0, 2000); // reduce number of characters
        fieldValue = fieldValue.replace(/\"/g, '\"'); // escape double quotes
        fieldValue = fieldValue.replace(/ {2,}/g, ' '); // replace empty spaces with just one space
        fieldValue = fieldValue.replace(/\n|\r/g, ''); // remove new line and carriage returns
        fieldValue = fieldValue.trim(); // trim start & end of the string
        fieldValue = '"' + fieldValue + '"'; // wrap into double quotes "..."

        // append field value
        if (key + 1 < this.fields.length) {
          rows_str += fieldValue + this.fieldDelimiter;
        } else {
          rows_str += fieldValue;
        }

      });

      rows_str += this.rowDelimiter;
    });

    const opts = {
      encoding: this.encoding,
      mode: this.mode,
      flag: this.flag
    };
    await fse.writeFile(this.filePath, rows_str, opts);
    return rows_str;
  }




  /**
   * Read CSV rows and convert it into the array of objects.
   */
  async readRows() {
    const opts = {
      encoding: this.encoding,
      flag: this.flag
    };
    const rows_str = await fse.readFile(this.filePath, opts);

    // convert string into array
    let rows = rows_str.split(this.rowDelimiter);

    // remove first element/row (field names)
    rows.shift();

    // remove empty rows
    rows = rows.filter(row => !!row);

    // convert rows into the objects
    rows = rows.map(row => {
      const row_str_arr = row.split(this.fieldDelimiter);
      const rowObj = {};
      this.fields.forEach((field, key) => {
        let fieldValue = row_str_arr[key];
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





}





module.exports = CSV;

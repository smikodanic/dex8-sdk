/**
 * Extended String methods
 * Usage:
 * const { StringExt } = require('dex8-sdk');
 * new StringExt();
 * // now all strings are extended with the methods, for example:
 * 'some string'.clean();
 */
class StringExt {

  constructor() {
    this._trimall();
    this._clean();
    this._beautify();
  }


  /**
   * Trim empty spaces from left and right and remove tab spaces inside text
   */
  _trimall() {
    Object.assign(String.prototype, {
      trimall() {
        let that = this;
        that = that.trim();
        that = that.replace(/\t\t+/g, ' ');
        that = that.replace(/\s\s+/g, ' ');
        that = that.replace(/\n\n+/g, '\n');
        that = that.replace(/\r\r+/g, '\r');
        that = that.replace(/\. /g, '.\r'); //new sentence in new line
        return this;
      }
    });
  }


  /**
   * Remove all whitespaces.
   */
  _clean() {
    Object.assign(String.prototype, {
      clean() {
        let that = this;
        that = that.trim();
        that = that.replace(/\\s+/g, ' ');
        that = that.replace(/\\n+/g, '');
        that = that.replace(/\\r+/g, '');
        that = that.replace(/\\t+/g, '');
        return that;
      }
    });
  }


  /**
   * Clear text from unwanted characters
   */
  _beautify() {
    Object.assign(String.prototype, {
      beautify() {
        let that = this;
        that = that.replace(/_/g, ' ');
        that = that.replace(/:/g, '');
        that = that.replace(/\./g, '');
        return this;
      }
    });
  }



  /**
   * Convert price string to number
   * 2,123.00 -> 21123.00
   * 2.123,00 -> 21123.00
   * @param {string} p - price
   * @returns {number}
   */
  _price2number() {
    Object.assign(String.prototype, {
      price2number() {
        let p = this; // price
        if (!p) { return null; }

        p = p
          .replace(/\n+/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\$|\€|\£|\¥‎|\₽|USD|EUR|GBP|RUB|KN/i, '')
          .trim();

        // replace comma as decimal separator with dot
        const matchedA = p.match(/(.)\d{2}$/);
        const decimal_separator = matchedA[1];
        if (decimal_separator === ',') { p = p.replace(',', '.'); }

        // remove first . or , if there are two
        if (/\d+[\.|\,]\d+\.\d+/.test(p)) { p = p.replace(/\.|\,/, ''); }

        // convert to number
        p = parseFloat(p);

        // round to 2 decimals
        p = +p.toFixed(2);


        // console.log('p::', p);
        return p;
      }
    });
  }




}


module.exports = StringExt; // CommonJS Modules
// export { StringExt }; // ES6 module

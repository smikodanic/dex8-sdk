const path = require('path');
const fse = require('fs-extra');

/**
 * Cookie library for NodeJS environment.
 */
class CookiePptr {

  /**
   *
   * @param {string} cookie_file_name - fileName.json
   * @param {Page|Frame} page - puppeteer's Page or Frame object
   */
  constructor(cookie_file_name, page) {
    if (!cookie_file_name) { cookie_file_name = 'generalCookieFile.json'; }
    cookie_file_name = cookie_file_name.replace('@', '__').replace('.', '_');
    this.cookie_file_path = path.join(__dirname, '../../tmp/cookies', cookie_file_name);

    if (!page) { throw new Error('The puppeteer page or Frame is not defined.'); }
    this.page = page;
  }


  /**
   * Save cookie data from browser to file.
   * @returns {string} - the message
   */
  async saveToFile() {
    await fse.ensureFile(this.cookie_file_path);
    const cookies_arr = await this.page.cookies();
    await fse.writeJson(this.cookie_file_path, cookies_arr, { spaces: 2 });
    return 'Cookie is saved.';
  }


  /**
   * Get cookie data from the file and set browser's cookie.
   * @returns {string} - the message
   */
  async takeFromFile() {
    if (fse.existsSync(this.cookie_file_path)) {

      const cookies_arr = await fse.readJson(this.cookie_file_path);
      if (cookies_arr.length !== 0) {

        for (const cookie of cookies_arr) {
          await this.page.setCookie(cookie);
        }

        return 'Cookies were loaded in the browser.';
      }

    } else {
      return 'Cookie JSON file does not exist and login will continue from login form.';
    }
  }


}



module.exports = CookiePptr;



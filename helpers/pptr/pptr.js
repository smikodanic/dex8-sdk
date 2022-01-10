const fse = require('fs-extra');
const path = require('path');


/**
 * Puppeteer extension methods.
 */
class Pptr {

  /**
   * Autoscroll the web page where content is loaded dynamically as the user scroll down. For example the facebook posts.
   * Scroll vertically to the last element.
   * The scroll will stop when the text content of the last element is equal to the previous element text content. What means there's no new content on the page.
   * @param {Page|Frame} page - puppeteer Page or Frame object
   * @param {string} cssSel - CSS selector of the last repetitive content, for example table > tbody > tr:last-child
   * @param {number} delay - the time interval between every consecutive scroll
   * @returns {void}
   */
  async autoscroll(page, cssSel, delay = 1300) {
    return await page.evaluate((cssSel, delay) => {
      return new Promise((resolve, reject) => {
        let lastElemContent;
        let scrollCounter = 0;
        const ID = setInterval(() => {
          const elem = document.querySelector(cssSel);
          elem.scrollIntoView();

          // console.log('lastElemContent::', lastElemContent);
          if (lastElemContent === elem.textContent) { clearInterval(ID); resolve({ lastElemContent, scrollCounter }); }

          lastElemContent = elem.textContent;
          scrollCounter++;

        }, delay);
      });
    }, cssSel, delay);
  }



  /**
   * Click the SELECT tag and then click OPTION with the text
   * @param {Page|Frame} page - puppeteer Page or Frame object
   * @param {string} sel - css selector for SELECT tag
   * @param {string} txt - text contained in the OPTION tag
   * @returns {void}
   */
  async selectOption(page, sel, txt) {
    // click on SELECT
    await page.waitForSelector(sel, 5000);
    // console.log(`Click SELECT "${sel}"`);
    page.click(sel);

    // wait to open option
    await new Promise(resolve => setTimeout(resolve, 1300));

    // click OPTION with the "txt"
    // console.log(`Choose the OPTION with the text "${txt}"`);
    await page.evaluate(obj => {
      const select_tag = document.querySelector(obj.sel);
      const elems_obj = select_tag.querySelectorAll('option');
      const selected_option = [...elems_obj].find(option => option.text === obj.txt);
      selected_option.selected = true;

      // activate onChange() on SELECT
      const event = new Event('change');
      select_tag.dispatchEvent(event);
    }, { sel, txt });

    await new Promise(resolve => setTimeout(resolve, 1300));

    await page.click('body');

    await new Promise(resolve => setTimeout(resolve, 1300));
  }



  /**
   * Click the element defined by the xPath which contains text
   * @param {Page|Frame} page - puppeteer page object
   * @param {string} xPath - part of the xPath - //ul[@id="allBsnsList"]/li/a
   * @param {string} txt - text contained in the HTML element
   * @param {boolean} exactMatch - if true find exact word match
   * @returns {void}
   */
  async clickElemWithText(page, xPath, txt, exactMatch) {
    let xPath2;
    if (!!exactMatch) { xPath2 = xPath + `[text()="${txt}"]`; }
    else { xPath2 = xPath + `[contains(text(), "${txt}")]`; }

    // console.log(`--click ${xPath2}`);
    await page.waitForXPath(xPath2, { timeout: 13000 });

    const [elem_EH] = await page.$x(xPath2);
    if (!!elem_EH) {
      await elem_EH.click(); // Error: Node is either not visible or not an HTMLElement
      // await elem_EH.evaluate(elem => {
      //   console.log('elem::', elem);
      //   elem.focus();
      //   elem.style.visibility = 'visible';
      //   elem.style.selected = 'selected';
      //   elem.click();
      // });
    }
    else { throw new Error(`No element with xPath ${xPath2}`); }
  }



  /**
   * Click the element defined by the xPath which contains text
   * @param {Object} page - puppeteer page object
   * @param {String} xPath - part of the xPath - //ul[@id="allBsnsList"]/li/a
   * @param {Object} txt - text contained in the HTML element
   * @param {Boolean} exactMatch - if true find exact word match
   */
  async clickElemWithText_bubles(page, xPath, txt, exactMatch) {
    let xPath2;
    if (!!exactMatch) { xPath2 = xPath + `[text()="${txt}"]`; }
    else { xPath2 = xPath + `[contains(text(), "${txt}")]`; }

    // console.log(`--click ${xPath2}`);
    await page.waitForXPath(xPath2, 5000);

    const [elem_EH] = await page.$x(xPath2);

    if (elem_EH) {
      await elem_EH.evaluate(elem_DOM => {
        const clickEvent = new Event('click', { bubbles: true, cancelable: true });
        elem_DOM.dispatchEvent(clickEvent);
      });
    } else { throw new Error(`No element with xPath ${xPath2}`); }
  }



  /**
   * Check if the text is contained on the page.
   * @param {Page|Frame} page - puppeteer page object
   * @param {string} txt - text contained in the whole page's HTML
   * @returns {boolean}
   */
  checkTextOnPage(page, txt) {
    return page.waitForFunction(async txt => {
      const url = document.URL;
      const tf = document.querySelector('body').innerText.includes(txt);
      if (tf) { return true; }
      else { throw new Error(`Page ${url} does not contain "${txt}" text!`); }
    }, { timeout: 60000 }, txt);
  }



  /**
   * Wait for the URL which contains "txt"
   * @param {Page|Frame} page - puppeteer page object
   * @param {string} txt - text contained in the URL
   * @returns {boolean}
   */
  async waitURLContains(page, txt) {
    await page.waitForResponse(response => {
      // console.log('response.url()::', response.url());
      return response.url().includes(txt);
    });

    // await page.waitForRequest(request => {
    //   console.log('request.url()::', request.url());
    //   // return request.url().includes(txt);
    //   return true;
    // });
  }



  /**
   * Clear the input field. Useful before typing new value into the INPUT text field.
   * @param {Page|Frame} page - puppeteer page object
   * @param {string} sel - css selector of the INPUT filed
   * @returns {void}
   */
  async inputClear(page, sel) {
    await page.evaluate(sel => {
      document.querySelector(sel).value = '';
    }, sel);
  }



  /**
   * Fill the input field by typing into it
   * @param {Page|Frame} page - puppeteer page object
   * @param {string} sel - css selector
   * @param {string} val - input value
   * @returns {void}
   */
  async inputType(page, sel, val) {
    await page.waitForSelector(sel);
    await page.click(sel);
    await page.keyboard.type(val);
  }



  /**
   * Create the screenshot image and save it into the folder. The file will be saved as .jpg.
   * @param {Page|Frame} page - puppeteer page object
   * @param {string} dirPath - path to the directory where screenshot will be saved, for example '../../tmp/screenshots/progressive_commercialAuto/'
   * @param {string} fileName - the screenshot file name, for example 'myScreenshot.jpg' or just 'myScreenshot'
   * @returns {void}
   */
  async saveScreenshot(page, dirPath, fileName) {
    await fse.ensureDir(dirPath);

    const fileWithExtension = /\.jpg/.test(fileName) ? fileName : fileName + '.jpg';
    const filePath = path.join(dirPath, fileWithExtension);

    await page.screenshot({
      path: filePath,
      type: 'jpeg',
      quality: 70,
      fullPage: true
    });
    // console.log(`Screenshot "${file}" created.`);
  }




}



module.exports = new Pptr();

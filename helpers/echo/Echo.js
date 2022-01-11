/**
 * DEX8 library for sending messages, objekts and errors via websocket or to console.
 * Echo, websocket message format:
 * {
 *  user_id,
 *  robot_id,
 *  task_id,
 *  echo_method: 'log'|'objekt'|'error'|'image'|'input',
 *  echo_msg: any,
 *  time: string
 * }
 */

const chalk = require('chalk');
const moment = require('moment');
const inquirer = require('inquirer');



class Echo {

  constructor(user_id, robot_id, task_id, wsClient) {
    // initialize the websocket message object
    this.msgObj = {
      user_id,
      robot_id,
      task_id,
      echo_method: '', // log, error, objekt, error, image, input
      echo_msg: '',
      time: ''
    };

    // websocket client
    this.wsClient = wsClient;

    // short console log -> string message instead of whole object in __console_log() method
    this.short = false;
  }


  /**
   * Method used in the task functions as echo.log('My message');
   * Send comma separated strings to API via websocket and/or to linux console.
   * Use multiple parameters like in console.log --> echo.log('one', 'two')
   * @param {String} strings - strings separated by comma, for example echo.log('one', 'two')
   * @return {any}
   */
  async log(...strings) { // ... is "rest parameters" operator
    // if strings is object then convert it into string
    strings = strings.map(s => {
      if (typeof s === 'object') {
        try {
          s = JSON.stringify(s, null, 2);
        } catch (err) {
          console.log(err);
        }
      }
      return s;
    });

    const str = strings.join(' '); // join with space  ::  echo.log('a', 'b') ---> ['a', 'b'] ---> 'a b'
    this._format('log', str);
    await this._log();
    return this.msgObj;
  }


  /**
   * Method used in task functions as echo.objekt({uri: 'deployment/changeaction/5e0246a283cf516d4b788f43', {action: 'stop'}});
   * Send object to API via websocket and/or to linux console.
   * @param {Object} obj - object
   * @return {any}
   */
  async objekt(obj) {
    this._format('objekt', obj);
    await this._log();
    return this.msgObj;
  }


  /**
   * Method used in task functions as echo.error(new Error('Some intentional error'));
   * Send error to API via websocket and/or to linux console.
   * @param {Error} err - some error, for example new Error('Scraper error')
   * @return {any}
   */
  async error(err) {
    this._format('error', err);
    await this._log();
    return this.msgObj;
  }


  /**
   * Method used in task functions as echo.image('v1w4fnDx9N5fD4t2ft93Y/88IaZLbaPB8+3O1ef+/+jfXqzzf...');
   * Send image in the base64 format to API via websocket.
   * @param {String} img_b64 - image in the base64 (string) format
   * @return {any}
   */
  async image(img_b64) {
    this._format('image', img_b64);
    await this._log();
    return this.msgObj;
  }


  /**
   * Method used in task functions as echo.input();
   * Send input which should be listened with the listen() method.
   * @param {String} inp - text in front of the input field (label)
   * @return {any}
   */
  async input(inp) {
    this._format('input', inp);
    await this._log();
    return this.msgObj;
  }


  /**
   * Listen for the first message from the web panel or API
   * @return {Promise<any>} - can be used in async function as "const msg = await echo.listen()"
   */
  async listen() {
    if (!!this.wsClient) { // listen input from the Web Panel
      return new Promise((resolve, reject) => {
        this.wsClient.once('message', (msg, msgSTR, msgBUF) => {
          resolve(msgSTR);
        });
        setTimeout(() => {
          reject(new Error('Echo input stopped to listen due to timeout of 1 minute.'));
        }, 60000);
      });
    } else { // listen input from the Linux Console
      const questions = [
        { type: 'input', name: 'inp', message: 'input:', default: '' }
      ];
      const answers = await inquirer.prompt(questions);
      return answers.inp;
    }
  }




  /******** PRIVATE METHODS  *******/

  /**
   * Format object which is sent by websocket or to linux console.
   * @param {String} echo_method - used echo method: log, error, objekt, ...
   * @param {String} echo_msg - the echo message
   */
  _format(echo_method, echo_msg) {
    if (echo_method === 'error') {
      // convert error to object with two properties: message: string and stack: string
      echo_msg = {
        message: echo_msg.message,
        stack: echo_msg.stack
      };
    }

    const time = moment().toISOString();

    this.msgObj = Object.assign(this.msgObj, { echo_method, echo_msg, time }); // {user_id, robot_id, task_id, echo_method, echo_message, time}
  }


  /**
   * Log messages depending if wsClient exists or not.
   */
  async _log() {
    if (!!this.wsClient) {
      await this.__socket_log();
      this.__console_log();
    } else {
      this.__console_log();
    }
  }


  /**
   * Socket log. Send wsClient message.
   */
  async __socket_log() {
    await this.wsClient.route('/echo/distribute', this.msgObj);
  }


  /**
   * Linux console log.
   */
  __console_log() {
    if (this.short) {
      /* SHORT PRINT */
      const time = moment(this.msgObj.time).format('DD.MMM.YYYY HH:mm:ss.SSS');
      if (!!this.msgObj && this.msgObj.echo_method === 'log') {
        if (this.msgObj.echo_msg === '') { console.log(); return; }
        console.log(chalk.greenBright(`(${time})`, this.msgObj.echo_msg)); // print string
      } else if (!!this.msgObj && this.msgObj.echo_method === 'objekt') {
        console.log(chalk.blueBright(`(${time})`, JSON.stringify(this.msgObj.echo_msg))); // print stringified object
      } else if (!!this.msgObj && this.msgObj.echo_method === 'error') { // print error
        console.log(chalk.redBright(`(${time})`, JSON.stringify(this.msgObj.echo_msg.message)));
      } else if (!!this.msgObj && this.msgObj.echo_method === 'image') { // print base64 image
        console.log(chalk.yellowBright(`(${time})`, JSON.stringify(this.msgObj.echo_msg)));
      } else if (!!this.msgObj && this.msgObj.echo_method === 'input') { // print input label message
        console.log(chalk.whiteBright(`(${time})`, JSON.stringify(this.msgObj.echo_msg)));
      }
    } else {
      /* LONG PRINT */
      const msg = JSON.stringify(this.msgObj, null, 4);
      if (!!this.msgObj && this.msgObj.echo_method === 'log') {
        if (this.msgObj.echo_msg === '') { console.log(); return; }
        console.log(chalk.greenBright(msg)); // print string
      } else if (!!this.msgObj && this.msgObj.echo_method === 'objekt') {
        console.log(chalk.blueBright(msg)); // print object
      } else if (!!this.msgObj && this.msgObj.echo_method === 'error') {
        console.log(chalk.redBright(msg)); // print error
      } else if (!!this.msgObj && this.msgObj.echo_method === 'image') {
        console.log(chalk.yellowBright(msg)); // print base64 image
      } else if (!!this.msgObj && this.msgObj.echo_method === 'input') {
        console.log(chalk.whiteBright(msg)); // print input label message
      }
    }
  }




}


module.exports = Echo;

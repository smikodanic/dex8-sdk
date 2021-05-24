/**
 * DEX8 library for logging echo messages.
 * Echo, websocket message format:
 * echoObj:: {
 *  echo_method: 'log'|'objekt'|'error'|'image',
 *  echo_msg: any,
 *  time: string
 * }
 */

const chalk = require('chalk');
const moment = require('moment');
const EventEmitter = require('events');



class Echo {

  constructor() {
    this.eventEmitter = new EventEmitter; // send echo message to the robot
    this.short = false; // short log message
  }


  /**
   * Method used in the task functions as echo.log('My message');
   * Send comma separated strings to API via websocket and/or to linux console.
   * Use multiple parameters like in console.log --> echo.log('one', 'two')
   * @param {String} strings - strings separated by comma, for example echo.log('one', 'two')
   * @return {any}
   */
  log(...strings) { // ... is "rest parameters" operator
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
    const echoObj = this._format('log', str);
    this._log(echoObj);
    return echoObj;
  }


  /**
   * Method used in task functions as echo.objekt({uri: 'deployment/changeaction/5e0246a283cf516d4b788f43', {action: 'stop'}});
   * Send object to API via websocket and/or to linux console.
   * @param {Object} obj - object
   * @return {any}
   */
  objekt(obj) {
    const echoObj = this._format('objekt', obj);
    this._log(echoObj);
    return echoObj;
  }


  /**
   * Method used in task functions as echo.error(new Error('Some intentional error'));
   * Send error to API via websocket and/or to linux console.
   * @param {Error} err - some error, for example new Error('Scraper error')
   * @return {any}
   */
  error(err) {
    const echoObj = this._format('error', err);
    this._log(echoObj);
    return echoObj;
  }


  /**
   * Method used in task functions as echo.image('v1w4fnDx9N5fD4t2ft93Y/88IaZLbaPB8+3O1ef+/+jfXqzzf...');
   * Send image in the base64 format to API via websocket.
   * @param {String} img_b64 - image in the base64 (string) format
   * @return {any}
   */
  img(img_b64) {
    const echoObj = this._format('image', img_b64);
    this._log(echoObj);
    return echoObj;
  }




  /******** PRIVATE METHODS  *******/
  /**
   * Format object which is sent by websocket or to linux console.
   * @param {String} echo_method - used echo method: log, error, objekt, image
   * @param {String} echo_msg - the echo message
   */
  _format(echo_method, echo_msg) {
    if (echo_method === 'error') {
      // convert error to object with two properties: message:string and stack:string
      echo_msg = {
        message: echo_msg.message,
        stack: echo_msg.stack
      };
    }
    const time = moment().toISOString();
    const echoObj = {echo_method, echo_msg, time};
    return echoObj;
  }


  /**
   * Log messages
   * @param {object} echoObj - {echo_method, echo_msg, time}
   */
  _log(echoObj) {
    this.eventEmitter.emit('echo', echoObj);

    if (this.short) {
      /* SHORT PRINT */
      const time = moment(echoObj.time).format('DD.MMM.YYYY HH:mm:ss.SSS');
      if (!!echoObj && echoObj.echo_method === 'log') {
        if (echoObj.echo_msg === '') { console.log(); return; }
        console.log(chalk.greenBright(`(${time})`, echoObj.echo_msg)); // print string
      } else if (!!echoObj && echoObj.echo_method === 'objekt') {
        console.log(chalk.blueBright(`(${time})`, JSON.stringify(echoObj.echo_msg))); // print stringified object
      } else if (!!echoObj && echoObj.echo_method === 'error') { // print error
        console.log(chalk.redBright(`(${time})`, JSON.stringify(echoObj.echo_msg.message)));
      } else if (!!echoObj && echoObj.echo_method === 'image') { // print base64 image
        console.log(chalk.yellowBright(`(${time})`, JSON.stringify(echoObj.echo_msg)));
      }
    } else {
      /* LONG PRINT */
      const msg = JSON.stringify(echoObj, null, 4);
      if (!!echoObj && echoObj.echo_method === 'log') {
        if (echoObj.echo_msg === '') { console.log(); return; }
        console.log(chalk.greenBright(msg)); // print string
      } else if (!!echoObj && echoObj.echo_method === 'objekt') {
        console.log(chalk.blueBright(msg)); // print object
      } else if (!!echoObj && echoObj.echo_method === 'error') {
        console.log(chalk.redBright(msg)); // print error
      } else if (!!echoObj && echoObj.echo_method === 'image') {
        console.log(chalk.yellowBright(msg)); // print base64 image
      }
    }
  }



}


module.exports = Echo;

/**
 * DEX8 library for sending messages, objekts and errors via websocket or to console.
 * Echo, websocket message format:
 * {
 *  user_id,
 *  robot_id,
 *  task_id,
 *  str: string,
 *  obj: {uri: string, body: any},
 *  err: {message: string, stack: string},
 *  time: string,
 *  room: string
 * }
 */

const chalk = require('chalk');
const moment = require('moment');
const inquirer = require('inquirer');



class Echo {

  constructor(room, socket, user_id, robot_id, task_id) {

    this.socket = socket;
    this.room = room || 'room_panelTaskdeploy';
    this.user_id = user_id;
    this.robot_id = robot_id;
    this.task_id = task_id;

    // short console log -> string message instead of whole object in __console_log() method
    this.short = false;

    // initialize message object
    this.msgObj = {
      user_id,
      robot_id,
      task_id,
      str: undefined,
      obj: undefined,
      err: undefined,
      img: undefined,
      inp: undefined,
      time: '',
      room
    };
  }


  /**
   * Change room for echo strings, objekts or errors.
   * For example: echo.changeRoom('room_apiRoutes).objekt({uri: '/deployments/modify/5e08907172cdfa212761907d', body: {action: stop}});
   * @param {String} room - new room
   */
  changeRoom(room) {
    this.room = room;
    return this;
  }


  /**
   * Method used in task functions as echo.log('My message');
   * Send comma separated strings to API via websocket and/or to linux console.
   * Use multiple parameters like in console.log --> echo.log('one', 'two')
   * @param {String} strings - strings separated by comma, for example echo.log('one', 'two')
   * @return {Promise<any>} - can be used in async function as "await echo.log()"
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
    this._format(str, null, null, '', '');
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as echo.objekt({uri: 'deployment/changeaction/5e0246a283cf516d4b788f43', {action: 'stop'}});
   * Send object to API via websocket and/or to linux console.
   * @param {Object} obj - object
   * @return {Promise<any>} - can be used in async function as "await echo.objekt()"
   */
  objekt(obj) {
    this._format('', obj, null, '', '');
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as echo.error(new Error('Some intentional error'));
   * Send error to API via websocket and/or to linux console.
   * @param {Error} err - some error, for example new Error('Scraper error')
   * @return {Promise<any>} - can be used in async function as "await echo.error()"
   */
  error(err) {
    this._format('', null, err, '', '');
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as echo.image('v1w4fnDx9N5fD4t2ft93Y/88IaZLbaPB8+3O1ef+/+jfXqzzf...');
   * Send image in the base64 format to API via websocket.
   * @param {String} img_b64 - image in the base64 (string) format
   * @return {Promise<any>} - can be used in async function as "await echo.image()"
   */
  image(img_b64) {
    this._format('', null, null, img_b64, '');
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as echo.input();
   * Send input which should be listened with the listen() method.
   * @param {String} inp - text in front of the input field (label)
   * @return {Promise<any>} - can be used in async function as "await echo.input(inp)"
   */
  input(inp) {
    this._format('', null, null, '', inp);
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Listen for the first message from the web panel or API
   * @return {Promise<any>} - can be used in async function as "const msg = await echo.listen()"
   */
  async listen() {
    if (!!this.socket) { // listen input from the Web Panel
      return new Promise((resolve, reject) => {
        this.socket.on('room_echoInputs', msg => {
          resolve(msg);
        });
        setTimeout(() => {
          reject(new Error('Echo input stopped to listen due to timeout of 1 minute.'));
        }, 60000);
      });
    } else { // listen input from the Linux Console
      const questions = [
        {type: 'input', name: 'inp', message: 'input:', default: ''}
      ];
      const answers =  await inquirer.prompt(questions);
      return answers.inp;
    }
  }




  /******** PRIVATE METHODS  *******/

  /**
   * Format object which is sent by websocket or to linux console.
   * @param {String} str - echoed string
   * @param {Object} obj - echoed object {uri, body}
   * @param {Error} err - echoed error {message, stack}
   * @param {String} img - echoed image in base64 format
   * @param {String} inp - echoed label, a text in front of the input field
   */
  _format(str, obj, err, img, inp) {
    if (!str) { str = undefined; }

    if (!obj) { obj = undefined;}

    if (!err) {
      err = undefined;
    } else {
      // convert error to object with two properties: message: string and stack: string
      err = {
        message: err.message,
        stack: err.stack
      };
    }

    if (!img) { img = undefined; }
    if (!inp) { inp = undefined; }

    const time = moment().toISOString();
    const room = this.room;

    this.msgObj = Object.assign(this.msgObj, {str, obj, err, img, inp, time, room}); // {user_id, robot_id, task_id, str, obj, err, img, inp, time, room}
  }


  /**
   * Log messages depending if socket exists or not.
   */
  _log() {
    if (!!this.socket) {
      this.__socket_log();
      this.__console_log();
    } else {
      this.__console_log();
    }
  }


  /**
   * Socket log. Send socket message.
   */
  __socket_log() {
    let msg;
    try {
      msg = JSON.stringify(this.msgObj); // convert object to string
    } catch (err) {
      console.log(err);
    }
    this.socket.emit(this.room, msg);
  }


  /**
   * Linux console log.
   */
  __console_log() {
    if (this.short) {
      /* SHORT PRINT */
      const time = moment(this.msgObj.time).format('DD.MMM.YYYY HH:mm:ss.SSS');
      if (!!this.msgObj && !!this.msgObj.str) {
        console.log(chalk.greenBright(`(${time})`, this.msgObj.str)); // print string
      } else if (!!this.msgObj && !!this.msgObj.obj) {
        console.log(chalk.blueBright(`(${time})`, JSON.stringify(this.msgObj.obj))); // print stringified object
      } else if (!!this.msgObj && !!this.msgObj.err) { // print error
        console.log(chalk.redBright(`(${time})`, JSON.stringify(this.msgObj.err.message)));
      } else if (!!this.msgObj && !!this.msgObj.img) { // print base64 image
        console.log(chalk.yellowBright(`(${time})`, JSON.stringify(this.msgObj.img)));
      } else if (!!this.msgObj && !!this.msgObj.inp) { // print input label message
        console.log(chalk.whiteBright(`(${time})`, JSON.stringify(this.msgObj.inp)));
      }
    } else {
      /* LONG PRINT */
      const msg = JSON.stringify(this.msgObj, null, 4);
      if (!!this.msgObj && !!this.msgObj.str) {
        console.log(chalk.greenBright(msg)); // print string
      } else if (!!this.msgObj && !!this.msgObj.obj) {
        console.log(chalk.blueBright(msg)); // print object
      } else if (!!this.msgObj && !!this.msgObj.err) {
        console.log(chalk.redBright(msg)); // print error
      } else if (!!this.msgObj && !!this.msgObj.img) {
        console.log(chalk.yellowBright(msg)); // print base64 image
      } else if (!!this.msgObj && !!this.msgObj.inp) {
        console.log(chalk.whiteBright(msg)); // print input label message
      }
    }
  }




}


module.exports = Echo;

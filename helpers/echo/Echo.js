/**
 * DEX8 library for sending messages, objekts and errors.
 * Socket message format:
 * {
 *  user_id,
 *  robot_id,
 *  task_id,
 *  msg: string,
 *  obj: {uri: string, body: any},
 *  err: {message: string, stack: string},
 *  time: Date
 * }
 */

const chalk = require('chalk');
const moment = require('moment');



class Echo {

  constructor(room = 'room_panelTaskdeploy', socket, user_id, robot_id, task_id) {

    this.socket = socket;
    this.room = room;
    this.user_id = user_id;
    this.robot_id = robot_id;
    this.task_id = task_id;

    // time when task is started
    const time_start = moment().toISOString();

    // short console log -> string message instead of whole object in __console_log() method
    this.short = false;

    // initialize message object
    this.msgObj = {
      user_id,
      robot_id,
      task_id,
      msg: undefined,
      obj: undefined,
      err: undefined,
      time: '',
      time_start
    };
  }


  /**
   * Change room for echo messages, objekts or errors.
   * For example: echo.changeRoom('room_apiRoutes).objekt({uri: '/deployments/modify/5e08907172cdfa212761907d', body: {action: stop}});
   * @param {String} room - new room
   */
  changeRoom(room) {
    this.room = room;
    return this;
  }



  /**
   * Method used in task functions as echo.send({msg: string, obj: any, err: Error, time: Date});
   * Send message object.
   * @param {Object} echoObj - {msg, obj, err}
   * @returns {Promise<any>} - can be used in async function as "await echo.send()"
   */
  send(echoObj) {
    const {msg, obj, err} = echoObj; // destructuring object
    this._format(msg, obj, err);
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as echo.msg('My message');
   * Send message (string) to web panel via socket.io and/or to linux console.
   * Use multiple parameters like in console.log --> echo.log('one', two')
   * @param {String} messages - strings separated by comma, for example echo.log('one', 'two')
   * @returns {Promise<any>} - can be used in async function as "await echo.log()"
   */
  log(...messages) { // ... is "rest parameters" operator
    // if message is object then convert it into string
    messages = messages.map(message => {
      if (typeof message === 'object') {
        try {
          message = JSON.stringify(message, null, 2);
        } catch (err) {
          console.log(err);
        }
      }
      return message;
    });

    const msg = messages.join(' '); // join with space  ::  echo.msg('a', 'b') ---> ['a', 'b'] ---> 'a b'
    this._format(msg, null, null);
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as echo.objekt({uri: 'deployment/changeaction/5e0246a283cf516d4b788f43', {action: 'stop'}});
   * Send objekt to API router via socket.io.
   * @param {Object} obj - objekt in format {uri, body}
   * @returns {Promise<any>} - can be used in async function as "await echo.objekt()"
   */
  objekt(obj) {
    this._format('', obj, null);
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as echo.error(new Error('Some intentional error'));
   * Send error to web panel via socket.io and/or to linux console.
   * @param {Error} err - some error, for example new Error('Scraper error')
   * @returns {Promise<any>} - can be used in async function as "await echo.error()"
   */
  error(err) {
    this._format('', null, err);
    this._log();
    return Promise.resolve(this.msgObj);
  }




  /******** PRIVATE METHODS  *******/

  /**
   * Format object which is sent by socket.io or to linux console.
   * @param {String} msg - echoed message
   * @param {Object} obj - echoed object {uri, body}
   * @param {Error} err - echoed error {message, stack}
   */
  _format(msg, obj, err) {
    if (!msg) { msg = ''; }

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

    const time = moment().toISOString();

    const room = this.room;

    this.msgObj = Object.assign(this.msgObj, {msg, obj, err, time, room});
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
      if (!!this.msgObj && !!this.msgObj.msg) {
        console.log(chalk.greenBright(`(${time})`, this.msgObj.msg)); // print msg
      } else if (!!this.msgObj && !!this.msgObj.obj) {
        console.log(chalk.blueBright(`(${time})`, JSON.stringify(this.msgObj.obj))); // print stringified object
      } else if (!!this.msgObj && !!this.msgObj.err) { // print error
        console.log(chalk.redBright(`(${time})`, JSON.stringify(this.msgObj.err.message)));
      }
    } else {
      /* LONG PRINT */
      const msg = JSON.stringify(this.msgObj, null, 4);
      if (!!this.msgObj && !!this.msgObj.msg) {
        console.log(chalk.greenBright(msg)); // print msg
      } else if (!!this.msgObj && !!this.msgObj.obj) {
        console.log(chalk.blueBright(msg)); // print object
      } else if (!!this.msgObj && !!this.msgObj.err) {
        console.log(chalk.redBright(msg)); // print error
      }
    }
  }




}


module.exports = Echo;

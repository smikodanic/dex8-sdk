/**
 * DEX8 library for logging actions, messages and errors.
 * Format of socket message object:
 * {
 *  user_id,
 *  robot_id,
 *  task_id,
 *  echo: {
 *    action: string,
 *    msg: string,
 *    err: Error,
 *    misc: any,
 *    time: Date
 *   }
 * }
 */

const chalk = require('chalk');
const SocketioLib = require('./SocketioLib');
const moment = require('moment');



class TaskEcho extends SocketioLib {

  constructor(socket, sockEvent = 'dex8-panel', user_id = null, robot_id = null, task_id = null) {
    super(socket, sockEvent);

    this.user_id = user_id;
    this.robot_id = robot_id;
    this.task_id = task_id;

    // initialize message object
    this.msgObj = {
      user_id,
      task_id,
      robot_id,
      echo: null // {action, msg, err, misc}
    };
  }


  /**
   * Method used in task functions as libs.logAction({action: string, msg: string, err: any, misc: any});
   * Send message object.
   * @param {Object} msgObj - {action, msg, err, misc}
   * @returns {Promise<any>} - can be used in async function as "await echo()"
   */
  echo(msgObj) {
    const {action, msg, err, misc} = msgObj; // destructuring object
    this._format_msgObj(action, msg, err, misc);
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as libs.logAct('start');
   * Send action (start, stop, pause, error) to web panel via socket.io.
   * @returns {Promise<any>} - can be used in async function as "await echoAct()"
   */
  echoAct(action) {
    this._format_msgObj(action, '', null, null);
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as lib.echoMsg('My message');
   * Send message (string) to web panel via socket.io and/or to linux console.
   * Use multiple parameters like in console.log --> libs.log('one', two')
   * @returns {Promise<any>} - can be used in async function as "await echoMsg()"
   */
  echoMsg(...messages) { // ... is "rest parameters" operator
    const msg = messages.join(' '); // join with space  --  libs.log('a', 'b') ---> ['a', 'b'] ---> 'a b'
    this._format_msgObj('', msg, null, null);
    this._log();
    return Promise.resolve(this.msgObj);
  }


  /**
   * Method used in task functions as libs.logErr(new Error('Some intentional error'));
   * Send error to web panel via socket.io and/or to linux console.
   * @returns {Promise<any>} - can be used in async function as "await echoErr()"
   */
  echoErr(err) {
    this._format_msgObj('', '', err, null);
    this._log();
    return Promise.resolve(this.msgObj);
  }




  /******** PRIVATE METHODS  *******/

  /**
   * Format object which is sent by socket.io or to linux console.
   * @param {String} action - echoed action: start, stop, pause, error
   * @param {String} msg - echoed message
   * @param {Error} err - echoed error {message, stack}
   * @param {Object} misc - echoed error
   */
  _format_msgObj(action, msg, err, misc) {
    // console.log('action:: ', action);
    // console.log('msg:: ', msg);
    // console.log('err:: ', err);
    // console.log('misc:: ', misc);
    if (!action) { action = 'running';}

    if (!msg) { msg = ''; }

    if (!err) {
      err = null;
    } else {
      err = {
        message: err.message,
        stack: err.stack
      };
      action = 'error';
    }

    if (!misc) { misc = null; }

    const time = moment().toISOString();

    const echo = {action, msg, err, misc, time};
    this.msgObj = Object.assign(this.msgObj, {echo});
  }


  /**
   * Socket log. Send socket message.
   */
  _socket_log() {
    this.sendObject(this.msgObj);
  }


  /**
   * Linux console log.
   */
  _console_log() {
    const msg = '\n\n' + JSON.stringify(this.msgObj, null, 4);
    console.log(chalk.cyan(msg));
  }


  /**
   * Linux console error.
   */
  _console_error() {
    const msg = '\n\n' + JSON.stringify(this.msgObj, null, 4);
    console.log(chalk.cyanBright(msg));
  }

  /**
   * Log messages depending if socket exists or not.
   */
  _log() {
    if (this.socket) {
      this._socket_log();
      (this.msgObj.echo && this.msgObj.echo.err) ? this._console_error() : this._console_log();
    } else {
      (this.msgObj.echo && this.msgObj.echo.err) ? this._console_error() : this._console_log();
    }
  }

}


module.exports = TaskEcho;

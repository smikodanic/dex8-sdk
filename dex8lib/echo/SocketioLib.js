/**
 * Connect dex8 robot to socket server (dex8-panel).
 * Store socket object to global.dex8.socket
 */
const chalk = require('chalk');
const io = require('socket.io-client');



class SocketioLib {

  constructor(socket, sockEvent) {
    this.socket = socket;
    this.sockEvent = sockEvent || 'dex8-panel'; // 'dex8-panel' by default
  }


  /**
   *
   * @param {String} serverUrl - http://localhost:8000 or https://api.dex8.com  - socket server URL
   * @param {Number} clientPort - 8300 - robot's port
   * @param {String} clientType - 'DEX8 Robot' - robots name to distinguish from 'DEX8 Panel'
   */
  static connect(serverUrl, clientPort, clientType) {

    /*** connect to Socket Server. Use query.port to check if robot is valid. See 'dex8-panel' repo file: server/index.js ***/
    this.socket = io.connect(serverUrl, {query: {clientPort, clientType}});

    // set global variable
    global.dex8.socket = this.socket;


    /*** socket.io events ***/
    this.socket.on('connect', () => {
      console.log(chalk.magenta('Robot socket client ID', this.socket.id, 'connected to Socket Server ', serverUrl));
    });

    this.socket.on('connect_error', () => {
      console.log(chalk.magenta('ERROR: Robot socket client ID', this.socket.id, 'not connected to Socket Server ', serverUrl));
    });

    this.socket.on('disconnect', () => {
      console.log(chalk.magenta('Robot socket client ID', this.socket.id, 'disconnected from Socket Server ', serverUrl));
    });

    // this.socket.on('dex8-panel', (msg) => {
    //   console.log(chalk.cyan('Robot socket client ID', this.socket.id, 'received message:', msg));
    // });
  }



  /**
   * Convert object to message and send it to socket.io server.
   */
  sendObject(msgObj) {
    try {
      const msgStr = JSON.stringify(msgObj); // convert object to string
      // console.log(chalk.cyan('socket:' + this.socket.id + ' event:' + this.sockEvent + ' msg:' + msgStr));
      this.socket.emit(this.sockEvent, msgStr);
    } catch (err) {
      // const error = new Error('Socket message is not valid object.');
      console.log(chalk.red(err.stack));
    }
  }

  /**
   * Send string message to socket.io server.
   */
  sendString(msg) {
    this.socket.emit(this.sockEvent, msg);
  }


  /**
   * Disconnect from socket.io server.
   */
  disconnect() {
    this.socket.disconnect();
  }



}



module.exports = SocketioLib;

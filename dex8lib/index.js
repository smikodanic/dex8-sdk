/**
 * DEX8 libraries used in DEX8 tasks.
 * In JS files use it as
 * const dex8lib = require('dex8lib');
 */
const FunctionFlow = require('./functionflow/FunctionFlow');
const TaskEcho = require('./echo/TaskEcho');
const Mongo = require('./mongo/Mongo');
const Randomize = require('./randomize/Randomize');


module.exports = {FunctionFlow, TaskEcho, Mongo, Randomize};


/*
IMPORTANT!!!
Do not forget install dex8lib when files in /dex8lib folder are modified.
========================
$ npm install dex8lib
========================
*/

/**
 * Upload DEX8 task from command line.
 * ========================================
 * $ node upload <task_category>/<task_name>
 * ========================================
 * For example: $ node upload demo/001input
 */
const chalk = require('chalk');
const upload = require('./uploadFunc.js');

upload()
  .then(httpResp => {
    // console.log('\n\nhttpResp::', httpResp);
    if (!httpResp) {
      console.log(chalk.red('Task is not uploaded.\n'));
    } else if (httpResp && httpResp.meta.statusCode !== 200) {
      console.log(chalk.red(httpResp.data.message));
    } else {
      console.log(chalk.yellow(`Task "${httpResp.data.task.title}" is uploaded.\n`));
    }
  });


module.exports = upload;

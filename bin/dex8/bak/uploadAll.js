/**
 * Upload DEX8 tasks from certain category (folder).
 * ========================================
 * $ node uploadall <task_category>
 * ========================================
 * For example: $ node uploadall demo
 */
const fse = require('fs-extra');
const chalk = require('chalk');
const uploadFunc = require('./uploadFunc.js');
const path = require('path');
const task_category = process.argv[2]; // demo


const uploadall = async () => {

  ///// 1) get task_names e.g. folder names under certain category folder
  const task_names = await fse.readdir(task_category);
  // console.log('task_names:: ', task_names);



  ///// 2) uploading tasks one by one
  let i = 1;
  for (const task_name of task_names) {
    const taskFolderParam = path.join(task_category, task_name);
    console.log(`\n============== ${i}. Uploading task "${taskFolderParam}" ... ==============`);

    const httpResp = await uploadFunc(taskFolderParam);
    if (!httpResp) {
      console.log(chalk.red('Task is not uploaded.\n'));
    } else if (httpResp && httpResp.meta.statusCode !== 200) {
      console.log(chalk.red(httpResp.data.message));
    } else {
      console.log(chalk.yellow(`Task "${httpResp.data.task.title}" is uploaded.\n`));
    }

    i++;
  }



};


uploadall();

/**
 * Upload DEX8 task from command line.
 * $ dex8 upload                    -> if we are in the task folder
 * $ dex8 upload -t <taskName>      -> if we are above task folder
 */
const fse = require('fs-extra');
const path = require('path');
const uploadOneTask = require('./uploadOneTask');


module.exports = async (optionsObj) => {

  // option values
  const taskName = optionsObj.task; // string | undefined
  const all = optionsObj.all; // boolean | undefined

  if (!all) {
    uploadOneTask(taskName);
  } else {

    ///// 1) get task_names e.g. folder names
    const folders = await fse.readdir('./');
    // console.log('folders:: ', folders);



    ///// 2) uploading tasks one by one
    let i = 1;
    for (const taskName of folders) {
      console.log(`\n============== ${i}. Uploading task "${taskName}" ... ==============`);

      try {
        await uploadOneTask(taskName);
      } catch(err) {
        console.log(err);
      }

      i++;
    }

  }




};

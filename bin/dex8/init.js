const path = require('path');
const fse = require('fs-extra');


module.exports = async (taskName) => {

  try {
    // copy task_template folder taskName folder
    await fse.ensureDir(taskName);
    const sourceDir = path.join(__dirname, './task_template');
    const destDir = path.join(process.cwd(), taskName);
    await fse.copy(sourceDir, destDir);
    console.log(`Copied from ${sourceDir} to ${destDir}`);

    // rename gitignore (npm does not publish task_template/.gitignore so task_template/gitignore is used)
    const gitignore_old = path.join(destDir, 'gitignore');
    const gitignore_new = path.join(destDir, '.gitignore');
    await fse.rename(gitignore_old, gitignore_new);

    const tf = await fse.pathExists(destDir);
    if (tf) {
      console.log(`Task "${taskName}" initialized and folder is created. Now move to that folder "$ cd ${taskName}" and run "$ npm run inst" !`);
    }


  } catch (err) {
    throw err;
  }

};

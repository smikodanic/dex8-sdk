const path = require('path');
const fse = require('fs-extra');
const inquirer = require('inquirer');


module.exports = async (taskName) => {

  const questions = [
    { type: 'confirm', name: 'tf', message: 'Are you sure to delete whole DEX8 task ?', default: false }
  ];

  try {
    const answers =  await inquirer.prompt(questions); // true/false

    // define director to be removed
    let dir = path.join(process.cwd(), taskName);
    const tf1 = await fse.pathExists(dir);

    if (!tf1) { dir = path.join(process.cwd(), `../${taskName}`); }


    if (answers.tf) {
      await fse.remove(dir); // delete taskName recursively
      console.log(`Task "${taskName}" is deleted in dir ${dir}.`);
    } else {
      console.log(`Task "${taskName} is not deleted in dir ${dir}.`);
      process.exit();
    }

  } catch (err) {
    throw err;
  }

};

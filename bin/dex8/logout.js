const fse = require('fs-extra');

module.exports = async () => {

  try {
    await fse.remove('./conf.js');
  } catch (err) {
    throw err;
  }

};

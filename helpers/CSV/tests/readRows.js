const {CSV} = require('../../../index.js');

const fja = async () => {

  const csvOpts = {
    filePath: './csvInput.csv',

    encoding: 'utf8',
    flag: 'a+',

    fields: ['url', 'name', 'size'], // only these fields will be effective
    fieldDelimiter: ',',
    rowDelimiter: '\n'
  };
  const csv = new CSV(csvOpts);


  const rows = await csv.readRows();
  console.log(rows);
  console.log(JSON.stringify(rows, null, 4));
};

fja();

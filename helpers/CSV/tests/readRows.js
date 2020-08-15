const {CSV} = require('../../../index.js');

const fja = async () => {

  const csvOpts = {
    filePath: './appended.csv',
    encoding: 'utf8',
    mode: 0o644,

    fields: ['url', 'name', 'size'], // only these fields will be effective
    fieldDelimiter: ',',
    rowDelimiter: '\n'
  };
  const csv = new CSV(csvOpts);


  const rows = await csv.readRows();
  console.log('rows in total:: ', rows.length);
  console.log(JSON.stringify(rows, null, 4));
};

fja();

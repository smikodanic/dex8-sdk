const CSV = require('../CSV.js');

const fja = async () => {

  const csvOpts = {
    filePath: './csvInput.csv',
    removeExisting: true,

    encoding: 'utf8',
    mode: '0644',
    flag: 'a+',

    fields: ['url', 'name', 'size'], // only these fields will be effective
    fieldDelimiter: ',',
    rowDelimiter: '\n'
  };
  const csv = new CSV(csvOpts);

  await csv.prepareFile();

  const rows = [
    {url: 'www.site1.com', name: 'Peter', old: 55, size: 'M'},
    {url1: 'www.site1.com', name: 'Peter', old: 55},
    {url: 'www.site2.com', name2: 'John'},
    {url: {web: 'test1.net'}, name: 'Ana'},
    {url: ['test2.net'], name: 'Ivan'},
    {url: [{web: 'test3.net'}], name: 'Sonja'},
  ];
  const rows_str = await csv.writeRows(rows);
  console.log(rows_str);
};

fja();

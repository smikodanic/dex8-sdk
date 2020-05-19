const RobotsTxt = require('../RobotsTxt');


const robotsTxt = new RobotsTxt('http://www.ugla.com?id=45');

const base_url = robotsTxt.base_url;
console.log('base_url:: ', base_url);


const fja = async () => {
  const robotsTxtFile = await robotsTxt.fetch();
  console.log(robotsTxtFile);
};

fja();


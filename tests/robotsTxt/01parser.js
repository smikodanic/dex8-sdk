const RobotsTxt = require('../../helpers/robotsTxt/RobotsTxt');

const robotsTxt = new RobotsTxt('https://www.google.com/a?id=3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36');

const base_url = robotsTxt.base_url;
console.log('base_url:: ', base_url);


const fja = async () => {
  const robotsTxtObj = await robotsTxt.parser();
  console.log(robotsTxtObj);
};

fja();


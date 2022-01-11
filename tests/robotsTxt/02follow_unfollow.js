const RobotsTxt = require('../../helpers/robotsTxt/RobotsTxt');

const baseURL = 'https://www.njuskalo.hr';
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';
const botName = 'MediaPartners-Google';


const robotsTxt = new RobotsTxt(baseURL, userAgent, botName);

const base_url = robotsTxt.base_url;
console.log('base_url:: ', base_url);


const fja = async () => {
  await robotsTxt.parser();
  const follow_urls = robotsTxt.whatToFollow();
  const unfollow_urls = robotsTxt.whatToUnfollow();
  console.log('\nfollow_urls:: ', follow_urls);
  console.log('\nunfollow_urls:: ', unfollow_urls);
};

fja();



/*
baseURL: 'https://www.google.com'
botName: 'AdsBot-Google'

baseURL: 'https://www.njuskalo.hr'
botName: 'MediaPartners-Google'

*/

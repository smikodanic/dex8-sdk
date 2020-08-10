/**
 * Determines with which API dex8-sdk will communicate
 */
const environment = process.env.NODE_ENV || 'production';


const developmentConfig = {
  apiBaseURL: 'http://localhost:8001'
};

const stageConfig = {
  apiBaseURL: 'http://api-stage.dex8.com'
};

const productionConfig = {
  apiBaseURL: 'https://api.dex8.com'
};


let config;
switch (environment) {
case 'development': config = developmentConfig; break;
case 'stage': config = stageConfig; break;
case 'production': config = productionConfig; break;
default: config = productionConfig; break;
}

module.exports = config;

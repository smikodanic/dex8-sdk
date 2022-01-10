const chalk = require('chalk');
const cheerio = require('cheerio');
const fse = require('fs-extra');
const lodash = require('lodash');
const moment = require('moment');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');

const Cookie = require('./helpers/cookie/Cookie');
const CookiePptr = require('./helpers/cookie/CookiePptr');
const CSV = require('./helpers/CSV/CSV');
const Echo = require('./helpers/echo/Echo');
const FunctionFlow = require('./helpers/functionflow/FunctionFlow_v2.2');
const HttpClient = require('./helpers/httpClient/HttpClient');
const Mongo = require('./helpers/mongo/Mongo');
const pptr = require('./helpers/pptr/pptr');
const Rand = require('./helpers/rand/Rand');
const RobotsTxt = require('./helpers/robotsTxt/RobotsTxt');
const StringExt = require('./helpers/stringExt/StringExt');


const dex8sdk = {
  chalk, cheerio, fse, lodash, moment, puppeteer, mongoose,
  Cookie, CookiePptr, CSV, Echo, FunctionFlow, HttpClient, Mongo, pptr, Rand, RobotsTxt, StringExt // dex8-sdk helpers
};


module.exports = dex8sdk;

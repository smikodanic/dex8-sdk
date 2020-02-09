/**
 * Simple for usage but powerful HTTP client.
 */
const http = require('http');
const https = require('https');
const URL = require('url').URL;
const zlib = require('zlib');
const pkg_json = require('../../package.json');


class HttpClient {

  /**
   * @param {Object} opts - HTTP Client options {timeout, retry, maxRedirects, headers, encodeURI}
   */
  constructor(opts) {
    this.url;
    this.protocol = 'http:';
    this.hostname = '';
    this.port = 80;
    this.pathname = '/';

    if (!opts) {
      this.opts = {
        encodeURI: false,
        timeout: 8000,
        retry: 3,
        retryDelay: 5500,
        maxRedirects: 3,
        headers: {
          'authorization': '',
          'user-agent': `DEX8-SDK/${pkg_json.version} https://dex8.com`, // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
          'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
          'cache-control': 'no-cache',
          'host': '',
          'accept-encoding': 'gzip',
          'connection': 'close', // keep-alive
          'content-type': 'text/html; charset=UTF-8'
        }
      };
    } else {
      this.opts = opts;
    }

    // default headers
    this.headers = this.opts.headers;

    // count retries
    this.retryCounter = 0;
  }



  /********** PRIVATES *********/

  /**
   * Parse url.
   * @param {String} url - http://www.adsuu.com/some/thing.php?x=2&y=3
   */
  _parseUrl(url) {
    url = this._correctUrl(url);
    const urlObj  = new URL(url);
    this.url = url;
    this.protocol = urlObj.protocol;
    this.hostname = urlObj.hostname;
    this.port = urlObj.port;
    this.pathname = urlObj.pathname;
    return url;
  }


  /**
   * Make some URL corrections
   */
  _correctUrl(url) {
    if (!url) {throw new Error('URL is not defined'); }

    // 1. trim from left and right
    url = url.trim();

    // 2. add protocol
    if (!/^https?:\/\//.test(url)) {
      url = 'http://' + url;
    }

    // 3. remove empty spaces
    if (this.opts.encodeURI) {
      url = encodeURI(url);
    } else {
      url = url.replace(/\s+/g, ' ');
      url = url.replace(/ /g, '%20');
    }

    return url;
  }


  /**
   * Choose http or https NodeJS libraries.
   */
  _selectRequest() {
    let requestLib;
    if (/^https/.test(this.protocol)) {
      requestLib = https.request.bind(https);
    } else {
      requestLib = http.request.bind(http);
    }
    return requestLib;
  }


  /**
   * Create new http/https agent https://nodejs.org/api/http.html#http_new_agent_options
   * @param {Object} opts
   */
  _hireAgent(opts) {
    // default agent options https://nodejs.org/api/http.html#http_new_agent_options
    const options = {
      timeout: opts.timeout, // close socket on certain period of time
      keepAlive: false, // keep socket open so it can be used for future requests without having to reestablish new TCP connection (false)
      keepAliveMsecs: 1000, // initial delay to receive packets when keepAlive:true (1000)
      maxSockets: Infinity, // max allowed sockets (Infinity)
      maxFreeSockets: 256, // max allowed sockets to leave open in a free state when keepAlive:true (256)
    };

    let agent;
    if (/^https/.test(this.protocol)) {
      agent = new https.Agent(options);
    } else {
      agent = new http.Agent(options);
    }

    return agent;
  }

  /**
   * Kill the agent when it finish its job.
   */
  _killAgent(agent) {
    agent.destroy();
  }


  /**
   * Beautify error messages.
   * @param {Error} error - original error
   * @return formatted error
   */
  _formatError(error, url) {
    // console.log(error);
    const err = new Error(error);


    // reformatting NodeJS errors
    if (error.code === 'ENOTFOUND') {
      err.status = 400;
      err.message = `400 Bad Request [ENOTFOUND] ${url}`;
    } else if (error.code === 'ECONNREFUSED') {
      err.status = 400;
      err.message = `400 Bad Request [ECONNREFUSED] ${url}`;
    } else if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      err.status = 400;
      err.message = `400 Bad Request [ERR_TLS_CERT_ALTNAME_INVALID] ${error.reason}`;
    } else if (error.status === 404) {
      err.status = 404;
      err.message = `404 Not Found ${url}`;
    } else {
      err.status = error.status || 400;
      err.message = error.message;
    }

    err.original = error;

    return err; // formatted error is returned
  }




  /********** REQUESTS *********/

  /**
   * Sending one HTTP request to HTTP server.
   *  - 301 redirections are not handled.
   *  - retries are not handled
   * @param {String} url - https://www.dex8.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Objcet} body_obj - http body
   */
  askOnce(url, method = 'GET', body_obj) {
    url = this._parseUrl(url);
    const agent = this._hireAgent(this.opts);
    const requestLib = this._selectRequest();

    try {

      /*** 1) init HTTP request ***/
      // http.request() options https://nodejs.org/api/http.html#http_http_request_url_options_callback
      const requestOpts = {
        agent,
        hostname: this.hostname,
        port: this.port,
        path: this.pathname,
        method,
        headers: this.headers
      };
      const clientRequest = requestLib(requestOpts);


      /*** 2) add body to HTTP request ***/
      let body_str;
      if (!!body_obj) {
        body_str = JSON.stringify(body_obj);
        this.headers['content-length'] = body_str.length;
        clientRequest.write(body_str);
      }

      clientRequest.setTimeout(this.opts.timeout);
      clientRequest.on('timeout', res => {
        clientRequest.abort();
        throw new Error(`Request aborted due to timeout (${this.opts.timeout} ms).`);
      });




      const promise = new Promise ((resolve, reject) => {

        /*** 3) response ***/
        clientRequest.on('response', res => {

          // collect raw data e.g. buffer data
          const buf_chunks = [];
          res.on('data', (buf_chunk) => {
            buf_chunks.push(buf_chunk);
          });


          res.on('end', () => {
            // concat buffer parts
            const buf = Buffer.concat(buf_chunks);

            // decompress
            let gzip = false;
            let gunziped = buf;
            if (!!res.headers['content-encoding'] && res.headers['content-encoding'] === 'gzip') {
              gunziped = zlib.gunzipSync(buf);
              gzip = true;
            }

            // convert binary (buffer) to string
            let content = gunziped.toString();

            // convert string to object if content is in JSON format
            let contentObj;
            try {
              contentObj = JSON.parse(content);
              if (!!contentObj) {
                content = contentObj;
              }
            } catch(err) {}



            // format answer
            const answer = {
              requestURL: url,
              requestMethod: method,
              status: res.statusCode,
              // remoteAddress: // TODO
              // referrerPolicy: // TODO
              statusMessage: res.statusMessage,
              httpVersion: res.httpVersion,
              gzip,
              https: /^https/.test(this.protocol),
              req: {
                headers: this.headers,
                payload: body_obj
              },
              res: {
                headers: res.headers,
                content
              }
            };


            if (!!answer && /^4\d{2}/.test(answer.status)) {
              const errmsg = answer.res.content.message || 'Status code 4xx (client error)';
              const error = new Error(errmsg);
              error.status = answer.status;
              const err = this._formatError(error, url);
              reject(err);
            } else if (!!answer && /^5\d{2}/.test(answer.status)) {
              const errmsg = answer.res.content.message || 'Status code 4xx (server error)';
              const error = new Error(errmsg);
              error.status = answer.status;
              const err = this._formatError(error, url);
              reject(err);
            } else {
              resolve(answer); // good answer will have 2xx status
            }


            this._killAgent(agent);

          });

        });


        /*** 4) handle error ***/
        clientRequest.on('error', error => {
          this._killAgent(agent);
          const err = this._formatError(error, url);
          reject(err);
        });

      });

      /*** 5) finish with sending request */
      clientRequest.end();

      return promise;

    } catch (err) {
      throw err;
    }

  } // \request



  /**
   * Sending HTTP request to HTTP server.
   *  - 301 redirections are handled.
   *  - retries are handled
   * @param {String} url - https://www.dex8.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Objcet} body_obj - http body
   */
  async ask(url, method = 'GET', body_obj) {
    try {

      let answer = await this.askOnce(url, method, body_obj);
      const answers = [answer];

      let redirectCounter = 1;


      /*** a) HANDLE 3XXX REDIRECTS */
      while (!!answer && /^3\d{2}/.test(answer.status) && redirectCounter <= this.opts.maxRedirects) { // 300, 301, 302, ...

        // repeat request with new url
        const url_new = answer.res.headers.location;
        console.log(`#${redirectCounter} redirection ${answer.status} from ${this.url} to ${url_new}`);
        answer = await this.askOnce(url_new, method, body_obj);

        answers.push(answer);

        redirectCounter++;
      }

      return answers;


    } catch (err) {

      /*** b) HANDLE RETRIES */
      this.retryCounter++;

      if (this.retryCounter <= this.opts.retry) {
        console.log(`#${this.retryCounter} retry on ${this.url}`);
        await new Promise(resolve => setTimeout(resolve, this.opts.retryDelay)); // delay before retrial
        await this.ask(url, method = 'GET', body_obj);
      } else {
        throw err;
      }

    }


  }



  /**
   *
   * @param {String} url - https://api.dex8.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Object|String} body - http body as Object or String type
   */
  async askJSON(url, method = 'GET', body) {

    // convert body string to object
    let body_obj = body;
    if (typeof body === 'string') {
      try {
        body_obj = JSON.parse(body);
      } catch (err) {
        throw new Error('Body string is not valid JSON.');
      }
    }


    try {
      this.setHeaders({
        'content-type': 'application/json; charset=utf-8',
        'accept': 'application/json'
      });

      const answer = await this.askOnce(url, method, body_obj);

      // convert content string to object
      if (!!answer.content) {
        try {
          answer.content = JSON.parse(answer.content);
        } catch (err) {
          throw new Error('Response content is not valid JSON.');
        }
      }

      return answer;

    } catch (err) {
      throw (err);
    }
  }




  /********** HEADERS *********/

  /**
   * Change header object.
   * Previously defined this.headers properties will be overwritten.
   * @param {Object} headerObj - {'authorization', 'user-agent', accept, 'cache-control', 'host', 'accept-encoding', 'connection'}
   */
  setHeaders(headerObj) {
    this.headers = Object.assign(this.headers, headerObj);
  }

  /**
   * Set (add/update) header.
   * Previously defined header will be overwritten.
   * @param {String} headerName - 'content-type'
   * @param {String} headerValue - 'text/html; charset=UTF-8'
   */
  setHeader(headerName, headerValue) {
    const headerObj = {[headerName]: headerValue};
    this.headers = Object.assign(this.headers, headerObj);
  }

  /**
   * Change header object.
   * @param {Array} headerNames - array of header names    ['content-type', 'accept']
   */
  delHeaders(headerNames) {
    headerNames.forEach(headerName => {
      delete this.headers[headerName];
    });
  }


  /**
   * Get active headers
   */
  getHeaders() {
    return this.headers;
  }











}



module.exports = HttpClient;

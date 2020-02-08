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


  /**
   * Parse url.
   * @param {String} url - http://www.adsuu.com/some/thing.php?x=2&y=3
   */
  _parseUrl(url) {
    url = this._correctUrl(url);
    const urlObj  = new URL(url);
    this.protocol = urlObj.protocol;
    this.hostname = urlObj.hostname;
    this.port = urlObj.port;
    this.pathname = urlObj.pathname;
    return urlObj;
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
   * @param {Error} error
   */
  _formatError(error, url) {
    const err = new Error(error);

    if (error.code === 'ENOTFOUND') {
      err.status = 400;
      err.message = `400 Bad Request ${url}`;
    }

    return err;
  }



  /**
   * Change header object.
   * this.headers properties will be overwritten.
   * @param {Object} headerObj - {'authorization', 'user-agent', accept, 'cache-control', 'host', 'accept-encoding', 'connection'}
   */
  headers(headerObj) {
    this.headers = Object.assign(this.headers, headerObj);
  }


  /**
   * Sending one HTTP request to HTTP server.
   *  - 301 redirections are not handled.
   *  - retries are not handled
   * @param {String} url - https://www.dex8.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Objcet} body_obj - http body
   */
  askOnce(url, method = 'GET', body_obj) {
    this._parseUrl(url);
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

          // meta
          const meta = {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            httpVersion: res.httpVersion,
            headers: res.headers,
            gzip: false,
            https: /^https/.test(this.protocol)
          };

          // collect raw data e.g. buffer data
          const buf_chunks = [];
          res.on('data', (buf_chunk) => {
            buf_chunks.push(buf_chunk);
          });


          res.on('end', () => {
            // concat buffer parts
            const buf = Buffer.concat(buf_chunks);

            // decompress
            let gunziped = buf;
            if (!!res.headers['content-encoding'] && res.headers['content-encoding'] === 'gzip') {
              gunziped = zlib.gunzipSync(buf);
              meta.gzip = true;
            }

            // convert binary (buffer) to string
            const content = gunziped.toString();

            const answer = {meta, content};
            resolve(answer);

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

      const answer = await this.askOnce(url, method, body_obj);

      let redirectCounter = 0;
      const answers = [answer];

      /*** a) HANDLE 3XXX REDIRECTS */
      if (!!answer && !!answer.meta && /^3\d{2}/.test(answer.meta.statusCode)) { // 300, 301, 302, ...

        if (redirectCounter <= this.opts.maxRedirects) {
          redirectCounter++;

          // repeat request with new url
          const url_new = answer.meta.headers.location;
          console.log(`#${redirectCounter} redirection ${answer.meta.statusCode} from ${url} to ${url_new}`);

          const ans = await this.askOnce(url_new, method, body_obj);
          answers.push(ans);
        }

      }

      return answers;



    } catch (err) {

      /*** b) HANDLE RETRIES */
      this.retryCounter++;

      if (this.retryCounter <= this.opts.retry) {
        console.log(`#${this.retryCounter} retry on ${url}`);
        await new Promise(resolve => setTimeout(resolve, this.opts.retryDelay)); // delay before retrial
        await this.ask(url, method = 'GET', body_obj);
      } else {
        throw err;
      }

    }


  }









}



module.exports = HttpClient;

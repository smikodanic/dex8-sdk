/**
 * $ node 05setHeaders.js
 */

const HttpClient = require('../HttpClient');
const httpClient = new HttpClient();

// default headers
console.log('headers_before:: ', httpClient.getHeaders());

httpClient.setHeaders({
  'content-type': 'application/json',
  'accept': 'application/json'
});

// headers after change
console.log('headers_after:: ', httpClient.getHeaders());

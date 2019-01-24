define('telemetry', function () { 'use strict';

function request(options, callback) {
  var req = new XMLHttpRequest(); //eslint-disable-line
  req.addEventListener('load', function () {
    callback(req.responseText);
  });

  req.open(options.method, options.url);

  Object.keys(options.headers).forEach(function (header) {
    req.setRequestHeader(header, options.headers[header]);
  });

  req.send(options.body);
}

var Storage = {
  storage: {},
  memory: true,
  get: function get(key) {
    var stored = void 0;
    try {
      stored = window.localStorage && window.localStorage.getItem(key) || this.storage[key];
    } catch (e) {
      stored = this.storage[key];
    }
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return undefined;
      }
    } else {
      return undefined;
    }
  },
  set: function set(key, value) {
    // handle Safari private mode (setItem is not allowed)
    value = JSON.stringify(value);
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      if (!this.memory) {
        console.error('setting local storage failed, falling back to in-memory storage');
        this.memory = true;
      }
      this.storage[key] = value;
    }
  },
  delete: function _delete(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      if (!this.memory) {
        console.error('setting local storage failed, falling back to in-memory storage');
        this.memory = true;
      }
      delete this.storage[key];
    }
  }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var COGNITO_KEY = 'TELEMETRY_COGNITO_CREDENTIALS';
var COGNITO_URL = 'https://cognito-identity.us-east-1.amazonaws.com/';

function getCredentials(IdentityPoolId, callback) {
  var cached = Storage.get(COGNITO_KEY);
  if (cached && Date.now() / 1000 < cached.Expiration) return callback(cached);

  authWithCognito(IdentityPoolId, function (credentials) {
    Storage.set(COGNITO_KEY, credentials);
    callback(credentials);
  });
}

function authWithCognito(IdentityPoolId, callback) {
  var options = _extends({}, defaults$$1);
  options.headers['X-Amz-Target'] = 'AWSCognitoIdentityService.GetId';
  options.body = JSON.stringify({ IdentityPoolId: IdentityPoolId });

  request(options, function (response) {
    requestCredentials(JSON.parse(response), callback);
  });
}

function requestCredentials(json, callback) {
  var options = _extends({}, defaults$$1);
  options.headers['X-Amz-Target'] = 'AWSCognitoIdentityService.GetCredentialsForIdentity';
  options.body = JSON.stringify({ IdentityId: json.IdentityId });

  request(options, function (response) {
    var json = JSON.parse(response);
    callback(json.Credentials);
  });
}

var defaults$$1 = {
  method: 'POST',
  url: COGNITO_URL,
  headers: {
    'Content-type': 'application/x-amz-json-1.1'
  }
};

var SESSION_LENGTH = 30 * 60 * 1000;
var SESSION_KEY = 'TELEMETRY_SESSION';
var CLIENT_KEY = 'TELEMETRY_CLIENT_ID';

function getUser() {
  return {
    session: getSession(),
    id: getClientID()
  };
}

function getSession() {
  var newSession = void 0;
  var session = Storage.get(SESSION_KEY);
  if (!session || Date.now() > session.expiration) {
    newSession = true;
    session = generateNewSession();
  }
  session.expiration = Date.now() + SESSION_LENGTH;
  Storage.set(SESSION_KEY, session);
  if (newSession) session.new = true;
  return session;
}

function getClientID() {
  var id = Storage.get(CLIENT_KEY);
  if (!id) {
    id = generateNewClientID();
    Storage.set(CLIENT_KEY, id);
  }
  return id;
}

function generateNewSession() {
  return {
    id: Math.floor((1 + Math.random()) * 0x100000000000).toString(16),
    startTimestamp: new Date().toISOString()
  };
}

/*

Copyright 2016 Amazon.com, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
function generateNewClientID() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

/*
(c) 2009-2013 by Jeff Mott. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions, and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions, and the following disclaimer in the documentation or other materials provided with the distribution.
Neither the name CryptoJS nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS," AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
var CryptoJS = function (h, s) {
  var f = {},
      g = f.lib = {},
      q = function q() {},
      m = g.Base = { extend: function extend(a) {
      q.prototype = this;var c = new q();a && c.mixIn(a);c.hasOwnProperty('init') || (c.init = function () {
        c.$super.init.apply(this, arguments);
      });c.init.prototype = c;c.$super = this;return c;
    }, create: function create() {
      var a = this.extend();a.init.apply(a, arguments);return a;
    }, init: function init() {}, mixIn: function mixIn(a) {
      for (var c in a) {
        a.hasOwnProperty(c) && (this[c] = a[c]);
      }a.hasOwnProperty('toString') && (this.toString = a.toString);
    }, clone: function clone() {
      return this.init.prototype.extend(this);
    } },
      r = g.WordArray = m.extend({ init: function init(a, c) {
      a = this.words = a || [];this.sigBytes = c != s ? c : 4 * a.length;
    }, toString: function toString(a) {
      return (a || k).stringify(this);
    }, concat: function concat(a) {
      var c = this.words,
          d = a.words,
          b = this.sigBytes;a = a.sigBytes;this.clamp();if (b % 4) for (var e = 0; e < a; e++) {
        c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4);
      } else if (d.length > 65535) for (e = 0; e < a; e += 4) {
        c[b + e >>> 2] = d[e >>> 2];
      } else c.push.apply(c, d);this.sigBytes += a;return this;
    }, clamp: function clamp() {
      var a = this.words,
          c = this.sigBytes;a[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4);a.length = h.ceil(c / 4);
    }, clone: function clone() {
      var a = m.clone.call(this);a.words = this.words.slice(0);return a;
    }, random: function random(a) {
      for (var c = [], d = 0; d < a; d += 4) {
        c.push(4294967296 * h.random() | 0);
      }return new r.init(c, a);
    } }),
      l = f.enc = {},
      k = l.Hex = { stringify: function stringify(a) {
      var c = a.words;a = a.sigBytes;for (var d = [], b = 0; b < a; b++) {
        var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;d.push((e >>> 4).toString(16));d.push((e & 15).toString(16));
      }return d.join('');
    }, parse: function parse(a) {
      for (var c = a.length, d = [], b = 0; b < c; b += 2) {
        d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << 24 - 4 * (b % 8);
      }return new r.init(d, c / 2);
    } },
      n = l.Latin1 = { stringify: function stringify(a) {
      var c = a.words;a = a.sigBytes;for (var d = [], b = 0; b < a; b++) {
        d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
      }return d.join('');
    }, parse: function parse(a) {
      for (var c = a.length, d = [], b = 0; b < c; b++) {
        d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
      }return new r.init(d, c);
    } },
      j = l.Utf8 = { stringify: function stringify(a) {
      try {
        return decodeURIComponent(escape(n.stringify(a)));
      } catch (c) {
        throw Error('Malformed UTF-8 data');
      }
    }, parse: function parse(a) {
      return n.parse(unescape(encodeURIComponent(a)));
    } },
      u = g.BufferedBlockAlgorithm = m.extend({ reset: function reset() {
      this._data = new r.init();this._nDataBytes = 0;
    }, _append: function _append(a) {
      typeof a === 'string' && (a = j.parse(a));this._data.concat(a);this._nDataBytes += a.sigBytes;
    }, _process: function _process(a) {
      var c = this._data,
          d = c.words,
          b = c.sigBytes,
          e = this.blockSize,
          f = b / (4 * e),
          f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);a = f * e;b = h.min(4 * a, b);if (a) {
        for (var g = 0; g < a; g += e) {
          this._doProcessBlock(d, g);
        }g = d.splice(0, a);c.sigBytes -= b;
      }return new r.init(g, b);
    }, clone: function clone() {
      var a = m.clone.call(this);
      a._data = this._data.clone();return a;
    }, _minBufferSize: 0 });g.Hasher = u.extend({ cfg: m.extend(), init: function init(a) {
      this.cfg = this.cfg.extend(a);this.reset();
    }, reset: function reset() {
      u.reset.call(this);this._doReset();
    }, update: function update(a) {
      this._append(a);this._process();return this;
    }, finalize: function finalize(a) {
      a && this._append(a);return this._doFinalize();
    }, blockSize: 16, _createHelper: function _createHelper(a) {
      return function (c, d) {
        return new a.init(d).finalize(c);
      };
    }, _createHmacHelper: function _createHmacHelper(a) {
      return function (c, d) {
        return new t.HMAC.init(a, d).finalize(c);
      };
    } });var t = f.algo = {};return f;
}(Math);
(function (h) {
  for (var s = CryptoJS, f = s.lib, g = f.WordArray, q = f.Hasher, f = s.algo, m = [], r = [], l = function l(a) {
    return 4294967296 * (a - (a | 0)) | 0;
  }, k = 2, n = 0; n < 64;) {
    var j;a: {
      j = k;for (var u = h.sqrt(j), t = 2; t <= u; t++) {
        if (!(j % t)) {
          j = !1;break a;
        }
      }j = !0;
    }j && (n < 8 && (m[n] = l(h.pow(k, 0.5))), r[n] = l(h.pow(k, 1 / 3)), n++);k++;
  }var a = [],
      f = f.SHA256 = q.extend({ _doReset: function _doReset() {
      this._hash = new g.init(m.slice(0));
    }, _doProcessBlock: function _doProcessBlock(c, d) {
      for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; p < 64; p++) {
        if (p < 16) {
          a[p] = c[d + p] | 0;
        } else {
          var k = a[p - 15],
              l = a[p - 2];a[p] = ((k << 25 | k >>> 7) ^ (k << 14 | k >>> 18) ^ k >>> 3) + a[p - 7] + ((l << 15 | l >>> 17) ^ (l << 13 | l >>> 19) ^ l >>> 10) + a[p - 16];
        }k = q + ((h << 26 | h >>> 6) ^ (h << 21 | h >>> 11) ^ (h << 7 | h >>> 25)) + (h & m ^ ~h & n) + r[p] + a[p];l = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & g ^ f & g);q = n;n = m;m = h;h = j + k | 0;j = g;g = f;f = e;e = k + l | 0;
      }b[0] = b[0] + e | 0;b[1] = b[1] + f | 0;b[2] = b[2] + g | 0;b[3] = b[3] + j | 0;b[4] = b[4] + h | 0;b[5] = b[5] + m | 0;b[6] = b[6] + n | 0;b[7] = b[7] + q | 0;
    }, _doFinalize: function _doFinalize() {
      var a = this._data,
          d = a.words,
          b = 8 * this._nDataBytes,
          e = 8 * a.sigBytes;
      d[e >>> 5] |= 128 << 24 - e % 32;d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);d[(e + 64 >>> 9 << 4) + 15] = b;a.sigBytes = 4 * d.length;this._process();return this._hash;
    }, clone: function clone() {
      var a = q.clone.call(this);a._hash = this._hash.clone();return a;
    } });s.SHA256 = q._createHelper(f);s.HmacSHA256 = q._createHmacHelper(f);
})(Math);
(function () {
  var h = CryptoJS,
      s = h.enc.Utf8;h.algo.HMAC = h.lib.Base.extend({ init: function init(f, g) {
      f = this._hasher = new f.init();typeof g === 'string' && (g = s.parse(g));var h = f.blockSize,
          m = 4 * h;g.sigBytes > m && (g = f.finalize(g));g.clamp();for (var r = this._oKey = g.clone(), l = this._iKey = g.clone(), k = r.words, n = l.words, j = 0; j < h; j++) {
        k[j] ^= 1549556828, n[j] ^= 909522486;
      }r.sigBytes = l.sigBytes = m;this.reset();
    }, reset: function reset() {
      var f = this._hasher;f.reset();f.update(this._iKey);
    }, update: function update(f) {
      this._hasher.update(f);return this;
    }, finalize: function finalize(f) {
      var g = this._hasher;f = g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f));
    } });
})();

//
// AWS Signature v4 Implementation for Web Browsers
//
// Copyright (c) 2016 Daniel Joos
//
// Distributed under MIT license. (See file LICENSE)
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE X CONSORTIUM BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

var defaultConfig = {
  region: 'eu-west-1',
  service: 'execute-api',
  defaultContentType: 'application/json',
  defaultAcceptType: 'application/json',
  payloadSerializerFactory: JsonPayloadSerializer,
  uriParserFactory: SimpleUriParser,
  hasherFactory: CryptoJSHasher

  /**
   * Create a new signer object with the given configuration.
   * Configuration must specify the AWS credentials used for the signing operation.
   * It must contain the following properties:
   * `accessKeyId`: The AWS IAM access key ID.
   * `secretAccessKey`: The AWS IAM secret key.
   * `sessionToken`: Optional session token, required for temporary credentials.
   * @param {object} config The configuration object.
   * @constructor
   */
};
var AwsSigner = function () {
  function AwsSigner(config) {
    classCallCheck(this, AwsSigner);

    this.config = extend({}, defaultConfig, config);
    this.payloadSerializer = this.config.payloadSerializer || this.config.payloadSerializerFactory();
    this.uriParser = this.config.uriParserFactory();
    this.hasher = this.config.hasherFactory();
    assertRequired(this.config.accessKeyId, 'AwsSigner requires AWS AccessKeyID');
    assertRequired(this.config.secretAccessKey, 'AwsSigner requires AWS SecretAccessKey');
  }
  /**
   * Create signature headers for the given request.
   * Request must be in the format, known from the `$http` service of Angular:
   * ```
   * request = {
   *      headers: { ... },
   *      method: 'GET',
   *      url: 'http://...',
   *      params: { ... },
   *      data: ...           // alternative: body
   * };
   * ```
   * The resulting object contains the signature headers. For example, it can be merged into an
   * existing `$http` config when dealing with Angular JS.
   * @param {object} request The request to create the signature for. Will not be modified!
   * @param {Date=} signDate Optional signature date to use. Current date-time is used if not specified.
   * @returns Signed request headers.
   */


  createClass(AwsSigner, [{
    key: 'sign',
    value: function sign(request, signDate) {
      var workingSet = {
        request: extend({}, request),
        signDate: signDate || new Date(),
        uri: this.uriParser(request.url)
      };
      prepare(this, workingSet);
      buildCanonicalRequest(this, workingSet); // Step1: build the canonical request
      buildStringToSign(this, workingSet); // Step2: build the string to sign
      calculateSignature(this, workingSet); // Step3: calculate the signature hash
      buildSignatureHeader(this, workingSet); // Step4: build the authorization header
      return {
        'Accept': workingSet.request.headers['accept'],
        'Authorization': workingSet.authorization,
        'Content-Type': workingSet.request.headers['content-type'],
        'x-amz-date': workingSet.request.headers['x-amz-date'],
        'x-amz-security-token': this.config.sessionToken || undefined
      };
    }
  }]);
  return AwsSigner;
}();



// Some preparations
function prepare(self, ws) {
  var headers = {
    'host': ws.uri.host,
    'content-type': self.config.defaultContentType,
    'accept': self.config.defaultAcceptType,
    'x-amz-date': amzDate(ws.signDate)
    // Payload or not?
  };ws.request.method = ws.request.method.toUpperCase();
  if (ws.request.body) {
    ws.payload = ws.request.body;
  } else if (ws.request.data && self.payloadSerializer) {
    ws.payload = self.payloadSerializer(ws.request.data);
  } else {
    delete headers['content-type'];
  }
  // Headers
  ws.request.headers = extend(headers, Object.keys(ws.request.headers || {}).reduce(function (normalized, key) {
    normalized[key.toLowerCase()] = ws.request.headers[key];
    return normalized;
  }, {}));
  ws.sortedHeaderKeys = Object.keys(ws.request.headers).sort();
  // Remove content-type parameters as some browser might change them on send
  if (ws.request.headers['content-type']) {
    ws.request.headers['content-type'] = ws.request.headers['content-type'].split(';')[0];
  }
  // Merge params to query params
  if (_typeof(ws.request.params) === 'object') {
    extend(ws.uri.queryParams, ws.request.params);
  }
}

// Convert the request to a canonical format.
function buildCanonicalRequest(self, ws) {
  ws.signedHeaders = ws.sortedHeaderKeys.map(function (key) {
    return key.toLowerCase();
  }).join(';');
  ws.canonicalRequest = String(ws.request.method).toUpperCase() + '\n' +
  // Canonical URI:
  encodeURI(ws.uri.path) + '\n' +
  // Canonical Query String:
  Object.keys(ws.uri.queryParams).sort().map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(ws.uri.queryParams[key]);
  }).join('&') + '\n' +
  // Canonical Headers:
  ws.sortedHeaderKeys.map(function (key) {
    return key.toLocaleLowerCase() + ':' + ws.request.headers[key];
  }).join('\n') + '\n\n' +
  // Signed Headers:
  ws.signedHeaders + '\n' +
  // Hashed Payload
  self.hasher.hash(ws.payload ? ws.payload : '');
}

// Construct the string that will be signed.
function buildStringToSign(self, ws) {
  ws.credentialScope = [amzDate(ws.signDate, true), self.config.region, self.config.service, 'aws4_request'].join('/');
  ws.stringToSign = 'AWS4-HMAC-SHA256' + '\n' + amzDate(ws.signDate) + '\n' + ws.credentialScope + '\n' + self.hasher.hash(ws.canonicalRequest);
}

// Calculate the signature
function calculateSignature(self, ws) {
  var hmac = self.hasher.hmac;
  var signKey = hmac(hmac(hmac(hmac('AWS4' + self.config.secretAccessKey, amzDate(ws.signDate, true), { hexOutput: false }), self.config.region, { hexOutput: false, textInput: false }), self.config.service, { hexOutput: false, textInput: false }), 'aws4_request', { hexOutput: false, textInput: false });
  ws.signature = hmac(signKey, ws.stringToSign, { textInput: false });
}

// Build the signature HTTP header using the data in the working set.
function buildSignatureHeader(self, ws) {
  ws.authorization = 'AWS4-HMAC-SHA256 ' + 'Credential=' + self.config.accessKeyId + '/' + ws.credentialScope + ', ' + 'SignedHeaders=' + ws.signedHeaders + ', ' + 'Signature=' + ws.signature;
}

// Format the given `Date` as AWS compliant date string.
// Time part gets omitted if second argument is set to `true`.
function amzDate(date, short) {
  var result = date.toISOString().replace(/[:\-]|\.\d{3}/g, '').substr(0, 17); // eslint-disable-line
  if (short) {
    return result.substr(0, 8);
  }
  return result;
}

/**
 * Payload serializer factory implementation that converts the data to a JSON string.
 */
function JsonPayloadSerializer() {
  return function (data) {
    return JSON.stringify(data);
  };
}

/**
 * Simple URI parser factory.
 * Uses an `a` document element for parsing given URIs.
 * Therefore it most likely will only work in a web browser.
 */
function SimpleUriParser() {
  var parser = document ? document.createElement('a') : {};

  /**
   * Parse the given URI.
   * @param {string} uri The URI to parse.
   * @returns JavaScript object with the parse results:
   * `protocol`: The URI protocol part.
   * `host`: Host part of the URI.
   * `path`: Path part of the URI, always starting with a `/`
   * `queryParams`: Query parameters as JavaScript object.
   */
  return function (uri) {
    parser.href = uri;
    return {
      protocol: parser.protocol,
      host: parser.host.replace(/^(.*):((80)|(443))$/, '$1'),
      path: (parser.pathname.charAt(0) !== '/' ? '/' : '') + parser.pathname,
      queryParams: extractQueryParams(parser.search)
    };
  };

  function extractQueryParams(search) {
    return (/^\??(.*)$/.exec(search)[1].split('&').reduce(function (result, arg) {
        arg = /^(.+)=(.*)$/.exec(arg);
        if (arg) {
          result[arg[1]] = arg[2];
        }
        return result;
      }, {})
    );
  }
}

/**
 * Hash factory implementation using the SHA-256 hash algorithm of CryptoJS.
 * Requires at least the CryptoJS rollups: `sha256.js` and `hmac-sha256.js`.
 */
function CryptoJSHasher() {
  return {
    /**
     * Hash the given input using SHA-256 algorithm.
     * The options can be used to control the in-/output of the hash operation.
     * @param {*} input Input data.
     * @param {object} options Options object:
     * `hexOutput` -- Output the hash with hex encoding (default: `true`).
     * `textInput` -- Interpret the input data as text (default: `true`).
     * @returns The generated hash
     */
    hash: function hash(input, options) {
      options = extend({ hexOutput: true, textInput: true }, options);
      var hash = CryptoJS.SHA256(input);
      if (options.hexOutput) {
        return hash.toString(CryptoJS.enc.Hex);
      }
      return hash;
    },

    /**
     * Create the HMAC of the given input data with the given key using the SHA-256
     * hash algorithm.
     * The options can be used to control the in-/output of the hash operation.
     * @param {string} key Secret key.
     * @param {*} input Input data.
     * @param {object} options Options object:
     * `hexOutput` -- Output the hash with hex encoding (default: `true`).
     * `textInput` -- Interpret the input data as text (default: `true`).
     * @returns The generated HMAC.
     */
    hmac: function hmac(key, input, options) {
      options = extend({ hexOutput: true, textInput: true }, options);
      var hmac = CryptoJS.HmacSHA256(input, key, { asBytes: true });
      if (options.hexOutput) {
        return hmac.toString(CryptoJS.enc.Hex);
      }
      return hmac;
    }
  };
}

// Simple version of the `extend` function, known from Angular and Backbone.
// It merges the second (and all succeeding) argument(s) into the object, given as first
// argument. This is done recursively for all child objects, as well.
function extend(dest) {
  var objs = [].slice.call(arguments, 1);
  objs.forEach(function (obj) {
    if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
      return;
    }
    Object.keys(obj).forEach(function (key) {
      var src = obj[key];
      if (typeof src === 'undefined') {
        return;
      }
      if (src !== null && (typeof src === 'undefined' ? 'undefined' : _typeof(src)) === 'object') {
        dest[key] = Array.isArray(src) ? [] : {};
        extend(dest[key], src);
      } else {
        dest[key] = src;
      }
    });
  });
  return dest;
}

// Throw an error if the given object is undefined.
function assertRequired(obj, msg) {
  if (typeof obj === 'undefined' || !obj) {
    throw new Error(msg);
  }
}

var METRICS = ['size', 'duration', 'position', 'number', 'count'];
var DEFAULT_ENDPOINT = 'https://mobileanalytics.us-east-1.amazonaws.com/2014-06-05/events';

var Amazon = function () {
  function Amazon(options) {
    classCallCheck(this, Amazon);

    this.name = 'amazon';
    _extends(this, options);
    var session = getUser().session;
    if (session.new && !options.test) this.logEvent({ eventType: '_session.start' });
  }

  createClass(Amazon, [{
    key: 'logPageView',
    value: function logPageView(page, options) {
      var event = createPageView(page, this.previousPage, options);
      sendTelemetry(event, this.userPoolID, this.app);
      this.previousPage = event.attributes;
    }
  }, {
    key: 'logEvent',
    value: function logEvent(event) {
      var events = createEventLog(event);
      sendTelemetry(events, this.userPoolID, this.app);
    }
  }]);
  return Amazon;
}();

function createPageView(page) {
  var previousPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var session = getUser().session;
  return {
    eventType: 'pageView',
    timestamp: new Date().toISOString(),
    session: {
      id: session.id,
      startTimestamp: session.startTimestamp
    },
    attributes: _extends({
      referrer: document.referrer,
      hostname: window.location.hostname,
      path: page || window.location.pathname,
      pageUrl: page || window.location.pathname,
      pageName: document.title,
      previousPageUrl: previousPage.pageUrl,
      previousPageName: previousPage.pageName
    }, extractAttributes(options)),
    metrics: extractMetrics(options)
  };
}

function createEventLog(event) {
  var session = getUser().session;
  return {
    eventType: event.eventType || 'other',
    timestamp: new Date().toISOString(),
    session: {
      id: session.id,
      startTimestamp: session.startTimestamp
    },
    attributes: _extends({
      referrer: document.referrer,
      hostname: window.location.hostname,
      path: window.location.pathname
    }, extractAttributes(event)),
    metrics: extractMetrics(event)
  };
}

function extractAttributes(event) {
  var attributes = _extends({}, event);
  delete attributes.workflow;
  METRICS.forEach(function (metric) {
    return delete attributes[metric];
  });
  Object.keys(attributes).forEach(function (attr) {
    if (attr === 'json') {
      attributes[attr] = attributes[attr] ? JSON.stringify(attributes[attr]) : 'null';
    } else {
      attributes[attr] = attributes[attr] !== undefined ? attributes[attr].toString() : 'null';
    }
  });
  return attributes;
}

function extractMetrics(event) {
  var metrics = {};
  METRICS.forEach(function (metric) {
    if (event[metric]) metrics[metric] = event[metric];
  });
  return metrics;
}

function createHeaders() {
  var credentials = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = arguments[1];

  var config = {
    region: 'us-east-1',
    service: 'mobileanalytics',
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretKey,
    sessionToken: credentials.SessionToken
  };
  var signer = new AwsSigner(config);
  var signed = signer.sign(options);
  return signed;
}

function createClientContext(clientId, app) {
  // eslint-disable-line
  return JSON.stringify({
    client: {
      client_id: clientId,
      app_title: app.name,
      app_version_name: app.version || 'unknown'
    },
    services: {
      mobile_analytics: {
        app_id: app.id
      }
    }
  });
}

function sendTelemetry(events, userPoolID, app) {
  var user = getUser();
  events = Array.isArray(events) ? events : [events];
  var options = createTelemetryOptions(events);
  getCredentials(userPoolID, function (credentials) {
    try {
      options.headers = createHeaders(credentials, options);
      options.headers['x-amz-Client-Context'] = createClientContext(user.id, app);
    } catch (e) {
      console.error(e);
      return;
    }
    request(options, function (response) {
      if (response) {
        console.error(JSON.parse(response));
      }
    });
  });
}

function createTelemetryOptions(events) {
  var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_ENDPOINT;

  return {
    url: url,
    method: 'POST',
    body: JSON.stringify({
      events: events
    })
  };
}

var Google = function () {
  function Google() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Google);

    this.name = 'google';
    _extends(this, options);
  }

  createClass(Google, [{
    key: 'logPageView',
    value: function logPageView(page, options) {
      var pageviewObj = buildPageViewObject(page, options, this.dimensions, this.metrics);
      getTrackers(function (trackers) {
        trackers.forEach(function (tracker) {
          tracker.send(pageviewObj);
        });
      });
    }
  }, {
    key: 'logEvent',
    value: function logEvent(event) {
      var eventObject = buildEventObject(event, this.dimensions, this.metrics);
      getTrackers(function (trackers) {
        trackers.forEach(function (tracker) {
          tracker.send(eventObject);
        });
      });
    }
  }]);
  return Google;
}();

function getTrackers(callback) {
  if (window.ga) {
    window.ga(function () {
      callback(window.ga.getAll());
    });
  } else {
    console.log(new Error('Google Analytics trackers not available'));
  }
}

function buildPageViewObject(page, options) {
  var dimensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var metrics = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var pageviewObject = {
    hitType: 'pageview',
    page: page || window.location.pathname
  };

  return mapMetricsAndDimensions(pageviewObject, options, dimensions, metrics);
}

function buildEventObject(event) {
  var dimensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var metrics = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var eventObject = {
    hitType: 'event',
    eventCategory: event.category || 'none',
    eventAction: event.action,
    eventLabel: event.label
  };

  return mapMetricsAndDimensions(eventObject, event, dimensions, metrics);
}

function mapMetricsAndDimensions(inputObject, options, dimensions, metrics) {
  var mappedObject = inputObject;

  Object.keys(dimensions).forEach(function (dimension) {
    mappedObject['dimension' + dimensions[dimension]] = options[dimension];
  });

  Object.keys(metrics).forEach(function (metric) {
    mappedObject['metric' + metrics[metric]] = options[metric];
  });

  return mappedObject;
}

var anonymize = function (user) {
  if (!user) return undefined;
  return CryptoJS.SHA256(user).toString(CryptoJS.enc.Hex);
};

var internalOrgs = ['esri.com', 'esriuk.com', 'esri.de', 'esri.ca', 'esrifrance.fr', 'esri.nl', 'esri-portugal.pt', 'esribulgaria.com', 'esri.fi', 'esri.kr', 'esrimalaysia.com.my', 'esri.es', 'esriaustralia.com.au', 'esri-southafrica.com', 'esri.cl', 'esrichina.com.cn', 'esri.co', 'esriturkey.com.tr', 'geodata.no', 'esriitalia.it', 'esri.pl'];

/*
 * Determines whether or not the telemetry library should be enabled based on passed in options
 */
var telemetryEnabled = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var portal = options.portal || {};
  if (options.disabled) {
    // Tracking is manually disabled
    return false;
  } else if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
    // user's browser has turned off tracking
    return false;
  } else if (typeof portal.eueiEnabled !== 'undefined' && portal.eueiEnabled === false) {
    // Portal does not allow tracking
    return false;
  } else if (portal.eueiEnabled && portal.user && portal.user.orgId === portal.id) {
    // Portal allows tracking; except when user is anonymous or doesn't belong to portal's org
    return true;
  } else if (portal.user && !portal.user.orgId && portal.ipCntryCode === 'US') {
    // Public user in the United States on a portal that allows tracking
    return true;
  } else if (!portal.user && portal.ipCntryCode === 'US') {
    // Anonymous user in the United States on a portal that allows tracking
    return true;
  } else if (Object.keys(portal).length > 0) {
    // Initialized with a Portal object but does not meet tracking conditions
    return false;
  } else {
    // Default condition not initialized with a Portal-Self object
    return true;
  }
};

var Telemetry = function () {
  function Telemetry(options) {
    classCallCheck(this, Telemetry);

    // Make sure failure to init this library cannot have side-effects
    try {
      this.trackers = [];
      this.workflows = {};
      this.test = options.test;
      this.debug = options.debug;

      this.disabled = !telemetryEnabled(options);
      if (this.disabled) console.log('Telemetry Disabled');

      if (options.portal && options.portal.user) {
        var subscriptionInfo = options.portal.subscriptionInfo || {};
        this.setUser(options.portal.user, subscriptionInfo.type);
      } else if (options.user) {
        this.setUser(options.user);
      }

      if (!this.disabled) {
        this._initTrackers(options);
      }
    } catch (e) {
      console.error('Telemetry Disabled');
      console.error(e);
      this.disabled = true;
    }
  }

  createClass(Telemetry, [{
    key: '_initTrackers',
    value: function _initTrackers(options) {
      if (options.amazon) {
        var amazon = new Amazon(options.amazon);
        this.trackers.push(amazon);
      }

      if (options.google) {
        var google = new Google(options.google);
        this.trackers.push(google);
      }
      if (!this.trackers.length) console.error(new Error('No trackers configured'));
    }
  }, {
    key: 'setUser',
    value: function setUser() {
      var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var orgType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Public';

      user = typeof user === 'string' ? { username: user } : user;
      this.user = user;
      this.user.accountType = orgType;
      var internalDomain = void 0;
      if (user.email && user.email.split) {
        var domain = user.email.split('@')[1];
        internalDomain = internalOrgs.filter(function (org) {
          return domain === org;
        }).length > 0;
      }

      if (internalDomain || ['In House', 'Demo and Marketing'].indexOf(orgType) > -1) {
        this.user.internalUser = true;
      }
    }
  }, {
    key: 'logPageView',
    value: function logPageView(page) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var attributes = this.preProcess(options);
      if (this.debug) console.log('Tracking page view', JSON.stringify(attributes));else if (this.test && !this.disabled) return attributes;

      if (!this.trackers.length || this.disabled) {
        if (!this.disabled) console.error(new Error('Page view was not logged because no trackers are configured.'));
        return false;
      } else {
        this.trackers.forEach(function (tracker) {
          try {
            tracker.logPageView(page, attributes);
          } catch (e) {
            console.error(tracker.name + ' tracker failed to log page view.', e);
          }
        });
        return true;
      }
    }
  }, {
    key: 'logEvent',
    value: function logEvent() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var event = this.preProcess(options);

      if (this.debug) console.log('Tracking event', JSON.stringify(event));else if (this.test) return event;

      if (!this.trackers.length || this.disabled) {
        if (!this.disabled) console.error(new Error('Event was not logged because no trackers are configured.'));
        return false;
      } else {
        this.trackers.forEach(function (tracker) {
          try {
            tracker.logEvent(event);
          } catch (e) {
            console.error(tracker.name + ' tracker failed to log event', e);
          }
        });
        return true;
      }
    }
  }, {
    key: 'logError',
    value: function logError() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var event = _extends({ eventType: 'error' }, options);
      this.logEvent(event);
    }
  }, {
    key: 'startWorkflow',
    value: function startWorkflow(name) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var workflow = {
        name: name,
        start: Date.now(),
        steps: [],
        workflowId: Math.floor((1 + Math.random()) * 0x100000000000).toString(16)
      };
      this._saveWorkflow(workflow);
      var workflowObj = _extends({ name: name, step: 'start' }, attributes);
      this._logWorkflow(workflowObj);
      return workflow;
    }
  }, {
    key: 'stepWorkflow',
    value: function stepWorkflow(name, step) {
      var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var details = typeof options === 'string' ? attributes : attributes.details;
      var workflowObj = _extends({ name: name, step: step, details: details }, attributes);
      this._logWorkflow(workflowObj);
    }
  }, {
    key: 'endWorkflow',
    value: function endWorkflow(name) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var workflowObj = _extends({ name: name, step: 'finish' }, attributes);
      this._logWorkflow(workflowObj);
    }
  }, {
    key: 'cancelWorkflow',
    value: function cancelWorkflow(name) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var workflowObj = _extends({ name: name, step: 'cancel' }, attributes);
      this._logWorkflow(workflowObj);
    }
  }, {
    key: 'getWorkflow',
    value: function getWorkflow(name) {
      var workflow = Storage.get('TELEMETRY-WORKFLOW:' + name);
      // do not let old workflows be returned
      if (workflow) {
        var workflowAge = Date.now() - workflow.start;
        var timeout = 30 * 60 * 1000;
        if (workflowAge < timeout) {
          return workflow;
        } else {
          this._deleteWorkflow(workflow);
        }
      }
    }
  }, {
    key: '_saveWorkflow',
    value: function _saveWorkflow(workflow) {
      Storage.set('TELEMETRY-WORKFLOW:' + workflow.name, workflow);
    }
  }, {
    key: '_deleteWorkflow',
    value: function _deleteWorkflow(workflow) {
      Storage.delete('TELEMETRY-WORKFLOW:' + workflow.name);
    }
  }, {
    key: '_logWorkflow',
    value: function _logWorkflow() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      /*
      const workflow = {
        name: 'add layer to map',
        step: 'start',
        details: 'some details about the step'
      }
      */
      options = this.preProcess(options);
      var workflow = this.getWorkflow(options.name);
      if (!workflow) {
        this.startWorkflow(options.name);
        workflow = this.getWorkflow(options.name);
      }
      workflow.steps.push(options.step);
      workflow.duration = (Date.now() - workflow.start) / 1000;

      if (['cancel', 'finish'].indexOf(options.step) > -1) {
        this._deleteWorkflow(workflow);
      } else {
        this._saveWorkflow(workflow);
      }

      var track = _extends(options, {
        eventType: 'workflow',
        category: options.name,
        action: options.step,
        label: options.details,
        duration: workflow.duration,
        workflowId: workflow.workflowId
      });

      this.logEvent(track);
    }
  }, {
    key: 'preProcess',
    value: function preProcess() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var userOptions = {};
      if (this.user) {
        userOptions = {
          user: anonymize(this.user.username),
          orgId: anonymize(this.user.orgId),
          lastLogin: this.user.lastLogin,
          userSince: this.user.created,
          internalUser: this.user.internalUser || false,
          accountType: this.user.accountType
        };
      }

      return _extends({}, options, userOptions);
    }
  }]);
  return Telemetry;
}();

return Telemetry;

});
//# sourceMappingURL=telemetry.amd.js.map

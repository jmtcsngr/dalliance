/* -*- mode: javascript; c-basic-offset: 4; indent-tabs-mode: nil -*- */

//
// Dalliance Genome Explorer
// (c) Thomas Down 2006-2011
//
// bin.js general binary data support
//

"use strict";

if (typeof(require) !== 'undefined') {
    var utils = require('./utils');
    var shallowCopy = utils.shallowCopy;

    var sha1 = require('./sha1');
    var b64_sha1 = sha1.b64_sha1;
    var RangerRequest = require('npg_ranger').RangerRequest;
}

function BlobFetchable(b) {
    this.blob = b;
}

BlobFetchable.prototype.slice = function(start, length) {
    var b;

    if (this.blob.slice) {
        if (length) {
            b = this.blob.slice(start, start + length);
        } else {
            b = this.blob.slice(start);
        }
    } else {
        if (length) {
            b = this.blob.webkitSlice(start, start + length);
        } else {
            b = this.blob.webkitSlice(start);
        }
    }
    return new BlobFetchable(b);
}

BlobFetchable.prototype.salted = function() {return this;}

if (typeof(FileReader) !== 'undefined') {
    // console.log('defining async BlobFetchable.fetch');

    BlobFetchable.prototype.fetch = function(callback) {
        var reader = new FileReader();
        reader.onloadend = function(ev) {
            callback(bstringToBuffer(reader.result));
        };
        reader.readAsBinaryString(this.blob);
    }

} else {
    // if (console && console.log)
    //    console.log('defining sync BlobFetchable.fetch');

    BlobFetchable.prototype.fetch = function(callback) {
        var reader = new FileReaderSync();
        try {
            var res = reader.readAsArrayBuffer(this.blob);
            callback(res);
        } catch (e) {
            callback(null, e);
        }
    }
}

function URLFetchable(url, start, end, opts) {
    if (!opts) {
        if (typeof start === 'object') {
            opts = start;
            start = undefined;
        } else {
            opts = {};
        }
    }

    this.url = url;
    this.start = start || 0;
    if (end) {
        this.end = end;
    }
    this.opts = opts;
}

URLFetchable.prototype.slice = function(s, l) {
    if (s < 0) {
        throw 'Bad slice ' + s;
    }

    var ns = this.start, ne = this.end;
    if (ns && s) {
        ns = ns + s;
    } else {
        ns = s || ns;
    }
    if (l && ns) {
        ne = ns + l - 1;
    } else {
        ne = ne || l - 1;
    }
    return new URLFetchable(this.url, ns, ne, this.opts);
}

var seed=0;
var isSafari = navigator.userAgent.indexOf('Safari') >= 0 && navigator.userAgent.indexOf('Chrome') < 0 ;

URLFetchable.prototype.fetchAsText = function(callback) {
    try {
        var req = new XMLHttpRequest();
        var length;
        var url = this.url;
        if ((isSafari || this.opts.salt) && url.indexOf('?') < 0) {
            url = url + '?salt=' + b64_sha1('' + Date.now() + ',' + (++seed));
        }
        req.open('GET', url, true);

        if (this.end) {
            if (this.end - this.start > 100000000) {
                throw 'Monster fetch!';
            }
            req.setRequestHeader('Range', 'bytes=' + this.start + '-' + this.end);
            length = this.end - this.start + 1;
        }

        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                if (req.status == 200 || req.status == 206) {
                    return callback(req.responseText);
                } else {
                    return callback(null);
                }
            }
        };
        if (this.opts.credentials) {
            req.withCredentials = true;
        }
        req.send('');
    } catch (e) {
        return callback(null);
    }
}

URLFetchable.prototype.salted = function() {
    var o = shallowCopy(this.opts);
    o.salt = true;
    return new URLFetchable(this.url, this.start, this.end, o);
}

URLFetchable.prototype.fetch = function(callback, opts) {
    var thisB = this;

    opts = opts || {};
    var attempt      = opts.attempt || 1;
    var redirects    = opts.redirects || 0;
    var maxRedirects = opts.maxRedirects || 3;
    var maxAttempts  = opts.maxAttempts  || 3;
    var method       = this.opts.method || '';
    var reqAuth      = false;

    if ( thisB.opts && thisB.opts.reqAuth ) {
        reqAuth = thisB.opts.reqAuth;
    }

    var truncatedLength = opts.truncatedLength;
    if ( attempt > maxAttempts ) {
        return callback(null, 'Maximum number of attempts to request data from url reached');
    }
    if ( redirects > maxRedirects ) {
        return callback(null, 'Maximum number of request data redirects reached');
    }

    try {
        var timeout;
        if (opts.timeout && !this.opts.credentials) {
            timeout = setTimeout(
                function() {
                    console.log('timing out ' + url);
                    req.abort();
                    return callback(null, 'Timeout');
                },
                opts.timeout
            );
        }

        var req;
        if ( method === 'rangerRequest' ) {
            req = new RangerRequest();
        } else {
           req = new XMLHttpRequest();
        }

        var length;
        var url = this.url;
        if ( reqAuth ) {
            req.withCredentials = true;
        }
        if ((isSafari || this.opts.salt) && url.indexOf('?') < 0) {
            url = url + '?salt=' + b64_sha1('' + Date.now() + ',' + (++seed));
        }
        req.open('GET', url, true);
        if (this.end) {
            if (this.end - this.start > 100000000) {
                throw 'Monster fetch!';
            }
            req.setRequestHeader('Range', 'bytes=' + this.start + '-' + this.end);
            length = this.end - this.start + 1;
        }
        req.responseType = 'arraybuffer';
        req.onreadystatechange = function() {

            if (req.readyState == 4) {
                if (timeout)
                    clearTimeout(timeout);
                if ( req.status === 401 ||
                     req.status === 403 ||
                     req.status === 404 ||
                     req.status === 406 ||
                     req.status === 409 ||
                     req.status === 422 ||
                     req.status === 500 ) {

                    var errorMessage = req.statusText ? req.statusText
                                                      : 'Server Error ' + req.status;
                    return callback(null, errorMessage);
                }
                if (req.status == 200 || req.status == 206) {
                    if ( req.response ) {
                        var bl = req.response.byteLength;
                        if (length && length != bl && (!truncatedLength || bl != truncatedLength)) {
                            var newOpts = {
                                attempt:         attempt + 1,
                                redirects:       redirects,
                                reqAuth:         reqAuth,
                                truncatedLength: bl
                            };
                            return thisB.fetch(callback, newOpts);
                        } else {
                            var data = req.response;
                            return callback(data);
                        }
                    } else if (req.mozResponseArrayBuffer) {
                        return callback(req.mozResponseArrayBuffer);
                    } else {
                        var r = req.responseText;
                        if (length && length != r.length && (!truncatedLength || r.length != truncatedLength)) {
                            var newOpts = {
                                attempt:         attempt + 1,
                                redirects:       redirects,
                                reqAuth:         reqAuth,
                                truncatedLength: r.length
                            };
                            return thisB.fetch(callback, newOpts);
                        } else {
                            return callback(bstringToBuffer(req.responseText));
                        }
                    }
                } else {
                    var newOpts = {
                        attempt:   attempt + 1,
                        redirects: redirects,
                        reqAuth:   reqAuth
                    };
                    return thisB.fetch(callback, newOpts);
                }
            }
        };
        if (this.opts.credentials) {
            req.withCredentials = true;
        }
        req.send('');
    } catch (e) {
        return callback(null);
    }
}

function bstringToBuffer( result ) {
    if (!result) {
        return null;
    }

    var ba = new Uint8Array(result.length);
    for (var i = 0; i < ba.length; ++i) {
        ba[i] = result.charCodeAt(i);
    }
    return ba.buffer;
}

// Read from Uint8Array

(function(global) {
    var convertBuffer = new ArrayBuffer(8);
    var ba = new Uint8Array(convertBuffer);
    var fa = new Float32Array(convertBuffer);


    global.readFloat = function(buf, offset) {
        ba[0] = buf[offset];
        ba[1] = buf[offset+1];
        ba[2] = buf[offset+2];
        ba[3] = buf[offset+3];
        return fa[0];
    };
 }(this));

function readInt64(ba, offset) {
    return (ba[offset + 7] << 24) | (ba[offset + 6] << 16) | (ba[offset + 5] << 8) | (ba[offset + 4]);
}

function readInt(ba, offset) {
    return (ba[offset + 3] << 24) | (ba[offset + 2] << 16) | (ba[offset + 1] << 8) | (ba[offset]);
}

function readShort(ba, offset) {
    return (ba[offset + 1] << 8) | (ba[offset]);
}

function readByte(ba, offset) {
    return ba[offset];
}

function readIntBE(ba, offset) {
    return (ba[offset] << 24) | (ba[offset + 1] << 16) | (ba[offset + 2] << 8) | (ba[offset + 3]);
}

// Exports if we are being used as a module

if (typeof(module) !== 'undefined') {
    module.exports = {
        BlobFetchable: BlobFetchable,
        URLFetchable: URLFetchable,

        readInt: readInt,
        readIntBE: readIntBE,
        readInt64: readInt64,
        readShort: readShort,
        readByte: readByte,
        readFloat: this.readFloat
    }
}

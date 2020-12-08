var fs = require('co-fs');
var FilePath = require('./fileMap').filePath;

module.exports = {
  realIp: function* (next) {
    this.req.ip = this.headers['x-forwarded-for'] || this.ip;
    yield* next;
  },
};
var fs = require('co-fs');
var FilePath = require('./fileMap').filePath;

module.exports = {
  realIp: function* (next) {
    this.req.ip = this.headers['x-forwarded-for'] || this.ip;
    yield* next;
  },

  handelError: function * (next) {
    try {
      yield * next;
    } catch (err) {
      this.status = err.status || 500;
      this.body = err.message;
      C.logger.error(err.stack);
      this.app.emit('error', err, this);
    }
  },
};
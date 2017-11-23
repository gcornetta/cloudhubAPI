var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    url = process.env.MONGO_URL,
    _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      _db = db;
      callback(err, db);
    });
  },

  getDB: function() {
    return _db;
  }
};
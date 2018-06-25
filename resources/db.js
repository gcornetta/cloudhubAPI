var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var url = process.env.MONGO_URL
var _db

module.exports = {

  connectToServer: function (callback) {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err)
      _db = db
      callback(err, db)
    })
  },

  getDB: function () {
    return _db
  }
}

var pg = require('pg');

var db_config = {
  user: process.env.DB_USER, //env var: PGUSER
  database: process.env.DB_DATABASE, //env var: PGDATABASE
  password: process.env.DB_PASSWORD, //env var: PGPASSWORD
  host: process.env.DB_HOST, // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  ssl: true
};

var pool = new pg.Pool(db_config);

exports.client = pool.client;

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
//pool.connect(function(err, client, done) {
//  if(err) {
//    return console.error('error fetching client from pool', err);
//  }
//  client.query('SELECT * from users', function(err, result) {
//    //call `done()` to release the client back to the pool
//    done();
//
//    if(err) {
//      return console.error('error running query', err);
//    }
//
//    console.log(result.rows[0]);
//  });
//});

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})

exports.getById = function(tableName, id, cb, err_cb) {
  return new Promise(function(resolve, reject) {
    pool.connect(function(err, client, done) {
      if(err) {
        err_cb ? err_cb(err) : reject(err);
      } else {
        client.query('SELECT * from ' + tableName + " where id = '" + id + "' limit 1", function(err, result) {
          //call `done()` to release the client back to the pool
          done();

          if(err) {
            err_cb ? err_cb('error running query: ' + err) : reject('error running query: ' + err);
          } else {
            if (result.rows[0]) {
              cb ? cb(result.rows[0]) : resolve(result.rows[0]);
            } else {
              err_cb ? err_cb("No record in table '" + tableName + "' with id: " + id) : resolve();
            }
          }
        });
      }
    });
  });
}

exports.getFields = function(tableName, cb, err_cb) {
  pool.connect(function(err, client, done) {
    if(err) {
      err_cb('error fetching client from pool: ' + err)
    } else {
      client.query("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = 'public' AND table_name = '" + tableName + "'", function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          err_cb('error getting fields: ' + err)
        } else {
          var fieldsArr = [];
          for (var i = 0; i < result.rows.length; i++) {
            fieldsArr.push(result.rows[i].column_name)
          }
          cb(fieldsArr);
        }
      });
    }
  });
}

exports.getAll = function(tableName, cb, err_cb, order) {
  pool.connect(function(err, client, done) {
    if(err) {
      err_cb('error fetching client from pool: ' + err)
    } else {
      client.query('SELECT * from ' + tableName + (order ? ' order by ' + order : ''), function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          err_cb('error getting all: ' + err)
        } else {
          cb(result.rows);
        }
      });
    }
  });
}

exports.getAllByFilter = function(tableName, filter, cb, err_cb, order) {
  return new Promise(function(resolve, reject) {
    pool.connect(function(err, client, done) {
      if(err) {
        err_cb ? err_cb(err) : reject(err);
      } else {
        client.query('SELECT * from ' + tableName + ' where ' + filter + (order ? ' order by ' + order : ''), function(err, result) {
          //call `done()` to release the client back to the pool
          done();

          if(err) {
            err_cb ? err_cb('error getting all by filter: ' + err) : resolve();
          } else {
            cb ? cb(result.rows) : resolve(result.rows);
          }
        });
      }
    });
  });
}

exports.getFirstByFilter = function(tableName, filter, cb, err_cb, order) {
    pool.connect(function(err, client, done) {
    if(err) {
      err_cb('error fetching client from pool: ' + err)
    } else {
      client.query('SELECT * from ' + tableName + ' where ' + filter + (order ? ' order by ' + order : '') + ' limit 1', function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          err_cb('error getting first by filter: ' + err)
        } else {
          cb(result.rows[0]);
        }
      });
    }
  });
}

exports.create = function(tableName, obj, cb, err_cb) {

  // make sure object has an id
  if (obj.id) {
    // make sure object id is unique
    exports.getById(tableName, obj.id, function() {
      err_cb("Can't create record obj with id = " + obj.id + ", record with that id exists already");
    }, function(errMsg) {
      if (errMsg.startsWith("No record in table")) {
        // this is good, create record now

        // get fields available in that table
        exports.getFields(tableName, function(fieldsArray) {
          // for each field in table, see if obj has that field, generate query string
          var colNames = [];
          var valueList = [];
          var newObj = {};

          for (var i = 0; i < fieldsArray.length; i++) {
            // if field exists in obj being added to db
            if (obj[fieldsArray[i]]) {
              // add field to sql command
              colNames.push(fieldsArray[i]);
              valueList.push("'" + obj[fieldsArray[i]] + "'");

              // create obj to be returned
              newObj[fieldsArray[i]] = obj[fieldsArray[i]];

              //
            } else {
              // column will be null, that's OK
            }
          }

          var colStr = colNames.join(", ");
          var valStr = valueList.join(", ");

          if (colNames.length == 0) {
            err_cb('Cannot create, no fields match table schema for obj: ' + JSON.stringify(obj));
          } else {
            var sql = "insert into " + tableName + " (" + colStr + ") values (" + valStr + ")";
            pool.connect(function(err, client, done) {
              if(err) {
                err_cb('error fetching client from pool: ' + err)
              } else {
                client.query(sql, function(err, result) {
                  //call `done()` to release the client back to the pool
                  done();

                  if(err) {
                    console.log(sql);
                    err_cb('error creating: ' + err)
                  } else {
                    cb(newObj);
                  }
                });
              }
            });
          }
        }, err_cb) // this error handling could be buggy?
      }
    });
  } else {
    err_cb('db.create method requries an id in the obj to create');
  }
}

exports.getOrCreate = function(tableName, obj, cb, err_cb) {
  // check to see if the obj has an id
  if (obj.id) {
    // try and look up if obj exists by id
    exports.getById(tableName, obj.id, function(retrievedObj) {
      cb(retrievedObj);
    }, function(errMsg) {
      if (errMsg.startsWith("No record in table")) {
        // create record
        exports.create(tableName, obj, cb, err_cb);
      }
    })
  } else {
    err_cb('db.getOrCreate method requries an id in the obj to look up')
  }
}

exports.updateById = function(tableName, obj, cb, err_cb) {
  // check to see if the obj has an id
  if (obj.id) {
    // try and look up if obj exists by id
    exports.getById(tableName, obj.id, function(retrievedObj) {
      // for fields in new object, update retrieved obj

      exports.getFields(tableName, function(fieldArr) {

        var keyValuePairs = [];
        var newObj = {};

        for (field in obj) {
          // if valid field in schema
          if (fieldArr.includes(field)) {
            // retrievedObj[field] = obj[field];
            keyValuePairs.push(field + "='" + obj[field] + "'");
          }
        }

        var kvStr = keyValuePairs.join(", ");

        // update in database
        var sql = "UPDATE " + tableName + " SET " + kvStr + " WHERE id = '" + obj.id + "'"

        pool.connect(function(err, client, done) {
          if(err) {
            err_cb('error fetching client from pool: ' + err)
          } else {
            client.query(sql, function(err, result) {
              //call `done()` to release the client back to the pool
              done();

              if(err) {
                err_cb('error running query: ' + err)
              } else {
                cb(retrievedObj);
              }
            });
          }
        });

      }, console.error); // error getFields

    }, function(errMsg) { // error getById
      if (errMsg.startsWith("No record in table")) {
        err_cb('No record with id = ' + obj.id + " to update")
      } else {
        err_cb(errMsg);
      }
    })
  } else {
    err_cb('db.updateById method requries an id in the obj to look up')
  }
}

exports.updateOrCreate = function(tableName, obj, cb, err_cb) {
  // check to see if the obj has an id
  if (obj.id) {
    // try and look up if obj exists by id
    exports.getById(tableName, obj.id, function(retrievedObj) {
      exports.updateById(tableName, obj, cb, err_cb)
    }, function(errMsg) {
      if (errMsg.startsWith("No record in table")) {
        // create record
        exports.create(tableName, obj, cb, err_cb);
      }
    })
  } else {
    err_cb('db.updateOrCreate method requries an id in the obj to look up')
  }
}

exports.deleteById = function(tableName, id, cb, err_cb) {
  var sql = "DELETE FROM " + tableName + " WHERE id='" + id + "'";

  pool.connect(function(err, client, done) {
    if(err) {
      err_cb('error fetching client from pool: ' + err)
    } else {
      client.query(sql, function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          err_cb('error running query: ' + err)
        } else {
          cb(result);
        }
      });
    }
  });
}

exports.emptyTable = function(tableName, cb, err_cb) {
  pool.connect(function(err, client, done) {
    if(err) {
      err_cb('error fetching client from pool: ' + err)
    } else {
      client.query("delete from " + tableName, function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          err_cb('error running query: ' + err)
        } else {
          cb();
        }
      });
    }
  });
}

exports.rawSQL = function(sqlQuery, cb, err_cb) {
  pool.connect(function(err, client, done) {
    if(err) {
      err_cb('error fetching client from pool: ' + err)
    } else {
      client.query(sqlQuery, function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
          err_cb('error running query: ' + err)
        } else {
          cb(result); // likely want result.rows to process
        }
      });
    }
  });
}


// tests
//db.getFields('Users', function(results) {console.log(results)}, function(err) {console.error('SQL error getting fields: ' + err)});
//
//db.getById('Accounts','314', function(results) {console.log(results)}, function(err) {console.error(err)});
//
//db.getById('Accounts','315', function(results) {console.log(results)}, function(err) {console.error(err)});
//
//db.getAllByFilter('Accounts', "id ilike '3%'", function(results) {console.log(results)}, function(err) {console.error(err)});
//
//db.getFirstByFilter('Accounts', "id ilike '3%'", function(results) {console.log(results)}, function(err) {console.error(err)}, 'id desc');
//
//db.create('Accounts',{id: '42', display_name: 'Wei', aa: 'b'}, function(results) {console.log(results)}, function(err) {console.error(err)});
//
//db.getOrCreate('Accounts', {id: '43', display_name: 'Mark', aa: 'b'}, function(results) {console.log(results)}, function(err) {console.error(err)});
//
//db.updateOrCreate('Accounts', {id: '43', display_name: 'Marky', aa: 'b'}, function(results) {console.log(results)}, function(err) {console.error(err)});
//
//db.deleteById('Accounts', 43, function(results) {console.log(results)}, function(err) {console.error(err)});
//
//db.rawSQL("DELETE FROM Accounts WHERE id='22';", function(results) {console.log(results)}, function(err) {console.error(err)});

/* global LocalCollection */
/* global Factory:true */

var factories = {};

Factory = function(name, collection, attributes) {
  this.name = name;
  this.collection = collection;
  this.attributes = attributes;
  this.afterHooks = [];
  this.sequence = 0;
};

Factory.define = function(name, collection, attributes) {
  factories[name] = new Factory(name, collection, attributes);
  return factories[name];
};

Factory.get = function(name) {
  var factory = factories[name];
  if (!factory) {
    throw new Error("Factory: There is no factory named " + name);
  }
  return factory;
};

Factory.build = function(name, attributes, options) {
  var factory = Factory.get(name);
  var base = {};
  attributes = attributes || {};
  options = options || {};

  // "raw" attributes without functions evaluated, or dotted properties resolved
  attributes = _.extend(base, factory.attributes, attributes);

  var result = {};

  // either create a new factory and return its _id
  // or return a "fake" _id (since we"re not inserting anything)
  var makeRelation = function(relName) {
    if (options.insert) {
      return Factory.create(relName)._id;
    }

    // fake an id on build
    return Random.id();
  };

  factory.sequence += 1;

  var walk = function(record, object) {
    _.each(object, function(value, key) {
      // is this a Factory instance?
      if (value instanceof Factory) {
        value = makeRelation(value.name);
      }
      else if (_.isFunction(value)) {
        var fnRes = value.call(result, {
          sequence: function(fn) {
            return fn(factory.sequence);
          }
        });
        // does executing this function return a Factory instance?
        value = (fnRes instanceof Factory) ? makeRelation(fnRes.name) : fnRes;
      // if an object literal is passed in, traverse deeper into it
      }
      else if (Object.prototype.toString.call(value) === "[object Object]") {
        record[key] = record[key] || {};
        return walk(record[key], value);
      }

      var modifier = {$set: {}};
      if (key !== "_id") {
        modifier.$set[key] = value;
      }

      LocalCollection._modify(record, modifier);
    });
  };

  walk(result, attributes);

  result._id = attributes._id || Random.id();
  return result;
};

Factory._create = function(name, doc) {
  var factory = Factory.get(name);

  var insertId;

  if (factory.collection.mutate && factory.collection.mutate.insert) {
    var options;

    if (factory.collection._name === "users") {
      options = {email: Random.id() + "@factories.com"};
    }

    insertId = factory.collection.mutate.insert(doc, options);
  } else {
    insertId = factory.collection.insert(doc);
  }

  var record = factory.collection.findOne(insertId);
  return record;
};

Factory.create = function(name, attributes) {
  attributes = attributes || {};
  var doc = Factory.build(name, attributes, {insert: true});
  var record = Factory._create(name, doc);

  _.each(Factory.get(name).afterHooks, function(cb) {
    cb(record);
  });

  return record;
};

Factory.extend = function(name, attributes) {
  attributes = attributes || {};
  return _.extend(_.clone(Factory.get(name).attributes), attributes);
};

Factory.prototype.after = function(fn) {
  this.afterHooks.push(fn);
  return this;
};

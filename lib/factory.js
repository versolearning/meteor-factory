var factories = {};

Factory = function(name, collection, attributes) {
  this.name = name;
  this.collection = collection;
  this.attributes = attributes;
  this._schema = collection.Schema;
  this.afterHooks = [];
};

Factory.define = function(name, collection, attributes) {
  factories[name] = new Factory(name, collection, attributes);
  return factories[name];
};

Factory.get = function(name) {
  var factory = factories[name];
  if (! factory) throw new Error("Factory: There is no factory named " + name);
  return factory;
};

Factory.build = function(name, attributes, options) {
  var factory = Factory.get(name);
  var base = {};
  attributes = attributes || {};
  options = options || {};

  // tie ins for collection init method
  if (_.has(factory.collection, 'init'))
    base = factory.collection.init();

  // "raw" attributes without functions evaluated, or dotted properties resolved
  attributes = _.extend(base, factory.attributes, attributes);

  var result = {};

  // either create a new factory and return its _id
  // or return a 'fake' _id (since we're not inserting anything)
  var makeRelation = function(name) {
    if (options.insert)
      return Factory.create(name)._id;
    else
      // fake an id on build
      return Random.id();
  };
  
  var walk = function(record, object) {
    _.each(object, function(value, key) {
      // is this a Factory instance?
      if (value instanceof Factory) {
        value = makeRelation(value.name);
      } else if (_.isFunction(value)) {
        // does executing this function return a Factory instance?
        var fnRes = value.call(result);
        value = (fnRes instanceof Factory) ? makeRelation(fnRes.name) : fnRes;
      // if an object literal is passed in, traverse deeper into it
      } else if (Object.prototype.toString.call(value) === '[object Object]') {
        record[key] = record[key] || {};
        return walk(record[key], value);
      }
      
      var modifier = { $set: {} };
      modifier.$set[key] = value;

      LocalCollection._modify(record, modifier);
    });
  };

  walk(result, attributes);

  return result;
};

Factory._create = function(name, doc) {
  var factory = Factory.get(name);
  if (factory._schema) {
    var errors = Safe.validate(doc, factory._schema);
    if (errors) {
      throw new Error('Factory: Invalid Document (' + factory.collection._name + ') ' +
        EJSON.stringify(doc) + ' Errors: ' + EJSON.stringify(errors));
    }
  }
  var insertId = factory.collection.insert(doc);
  var record = factory.collection.findOne(insertId);
  return record;
};

Factory.create = function(name, attributes) {
  attributes = attributes || {};
  var doc = Factory.build(name, attributes, { insert: true });
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

Factory.prototype.schema = function(schema) {
  this._schema = schema;
  return this;
}

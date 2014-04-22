var factories = {};

Factory = function(name, collection, attributes) {
  this.name = name;
  this.collection = collection;
  this.attributes = attributes;
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

  if (_.has(factory.collection, 'init'))
    base = factory.collection.init();

  // "raw" attributes without functions evaluated, or dotted properties resolved
  attributes = _.extend(base, factory.attributes, attributes);

  var result = {};

  var walk = function(record, object) {
    _.each(object, function(value, key) {
      // check for a factory being passed in
      if (value instanceof Factory) {
        if (options.insert)
          record[key] = Factory.create(value.name)._id;
        else
          // fake an id here
          record[key] = Random.id();
        return;

      } else if (_.isFunction(value)) {
        value = value.call(result);

      // if an object literal is passed in, traverse deeper into it
      } else if (Object.prototype.toString.call(value) === '[object Object]') {
        record[key] = record[key] || {};
        return walk(record[key], value);
      }

      var modifier = { $set: {}};
      modifier.$set[key] = value;

      LocalCollection._modify(record, modifier);
    });
  };

  walk(result, attributes);

  if (_.has(factory.collection, 'isValid') && ! factory.collection.isValid(result))
    throw new Error('Factory: Invalid Document (' + factory.collection._name + ') ' + EJSON.stringify(result), EJSON.stringify(factory.collection.errors(result)));

  result._id = Random.id();
  return result;
};

Factory._create = function(name, doc) {
  var collection = Factory.get(name).collection;
  var insertId = collection.insert(doc);
  var record = collection.findOne(insertId);
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

var factories = {};

Factory = function(name, collection, attributes) {
  this.name = name;
  this.collection = collection;
  this.attributes = attributes;
  this.afterHooks = [];
};

Factory.define = function(name, collection, attributes) {
  factories[name] = new Factory(name, collection, attributes);
};

Factory.get = function(name) {
  return factories[name];
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

      // if an object is passed in, traverse deeper into it
      } else if (_.isObject(value) && !_.isArray(value)) {
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
    throw new Meteor.Error('Factory: Invalid Document (' + factory.collection._name + ') ' + EJSON.stringify(result), EJSON.stringify(factory.collection.errors(result)));

  result._id = Random.id();
  return result;
};

Factory._create = function(factoryName, doc) {
  var collection = Factory.get(factoryName).collection;
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

// XXX: Fix these!
Factory.prototype.extend = function(attributes) {
  var newFactory = new Factory(this.collection, _.extend(EJSON.clone(this.attributes), attributes));
  newFactory.afterHooks = [].concat(this.afterHooks);

  return newFactory;
};

Factory.prototype.after = function(fn) {
  this.afterHooks.push(fn);
  return this;
};

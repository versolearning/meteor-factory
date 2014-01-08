Factory = function(collection, attributes) {
  this.collection = collection;
  this.attributes = attributes;
  this.afterHooks = [];
};

Factory.prototype.build = function(attributes) {
  var self = this;
  var base = {};

  if (typeof attributes === 'undefined')
    attributes = {};

  if (_.has(this.collection, 'init'))
    base = this.collection.init();

  // "raw" attributes without functions evaluated, or dotted properties resolved
  attributes = _.extend(base, this.attributes, attributes);

  var result = {};
  var walk = function(record, object) {
    _.each(object, function(value, key) {
      if (_.isFunction(value)) {
        value = value.call(result);
      }
      if (_.isObject(value) && !_.isArray(value)) {
        record[key] = record[key] || {};
        return walk(record[key], value);
      }

      var parts = key.split('.');
      var target = LocalCollection._findModTarget(record, parts);
      field = parts.pop();
      target[field] = EJSON.clone(value);
    });
  };

  walk(result, attributes);

  if (_.has(this.collection, 'isValid') && ! this.collection.isValid(result))
    throw new Meteor.Error('Factory: Invalid Document (' + this.collection._name + ') ' + EJSON.stringify(result), EJSON.stringify(this.collection.errors(result)));

  return result;
};

Factory.prototype.create = function(attributes) {
  var build = this.build(attributes);
  var insertId = this.collection.insert(build);
  var record = this.collection.findOne(insertId);

  _.each(this.afterHooks, function(cb) {
    cb(record);
  });

  return record;
};

Factory.prototype.extend = function(attributes) {
  var newFactory = new Factory(this.collection, _.extend(EJSON.clone(this.attributes), attributes));
  newFactory.afterHooks = [].concat(this.afterHooks);

  return newFactory;
};

Factory.prototype.after = function(fn) {
  this.afterHooks.push(fn);
  return this;
};

Factories = {};

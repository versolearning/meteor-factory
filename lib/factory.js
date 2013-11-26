Factory = function(collection, attributes) {
  this.collection = collection;
  this.attributes = attributes;
  this.afterHooks = [];
};

Factory.prototype.build = function(attributes) {
  if (typeof attributes === 'undefined')
    attributes = {};

  _.each(_.extend(this.attributes, attributes), function(value, key) {
    if (_.isFunction(value))
      attributes[key] = value();
    else
      attributes[key] = value;
  });

  return attributes;
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

Factory.prototype.after = function(fn) {
  this.afterHooks.push(fn);
  return this;
};

Factories = {};

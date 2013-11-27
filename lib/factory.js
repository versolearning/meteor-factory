Factory = function(collection, attributes) {
  this.collection = collection;
  this.attributes = attributes;
  this.afterHooks = [];
};

Factory.prototype.build = function(attributes) {
  var base = {};

  if (typeof attributes === 'undefined')
    attributes = {};

  if (_.has(this.collection, 'init'))
    base = this.collection.init();

  _.each(_.extend(base, this.attributes, attributes), function(value, key) {
    if (_.isFunction(value))
      attributes[key] = value();
    else
      attributes[key] = value;
  });

  if (_.has(this.collection, 'isValid') && ! this.collection.isValid(attributes))
    throw new Meteor.Error('Factory: Invalid Document (' + this.collection._name + ') ' + EJSON.stringify(attributes), EJSON.stringify(this.collection.errors(attributes)));

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

Factory.prototype.extend = function(attributes) {
  var newFactory = new Factory(this.collection, _.extend(this.attributes, attributes));
  newFactory.afterHooks = [].concat(this.afterHooks);

  return newFactory;
};

Factory.prototype.after = function(fn) {
  this.afterHooks.push(fn);
  return this;
};

Factories = {};

/* global LocalCollection */
/* global Factory:true */

const factories = {};

Factory = class Factory {
  constructor(name, collection, attributes) {
    this.name = name;
    this.collection = collection;
    this.attributes = attributes;
    this.afterHooks = [];
    this.sequence = 0;
  }

  after(fn) {
    this.afterHooks.push(fn);
    return this;
  }
};

Factory.define = (name, collection, attributes) => {
  factories[name] = new Factory(name, collection, attributes);
  return factories[name];
};

Factory.get = (name) => {
  const factory = factories[name];
  if (!factory) {
    throw new Error("Factory: There is no factory named " + name);
  }
  return factory;
};

Factory._build = async (
  name,
  attributes = {},
  userOptions = {},
  options = {}
) => {
  // console.log("+++++Factory+being build", {
  //   name,
  //   attributes,
  //   userOptions,
  //   options,
  // });
  const factory = Factory.get(name);
  const result = {};

  // "raw" attributes without functions evaluated, or dotted properties resolved
  const extendedAttributes = _.extend({}, factory.attributes, attributes);

  // console.log("extendedAttributes", extendedAttributes);

  // either create a new factory and return its _id
  // or return a 'fake' _id (since we're not inserting anything)
  const makeRelation = async (relName) => {
    if (options.insert) {
      return await Factory.create(relName, {}, userOptions)._id;
    }
    if (options.tree) {
      return await Factory._build(relName, {}, userOptions, { tree: true });
    }
    // fake an id on build
    return Random.id();
  };

  const getValue = async (value) => {
    return value instanceof Factory ? await makeRelation(value.name) : value;
  };

  const getValueFromFunction = async (func) => {
    const api = { sequence: (fn) => fn(factory.sequence) };
    const fnRes = func.call(result, api, userOptions);
    return await getValue(fnRes);
  };

  factory.sequence += 1;

  const walk = async (record, object) => {
    await Promise.all(
      Object.keys(object).map(async (key) => {
        const value = object[key];
        let newValue = value;
        // is this a Factory instance?
        if (value instanceof Factory) {
          newValue = await makeRelation(value.name);
        } else if (Array.isArray(value)) {
          newValue = await Promise.all(
            value.map(async (element) => {
              if (typeof element === "function") {
                return await getValueFromFunction(element);
              }
              return await getValue(element);
            })
          );
          // console.log("value/newValue", value, newValue);
        } else if (typeof value === "function") {
          newValue = await getValueFromFunction(value);
          // if an object literal is passed in, traverse deeper into it
        } else if (
          Object.prototype.toString.call(value) === "[object Object]"
        ) {
          record[key] = record[key] || {};
          return await walk(record[key], value);
        }

        const modifier = { $set: {} };

        if (key !== "_id") {
          modifier.$set[key] = newValue;
        }

        LocalCollection._modify(record, modifier);
      })
    );
  };
  // console.log("before walk result", result);
  await walk(result, extendedAttributes);
  // console.log("after walk result", result);

  if (!options.tree) {
    result._id = extendedAttributes._id || Random.id();
  }
  return result;
};

Factory.build = async (name, attributes = {}, userOptions = {}) => {
  return await Factory._build(name, attributes, userOptions);
};

Factory.tree = async (name, attributes, userOptions = {}) => {
  return await Factory._build(name, attributes, userOptions, { tree: true });
};

Factory._create = async (name, doc) => {
  const collection = Factory.get(name).collection;
  const insertId = await collection.insertAsync(doc);
  const record = await collection.findOneAsync(insertId);
  return record;
};

Factory.create = async (name, attributes = {}, userOptions = {}) => {
  const doc = await Factory._build(name, attributes, userOptions, {
    insert: true,
  });
  // console.log("+++++Factory+built record", doc);
  const record = await Factory._create(name, doc);
  // console.log("+++++Factory+created record", record);
  await Promise.all(
    Factory.get(name).afterHooks.map(async (cb) => {
      return await cb(record);
    })
  );

  return record;
};

Factory.extend = (name, attributes = {}) => {
  return _.extend(_.clone(Factory.get(name).attributes), attributes);
};

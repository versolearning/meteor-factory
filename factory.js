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

Factory._build = (name, attributes = {}, userOptions = {}, options = {}) => {
  const factory = Factory.get(name);
  const result = {};

  // "raw" attributes without functions evaluated, or dotted properties resolved
  const extendedAttributes = _.extend({}, factory.attributes, attributes);

  // either create a new factory and return its _id
  // or return a 'fake' _id (since we're not inserting anything)
  const makeRelation = (relName) => {
    if (options.insert) {
      return Factory.create(relName, {}, userOptions)._id;
    }
    if (options.tree) {
      return Factory._build(relName, {}, userOptions, { tree: true });
    }
    // fake an id on build
    return Random.id();
  };

  const getValue = (value) => {
    return value instanceof Factory ? makeRelation(value.name) : value;
  };

  const getValueFromFunction = (func) => {
    const api = { sequence: (fn) => fn(factory.sequence) };
    const fnRes = func.call(result, api, userOptions);
    return getValue(fnRes);
  };

  factory.sequence += 1;

  const walk = (record, object, parentKey) => {
    console.log('parentKey:', parentKey);
    Object.keys(object).forEach((key) => {
      const value = object[key];
      let newValue = value;

      // is this a Factory instance?
      if (value instanceof Factory) {
        newValue = makeRelation(value.name);
      } else if (_.isArray(value)) {
        newValue = value.map((element) => {
          if (typeof element === "function") {
            return getValueFromFunction(element);
          }
          return getValue(element);
        });
      } else if (typeof value === "function") {
        newValue = getValueFromFunction(value);
        // if an object literal is passed in, traverse deeper into it
      } else if (Object.prototype.toString.call(value) === "[object Object]") {
        const finalKey = parentKey ? `${parentKey}.${key}` : key;
        return walk(record, value, finalKey);
      }

      const modifier = { $set: {} };

      if (key !== "_id" || parentKey) {
        const finalKey = parentKey ? `${parentKey}.${key}` : key;
        const modifierKey = finalKey;
        modifier.$set[modifierKey] = newValue;
      }

      LocalCollection._modify(record, modifier);
    });
  };

  walk(result, extendedAttributes);

  if (!options.tree) {
    result._id = extendedAttributes._id || Random.id();
  }
  return result;
};

Factory._buildAsync = async (
  name,
  attributes = {},
  userOptions = {},
  options = {}
) => {
  const factory = Factory.get(name);
  const result = {};

  // "raw" attributes without functions evaluated, or dotted properties resolved
  const extendedAttributes = _.extend({}, factory.attributes, attributes);

  // either create a new factory and return its _id
  // or return a 'fake' _id (since we're not inserting anything)
  const makeRelation = async (relName) => {
    if (options.insert) {
      return await Factory.createAsync(relName, {}, userOptions)._id;
    }
    if (options.tree) {
      return await Factory._buildAsync(relName, {}, userOptions, {
        tree: true,
      });
    }
    // fake an id on build
    return Random.id();
  };

  const getValue = async (value) => {
    return value instanceof Factory ? await makeRelation(value.name) : value;
  };

  const getValueFromFunction = async (func) => {
    const api = { sequence: (fn) => fn(factory.sequence) };
    const fnRes = await func.call(result, api, userOptions);
    return await getValue(fnRes);
  };

  factory.sequence += 1;

  const walk = async (record, object, parentKey) => {
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
        } else if (typeof value === "function") {
          newValue = await getValueFromFunction(value);
          // if an object literal is passed in, traverse deeper into it
        } else if (
          Object.prototype.toString.call(value) === "[object Object]"
        ) {
          const finalKey = parentKey ? `${parentKey}.${key}` : key;
          return await walk(record, value, finalKey);
        }

        const modifier = { $set: {} };

        if (key !== "_id" || parentKey) {
          const modifierKey = parentKey ? `${parentKey}.${key}` : key;
          modifier.$set[modifierKey] = newValue;
        }

        LocalCollection._modify(record, modifier);
      })
    );
  };
  await walk(result, extendedAttributes);

  if (!options.tree) {
    result._id = extendedAttributes._id || Random.id();
  }
  return result;
};

Factory.build = (name, attributes = {}, userOptions = {}) => {
  return Factory._build(name, attributes, userOptions);
};

Factory.buildAsync = async (name, attributes = {}, userOptions = {}) => {
  return await Factory._buildAsync(name, attributes, userOptions);
};

Factory.tree = (name, attributes, userOptions = {}) => {
  return Factory._build(name, attributes, userOptions, { tree: true });
};

Factory.treeAsync = async (name, attributes, userOptions = {}) => {
  return await Factory._buildAsync(name, attributes, userOptions, {
    tree: true,
  });
};

Factory._create = (name, doc) => {
  const collection = Factory.get(name).collection;
  const insertId = collection.insert(doc);
  const record = collection.findOne(insertId);
  return record;
};

Factory._createAsync = async (name, doc) => {
  const collection = Factory.get(name).collection;
  const insertId = await collection.insertAsync(doc);
  const record = await collection.findOneAsync(insertId);
  return record;
};

Factory.create = (name, attributes = {}, userOptions = {}) => {
  const doc = Factory._build(name, attributes, userOptions, { insert: true });
  const record = Factory._create(name, doc);

  Factory.get(name).afterHooks.forEach((cb) => cb(record));

  if (Factory.get(name).afterHooks.length) {
    return Factory.get(name).collection.findOne(record._id);
  }

  return record;
};

Factory.createAsync = async (name, attributes = {}, userOptions = {}) => {
  const doc = await Factory._buildAsync(name, attributes, userOptions, {
    insert: true,
  });
  const record = await Factory._createAsync(name, doc);
  await Promise.all(
    Factory.get(name).afterHooks.map(async (cb) => {
      return await cb(record);
    })
  );

  if (Factory.get(name).afterHooks.length) {
    return Factory.get(name).collection.findOneAsync(record._id);
  }

  return record;
};

Factory.extend = (name, attributes = {}) => {
  return _.extend(_.clone(Factory.get(name).attributes), attributes);
};

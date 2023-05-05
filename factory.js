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

  // "raw" attributes without functions evaluated, or dotted properties resolved
  const extendedAttributes = { ...factory.attributes, ...attributes };

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

  factory.sequence += 1;

  const build = (object) => {
    const result = {};

    const resolve = (value) => {
      if (value instanceof Factory) {
        return makeRelation(value.name);
      } else if (Array.isArray(value)) {
        return value.map((entity) => {
          return resolve(entity);
        });
      } else if (typeof value === "function") {
        const api = { sequence: (fn) => fn(factory.sequence) };
        const fnRes = value.call(extendedAttributes, api, userOptions);
        return resolve(fnRes);
        // if an object literal is passed in, traverse deeper into it
      } else if (Object.prototype.toString.call(value) === "[object Object]") {
        return build(value);
      }

      return value;
    };

    for (const key in object) {
      result[key] = resolve(object[key]);

      if (key !== "_id") {
        // resolve dotted properties
        const modifier = { $set: {} };
        modifier.$set[key] = result[key];
        LocalCollection._modify(result, modifier);
      }
    }

    return result;
  };

  const result = build(extendedAttributes);

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

  // "raw" attributes without functions evaluated, or dotted properties resolved
  const extendedAttributes = { ...factory.attributes, ...attributes };

  // either create a new factory and return its _id
  // or return a 'fake' _id (since we're not inserting anything)
  const makeRelation = async (relName) => {
    if (options.insert) {
      const doc = await Factory.createAsync(relName, {}, userOptions);
      return doc._id;
    }
    if (options.tree) {
      return await Factory._buildAsync(relName, {}, userOptions, {
        tree: true,
      });
    }
    // fake an id on build
    return Random.id();
  };

  factory.sequence += 1;

  const build = async (object) => {
    const result = {};

    const resolve = async (value) => {
      if (value instanceof Factory) {
        return makeRelation(value.name);
      } else if (Array.isArray(value)) {
        return Promise.all(
          value.map(async (entity) => {
            return resolve(entity);
          })
        );
      } else if (typeof value === "function") {
        const api = { sequence: (fn) => fn(factory.sequence) };
        const fnRes = value.call(extendedAttributes, api, userOptions);
        return resolve(fnRes);
        // if an object literal is passed in, traverse deeper into it
      } else if (Object.prototype.toString.call(value) === "[object Object]") {
        return build(value);
      }

      return value;
    };

    for (const key in object) {
      result[key] = await resolve(object[key]);

      if (key !== "_id") {
        // resolve dotted properties
        const modifier = { $set: {} };
        modifier.$set[key] = result[key];
        LocalCollection._modify(result, modifier);
      }
    }

    return result;
  };

  const result = await build(extendedAttributes);

  if (!options.tree) {
    result._id = extendedAttributes._id || Random.id();
  }

  return result;
};

Factory.build = (name, attributes = {}, userOptions = {}) => {
  return Factory._build(name, attributes, userOptions);
};

Factory.buildAsync = async (name, attributes = {}, userOptions = {}) => {
  return Factory._buildAsync(name, attributes, userOptions);
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
    Factory.get(name).afterHooks.map((cb) => {
      return cb(record);
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

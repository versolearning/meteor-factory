# Meteor Factory

A package for creating test data or for generating fixtures.

## Installation

```sh
$ meteor add dburles:factory
```

## Table of Contents

- [Examples](https://github.com/versolearning/meteor-factory#examples)
  - [Defining factories](https://github.com/versolearning/meteor-factory#defining-factories)
  - [Creating documents](https://github.com/versolearning/meteor-factory#creating-documents)
- [API](https://github.com/versolearning/meteor-factory#api)
  - [define](https://github.com/versolearning/meteor-factory#define)
  - [get](https://github.com/versolearning/meteor-factory#get)
  - [build](https://github.com/versolearning/meteor-factory#build)
  - [buildAsync](https://github.com/versolearning/meteor-factory#buildasync)
  - [tree](https://github.com/versolearning/meteor-factory#tree)
  - [treeAsync](https://github.com/versolearning/meteor-factory#treeasync)
  - [create](https://github.com/versolearning/meteor-factory#create)
  - [createAsync](https://github.com/versolearning/meteor-factory#createasync)
  - [extend](https://github.com/versolearning/meteor-factory#extend)
- [Contributing](https://github.com/versolearning/meteor-factory#contributing)
- [Other](https://github.com/versolearning/meteor-factory#other)

## Examples

### Defining factories

```javascript
Authors = new Meteor.Collection("authors");
Books = new Meteor.Collection("books");

Factory.define("author", Authors, {
  name: "John Smith",
}).after((author) => {
  // Do something smart
});

Factory.define("book", Books, {
  authorId: Factory.get("author"),
  name: "A book",
  year() {
    return _.random(1900, 2014);
  },
});

// We can also extend from an existing factory
Factory.define(
  "anotherBook",
  Books,
  Factory.extend("book", {
    // ...
  })
);
```

### Creating documents

```javascript
// Ex. 1: Inserts a new book into the books collection
const book = Factory.create("book");

// Ex. 2: New fields can be added or overwritten
const book = Factory.create("book", { name: "A better book" });
```

## API

Note: When calling `Factory.create('book')` both the Book _and_ an Author are created. The newly created Author `_id` will then be automatically assigned to that field. In the case of calling `Factory.build('book')` as no insert operations are run, the `_id` will be faked.

### define

`Factory.define('name', Collection, doc).after(doc => { ... })`

- name
  - A name for this factory
- Collection
  - A meteor collection
- doc
  - Document object
- _.after_ hook (Optional)
  - Returns the newly inserted document after calling `Factory.create`

### get

`Factory.get('name')`

Returns the instance of _name_. Typical usage is to specify a relationship between collections as seen in the Book example above.

### build

`Factory.build('name', doc)`

Builds the data structure for this factory

- name
  - The name defined for this factory
- doc (Optional)
  - Document object

### buildAsync

Asynchronous version of [build](https://github.com/versolearning/meteor-factory#build). Returns a Promise.

### tree

`Factory.tree('name', doc)`

Builds an object tree without `_id` fields. Useful for generating data for templates.

- name
  - The name define for this factory
- doc (Optional)
  - Document object

Example:

```js
Factory.define("author", Authors, {
  name: "John Smith",
});

Factory.define("book", Books, {
  name: "A book",
  author: Factory.get("author"),
});

const book = Factory.tree("book");
```

`book` then equals:

```
{
  name: 'A book',
  author: {
    name: 'John Smith'
  }
}
```

### treeAsync

Asynchronous version of [tree](https://github.com/versolearning/meteor-factory#tree). Returns a Promise.

### create

`Factory.create('name', doc)`

Creates (inserts) this factory into mongodb

- name
  - The name defined for this factory
- doc (Optional)

  - Document object

### createAsync

Asynchronous version of [create](https://github.com/versolearning/meteor-factory#create). Returns a Promise.

### extend

`Factory.extend('name', doc)`

Extend from an existing factory

- name
  - The name defined for this factory
- doc (Optional)
  - Document object

## Contributing

### Testing

Please submit new pull requests with tests if applicable. To run the test suite, run the following command:

```sh
$ meteor test-packages ./
```

Then open a browser at `localhost:3000` (by default).

## Other

**Fake** makes a great companion package. See https://atmospherejs.com/anti/fake

## License

MIT. (c) Percolate Studio

factory was developed as part of the [Verso](http://versoapp.com) project.

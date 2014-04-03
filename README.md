# meteor-factory

A factory package that simplifies the creation of data for tests or for generating fixtures.

## Examples

### Defining factories

```javascript
Authors = new Meteor.Collection('authors');
Books = new Meteor.Collection('books');

Factory.define('author', Authors, {
  name: 'John Smith'
}).after(function(author) {
  // Do something smart
});

Factory.define('book', Books, {
  authorId: Factory.get('author'),
  name: 'A book',
  year: function() { return _.random(1900, 2014); }
});

// We can also extend from an existing factory
Factory.define('anotherBook', Books, Factory.extend('book', {
  // ...
}));
```

### Creating documents

```javascript
// Inserts a new book into the books collection
var book = Factory.create('book');

// New fields can be added or overwritten
var book = Factory.create('book', { name: 'A better book' });
```

## API

#### Factory.define('*myFactory*', *Collection*, *doc*)*.after(function(doc) { ... })*

- myFactory
  - A name for this factory
- Collection
  - A meteor collection
- doc
  - Document object
- *.after* hook (Optional)
  - Returns the newly inserted document

#### Factory.get('*myFactory*')

Returns the instance of *myFactory*

#### Factory.build('*myFactory*', *doc*)

Builds the data structure for this factory

- myFactory
  - The name defined for this factory
- doc (Optional)
  - Document object

#### Factory.create('*myFactory*', *doc*)

Creates (inserts) this factory into mongodb

- myFactory
  - The name defined for this factory
- doc (Optional)
  - Document object

#### Factory.extend('*myFactory*', *doc*)

Extend from an existing factory

- myFactory
  - The name defined for this factory
- doc (Optional)
  - Document object

## License 

MIT. (c) Percolate Studio

factory was developed as part of the [Verso](http://versoapp.com) project.

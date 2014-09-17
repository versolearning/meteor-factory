# meteor-factory

A package for creating test data or for generating fixtures.

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

#### Factory.define('*name*', *Collection*, *doc*)*.after(function(doc) { ... })*

- name
  - A name for this factory
- Collection
  - A meteor collection
- doc
  - Document object
- *.after* hook (Optional)
  - Returns the newly inserted document

#### Factory.get('*name*')

Returns the instance of *name*

#### Factory.build('*name*', *doc*)

Builds the data structure for this factory

- name
  - The name defined for this factory
- doc (Optional)
  - Document object

#### Factory.create('*name*', *doc*)

Creates (inserts) this factory into mongodb

- name
  - The name defined for this factory
- doc (Optional)
  - Document object

#### Factory.extend('*name*', *doc*)

Extend from an existing factory

- name
  - The name defined for this factory
- doc (Optional)
  - Document object

## More

**Fake** makes a great companion package. See https://atmospherejs.com/anti/fake

## License 

MIT. (c) Percolate Studio

factory was developed as part of the [Verso](http://versoapp.com) project.

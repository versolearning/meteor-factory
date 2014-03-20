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
```

### Creating documents

```javascript
// Inserts a new book into the books collection
var book = Factory('book').create();

// New fields can be added or overwritten
var book = Factory('book').create({ name: 'A better book' });
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

#### Factory('*myFactory*').get()

Returns the instance of *myFactory*

#### Factory('*myFactory*').build(*doc*)

Builds the data structure for this factory

- myFactory
  - The name defined for this factory
- doc (Optional)
  - Document object

#### Factory('*myFactory*').create(*doc*)

Creates (inserts) this factory into mongodb

- myFactory
  - The name defined for this factory
- doc (Optional)
  - Document object

## License

MIT
# meteor-factory

A simple factory package that simplifies the creation of data for tests or generating fixtures.

## Examples

### Defining factories

```javascript
Authors = new Meteor.Collection('authors');
Books = new Meteor.Collection('books');

Factories.author = new Factory(Authors, {
  name: 'John Smith'
}).after(function(author) {
  // Do something smart
});

Factories.book = new Factory(Books, {
  authorId: function() { return Factories.author.create()._id; },
  name: 'A book',
  year: function() { return _.random(1900, 2014); }
});
```

### Creating documents

```javascript
// Inserts a new book into the books collection
var book = Factories.book.create();

// New fields can be added or overwritten
var book = Factories.book.create({ name: 'A better book' });
```

## API

#### Factories.*myFactory* = new Factory(*Collection*, *doc*)*.after(function(doc) { ... })*

- myFactory
  - A name for this factory
- Collection
  - A meteor collection
- doc
  - Document object
- *.after* hook (Optional)
  - Returns the newly inserted document

#### Factories.*myFactory*.create(*doc*)

- myFactory
  - The name defined for this factory
- doc (Optional)
  - Document object

## Future

This package is very much a work in progress, some planned features are
  - Better way to define relations

// TODO: these tests currently run on both the client and server
// ideally we should have some distinction between them here

Authors = new Meteor.Collection('authors');
Books = new Meteor.Collection('books');

Tinytest.add("Factory - Build - Basic build works", function(test) {
  Factory.define('author', Authors, {
    name: 'John Smith'
  });

  test.equal(Factory.build('author').name, 'John Smith');
});

Tinytest.add("Factory - Build - Functions - Basic", function(test) {
  Factory.define('author', Authors, {
    name: function() { return 'John Smith'; }
  });

  test.equal(Factory.build('author').name, 'John Smith');
});

Tinytest.add("Factory - Build - Functions - Context", function(test) {
  Factory.define('author', Authors, {
    test: 'John Smith',
    name: function() { return this.test; }
  });

  test.equal(Factory.build('author').name, 'John Smith');
});

Tinytest.add("Factory - Build - Dotted properties - Basic", function(test) {
  Factory.define('author', Authors, {
    'profile.name': 'John Smith'
  });

  test.equal(Factory.build('author').profile.name, 'John Smith');
});

Tinytest.add("Factory - Build - Dotted properties - Context", function(test) {
  Factory.define('author', Authors, {
    name: 'John Smith',
    'profile.name': function() { return this.name; }
  });

  test.equal(Factory.build('author').profile.name, 'John Smith');
});

Tinytest.add("Factory - Build - Deep objects", function(test) {
  Factory.define('author', Authors, {
    profile: {
      name: 'John Smith'
    }
  });

  test.equal(Factory.build('author').profile.name, 'John Smith');
});

Tinytest.add("Factory - Build - Functions - Deep object - Basic", function(test) {
  Factory.define('author', Authors, {
    profile: {
      name: function() { return 'John Smith'; }
    }
  });

  test.equal(Factory.build('author').profile.name, 'John Smith');
});

Tinytest.add("Factory - Build - Functions - Deep object - Context", function(test) {
  Factory.define('author', Authors, {
    name: 'John Smith',
    profile: {
      name: function() { return this.name; }
    }
  });

  test.equal(Factory.build('author').profile.name, 'John Smith');
});

Tinytest.add("Factory - Build - Extend - Basic", function(test) {
  Factory.define('author', Authors, {
    name: 'John Smith'
  });

  Factory.define('authorOne', Books, Factory.extend('author'));

  test.equal(Factory.build('authorOne').name, 'John Smith');
});

Tinytest.add("Factory - Build - Extend - With attributes", function(test) {
  Factory.define('author', Authors, {
    name: 'John Smith'
  });

  Factory.define('authorOne', Books, Factory.extend('author', {
    test: 'testing!'
  }));

  test.equal(Factory.build('authorOne').name, 'John Smith');
  test.equal(Factory.build('authorOne').test, 'testing!');
});

Tinytest.add("Factory - Build - Extend - With attributes (check that we don't modify the parent)", function(test) {
  Factory.define('author', Authors, {
    name: 'John Smith'
  });

  Factory.define('authorOne', Books, Factory.extend('author', {
    test: 'testing!'
  }));

  var authorOne = Factory.build('authorOne');
  var author = Factory.build('author');

  test.equal(authorOne.name, 'John Smith');
  test.equal(authorOne.test, 'testing!');
  test.equal(author.test, undefined);
});

Tinytest.add("Factory - Create - Relationship", function(test) {
  Factory.define('author', Authors, {
    name: 'John Smith'
  });

  Factory.define('book', Books, {
    authorId: Factory.get('author'),
    name: 'A book',
    year: 2014
  });

  var book = Factory.create('book');

  test.equal(Authors.findOne(book.authorId).name, 'John Smith');
});

// TODO: test overriding properties (on build and create)
// TODO: more create tests, verify data integrity
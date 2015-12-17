/* global Factory */
/* global Authors:true, Books:true */

Authors = new Meteor.Collection('authors');
Books = new Meteor.Collection('books');

Tinytest.add("Factory - Build - Basic build works", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  test.equal(Factory.build('author').name, "John Smith");
});

Tinytest.add("Factory - Define - After hook", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  }).after(doc => {
    var author = Factory.create('author');
    test.equal(author.name, "John Smith");
    test.equal(doc.name, "John Smith");
  });
});

Tinytest.add("Factory - Build - Functions - Basic", test => {
  Factory.define('author', Authors, {
    name() {
      return "John Smith";
    }
  });

  test.equal(Factory.build('author').name, "John Smith");
});

Tinytest.add("Factory - Build - Functions - Context", test => {
  Factory.define('author', Authors, {
    test: "John Smith",
    name() {
      return this.test;
    }
  });

  test.equal(Factory.build('author').name, "John Smith");
});

Tinytest.add("Factory - Build - Dotted properties - Basic", test => {
  Factory.define('author', Authors, {
    "profile.name": "John Smith"
  });

  test.equal(Factory.build('author').profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Dotted properties - Context", test => {
  Factory.define('author', Authors, {
    name: "John Smith",
    'profile.name'() {
      return this.name;
    }
  });

  test.equal(Factory.build('author').profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Deep objects", test => {
  Factory.define('author', Authors, {
    profile: {
      name: "John Smith"
    }
  });

  test.equal(Factory.build('author').profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Functions - Deep object - Basic", test => {
  Factory.define('author', Authors, {
    profile: {
      name() {
        return "John Smith";
      }
    }
  });

  test.equal(Factory.build('author').profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Functions - Deep object - Context", test => {
  Factory.define('author', Authors, {
    name: "John Smith",
    profile: {
      name() {
        return this.name;
      }
    }
  });

  test.equal(Factory.build('author').profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Extend - Basic", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('authorOne', Authors, Factory.extend('author'));

  test.equal(Factory.build('authorOne').name, "John Smith");
});

Tinytest.add("Factory - Build - Extend - With attributes", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('authorOne', Authors, Factory.extend('author', {
    test: "testing!"
  }));

  test.equal(Factory.build('authorOne').name, "John Smith");
  test.equal(Factory.build('authorOne').test, "testing!");
});

Tinytest.add("Factory - Build - Extend - With attributes (check that we don't modify the parent)", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('authorOne', Books, Factory.extend('author', {
    test: "testing!"
  }));

  var authorOne = Factory.build('authorOne');
  var author = Factory.build('author');

  test.equal(authorOne.name, "John Smith");
  test.equal(authorOne.test, "testing!");
  test.equal(_.isUndefined(author.test), true);
});

Tinytest.add("Factory - Build - Extend - Parent with relationship", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    authorId: Factory.get('author'),
    name: "A book",
    year: 2014
  });

  Factory.define('bookOne', Books, Factory.extend('book'));

  var bookOne = Factory.create('bookOne');

  test.equal(bookOne.name, "A book");
});

Tinytest.add("Factory - Build - Extend - Parent with relationship - Extra attributes", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    authorId: Factory.get('author'),
    name: "A book",
    year: 2014
  });

  Factory.define('bookOne', Books, Factory.extend('book', {
    name: "A better book"
  }));

  var bookOne = Factory.create('bookOne');

  test.equal(bookOne.name, "A better book");
  // same year as parent
  test.equal(bookOne.year, 2014);
});

Tinytest.add("Factory - Create - Basic", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  var author = Factory.create('author');

  test.equal(author.name, "John Smith");
});

Tinytest.add("Factory - Create - Relationship", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    authorId: Factory.get('author'),
    name: "A book",
    year: 2014
  });

  var book = Factory.create('book');

  test.equal(Authors.findOne(book.authorId).name, "John Smith");
});

Tinytest.add("Factory - Create - Relationship - return a Factory from function", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    authorId() {
      return Factory.get('author');
    },
    name: "A book",
    year: 2014
  });

  var book = Factory.create('book');

  test.equal(Authors.findOne(book.authorId).name, "John Smith");
});

Tinytest.add("Factory - Create - Relationship - return a Factory from deep function (dotted)", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    'good.authorId'() {
      return Factory.get('author');
    },
    name: "A book",
    year: 2014
  });

  var book = Factory.create('book');

  test.equal(Authors.findOne(book.good.authorId).name, "John Smith");
});

Tinytest.add("Factory - Create - Relationship - return a Factory from deep function", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    good: {
      authorId() {
        return Factory.get('author');
      }
    },
    name: "A book",
    year: 2014
  });

  var book = Factory.create('book');

  test.equal(Authors.findOne(book.good.authorId).name, "John Smith");
});

Tinytest.add("Factory - Build - Sequence", test => {
  Factory.define('author', Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence(n => 'person' + n + '@example.com');
    }
  });

  var author = Factory.build('author');
  test.equal(author.email, "person1@example.com");
  var author2 = Factory.build('author');
  test.equal(author2.email, "person2@example.com");
});

Tinytest.add("Factory - Create - Sequence", test => {
  Authors.remove({});

  Factory.define('author', Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence(n => 'person' + n + '@example.com');
    }
  });

  var author = Factory.create('author');
  test.equal(author.email, "person1@example.com");
  var foundAuthor = Authors.find({email: "person1@example.com"}).count();
  test.equal(foundAuthor, 1);

  var author2 = Factory.create('author');
  test.equal(author2.email, "person2@example.com");
  var foundAuthor2 = Authors.find({email: "person2@example.com"}).count();
  test.equal(foundAuthor2, 1);
});

Tinytest.add("Factory - Build - Array with Factory", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    authorIds: [Factory.get('author'), 'PXm6dye7A8vgoB7uY']
  });

  const book = Factory.build('book');

  test.length(book.authorIds, 2);
  test.length(book.authorIds[0], 17);
});

Tinytest.add("Factory - Build - Array with function returning a Factory", test => {
  Factory.define('author', Authors, {
    name: "John Smith"
  });

  Factory.define('book', Books, {
    authorIds: [() => Factory.get('author'), 'PXm6dye7A8vgoB7uY']
  });

  const book = Factory.build('book');

  test.length(book.authorIds, 2);
  test.length(book.authorIds[0], 17);
});


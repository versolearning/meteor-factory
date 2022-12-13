/* global Factory */
/* global Authors:true, Books:true */

Authors = new Meteor.Collection("authors");
Books = new Meteor.Collection("books");

/** TEST NONE ASYNC FUNCTIONS */
Tinytest.add("Factory - Build - Basic build works", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  test.equal(Factory.build("author").name, "John Smith");
});

Tinytest.add("Factory - Define - After hook", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  }).after((doc) => {
    var author = Factory.create("author");
    test.equal(author.name, "John Smith");
    test.equal(doc.name, "John Smith");
  });
});

Tinytest.add("Factory - Build - Functions - Basic", (test) => {
  Factory.define("author", Authors, {
    name() {
      return "John Smith";
    },
  });

  test.equal(Factory.build("author").name, "John Smith");
});

Tinytest.add("Factory - Build - Functions - Context", (test) => {
  Factory.define("author", Authors, {
    test: "John Smith",
    name() {
      return this.test;
    },
  });

  test.equal(Factory.build("author").name, "John Smith");
});

Tinytest.add("Factory - Build - Dotted properties - Basic", (test) => {
  Factory.define("author", Authors, {
    "profile.name": "John Smith",
  });

  test.equal(Factory.build("author").profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Dotted properties - Context", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    "profile.name"() {
      return this.name;
    },
  });

  test.equal(Factory.build("author").profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Deep objects", (test) => {
  Factory.define("author", Authors, {
    profile: {
      name: "John Smith",
    },
  });

  test.equal(Factory.build("author").profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Functions - Deep object - Basic", (test) => {
  Factory.define("author", Authors, {
    profile: {
      name() {
        return "John Smith";
      },
    },
  });

  test.equal(Factory.build("author").profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Functions - Deep object - Context", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    profile: {
      name() {
        return this.name;
      },
    },
  });

  test.equal(Factory.build("author").profile.name, "John Smith");
});

Tinytest.add("Factory - Build - Extend - Basic", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("authorOne", Authors, Factory.extend("author"));

  test.equal(Factory.build("authorOne").name, "John Smith");
});

Tinytest.add("Factory - Build - Extend - With attributes", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define(
    "authorOne",
    Authors,
    Factory.extend("author", {
      test: "testing!",
    })
  );

  test.equal(Factory.build("authorOne").name, "John Smith");
  test.equal(Factory.build("authorOne").test, "testing!");
});

Tinytest.add(
  "Factory - Build - Extend - With attributes (check that we don't modify the parent)",
  (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define(
      "authorOne",
      Books,
      Factory.extend("author", {
        test: "testing!",
      })
    );

    var authorOne = Factory.build("authorOne");
    var author = Factory.build("author");

    test.equal(authorOne.name, "John Smith");
    test.equal(authorOne.test, "testing!");
    test.equal(_.isUndefined(author.test), true);
  }
);

Tinytest.add("Factory - Build - Extend - Parent with relationship", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("book", Books, {
    authorId: Factory.get("author"),
    name: "A book",
    year: 2014,
  });

  Factory.define("bookOne", Books, Factory.extend("book"));

  var bookOne = Factory.create("bookOne");

  test.equal(bookOne.name, "A book");
});

Tinytest.add(
  "Factory - Build - Extend - Parent with relationship - Extra attributes",
  (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorId: Factory.get("author"),
      name: "A book",
      year: 2014,
    });

    Factory.define(
      "bookOne",
      Books,
      Factory.extend("book", {
        name: "A better book",
      })
    );

    var bookOne = Factory.create("bookOne");

    test.equal(bookOne.name, "A better book");
    // same year as parent
    test.equal(bookOne.year, 2014);
  }
);

Tinytest.add("Factory - Create - Basic", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  var author = Factory.create("author");

  test.equal(author.name, "John Smith");
});

Tinytest.add("Factory - Create - Relationship", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("book", Books, {
    authorId: Factory.get("author"),
    name: "A book",
    year: 2014,
  });

  var book = Factory.create("book");

  test.equal(Authors.findOne(book.authorId).name, "John Smith");
});

Tinytest.add(
  "Factory - Create - Relationship - return a Factory from function",
  (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorId() {
        return Factory.get("author");
      },
      name: "A book",
      year: 2014,
    });

    var book = Factory.create("book");

    test.equal(Authors.findOne(book.authorId).name, "John Smith");
  }
);

Tinytest.add(
  "Factory - Create - Relationship - return a Factory from deep function (dotted)",
  (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      "good.authorId"() {
        return Factory.get("author");
      },
      name: "A book",
      year: 2014,
    });

    var book = Factory.create("book");

    test.equal(Authors.findOne(book.good.authorId).name, "John Smith");
  }
);

Tinytest.add(
  "Factory - Create - Relationship - return a Factory from deep function",
  (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      good: {
        authorId() {
          return Factory.get("author");
        },
      },
      name: "A book",
      year: 2014,
    });

    var book = Factory.create("book");

    test.equal(Authors.findOne(book.good.authorId).name, "John Smith");
  }
);

Tinytest.add("Factory - Build - Sequence", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence((n) => "person" + n + "@example.com");
    },
  });

  var author = Factory.build("author");
  test.equal(author.email, "person1@example.com");
  var author2 = Factory.build("author");
  test.equal(author2.email, "person2@example.com");
});

Tinytest.add("Factory - Create - Sequence", (test) => {
  Authors.remove({});

  Factory.define("author", Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence((n) => "person" + n + "@example.com");
    },
  });

  var author = Factory.create("author");
  test.equal(author.email, "person1@example.com");
  var foundAuthor = Authors.find({ email: "person1@example.com" }).count();
  test.equal(foundAuthor, 1);

  var author2 = Factory.create("author");
  test.equal(author2.email, "person2@example.com");
  var foundAuthor2 = Authors.find({ email: "person2@example.com" }).count();
  test.equal(foundAuthor2, 1);
});

Tinytest.add("Factory - Build - Array with Factory", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("book", Books, {
    authorIds: [Factory.get("author"), "PXm6dye7A8vgoB7uY"],
  });

  const book = Factory.build("book");

  test.length(book.authorIds, 2);
  test.length(book.authorIds[0], 17);
});

Tinytest.add(
  "Factory - Build - Array with function returning a Factory",
  (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorIds: [() => Factory.get("author"), "PXm6dye7A8vgoB7uY"],
    });

    const book = Factory.build("book");

    test.length(book.authorIds, 2);
    test.length(book.authorIds[0], 17);
  }
);

Tinytest.add("Factory - Build - Array with an object", (test) => {
  Factory.define("book", Books, {
    array: [{ objectInArray: true }],
  });

  const book = Factory.build("book");

  test.isTrue(book.array[0].objectInArray);
});

// Could possibly make this a feature:
// Tinytest.add("Factory - Build - Array with an object containing a function", test => {
//   Factory.define('book', Books, {
//     array: [{objectInArrayWithFn: () => true}]
//   });

//   const book = Factory.build('book');

//   test.equal(book.array[0].objectInArrayWithFn, true);
// });

Tinytest.add("Factory - Tree - Basic", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("book", Books, {
    name: "A book",
    author: Factory.get("author"),
  });

  const book = Factory.tree("book");

  test.equal(book.author.name, "John Smith");
});

Tinytest.add("Factory - Build - With options", (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    books(factory, options = { bookCount: 2 }) {
      return _(options.bookCount).times((n) => `${n + 1} book by ${this.name}`);
    },
  });

  const author = Factory.build("author", {}, { bookCount: 3 });

  test.length(author.books, 3);
  test.equal(author.books, [
    "1 book by John Smith",
    "2 book by John Smith",
    "3 book by John Smith",
  ]);
});

Tinytest.add("Factory - Create - With options", (test) => {
  Factory.define("book", Books, {
    name: "A book",
    pages(factory, options = { pageCount: 2 }) {
      return _(options.pageCount).times((n) => `Page ${n + 1}`);
    },
  });

  const book = Factory.create("book", {}, { pageCount: 2 });

  test.length(book.pages, 2);
  test.equal(book.pages, ["Page 1", "Page 2"]);
});

/** TEST ASYNC FUNCTIONS */
Tinytest.addAsync(
  "ASYNC - Factory - Build - Basic build works",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });
    const built = await Factory.buildAsync("author");

    test.equal(built.name, "John Smith");
  }
);

Tinytest.addAsync("ASYNC - Factory - Build - Sequence", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence((n) => "person" + n + "@example.com");
    },
  });

  var author = await Factory.buildAsync("author");
  test.equal(author.email, "person1@example.com");
  var author2 = await Factory.buildAsync("author");
  test.equal(author2.email, "person2@example.com");
});

Tinytest.addAsync(
  "ASYNC - Factory - Build - Array with Factory",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorIds: [Factory.get("author"), "PXm6dye7A8vgoB7uY"],
    });

    const book = await Factory.buildAsync("book");

    test.length(book.authorIds, 2);
    test.length(book.authorIds[0], 17);
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Array with function returning a Factory",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorIds: [() => Factory.get("author"), "PXm6dye7A8vgoB7uY"],
    });

    const book = await Factory.buildAsync("book");

    test.length(book.authorIds, 2);
    test.length(book.authorIds[0], 17);
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Array with an object",
  async (test) => {
    Factory.define("book", Books, {
      array: [{ objectInArray: true }],
    });

    const book = await Factory.buildAsync("book");

    test.isTrue(book.array[0].objectInArray);
  }
);

// Could possibly make this a feature:
// Tinytest.addAsync("Factory - Build - Array with an object containing a function", async test => {
//   Factory.define('book', Books, {
//     array: [{objectInArrayWithFn: () => true}]
//   });

//   const book = await Factory.buildAsync('book');

//   test.equal(book.array[0].objectInArrayWithFn, true);
// });

Tinytest.addAsync("ASYNC - Factory - Build - Deep objects", async (test) => {
  Factory.define("author", Authors, {
    profile: {
      name: "John Smith",
    },
  });
  const built = await Factory.buildAsync("author");

  test.equal(built.profile.name, "John Smith");
});

Tinytest.addAsync("ASYNC - Factory - Build - With options", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    books(factory, options = { bookCount: 2 }) {
      return _(options.bookCount).times((n) => `${n + 1} book by ${this.name}`);
    },
  });

  const author = await Factory.buildAsync("author", {}, { bookCount: 3 });

  test.length(author.books, 3);
  test.equal(author.books, [
    "1 book by John Smith",
    "2 book by John Smith",
    "3 book by John Smith",
  ]);
});

Tinytest.addAsync(
  "ASYNC - Factory - Build - Functions - Basic",
  async (test) => {
    Factory.define("author", Authors, {
      name() {
        return "John Smith";
      },
    });
    const built = await Factory.buildAsync("author");

    test.equal(built.name, "John Smith");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Functions - Context",
  async (test) => {
    Factory.define("author", Authors, {
      test: "John Smith",
      name() {
        return this.test;
      },
    });
    const built = await Factory.buildAsync("author");

    test.equal(built.name, "John Smith");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Functions - Deep object - Basic",
  async (test) => {
    Factory.define("author", Authors, {
      profile: {
        name() {
          return "John Smith";
        },
      },
    });
    const built = await Factory.buildAsync("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Functions - Deep object - Context",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
      profile: {
        name() {
          return this.name;
        },
      },
    });
    const built = await Factory.buildAsync("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Dotted properties - Basic",
  async (test) => {
    Factory.define("author", Authors, {
      "profile.name": "John Smith",
    });
    const built = await Factory.buildAsync("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Dotted properties - Context",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
      "profile.name"() {
        return this.name;
      },
    });
    const built = await Factory.buildAsync("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync("ASYNC - Factory - Build - Extend - Basic", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("authorOne", Authors, Factory.extend("author"));
  const built = await Factory.buildAsync("authorOne");

  test.equal(built.name, "John Smith");
});

Tinytest.addAsync(
  "ASYNC - Factory - Build - Extend - With attributes",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define(
      "authorOne",
      Authors,
      Factory.extend("author", {
        test: "testing!",
      })
    );
    const built = await Factory.buildAsync("authorOne");

    test.equal(built.name, "John Smith");
    test.equal(built.test, "testing!");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Extend - With attributes (check that we don't modify the parent)",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define(
      "authorOne",
      Books,
      Factory.extend("author", {
        test: "testing!",
      })
    );

    var authorOne = await Factory.buildAsync("authorOne");
    var author = await Factory.buildAsync("author");

    test.equal(authorOne.name, "John Smith");
    test.equal(authorOne.test, "testing!");
    test.equal(_.isUndefined(author.test), true);
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Extend - Parent with relationship",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorId: Factory.get("author"),
      name: "A book",
      year: 2014,
    });

    Factory.define("bookOne", Books, Factory.extend("book"));

    var bookOne = await Factory.createAsync("bookOne");

    test.equal(bookOne.name, "A book");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Build - Extend - Parent with relationship - Extra attributes",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorId: Factory.get("author"),
      name: "A book",
      year: 2014,
    });

    Factory.define(
      "bookOne",
      Books,
      Factory.extend("book", {
        name: "A better book",
      })
    );

    var bookOne = await Factory.createAsync("bookOne");

    test.equal(bookOne.name, "A better book");
    // same year as parent
    test.equal(bookOne.year, 2014);
  }
);

Tinytest.addAsync("ASYNC - Factory - Define - After hook", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  }).after(async (doc) => {
    var author = await Factory.createAsync("author");
    test.equal(author.name, "John Smith");
    test.equal(doc.name, "John Smith");
  });
});

Tinytest.addAsync("ASYNC - Factory - Create - Basic", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  var author = await Factory.createAsync("author");

  test.equal(author.name, "John Smith");
});

Tinytest.addAsync("ASYNC - Factory - Create - Relationship", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });
  const author = await Factory.createAsync("author");

  Factory.define("book", Books, {
    authorId: author._id,
    name: "A book",
    year: 2014,
  });

  const book = await Factory.createAsync("book");

  const foundAuthor = await Authors.findOneAsync(book.authorId);

  test.equal(foundAuthor.name, "John Smith");
});

Tinytest.addAsync("ASYNC - Factory - Create - Sequence", async (test) => {
  Authors.remove({});

  Factory.define("author", Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence((n) => "person" + n + "@example.com");
    },
  });

  var author = await Factory.createAsync("author");
  test.equal(author.email, "person1@example.com");
  var foundAuthor = Authors.find({ email: "person1@example.com" }).count();
  test.equal(foundAuthor, 1);

  var author2 = await Factory.createAsync("author");
  test.equal(author2.email, "person2@example.com");
  var foundAuthor2 = Authors.find({ email: "person2@example.com" }).count();
  test.equal(foundAuthor2, 1);
});

Tinytest.addAsync("ASYNC - Factory - Create - With options", async (test) => {
  Factory.define("book", Books, {
    name: "A book",
    pages(factory, options = { pageCount: 2 }) {
      return _(options.pageCount).times((n) => `Page ${n + 1}`);
    },
  });

  const book = await Factory.createAsync("book", {}, { pageCount: 2 });

  test.length(book.pages, 2);
  test.equal(book.pages, ["Page 1", "Page 2"]);
});

Tinytest.addAsync(
  "ASYNC - Factory - Create - Relationship - return a Factory from function",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });
    const author = await Factory.createAsync("author");

    Factory.define("book", Books, {
      authorId: async () => {
        return await Authors.findOneAsync(author._id);
      },
      name: "A book",
      year: 2014,
    });

    const book = await Factory.createAsync("book");
    const foundAuthor = await Authors.findOneAsync(book.authorId);

    test.equal(foundAuthor.name, "John Smith");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Create - Relationship - return a Factory from deep function (dotted)",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });
    const author = await Factory.createAsync("author");

    Factory.define("book", Books, {
      async "good.authorId"() {
        return await Authors.findOneAsync(author._id);
      },
      name: "A book",
      year: 2014,
    });

    const book = await Factory.createAsync("book");
    const foundAuthor = await Authors.findOneAsync(book.good.authorId);

    test.equal(foundAuthor.name, "John Smith");
  }
);

Tinytest.addAsync(
  "ASYNC - Factory - Create - Relationship - return a Factory from deep function",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });
    const author = await Factory.createAsync("author");

    Factory.define("book", Books, {
      good: {
        async authorId() {
          return (await Authors.findOneAsync(author._id))._id;
        },
      },
      name: "A book",
      year: 2014,
    });

    var book = await Factory.createAsync("book");
    const foundAuthor = await Authors.findOneAsync(book.good.authorId);

    test.equal(foundAuthor.name, "John Smith");
  }
);

Tinytest.addAsync("ASYNC - Factory - Tree - Basic", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("book", Books, {
    name: "A book",
    author: Factory.get("author"),
  });

  const book = await Factory.treeAsync("book");

  test.equal(book.author.name, "John Smith");
});

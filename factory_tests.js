/* global Factory */
/* global Authors:true, Books:true */

Authors = new Meteor.Collection("authors");
Books = new Meteor.Collection("books");

Tinytest.addAsync("Factory - Build - Basic build works", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });
  const built = await Factory.build("author");

  test.equal(built.name, "John Smith");
});

Tinytest.addAsync("Factory - Build - Sequence", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence((n) => "person" + n + "@example.com");
    },
  });

  var author = await Factory.build("author");
  test.equal(author.email, "person1@example.com");
  var author2 = await Factory.build("author");
  test.equal(author2.email, "person2@example.com");
});

Tinytest.addAsync("Factory - Build - Array with Factory", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("book", Books, {
    authorIds: [Factory.get("author"), "PXm6dye7A8vgoB7uY"],
  });

  const book = await Factory.build("book");

  test.length(book.authorIds, 2);
  test.length(book.authorIds[0], 17);
});

Tinytest.addAsync(
  "Factory - Build - Array with function returning a Factory",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });

    Factory.define("book", Books, {
      authorIds: [() => Factory.get("author"), "PXm6dye7A8vgoB7uY"],
    });

    const book = await Factory.build("book");

    test.length(book.authorIds, 2);
    test.length(book.authorIds[0], 17);
  }
);

Tinytest.addAsync("Factory - Build - Array with an object", async (test) => {
  Factory.define("book", Books, {
    array: [{ objectInArray: true }],
  });

  const book = await Factory.build("book");

  test.isTrue(book.array[0].objectInArray);
});

// Could possibly make this a feature:
// Tinytest.addAsync("Factory - Build - Array with an object containing a function", async test => {
//   Factory.define('book', Books, {
//     array: [{objectInArrayWithFn: () => true}]
//   });

//   const book = await Factory.build('book');

//   test.equal(book.array[0].objectInArrayWithFn, true);
// });

Tinytest.addAsync("Factory - Build - Deep objects", async (test) => {
  Factory.define("author", Authors, {
    profile: {
      name: "John Smith",
    },
  });
  const built = await Factory.build("author");

  test.equal(built.profile.name, "John Smith");
});

Tinytest.addAsync("Factory - Build - With options", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
    books(factory, options = { bookCount: 2 }) {
      return _(options.bookCount).times((n) => `${n + 1} book by ${this.name}`);
    },
  });

  const author = await Factory.build("author", {}, { bookCount: 3 });

  test.length(author.books, 3);
  test.equal(author.books, [
    "1 book by John Smith",
    "2 book by John Smith",
    "3 book by John Smith",
  ]);
});

Tinytest.addAsync("Factory - Build - Functions - Basic", async (test) => {
  Factory.define("author", Authors, {
    name() {
      return "John Smith";
    },
  });
  const built = await Factory.build("author");

  test.equal(built.name, "John Smith");
});

Tinytest.addAsync("Factory - Build - Functions - Context", async (test) => {
  Factory.define("author", Authors, {
    test: "John Smith",
    name() {
      return this.test;
    },
  });
  const built = await Factory.build("author");

  test.equal(built.name, "John Smith");
});

Tinytest.addAsync(
  "Factory - Build - Functions - Deep object - Basic",
  async (test) => {
    Factory.define("author", Authors, {
      profile: {
        name() {
          return "John Smith";
        },
      },
    });
    const built = await Factory.build("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync(
  "Factory - Build - Functions - Deep object - Context",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
      profile: {
        name() {
          return this.name;
        },
      },
    });
    const built = await Factory.build("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync(
  "Factory - Build - Dotted properties - Basic",
  async (test) => {
    Factory.define("author", Authors, {
      "profile.name": "John Smith",
    });
    const built = await Factory.build("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync(
  "Factory - Build - Dotted properties - Context",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
      "profile.name"() {
        return this.name;
      },
    });
    const built = await Factory.build("author");

    test.equal(built.profile.name, "John Smith");
  }
);

Tinytest.addAsync("Factory - Build - Extend - Basic", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("authorOne", Authors, Factory.extend("author"));
  const built = await Factory.build("authorOne");

  test.equal(built.name, "John Smith");
});

Tinytest.addAsync(
  "Factory - Build - Extend - With attributes",
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
    const built = await Factory.build("authorOne");

    test.equal(built.name, "John Smith");
    test.equal(built.test, "testing!");
  }
);

Tinytest.addAsync(
  "Factory - Build - Extend - With attributes (check that we don't modify the parent)",
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

    var authorOne = await Factory.build("authorOne");
    var author = await Factory.build("author");

    test.equal(authorOne.name, "John Smith");
    test.equal(authorOne.test, "testing!");
    test.equal(_.isUndefined(author.test), true);
  }
);

Tinytest.addAsync(
  "Factory - Build - Extend - Parent with relationship",
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

    var bookOne = await Factory.create("bookOne");

    test.equal(bookOne.name, "A book");
  }
);

Tinytest.addAsync(
  "Factory - Build - Extend - Parent with relationship - Extra attributes",
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

    var bookOne = await Factory.create("bookOne");

    test.equal(bookOne.name, "A better book");
    // same year as parent
    test.equal(bookOne.year, 2014);
  }
);

Tinytest.addAsync("Factory - Define - After hook", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  }).after(async (doc) => {
    var author = await Factory.create("author");
    test.equal(author.name, "John Smith");
    test.equal(doc.name, "John Smith");
  });
});

Tinytest.addAsync("Factory - Create - Basic", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  var author = await Factory.create("author");

  test.equal(author.name, "John Smith");
});

Tinytest.addAsync("Factory - Create - Relationship", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });
  const author = await Factory.create("author");

  Factory.define("book", Books, {
    authorId: author._id,
    name: "A book",
    year: 2014,
  });

  const book = await Factory.create("book");

  const foundAuthor = await Authors.findOneAsync(book.authorId);

  test.equal(foundAuthor.name, "John Smith");
});

Tinytest.addAsync("Factory - Create - Sequence", async (test) => {
  Authors.remove({});

  Factory.define("author", Authors, {
    name: "John Smith",
    email(factory) {
      return factory.sequence((n) => "person" + n + "@example.com");
    },
  });

  var author = await Factory.create("author");
  test.equal(author.email, "person1@example.com");
  var foundAuthor = Authors.find({ email: "person1@example.com" }).count();
  test.equal(foundAuthor, 1);

  var author2 = await Factory.create("author");
  test.equal(author2.email, "person2@example.com");
  var foundAuthor2 = Authors.find({ email: "person2@example.com" }).count();
  test.equal(foundAuthor2, 1);
});

Tinytest.addAsync("Factory - Create - With options", async (test) => {
  Factory.define("book", Books, {
    name: "A book",
    pages(factory, options = { pageCount: 2 }) {
      return _(options.pageCount).times((n) => `Page ${n + 1}`);
    },
  });

  const book = await Factory.create("book", {}, { pageCount: 2 });

  test.length(book.pages, 2);
  test.equal(book.pages, ["Page 1", "Page 2"]);
});

Tinytest.addAsync(
  "Factory - Create - Relationship - return a Factory from function",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });
    const author = await Factory.create("author");

    Factory.define("book", Books, {
      authorId: async () => {
        return await Authors.findOneAsync(author._id);
      },
      name: "A book",
      year: 2014,
    });

    const book = await Factory.create("book");
    const foundAuthor = await Authors.findOneAsync(book.authorId);

    test.equal(foundAuthor.name, "John Smith");
  }
);

Tinytest.addAsync(
  "Factory - Create - Relationship - return a Factory from deep function (dotted)",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });
    const author = await Factory.create("author");

    Factory.define("book", Books, {
      async "good.authorId"() {
        return await Authors.findOneAsync(author._id);
      },
      name: "A book",
      year: 2014,
    });

    const book = await Factory.create("book");
    const foundAuthor = await Authors.findOneAsync(book.good.authorId);

    test.equal(foundAuthor.name, "John Smith");
  }
);

Tinytest.addAsync(
  "Factory - Create - Relationship - return a Factory from deep function",
  async (test) => {
    Factory.define("author", Authors, {
      name: "John Smith",
    });
    const author = await Factory.create("author");

    Factory.define("book", Books, {
      good: {
        async authorId() {
          return (await Authors.findOneAsync(author._id))._id;
        },
      },
      name: "A book",
      year: 2014,
    });

    var book = await Factory.create("book");
    const foundAuthor = await Authors.findOneAsync(book.good.authorId);

    test.equal(foundAuthor.name, "John Smith");
  }
);

Tinytest.addAsync("Factory - Tree - Basic", async (test) => {
  Factory.define("author", Authors, {
    name: "John Smith",
  });

  Factory.define("book", Books, {
    name: "A book",
    author: Factory.get("author"),
  });

  const book = await Factory.tree("book");

  test.equal(book.author.name, "John Smith");
});

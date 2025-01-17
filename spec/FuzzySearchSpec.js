import FuzzySearch from "../src/FuzzySearch";

describe("FuzzySearch", () => {
  it("should return an error when called as a function", () => {
    expect(() => {
      FuzzySearch();
    }).toThrow();
  });

  it('should return strings matching "qwe"', () => {
    const fuzzy = new FuzzySearch([
      "test",
      "again",
      "word",
      "something",
      "qwerty",
      "qwerty keyboard",
      "qrandomwanotherrandomething"
    ]);

    expect([
      "qwerty",
      "qwerty keyboard",
      "qrandomwanotherrandomething"
    ]).toEqual(fuzzy.search("qwe"));
  });

  it('should return strings matching "x"', () => {
    const fuzzy = new FuzzySearch(["x", "xx", "xxx", "t", "f"]);

    expect(["x", "xx", "xxx"]).toEqual(fuzzy.search("x"));
  });

  it("should search in keys", () => {
    const fuzzy = new FuzzySearch(
      [
        {
          name: "Betania Ivana Besoli Leiten",
          location: "El Salvador"
        },
        {
          name: "Alexandría DCastillo Gayubas",
          location: "Bolivia"
        }
      ],
      ["name"]
    );

    expect([
      {
        name: "Alexandría DCastillo Gayubas",
        location: "Bolivia"
      }
    ]).toEqual(fuzzy.search("als"));
  });

  it("should search in array keys", () => {
    const fuzzy = new FuzzySearch(
      [
        {
          name: ["Irene", "Maseras"],
          location: "Colombia"
        },
        {
          name: ["Itziar", "Julia", "Pumarola", "Duenas"],
          location: "Chile"
        }
      ],
      ["name"]
    );

    expect([
      {
        name: ["Itziar", "Julia", "Pumarola", "Duenas"],
        location: "Chile"
      }
    ]).toEqual(fuzzy.search("itzi"));
  });

  it("should search in array keys containing objects", () => {
    const haystack = [
      {
        persons: [
          { firstname: "Patricia", lastname: "Millaruelo", age: 23 },
          { firstname: "Itziar", lastname: "Julia", age: 23 }
        ]
      },
      {
        persons: [
          { firstname: "Alexandría", lastname: "DCastillo", age: 22 },
          { firstname: "Gayubas", lastname: "Pumarola", age: 43 }
        ]
      }
    ];

    const fuzzy = new FuzzySearch(haystack, ["persons.firstname"]);

    expect([haystack[0]]).toEqual(fuzzy.search("tzia"));
  });

  it("should exact match numeric values", () => {
    const haystack = [
      {
        persons: [
          { firstname: "Patricia", lastname: "Millaruelo", age: 23 },
          { firstname: "Itziar", lastname: "Julia", age: 23 }
        ]
      },
      {
        persons: [
          { firstname: "Alexandría", lastname: "DCastillo", age: 22 },
          { firstname: "Gayubas", lastname: "Pumarola", age: 43 }
        ]
      }
    ];
    const fuzzy = new FuzzySearch(haystack, ["persons.age"]);

    expect([haystack[1]]).toEqual(fuzzy.search("43"));
  });

  it("should allow to search case sensitive", () => {
    const fuzzy = new FuzzySearch(
      ["Patricia", "Millaruelo", "Itziar", "Julia"],
      {
        caseSensitive: true
      }
    );

    expect([]).toEqual(fuzzy.search("mill"));
  });

  it("should return the whole list with an empty query string", () => {
    const list = ["Patricia", "Millaruelo", "Itziar", "Julia"];
    const fuzzy = new FuzzySearch(list);

    expect(list).toEqual(fuzzy.search());
  });

  it("should not match repeating letters", () => {
    const fuzzy = new FuzzySearch(["long string", "string"]);

    expect([]).toEqual(fuzzy.search("looooooong string"));
  });

  it("should allow sorting", () => {
    const fuzzy = new FuzzySearch(["a______b______c", "a__b__c", "abc"], {
      sort: true
    });

    expect(["abc", "a__b__c", "a______b______c"]).toEqual(fuzzy.search("abc"));
  });

  it("should boost score if query matches item exactly", () => {
    const fuzzy = new FuzzySearch(["prolog", "rust", "r", "ruby"], {
      sort: true
    });

    expect(["r", "rust", "ruby", "prolog"]).toEqual(fuzzy.search("r"));
  });

  it("allows for configuration when the keys parameter is omitted", () => {
    const fuzzy = new FuzzySearch(["a"], {
      sort: true
    });

    expect(["a"]).toEqual(fuzzy.search("a"));
  });

  it("should rank words with matching letters close to each other higher", () => {
    const fuzzy = new FuzzySearch(
      [
        "Alarm Dictionary",
        "BO_ALARM_DICTIONARY",
        "Dogmatix Board Replacements",
        "DOGMATIX_BOARD_REPLACEMENT_V"
      ],
      {
        sort: true
      }
    );

    expect([
      "Dogmatix Board Replacements",
      "DOGMATIX_BOARD_REPLACEMENT_V",
      "BO_ALARM_DICTIONARY"
    ]).toEqual(fuzzy.search("board"));
  });
});

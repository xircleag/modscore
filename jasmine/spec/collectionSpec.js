
describe("Collections", function() {
    var Collection = m_.Model.getClass("ArrayCollection");
    var Person = m_.Model.extend({
        name:"Person",
        properties: {
            firstName: {
                type: "string"
            },
            lastName: {
                type: "string"
            },
            birthDate: {
                type: "date",
                autoAdjust: true
            },
            age: {
                type: "integer",
                defaultValue: 13
            }
        }
    });

    var c;
    beforeEach(function() {
        c = new Collection({
            data: [new Person({firstName: "Fred"}), new Person({lastName: "Flinstone"})]
        });
    });

    it("Should store a collection", function() {
        expect(c.getData()[1].lastName).toEqual("Flinstone");
    });

    it("Should update its length property", function() {
        expect(c.length).toEqual(2);

        var wilma = new Person({firstName: "Wilma"});
        c.add(wilma);
        expect(c.length).toEqual(3);

        c.remove(wilma);
        expect(c.length).toEqual(2);

    });

    it("Should fire events on add/remove", function() {
        var added, removed;
        c.once("item:new", function(item) {
            added = item;
        });
        c.once("item:remove", function(item) {
            removed = item;
        });

        var wilma = new Person({firstName: "Wilma"});
        c.add(wilma);
        expect(added).toBe(wilma);
        expect(removed).toBe(undefined);

        c.remove(wilma);
        expect(removed).toBe(wilma);
    });

    it("Should fire events on editing any of its items", function() {
        var wilma = new Person({firstName: "Wilma"});
        c.add(wilma);

        var testItem, testNewValue, testOldValue;
        c.once("item:change:age", function(item, newValue, oldValue) {
            testItem = item;
            testNewValue = newValue;
            testOldValue = oldValue;

        });

        wilma.age = 50;
        expect(testItem).toBe(wilma);
        expect(testNewValue).toEqual(50);
        expect(testOldValue).toEqual(13);
    });

    it("getData should give us a copy", function() {
        expect(c.getData().length).toEqual(2);
        var d = c.getData();
        d.push("HEY");
        expect(c.getData().length).toEqual(2);
    });

    it("Should allow non-model items", function() {
        c.add("Hello");
        expect(c.at(2)).toEqual("Hello");
    });

    it("Should allow for finding", function() {
        var flint = c.find(function(item) {
            return item.lastName == "Flinstone";
        });
        expect(flint).toBe(c.getData()[1]);
    });

    it("Should iterate", function() {
        var items = [];
        c.each(function(item) {
            items.push(item);
        });
        expect(items).toEqual(c.getData());
    });

    it("Should destroy", function() {
        var wilma = new Person({firstName: "Wilma"});
        c.add(wilma);
        c.destroy();

        expect(wilma.__isDestroyed).toEqual(true);
    });

    it("Should sortBy", function() {
        var wilma = new Person({firstName: "Wilma"});
        c.add(wilma);

        c.sortBy(function(item) {return item.firstName});
        expect(c.map(function(item) {return item.firstName})).toEqual(["Fred", "Wilma", undefined]);
    });

    it("Should initialize a model field if that field is a collection", function() {
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                age: {
                    type: "number"
                },
                legs: {
                    type: "ArrayCollection"
                }
            }
        });

        var cat = new Cat();
        expect(cat.legs instanceof m_.Model.getClass("ArrayCollection")).toEqual(true);

    });

    it("Should initialize a model field with values", function() {
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                age: {
                    type: "number"
                },
                legs: {
                    type: "ArrayCollection"
                }
            }
        });

        var cat = new Cat({
            legs: [new Cat(), new Cat()]
        });
        expect(cat.legs.length).toEqual(2);

    });

    it("Should forward item events", function() {
        var new1 = false, change1 = false, change2 = false;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                age: {
                    type: "number"
                },
                littleCats: {
                    type: "ArrayCollection",
                    params: {
                        name: "kitten"
                    }
                }
            }
        });



        var cat = new Cat();
        cat.on({
            "kitten:new": function(item) {
                new1 = true;
                expect(item).toBe(kitten);
            },
            "kitten:change": function(item, fieldName, newValue, oldValue) {
                change1 = true;
                expect(item).toBe(kitten);
                expect(fieldName).toEqual("age");
                expect(newValue).toEqual(55);
            },
            "kitten:change:age": function(item, newValue, oldValue) {
                change2 = true;
                expect(item).toBe(kitten);
                expect(newValue).toEqual(55);
            }
        });
        var kitten = new Cat();
        cat.littleCats.add(kitten);

        kitten.age = 55;
        expect(new1).toEqual(true);
        expect(change1).toEqual(true);
        expect(change2).toEqual(true);

        change1 = change2 = false;

        cat.littleCats.remove(kitten);
        kitten.age = 65;
        expect(change1).toEqual(false);
        expect(change2).toEqual(false);
    });

    it("Should allow customizing events", function() {
        var new1 = false, change1 = false, change2 = false;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                age: {
                    type: "number"
                },
                littleCats: {
                    type: "ArrayCollection",
                    params: {
                        name: "kitten",
                        evtModifier: function(args) {
                            args[0] = args[0].replace(/^kitten:/, "");
                        }
                    }
                }
            }
        });

        var cat = new Cat();
        cat.on({
            "change:age": function(item, newValue, oldValue) {
                change2 = true;
                expect(item).toBe(kitten);
                expect(newValue).toEqual(55);
            }
        });
        var kitten = new Cat();
        cat.littleCats.add(kitten);

        kitten.age = 55;
        expect(change2).toBe(true);
    });


    it("Should provide basic events for basic types", function() {
        var new1 = false, remove1 = false;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                age: {
                    type: "number"
                },
                scores: {
                    type: "ArrayCollection"
                }
            }
        });



        var cat = new Cat({
            scores: [10,20,25]
        });
        cat.on({
            "item:new": function(item) {
                new1 = true;
                expect(item).toEqual(35);
            },
            "item:remove": function(item) {
                remove1 = true;
                expect(item).toEqual(35);
            }
        });

        expect(cat.scores.at(2)).toEqual(25);
        expect(new1).toEqual(false);
        cat.scores.add(35);
        expect(new1).toEqual(true);

        expect(remove1).toEqual(false);
        cat.scores.remove(35);
        expect(remove1).toEqual(true);
    });

    it("Should support the events config", function() {
        var newItem;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                age: {
                    type: "number"
                },
                scores: {
                    type: "ArrayCollection",
                    events: {
                        "item:new": function(item) {
                            newItem = item;
                        }
                    }
                }
            }
        });

        var cat = new Cat({
            scores: [10,20,25]
        });
        cat.scores.add(50);
        expect(newItem).toEqual(50);
    });


    it("Should allow setting the entire collection", function() {
        var newCount = 0, removeCount = 0;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                age: {
                    type: "number"
                },
                scores: {
                    type: "ArrayCollection"
                }
            }
        });



        var cat = new Cat({
            scores: [10,20,25]
        });
        cat.on({
            "item:new": function(item) {
                newCount++;
            },
            "item:remove": function(item) {
                removeCount++;
            }
        });

        cat.scores = [12,23];
        expect(cat.scores.getData()).toEqual([12,23]);
        expect(newCount).toEqual(2);
        expect(removeCount).toEqual(3);
    });

    it("Should maintain sorted collection via sortByProp", function() {
        var newCount = 0, removeCount = 0;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                name: {
                    type: "string"
                },
                age: {
                    type: "number"
                },
                kittens: {
                    type: "ArrayCollection",
                    params: {
                        sortByProp: "age"
                    }
                }
            }
        });



        var cat = new Cat({
            kittens: [new Cat({age:35, name: "z"}),new Cat({age:25, name: "a"}),new Cat({age:45, name: "m"})]
        });
        expect(cat.kittens.map(function(item){return item.age;})).toEqual([25,35,45]);
        cat.kittens.add(new Cat({age:3, name: "n"}));
        expect(cat.kittens.map(function(item){return item.age;})).toEqual([3,25,35,45]);
        cat.kittens.sortByProp = "name";
        expect(cat.kittens.map(function(item){return item.name;})).toEqual(["a","m","n","z"]);
    });

    it("Should maintain reverse sorted collection via sortByProp", function() {
        var newCount = 0, removeCount = 0;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                name: {
                    type: "string"
                },
                age: {
                    type: "number"
                },
                kittens: {
                    type: "ArrayCollection",
                    params: {
                        sortByProp: "age",
                        reverseSort: true
                    }
                }
            }
        });



        var cat = new Cat({
            kittens: [new Cat({age:35, name: "z"}),new Cat({age:25, name: "a"}),new Cat({age:45, name: "m"})]
        });
        expect(cat.kittens.map(function(item){return item.age;})).toEqual([25,35,45].reverse());
        cat.kittens.add(new Cat({age:3, name: "n"}));
        expect(cat.kittens.map(function(item){return item.age;})).toEqual([3,25,35,45].reverse());
        cat.kittens.sortByProp = "name";
        expect(cat.kittens.map(function(item){return item.name;})).toEqual(["a","m","n","z"].reverse());
    });


    it("Should maintain sorted collection via sortByFunc", function() {
        var newCount = 0, removeCount = 0;
        var Cat = m_.Model.extend({
            name: "Cat",
            properties: {
                name: {
                    type: "string"
                },
                age: {
                    type: "number"
                },
                kittens: {
                    type: "ArrayCollection",
                    params: {
                        sortByFunc: function(a,b) {return a.age > b.age ? 1 : a.age == b.age ? 0 : -1;}
                    }
                }
            }
        });



        var cat = new Cat({
            kittens: [new Cat({age:35, name: "z"}),new Cat({age:25, name: "a"}),new Cat({age:45, name: "m"})]
        });
        expect(cat.kittens.map(function(item){return item.age;})).toEqual([25,35,45]);
        cat.kittens.add(new Cat({age:3, name: "n"}));
        expect(cat.kittens.map(function(item){return item.age;})).toEqual([3,25,35,45]);
        cat.kittens.sortByProp = "name";
        expect(cat.kittens.map(function(item){return item.name;})).toEqual(["a","m","n","z"]);
    });

    it("Should return the last item", function() {
        c = new Collection({
            data: [new Person({firstName: "Fred"}), new Person({lastName: "Flinstone"})]
        });
        expect(c.last().lastName).toEqual("Flinstone");
    });

    it("Should return the index of the item", function() {
       c = new Collection({
            data: [new Person({firstName: "Fred"}), new Person({lastName: "Flinstone"})]
        });
        expect(c.indexOf(c.last())).toEqual(1);
        expect(c.indexOf(null)).toEqual(-1);
    });

    it("Should clear the data", function() {
       c = new Collection({
            data: [new Person({firstName: "Fred"}), new Person({lastName: "Flinstone"})]
        });
       c.clear();
        expect(c.indexOf(null)).toEqual(-1);
        expect(c.length).toEqual(0);
        expect(c.at(0)).toBe(undefined);
    });
});
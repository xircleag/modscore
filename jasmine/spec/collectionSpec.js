
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
                        evtModfier: function(args) {
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
        debugger;
        kitten.age = 55;
        expect(change2).toBe(true);
    });
});
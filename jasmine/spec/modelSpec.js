describe("Model", function() {
    var genericPersonDef;

    beforeEach(function() {
        genericPersonDef = {
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
            },
            percentile: {
                type: "double"
            },
            isAlive: {
                type: "boolean"
            },
            rankings: {
                type: "object"
            },
            flex: {
                type: "any"
            },
            personId: {
                type: "integer",
                readOnly: true
            }
        };
    });

    describe("Verify Extend Process", function() {
        var Person, p;

        beforeEach(function() {
            Person = m_.Model.extend("Person", genericPersonDef);
            p = new Person({});
        });

        it("Test instanceof returns expected result", function() {
            expect(p instanceof Person).toEqual(true);

        });

        it("firstName should be settable, and should set Person.__values.firstName", function() {
            p.firstName = "fred";
            expect(p.firstName).toEqual("fred");
            expect(p.__values.firstName).toEqual("fred");
        });

        it("firstName should reject non-string values", function() {
            var f = function() {
                p.firstName = 5;
            };
            expect(f).toThrow();
        });

        it("Date types should be settable with autoAdjust enabled", function() {
            var d1 = new Date(), d2 = new Date(0);
            p.birthDate = d1;
            expect(p.birthDate).toEqual(d1);
            expect(p.__values.birthDate).toEqual(d1);

            p.birthDate = d2.getTime();
            expect(p.birthDate).toEqual(d2);
            expect(p.__values.birthDate).toEqual(d2);
        });

        it("Date types should reject non-date values", function() {
            var f1 = function() {
                p.birthDate = "fred";
            };

            var f2 = function() {
                p.birthDate = true;
            };
            expect(f1).toThrow();
            expect(f2).toThrow();
        });

        it("Number types should be settable", function() {
            var age1 = 5, percentile1 = 0.3;
            p.age = age1;
            p.percentile = percentile1;
            expect(p.age).toEqual(age1);
            expect(p.__values.age).toEqual(age1);

            expect(p.percentile).toEqual(percentile1);
            expect(p.__values.percentile).toEqual(percentile1);
        });

        it("Number types should reject non-number values", function() {
            var f1 = function() {
                p.age = 5.5;
            };

            var f2 = function() {
                p.age = "fred";
            };

            var f3 = function() {
                p.age = new Date();
            };

            var f4 = function() {
                p.percentile = new Date();
            };

            expect(f1).toThrow();
            expect(f2).toThrow();
            expect(f3).toThrow();
            expect(f4).toThrow();
        });


        it("Boolean types should be settable", function() {

            p.isAlive = true;
            expect(p.isAlive).toEqual(true);
            expect(p.__values.isAlive).toEqual(true);

            p.isAlive = false;
            expect(p.isAlive).toEqual(false);
            expect(p.__values.isAlive).toEqual(false);
        });

        it("Boolean types should reject non-boolean values with autoAdjust disabled", function() {
            var f1 = function() {
                p.isAlive = "true";
            };

            expect(f1).toThrow();
        });


        it("Object types should be settable", function() {
            var o = {monday: 4, tuesday: 5, friday: 0};
            p.rankings = o;
            expect(p.rankings).toEqual(o);
            expect(p.__values.rankings).toEqual(o);
        });

        it("Object types should reject non-object values", function() {
            var f1 = function() {
                p.rankings = "true";
            };

            expect(f1).toThrow();
        });

        it("Any types should be settable", function() {
            var values = [{monday: 4, tuesday: 5, friday: 0}, 5, true, "fred", new Date(), null]
            expect(p.flex).toBe(undefined);
            m_.each(values, function(inValue) {
                p.flex = inValue;
                expect(p.flex).toEqual(inValue);
                expect(p.__values.flex).toEqual(inValue);
            });

        });


        it("Accept all values via constructor", function() {
            var d = new Date();
            var p = new Person({
                firstName: "Fred",
                birthDate: d,
                age: 5,
                rankings: {a: 5}
            });
            expect(p.firstName).toEqual("Fred");
            expect(p.birthDate).toEqual(d);
            expect(p.age).toEqual(5);
            expect(p.rankings).toEqual({a:5});
        });

        it("Test custom constructor", function() {
            var result = false;
            var Dog = m_.Model.extend("Dog", genericPersonDef, {
                constructor: function(inargs) {
                    result = true;
                }
            });
            var d = new Dog();
            expect(result).toEqual(true);
        });

        it("Test custom methods", function() {

            var Dog = m_.Model.extend("Dog", genericPersonDef, {
                eatMe: function(inargs) {
                    this.isAlive = false;
                }
            });
            var d = new Dog({isAlive: true});
            expect(d.isAlive).toBe(true);
            d.eatMe();
            expect(d.isAlive).toBe(false);
        });

        it("Test custom Validator", function() {
            var Dog = m_.Model.extend("Dog", genericPersonDef, {
                validateSetAge: function(inValue) {
                    if (inValue > 20) return "Dogs don't live to be " + inValue;
                }
            });

            expect(function() {
                var d = new Dog();
                d.age = 15;
            }).not.toThrow();

            expect(function() {
                var d = new Dog();
                d.age = 25;
            }).toThrowError("age: Dogs don't live to be 25");

            expect(function() {
                var d = new Dog({age: 25});
            }).toThrowError("age: Dogs don't live to be 25");

            expect(function() {
                var d = new Dog({age: "Fred"});
            }).toThrowError("age: Fred is of type string not number");
        });

        it("Test custom adjuster", function() {
            var Dog = m_.Model.extend("Dog", genericPersonDef, {
                adjustAge: function(inValue) {
                    if (inValue > 20) return 20;
                }
            });
            var d = new Dog({age: 25});
            expect(d.age).toEqual(20);
        });

        it("Should not allow setting of custom properties", function() {
            p.fred = "john";
            expect(p.fred).toBe(undefined);
        });

        it("Should use the defaultValue if none is supplied", function() {
            var p = new Person();
            expect(p.age).toEqual(13);

            p = new Person({age: 20});
            expect(p.age).toEqual(20);

        });

        it("Should let us initialize but not change readonly properties", function() {
            var p = new Person();
            expect(p.personId).toBe(undefined);

            p.personId = 5;
            expect(p.personId).toBe(undefined);

            p = new Person({personId: 5});
            expect(p.personId).toEqual(5);
        });

        it("Should support required properties", function() {
            genericPersonDef.value = {
                type: "number",
                required: true
            };
            var Person = m_.Model.extend("Person", genericPersonDef);
            expect(function() {
                new Person({});
            }).toThrowError("value: is required");

            var p = new Person({value: 0});

            expect(function() {
                p = new Person({value: null});
            }).toThrowError("value: is required");
            expect(function() {
                p = new Person({value: undefined});
            }).toThrowError("value: is required");
            p = new Person({value: 10});
            p.value = 20;
            expect(function() {
                p.value = null;
            }).toThrowError("value: is required");

            expect(p.value).toEqual(20);


            genericPersonDef.value = {
                type: "string",
                required: true
            };
            Person = m_.Model.extend("Person", genericPersonDef);
            p = new Person({value: ""});

            genericPersonDef.value = {
                type: "boolean",
                required: true
            };
            Person = m_.Model.extend("Person", genericPersonDef);
            p = new Person({value: false});
        });
    });

    describe("Create Subclasses", function() {
        var Person, GradStudent, Newbie, runs, result2;
        beforeEach(function() {
            result = "";
            result2 = "";
            Person = m_.Model.extend("Person", genericPersonDef, {
                constructor: function() {
                    result2 += "ho";
                    this.$super();
                },
                runTest: function() {
                    result += "Person";
                    this.$super();
                },
                runTest2: function(){
                    result += "Person";
                    this.$super();
                }
            });
            GradStudent = Person.extend("GradStudent", {
                yearInSchool: {
                    type: "integer"
                },
                grade: {
                    type: "string"
                }
            }, {
                constructor: function() {
                    result2 += "hey";
                    this.$super();
                },
                runTest: function() {
                    result += "GradStudent";
                    this.$super();
                }
            });

            Newbie = GradStudent.extend("Newbie", {
                confusion: {
                    type: "double"
                }
            }, {
                runTest: function runTest() {
                    result += "Newbie";
                    this.$super();
                },
                runTest2: function(){
                    result += "Newbie";
                    this.$super();
                }
            });

        });
        it("Should be able to create a subclass", function() {
            var g = new GradStudent({yearInSchool: 2, firstName: "Fred"});
            expect(g.yearInSchool).toEqual(2);
            expect(g.firstName).toEqual("Fred");
            expect(g instanceof GradStudent).toBe(true);

            expect(g instanceof Person).toBe(true);
         });

        it("Should allow calling of parent class methods", function() {
            var newbie = new Newbie();
            newbie.runTest();
            expect(result).toEqual("NewbieGradStudentPerson");

            result = "";
            newbie.runTest2();
            expect(result).toEqual("NewbiePerson");

            expect(result2).toEqual("heyho");
        });

    });

    describe("Test Events", function() {
        it("Basic events should work", function() {
            var Person = m_.Model.extend("Person", genericPersonDef);
            var p = new Person();
            var count = 0;

            p.on("Test", function() {
                count++;
            });
            p.trigger("Test");
            p.trigger("Test:fred");
            p.trigger("Test Fred");

            expect(count).toEqual(2);
        });

        it("Should allow for unsubscribe", function() {
            var Person = m_.Model.extend("Person", genericPersonDef);
            var p = new Person();
            var count = 0;

            var f =  function() {
                count++;
            };
            p.on("Test",f);
            p.trigger("Test");
            expect(count).toEqual(1);

            p.off("Test", f);
            p.trigger("Test");
            expect(count).toEqual(1);

            p.on("Test",f);
            p.trigger("Test");
            expect(count).toEqual(2);

            p.off("Test");
            p.trigger("Test");
            expect(count).toEqual(2);

            p.on("Test",f);
            p.trigger("Test");
            expect(count).toEqual(3);

            p.off("Test");
            p.trigger();
            expect(count).toEqual(3);

        });

        it("Should allow events to trigger when properties change", function() {
            var Person = m_.Model.extend("Person", genericPersonDef);
            var p = new Person({firstName: "Fred"});
            var count = 0;
            var newValue = "";
            var oldValue = "";
            p.on("firstName:changed", function(inValue, inOldValue) {
                newValue = inValue;
                oldValue = inOldValue;
                count++;
            });

            p.firstName = "Fred";
            expect(count).toEqual(0); // No change in value

            p.firstName = "John";
            expect(count).toEqual(1);
            expect(newValue).toEqual("John");
            expect(oldValue).toEqual("Fred");

            p.firstName = "Fred";
            expect(count).toEqual(2);

        });
    });

    describe("Array properties", function() {
        beforeEach(function() {
            genericPersonDef.scores = {
                type: "[integer]"
            };
        });

        it("Should allow setting an array of integers", function() {
            var Person = m_.Model.extend("Person", genericPersonDef);
            var p = new Person({scores: [1,3,9]});

            expect(p.scores).toEqual([1,3,9]);

            expect(function() {
                p.scores = 9;
            }).toThrowError("scores: must be an array");

            p.scores = [];
            expect(p.scores).toEqual([]);
        });
    });

    describe("Protected Properties", function() {
        it("It should allow for getting and setting of protected properties", function(){
            genericPersonDef.myProtectedData = {
                protected: true,
                type: "string"
            };
            var Person = m_.Model.extend("Person", genericPersonDef);
            var getter, setter;
            var p = new Person({
                onProtectedInit: function(inGetter, inSetter) {
                    getter = inGetter;
                    setter = inSetter;
                }
            });

            expect(function() {
                setter("myProtectedData", 55);
            }).toThrow();

            setter("myProtectedData", "Hello There");

            expect(getter("myProtectedData")).toEqual("Hello There");
        });

        it("It should disallow use of the wrong accessor", function(){
            genericPersonDef.myProtectedData = {
                protected: true,
                type: "string"
            };
            var Person = m_.Model.extend("Person", genericPersonDef);
            var getter, setter;
            var p = new Person({
                onProtectedInit: function(inGetter, inSetter) {
                    getter = inGetter;
                    setter = inSetter;
                }
            });

            expect(function() {
                getter("firstName");
            }).toThrowError("firstName: Not a protected property");

            expect(function() {
                setter("firstName", "Meeps");
            }).toThrowError("firstName: Not a protected property");
        });

        xit("It should support setting privates within the constructor", function(){
            genericPersonDef.myProtectedData = {
                protected: true,
                type: "string"
            };
            var Person = m_.Model.extend("Person", genericPersonDef);
            var getter, setter;
            var p = new Person({
                myProtectedData: "Fred",
                onProtectedInit: function(inGetter, inSetter) {
                    getter = inGetter;
                    setter = inSetter;
                }
            });
            expect(getter("myProtectedData")).toEqual("Fred");
        });

        xit("It should support the defaultValue during initialization", function(){
            genericPersonDef.myProtectedData = {
                protected: true,
                type: "string",
                defaultValue: "Fred"
            };
            var Person = m_.Model.extend("Person", genericPersonDef);
            var getter, setter;
            var p = new Person({
                onProtectedInit: function(inGetter, inSetter) {
                    getter = inGetter;
                    setter = inSetter;
                }
            });
            expect(getter("myProtectedData")).toEqual("Fred");
        });

        xit("It should provide reasonable means of definine an object and letting that object access its own protected data", function() {
            genericPersonDef.income = {
                type: "number",
                protected: true
            };
            var Person = m_.Model.extend("Person", genericPersonDef);
            var getter, setter;
            var p = new Person({
                onProtectedInit: function(inGetter, inSetter) {
                    getter = inGetter;
                    setter = inSetter;
                },
                incrementIncome: function() {
                    setter("income", 1 + getter("income"));
                }
            });

            setter("income", 50);
            expect(getter("income")).toEqual(50);
            p.incrementIncome();
            expect(getter("income")).toEqual(51);
            p.incrementIncome();
            expect(getter("income")).toEqual(52);
        });

        xit("It should allow an object to create an array of objects and manage access to all of their private data", function() {
            genericPersonDef.income = {
                type: "number",
                protected: true
            };
            genericPersonDef.children = {
                type: "[Person]",
                protected: true
            };
            var Person = m_.Model.extend("Person", genericPersonDef);
            var getter, setter;
            var p = new Person({
                onProtectedInit: function(inGetter, inSetter) {
                    getter = inGetter;
                    setter = inSetter;
                },
                incrementIncome: function() {
                    setter("income", 1 + getter("income"));
                }
            });
            expect(true).toBe(false);
        });
    });

});
var start = Date.now();
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
            },
            z: {type: "string", defaultValue: "FRED!"}
        };
    });

    describe("Verify Extend Process", function() {
        var Person, p;
        beforeEach(function() {
            Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            p = new Person({});
        });

        it("Test instanceof returns expected result", function() {
            expect(p instanceof Person).toEqual(true);

        });

        it("firstName should be settable", function() {
            p.firstName = "fred";
            expect(p.firstName).toEqual("fred");
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

            p.birthDate = d2.getTime();
            expect(p.birthDate).toEqual(d2);
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

            expect(p.percentile).toEqual(percentile1);
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

            p.isAlive = false;
            expect(p.isAlive).toEqual(false);
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
            });

        });

        it("Custom types should be settable", function() {
            genericPersonDef.parent = {
                type: "Person"
            }
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});

            var kermit = new Person();

            var babyKermit = new Person({parent: kermit});

            expect(babyKermit.parent).toBe(kermit);
            expect(function() {
                babyKermit.parent = 5;
            }).toThrow();

            expect(function() {
                babyKermit.parent = {};
            }).toThrow();

            babyKermit.parent = babyKermit;
        });

        it("Custom array types should be settable", function() {
            genericPersonDef.parents = {
                type: "[Person]"
            }
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var kermit = new Person();
            var piggy = new Person();
            var babyKermit = new Person({parents: [kermit, piggy]});
            expect(babyKermit.parents).toEqual([kermit,piggy]);
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


        it("Test custom init", function() {
            var result = false;
            var Dog = m_.Model.extend({
                name: "Dog",
                properties: genericPersonDef,
                methods: {
                    init: function(inargs) {
                        result = true;
                    }
                }
            });
            var d = new Dog();
            expect(result).toEqual(true);

            var Poodle = Dog.extend({
                name: "Poodle",
                methods: {
                    init: function(params, a, b) {
                        expect(params).toEqual({a:5});
                        expect(a).toEqual(8);
                        expect(b).toEqual("Fred");
                    }
                }
            });
            var p = new Poodle({a:5}, 8, "Fred");

        });

        it("Test custom methods", function() {
            var Dog = m_.Model.extend({
                name: "Dog",
                properties: genericPersonDef,
                methods: {
                    eatMe: function(inargs) {
                        this.isAlive = false;
                    }
                }
            });
            var d = new Dog({isAlive: true});
            expect(d.isAlive).toBe(true);
            d.eatMe();
            expect(d.isAlive).toBe(false);
        });

        it("Test custom Validator", function() {
            var Dog = m_.Model.extend({
                name: "Dog",
                properties: genericPersonDef,
                methods: {
                    validateSetAge: function(inValue) {
                        if (inValue > 20) return "Dogs don't live to be " + inValue;
                    }
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
            var Dog = m_.Model.extend({
                name: "Dog",
                properties: genericPersonDef,
                methods: {
                    adjustAge: function(inValue) {
                        if (inValue > 20) return 20;
                    }
                }
            });
            var d = new Dog({age: 25});
            expect(d.age).toEqual(20);
        });

        it("Should not allow setting of custom properties", function() {
            p.fred = "john";
            expect(p.fred).toBe(undefined);
        });

        it("Should use the defaultValues if none is supplied", function() {

            var p = new Person();
            expect(p.age).toEqual(13);

            p = new Person({age: 20});
            expect(p.age).toEqual(20);
        });


        it("It should support defaultValue from the parent class", function() {
            genericPersonDef.myData = {
                type: "string",
                defaultValue: "Howdy"
            };
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});

            GradStudent = Person.extend({
                name: "GradStudent",
                properties: {
                    yearInSchool: {
                        type: "integer",
                        defaultValue: 3
                    }
                }
            });

            var p = new GradStudent();
            expect(p.myData).toEqual("Howdy");
            expect(p.yearInSchool).toEqual(3);

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
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
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
            Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            expect(function() {
                p = new Person({value: ""});
            }).toThrowError("value: is required");

            p = new Person({value: "fred"});
            expect(function() {
                p.value = "";
            }).toThrowError("value: is required");

            p.value = "flinstone";

            genericPersonDef.value = {
                type: "boolean",
                required: true
            };
            Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            p = new Person({value: false});
        });

        it("Should accept null/undefined for non-required fields", function() {
            expect(function() {
                var p = new Person({firstName: null});
            }).not.toThrow();
        });
    });

    describe("Use roles and getClass", function() {
        it("Should get by role", function(){
             var Person = m_.Model.extend({
                name:"a.Person",
                role: "a.Caveman",
                properties:genericPersonDef
            });
            expect(m_.Model.getClass("a.Caveman")).toBe(Person);
            expect(m_.Model.getClass("a.Person")).toBe(Person);

        });

    });



    describe("Create Subclasses", function() {
        var Person, GradStudent, Newbie, runs, result, result2;
        beforeEach(function() {
            result = "";
            result2 = "";
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                methods: {
                    init: function() {
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
                    },
                    runTest3: function(a,b,c) {
                        return (this.$super() || "") +  a + ":" + b + ":" + c;
                    }
                }
            });
            GradStudent = Person.extend({
                name: "GradStudent",
                properties: {
                    yearInSchool: {
                        type: "integer"
                    },
                    grade: {
                        type: "string"
                    }
                },
                methods: {
                    init: function() {
                        result2 += "hey";
                        this.$super();
                    },
                    runTest: function() {
                        result += "GradStudent";
                        this.$super();
                    },
                    runTest3: function(a,b,c) {
                        return (this.$super("a","b","c") || "") +  a + ":" + b + ":" + c;
                    }
                }
            });

            Newbie = GradStudent.extend({
                name: "Newbie",
                properties: {
                    confusion: {
                        type: "double"
                    }
                },
                methods: {
                    runTest: function runTest() {
                        result += "Newbie";
                        this.$super();
                    },
                    runTest2: function(){
                        result += "Newbie";
                        this.$super();
                    },
                    runTest3: function(a,b,c) {
                        return (this.$super() || "") +  a + ":" + b + ":" + c;
                    }
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

        it("Super method should handle original arguments and new arguments and return results", function() {
            var newbie = new Newbie();
            var result = newbie.runTest3(1,2,3);
            expect(result).toEqual("a:b:c1:2:31:2:3");
        });

        it("Constructor should register classes in the specified name space", function() {
            var result = m_.Model.extend({name: "abc.def.ghi"});
            expect(window.abc.def.ghi).toEqual(result);

            m_.Model.extend({name:"Frog"});
            expect(window.Frog).toBe(undefined);
        });
    });

    describe("Test statics", function() {

        it("Should define static properties", function() {
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                statics: {
                    a: 5,
                    b: "Fred"
                }
            });
            expect(Person.a).toEqual(5);
            expect(Person.b).toEqual("Fred");
            Person.a++;
            expect(Person.a).toEqual(6);
        });

        it("Should define static methods", function() {
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                statics: {
                    a: 5,
                    b: "Fred",
                    incA: function() {this.a++;}
                }
            });
            expect(Person.a).toEqual(5);
            expect(Person.b).toEqual("Fred");
            Person.incA();
            expect(Person.a).toEqual(6);
        });

        it("Should run static init method", function() {
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                statics: {
                    a: 5,
                    b: "Fred",
                    incA: function() {this.a++;},
                    init: function() {this.incA();}
                }
            });
            expect(Person.a).toEqual(6);
            expect(Person.b).toEqual("Fred");
            Person.incA();
            expect(Person.a).toEqual(7);
        });
    });

    describe("Test Events", function() {
        it("Basic events should work", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
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


        it("Basic events hash should work", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person();
            var count1 = 0, count2 = 0;

            p.on({
                test1: function() {
                    count1++;
                },
                test2: function() {
                    count2++;
                }
            });
            p.trigger("test1");
            expect(count1).toEqual(1);
            expect(count2).toEqual(0);

            p.trigger("test2");
            p.trigger("test2");
            expect(count1).toEqual(1);
            expect(count2).toEqual(2);

            p.trigger("test1 test2");
            expect(count1).toEqual(2);
            expect(count2).toEqual(3);
        });

        it("Basic events hash in constructor should work", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var count1 = 0, count2 = 0, isNew = false;
            var p = new Person({
                events:{
                    test1: function() {
                        count1++;
                    },
                    test2: function() {
                        count2++;
                    },
                    "new": function() {
                        isNew = true;
                    }
                }
            });
            expect(isNew).toEqual(true);

            p.trigger("test1");
            expect(count1).toEqual(1);
            expect(count2).toEqual(0);

            p.trigger("test2");
            p.trigger("test2");
            expect(count1).toEqual(1);
            expect(count2).toEqual(2);

            p.trigger("test1 test2");
            expect(count1).toEqual(2);
            expect(count2).toEqual(3);
        });

        it("Should allow for unsubscribe", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
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

        it("once should work", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person();
            var count = 0;

            p.once("Test", function() {
                count++;
            });
            p.trigger("Test");
            p.trigger("Test");
            p.trigger("Test");

            expect(count).toEqual(1);
        });


        it("once should cancel ALL events in the group", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person();
            var count = 0;

            p.once({
                a: function() {
                    count++;
                },
                b: function() {
                    count++;
                },
                c: function() {
                    count++;
                }
            });
            p.trigger("a");
            p.trigger("b");
            p.trigger("c");

            expect(count).toEqual(1);
        });


        it("Should allow events to trigger when properties change", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person({firstName: "Fred"});
            var count = 0;
            var newValue = "";
            var oldValue = "";
            p.on("change:firstName", function(inValue, inOldValue) {
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

        it("Should allow global change events to trigger when properties change", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person({firstName: "Fred"});
            var count = 0;
            var newValue = "";
            var oldValue = "";
            p.on("change", function(inName, inValue, inOldValue) {
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
        });

        it("Should silence events if using the SilentValue object", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person();
            var eventTriggered = false;
            p.on("change", function() {
                eventTriggered = true;
            });
            p.on("change:firstName", function() {
                eventTriggered = true;
            });

            p.firstName = new m_.SilentValue("John");

            expect(p.firstName).toEqual("John");
            expect(eventTriggered).toEqual(false);
        });

        it("Should notify on being destroyed", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person();
            var eventTriggeredOn = null;
            p.on("destroy", function(person) {
                eventTriggeredOn = person;
            }.bind(this,p));
            p.destroy();
            expect(eventTriggeredOn).toEqual(p);
        });

    });


    describe("Array properties", function() {
        beforeEach(function() {
            genericPersonDef.scores = {
                type: "[integer]"
            };
        });

        it("Should allow setting an array of integers", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person({scores: [1,3,9]});

            expect(p.scores).toEqual([1,3,9]);

            expect(function() {
                p.scores = 9;
            }).toThrowError("scores: must be an array");

            expect(function() {
                p.scores = ["Fred"];
            }).toThrowError("scores: Fred is of type string not number");

            p.scores = [];
            expect(p.scores).toEqual([]);
        });
    });

    describe("Test wiring", function() {
        it("Should create a manager with the specified properties and events", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var Employee = Person.extend({
                properties: {
                    manager: {
                        type: "Person",
                        create: true,
                        params: {
                            firstName: "Grand Wizard",
                            lastName: "this.managerName"
                        },
                        events: {
                            "change:lastName": "this.updateManagerName"
                        }
                    },
                    managerName: {
                        type: "string"
                    }
                },
                methods: {
                    updateManagerName: function() {
                        this.managerName = this.manager.lastName;
                    }
                }
            });
            var e = new Employee({
                firstName: "Tom",
                lastName: "Foolery",
                managerName: "TF2"
            });
            expect(e.manager.lastName).toEqual("TF2");
            e.manager.lastName = "Tim";
            expect(e.managerName).toEqual("Tim");
        });

        it("Should call updatePropName after any change unless silenced", function() {
            var firstCount = 0, lastCount = 0;
            var Person = m_.Model.extend({
                properties: {
                    firstName: {
                        type: "string"
                    },
                    lastName: {
                        type: "string",
                        defaultValue: "Hey"
                    }
                },
                methods: {
                    updateFirstName: function(newValue, oldValue) {
                        firstCount++;
                        expect(newValue).toEqual("Doh!");
                    },
                    updateLastName: function() {
                        lastCount++;
                    }
                }
            });
            var p = new Person();
            expect(firstCount + lastCount).toEqual(0);
            p.firstName = "Doh!";
            expect(firstCount).toEqual(1);
            expect(lastCount).toEqual(0);

            p.lastName = "Argh!";
            p.lastName += "Doh!";
            expect(lastCount).toEqual(2);

            firstCount = lastCount = 0;
            p = new Person({
                firstName: "A",
                lastName: "B"
            });
            expect(firstCount + lastCount).toEqual(0);


            p.firstName = new m_.SilentValue("Argh");
            expect(firstCount + lastCount).toEqual(0);
        });

        it("Should allow for simple property definition", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone",
                    age: 55
                }
            });
            var p = new Person();
            expect(p.firstName).toEqual("fred");
            expect(p.lastName).toEqual("flinstone");
            expect(function() {
                p.firstName = 50;
            }).toThrow();
            p.age = 50;
            expect(p.age).toEqual(50);
        });
        it("Should automatically use autoAdjust for simple property defintions", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone",
                    age: 55
                }
            });
            var p = new Person();
            p.age = "51";
            expect(p.age).toEqual(51);
            expect(function() {
                p.age = "fred";
            }).toThrow();
        });

        it("Should maintain parent type for simple property definition", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: {
                        type: "string",
                        defaultValue: "fred"
                    },
                    lastName: "flinstone",
                    age: 55
                }
            });
            var AnotherPerson = Person.extend({
                properties: {
                    firstName: "Dan"
                }
            });
            var p = new AnotherPerson();
            expect(p.lastName).toEqual("flinstone");
            expect(p.firstName).toEqual("Dan");
            p.firstName = "Sam";
            expect(p.firstName).toEqual("Sam");
            expect(function() {
                p.firstName = 5;
            }).toThrow();
        });

        it("Should maintain parent autoAdjust for simple property definition", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone",
                    age: {
                        type: "number"
                    }
                }
            });
            var AnotherPerson = Person.extend({
                properties: {
                    age: 85
                }
            });
            var p = new AnotherPerson();
            expect(p.age).toEqual(85);
            p.age = 55;
            expect(p.age).toEqual(55);
            expect(function() {
                p.age = "34";
            }).toThrow();



            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone",
                    age: {
                        type: "number",
                        autoAdjust: true
                    }
                }
            });
            var AnotherPerson = Person.extend({
                properties: {
                    age: 85
                }
            });
            var p = new AnotherPerson();
            p.age = "34";
            expect(p.age).toEqual(34);
            expect(function() {
                p.age = "fred";
            }).toThrow();


            var AnotherPerson = Person.extend({
                properties: {
                    age: "hey"
                }
            });
            expect(function() {
                var p = new AnotherPerson();
            }).toThrow();
        });
    });

    describe("Test configuration support", function() {
        it("Should apply window.modelConfig when class is defined", function() {
            window.modelConfig = {
                "testPerson": {
                    firstName: "Doh",
                    lastName: "Ray"
                }
            };

            var Person = m_.Model.extend({
                role: "testPerson",
                properties: {
                    firstName: "fred",
                    lastName: "flinstone",
                    age: {
                        type: "number"
                    }
                }
            });
            var p = new Person();
            expect(p.firstName).toEqual("Doh");
            expect(p.lastName).toEqual("Ray");
            p = new Person({firstName: "Argh"});
            expect(p.firstName).toEqual("Argh");
            expect(p.lastName).toEqual("Ray");
        });

        it("Should allow Model.configure() to change default property values",  function() {


            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone",
                    age: {
                        type: "number"
                    }
                }
            });
            Person.configure({
                firstName: "Doh",
                lastName: "Ray"
            });
            var p = new Person();
            expect(p.firstName).toEqual("Doh");
            expect(p.lastName).toEqual("Ray");
            p = new Person({firstName: "Argh"});
            expect(p.firstName).toEqual("Argh");
            expect(p.lastName).toEqual("Ray");

        });

        it("Should allow Model.configure() to add a method to change the side-effects of a method", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone"
                },
                methods: {
                    tooString: function(prefix) {
                        return prefix + " " + this.firstName + " " + this.lastName;
                    }
                }
            });
            Person.configure({
                tooString: function(result, prefix) {
                    this.firstName += "5";
                }
            });
            var p = new Person();
            expect(p.tooString("HEY")).toEqual("HEY fred flinstone");
            expect(p.firstName).toEqual("fred5");
        });

        it("Should allow Model.configure() to chain multiple methods to change the behavior of a method", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone"
                },
                methods: {
                    tooString: function(prefix) {
                        return prefix + " " + this.firstName + " " + this.lastName;
                    }
                }
            });
            Person.configure({
                tooString: function(result, prefix) {
                    this.firstName += "5";
                }
            });
            Person.configure({
                tooString: function(result, prefix) {
                    this.lastName += "6";
                }
            });
            var p = new Person();
            expect(p.tooString("HEY")).toEqual("HEY fred flinstone");
            expect(p.firstName).toEqual("fred5");
            expect(p.lastName).toEqual("flinstone6");
        });

        it("Should allow Model.configure() to change the return vallue of a function... or leave the original return value", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone"
                },
                methods: {
                    tooString: function(prefix) {
                        return prefix + " " + this.firstName + " " + this.lastName;
                    }
                }
            });
            Person.configure({
                tooString: function(result, prefix) {
                    return result + " HO";
                }
            });
            var p = new Person();
            expect(p.tooString("HEY")).toEqual("HEY fred flinstone HO");
        });

        it("Should allow Model.unconfigure() to remove any configurations", function() {
            var Person = m_.Model.extend({
                properties: {
                    firstName: "fred",
                    lastName: "flinstone"
                },
                methods: {
                    tooString: function(prefix) {
                        return prefix + " " + this.firstName + " " + this.lastName;
                    }
                }
            });
            debugger;
            Person.configure({
                tooString: function(result, prefix) {
                    this.firstName += "5";
                }
            });
            Person.configure({
                tooString: function(result, prefix) {
                    this.lastName += "6";
                }
            });
            var p = new Person();
            expect(p.tooString("HEY")).toEqual("HEY fred flinstone");
            expect(p.firstName).toEqual("fred5");
            expect(p.lastName).toEqual("flinstone6");
            Person.unconfigure();

            expect(p.tooString("HEY")).toEqual("HEY fred5 flinstone6");
            expect(p.firstName).toEqual("fred5");
            expect(p.lastName).toEqual("flinstone6");

        });
    });


    describe("Test misc Model Methods", function() {

        it("Should output suitable JSON", function() {
            var Person = m_.Model.extend({name:"Person", properties:genericPersonDef});
            var p = new Person({
                firstName: "Fred"
            });
            expect(JSON.parse(p.toJson())).toEqual({
                firstName: "Fred",
                z: "FRED!",
                age: 13
            });
        });

    });
});
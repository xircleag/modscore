describe("PrivateModel", function() {
    var genericPersonDef;

    beforeEach(function() {
        genericPersonDef = {
            firstName: {
                type: "string"
            },
            middleName: {
                type: "string",
                private: true, // Nobody knows my middle name!
                defaultValue: "Homer"
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
                defaultValue: 13,
                privateSetter: true
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
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                methods: {
                    setMiddleName: function(inName) {
                        this.middleName = inName;
                    },
                    getMiddleName: function() {
                        return this.middleName;
                    },
                    asyncSetMiddleName: function(inName) {
                        var setter = this.setMiddleName.bind(this);
                        setter(inName);
                    },
                    anonymousSetMiddleName: function(inName) {
                        var f = function(inName) {
                            this.middleName = inName;
                        };
                        f.bind(this)(inName);
                    }
                }
            });
            p = new Person({});
        });

        it("middleName (private) should be settable", function() {
            p.setMiddleName("fred");
            expect(p.middleName).toEqual(undefined);
            expect(p.getMiddleName()).toEqual("fred");
        });

        it("middleName (private) should reject non-string values", function() {
            var f = function() {
                p.setMiddleName(5);
            };
            expect(f).toThrow();
        });

        it("Private should allow setting via bound methods", function() {
            p.asyncSetMiddleName("fred");
            expect(p.getMiddleName()).toEqual("fred");
        });

        it("Anonymous methods should fail to access private data", function() {
            p.anonymousSetMiddleName("fred");
            expect(p.getMiddleName()).toEqual("Homer");
        });

        it("Accept all values via constructor", function() {
            var d = new Date();
            var p = new Person({
                firstName: "Fred",
                middleName: "Flinstone",
                birthDate: d,
                age: 5,
                rankings: {a: 5}
            });

            expect(p.getMiddleName()).toEqual("Flinstone");
        });

        it("Should use the defaultValues if none is supplied", function() {

            var p = new Person();
            expect(p.getMiddleName()).toEqual("Homer");
        });

        it("Should use the defaultValue if none is supplied for private property", function() {
            genericPersonDef.myProtectedData = {
                private: true,
                type: "string",
                defaultValue: "Howdy"
            };
            var Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                methods:    {
                    getData: function() {return this.myProtectedData;}
                }
            });
            var p = new Person();
            expect(p.getData()).toEqual("Howdy");
        });

        it("It should support defaultValue from the parent class", function() {
            genericPersonDef.myProtectedData = {
                private: true,
                type: "string",
                defaultValue: "Howdy"
            };
            var Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                methods: {
                    getData: function() {return this.myProtectedData;}
                }
            });

            GradStudent = Person.extend({
                name: "GradStudent",
                properties: {
                    yearInSchool: {
                        type: "integer",
                        private: true,
                        defaultValue: 3
                    }
                },
                methods: {
                    getYearData: function() {return this.yearInSchool;}
                }
            });

            var p = new GradStudent();
            expect(p.getData()).toEqual("Howdy");
            expect(p.getYearData()).toEqual(3);

        });


        it("Should let us initialize but not change readonly properties", function() {
            genericPersonDef.personPrivateId = {
                type: "number",
                readOnly: true,
                private: true,
                defaultValue: 105
            };

            var Person2 = m_.Model.extend({
                name: "Person2",
                properties: genericPersonDef,
                methods: {
                    setData: function() {this.personPrivateId = 56;},
                    getData: function() {return this.personPrivateId;}
                }
            });
            p = new Person2({personPrivateId: 55});
            expect(p.getData()).toEqual(55);
            p = new Person2({});
            expect(p.getData()).toEqual(105);

            p.personPrivateId = 205;
            expect(p.getData()).toEqual(105);

            p.setData();
            expect(p.getData()).toEqual(105);
        });

        it("privateSetter should allow us to see the value but not change the value", function() {
            Person = m_.Model.extend({name: "Person", properties: genericPersonDef});
            var p = new Person();
            expect(p.age).toEqual(13);
            p.age = 5;
            expect(p.age).toEqual(13);
        });

        it("privateSetter should allow class to change its value", function() {
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                methods: {
                    setAge: function(v) {
                        this.age = v;
                    }
                }
            });
            var p = new Person();
            expect(p.age).toEqual(13);
            p.setAge(5);
            expect(p.age).toEqual(5);
        });

        it("Private methods should restrict access", function() {
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                methods: {
                    setAge: function(v) {
                        this.setAgePrivate(v);
                    },

                    setAgePrivate: {
                        private: true,
                        method: function(v) {
                            this.age = v;
                        }
                    }
                },


                statics: {
                    getOldPerson: function() {
                        var p = new Person();
                        p.setAgePrivate(1000);
                        return p;
                    }
                }
            });



            var p = new Person();
            expect(p.setAgePrivate).toBe(undefined);

            p.setAge(55);

            expect(p.age).toEqual(55);

            p = Person.getOldPerson();
            expect(p.age).toEqual(1000);
        });

        it("Private updateProp methods should still fire", function() {
            var updaterCalled = false;
            Person = m_.Model.extend({
                name: "Person",
                properties: genericPersonDef,
                methods: {
                    updateFirstName: {
                        private: true,
                        method: function(v) {
                            updaterCalled = true;
                        }
                    }
                }
            });

            var p = new Person();
            p.firstName = "hey!";
            expect(updaterCalled).toBe(true);
            expect(p.firstName).toEqual("hey!");
        });
    });
});
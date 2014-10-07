describe("Miniunderscore Object and Misc", function() {

    beforeEach(function() {

    });
    describe("Object Functions", function() {
        var f = function() {
            this.a = 5;
            this.b = 10;
            this.c = function() {};
        }
        f.prototype.dFunc = function() {};
        f.prototype.dProp = 20;

        var g = function() {
            this.e = 15;
            this.f = 20;
            this.g = function() {};
        };
        g.prototype = new f();
        g.prototype.hFunc = function() {};
        g.prototype.hProp = 30;

        var objG, objF;
        beforeEach(function() {
            objF = new f();
            objG = new g();
        });

        describe("m_.has", function() {
            it("Properties defined in constructor or on object should return true", function() {
                expect(m_.has(objG, "e")).toEqual(true);
                expect(m_.has({
                    e: "fred"
                }, "e")).toEqual(true);
            });

            it("Properties defined in prototype should return false until set as a value", function() {
                expect(m_.has(objG, "hProp")).toEqual(false);
                objG.hProp = 5;
                expect(m_.has(objG, "hProp")).toEqual(true);

                var obj = {};
                expect(m_.has(obj, "toString")).toEqual(false);
                obj.toString = "fred";
                expect(m_.has(obj, "toString")).toEqual(true);
            });

            it("Properties that do not exist are false", function() {
                expect(m_.has(objG, "eeeeee")).toEqual(false);
                expect(m_.has({
                    e: "fred"
                }, "eeeee")).toEqual(false);
            });

        });

        describe("m_.keys", function() {
            it("Returns properties of obj, ignores properties set via prototype", function() {
                expect(m_.keys(objF)).toEqual(["a", "b", "c"]);

                objG.zed = 5;
                expect(m_.keys(objG).sort()).toEqual(["e", "f", "g", "zed"]);
            });

            it("Setting a property of the prototype will cause it to be returned", function() {
                objG.a = 10;
                expect(m_.keys(objG).sort()).toEqual(["a", "e", "f", "g"]);
            });
        });

        describe("m_.values", function() {
            it("Returns values of the object", function() {
                expect(m_.values(objF)).toEqual([objF.a, objF.b, objF.c]);

                objG.zed = 5;
                expect(m_.values(objG)).toEqual([objG.e, objG.f, objG.g, objG.zed]);
            });
        });

        describe("m_.pairs", function() {
            it("Assembles the correct array", function() {
                expect(m_.pairs(objF)).toEqual([
                    ["a", objF.a],
                    ["b", objF.b],
                    ["c", objF.c]
                ]);

                objG.zed = {
                    hey: 5,
                    ho: 10
                };
                expect(m_.pairs(objG)).toEqual([
                    ["e", objG.e],
                    ["f", objG.f],
                    ["g", objG.g],
                    ["zed", objG.zed]
                ]);
            });

            it("With recursion option", function() {
                expect(m_.pairs(objF, true)).toEqual([
                    ["a", objF.a],
                    ["b", objF.b],
                    ["c", objF.c]
                ]);

                objG.zed = {
                    hey: 5,
                    ho: 10
                };
                expect(m_.pairs(objG, true)).toEqual([
                    ["e", objG.e],
                    ["f", objG.f],
                    ["g", objG.g],
                    ["zed", [
                        ["hey", 5],
                        ["ho", 10]
                    ]]
                ]);
            });
        });

        describe("m_.functions", function() {
            it("Returns all functions whether set in prototype or constructor", function() {
                expect(m_.functions(objF)).toEqual(["c", "dFunc"]);
                expect(m_.functions(objG)).toEqual(["c", "dFunc", "g", "hFunc"]);
            });

            it("Verify Sorting of results", function() {
                objG.dog = function() {};
                expect(m_.functions(objG)).toEqual(["c", "dFunc", "dog", "g", "hFunc"]);
            });
        });

        describe("m_.extend", function() {
            var objH;
            beforeEach(function() {
                objH = {
                    "fred": 5,
                    "flinstone": 10
                };
            });

            it("Arguments (except first) unchanged", function() {
                m_.extend(objF, objG, objH);
                expect(m_.keys(objH)).toEqual(["fred", "flinstone"]);
                expect(m_.keys(objG)).toEqual(["e", "f", "g"]);
            });

            it("Modifies first obj to have all properties of both objects", function() {
                m_.extend(objF, objG, objH);
                expect(m_.keys(objF).sort()).toEqual(["a", "b", "c", "e", "f", "flinstone", "fred", "g"]);
            });

            it("Returns first obj", function() {
                expect(m_.extend(objF, objG, objH)).toBe(objF);
            });
        });

        describe("m_.defaults", function() {
            var cDefault = function() {};
            var h = function(init) {
                this.d = "locked";
                m_.defaults(this, init, {
                    a: 101,
                    b: 102,
                    c: cDefault
                });
            };

            it("Test with empty object should init with builtin defaults", function() {
                var result = new h({});
                expect(result.a).toEqual(101);
                expect(result.b).toEqual(102);
                expect(result.c).toBe(cDefault);
            });

            it("Test with null should init with builtin defaults", function() {
                var result = new h(null);
                expect(result.a).toEqual(101);
                expect(result.b).toEqual(102);
                expect(result.c).toBe(cDefault);
            });

            it("Override a property", function() {
                var result = new h({
                    a: "fred"
                });
                expect(result.a).toEqual("fred");
                expect(result.b).toEqual(102);
                expect(result.c).toBe(cDefault);
            });

            it("Add a property", function() {
                var result = new h({
                    z: "fred"
                });
                expect(result.z).toEqual("fred");
                expect(result.b).toEqual(102);
                expect(result.c).toBe(cDefault);
            });

            it("Override a function", function() {
                var cNew = function() {};
                var result = new h({
                    c: cNew
                });
                expect(result.a).toEqual(101);
                expect(result.b).toEqual(102);
                expect(result.c).toBe(cNew);
            });

            it("Can't change existing value unless its undefined", function() {
                var result = new h({
                    d: 5
                });
                expect(result.d).toEqual("locked");
                var obj = {
                    d: "locked"
                };
                expect(m_.defaults(obj, {
                    d: 5
                }).d).toEqual("locked");
                obj.d = null;
                expect(m_.defaults(obj, {
                    d: 5
                }).d).toEqual(null);
                obj.d = undefined;
                expect(m_.defaults(obj, {
                    d: 5
                }).d).toEqual(5);
            });

        });

        describe("Cloning Functions", function() {
            var obj;
            beforeEach(function() {
                obj = {
                    a: 1,
                    b: {
                        c: 2,
                        d: 3
                    },
                    c: [4, 5, 6]
                };
            });

            it("m_.clone should return new object with same object properties", function() {
                var result = m_.clone(obj);
                expect(result).not.toBe(obj);
                expect(result.a).toEqual(obj.a);
                expect(result.b).toBe(obj.b);
                expect(result.c).toBe(obj.c);
            });

            it("m_.cloneDeep should return new object with new but identical object properties", function() {
                var result = m_.cloneDeep(obj);
                expect(result).not.toBe(obj);
                expect(result.a).toEqual(obj.a);
                expect(result.b).not.toBe(obj.b);
                expect(result.b).toEqual({
                    c: 2,
                    d: 3
                });
                expect(result.c).not.toBe(obj.c);
                expect(result.c).toEqual([4, 5, 6]);
            });
        });

    });

    describe("Substitute", function() {

        it("Should replace all values that are specified, and use empty string for those that are not", function() {
            var result = m_.substitute("My {{descriptor}} is {{firstName}}{{lastName}}", {
                descriptor: "name",
                firstName: "Kermit"
            });
            expect(result).toEqual("My name is Kermit");
        });

        it("Should handle deep structures", function() {
             var result = m_.substitute("My {{a.b.c.descriptor}} is {{a.b.firstName}}{{z.lastName}}", {
                a: {
                    b: {
                        c: {
                            descriptor: "name"
                        },
                        firstName: "Kermit"
                    }
                }
            });
            expect(result).toEqual("My name is Kermit");

        });
    });
});
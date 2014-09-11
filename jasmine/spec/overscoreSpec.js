describe("Miniunderscore", function() {

    beforeEach(function() {

    });

    describe("Strings", function() {
        it("Does nothing with regular word", function() {
            var str = "hello there";
            var str2= m_.camelCase(str);
            expect(str2).toEqual(str);
        });

        it("Replace all _ with uppercase letter", function() {
            var str = "_hello_there_everyone";
            var str2= m_.camelCase(str);
            expect(str2).toEqual("HelloThereEveryone");
        });

        it("Test handling of _ at end", function() {
            var str = "hello there_";
            var str2= m_.camelCase(str);
            expect(str2).toEqual(str);
        });

        it("Test handling of first letter capitalize argument", function() {
            var str = "hello there";
            var str2= m_.camelCase(str, true);
            expect(str2).toEqual("Hello there");
        });




    });

    describe("Collections", function() {
        var testArrayNumb, testArrayStr, testArrayObj, testObj;
        beforeEach(function() {
            testArrayNumb = [10, 5, 15, 8, 23];
            testArrayStr = ["fred", "albert", "zoro", "kahn", "kirk"];
            testArrayObj = [];
            testObj = {};
            testArrayNumb.forEach(function(value, index) {
                testArrayObj.push({
                    name: testArrayStr[index],
                    value: value
                });
                testObj[testArrayStr[index]] = value;
            });
        });

        describe("m_.each", function() {
            // tests: all values, all indexes, inList, context, iterate over objects
            it("Each call contains all values", function() {
                var values = [];
                m_.each(testArrayNumb, function(inValue, inIndex, inList) {
                    values.push(inValue);
                });
                expect(values).toEqual(testArrayNumb);

                values = [];
                m_.each(testArrayObj, function(inValue, inIndex, inList) {
                    values.push(inValue);
                });
                expect(values).toEqual(testArrayObj);

            });


            it("Each call contains all indexes", function() {
                var indexes = [];
                m_.each(testArrayNumb, function(inValue, inIndex, inList) {
                    indexes.push(inIndex);
                });
                expect(indexes).toEqual([0,1,2,3,4]);

                indexes = [];
                m_.each(testArrayObj, function(inValue, inIndex, inList) {
                    indexes.push(inIndex);
                });
                expect(indexes).toEqual([0,1,2,3,4]);
            });

            it("Each call contains the array", function() {
                var list = [];
                m_.each(testArrayNumb, function(inValue, inIndex, inList) {
                    list.push(inList);
                });
                expect(list).toEqual([testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb]);

                list = [];
                m_.each(testObj, function(inValue, inIndex, inList) {
                    list.push(inList);
                });
                expect(list).toEqual([testObj,testObj,testObj,testObj,testObj]);

            });

            it("Each call contains the specified context", function() {
                var context = [];
                m_.each(testArrayNumb, function(inValue, inIndex, inList) {
                    context.push(this);
                }, testArrayNumb);
                expect(context).toEqual([testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb]);

                context = [];
                m_.each(testObj, function(inValue, inIndex, inList) {
                    context.push(this);
                }, testArrayNumb);
                expect(context).toEqual([testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb]);
            });

            it("Each property of an object is iterated over", function() {
                var props = [], vals = [];
                m_.each(testObj, function(inValue, inKey, inObj) {
                    props.push(inKey)
                    vals.push(inValue);
                });
                expect(props).toEqual(testArrayStr);
                expect(vals).toEqual(testArrayNumb);
            });
        });


        describe("m_.find", function() {
            it("Context is correctly used", function() {
                var context = [];
                m_.find(testArrayStr, function(inValue, inIndex, inArray) {
                    context.push(this);
                    return inValue == "zoro";
                }, testArrayObj);
                expect(context).toEqual([testArrayObj,testArrayObj,testArrayObj]);
            });

            it("Each call contains all values", function() {
                var values = [];
                m_.find(testArrayNumb, function(inValue, inIndex, inList) {
                    values.push(inValue);
                });
                expect(values).toEqual(testArrayNumb);
            });


            it("Each call contains all indexes", function() {
                var indexes = [];
                m_.find(testArrayNumb, function(inValue, inIndex, inList) {
                    indexes.push(inIndex);
                });
                expect(indexes).toEqual([0,1,2,3,4]);
            });

            it("Each call contains the array", function() {
                var list = [];
                m_.find(testArrayNumb, function(inValue, inIndex, inList) {
                    list.push(inList);
                });
                expect(list).toEqual([testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb]);
            });

            it("Returns the correct value", function() {
                var zoro = m_.find(testArrayStr, function(inValue, inIndex, inArray) {
                    return inValue == "zoro";
                }, testArrayObj);
                expect(zoro).toEqual("zoro");

                zoro = m_.find(testArrayObj, function(inValue, inIndex, inArray) {
                    return inValue.name == "zoro";
                }, testArrayObj);
                expect(zoro).toEqual(testArrayObj[2]);
            });
        });

        describe("m_.sortBy", function() {
            it("Context is correctly used", function() {
                var context = [];
                m_.sortBy(testArrayStr, function(inValue, inIndex, inArray) {
                    context.push(this);
                    return inValue == "zoro";
                }, testArrayObj);
                expect(context).toEqual([testArrayObj,testArrayObj,testArrayObj,testArrayObj,testArrayObj]);
            });

            it("Each call contains all values", function() {
                var values = [];
                m_.sortBy(testArrayNumb, function(inValue, inIndex, inList) {
                    values.push(inValue);
                });
                expect(values).toEqual(testArrayNumb);
            });


            it("Each call contains all indexes", function() {
                var indexes = [];
                m_.sortBy(testArrayNumb, function(inValue, inIndex, inList) {
                    indexes.push(inIndex);
                });
                expect(indexes).toEqual([0,1,2,3,4]);
            });

            it("Each call contains the array", function() {
                var list = [];
                m_.sortBy(testArrayNumb, function(inValue, inIndex, inList) {
                    list.push(inList);
                });
                expect(list).toEqual([testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb,testArrayNumb]);
            });

            it("Correctly sorts", function() {
                var result1 = m_.sortBy(testArrayObj, function(inValue) {
                    return inValue.name;
                });
                expect(result1).toEqual([testArrayObj[1],testArrayObj[0],testArrayObj[3],testArrayObj[4],testArrayObj[2]]);

                var result2 = m_.sortBy(testArrayObj, function(inValue) {
                    return -inValue.value;
                });
                expect(result2).toEqual([testArrayObj[4],testArrayObj[2],testArrayObj[0],testArrayObj[3],testArrayObj[1]]);
            });
        });

        describe("finding", function() {
            it("filterWhere", function() {
                var input = [{a: 5, b: 1}, {a: 5, b: 10}, {a: 10, b: 10}, {a: 5, b: 15}];
                expect(m_.filterWhere(input, {a:5})).toEqual([{a:5,b:1},{a:5,b:10},{a:5,b:15}]);

                expect(m_.filterWhere(input, {a:5, b:10})).toEqual([{a:5, b:10}]);

                expect(m_.filterWhere(input, {a:5, b:10000})).toEqual([]);
            });

            it("findWhere", function() {
                var input = [{a: 5, b: 1}, {a: 5, b: 10}, {a: 10, b: 10}, {a: 5, b: 15}];
                expect(m_.findWhere(input, {a:5})).toEqual({a:5,b:1});

                expect(m_.findWhere(input, {a:5, b:10})).toEqual({a:5, b:10});

                expect(m_.findWhere(input, {a:5, b:10000})).toEqual(undefined);
            });

        });

    });

    describe("Functions", function() {
        var value = 23;
        var obj = {
            f: function(input) {
                return input + value++;
            }
        };
/*
        describe("m_.memoize", function() {
            it("Is only called once", function() {
                spyOn(obj, "f");
                var f1 = m_.memoize(obj.f);

                f1(5);
                f1(5);
                f1(5);
                f1(10);
                f1(10);
                f1(10);
                expect(obj.f.calls.count()).toEqual(2);
            });

            it("Returns only the first value calculated", function() {
                spyOn(obj, "f").and.callThrough();
                var f1 = m_.memoize(obj.f);

                expect(f1(5)).toEqual(28);
                expect(f1(5)).toEqual(28);
                expect(f1(5)).toEqual(28);
                expect(f1(10)).toEqual(34);
                expect(f1(10)).toEqual(34);
                expect(f1(10)).toEqual(34);

            });
        });
*/
        describe("Timer Functions", function() {
            var timerCallback;

            beforeEach(function() {
                timerCallback = jasmine.createSpy("timerCallback");
                jasmine.clock().install();
            });
            afterEach(function() {
                jasmine.clock().uninstall();
            });

            describe("m_.defer", function() {
                it("Fires after 1 milisecond", function() {
                    m_.defer(timerCallback);
                    expect(timerCallback.calls.count()).toEqual(0);
                    jasmine.clock().tick(1);
                    expect(timerCallback.calls.count()).toEqual(1);
                });

                it("Passes all arguments", function() {
                    console.log("Start Pas");
                    m_.defer(timerCallback, "fred", 5, "john", 2);
                    jasmine.clock().tick(1);
                    expect(timerCallback.calls.argsFor(0)).toEqual(["fred", 5, "john", 2]);
                    console.log("Start Pas");
                });
            });

        });

        describe("m_.debounce", function() {
            var debounceCallback;

            beforeEach(function() {
                jasmine.clock().install();
                jasmine.clock().mockDate(new Date())
                debounceCallback = jasmine.createSpy("timerCallback");
                spyOn(Date, "now").and.callFake(function() {
                    return new Date().getTime();
                });
            });
            afterEach(function() {
                jasmine.clock().uninstall();
            });

            it("Calls the function after specified delay", function() {
                var f = m_.debounce(debounceCallback, 500, false);
                f();
                jasmine.clock().tick(100);
                expect(debounceCallback.calls.count()).toEqual(0);
                jasmine.clock().tick(399);
                expect(debounceCallback.calls.count()).toEqual(0);

                jasmine.clock().tick(100);
                expect(debounceCallback.calls.count()).toEqual(1);
            });

            it("Calls the function only once, after specified delay from last attempt to call", function() {
                var f = m_.debounce(debounceCallback, 500, false);
                f();
                jasmine.clock().tick(499);
                f();
                expect(debounceCallback.calls.count()).toEqual(0);
                jasmine.clock().tick(499);
                expect(debounceCallback.calls.count()).toEqual(0);
                jasmine.clock().tick(1);
                expect(debounceCallback.calls.count()).toEqual(1);
                f();
                expect(debounceCallback.calls.count()).toEqual(1);
                jasmine.clock().tick(499);
                expect(debounceCallback.calls.count()).toEqual(1);
                jasmine.clock().tick(1);
                expect(debounceCallback.calls.count()).toEqual(2);
            });

            it("Calls the function immediately", function() {
                var f = m_.debounce(debounceCallback, 500, 2);
                f();
                expect(debounceCallback.calls.count()).toEqual(1);
            });

            it("Calls the function immediately and then waits before next call", function() {
                var f = m_.debounce(debounceCallback, 500, 2);
                f();
                f();
                f();
                f();
                expect(debounceCallback.calls.count()).toEqual(1);
                jasmine.clock().tick(499);
                expect(debounceCallback.calls.count()).toEqual(1);
                jasmine.clock().tick(500);
                expect(debounceCallback.calls.count()).toEqual(2);
                jasmine.clock().tick(1000);
                expect(debounceCallback.calls.count()).toEqual(2);
            });

            it("Calls the function immediately and then squelches next calls", function() {
                var f = m_.debounce(debounceCallback, 500, true);
                f();
                f();
                f();
                f();
                expect(debounceCallback.calls.count()).toEqual(1);
                jasmine.clock().tick(499);
                f();
                expect(debounceCallback.calls.count()).toEqual(1);
                jasmine.clock().tick(500);
                expect(debounceCallback.calls.count()).toEqual(1);
                jasmine.clock().tick(1000);
                f();
                expect(debounceCallback.calls.count()).toEqual(2);
            });
        });


        describe("m_.once", function() {
            var f, fonce;

            beforeEach(function() {
                f = jasmine.createSpy("onceCallback");
                fonce = m_.once(f);
            });

            it("once allows a function to only be called once", function() {
                expect(f.calls.count()).toEqual(0);
                fonce();
                expect(f.calls.count()).toEqual(1);
                fonce();
                expect(f.calls.count()).toEqual(1);
                fonce();
                expect(f.calls.count()).toEqual(1);
                f();
                expect(f.calls.count()).toEqual(2);
            });
        });
    });
    describe("Object Functions", function() {
        var f = function() {this.a = 5; this.b = 10; this.c = function() {};}
        f.prototype.dFunc = function() {};
        f.prototype.dProp = 20;

        var g = function(){this.e = 15; this.f = 20; this.g = function() {};};
        g.prototype = new f();
        g.prototype.hFunc = function(){};
        g.prototype.hProp = 30;

        var objG, objF;
        beforeEach(function() {
            objF = new f();
            objG = new g();
        });

        describe("m_.has", function() {
            it("Properties defined in constructor or on object should return true", function() {
                expect(m_.has(objG, "e")).toEqual(true);
                expect(m_.has({e: "fred"}, "e")).toEqual(true);
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
                expect(m_.has({e: "fred"}, "eeeee")).toEqual(false);
            });

        });

        describe("m_.keys", function() {
            it("Returns properties of obj, ignores properties set via prototype", function() {
                expect(m_.keys(objF)).toEqual(["a","b", "c"]);

                objG.zed = 5;
                expect(m_.keys(objG).sort()).toEqual(["e","f", "g", "zed"]);
            });

            it("Setting a property of the prototype will cause it to be returned", function() {
                objG.a = 10;
                expect(m_.keys(objG).sort()).toEqual(["a","e","f", "g"]);
            });
        });

        describe("m_.values", function() {
            it("Returns values of the object", function() {
                expect(m_.values(objF)).toEqual([objF.a, objF.b, objF.c]);

                objG.zed = 5;
                expect(m_.values(objG)).toEqual([objG.e,objG.f, objG.g, objG.zed]);
            });
        });

        describe("m_.pairs", function() {
            it("Assembles the correct array", function() {
                expect(m_.pairs(objF)).toEqual([["a", objF.a],["b", objF.b], ["c", objF.c]]);

                objG.zed = {hey:5, ho: 10};
                expect(m_.pairs(objG)).toEqual([["e", objG.e],["f", objG.f], ["g", objG.g], ["zed", objG.zed]]);
            });

            it("With recursion option", function() {
                expect(m_.pairs(objF, true)).toEqual([["a", objF.a],["b", objF.b], ["c", objF.c]]);

                objG.zed = {hey:5, ho: 10};
                expect(m_.pairs(objG, true)).toEqual([["e", objG.e],["f", objG.f], ["g", objG.g], ["zed", [["hey",5], ["ho",10]]]]);
            });
        });

        describe("m_.functions", function() {
            it("Returns all functions whether set in prototype or constructor", function() {
                expect(m_.functions(objF)).toEqual(["c","dFunc"]);
                expect(m_.functions(objG)).toEqual(["c","dFunc", "g", "hFunc"]);
            });

            it("Verify Sorting of results", function() {
                objG.dog = function(){};
                expect(m_.functions(objG)).toEqual(["c","dFunc", "dog", "g", "hFunc"]);
            });
        });

        describe("m_.extend", function() {
            var objH;
            beforeEach(function() {
                objH = {"fred": 5, "flinstone": 10};
            });

            it("Arguments (except first) unchanged", function() {
                m_.extend(objF, objG, objH);
                expect(m_.keys(objH)).toEqual(["fred", "flinstone"]);
                expect(m_.keys(objG)).toEqual(["e","f", "g"]);
            });

            it("Modifies first obj to have all properties of both objects", function() {
                m_.extend(objF, objG, objH);
                expect(m_.keys(objF).sort()).toEqual(["a","b","c","e","f","flinstone","fred","g"]);
            });

            it("Returns first obj", function() {
                expect(m_.extend(objF, objG, objH)).toBe(objF);
            });
        });

        describe("m_.defaults", function() {
            var h = function(init) {
                this.d = "locked";
                m_.defaults(this, init, {a: 101, b: 102, c: function cDefault() {}});
            };

            it("Test with empty object should init with builtin defaults", function() {
                var result = new h({});
                expect(result.a).toEqual(101);
                expect(result.b).toEqual(102);
                expect(result.c.name).toEqual("cDefault");
            });

            it("Test with null should init with builtin defaults", function() {
                var result = new h(null);
                expect(result.a).toEqual(101);
                expect(result.b).toEqual(102);
                expect(result.c.name).toEqual("cDefault");
            });

            it("Override a property", function() {
                var result = new h({a: "fred"});
                expect(result.a).toEqual("fred");
                expect(result.b).toEqual(102);
                expect(result.c.name).toEqual("cDefault");
            });

            it("Add a property", function() {
                var result = new h({z: "fred"});
                expect(result.z).toEqual("fred");
                expect(result.b).toEqual(102);
                expect(result.c.name).toEqual("cDefault");
            });

            it("Override a function", function() {
                var result = new h({c: function cNew(){}});
                expect(result.a).toEqual(101);
                expect(result.b).toEqual(102);
                expect(result.c.name).toEqual("cNew");
            });

            it("Can't change existing value unless its undefined", function() {
                var result = new h({d:5});
                expect(result.d).toEqual("locked");
                var obj = {d: "locked"};
                expect(m_.defaults(obj, {d:5}).d).toEqual("locked");
                obj.d = null;
                expect(m_.defaults(obj, {d:5}).d).toEqual(null);
                obj.d = undefined;
                expect(m_.defaults(obj, {d:5}).d).toEqual(5);
            });

        });

        describe("Cloning Functions", function() {
            var obj;
            beforeEach(function() {
                obj = {
                    a: 1,
                    b: {c: 2, d: 3},
                    c: [4,5,6]
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
                expect(result.b).toEqual({c:2,d:3});
                expect(result.c).not.toBe(obj.c);
                expect(result.c).toEqual([4,5,6]);
            });
        });

    });

    describe("Utility Functions", function() {

        describe("isEmpty", function() {

            it("Null is empty", function() {
                expect(m_.isEmpty(null)).toEqual(true);
            });

            it("Undefined is empty", function() {
                expect(m_.isEmpty(undefined)).toEqual(true);
            });

            it("emptyString is empty", function() {
                expect(m_.isEmpty("")).toEqual(true);
            });

            it("String is empty", function() {
                expect(m_.isEmpty("0")).toEqual(false);
            });

            it("10 is empty", function() {
                expect(m_.isEmpty("")).toEqual(true);
            });

            it("false is empty", function() {
                expect(m_.isEmpty(false)).toEqual(true);
            });

            it("{} is empty", function() {
                expect(m_.isEmpty({})).toEqual(true);
            });

            xit("new Date is empty; Node interprets this differently than chrome!", function() {
                expect(m_.isEmpty(new Date())).toEqual(true);
            });

            it("{d:5} is NOT empty", function() {
                expect(m_.isEmpty({d:5})).toEqual(false);
            });

            it("f() arguments is empty", function() {
                (function() {
                    expect(m_.isEmpty(arguments)).toEqual(true);
                })();
                expect(true).toEqual(true);
            });

            it("f(0) arguments is NOT empty", function() {
                (function() {
                    expect(m_.isEmpty(arguments)).toEqual(false);
                })(0);
            });

            describe("isObject", function() {
                it("Various objects are in fact objects", function() {
                    expect(m_.isObject({})).toEqual(true);
                    expect(m_.isObject(new Date())).toEqual(true);
                    expect(m_.isObject(window)).toEqual(true);
                    expect(m_.isObject([])).toEqual(true);
                });

                it("Various non-objects are in fact not objects", function() {
                    expect(m_.isObject(5)).toEqual(false);
                    expect(m_.isObject("hello")).toEqual(false);
                    expect(m_.isObject(true)).toEqual(false);
                    expect(m_.isObject(null)).toEqual(false);
                    expect(m_.isObject(undefined)).toEqual(false);
                });

            });
        });
        describe("Matching", function() {
            it("Returns true if standard values are a match", function() {
                var m = m_.matches({a:5});
                expect(m({b:5, a:10})).toEqual(false);
                expect(m({b:5, a:"fred"})).toEqual(false);
                expect(m({b:5, a:5})).toEqual(true);
                expect(m({b:5})).toEqual(false);
            });

            it("Should do exact matching", function() {
                var m = m_.matches({a:5});
                expect(m({b:5, a:"5"})).toEqual(false);

                m = m_.matches({a:5.000000001});
                expect(m({b:5, a:5.000000002})).toEqual(false);

                m = m_.matches({a:null});
                expect(m({b:5, a:5})).toEqual(false);
                expect(m({b:5, a:""})).toEqual(false);
                expect(m({b:5, a:0})).toEqual(false);
                expect(m({b:5, a:false})).toEqual(false);
                expect(m({b:5, a:undefined})).toEqual(false);
                expect(m({b:5, a:null})).toEqual(true);
                expect(m({b:5})).toEqual(false);

                m = m_.matches({a:undefined});
                expect(m({b:5, a:null})).toEqual(false);
                expect(m({b:5, a:undefined})).toEqual(true);
            });

            xit("I have questions about proper handling for matching on undefined", function() {
                expect(m({b:5})).toEqual(true); // Actual result is false
            });

            it("Matching on object values", function() {
                var obj = {c: 20, d: 40};
                var arr = [4,8,12];
                var m = m_.matches({a: obj});
                expect(m({a: obj})).toEqual(true);
                expect(m({a: {c: 20, d: 40}})).toEqual(true);
            });

            it("Matching on 3 levels of depth", function() {
                var m = m_.matches({a: {b: {c: "fred"}}});

                var testObj1 = {a: {b: {c: "john"}}};
                var testObj2 = {a: {b: {c: "fred"}}};
                expect(m(testObj1)).toEqual(false);
                expect(m(testObj2)).toEqual(true);
            });
         });
    });
});
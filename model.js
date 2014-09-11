/* NOTE: THE # below is needed to startup markdown formatting */
/**
 * @class overscore.Model
 * @author Michael Kantor
 *
 * START-GIT-README
 *
 * ### Requirements
 *
 * A browser more modern than IE8
 *
 * # Motivation for this library:
 *
 * ### Motivations: The short version:
 *
 * - Supports defining properties to be private. Your APIs will be a lot harder to tamper with.
 * - Supports validation on all of your properties.  Your APIs will be more robust.
 * - Supports proper Object Oriented concepts (public/private, inheritance, calling parent methods and objects can't be tinkered with by your API's users.)
 *
 * ### Motivations: Robustness of a typed / declared language
 *
 * There have been many efforts at a more formal typed version of javascript.  These invariably
 * seem to involve non-javascript syntax, non-javascript concepts and structures,
 * and then the code gets compiled into javascript.
 *
 * This library is for those who love javascript,
 * but want a more engineering friendly environment.  Enforcement of types does not depend upon
 * third party developers using setters.  Calling *person.firstName = 5* will throw a type error
 * if firstName has been defined to be a string.
 *
 * At this point in this library's evolution, all object properties are typed, method parameters are NOT typed.
 *
 * ### Motivations: Developers can no longer muck up your API
 *
 * Objects are defined such that only the properties you define and type can be used.  As an API provider,
 * you should have some confidence that people aren't mucking with your objects, arbitrarily attaching
 * data to them.
 *
 * Why not let properties be declared whenever, wherever?
 *
 * - Self documenting designs are easier if all properties are defined up front.  This is equally true for private properties.
 * - Javascript allows any and every module to make any change it wants to your objects.  Thats all good fun,
 * but as an API provider, you'd probably much rather have some confidence that your objects are not in fact
 * being arbitrarily changed.
 *
 * ### Motivations: Your private properties really aught to be private
 *
 * In Javascript, the only way to have truely private variables is to NOT use prototypal properties, which in turn
 * means that you can't use prototypal methods.  Which in turn means that if you create 10,000 instances,
 * you have to recreate all of the properties and methods for each one.
 *
 * So, javascript developers make do with coding by convention;  this.__prettyPleaseDontTouchThisProperty = 5;
 * Yeah.  Nobody would ever touch that property, right?  No... developers will do Whatever it seems like it
 * might take to get their code to work.  Even if there are consequences later on.
 *
 * ### Motivations: Your object oriented code really should be object oriented
 *
 * Yes, there are a number of frameworks out there for declaring classes, subclasses, calling parent methods, etc...
 * This library provides all that object oriented goodness with all the behaviors described above.
 *
 * *NOTE: Static methods and properties are not yet supported*
 *
 * ### Motivations: Inspirations and outright copying:
 *
 * - Ampersandjs: A lot of credit goes to ampersandjs, and their *State* object. It is a very subjective opinion that
 *
 *     - Their state object manages a lot more stuff than it needs to; children, collections, derivedProps, etc...
 *       all very cool but not really what I need (ok, not what I need yet).
 *     - Their state object does not appear to be a root object for an object oriented dev environment (how do you call the parent method?)
 *     - They do not (yet) have all of the behaviors needed to define/modify property behaviors.
 *
 * - Backbone: Directly copies from Backbone standalone events (stripping out some of the unused code)
 * - Sencha: Their adjust methods on their setters directly inspired part of how properties are set
 * - Javascript: For providing Object.defineProperty() and Object.seal().
 * - Java: Yeah, I know javascript is not java.  That doesn't mean there aren't lessons to be learned. Like, say, private properties?
 *
 * ## How to use it
 *
 * ### Step 1: Add the script to your page:
 *
 *    &lt;script type="text/javascript" src='overscore.min.js'>&lt;/script>
 *
 * ### Step 2: In your js folder, define some objects.
 *
 * For simplicity, we'll assume that they are all defined in the same file
 *
        // Define a base class using the Global extend method
        var Animal = m_.Model.extend(
            // Argument 1: Name of the class
            "Animal",

            // Argument 2: An object defining all of your properties
            {
                firstName: {
                    type: "string"
                },
                age: {
                    type: "integer"
                }
            },

            // Argument 3 (optional): An object defining all methods for your class
            {
                celebrateBirthday: function() {
                    this.age++;
                }
            }
        );

        // Create an instance of a Person.
        var kermit = new Person({
            firstName: "Kermit",
            age: 15
        });

        // Directly access declared properties on the object
        console.log(kermit.firstName);
        > "Kermit"

        console.log(kermit.age)
        > 15

        // Execute your methods on the object, and access the result
        kermit.celebrateBirthday();
        console.log(kermit.age);
        > 16

        // Directly set properties, and have them validated and throw errors if incorrectly typed
        kermit.firstName = "The Frog";
        console.log(kermit.firstName);
        > "The Frog"

        kermit.firstName = 55;
        > Error!

    * *NOTE: To disable validation, use a type of "any" instead of "string", "integer", etc.*

        // Object only allows those properties that are defined; no object hacking.
        // iq is not part of the class definition:
        kermit.iq = 185;
        console.log(kermit.iq);
        > undefined

    * ### Step 3: You can also define subclasses of your class
    *
    * Rather than use the global extend method, use extend method built into your parent class.
    * The subclass inherits all properties and methods defined on the parent.

        var Person = Animal.extend("Person", {
            lastName: {
                type: "string"
            },
            hasRecentBirthday: {
                type: "boolean"
            }
        },
        {
            celebrateBirthday: function() {
                this.$super();
                this.hasRecentBirthday = true;
            }
        });

    * The call to this.$super() calls the parent method, which updates this.age.

        var kermit = new Person({age: 3, hasRecentBirthday: false, firstName: "Kermit"});
        p.celebrateBirthday();

        console.log(kermit.age)
        > 4
        console.log(kermit.hasRecentBirthday)
        > true

    * ### Step 4: Add some Private Properties
    *
    * As part of your property definition, you can specify which properties are private (default is public).
    * Private properties have exactly the same behaviors as public properties (validation, etc...) but also
    * provide some protection.

        var Animal = m_.Model.extend("Animal", {
            firstName: {
                type: "string"
            },
            age: {
                type: "integer",
                private: true // Some people don't like their age to be common knowledge...
            }
        }, {
            // getAge is a defined method of the "Animal" class, and therefore can access this.age.
            getAge: function() {
                // Protect privacy for young animals...
                if (age > 10) return this.age;
            }
        });

        var kermit = new Animal({firstName: "Kermit", age: 15});

        // This line of code is NOT inside of a defined method of the "Animal" class,
        // and therefore, access is denied
        console.log(kermit.age);
        > undefined

        // Private properties can ONLY be accessed by methods of that object
        console.log(kermit.getAge())
        > 15

    * While this solution can definitely be hacked, the primary goal is not to be hack proof,
    * but to prevent idle "that seems like a good idea" changing of private data to suit the short term needs
    * of third party developers, and potentially break something when they download the next update
    * to your library.
    *
    * #### Dangers of Using Private Properties
    *
    * There are some standard javascript practices that will no longer work if using private properties
    *
    * 1. You can not create an instance, setup the instance's private data and then return it.

        function createPerson() {
            var p = new Person();
            p.privateData = 5; // FAIL!!
            return p;
        }
    * 2. You can not access private data from anonymous functions

        var Animal = m_.Model.extend("Animal", {
            age: {
                type: "integer",
                private: true // Some people don't like their age to be common knowledge...
            }
        }, {
            // These functions are part of the class definition, and so can access private data
            setAge: function(inValue) {
                this.age = inValue; // SUCCESS!!
            },
            loadAge: function() {
                xhr.get({
                    url: "http://gettingold.com/howOldAmI",
                    onSuccess: function(age) {
                        this.age = age; // FAIL, onSuccess is NOT a method of Animal!!
                        this.setAge(age); // SUCCESS!!
                    }
                });
            }
        });

    * 3. You can not tack on new methods

        var p = new Person();
        p.getAge = function() {
            return this.age; // FAIL, This function was not part of the Class Definition
        };

        Person.prototype.getAge = function() {
            return this.age; // FAIL, This function was not part of the Class Definition
        };

    * ### Step 5: Further refine your property definitions
    * - **type**: A string specifying the type: integer, double, string, boolean, object, Date, Person, Animal.
    *
    *   Type may also be an array: [integer], [double], [string], [Person], etc...

            {
                scores: {
                    type: "[number]"
                },
                grade: {
                    type: "string"
                },
                lastTest: {
                    type: "Date"
                }
            }

    * - **required**: A boolean indicating if the value is required.  Will cause error to be thrown any time you create an object without that property.
    * Will throw an error any time you set the value of that property to null, undefined or "".

            firstName: {
                type:  "string",
                required: true
            }

    * - **private**: A boolean indicating that the property is a private property
    *
    * - **autoAdjust**: A boolean indicating that a property should adjust its value to resolve validation errors.
    *    For boolean fields, if this is true, it will convert truthy/falsy values to true/false.
    *    For dates, it will attempt to convert strings and numbers to dates.
    *    For numbers, it will test to see if a string contains a number ("5" yes, "5fred" no)

            age: {
                type: "integer",
                autoAdjust: true
            }

    * - **readOnly**: A boolean indicating if the property can be changed after the constructor has completed.

    * - **defaultValue**: The default value to use for this property if none is specified in the constructor

        var Animal = m_.Model.extend("Animal", {
            age: {
                type: "integer",
                defaultValue: 1
            }
        });

        var kermit = new Animal({});
        console.log(kermit.age);
        > 1

        ver piggy =new Animal({age: 90});
        console.log(piggy.age);
        > 90

    * ### Step 6: Add methods to refine property behaviors
    *
    * - **Adjuster**: You can add an adjuster method for your property to adjust the value being set.

        var Animal = m_.Model.extend("Animal", {
            first_name: {
                type: "string"
            }
        }, {
            // If the name evaluates to falsy, use the previous name or "Fred".
            adjustFirstName: function(inValue) {
                if (!inValue) {
                    if (this.first_name) {
                        return this.first_name;
                    } else {
                        return "Fred";
                    }
                }
                // If no return, then inValue is accepted as is
            }
        });

        var kermit = new Animal();
        kermit.firstName = "";
        console.log(kermit.firstName);
        > Fred

        kermit.firstName = "Kermit";
        console.log(kermit.firstName);
        > Kermit

    *     your function must be named
    *     adjust<cammelCase(propertyName)>; the first letter of your propertyName will always be upperCased (even if the property itself starts with a lowercase letter).
    *     If the adjuster does not return a value, then the property will be set with the original value.
    *     If the adjuster returns a value, then the property will be set to the returned value.
    *     - The adjuster is run BEFORE validation
    *     - The adjuster will cause autoAdjust to be ignored.

    * - **Validator**: You can add a custom validator for your property.

        var Animal = m_.Model.extend("Animal", {
            first_name: {
                type: "integer",
                defaultValue: 1
            }
        }, {
            // Accepts all names except "Kermit"
            validateSetFirstName: function(inValue) {
                if (inValue == "Kermit") {
                    return "There can be only one!" // immortal frog
                }
            }
        });

    *    This is run after the standard
    *     validator that comes with your property type.  So if your property type is "integer", and you pass in a string,
    *     your custom validator will not be reached.
    *
    *     Your function must be named validateSet<cammelCase(propertyName)>. The first letter of
    *     your propertyName will always be upperCased.
    *     If your validator returns a value, its assumed to be an error message, and a complete error message is
    *     assembled and thrown for you.
    *
    *     NOTE: *Do not throw an error; return a string from your validators!*
    *
    *     Use a type of "any" to disable automatic validation and only use your
    *     validator.
    *
    *
    * ### Step 7: Setup event handlers if needed

         kermit.on("age:changed", function(newAge, oldAge) {
           if (newAge > oldAge) console.log("I'm getting Old!");
         }, this);

         kermit.age = 55;
         > I'm getting Old!

    * Every defined property will fire an event when its value changes, and you can subscribe using
    * object.on("&lt;propertyName>:changed", callback, context);
    *
    * You can also subscribe to ALL changes on an object:

        kermit.on("changed", function(propertyName, newValue, oldValue) {
            console.log(propertyName + " is now " + newValue);
        }, this);

        kermit.firstName = "piggy";
        > firstName is now piggy

        kermit.age = 50;
        > age is now 50
    * END-GIT-README
    */


// Compile with
// > watchify model.js -d -o build/model.js
// var m_ = require("./miniunderscore.js");

// TODO: Need to evolve the concept of setLock().  Suggestion:
//       1. All methods passed in when defining a new object are automatically wrapped in setLock(false); f(); setLock(true);
//       2. Instead of lock being true/false, should be a number so we can increment it and decrement it as we go from method to method
//       3. Events should be fired asynchronously so that we do not directly call third party code while the locks are disabled.
//          Events can be called via m_.defer() to wait 1ms before firing.
// TODO: JsDoc / github Readme
// TODO: Add listeners to constructor?
// TODO: Support for private methods?
// TODO: Consider: Can we make accessing __privates go through a getter, have it check the caller, and only allow the caller if
// the caller is a method of "this"?
(function() {
    var modelInit = false;

    var Model = function(params) {
        if (!modelInit) {
            this.__values = {
                __notinitialized: true
            };


            /* For each property passed in via the constructor, set the appropriate private/public value */
            var defs = this.__class.$meta.properties;
            if (params) {
                m_.each(params, function(value, name) {
                    if (defs[name]) {
                        if (defs[name].private) {
                            this[name] = value;
                        } else {
                            this[name] = value;
                        }
                    }
                }, this);
            }


            /* For each unset property with a default value, set the appropriate private/public value */
            var allDefaults = this.__class.$meta.defaults;
            m_.defaults(this, allDefaults);


            // Enforce required fields
            m_.each(this.__class.$meta.properties, function(value, name, src) {
                if (this[name] === undefined && src[name].required) {
                    this[name] = null;
                }
            }, this);

            this.init.apply(this, arguments);
            delete this.__values.__notinitialized;
            Object.seal(this);
        }

    };

    // Enable events on all Model instances/sublcasses
    m_.extend(Model.prototype, window.BackboneEvents);
    Model.prototype._events = {};
    window.m_.Model = Model;

    function isPrivateAllowed(caller, callerName) {
        if (this.__values.__notinitialized) return true;

        var callerFuncName = caller.$name;

        // Make sure there is in fact a function name
        if  (!callerFuncName) return false;

        // Make sure there is a function of that name declared for this object
        if (this.__class.$meta.functions[callerFuncName].indexOf(caller.toString()) == -1) return false;

        return true;
    }

    /* getInternalName generates a semi-random internal property name to make it a little harder to hack into
     * our values object and bypass all setters/getters
     */
    var propPrefix = String(Math.random()).substring(2,6).split("").map(function(c) {
        return String.fromCharCode("a".charCodeAt(0) + Number(c));
    }).join("");
    function getInternalName(name) {
        return propPrefix + (name.length > 2 ? name.substring(2) + name.substring(0,2) : name);
    }

    function genericGetter(def, caller, name) {
        if (def.private) {
            if (!isPrivateAllowed.call(this, caller)) {
                console.warn(name + ": Private property accessed from context that is not a method of the object");
                return;
            }
        }
        return this.__values[getInternalName(name)];
    }

    function genericSetter(def, caller, name, inValue) {

        if (def.private) {
            if (!isPrivateAllowed.call(this, caller)) {
                console.warn(name + ": Private property accessed from context that is not a method of the object");
                return;
            }
        }

        var altValue, adjuster, values = this.__values;

        /* Step 1: If readOnly property, only set it if we are in the constructor */
        if (def.readOnly && !values.__notinitialized) {
            console.warn("Set " + name + " to " + inValue + " ignored; readOnly property");
            return;
        }

        /* Step 2: Adjust the value according to custom logic for that property, or standard
         * autoAdjust logic for that type (booleans use truthiness; numbers accept numerical strings, dates, accept Longs, etc...)
         */
        adjuster = this["adjust" + m_.camelCase(name, true)];
        if (adjuster) {
            altValue = adjuster(inValue);
            if (altValue !== undefined) inValue = altValue;
        } else if (def.autoAdjust) {
            adjuster = this["autoAdjust" + m_.camelCase(def.type, true)];
            if (adjuster) {
                altValue = adjuster(inValue);
                if (altValue !== undefined) inValue = altValue;
            }
        }

        /* Step 3: Simplify code by assuming undefined is never used */
        if (inValue === undefined) inValue = null;

        /* Step 4: Support required fields */
        if (def.required && (inValue === null || inValue === "")) throw new Error(name + ": is required");

        /* Step 5: Throw errors on receiving invalid values */
        var validator = getValidator(def.type), validatorResult;
        if (validator) {
            if (def.type.charAt(0) == "[") {
                if (inValue !== null) {
                    if (!m_.isArray(inValue)) {
                        throw new Error(name + ": must be an array");
                    }
                    var invalidValue = m_.find(inValue, validator);
                    if (invalidValue !== undefined) {
                        throw new Error(name + ": " + validator(invalidValue));
                    }
                }
            } else {
                validatorResult = validator(inValue);
            }
            if (validatorResult) throw new Error(name + ": " + validatorResult);
        } else if (inValue !== null && def.type != "any") {
            if (classRegistry[def.type]) {
                if (!(inValue instanceof classRegistry[def.type])) {
                    throw name + ": must be of type " + def.type;
                }
            } else if (({}).toString.call(inValue) != "[object " +  def.type + "]") {
                throw name + ": must be of type " + def.type;
            }
        }

        /* Step 6: Run custom validator */
        validator = this["validateSet" + m_.camelCase(name, true)];
        if (validator) {
            validatorResult = validator(inValue);
            if (validatorResult) throw new Error(name + ": " + validatorResult);
        }

        /* Step 6: Set the value */
        var internalName = getInternalName(name);
        var originalValue = values[internalName];
        if (originalValue !== inValue) {
            values[internalName] = inValue;
            this.trigger(name + ":changed", inValue, originalValue);
            this.trigger("changed", name, inValue, originalValue);
        }

    }


    function defineProperty(model, name, def) {
        if (def.type == "number") def.type = "integer"; // fix common user error
        Object.defineProperty(model.prototype, name, {
            enumerable: !def.private,
            configurable: def.type == "any",
            get: function get() {
                return genericGetter.call(this, def, arguments.callee.caller, name);
            },
            set: function set(inValue) {
                return genericSetter.call(this, def, arguments.callee.caller, name, inValue);
            }
        });
    }

    // TODO: See about changing this to a hash instead of a function
    function getValidator(type) {
        switch(type.toLowerCase()) {
            case "integer":
            case "[integer]":
                return validateSetInteger;
            case "double":
            case "[double]":
                return validateSetDouble;
            case "string":
            case "[string]":
                return validateSetString;
            case "boolean":
            case "[boolean]":
                return validateSetBoolean;
            case "date":
            case "[date]":
                return validateSetDate;
            case "object":
            case "[object]":
                return validateSetObject;
        }
    }

    // TODO: Validators need to handle type of "[integer]"
    // TODO: Validators do not need to be on the prototype of the object, they could just be functions called by the setter.
    function validateSetInteger(inValue) {
        if (typeof inValue != "number") return inValue + " is of type " + (typeof inValue) + " not number";
        if (isNaN(inValue)) return inValue + " is not a number";
        if (inValue % 1 != 0) return inValue + " is not an integer";
    };

    function validateSetDouble(inValue) {
        if (typeof inValue != "number") return inValue + " is of type " + (typeof inValue) + " not number";
        if (isNaN(inValue)) return inValue + " is not a number";
    };

    function validateSetString(inValue) {
        if (typeof inValue != "string") return inValue + " is of type " + (typeof inValue) + " not string";
    };

    function validateSetBoolean(inValue) {
        if (typeof inValue != "boolean") return inValue + " is of type " + (typeof inValue) + " not boolean";
    };

    function validateSetDate(inValue) {
        if (!(inValue instanceof Date)) return inValue + " is not a Date";
        if (isNaN(inValue.getTime())) return inValue + " is not a valid Date";
    };

    function validateSetObject(inValue) {
        if (typeof inValue != "object") return inValue + " is of type " + (typeof inValue) + " not object";
    };

    Model.prototype.autoAdjustInteger = function(inValue) {
        if (typeof inValue == "string" && !isNaN(inValue)) return Number(inValue);
    };
    Model.prototype.autoAdjustDouble = Model.prototype.autoAdjustInteger;

    Model.prototype.autoAdjustBoolean = function(inValue) {
        if (typeof inValue != "boolean") return Boolean(inValue);
    };

    Model.prototype.autoAdjustDate = function(inValue) {
        var result;
        switch(typeof inValue) {
            case "number":
            case "string":
                result = new Date(inValue);
                break;
        }
        if (result && !isNaN(result.getTime())) return result;
    };

    /**
     * Every Class can provide a init method.  This one is just a place holder
     * @method init
     */
    Model.prototype.init = function() {
    };

    /**
     * Call the parent class method.  If there is no parent class method, does nothing.
     * @method $super
     * @example
     * // Automatically passes howMuch and airQuality to the parent method
     * Person.prototype.breath = function(howMuch, airQuality) {
     *     this.$super();
     * }
     *
     * // Passes only the values specifed to the parent method
     * Person.prototype.breath = function(howMuch, airQuality) {
     *     this.$super(howMuch, "truely awful");
     * }
     */
    Model.prototype.$super = function() {
        var caller = arguments.callee.caller;
        var f = caller.$super;
        var args;
        if (f) {
            args = arguments.length ? arguments : caller.arguments;
            return f.apply(this, args);
        }
    }

    /* Unfortunate use of eval, needed until we find a better way to make the class name actually show up
     * in the debugger as the name of the class.  Previously showed up as Model.extend.newfunc.
     */
    function makeCtor(name) {
        return eval("function " + name + "(){this.__class = " + name + "; Model.apply(this, arguments);}; " + name);
    }


    /**
     * Define a new class, which will contain the specified properties and methods.
     *
     * @static
     * @method extend
     * @param {String} className - Name of the class; currently this is used solely
     *                 for debugging.  The name you give determines how instances of the class show up in the debugger.
     * @param {Object} propertySpec - Specification for the properties; see Model documentation for details and examples
     * @param {Object} [functionSpec] - Hash of methods for your class
     * @returns {Function} - Returns a class definition which can be used to create instances of the class
     */
    var classRegistry = {};
    Model.extend = function(className, propertySpec, functionSpec) {
        modelInit = true;
        if (m_.isObject(className)) {
            functionSpec = arguments[1];
            propertySpec = arguments[0];
            className = "Anonymous";
        }
        var constructor= makeCtor(className);
        constructor.prototype = new this();
        classRegistry[className] = constructor;

        if (functionSpec) {
            m_.each(functionSpec, function(func, name) {
                func.$name = name; // Used to verify private properties are accessed by object methods
                func.$super = constructor.prototype[name];
                constructor.prototype[name] = func;
            });
        }

        var fullSpec = this.$meta ? m_.extend({}, this.$meta.properties, propertySpec) : propertySpec;

        // Build a searchable index of all functions of this object so we can validate private accessors
        var fullFunc = {};
        m_.each(this.$meta.functions, function(funcList, funcName) {
            fullFunc[funcName] = funcList.concat([]); // clone the array
        }, this);
        m_.each(functionSpec, function(func, funcName) {
            if (!fullFunc[funcName]) fullFunc[funcName] = [];
            fullFunc[funcName].push(func.toString());
        }, this);

        constructor.$meta = {
            properties: fullSpec,
            superclass: this,
            defaults: this.$meta ? m_.clone(this.$meta.defaults) : {},
            functions: fullFunc
        };

        // Any third party dev can access person.__class.$meta.functions and add/remove stuff to it.
        // So, freeze it.
        m_.each(fullFunc, function(arrayOfFuncs) {Object.freeze(arrayOfFuncs);});
        Object.freeze(fullFunc);


        // parent method properties should not need to be defined
        m_.each(propertySpec, function(inValue, inKey) {
            defineProperty(constructor, inKey, inValue);
            if ("defaultValue" in inValue) constructor.$meta.defaults[inKey] = inValue.defaultValue;
        }, this);

        constructor.extend = Model.extend;

        Object.seal(constructor.prototype);
        modelInit = false;
        return constructor;
    };
    Model.$meta = {
        properties: {
            name: "constructor",
            type: "any" // TODO: Support function
        },
        superclass: null,
        defaults: {},
        functions: {}
    };
})();
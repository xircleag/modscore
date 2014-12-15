/**
 * @class overscore.Model
 * @author Michael Kantor
 *
 * START-GIT-README
 *
 * ### Requirements
 *
 * A browser more modern than IE8
 * NOTE: Private properties do not work in nodejs/phantomjs
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
            name: "Animal",

            // Argument 2: An object defining all of your properties
            properties: {
                firstName: {
                    type: "string"
                },
                age: {
                    type: "integer"
                }
            },

            // Argument 3: An object defining all methods for your class
            methods: {
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

        var Person = Animal.extend({
            name: "Person", {
            properties: {
                lastName: {
                    type: "string"
                },
                hasRecentBirthday: {
                    type: "boolean"
                }
            },
            methods: {
                celebrateBirthday: function() {
                    this.$super();
                    this.hasRecentBirthday = true;
                }
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

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                firstName: {
                    type: "string"
                },
                age: {
                    type: "integer",
                    private: true // Some people don't like their age to be common knowledge...
                }
            },
            methods: {
                // getAge is a defined method of the "Animal" class, and therefore can access this.age.
                getAge: function() {
                    // Protect privacy for young animals...
                    if (age > 10) return this.age;
                }
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

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                age: {
                    type: "integer",
                    private: true // Some people don't like their age to be common knowledge...
                }
            },
            methods: {
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

    * #### Also use privateSetter
    * Note that you can also use a privateSetter; this makes a property readonly to the public
    * but settable to your class:

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                age: {
                    type: "integer",
                    privateSetter: true,
                    defaultValue: 13
                }
            }
        });
        var dog = new Animal();
        console.log(dog.age);
        > 13
        dog.age = 3;
        > Fail!

    * #### Also use private methods
    * Your methods can be declared with a method definition instead of just a function;
    * this is done using a JS Object with the *method* property containing your function.

        var Animal = m_.Model.extend({
            name: "Animal",
            methods:  {
                privateAlert: {
                    private: true,
                    method: function() {
                        console.log("Hello");
                    }
                },
                alert: function() {
                    this.privateAlert();
                }
            }
        });

        var kermit = new Animal();
        kermit.__alert();
        > Throws error;

        kermit.alert();
        > "Hello"

    * ### Step 5: Further refine your property definitions
    * - **type**: A string specifying the type: integer, double, string, boolean, object, Date, Person, Animal.
    *
    *   Type may also be an array: [integer], [double], [string], [Person], etc...
    *   Validation will trigger on setting an array property (and will check every value of the array)
    *   but does not at this time validate manipulation of the array after its set (push/pop/shift)

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

    * - **create**: If **type** specifies a Model class, setting create to true, tells
    * the class to always create an instance of this class when instantiating itself:

        var Child = Person.extend({
            name: "Child",
            properties: {
                mother: {
                    type: "Person",
                    create: true
                },
                father: {
                    type: "Person",
                    create: true
                }
            }
        });
        var p = new Child();

        // The mother object was created automatically, firstName will be whatever
        // default value was specified
        alert(p.mother.firstName);

    * If you provide a suitable instance of the right type, then create is ignored;
    * this example uses the specified mother and creates a new father.

        var p = new Child({
            mother: new Person({firstName: "Mom"})
        });
        alert(p.mother.firstName); // "Mom"
        alert(p.father.firstName); // Default value

    * Note that this class can be overridden using the special *$class* parameter

        var p = new Child({
            mother: {
                $class: Dog
            },
            father: {
                $class: Cat
            }
        });

        alert(p instanceof Dog); // false
        alert(p.mother instanceof Dog); // true
        alert(p.father instanceof Dog); // false
        alert(p.father instanceof Cat); // true

    * This technique can be used to replace one class with a different implementation of the same
    * capabilities/APIs (typically a subclass of the original class that provides some custom behaviors)

    * - **params**: If create is true, params lets you specify default properties to pass
    * to the child component when its created

        var Child = Person.extend({
            name: "Child",
            properties: {
                mother: {
                    type: "Person",
                    create: true,
                    params: {
                        firstName: "Mom"
                    }
                },
                father: {
                    type: "Person",
                    create: true,
                    params: {
                        firstName: "Dad"
                    }
                }
            }
        });
        var p = new Child();
        alert(p.mother.firstName); // "Mom"
        alert(p.mother.lastName); // Default value

    * Note that you can pass properties to these subcomponents in the constructor as well:

        var p = new Child({
            mother: {
                firstName: "Mom2",
                lastName: "Saruman"
            }
        });
        alert(p.mother.firstName); // "Mom2" // value from constructor
        alert(p.father.firstName); // "Dad"  // value from params

    * - **events**: When creating a component (create:true), map events from
    * the created object to functions or to methods of this object.

        var Child = Person.extend({
            name: "Child",
            properties: {
                mother: {
                    type: "Person",
                    create: true,
                    params: {
                        firstName: "Mom"
                    },
                    events: {
                        "change:firstName": function(newValue,oldValue) {alert(newValue);},
                        "change:lastName": "this.handleMotherLastNameChange"
                    }
                }
            }
        });

    * Note the use of "this.functionName"; if we were to use this.functionName without quotes,
    * you'd be accessing this at a place where its definition is ambiguous.  Quoting them tells the
    * class system to map the event to each instance of the class you are defining.

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

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                age: {
                    type: "integer",
                    defaultValue: 1
                }
            }
        });

        var kermit = new Animal({});
        console.log(kermit.age);
        > 1

        ver piggy =new Animal({age: 90});
        console.log(piggy.age);
        > 90

    * - **silent**: A property that does not trigger any events on changing.  Used for
    * performance, and to avoid repeatedly triggering "all" subscriptions for internal properties

    * - **silentInit**: A property that lets you change the default behavior when initializing a property of NOT
    * firing events and updaters.  Override this with:

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                age: {
                    type: "integer",
                    defaultValue: 1,
                    silentInit: false // now fires events before object has finished initializing
                }
            }
        });

    * ### Step 6: Add methods to refine property behaviors
    *
    * - **Adjuster**: You can add an adjuster method for your property to adjust the value being set.

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                first_name: {
                    type: "string"
                }
            },
            methods: {
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
            }
        });

        var kermit = new Animal();
        kermit.first_name = "";
        console.log(kermit.firstName);
        > Fred

        kermit.first_name = "Kermit";
        console.log(kermit.firstName);
        > Kermit

    *     your function must be named
    *     adjust<cammelCase(propertyName)>; the first letter of your propertyName will always be upperCased (even if the property itself starts with a lowercase letter).
    *     If the adjuster does not return a value, then the property will be set with the original value.
    *     If the adjuster returns a value, then the property will be set to the returned value.
    *     - The adjuster is run BEFORE validation
    *     - The adjuster will cause autoAdjust to be ignored.
    *
    * - **Updater**: You can add an update method for your property to update behaviors for the new value.
    * Your method is called AFTER the value has been set (unlike adjuster which is called before its set)

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                firstName: {
                    type: "string"
                },
                fullName: {
                    type: "string"
                }
            },
            methods: {
                updateFirstName: function(newValue, originalValue) {
                    this.fullName = "Fred the " + this.first_name;
                }
            }
        });

        var kermit = new Animal();
        kermit.firstName = "";
        console.log(kermit.fullName);
        > Fred the

        kermit.firstName = "Kermit";
        console.log(kermit.fullName);
        > Fred the Kermit

    *     your function must be named
    *     update<cammelCase(propertyName)>; the first letter of your propertyName will always be upperCased (even if the property itself starts with a lowercase letter).

    * - **Validator**: You can add a custom validator for your property.

        var Animal = m_.Model.extend({
            name: "Animal",
            properties: {
                first_name: {
                    type: "integer",
                    defaultValue: 1
                }
            },
            methods: {
                // Accepts all names except "Kermit"
                validateSetFirstName: function(inValue) {
                    if (inValue == "Kermit") {
                        return "There can be only one!" // immortal frog
                    }
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

         kermit.on("change:age", function(newAge, oldAge) {
           if (newAge > oldAge) console.log("I'm getting Old!");
         }, this);

         kermit.age = 55;
         > I'm getting Old!

    * Every defined property will fire an event when its value changes, and you can subscribe using
    * object.on("change:&lt;propertyName>", callback, context);
    *
    * You can also subscribe to ALL changes on an object:

        kermit.on("change", function(propertyName, newValue, oldValue) {
            console.log(propertyName + " is now " + newValue);
        }, this);

        kermit.firstName = "piggy";
        > firstName is now piggy

        kermit.age = 50;
        > age is now 50
    *
    * You can disable triggering of events using the m_.SilentValue object in your assignments

        kermit.firstName = "Kermit"; // Triggers "change" and "change:firstName"
        kermit.firstName = new m_.SilentValue("Kermit"); // Sets the name to Kermit; no events fire

    * The following events are built into the Model
    * - change:propertyName: The named property has changed
    * - change: The object has changed
    * - destroy: The object has been destroyed
    *
    * # Static methods/properties
    * m_.extend({statics: *staticDefinitions*})
    *
    * Static methods add your methods to the class definition:

        m_.extend({
            name: "Person",
            methods: {
                isEaten: function() {
                    alert("Ouch!");
                }
            },
            statics: {
                people: [],
                eatThemAll: function() {
                    Person.people.forEach(function(person){ person.isEaten();});
                }
            }
        })
        Person.eatThemAll();
        Person.people.push(new Person());
    *
    * The static method *init* is called as soon as the class is defined, allowing static setup
    * to be done:

        m_.extend({
            name: "Person",
            statics: {
                init: function() {
                   alert(this.name + " has been created");
                }
            }
        });

    * ## Dependency Injection
    * While this does not support a true dependency injection system, it does allow every class to define a role,
    * and any number of classes can implement that role:

        var Person = m_.extend({
            name: "Person",
            role: "Developer"
        });

        var Robot = m_.extend({
            name: "Robot",
            role: "Developer"
        });

        var Developer = m_.Model.getClass("Developer");
        new Developer();

    * The above code will create a new Person or Robot, depending on which has been defined.
    * If both are defined, only the first one will be used.
    *
    * ## Customization through AOP
    * Any method defined using

        methods: {
            // This
            funcA: {
                method: function(){}
            },
            // Not This
            funcB: function()
        }

    * can have their behaviors and side effects customized through aspect oriented concepts.
    * The after() method lets you customize functions such as funcA, and optionally modify their
    * return value.

        // Side effect; funcA is run, then our function causes its
        // side effects
        Person.after("funcA", function(args) {
            this.lastName += "ity";
        });

        // New return value; funcA is run, but the value returned
        // to the caller is the value we've returned (if we return a value)
        Person.after("funcA", function(args) {
            return "Fred";
        });

    * The around() method lets methods that are defined to support it be wrapped
    * in a new function that controls if its executed, and what its parameters are

        // Decide whether or not to call funcA
        Person.around("funcA", function(originalFunc, arg1, arg2...) {
            if (!this.isDead) originalFunc(arg1,arg2);
        });

        // Modify the arguments to funcA
        Person.around("funcA", function(originalFunc, arg1, arg2...) {
            originalFunc("Fred",arg2);
        });

        // Call funcA asynchronously
        Person.around("funcA", function(originalFunc, arg1, arg2...) {
            checkWithServerIfPersonIsAlive(function(alive) {
                if (alive) originalFunc(arg1,arg2);
            });
        });

    *

    * END-GIT-README
    */


// Future work:
// var m_ = require("./miniunderscore.js");

// TODO: Events should be fired asynchronously so that we do not directly call third party code while the locks are disabled.
//       Events can be called via m_.defer() to wait 1ms before firing.
// TODO: Add listeners to constructor?
// TODO: Support for private methods?
(function() {
    var m_ = require("./util.js");
    var Events = require("./events.js");
    var modelInit = false;
    var disablePrivateLock = false;
    // NOTE: May have to change this once we start using browserify

    var isNode = typeof global !== "undefined" && typeof window === "undefined" || navigator.userAgent.match(/PhantomJS/);


    if (!global.modscore) global.modscore = {};
    var classRegistry = global.modscore.classRegistry = global.modscore.classRegistry || {};
    var roleRegistry = global.modscore.roleRegistry = global.modscore.roleRegistry || {};

    if (classRegistry.Model) {
        module.exports = classRegistry.Model;
        return;
    }

    var SilentValue = m_.SilentValue = function(inValue) {
        this.value = inValue;
    };

    var Model = function(params) {
        if (!modelInit) {
            params = params ? m_.clone(params) : {};
            this.__values = {
                __notinitialized: true
            };

            this.internalId = m_.uniqueId(params && params.internalId ? params.internalId : this.__class.name)
            delete params.internalId; // only safe because we cloned params; else this could cause problems.

            this.__isDestroyed = false;
            this._events = {};
            this._subscriptions = [];


            /* For each property passed in via the constructor, set the appropriate private/public value */
            var defs = this.__class.$meta.properties;
            this.__values.__processConstructorParams = true;
            m_.each(defs, function(def, name) {
                var type = Model.getClass(def.type);
                // If the type represents a model, and def.create says we careate an instance
                // of that model, then either the value is an Object (parameters for creating
                // that model) or a Model (to be used as the value, skipping create).
                if (!type || !(type.prototype instanceof Model.getClass("Collection"))) {
                    if (!def.create || params[name] instanceof Model || !type || !(type.prototype instanceof Model)) {
                        if (name in params) {
                            this[name] = params[name];
                        } else if (def.type.indexOf("[") === 0) {
                            this[name] = [];
                        }
                    }
                }
            }, this);

            /* For each unset property with a default value, set the appropriate private/public value */
            var allDefaults = this.__class.$meta.defaults;

            // NOTE: m_.defaults fails in case where we assigned an [] to an array type.
            //m_.defaults(this, allDefaults);
            m_.each(allDefaults, function(value, name) {
                if (!(name in params)) this[name] = value;
            }, this);


            m_.each(defs, function(def,name) {
                var type = Model.getClass(def.type);
                if (type && type.prototype instanceof Model.getClass("Collection")) {
                    this[name] = new type(m_.extend({owner:this},def.params));
                    setupEvents.call(this, this[name], def);
                    if (name in params) this[name] = params[name];
                } else if (!(params[name] instanceof Model) && def.create && type && type.prototype instanceof Model) {
                    if (params[name] && params[name].$class) {
                        type = params[name].$class;
                    }
                    var localParams = {};
                    m_.each(def.params, function(value, name) {
                        if (String(value).indexOf("this.") == 0) {
                            localParams[name] = this[value.substring(5)];
                        } else {
                            localParams[name] = value;
                        }
                    }, this);
                    if (m_.isObject(params[name])) m_.extend(localParams, params[name]);
                    this[name] = new type(localParams);
                    setupEvents.call(this, this[name], def);
                }
            }, this);
            delete this.__values.__processConstructorParams;

            // Enforce required fields
            m_.each(this.__class.$meta.properties, function(value, name, src) {
                if (this[name] === undefined && src[name].required) {
                    this[name] = null;
                }
            }, this);

            if (params.events) this.on(params.events);

            this.init.apply(this, arguments);
            var postInit = this.postInit;
            if (postInit) postInit.apply(this);
            delete this.__values.__notinitialized;
            Object.seal(this);
            this.trigger("new", this);
        }

    };

    // Enable events on all Model instances/sublcasses
    m_.extend(Model.prototype, Events);
    Model.prototype._events = null;
    Model.prototype._subscriptions = null;

    function setupEvents(obj, def) {
        if (def.events) {
            var events = {};
            m_.each(def.events, function(value, name) {
                if (String(value).indexOf("this.") == 0) {
                    events[name] = this[value.substring(5)].bind(this);
                } else {
                    events[name] = value;
                }
            }, this);
            obj.on(events);
        }
    }

    /* istanbul ignore next: private methods can't be tested on phantomjs */
    function isPrivateAllowed(caller) {
        if (modelInit || this.__values.__notinitialized) return true;

        // should only happen from nodejs
        if (isNode) return true;

        var callerFuncName = caller.$name;

        // Make sure there is in fact a function name
        if (!callerFuncName) return false;

        // Static methods should have access to private methods?
        if (callerFuncName.indexOf("STATIC ") === 0) {
            callerFuncName = callerFuncName.substring(7);
            if (!this.__class[callerFuncName] || this.__class[callerFuncName] != caller) return false;
        } else {
            // Make sure there is a function of that name declared for this object
            if (!this.__class.$meta.functions[callerFuncName] || this.__class.$meta.functions[callerFuncName].indexOf(caller.toString()) == -1) return false;
        }

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
        /* istanbul ignore if: Privates not tested */
        if (def.private) {
            if (!isPrivateAllowed.call(this, caller)) {
                console.warn(name + ": Private property accessed from context that is not a method of the object");
                return;
            }
        }
        return this.__values[getInternalName(name)];
    }


    function setterPreProcess(def, caller, name, inValue, values) {
        var result = {};
        var validatorResult;
        var type, validator;
        /* istanbul ignore if: Privates not tested */
        if (def.private || def.privateSetter) {
            if (!isPrivateAllowed.call(this, caller)) {
                console.warn(name + ": Private property accessed from context that is not a method of the object");
                return;
            }
        }

        var altValue, adjuster, silent;
        if (inValue instanceof SilentValue) {
            silent = true;
            inValue = inValue.value;
        } else if (values.__notinitialized && def.silentInit !== false) {
            silent = true;
        }

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
            altValue = adjuster.call(this, inValue);
            if (altValue !== undefined) inValue = altValue;
        } else if (def.autoAdjust) {
            adjuster = this["autoAdjust" + m_.camelCase(def.type, true)];
            if (adjuster) {
                altValue = adjuster(inValue);
                if (altValue !== undefined) inValue = altValue;
            }
        } else {
            type = def.type ? Model.getClass(def.type) : null;
            if (type && type.prototype instanceof Model.getClass("Collection")) {
                if (this.adjustCollection(inValue, name, silent)) {
                    return;
                }
            }
        }

        /* Step 3: Simplify code by assuming undefined is never used */
        if (inValue === undefined) inValue = null;

        /* Step 4: Support required fields */
        if (def.required && (inValue === null || inValue === "")) throw new Error(name + ": is required");

        /* Step 5: Throw errors on receiving invalid values. Note: null/undefined are
         * only invalid if the field is required.
         */
        if (inValue !== null) {
            validator = getValidator(def.type);
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
            } else if (inValue !== null && def.type != "any" && def.type != "[any]") {
                validator = function(inValue, type) {
                    if (classRegistry[type]) {
                        if (!(inValue instanceof classRegistry[type])) {
                            throw name + ": must be of type " + type;
                        }
                    } else if (roleRegistry[type]) {
                        if (!(inValue instanceof roleRegistry[type])) {
                            throw name + ": must be of type " + type;
                        }
                    } else if (({}).toString.call(inValue) != "[object " +  type + "]") {
                        throw name + ": must be of type " + type;
                    }
                };
                if (def.type.charAt(0) == "[") {
                    type = def.type.substring(1,def.type.length-1);
                    m_.each(inValue, function(v) {
                        validator.call(this, v, type);
                    }, this);
                } else {
                    validator.call(this, inValue, def.type);
                }
            }
        } else if (def.type == "string") {
            inValue = "";
        }

        /* Step 6: Run custom validator */
        validator = this["validateSet" + m_.camelCase(name, true)];
        if (validator) {
            validatorResult = validator(inValue);
            if (validatorResult) throw new Error(name + ": " + validatorResult);
        }

        return {value: inValue, silent: silent};
    }

    function genericSetter(def, caller, name, inValue) {
        var values = this.__values;
        var result = setterPreProcess.apply(this, [def,caller,name,inValue, values]);
        if (!result) return;
        inValue = result.value;
        var silent = result.silent || def.silent;


        /* Step 6: Set the value */
        var internalName = getInternalName(name);
        var originalValue = values[internalName];
        if (originalValue !== inValue) {
            // Do not set a private array to be a pointer passed into the
            // constructor... that pointer is something that the caller of the
            // constructor can modify at will, making it not very private.
            if (this.__values.__processConstructorParams && def.private && m_.isArray(inValue)) inValue = inValue.concat([]);
            values[internalName] = inValue;
            if (!silent) {
                // call postUpdater before notifying others of the change in the widget's state
                disablePrivateLock = true;
                try {
                    var postUpdater = this["update" + m_.camelCase(name, true)];
                    if (postUpdater) postUpdater.apply(this, [inValue, originalValue]);
                } catch(e) {}
                disablePrivateLock = false;
                this.trigger("change:" + name, inValue, originalValue);
                this.trigger("change", name, inValue, originalValue);

            }
        }

    }


    function defineProperty(model, name, def) {
        if (def.type == "number") def.type = "integer"; // fix common user error
        Object.defineProperty(model.prototype, name, {
            enumerable: !def.private,
            configurable: def.type == "any",
            get: function get() {
// build two versions, let a company pick which one they want?
                return genericGetter.call(this, def, get.caller, name);
            },
            set: function set(inValue) {
                return genericSetter.call(this, def, set.caller, name, inValue);
            }
        });
    }

    /* istanbul ignore next: Privates not tested; */
    function functionGetter(model, def, caller, name) {
        if (def.private && !disablePrivateLock) {
            if (!isPrivateAllowed.call(this, caller) && !m_.isFunction(model[name])) {
                console.warn(name + ": Private property accessed from context that is not a method of the object");
                return;
            }
        }
        var aopData = this.__class.$meta.aopFuncs[name];
        var func    = this.__class.$meta.__functions[name];
        if (aopData && !def.private) {
            var f = function() {
                var i, result, tmp;
                result = func.apply(this, arguments);
                for (i = 0; i < aopData.after.length; i++) {
                    tmp = aopData.after[i].apply(this, arguments);
                    if (tmp !== undefined) result = tmp;
                }
                return result;
            }.bind(this);
            if (aopData.around.length) {
                return function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(f);
                    return aopData.around[0].apply(this,args);
                }.bind(this);
            } else {
                return f;
            }
        } else {
            return func;
        }
    }


    /* istanbul ignore next: defineFunc for private methods only; not tested in phantomjs */
    function defineFunc(model, name, def, func) {
        Object.defineProperty(model.prototype, name, {
            enumerable: false,
            configurable: true,
            get: function get() {
                return functionGetter.call(this, model, def, get.caller, name);
            }
        });
        model.$meta.__functions[name] = func;
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
        if (inValue % 1 !== 0) return inValue + " is not an integer";
    }

    function validateSetDouble(inValue) {
        if (typeof inValue != "number") return inValue + " is of type " + (typeof inValue) + " not number";
        if (isNaN(inValue)) return inValue + " is not a number";
    }

    function validateSetString(inValue) {
        if (typeof inValue != "string") return inValue + " is of type " + (typeof inValue) + " not string";
    }

    function validateSetBoolean(inValue) {
        if (typeof inValue != "boolean") return inValue + " is of type " + (typeof inValue) + " not boolean";
    }

    function validateSetDate(inValue) {
        if (!(inValue instanceof Date)) return inValue + " is not a Date";
        if (isNaN(inValue.getTime())) return inValue + " is not a valid Date";
    }

    function validateSetObject(inValue) {
        if (typeof inValue != "object") return inValue + " is of type " + (typeof inValue) + " not object";
    }

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

    Model.prototype.adjustCollection = function(inValue, inName, silent) {
        if (m_.isArray(inValue)) {
            var collection = this[inName];
            collection.setData(inValue, silent);
            return true;
        } else if (inValue && inValue instanceof Model.getClass("Collection")) {
            inValue.on("all", this.collectionEvent.bind(this,inValue), this);
            return false;
        }
    };

    /**
     * Every Class can provide a init method.  This one is just a place holder
     * @method init
     */
    Model.prototype.init = function() {
    };

    Model.prototype.isInitializing = function() {
        return this.__values.__notinitialized;
    };

    /**
     * Warning: If you implement your own destroy method, you should ALWAYS call this.$super() to insure
     * that all required cleanup is done
     *
     * @method
     * TODO: Destroying an object will remove all listeners from that object.  HOWEVER
     * Destroying an object should remove all listeners it has registered on other objects as well.
     */
    Model.prototype.destroy = function() {
        disablePrivateLock = true;
        try {
            this.__isDestroyed = true;
            this.owner = null;
            this.trigger("destroy");
            //this.off();
            this._events = null;
            this._subscriptions.forEach(function(item) {
                item.off(null,null,this);
            }, this);
            this._subscriptions = null;
        } catch(e){}
        disablePrivateLock = false;
    };

    Model.prototype.collectionEvent = function() {
        var args = Array.prototype.slice.call(arguments);
        var type = Model.getClass("Collection");
        if (type && args[0] instanceof Model.getClass("Collection")) {
            var collection = args.shift();
            if (collection.name) {
                args[0] = collection.name + ":" + args[0];
            }
            if (collection.evtModifier) {
                collection.evtModifier(args);
            }
        }

        this.trigger.apply(this, args);
    };

    Model.prototype.toString = function() {
        return "[" + this.internalId + "]";
    };

    Model.prototype.on = function(name, f, context) {
        if (context instanceof Model) context._subscriptions.push(this);
        Events.on.apply(this, arguments);
    };

    /**
     * Call the parent class method.  If there is no parent class method, does nothing.
     * @method $super

      // Automatically passes howMuch and airQuality to the parent method
      Person.prototype.breath = function(howMuch, airQuality) {
          this.$super();
      }

     * // Passes only the values specifed to the parent method
     * Person.prototype.breath = function(howMuch, airQuality) {
     *     this.$super(howMuch, "truely awful");
     * }
     *
     * DANGER: Use of arguments.callee disables code optimizers of most browsers.
     * We could replace calls to this.$super(...) with Person.prototype.myfunc.$super.call(this, ...)
     */
    Model.prototype.$super = function() {
        var caller = this.$super.caller;
        var f = caller.$super; // get the $super value we attached when defining the function
        var args;
        if (f) {
            args = arguments.length ? arguments : caller.arguments;
            return f.apply(this, args);
        }
    };

    /**
     * Creates a JSON structure using only the non-private properties of the object
     * @method
     */
     Model.prototype.toJson = function() {
        return JSON.stringify(this.toObject());
     };

     /**
     * Creates a JSON structure using only the non-private properties of the object
     * @method
     */
     Model.prototype.toObject = function() {
        var obj = {};

        m_.each(this.__class.$meta.properties, function(def, name) {
            if (!def.private && !(name in Model.prototype) && name != "_events" && name != "_subscriptions") {
                obj[name] = this[name];
            }
        }, this);
        return obj;
     };



    /* Unfortunate use of eval, needed until we find a better way to make the class name actually show up
     * in the debugger as the name of the class.  Previously showed up as Model.extend.newfunc.
     */
    function makeCtor(name) {
        var parts = name.split(/\./);
        var subname = parts[parts.length-1];
        var result = eval("function " + subname + "(){this.__class = " + subname + "; Model.apply(this, arguments);}; " + subname);
        if (parts.length > 1) {
            var obj = window;
            for (var i = 0; i < parts.length - 1; i++) {
                if (!obj[parts[i]]) obj[parts[i]] = {};
                obj = obj[parts[i]];
            }
            obj[subname] = result;
        }

        return result;
    }


    /**
     * Define a new class, which will contain the specified properties and methods.
     * Note that the name property can be quite significant:
     * 1. It allows your debugger to properly indicate the class of your object
        var constructor = m_.Model.extend({name: "Animal"})
        a = new constructor();
        > *Animal{...}*
     * 2. It allows you to namespace your class definition.  Names without "." will NOT
     * be added to the global namespace.
        m_.Model.extend({name: "com.myco.Animal"});
        new com.myco.Animal(...);
        > *Animal{...}*
        m_.Model.extend({name: "Dog"})
        new Dog()
        > Error!
     * 3. It will save your class definition in the class registry, which allows validation to work:
        m_.Model.extend({
            name: "Dog",
            properties: {
                parent: {
                    type: "Dog" // Validation of the parent property is made possible using your class name.
                }
            }
        })
     *
     * @static
     * @method extend
     * @param {Object} args
     * @param {String} [args.name=Anonymous] - Name of the class
     * @param {Object} [args.properties={}] - Specification for the properties; see Model documentation for details and examples
     * @param {Object} [args.methods={}] - Methods of the class
     * @param {Object} [args.statics={}] - Static methods and properties of the class
     *                 Note that no validation is done at this time on static properties,
     *                 so they are just defined as
            statics: {
                prop1: "initialValue",
                prop2: "anotherValue",
                func1: function() {},
                func2: function() {}
            }
     * @returns {Function} - Returns a class definition which can be used to create instances of the class
     */
    Model.extend = function(args) {
        var className = args.name || "Anonymous",
            shortName = className.replace(/^.*\./,""),
            propertySpec = args.properties || {},
            methods = args.methods,
            staticConfig = args.statics || {},
            parentProps = this.$meta.properties;

        modelInit = true;

        var cons= makeCtor(className);
        cons.prototype = new this();
        cons.$meta = {
            __functions: m_.clone(this.$meta.__functions),
            defaults: {},
            fullName: args.name,
            aopFuncs: {}
        };

        if (args.name) classRegistry[className] = cons;

        // last one in is the provider of the role; relevant
        // because if I subclass something, my subclass must be declared
        // after the parent class.
        if (args.role) roleRegistry[args.role] = cons;

        m_.each(methods || {}, function(funcDef, name) {
            var func, hasDefinition;
            if (m_.isFunction(funcDef)) {
                func = funcDef;
            } else {
                func = funcDef.method;
                hasDefinition = true;
            }
            // Used to insure that function renders correctly in the call stack
            func.displayName = shortName + "." + name;

            func.$name = name; // Used to verify private properties are accessed by object methods
            func.$super = cons.prototype[name];
            if (hasDefinition) {
                defineFunc(cons, name, funcDef, func);
            } else if (cons.$meta.__functions.hasOwnProperty(name)) {
                cons.$meta.__functions[name] = func;
            } else {
                cons.prototype[name] = func;
            }
        });

        m_.each(propertySpec, function(def, name) {
            if (typeof def != "object") {
                var type = parentProps[name] ? parentProps[name].type : null;
                var autoAdjust = parentProps[name] ? parentProps[name].autoAdjust : true;
                if (type === null) {
                    if (def == null) type = "any";
                    else type = typeof def;
                }
                propertySpec[name] =  {
                    type: type,
                    defaultValue: def,
                    autoAdjust: autoAdjust
                };
            }
        },this);

        var fullSpec = this.$meta.properties ? m_.extend({}, this.$meta.properties, propertySpec) : propertySpec;

        // Build a searchable index of all functions of this object so we can validate private accessors
        var fullFunc = {};
        m_.each(this.$meta.functions, function(funcList, funcName) {
            fullFunc[funcName] = funcList.concat([]); // clone the array
        }, this);

        m_.each(methods, function(funcDef, funcName) {
            var func = m_.isFunction(funcDef) ? funcDef : funcDef.method;
            if (!m_.isArray(fullFunc[funcName])) fullFunc[funcName] = [];
            fullFunc[funcName].push(func.toString());
        }, this);

        cons.$meta.properties = fullSpec;
        cons.$meta.superclass = this;
        cons.$meta.defaults = this.$meta.defaults ? m_.clone(this.$meta.defaults) : {};
        cons.$meta.functions = fullFunc;

        // Any third party dev can access person.__class.$meta.functions and add/remove stuff to it.
        // So, freeze it.
        m_.each(fullFunc, function(arrayOfFuncs) {Object.freeze(arrayOfFuncs);});
        Object.freeze(fullFunc);


        // parent method properties should not need to be defined
        m_.each(propertySpec, function(inValue, inKey) {
            defineProperty(cons, inKey, inValue);
            if (typeof inValue != "object") {
                cons.$meta.defaults[inKey] = inValue;
            } else if ("defaultValue" in inValue) {
                cons.$meta.defaults[inKey] = inValue.defaultValue;
            }
        }, this);

        cons.extend = Model.extend;
        cons.defaults = Model.defaults;
        cons.around = Model.around;
        cons.after = Model.after;

        Object.seal(cons.prototype);

        m_.each(staticConfig, function(func, funcName) {
            if (m_.isFunction(func)) func.$name = "STATIC " + funcName;
        }, this);

        m_.extend(cons, staticConfig);
        var parent = cons;
        while(parent) {
            if (parent.init) parent.init(cons);
            parent = parent.$meta.superclass;
        }

        if (window.modelConfig) {
            var config = modelConfig[className] || modelConfig[args.role];
            if (config) {
                if (config.around) {
                    m_.each(config.around, function(func, name) {
                        cons.around(name, func);
                    }, this);
                    delete config.around;
                }
                if (config.after) {
                    m_.each(config.after, function(func, name) {
                        cons.after(name, func);
                    }, this);
                    delete config.after;
                }
                cons.defaults(config);
            }
        }

        modelInit = false;
        return cons;
    };

    /**
     * @static
     * @method
     * @param {string} name
     * Returns the class that has the specified name or role
     */
    Model.getClass = function(name) {
        return roleRegistry[name] || classRegistry[name];
    };

    function setupAOP(aopFuncs, name, type, newFunc) {
        if (!aopFuncs[name]) aopFuncs[name]= {after:[],around:[]};
        var funcs = aopFuncs[name][type];
        if (!newFunc) {
            funcs.splice(0,funcs.length);
        } else {
            funcs.push(newFunc);
        }
    }

    /**
     * @static
     * @method
     * @param {string} methodName
     * @param {Function} newFunc
     * Whenever the method on this object identified by methodName is called,
     * will call that method and then immediately call your newFunc.
     * If your newFunc returns a value, that value will be returned by the call
     * to methodName instead of the original return value.
     * @note Only methods that have been designated for supporting around/after can do this.
     */
    Model.after = function(methodName, newFunc) {
        setupAOP(this.$meta.aopFuncs, methodName, "after", newFunc);
    };

    /**
     * @static
     * @method
     * @param {string} methodName
     * @param {Function} newFunc
     * Whenever the method on this object identified by methodName is called,
     * newFunc is called instead of the specified method.
     * newFunc will be provided the original call arguments plus the original method.

        Person.around("increaseAge", function(originalFunction, years) {
            if (!this.isDead) originalFunction(years);
        });

    * You can asynchronously call originalFunction (but if the caller of
    * originalFunction expected a return value, this will be lost).
    *
    * You can change the arguments to originalFunction if needed
    *
    * You can choose not to call originalFunction.
    * @note Only methods that have been designated for supporting around/after can do this.
    */
    Model.around = function(methodName, newFunc) {
        setupAOP(this.$meta.aopFuncs, methodName, "around", newFunc);
    };

    Model.defaults = function(options) {
        var firstConfig = !this.$meta.configure;
        if (firstConfig) {
            this.$meta.configure = m_.clone(this.$meta.defaults);
        }
        if (options == null) {
            this.$meta.defaults = m_.clone(this.$meta.configure);
        } else {
            var defaults = this.$meta.defaults;
            var properties = this.$meta.properties;
            m_.each(options, function(value, name) {
                if (properties[name]) {
                    defaults[name] = value;
                }
            }, this);
        }
    };

    /**
     * Mostly needed for running test scripts.
     * Remove all configurations from this Model
     */
    Model.unconfigure = function(options) {
        if (this.$meta.configure) {
            var properties = this.$meta.properties;
            var defaults = this.$meta.defaults;
            var methods = this.$meta.functions;

            m_.each(this.$meta.configure, function(value, name) {
                if (properties[name]) {
                    defaults[name] = value;
                } else if (methods[name]) {
                    this.prototype[name] = value;
                }
            }, this);
        }
    };

    Model.$meta = {
        properties: {
            constructor: {
                type: "any" // TODO: Support function
            },
            events: {
                type: "object"
            },
            _events: {
                type: "object"
            },
            _subscriptions: {
                type: "[object]"
            },
            internalId: {
                type: "string"
            }
        },
        superclass: null,
        defaults: {},
        functions: {},
        __functions: {}
    };


    m_.each(Model.$meta.properties, function(inValue, inKey) {
        defineProperty(Model, inKey, inValue);
        //if ("defaultValue" in inValue) Model.$meta.defaults[inKey] = inValue.defaultValue;
    }, this);

    module.exports = Model;
    classRegistry.Model = Model;
})();
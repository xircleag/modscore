modscore
========


### Requirements

A browser more modern than IE8

# Motivation for this library:

### Motivations: The short version:

- Supports defining properties to be private. Your APIs will be a lot harder to tamper with.
- Supports validation on all of your properties.  Your APIs will be more robust.
- Supports proper Object Oriented concepts (public/private, inheritance, calling parent methods and objects can't be tinkered with by your API's users.)

### Motivations: Robustness of a typed / declared language

There have been many efforts at a more formal typed version of javascript.  These invariably
seem to involve non-javascript syntax, non-javascript concepts and structures,
and then the code gets compiled into javascript.

This library is for those who love javascript,
but want a more engineering friendly environment.  Enforcement of types does not depend upon
third party developers using setters.  Calling *person.firstName = 5* will throw a type error
if firstName has been defined to be a string.

At this point in this library's evolution, all object properties are typed, method parameters are NOT typed.

### Motivations: Developers can no longer muck up your API

Objects are defined such that only the properties you define and type can be used.  As an API provider,
you should have some confidence that people aren't mucking with your objects, arbitrarily attaching
data to them.

Why not let properties be declared whenever, wherever?

- Self documenting designs are easier if all properties are defined up front.  This is equally true for private properties.
- Javascript allows any and every module to make any change it wants to your objects.  Thats all good fun,
but as an API provider, you'd probably much rather have some confidence that your objects are not in fact
being arbitrarily changed.

### Motivations: Your private properties really aught to be private

In Javascript, the only way to have truely private variables is to NOT use prototypal properties, which in turn
means that you can't use prototypal methods.  Which in turn means that if you create 10,000 instances,
you have to recreate all of the properties and methods for each one.

So, javascript developers make do with coding by convention;  this.__prettyPleaseDontTouchThisProperty = 5;
Yeah.  Nobody would ever touch that property, right?  No... developers will do Whatever it seems like it
might take to get their code to work.  Even if there are consequences later on.

### Motivations: Your object oriented code really should be object oriented

Yes, there are a number of frameworks out there for declaring classes, subclasses, calling parent methods, etc...
This library provides all that object oriented goodness with all the behaviors described above.

*NOTE: Static methods and properties are not yet supported*

### Motivations: Inspirations and outright copying:

- Ampersandjs: A lot of credit goes to ampersandjs, and their *State* object. It is a very subjective opinion that

    - Their state object manages a lot more stuff than it needs to; children, collections, derivedProps, etc...
      all very cool but not really what I need (ok, not what I need yet).
    - Their state object does not appear to be a root object for an object oriented dev environment (how do you call the parent method?)
    - They do not (yet) have all of the behaviors needed to define/modify property behaviors.

- Backbone: Directly copies from Backbone standalone events (stripping out some of the unused code)
- Sencha: Their adjust methods on their setters directly inspired part of how properties are set
- Javascript: For providing Object.defineProperty() and Object.seal().
- Java: Yeah, I know javascript is not java.  That doesn't mean there aren't lessons to be learned. Like, say, private properties?

## How to use it

### Step 1: Add the script to your page:

   &lt;script type="text/javascript" src='overscore.min.js'>&lt;/script>

### Step 2: In your js folder, define some objects.

For simplicity, we'll assume that they are all defined in the same file

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
*NOTE: To disable validation, use a type of "any" instead of "integer"*

        // Object only allows those properties that are defined; no object hacking.
        // iq is not part of the class definition:
        kermit.iq = 185;
        console.log(kermit.iq);
        > undefined
### Step 3: You can also define subclasses of your class

Rather than use the global extend method, use extend method built into your parent class.
The subclass inherits all properties and methods defined on the parent.

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
The call to this.$super() calls the parent method, which updates this.age.

        var kermit = new Person({age: 3, hasRecentBirthday: false, firstName: "Kermit"});
        p.celebrateBirthday();

        console.log(kermit.age)
        > 4
        console.log(kermit.hasRecentBirthday)
        > true
### Step 4: Add some Private Properties

As part of your property definition, you can specify which properties are private (default is public).
Private properties have exactly the same behaviors as public properties (validation, etc...) but also
provide some protection.

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
While this solution can definitely be hacked, the primary goal is not to be hack proof,
but to prevent idle "that seems like a good idea" changing of private data to suit the short term needs
of third party developers, and potentially break something when they download the next update
to your library.

#### Dangers of Using Private Properties

There are some standard javascript practices that will no longer work if using private properties

1. You can not create an instance, setup the instance's private data and then return it.

        function createPerson() {
            var p = new Person();
            p.privateData = 5; // FAIL!!
            return p;
        }
2. You can not access private data from anonymous functions

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
3. You can not tack on new methods

        var p = new Person();
        p.getAge = function() {
            return this.age; // FAIL, This function was not part of the Class Definition
        };

        Person.prototype.getAge = function() {
            return this.age; // FAIL, This function was not part of the Class Definition
        };
### Step 5: Further refine your property definitions
- **type**: A string specifying the type: integer, double, string, boolean, object, Date, Person, Animal.

  Type may also be an array: [integer], [double], [string], [Person], etc...

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
- **required**: A boolean indicating if the value is required.  Will cause error to be thrown any time you create an object without that property.
Will throw an error any time you set the value of that property to null, undefined or "".

            firstName: {
                type:  "string",
                required: true
            }
- **private**: A boolean indicating that the property is a private property

- **autoAdjust**: A boolean indicating that a property should adjust its value to resolve validation errors.
   For boolean fields, if this is true, it will convert truthy/falsy values to true/false.
   For dates, it will attempt to convert strings and numbers to dates.
   For numbers, it will test to see if a string contains a number ("5" yes, "5fred" no)

            age: {
                type: "integer",
                autoAdjust: true
            }
- **readOnly**: A boolean indicating if the property can be changed after the constructor has completed.
- **defaultValue**: The default value to use for this property if none is specified in the constructor

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
### Step 6: Add methods to refine property behaviors

- **Adjuster**: You can add an adjuster method for your property to adjust the value being set.

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
    your function must be named
    adjust<cammelCase(propertyName)>; the first letter of your propertyName will always be upperCased (even if the property itself starts with a lowercase letter).
    If the adjuster does not return a value, then the property will be set with the original value.
    If the adjuster returns a value, then the property will be set to the returned value.
    - The adjuster is run BEFORE validation
    - The adjuster will cause autoAdjust to be ignored.
- **Validator**: You can add a custom validator for your property.

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
   This is run after the standard
    validator that comes with your property type.  So if your property type is "integer", and you pass in a string,
    your custom validator will not be reached.

    Your function must be named validateSet<cammelCase(propertyName)>. The first letter of
    your propertyName will always be upperCased.
    If your validator returns a value, its assumed to be an error message, and a complete error message is
    assembled and thrown for you.

    NOTE: *Do not throw an error; return a string from your validators!*

    Use a type of "any" to disable automatic validation and only use your
    validator.


### Step 7: Setup event handlers if needed

         kermit.on("age:changed", function(newAge, oldAge) {
           if (newAge > oldAge) console.log("I'm getting Old!");
         }, this);

         kermit.age = 55;
         > I'm getting Old!
Every defined property will fire an event when its value changes, and you can subscribe using
object.on("&lt;propertyName>:changed", callback, context);

You can also subscribe to ALL changes on an object:

        kermit.on("changed", function(propertyName, newValue, oldValue) {
            console.log(propertyName + " is now " + newValue);
        }, this);

        kermit.firstName = "piggy";
        > firstName is now piggy

        kermit.age = 50;
        > age is now 50

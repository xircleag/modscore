/**
 * Motivation for this library:
 * 1. Seal objects defined this way so that our library can provide
 *    third party developers with our objects, but those objects can
 *    not be modified except through our APIs. This is done by using seal() and having properties be readOnly.
 * 2. There can be no properties on an object except those which are defined for your object. No hacking of objects.
 *    This promotes design that documents everything about an object in the definition.
 *    It should promote better testability
 * 3. Validation on all properties. Properties are all typed, and any attempt to set in inappropriate value can be caught and handled.
 * 4. Support for proper setters/getters:  myobj.prop1 = "Fred" rather than myobj.setProp1("Fred"). Why
 *    is this preferred?  Because we don't know much about our third party developer users and their background.
 *    For the unknown developer, this is just plain simple.
 * 5. Support for private properties that can only be accessed by the creator of the object, but which provide the same
 *    validation and modeling as the public properties.
 */

// Compile with
// > watchify model.js -d -o build/model.js
// var m_ = require("./miniunderscore.js");

// TODO: Find a way to disable/enable private getters/setters; enabler.lockPrivates(); enabler.unlockPrivates();
// TODO: JsDoc / github Readme
// TODO: Add listeners to constructor?
// TODO: Support for private collections (manages the private accessors for the array or hash)
// TODO: Support for private methods?

var modelInit = false, privateInit = false;
var Model = function(params) {
    if (!modelInit) {
            this.__values = {
            __notinitialized: true
        };
        if (!(this.__class.prototype instanceof PrivateModel)) {
            this.__privates = new this.__class.$meta.privateClass();


            /* For each property passed in via the constructor, set the appropriate private/public value */
            var defs = this.__class.$meta.properties;
            if (params) {
                m_.each(params, function(value, name) {
                    if (defs[name].private) {
                        this.__privates[name] = value;
                    } else {
                        this[name] = value;
                    }
                }, this);
            }


            /* For each unset property with a default value, set the appropriate private/public value */
            var allDefaults = this.__class.$meta.defaults;
            var privateDefaults = {}, pubDefaults = {};
            m_.each(allDefaults, function(value, name) {
                if (defs[name]) {
                    if (defs[name].private) {
                        privateDefaults[name] = value;
                    } else {
                        pubDefaults[name] = value;
                    }
                }
            }, this);
            m_.defaults(this, pubDefaults);
            m_.defaults(this.__privates, privateDefaults);


            // Enforce required fields
            m_.each(this.__class.$meta.properties, function(value, name, src) {
                if (this[name] === undefined && src[name].required) {
                    if (!defs[name].private) {
                        this[name] = null;
                    } else {
                        this.__privates[name] = null;
                    }
                }
            }, this);

            this.constructor.apply(this, arguments);
            delete this.__values.__notinitialized;
            this.__privates.__values.__notinitialized = false;
        }
        Object.seal(this);
    }
};

// Enable events on all Model instances/sublcasses
m_.extend(Model.prototype, window.BackboneEvents);
Model.prototype._events = {};
window.m_.Model = Model;


function genericGetter(def, name) {
    return this.__values[name];
}

function genericSetter(def, name, inValue) {
    var altValue, adjuster, values = this.__values;

    /* Step 1: If readOnly property, only set it if we are in the constructor */
    if (def.readOnly && !this.__values.__notinitialized) {
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
    if (def.required && inValue === null) throw new Error(name + ": is required");

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
        if (({}).toString.call(inValue) != "[object " +  def.type + "]") throw name + ": must be of type " + def.type;
    }

    /* Step 6: Run custom validator */
    validator = this["validateSet" + m_.camelCase(name, true)];
    if (validator) {
        validatorResult = validator(inValue);
        if (validatorResult) throw new Error(name + ": " + validatorResult);
    }

    /* Step 6: Set the value */
    var originalValue = values[name];
    if (originalValue !== inValue) {
        values[name] = inValue;
        this.trigger(name + ":changed", inValue, originalValue);
    }

}


function defineProperty(model, name, def) {
    if (def.type == "number") def.type = "integer"; // fix common user error
    Object.defineProperty(model.prototype, name, {
        enumerable: !def.private,
        configurable: def.type == "any",
        get: function() {
            return genericGetter.call(this, def, name);
        },
        set: function(inValue) {
            return genericSetter.call(this, def, name, inValue);
        }
    });
}

// TODO: See about changing this to a hash instead of a function
function getValidator(type) {
    switch(type) {
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

/* Expected to be overridden by subclasses */
Model.prototype.constructor = function() {
};

Model.prototype.$super = function $super() {
    var caller = $super.caller;
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

// modelSpec is a hash of properties:
// {
//      prop1: {
//          type: "integer", // REQUIRED: one of "integer", "double", "string", "boolean", "object", or any object type: "Date", "MyModel".  Can also be "[integer]", "[string]", etc...
//          required: true, // Default is false; if true, throws error on creating new object that fails to specify a value; throws error on calling setter with undefined/null.
//          protected: true,  // Default is false; if true, then this.prop1 will not be available
//          autoAdjust: true, // Default is false; if true, boolean values will use truthiness; numbers will accept stringified numbers, etc...
//          readOnly: false // Default is false; if true, this property can only be set during initialization
//      },
//      prop2: {...}
// }

Model.extend = function(className, modelSpec, functionSpec) {
    modelInit = true;

    var constructor= makeCtor(className);
    constructor.prototype = new this();


    if (!privateInit) {
        var privateConstructor = makeCtor("_" + m_.camelCase(className, true) + "Private");
        privateConstructor.prototype = new PrivateModel();
    }


    if (functionSpec) {
        m_.each(functionSpec, function(func, name) {
            func.name = name; // needed for $super() to find the parent method
            func.$super = constructor.prototype[name];
            constructor.prototype[name] = func;
        });

    }

    var fullSpec = this.$meta ? m_.extend({}, this.$meta.properties, modelSpec) : modelSpec;
    constructor.$meta = {
        properties: fullSpec,
        superclass: this,
        defaults: this.$meta ? m_.clone(this.$meta.defaults) : {},
        privateClass: privateConstructor
    };

    // parent method properties should not need to be defined
    m_.each(modelSpec, function(inValue, inKey) {
        if (!inValue.private) {
            defineProperty(constructor, inKey, inValue);
        }
        if ("defaultValue" in inValue) constructor.$meta.defaults[inKey] = inValue.defaultValue;
    }, this);
    m_.each(fullSpec, function(inValue, inKey) {
        if (inValue.private) {
            defineProperty(constructor.$meta.privateClass, inKey, inValue);
        }
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
    defaults: {}
};

privateInit = true;
var PrivateModel = Model.extend("PrivateModel", {}, {
    constructor: function() {
        this.__values.__notinitialized = true;
    }
});
privateInit = false;
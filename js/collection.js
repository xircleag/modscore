var Model = require("./model.js");
var m_ = require("./util.js");

/**
 * @class overscore.Collection
 * Provides a collection class for use as a property of a model.
 * This class is currently a virtual class; see ArrayCollection
 */
var Collection = Model.extend({
    name: "Collection",
    properties: {
        /**
         * @property {Mixed} data - Any implementation of the Collection class will have a data property
         * @private
         */
         /**
         * @property {number} length - Any implementation of the Collection class will have a length property
         */

         /**
          * @property {string} [name=item] - Name of the collection; name will be used when the collection
          * generates events about its items.
          */
        name: {
            type: "string",
            defaultValue: "item"
        }
    }
});

/**
 * @class overscore.ArrayCollection
 * Provides a collection class for use as a property of a model.
 * Why not just use an array?  You can use an array, but if you want
 * events triggered whenever an item is added or removed from the collection,
 * and if you want events triggered when items in the collection trigger their own events,
 * then you'd have to reimplement a lot of code each time you do that.  So, use this collection.

    var Person = m_.Model.extend({
        name: "Person",
        properties: {
            firstName: {
                type: "string"
            },
            legs: {
                type: "ArrayCollection"
            }
        }
    });

    var p = new Person({
        firstName: "Kermit",
        legs: ["left",  "right"]
    });
    p.legs.add("extra leg");
    p.legs.remove("left");
    p.on({
        "item:new": function(item) {
            alert("My new leg is: " + item);
        },
        "item:remove": function(item) {
            alert("I've lost my " + item + " leg!");
        }
    });

* Or name your events so you can have multiple collections

    var Person = m_.Model.extend({
        name: "Person",
        properties: {
            firstName: {
                type: "string"
            },
            legs: {
                type: "ArrayCollection",
                params: {
                    name: "leg"
                }
            }
        }
    });

    var p = new Person({
        firstName: "Kermit",
        legs: ["left",  "right"]
    });
    p.on({
        "leg:new": function(item) {
            alert("My new leg is: " + item);
        },
        "leg:remove": function(item) {
            alert("I've lost my " + item + " leg!");
        },
        "leg:change": function(item, fieldName, newValue, oldValue) {
            alert("This will fire if the leg is a Model class and a field has changed... but not if its just a string/number");
        }
    });


 * Or directly creating collections

    var classDef = m_.Model.getClass("ArrayCollection");
    var collection = new classDef();
 */
Collection.extend({
    name: "ArrayCollection",
    properties: {

        /**
         * The data array
         * @property {Mixed[]}
         * @private
         */
        data: {
            type: "[any]",
            private: true
        },

        /**
         * @property {number}
         * Number of items in the collection
         */
        length: {
            type: "number",
            privateSetter: true
        },

        /**
         * @param {Function}
         * Use this to change how event names are generated if you don't like the default event names

            evtModifier: function(args) {
                if (args[0].match(/^foo:bar:change/)) {
                    args[0] = args[0].replace(/^foo:/,"");
                }
            }

         */
        evtModifier:{
            type: "Function"
        },

        /**
         * @property {string}
         * Maintain the collection in sorted order based on the specified property name or path.

            var Person = m_.Model.extend({
                name: "Person",
                properties: {
                    firstName: {
                        type: "string"
                    },
                    legs: {
                        type: "ArrayCollection",
                        params: {
                            name: "leg",

                            // Name of a property of leg:
                            sortByProp: "strength"
                            // OR path to a value within leg:
                            sortByProp: "foot.length"
                        }
                    }
                }
            });

        */
        sortByProp: {
            type: "string"
        }
    },
    methods: {

        /**
         * @method
         * @private
         * @param {overscore.Model} item - Item that triggered the event
         * @param {string} evtName - Name of the event (new, destroy, change, change:age, etc...)
         */
        itemEvt: {
            private: true,
            method: function(item, evtName) {
                if (evtName == "destroy") return this.remove(item); // remove it and fire removal events instead
                if (evtName == "new") return; // already fired
                var args = Array.prototype.slice.call(arguments);
                args[0] = this.name + ":" + evtName;
                args[1] = item;
                if (this.evtModifier) {
                    this.evtModifier(args);
                }
                this.trigger.apply(this, args);
            }
        },

        /**
         * @method
         * @private
         * Subscribes to all events from any initial items, and initializes the length property
         */
        init: function(args) {
            this.$super(args);
            var itemEvt = this.itemEvt;
            this.data.forEach(function(item) {
                if (item instanceof Model) {
                    item.on("all", itemEvt.bind(this, item));
                }
            }, this);
            this.length = this.data.length;
            this.resort();

            this.on("change:sortByProp", this.resort , this);
        },

        /**
         * Returns a copy of the data as an array.
         * This is a copy; modifying it does not affect the collection.
         * @method
         */
        getData: function() {
            return this.data.concat([]);
        },

        /**
         * @method
         * @param {number} index
         * Get an item from the collection by index
         */
        at: function(index) {
            return this.data[index];
        },

        /**
         * @event item:new
         * @param {Mixed} item - Item that was added
         * Note that if you provide an alternate name for the collection, it will be altName:new
         */

        /**
         * @method
         * @param {Mixed} item - Object or value to add
         * @param {boolean} [silent=false] - Do not trigger "new" events
         * Add an item to the collection and trigger events to anyone watching the collection
         */
        add: function(item, silent) {
            this.data.push(item);
            this.resort();
            this.length = this.data.length;
            if (!silent) {
                this.trigger(this.name + ":new", item);
                this.trigger("change");
            }
            if (item instanceof Model) {
                item.on("all", this.itemEvt.bind(this, item), this);
            }
        },

        /**
         * @event item:remove
         * @param {Mixed} item - Item that was removed
         * Note that if you provide an alternate name for the collection, it will be altName:remove
         */


        /**
         * @method
         * @param {Mixed} item - Object or value to remove
         * @param {boolean} [silent=false] - Do not trigger "remove" events
         * Remove an item to the collection (if its in the collection)
         * and trigger events to anyone watching the collection
         */
        remove: function(item, silent) {
            var d = this.data;
            var index = d.indexOf(item);
            if (index != -1) {
                d.splice(index,1);
                this.length = this.data.length;
                if (!silent) {
                    this.trigger(this.name + ":remove", item);
                    this.trigger("change");
                }
                if (item instanceof Model) {
                    item.off("all", null, this);
                }
            }
        },

        /**
         * @method
         * @param {Mixed} item
         * Returns the index of the item in the array
         */
        indexOf: function(item) {
            return this.data.indexOf(item);
        },

        /**
         * @method
         * @param {Function} fn - Function to test each item looking for a match
         * @param {Mixed} fn.item - Item from the array to test
         * @param {number} fn.index - Index in the array we are testing
         * @returns {Mixed} - Item matching or undefined
         *
         * Search the collection for an item that matches your search critera

            var nerd = collection.find(function(item, index) {
                if (item.isNerd) return true;
            });

         */
        find: function(fn) {
            var d = this.data,
                length = d.length;
            for (var i = 0; i < length; i++) {
                if (fn(d[i], i)) return d[i];
            }
        },

        /**
         * @method
         * @param {Function} fn - Function to call on each item
         * @param {Mixed} [context] - Context to run fn
         * Standard Array.forEach iterator
         */
        each: function(fn, context) {
            // Iterate over a copy because the iteration may modify the this.data.
            var d = this.getData();
            d.forEach(fn, context);
        },

        /* @method
         * Standard Array.map call
         */
        map: function(fn, context) {
            return this.data.map(fn,context);
        },

        /**
         * @method
         * @private
         * Resorts using the sortByProp
         */
         resort: {
            private: true,
            method: function() {
                var sortByProp = this.sortByProp;
                if (sortByProp) {
                    this.sortBy(function(item) {
                        return m_.getValue(item, sortByProp);
                    });
                }
            }
        },

        /**
         * Simplified sort method: give it a function to get the value, rather than to do the comparison.
         * @method
         * @param {Function} fn
         * @param {Mixed} fn.value
         *
            collection.sortBy(function(value) {
                return value.timestamp;
            });

        */
        sortBy: function(fn) {
            var d = this.data;
            d.sort(function(a,b) {
                var aa = fn(a);
                var bb = fn(b);
                if (aa > bb || bb && !aa) return 1;
                if (aa < bb || aa && !bb) return -1;
                return 0;
            });
            this.trigger("change:data");
        },

        /**
         * @method
         * Standard Array.sort method
         */
        sort: function(fn) {
            this.data.sort(fn);
            this.trigger("change:data");
        },

        /**
         * @method
         * Destroy the collection and all of its data
         */
        destroy: function() {
            // destroy may side effect modifying this.data, so iterate over a copy
            var d = this.data.concat([]);
            d.forEach(function(item) {
                if (item instanceof Model) {
                    item.destroy();
                }
            });
            this.$super();
        }
    }
});
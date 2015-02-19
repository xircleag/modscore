var Model = require("./model.js");
var m_ = require("./util.js");

/**
 * @class modscore.Collection
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
          * @property {string} [name=item] - Name of the collection; used by parent component
          * to distinguish events from this collection from other collections it manages.
          */
        name: {
            type: "string",
            defaultValue: ""
        }
    }
});

/**
 * @class modscore.ArrayCollection
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
        "add": function(item) {
            alert("My new leg is: " + item);
        },
        "remove": function(item) {
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
        "add": function(item) {
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
 *
 * Data can be added using

    collection.add(item);
    collection.add("hello");
    collection.data = ["hello", item]; // replaces all previous data, but will not fire add/remove events

 *
 * Data can be removed using

    collection.remove("hello");
    collection.remove(item);
    collection.data = [];
    collection.clear();

 */
module.exports = Collection.extend({
    name: "ArrayCollection",
    properties: {

        /**
         * The data array
         * @property {Mixed[]}
         * @private
         */
        data: {
            type: "[any]",
            private: true,
            silent: true // see "set" event
        },

        /**
         * @property {number}
         * Number of items in the collection
         */
        length: {
            type: "number",
            privateSetter: true,
            silent: true
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
        },
        /**
         * @property
         * Modifies sortByProp
         */
        reverseSort: false,
        emptyIsLow: false,
        sortByFunc: {
            type: "Function"
        },


        /**
         * @property
         * @readonly
         * If a collection was created using {create:true} in the property def,
         * then the owner is the component that this was created for.
         * Used among other things for detecting that the collection was the one
         * created just for some component, vs being passed in as a parameter.
         */
        owner: {
            type: "any",
            privateSetter: true
        }
    },
    methods: {

        /**
         * @method
         * @private
         * @param {modscore.Model} item - Item that triggered the event
         * @param {string} evtName - Name of the event (new, destroy, change, change:age, etc...)
         */
        itemEvt: {
            private: true,
            method: function(item, evtName) {
                if (evtName == "destroy") return this.remove(item); // remove it and fire removal events instead
                if (evtName == "new") return; // already fired
                var args = Array.prototype.slice.call(arguments);
                //args[0] = this.name + ":" + evtName;
                args[0] = "item:" + evtName;
                args[1] = item;
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
            this.resort(true);

        },
        updateSortByProp: function() {this.resort();},
        updateSortByFunc: function() {this.resort();},

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
         * @method
         * Convenience method for getting the last item in the collection
         */
        last: function() {
            return this.data[this.data.length-1];
        },

        /**
         * @event add
         * @param {Mixed} item - Item that was added
         */

        /**
         * @method
         * @param {Mixed} item - Object or value to add
         * @param {boolean} [silent=false] - Do not trigger "add" events
         * @param {number} [index=last] - Use this to insert rather than append
         * Add an item to the collection and trigger events to anyone watching the collection
         */
        add: function(item, silent, index) {
            if (index !== undefined) {
                this.data.splice(index,0,item);
            } else {
                this.data.push(item);
            }
            if (!silent && index === undefined) {
                this.resort(true);
            }
            this.length = this.data.length;
            if (!silent) {
                this.trigger("add", item);
                this.trigger("change", item);
                if (this.indexOf(item) != this.length-1) {
                    m_.scheduleJob("reorderEvent" + this.internalId,1, function() {
                        this.trigger("reorder");
                    }.bind(this));
                }
            }
            if (item instanceof Model) {
                item.on("all", this.itemEvt.bind(this, item), this);
            }
        },

        /**
         * @event remove
         * @param {Mixed} item - Item that was removed
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
                    this.trigger("remove", item);
                    this.trigger("change", item);
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
        find: function(fn, context) {
            if (context) fn = fn.bind(context);
            var d = this.data,
                length = d.length;
            for (var i = 0; i < length; i++) {
                if (fn(d[i], i)) return d[i];
            }
        },

        findWhere: function(obj) {
            var d= this.data;
            return m_.findWhere(d, obj);
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
         * Resorts using the sortByProp
         */
         resort: {
            method: function(silent) {
                var sortByProp = this.sortByProp;
                if (sortByProp) {
                    this.sortBy(function(item) {
                        return m_.getValue(item, sortByProp);
                    });
                } else if (this.sortByFunc) {
                    this.sort(this.sortByFunc);
                }
                if ((sortByProp || this.sortByFunc) && this.reverseSort) this.data.reverse();
                if (!silent) {
                    this.trigger("reorder");
                    this.trigger("change");
                }
            }
        },

        /**
          * @event reorder
          * Collection sequence has changed
          */

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
                if (bb && !aa && aa !== 0) return this.emptyIsLow ? -1 : 1;
                if (aa && !bb && bb !== 0) return this.emptyIsLow ? 1 : -1;
                if (aa > bb) return 1;
                if (aa < bb || aa && !bb) return -1;
                return 0;
            }.bind(this));
        },

        /**
         * @method
         * Standard Array.sort method
         */
        sort: function(fn) {
            this.data.sort(fn);
            this.trigger("reorder");
            this.trigger("change");
        },

        /**
         * @event cleared
         * Fired whenever clear() is called and has finished
         */

        /**
         * @method
         * Remove all data from the collection
         */
        clear: function(silent) {
            this.data = [];
            this.length = 0;
            this.trigger("cleared");
            this.trigger("change");
        },

        /**
         * @event set
         * Called whenever the entire dataset has been replaced with a new dataset.
         * Triggered via this.myCollection = [data...];
         */

        /**
         * @method
         * @protected
         * Replaces data with data copied from the array.
         * Recommend using this.myCollection = [data...] instead of setData()
         */
         setData: function(inArray, silent) {
            // A technique for modifying the existing data object without
            // firing off any setters (infinite loop)
            this.data.splice.apply(this.data, [0,this.length].concat(inArray));
            var itemEvt = this.itemEvt;
            this.each(function(item) {
                if (item instanceof m_.Model) {
                    item.on("all", itemEvt.bind(this, item), this);
                }
            }, this);
            this.length = inArray.length;
            this.resort(true);
            if (!silent) {
                this.trigger("set");
                this.trigger("change");
            }
         },

        /**
         * @method
         * Much like clear, but insures memory is cleaned up.
         * Use clear if your items are not Model instances, or
         * if you will continue to need them.
         */
        destroyItems: function() {
            // destroy may side effect modifying this.data, so iterate over a copy
            this.getData().forEach(function(item) {
                if (item instanceof Model) {
                    item.destroy();
                }
            });
            this.data = [];
        },

        /**
         * @method
         * Destroy the collection and all of its data
         */
        destroy: function() {
            this.destroyItems();
            this.$super();
        },

        toString: function() {
            return this.$super().replace(/\]/, " length="+this.length + "]");
        }
    }
});
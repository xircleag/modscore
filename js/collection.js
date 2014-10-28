var Model = require("./model.js");

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

Collection.extend({
    name: "ArrayCollection",
    properties: {
        data: {
            type: "[any]",
            private: true
        },
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
        }
    },
    methods: {

        itemEvt: {
            private: true,
            method: function(item, evtName) {
                if (evtName == "destroy") return this.remove(item);
                var args = Array.prototype.slice.call(arguments);
                args[0] = this.name + ":" + evtName;
                args[1] = item;
                if (this.evtModifier) {
                    this.evtModifier(args);
                }
                this.trigger.apply(this, args);
            }
        },
        init: function(args) {
            this.$super(args);
            var itemEvt = this.itemEvt;
            this.data.forEach(function(item) {
                if (item instanceof Model) {
                    item.on("all", itemEvt.bind(this, item));
                }
            }, this);
            this.length = this.data.length;
        },

        /**
         * Returns a copy of the data as an array
         * @method
         */
        getData: function() {
            return this.data.concat([]);
        },

        at: function(index) {
            return this.data[index];
        },

        add: function(item) {
            this.data.push(item);
            this.length = this.data.length;
            this.trigger(this.name + ":new", item);
            this.trigger("change");
            if (item instanceof Model) {
                item.on("all", this.itemEvt.bind(this, item), this);
            }
        },
        remove: function(item) {
            var d = this.data;
            var index = d.indexOf(item);
            if (index != -1) {
                d.splice(index,1);
                this.length = this.data.length;
                this.trigger(this.name + ":remove", item);
                this.trigger("change");
                item.off("all", null, this);
            }
        },
        indexOf: function(item) {
            return this.data.indexOf(item);
        },
        find: function(fn) {
            var d = this.data,
                length = d.length;
            for (i = 0; i < length; i++) {
                if (fn(d[i])) return d[i];
            }
        },

        each: function(fn, context) {
            this.data.forEach(fn, context);
        },
        map: function(fn, context) {
            return this.data.map(fn,context);
        },

        sortBy: function(fn) {
            var d = this.data;
            d.sort(function(a,b) {
                var aa = fn(a);
                var bb = fn(b);
                if (aa > bb || bb && !aa) return 1;
                if (aa < bb || aa && !bb) return -1;
                return 0;
            });
        },
        sort: function(fn) {
            this.data.sort(fn);
        },
        destroy: function() {
            // destroy may side effect modifying this.data, so iterate over a copy
            var d = this.data.concat([]);
            d.forEach(function(item) {
                item.destroy();
            });
            this.$super();
        }
    }
});
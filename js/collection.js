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
        }
    },
    methods: {

        itemEvt: {
            private: true,
            method: function(item, evtName) {
                if (evtName == "destroy") return this.remove(item);
                var args = Array.prototype.slice.call(arguments);
                args[0] = "item:" + evtName;
                args[1] = item;
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
            this.trigger("item:new", item);
            this.trigger("change");
            if (item instanceof Model) {
                item.on("all", this.itemEvt.bind(this, item));
            }
        },
        remove: function(item) {
            var d = this.data;
            var index = d.indexOf(item);
            if (index != -1) {
                d.splice(index,1);
                this.length = this.data.length;
                this.trigger("item:remove", item);
                this.trigger("change");
            }
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
            this.each(function(item) {
                item.destroy();
            });
            this.$super();
        }
    }
});
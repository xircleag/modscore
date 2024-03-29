/**
 * Standalone extraction of Backbone.Events, no external dependency required.
 * Degrades nicely when Backone/underscore are already available in the current
 * global context.
 *
 * Note that docs suggest to use underscore's `_.extend()` method to add Events
 * support to some given object. A `mixin()` method has been added to the Events
 * prototype to avoid using underscore for that sole purpose:
 *
 *     var myEventEmitter = BackboneEvents.mixin({});
 *
 * Or for a function constructor:
 *
 *     function MyConstructor(){}
 *     MyConstructor.prototype.foo = function(){}
 *     BackboneEvents.mixin(MyConstructor.prototype);
 *
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
 * (c) 2013 Nicolas Perriault
 *
 * MODIFIED BY Michael: Removes miniscore
 * @class modscore.Events
 */


  var m_ = require("./util.js");
  var Events;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Events = {

    clearEvents: function() {
      m_.each(this._events, function(value, name) {
        delete this._events[name];
      }, this);
    },

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    // MICHAEL: Acceptable uses:
    // obj.on("evtName", func, [context])
    // obj.on({"evtName1": func1, "evtName2": func2, "evtName3": func3}, [context]);
    on: function(name, callback, context) {

      if (!eventsApi(this, "on", name, [callback, context]) || !callback) return this;
      if (!this._events) this.clearEvents();
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      //if (!eventsApi(this, "once", name, [callback, context]) || !callback) return this;
      var self = this;
      var onces = [];
      var obj = {};
      if (typeof name == "string") {
        obj[name] = callback;
      } else {
        obj = name;
      }
      m_.each(obj, function(callback, name) {
        var once = m_.once(function() {
          onces.forEach(function(aOnce) {
            self.off("", aOnce);
          });
          callback.apply(this, arguments);
        });
        onces.push(once);
        once._callback = callback;
        self.on(name, once, context);
      });
      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, "off", name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this.clearEvents();
        return this;
      }

      names = name ? [name] : m_.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        events = this._events[name];
        if (events) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = Array.prototype.slice.call(arguments, 1);
      if (!eventsApi(this, "trigger", name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args, name);
      if (allEvents) triggerEvents(allEvents, arguments, name);
      return this;
    }
  };


  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === "object") {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args, name) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    while (++i < l) {
      try {
        switch (args.length) {
          case 0: (ev = events[i]).callback.call(ev.ctx); break;
          case 1: (ev = events[i]).callback.call(ev.ctx, a1); break;
          case 2: (ev = events[i]).callback.call(ev.ctx, a1, a2); break;
          case 3: (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); break;
          default: (ev = events[i]).callback.apply(ev.ctx, args);
        }
      } catch(e) {
        console.error("Error handling Event " + name + ": " + e);
      }
    }
  };

  module.exports = Events;

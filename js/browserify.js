var m_ = require("./util.js");
m_.Events = require("./events.js");
m_.Model = require("./model.js");


/* Usage if directly adding the output of browserify in a script tag:
 * m_.Model
 *
 * Usage if adding this to another script using require
 * var m_ = require("modscore.js");
 * var Model = m_.Model
 * // OR
 * var Model = require("modscore.js").Model;
 */

if (typeof global !== "undefined") {
    module.exports = m_;
}
if (typeof window !== "undefined") {
    window.m_ = m_;
}


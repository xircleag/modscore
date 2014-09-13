describe("Database Test", function() {
    debugger;
    var Person = m_.ModelDB.extend("Person", {
        firstName: {
            type: "string",
            indexed: true
        },
        lastName: {
            type: "string"
        },
        age: {
            type: "integer",
            indexed: true
        }
    });
    beforeEach(function() {


    });



});

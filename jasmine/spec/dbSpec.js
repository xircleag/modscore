
describe("Database Test", function() {
    var Person;

    beforeEach(function(done) {
        Person = m_.ModelDB.extend("test.Person", {
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
        m_.ModelDB.initAll();

    });

    it("Write test", function(done) {
        var kermit = new Person({firstName: "Kermit", lastName: "Frog", age: 15});

        kermit.on("change:dbIsSaved", function() {
            debugger;
            expect(kermit.getIsSaved()).toBe(true);
            expect(Boolean(kermit.getDbId())).toBe(true);
            done();
        });
        kermit.save();
    });


});

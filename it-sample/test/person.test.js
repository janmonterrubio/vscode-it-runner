var it = require('it');
var assert = require("assert");

var Person = require('../src/person');

it.describe("Person", function (it) {

    it.should("set name", function () {
        var person = new Person("bob", 1);
        assert.equal(person.name, "bob");
    });

    it.should("set age", function () {
        var person = new Person("bob", 1);
        assert.equal(person.age, 1);
    });

    it.describe("Older", function (it) {
        it.should("with positive age", function () {
            var person = new Person("bob", 1);
            person.getOlder(2);
            console.log("Should fail since 3 is not 4");
            assert.equal(person.age, 4);
        });
        it.should("with negative age", function () {
            var person = new Person("bob", 5);
            person.getOlder(-2);
            assert.equal(person.age, 5);
        });
    });
}); 

var it = require('it');
var assert = require("assert");

var Person = require('../../src/person');

it.describe("Person", function (it) {

    it.describe("Name", function(it) {
        it.should("set name", function () {
            var person = new Person("bob", 1);
            assert.equal(person.name, "bob");
        });
    });

    it.describe("Age", function(it) {

        it.should("set age", function () {
            var person = new Person("bob", 1);
            assert.equal(person.age, 1);
        });

        it.describe("Older", function (it) {
            it.should("add age", function () {
                var person = new Person("bob", 1);
                person.getOlder(2);
                assert.equal(person.age, 3);
            });
            it.should("ignore negative age", function () {
                var person = new Person("bob", 5);
                person.getOlder(-2);
                assert.equal(person.age, 5);
            });
        });
    });
}); 

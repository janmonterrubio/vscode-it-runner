var Person = function (name, age) {
    this.name = name;
    this.age = age;

    this.getOlder = function (years) {
        if (years > 0) {
            this.age = this.age + years;
        }
    };

};

module.exports = Person;
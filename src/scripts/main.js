class Person {
    constructor (name) {
        this.name = name;
    }
    hello() {
        if (typeof this.name === 'string') {
            return 'Hello, I am ' + this.name;
        } else {
            return 'Hello!';
        }
    }
}

const newPerson = new Person('Horatio');

document.write(newPerson.hello())

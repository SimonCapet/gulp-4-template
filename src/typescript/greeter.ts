interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person: Person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}

let user = {firstName: "Jessica", lastName: "Jones"};

document.getElementById('greeter').innerHTML = greeter(user);

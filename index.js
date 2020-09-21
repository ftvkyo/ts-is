const defaultImplementation = undefined;

class TypeAssertionError extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'TypeAssertionError';
    }
}

function checkImplementation(implementation) {
    if (typeof implementation !== "function") {
        throw new Error("ts-is should only be used as a transformer plugin during compilation.");
    }
}

function createIs(implementation = defaultImplementation) {
    checkImplementation(implementation);
    return implementation;
}

function createAssertType(implementation = defaultImplementation) {
    checkImplementation(implementation);
    return (obj, errorFactory) => {
        if(!implementation(obj)) {
            throw new (errorFactory ?? TypeAssertionError)(`Failed to assert type of ${util.inspect(obj)}`);
        }
        return obj;
    }
}

module.exports = {
    TypeAssertionError,
    createIs,
    createAssertType
}

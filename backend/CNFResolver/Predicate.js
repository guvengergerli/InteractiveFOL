class Predicate {
    constructor(name, args = [], isNegated = false) {
        this.name = name;
        this.args = args;
        this.isNegated = isNegated;
    }

    negate() {
        return new Predicate(this.name, this.args, !this.isNegated);
    }

    toString() {
        const negation = this.isNegated ? '¬' : '';
        const argsString = this.args.join(', ');
        return `${negation}${this.name}(${argsString})`;
    }
    toProlog() {
        const negation = this.isNegated ? 'not ' : '';
        const argsString = this.args.join(', ');
        console.log(`${negation}${this.name}(${argsString})`);
        return `${negation}${this.name}(${argsString})`;
    }
    getName() {
        return this.name;
    }
}

module.exports = Predicate;
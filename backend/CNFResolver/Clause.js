

class Clause {
    constructor(predicates = []) {
        this.predicates = predicates;
    }

    addPredicate(predicate) {
        if (predicate instanceof Predicate) {
            this.predicates.push(predicate);
        } else {
            throw new Error('Only instances of Predicate can be added.');
        }
    }

    removePredicate(predicate) {
        this.predicates = this.predicates.filter(p => p !== predicate);
    }

    getPredicates() {
        return this.predicates;
    }

    toString() {
        return this.predicates.map(p => p.toString()).join(' ∨ ');
    }
}
module.exports = Clause;
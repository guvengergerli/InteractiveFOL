# Formula Input Guide

This guide explains how to correctly input formulas into the system, ensuring compatibility with the logic processing pipeline.

## Accepted Formula Syntax

Your input formulas should follow a well-defined structure based on **First-Order Logic**. Here's the syntax breakdown for valid inputs:

### Terms:
- **Constants**: Constants are lowercase letters or numbers. For example, `a`, `b`, `c`, or `123`.
- **Variables**: Variables are uppercase letters or start with an underscore (`_`). For example, `X`, `Y`, `Z`, or `_var`.
- **Functions**: Functions consist of a symbol (starting with a lowercase letter) followed by arguments enclosed in parentheses. For example, `f(X)` or `g(a, b)`.

### Logical Formula Structure:
- **Predicates**: Predicates can be symbols or functions with terms as arguments.
    - Example: `P(X)` or `loves(john, mary)`
- **Conjunction** (`and`): Logical AND operation between two formulas.
    - Syntax: `and(<formula>, <formula>)`
    - Example: `and(P(X), Q(Y))`
- **Disjunction** (`or`): Logical OR operation between two formulas.
    - Syntax: `or(<formula>, <formula>)`
    - Example: `or(P(X), Q(Y))`
- **Negation** (`not`): Negates the given formula.
    - Syntax: `not(<formula>)`
    - Example: `not(P(X))`
- **Implication** (`implies`): Represents an implication where `A ⇒ B`.
    - Syntax: `implies(<formula>, <formula>)`
    - Example: `implies(P(X), Q(Y))`
- **Universal Quantification** (`every`): For all variables.
    - Syntax: `every(<variable>, <formula>)`
    - Example: `every(X, P(X))`
- **Existential Quantification** (`exist`): There exists a variable.
    - Syntax: `exist(<variable>, <formula>)`
    - Example: `exist(X, P(X))`

## Supported Logical Operators:
- **Conjunction (AND)**: `and(<formula>, <formula>)`
- **Disjunction (OR)**: `or(<formula>, <formula>)`
- **Negation (NOT)**: `not(<formula>)`
- **Implication (IMPLIES)**: `implies(<formula>, <formula>)`
- **Universal Quantification (FOR ALL)**: `every(<variable>, <formula>)`
- **Existential Quantification (THERE EXISTS)**: `exist(<variable>, <formula>)`

## Examples of Correct Input:

1. **Simple Predicate:**
   ```text
   implies(P(X), or(Q(Y), every(X, Z(W, Y))))


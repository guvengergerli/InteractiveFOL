%%%% 808292 Habbash Nassim

%
% --- CNF Converter
%

tocnf(FBF, FCNF) :-
	is_wff(FBF),
	rew(FBF, _, SFBF),
	dist(SFBF, CNFFBF),
	simplify(CNFFBF, FCNF), !.
tocnf(FBF, CNFFBF) :-
	is_wff(FBF),
	rew(FBF, _, SFBF),
	dist(SFBF, CNFFBF), !.
tocnf(FBF, FCNF) :-
	is_wff(FBF),
	rew(FBF, _, SFBF),
	simplify(SFBF, FCNF), !.
tocnf(FBF, SFBF) :-
	is_wff(FBF),
	rew(FBF, _, SFBF), !.

%
% --- Horn check
%

is_horn(A) :- tocnf(A, B), is_horn_cnf(B), !.
is_horn_cnf(A) :- A=..[and|Clauses], is_horn_conj(Clauses), !.
is_horn_cnf(A) :- is_horn_conj(A), !.

is_horn_conj([]) :- !.
is_horn_conj([H|T]) :- is_horn_clause(H), is_horn_conj(T), !.
is_horn_conj(Clause) :- is_horn_clause(Clause).

is_horn_clause(Clause) :- Clause=..[or|Literals],
			positive_lit(Literals, N), N=<1, !.
is_horn_clause(Term) :- is_literal(Term),
			positive_lit([Term], N), N=<1, !.

positive_lit([], 0).
positive_lit([H|T], N) :- functor(H, Name, _), Name \= not, !,
		         positive_lit(T, N2), N is N2+1.
positive_lit([_|T], N) :- positive_lit(T, N), !.

%
% ---- Formula validity control
%

is_reserved(A) :- subset([A], [and, or, not, implies, every, exist]).

is_term(A) :- var(A), !.
is_term(A) :- atomic(A), not(is_reserved(A)), !.
is_term(A) :- compound_name_arity(A, _, Arity), Arity > 0,
		A =.. [Name|List], not(is_reserved(Name)),
		foreach(member(L, List), is_term(L)), !.

is_wff(A) :- is_term(A), !.
is_wff(not(A)) :- is_wff(A), !.
is_wff(and(A, B)) :- is_wff(A), is_wff(B), !.
is_wff(or(A, B)) :- is_wff(A), is_wff(B), !.
is_wff(implies(A, B)) :- is_wff(A), is_wff(B), !.
is_wff(exist(A, B)) :- var(A), is_wff(B), !.
is_wff(every(A, B)) :- var(A), is_wff(B), !.

%
% ---- Rewrite rules for conversion of generic FOL formula to CNF
%

%% Implication in terms of or
rew(implies(A, B), Univars, F) :-
	rew(or(not(A), B), Univars, F), !.

%% Negation inwards
rew(not(not(A)), Univars, F) :-
	rew(A, Univars, F), !.
rew(not(and(A, B)), Univars, F) :-
	rew(or(not(A),not(B)), Univars, F), !.
rew(not(or(A, B)), Univars, F) :-
	rew(and(not(A), not(B)), Univars, F), !.
rew(not(implies(A, B)), Univars, F) :-
	rew(implies(not(A), not(B)), Univars, F), !.
rew(not(every(X, B)), Univars, F) :-
	rew(exist(X, not(B)), Univars, F), !.
rew(not(exist(X, B)), Univars, F) :-
	rew(every(X, not(B)), Univars, F), !.

%% Skolemize quantifiers
rew(every(X, B), Univars, F) :-
	append(Univars, [X], NewUnivars),
	rew(B, NewUnivars, F), !.
rew(exist(X, B), [], F) :-
	skolem_function(X, SK), X = SK, rew(B, [], F), !.
rew(exist(X, B), Univars, F) :-
	skolem_function(Univars, SK),
	X = SK, rew(B, Univars, F), !.

%% Rewrite the internal nodes of the formula
rew(and(A, B), Univars, and(A1, B1)) :-
	rew(A, Univars, A1),
	rew(B, Univars, B1), !.
rew(or(A, B), Univars, or(A1, B1)) :-
	rew(A, Univars, A1),
	rew(B, Univars, B1), !.

%% Base case
rew(A, _, A) :- !.

%
% --- Distributivity law
%

dist(or(and(X, Y), Z), and(or(X1, Z1), or(Y1, Z1))) :- dist(X, X1), dist(Y, Y1), dist(Z, Z1), !.
dist(or(Z, and(X, Y)), and(or(X1, Z1), or(Y1, Z1))) :- dist(X, X1), dist(Y, Y1), dist(Z, Z1), !.
dist(A, A) :- !.

%
% --- Binary conjunction and disjunction to n-ary
%

%% Case X(a, b) => X(a, b)
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
		is_literal(Arg1), is_literal(Arg2), B = A, !.

%% Case X(X(a, b), c) => X(a, b, c)
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
	   	Arg1=..[Name|_], is_literal(Arg2),
		simplify(Arg1, C), C=..[_|ArgsC],
		append(ArgsC, [Arg2], ArgsB),
		B =.. [Name|ArgsB], !.

%% Case X(a, X(b, c)) => X(a, b, c)
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
	 	is_literal(Arg1), Arg2=..[Name|_],
		simplify(Arg2, C), C=..[_|ArgsC],
		append([Arg1], ArgsC, ArgsB),
		B =.. [Name|ArgsB], !.

%% Case X(Y(a, b), c) => X(Y(a, b), c)
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
	   	Arg1=..[DifferentName|_], is_literal(Arg2),
		Name \== DifferentName, subset([DifferentName], [or, and]),
		simplify(Arg1, C),
		append([C], [Arg2], ArgsB),
		B =.. [Name|ArgsB], !.

%% Case X(a, Y(b, c)) => X(a, Y(b, c))
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
	   	is_literal(Arg1), Arg2=..[DifferentName|_],
	   	Name \== DifferentName, subset([DifferentName], [or, and]),
		simplify(Arg2, C),
		append([Arg1], [C], ArgsB),
		B =.. [Name|ArgsB], !.

%% Case X(X(a, b), X(c, d)) => X(a, b, c, d)
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
	   	Arg1=..[Name|_], Arg2=..[Name|_],
		simplify(Arg1, C), simplify(Arg2, D),
		C=..[_|ArgsC], D=..[_|ArgsD],
		append(ArgsC, ArgsD, ArgsB),
		B =.. [Name|ArgsB], !.

%% Case X(X(a, b), Y(b, c)) => X(a, b, Y(b, c))
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
		Arg1=..[Name|_], Arg2=..[DifferentName|_],
		Name \== DifferentName,
		simplify(Arg1, C),
		subset([DifferentName], [or, and]), simplify(Arg2, D),
		C=..[_|ArgsC],
		append(ArgsC, [D], ArgsB),
		B =.. [Name|ArgsB], !.

%% Case X(Y(a, b), X(c, d)) => X(Y(a, b), c, d)
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
		Arg1=..[DifferentName|_], Arg2=..[Name|_],
		simplify(Arg2, C),
		subset([DifferentName], [or, and]), simplify(Arg1, D),
		C=..[_|ArgsC],
		append([D], ArgsC, ArgsB),
		B =.. [Name|ArgsB], !.

%% Case X(Y(a, b), Y(c, d)) => X(Y(a, b), Y(c, d))
simplify(A, B) :- 	A=..[Name, Arg1, Arg2], subset([Name], [or, and]),
		Arg1=..[DifferentName|_], Arg2=..[DifferentName|_],
		simplify(Arg1, C), simplify(Arg2, D),
		append([C], [D], ArgsB),
		B =.. [Name|ArgsB], !.

%% An argument isn't simplifiable with its parent
%% if it's a term or a negation of a term (A literal)
is_literal(A) :- is_term(A), !.
is_literal(A) :- A=..[not|B], is_term(B), !.

%
% --- Generate skolem constants or functions
%

skolem_variable(V, SK) :- var(V), gensym(skv, SK).
skolem_function([], SF) :- skolem_variable(_, SF), !.
skolem_function([A | ARGS], SF) :-
	gensym(skf, SF_op),
	SF =.. [SF_op, A | ARGS].
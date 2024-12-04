import z3
import resolver as res
import clauseTypes as CT

# fp = z3.Fixedpoint()
# fp.set(engine='datalog')

# a, b, c, d = z3.Bools('a b c d')

# fp.register_relation(a.decl(), b.decl(), c.decl(), d.decl())
# fp.rule(a,b)
# fp.rule(b,c)

# print ("current set of rules\n", fp)
# print (fp.query(a))
# print (fp.get_answer())

# fp.fact(c)
# print ("updated set of rules\n", fp)
# print (fp.query(a))
# print (fp.get_answer())

# result = res.unify(
#   [
#     (
#       CT.Predicate(
#         "P",
#         ["X"],
#         False
#       ),
#       CT.Predicate(
#         "P",
#         ["x"],
#         False
#       )
#     )
#   ]
# ) 
# Expect {'X':'x'}

result = res.unify(
  [
    (
      CT.Predicate(
        "P",
        ["X"],
        False
      ),
      CT.Predicate(
        "P",
        ["x"],
        False
      )
    ),
    (
      CT.Predicate(
        "P",
        ["X"],
        False
      ),
      CT.Predicate(
        "P",
        ["x"],
        False
      )
    ),
    (
      CT.Predicate(
        "Z",
        ["Z"],
        False
      ),
      CT.Predicate(
        "P",
        ["z"],
        False
      )
    ),
    (
      CT.Predicate(
        "Pan",
        ["VAR"],
        False
      ),
      CT.Predicate(
        "Pan",
        ["var"],
        False
      )
    ),
    (
      CT.Predicate(
        "L",
        ["X"],
        False
      ),
      CT.Predicate(
        "L",
        ["k"],
        False
      )
    ),
    (
      CT.Predicate(
        "A",
        ["B"],
        True
      ),
      CT.Predicate(
        "A",
        ["b"],
        False
      )
    )
  ]
) 
# Expect {'X':'x'&'k', "Var":"var"}
# Not sure what *should* happen with A(B),A(b) with negated true (in any arbitrary order)

print(result)
import z3

fp = z3.Fixedpoint()
fp.set(engine='datalog')


a, b, c, d = z3.Bools('a b c d')

fp.register_relation(a.decl(), b.decl(), c.decl(), d.decl())
fp.rule(a,b)
fp.rule(b,c)

print ("current set of rules\n", fp)
print (fp.query(a))
print (fp.get_answer())

fp.fact(c)
print ("updated set of rules\n", fp)
print (fp.query(a))
print (fp.get_answer())

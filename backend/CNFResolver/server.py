from http.server import BaseHTTPRequestHandler, HTTPServer
import json, cgi


import resolver
import clauseTypes as CT


# Config
hostName = "localhost"
serverPort = 9000

# Server HTTP Request Handling
class Server(BaseHTTPRequestHandler):
    def do_POST(self): # What to do upon receiving POST Request
        ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))

        # Check correct file type
        if ctype != 'application/json':
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({'message':'body not JSON'}))
            return

        # Read message & convert to python class
        length = int(self.headers.getheader('content-length'))
        message = json.loads(self.rfile.read(length))
        # parsedClauses = CT.Clauses(horns=message.flatHornClauses, sats=message.flatSatClauses)

        #Format for resolution
        # CNFData = parsedClauses
        hornClauses = []
        for i in range(len(message.flatHornClauses)):
            flatHornClause = message.flatHornClauses[i]
            head = CT.Predicate(flatHornClause.head, [], False) #NOTE Assume horn head is trivial w/ name
            predicates = []
            for j in range(len(flatHornClause.predicates)):
                predicate = flatHornClause.predicates[j]
                predicates.append(CT.Predicate(predicate.name, predicate.args, predicate.isNegated))
            hornClause = CT.HornClause(head, predicates)
            hornClauses.append(hornClause)
            
        satClauses = []
        for i in range(len(message.flatSatClauses)):
            flatSatClause = message.flatSatClauses[i]
            head = CT.Predicate(flatSatClause.head, [], False) #NOTE Assume sat head is trivial w/ name
            predicates = []
            for j in range(len(flatSatClause.predicates)):
                predicate = flatSatClause.predicates[j]
                predicates.append(CT.Predicate(predicate.name, predicate.args, predicate.isNegated))
            satClause = CT.HornClause(head, predicates)
            satClauses.append(satClause)
            
        clauses = CT.Clauses(hornClauses, satClauses)

        #TODO: Parse Prolog data
        prologData = resolver.resolve(CNFData) #Format {'hello': 'world', 'received': 'ok'}
        returnData = prologData

        #TODO: Generate Return
        self.send_response(200)
        self._set_headers()
        self.send_header("Content-type", "text/json")
        self.end_headers()
        self.wfile.write(json.dumps(returnData))
        return True

if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), Server)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

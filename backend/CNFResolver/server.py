from http.server import BaseHTTPRequestHandler, HTTPServer
import json, cgi


import resolver
import clauseTypes as CT

context = resolver.Context()

# Config
hostName = "localhost"
serverPort = 9000

# Server HTTP Request Handling
class Server(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    def resolve(self):
        # Read message & convert to python class
        length = int(self.headers['Content-Length'])
        message = json.loads(self.rfile.read(length))

        #TODO: Format for prolog
        CNFData = CT.parseClauses(message['clauses'])

        #TODO: Parse Prolog data
        prologData = resolver.resolve(CNFData) #Format {'hello': 'world', 'received': 'ok'}
        if prologData == None:
            returnData = {'error': 'Error in resolving'}
        returnData = prologData
        return returnData
    def getResolvant(self):
        global context
        length = int(self.headers['Content-Length'])
        message = json.loads(self.rfile.read(length))
        returnData = {}

        if "register" in message:
            context.registerClauses(CT.parseClauses(message['register']))
        if "pairs" in message:
            pair_zero_indexed = (int(message['pairs'][0])-1, int(message['pairs'][1])-1)
            addeds,sat = context.partialResolve(pair_zero_indexed)
            if sat == resolver.Satisfaction.SAT:
                sat_str = "sat"
            elif sat == resolver.Satisfaction.UNSAT:
                sat_str = "unsat"
            else:
                sat_str = "still going on"
            returnData = {'added': CT.clausesToString(addeds), 'message': sat_str}
        if "heuristic" in message:
            pair,addeds,sat = context.heuristicResolve()
            if sat == resolver.Satisfaction.SAT:
                sat_str = "sat"
            elif sat == resolver.Satisfaction.UNSAT:
                sat_str = "unsat"
            else:
                sat_str = "still going on"
            returnData = {'added': CT.clausesToString(addeds), 'message': sat_str, 'pair': list(pair)}
        return returnData
    def do_POST(self): # What to do upon receiving POST Request
        ctype, pdict = cgi.parse_header(self.headers["Content-Type"])

        # Check correct file type
        if ctype != 'application/json':
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({'message':'body not JSON'}).encode('utf-8'))
            return

        returnData = {}
        if self.path == '/':
            returnData = self.resolve()
        elif self.path == '/resolvent':
            returnData = self.getResolvant()

        #TODO: Generate Return
        self.send_response(200)
        self.send_header("Content-Type", "text/json")
        self.end_headers()
        self.wfile.write(json.dumps(returnData).encode('utf-8'))
        return True
    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        return super().end_headers()
if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), Server)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

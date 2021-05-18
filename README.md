# Decision Support Evaluation Platform

A reusable system architecture to test different decision support environments. This provides an insight on which UI (decision support environment) works best for human decision makers to understand a particular scenario. An API web service was utilised to interact with a Python sourced game (Wolf_Goat_Cabbage), to create different decision support environments of the game with the use of web technologies.

## Scenario (Python sourced game)
The scenario is a well known puzzle and goes as follows. A farmer is on one side of a river with his wolf, goat and cabbage. He has a boat and needs to move the three items to the other side of the river. He can only fit one item at a time in the boat, and neither the goat and cabbage nor the wolf and goat can be left alone together, because in each case one will eat the other.

## Using Express Server ##
1. Install Node.js and NPM.
   https://phoenixnap.com/kb/install-node-js-npm-on-windows
2. In the terminal go to dir of server_express.
3. Type "npm install" (This will install all dependency packages required to run the server).
4. Type "npm install -g nodemon" (nodemon is used to dynamically reset the server when there are changes).
5. Type "npm install --save node-fetch" (Used to fetch from Flask)
6. Type "npm i moment" (Used to capture timestamps).
7. Type "nodemon index.js" to run the server.
8. Use http://localhost:8000 to access the server.

_Greg O'Keefe `greg.okeefe@dst.defence.gov.au`, December 2020, with important contributions from: 
- Steve Wark and Wolfgang Mayer (Python sourced game 'Wolf_Goat_Cabbage')
- Con Nicoloulias and Jake Townsend (Server Express, Website, GUI and TextUI)

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { request } = require("express");
const fetch = require("node-fetch");

const moment = require("moment");
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const FLASK_URL = "http://localhost:5000";

app.listen(8000, () => {
  console.log("Example app listening on port 8000!");
});

app.get("/", (req, res) => {
  res.send({ hello: 1 });
});

// Sends the body from req as res
app.post("/send-data", (req, res) => {
  console.log("Got body:", req.body);
  res.send(req.body);
});

// Transfer POST Request to Flask
// Passes on ("new", "list" and "cull") commands
app.post("/game", (req, res) => {
  fetch(FLASK_URL + "/game", {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(req.body),
  })
    .then((response) => response.json())
    .then((data) => {
      res.send(data);
    })
    .catch((err) => console.log(err));
});

// Transfer POST Request to Flask
// Passes on gameID and move
app.post("/game/:gameID", (req, res) => {
  fetch(FLASK_URL + "/game/" + req.params.gameID, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(req.body),
  })
    .then((response) => response.json())
    .then((data) => {
      res.send(data);

      // Get timestamp
      var time = moment().toString()
      
      // Pass data values
      clientDataLog(req.params.gameID, req.body, data, time);
      jsonDataLog(req.params.gameID, req.body, data);
    })
    .catch((err) => console.log(err));
});

// Gets a file with the specified gameID
app.get("/file/:gameID", (req, res) => {
  try {
    var data = fs.readFileSync(
      "./playthrough/id_" + req.params.gameID + ".json"
    );
    res.send(data);
  } catch (e) {
    console.log(e.message());
  }
});

app.get("/graphical-ui", (req, res) => {
  res.send(graphicalUI());
});

app.get("/text-ui", (req, res) => {
  res.send(textUI());
});

app.get("/choose-ui", (req, res) => {
  res.send(chooseUI());
});


function graphicalUI() {
  return {ui: "GUIClick"};
}

function textUI() {
  return {ui: "TextUI"};
}

var uiSwitch = 0;

// Used to choose and send a ui to the web-page (50-50)
function chooseUI() {
  // Sends the ui the case matches
  switch (uiSwitch) {
    case 0:
      uiSwitch = 1;
      return { ui: "TextUI" };
    case 1:
      uiSwitch = 0;
      return { ui: "GUIClick" };
  }
}

// *** File Writting ***

// JSON data logging
async function jsonDataLog(gameID, move, state) {
  // Data
  const status = await getGameStatus(state);
  const data = await writeJson(status, move, state);

  // File path
  const path = "./playthrough/id_" + gameID + ".json";

  try {
    if (fs.existsSync(path) && move["verb"] != "observe") {
      // File exists, append data.
      fs.appendFileSync(path,
        ",\n  " + data
      );
      // Closing brace when game is finised
      if (status == "lose" || status == "win" || status == "timesup") {
        fs.appendFileSync(path, "\n}");
      }
    } else if (!fs.existsSync(path)) {
      // File does not exist, write a new file with data.
      fs.writeFileSync(
        path,
        "{\n  " + data
      );
      // Closing brace when game is finished
      if (status == "lose") {
        fs.appendFileSync(path, "\n}");
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Human readable data logging
async function clientDataLog(gameID, move, state, time) {
  // Write data
  const data = await writeClient(move, state, time);

  // File functions
  const path = "./readthrough/id_" + gameID + ".txt";

  try {
    if (fs.existsSync(path) && move["verb"] != "observe") {
      //file exists
      fs.appendFileSync(path, data,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    } else if (!fs.existsSync(path)) {
      fs.writeFileSync(path,
        "---------------------------------\nGameID: " +
        gameID + "\n" + data,
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
      console.log("NewFileSuccess");
    }
  } catch (err) {
    console.error(err);
  }
}

async function writeJson(status, move, state) {
  // Data
  const getState = await getGameState(state);
  const movesRemaining = await getMovesRemaining(state);
  const moveCount = await getMoveCount(movesRemaining);

  // Write data in Json format
  writeJsonData = '"' + moveCount + '"' 
  + ': {\n    "move": ' + JSON.stringify(move, null, 6).split("}").join("    }") 
  + ',\n    "moves_remaining": ' + JSON.stringify(movesRemaining) 
  + ',\n    "state": ' + JSON.stringify(getState, null, 6).split("}").join("    }") 
  + ',\n    "status": "' + status 
  + '"\n  }';

  return writeJsonData;
}

async function writeClient(move, state, time) {
  // Data
  const getState = await getGameState(state);
  const status = await getGameStatus(state);
  const movesRemaining = await getMovesRemaining(state);
  const timeStamp = time;
  
  // Write data in human readable format
  writtenData = "Move Made: " + JSON.stringify(move) + "\n" 
  + "TimeStamp: " + timeStamp + "\n" 
  + "Moves Remaining: " + movesRemaining + "\n" 
  + "Game State: " + JSON.stringify(getState) + "\n" 
  + "Result: " + status +
  "\n---------------------------------\n";

  return writtenData;
}

// Gets the game's state
async function getGameState(json) {
  return json["state"]
}

// Gets the game's status
async function getGameStatus(json) {
  return json["status"]
}

// Gets the moves remaining
async function getMovesRemaining(json) {
  return json["moves_remaining"]
}

// Gets the move count
async function getMoveCount(movesLeft) {
  var maxMoves = 25;
  var moveCount = maxMoves - movesLeft;
  return moveCount;
}

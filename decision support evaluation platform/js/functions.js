// Created by Jake Townsend on 15/10/20.

var gameTitle = "Wolf, Goat, Cabbage";
var gameID = -1;
var playerID = 24; // placeholder for now...
var MAX_MOVES = 25; // placeholder (Get from server)
var moves_remaining = 25;
var currentState = null
var boatEmpty = null;


var EXPRESS_URL = "http://localhost:8000"; // Express Server

// Basic info about the Wolf Goat Cabbage
var scenarioInfo = [
  "Description:",
  "The aim here is to successfully get the 'Wolf, 'Goat' and 'Cabbage' across the river.",
  "",
  "Rules:",
  "1. The Goat cannot be left alone with the Wolf.",
  "2. The Cabbage cannot be left alone with the Goat",
  "3. You can only load one onto the boat at a time.",
  "",
  "Actions:",
  "- Observe (Displays the current state)",
  "- Load 'x' (Moves x onto the boat)",
  "- Cross (Moves the boat to the otherside)",
  "- Unload (Unloads x on the same side as boat)",
  
];

// ************** SERVER FUNCTIONS **************
// **********************************************

// Route: Express --> Flask

// Requires body (command: ("new", "list" or "cull"))
async function sendCommand(command) {
  try {
    const response = await fetch(EXPRESS_URL + "/game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command: command }),
    });
    
    return await response.json(); // Return response as json
    
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Sends the input move
async function sendTextInput(textURL, body) {
  try {
    const response = await fetch(EXPRESS_URL + "/game/" + gameID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    currentState = await response.json();
    console.log("CurrentState: ", currentState)
    translateGameInfo(currentState, JSON.parse(body));
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Requests a new game to be created
async function getNewGame() {
  await sendCommand("new");
}

// Retruns a list of games
async function getListOfGames() {
  return await sendCommand("list");
}

// Culls all games that are not "continue"?
async function cullGame() {
  sendCommand("cull");
}

// Gets the current state
async function showCurrentState() {
  sendTextInput("", JSON.stringify({
    verb: "observe",
  }));
}

// Chooses a UI
async function chooseUI() {
  try {
    const response = await fetch(EXPRESS_URL + "/choose-ui");
    var json = await response.json();
    return json["ui"];
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Gets text UI
async function textUI() {
  try {
    const response = await fetch(EXPRESS_URL + "/text-ui");
    var json = await response.json();
    return json["ui"];
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Gets graphic UI
async function graphicalUI() {
  try {
    const response = await fetch(EXPRESS_URL + "/graphical-ui");
    var json = await response.json();
    return json["ui"];
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// *************** MAIN FUNCTIONS ***************
// **********************************************

// Used to determine the users move
async function evaluateInput(e) {
  // Only evaluate if 'Enter' key pressed
  if (e.keyCode === 13) {
    var textInputField = document
      .getElementById("decision")
      .value.toLowerCase();
    
    // Split text by spaces
    var splitText = textInputField.split(" ");
    var body = await generateBody(splitText);
    
    // Check that body was generated
    if (body != null) {
      sendTextInput("", body);
    }
    clearInputField();
  }
}

// Determine how to generate body
async function generateBody(textArray) {
  if (gameTitle == "Wolf, Goat, Cabbage") {
    return generateWolfGoatCabbageBody(textArray[0], textArray[1]);
  } else if (gameTitle == "Joadia") {
    return generateJoadiaBody(textArray);
  } else {
    // Error: No function for that title
  }
}

// Game specific json body generation
async function generateJoaidaBody(textArray) {}

// Check if the object being loaded is on the same side
async function onSameSide(obj) {
 if(currentState["state"][obj] == currentState["state"]["boat"]) {
   return true
  }
  alert("Warning: Trying to load object that is not on the same side as boat!")
}

// Game specific json body generation
async function generateWolfGoatCabbageBody(verb, obj) {
  
  // Checking if move is load
  if (verb == "load") {
    // Check if you can load an object
    if(boatEmpty && onSameSide(obj)) {
      // Check if second word is valid
      if (checkObject(obj)) {
        // Create appropriate body layout
        return JSON.stringify({
          verb: verb,
          object: obj,
        });
      } else {
        // Second word "object" is invalid
        alert("Error: Input not valid. Use 'Load Goat', 'Load Wolf' or 'Load Cabbage'");
      }
    }
    else {
      // Boat is not empty
      alert("Warning: An object is already loaded on the boat!");
    }
  }
  else if (checkVerb(verb)) { 
    // Check verb is allowed
    // Create appropriate body layout
    return JSON.stringify({
      verb: verb,
    });
  }
  else {
    // First word "verb" was invalid
    alert("Error: Input not valid. Use 'Observe', 'Load x', 'Unload' or 'Cross'");
  }
}

// Determines how to proceed after the move
async function translateGameInfo(json, moveJson) {
  // Get the current game status
  const status = await getGameStatus(json);

  // Update move counter
  setGameMovesRemaining(json);
  
  // Update display
  translateGameState(
    await getGameState(json),
    moveJson,
    status,
    await getMoveNum()
  );

  if (status == "lose") {
    checkHowLoss()
    disableTextInput();
  } else if (status == "win") {
    alert("Winner!!!");
    disableTextInput();
  } else if (status == "timesup") {
    alert("Out of moves... Better luck next time!");
    disableTextInput();
  }
}

// Determines the positions of each character
async function translateGameState(stateJson, moveJson, status, moveNum) {
  var near = "";
  var far = "";
  var boat = "";
  var stateArray = [];
  var moveMade = "";
  boatEmpty = true

  // Check location of all characters
  for (key in stateJson) {
    if (key != "boat") {
      // Add key "character" to side it's located
      if (stateJson[key] == "near_side") {
        // Append character
        near += (key + " ");
      } else if (stateJson[key] == "far_side") {
        // Append character
        far += (key + " ");
      } else {
        boatEmpty = false
        boat += key;
      }
    } else {
      boat = key + " ";
    }
  }
  
  // Creates the move made in text
  if (moveJson != null) {
    if (moveJson["object"] != null) {
      moveMade = "[" + moveJson["verb"] + " " + moveJson["object"] + "]";
    } else {
      moveMade = "[" + moveJson["verb"] + "]";
    }
  }

  stateArray.push("*** Move " + moveNum);
  stateArray.push("*** Input: " + moveMade);
  stateArray.push("*** Status: " + status);

  // Append far side
  stateArray.push(far, "~~~~~~~~~~~~~~~~~~~~");

  // Append River
  // Get 'value' from 'key' "boat" and check side
  if (stateJson["boat"] == "far_side") {
    stateArray.push(boat, "");
  } else {
    stateArray.push("", boat);
  }

  // Append near side
  stateArray.push("~~~~~~~~~~~~~~~~~~~~", near);

  displayState(stateArray);
}

// Check if either 'goat' or 'cabbage' has been eaten
async function checkHowLoss() {
  if (currentState["state"]["cabbage"] == null) {
    alert("You lose, Cabbage was eaten by the Goat!")
  }
  else if (currentState["state"]["goat"] == null) {
    alert("You lose, Goat was eaten by the Wolf!")
  }
}

// Check if 'verb' is equal to allowed verbs
async function checkVerb(verb) {
  if(verb == "unload" |
     verb == "cross" |
     verb == "observe") {
    return true;
  } 
  return false;
}

// Check if 'object' is equal to allowed objects
async function checkObject(obj) {
  if(obj == "wolf" |
     obj == "goat" |
     obj == "cabbage") {
    return true;
  } 
  return false;
}

// Gets the game result (i.e. "Continue", "Win", "Lose", "Timeup")
async function getGameStatus(json) {
  return json["status"]
}

// Gets the games state
async function getGameState(json) {
  return json["state"]
}

// Gets the current move number
async function getMoveNum() {
  return MAX_MOVES - moves_remaining;
}

// ************** HELPER FUNCTIONS **************
// **********************************************

// Called by TextUI to load data for use 
async function onUILoad() {
  try {
    setTitle();
    settingGameID(); // Set from storage
    addGameIDScreen()
  } catch (e) {}
}

// Set the title of the page
async function setTitle() {
  document.getElementById("heading").innerHTML = "Welcome to " + gameTitle;
}

// Sets the gameID using the stored gameID in sessionStorage
async function settingGameID() {
  gameID = JSON.parse(sessionStorage.getItem("gameID"))[0];
}

// Add the gameID to the screen
async function addGameIDScreen() {
  document.getElementById("smallGameID").innerText = "GameID: " + gameID;
}

// Displays game / scenario details, rules and actions
async function displayScenarioInfo() {
  for (line in scenarioInfo) {
    outputToDisplay(scenarioInfo[line]);
  }
}

// TetxUI: Outputs text to the display area
async function outputToDisplay(text) {
  var par = document.createElement("par");
  par.innerHTML = text + "<br>";
  var div = document.getElementById("outputDiv");
  div.appendChild(par);
  div.scrollTop = div.scrollHeight
}

// TextUI: Writes each line on the array onto the display
async function displayState(state) {
  outputToDisplay("");
  for (line in state) {
    outputToDisplay(state[line]);
  }
}

// TextUI: Clears the input field
async function clearInputField() {
  document.getElementById("decision").value = "";
}

// Filters the list of games by status and creates a listItem array
async function filterGameList(filter) {
  var list = await getListOfGames()
  var listArray = [];

  for (_gameID in list) {
    var status = list[_gameID]["status"];
    // Filter the list by status
    if (filter == status) {
      // Add listItem to Array
      listArray.push(await createListItem(_gameID, status))
    }
  }
  return listArray
}

// Adds the list of games to Game's List or Completed List
async function addListToScreen(text) {
  if(text == 'continue') {
    var continueList = await filterGameList('continue');
    // Append continueList to Screen
    for(item in continueList) {
      // Check if gameID is odd/even
      if(continueList[item].value % 2 == 0) {
        // Even is for textUI
        document.getElementById("textUIList").appendChild(continueList[item]);
      } else {
        // Odd is for GUI
        document.getElementById("guiList").appendChild(continueList[item]);
      }
    }   
  }
  else {
    // Add everything else that is not continue (aka GameList Complete)
    // Get lists
    var winList = await filterGameList('win');
    var loseList = await filterGameList('lose');
    var timesupList = await filterGameList('timesup');
  
    // Append winList to Screen
    for(item in winList){ 
      document.getElementById("winList").appendChild(winList[item]);
    }
  
    // Append winList to Screen
    for(item in loseList){ 
      document.getElementById("loseList").appendChild(loseList[item]);
    }
  
    // Append winList to Screen
    for(item in timesupList){ 
      document.getElementById("timesupList").appendChild(timesupList[item]);
    }
  }
}

// Creates a list item component for displaing a game in list
async function createListItem(_gameID, status) {
  var href = null;

  // Check if game is active
  if (status == "continue") {
    if(_gameID % 2 == 0) {
      // Give Text UI
      href = "./pages/" + (await textUI()) + ".html";
    } else {
      href = "./pages/" + (await graphicalUI()) + ".html";
    }
  } else {
    href = "./playthroughTextUI.html";
  }

  var link = createElementLink(
    href,
    "list-group-item list-group-item-action border-size-2 mt-3",
    "",
    _gameID,
    ""
  );

  var div = createElementDiv(
    "d-flex w-100 justify-content-between",
    "",
    "",
    ""
  );

  // Game ID
  var header = document.createElement("h5");
  header.className = "mb-1";
  header.innerHTML = "Game ID: " + _gameID;

  // Status
  var small = document.createElement("small");
  small.innerHTML = "Status: " + status;

  // Title
  var p = document.createElement("p");
  p.className = "mb-1";
  p.innerHTML = gameTitle;

  // Append all elements
  div.appendChild(header);
  div.appendChild(small);

  link.appendChild(div);
  link.appendChild(p);

  return link
}

// Creates a div element
function createElementDiv(_class, _id, _title, _innerHTML) {
  var div = document.createElement("div");
  div.className = _class;
  div.id = _id;
  div.title = _title;
  div.innerHTML = _innerHTML;
  return div;
}

// Creates a link element
function createElementLink(_href, _class, _id, value, _innerHTML, _onClick) {
  var link = document.createElement("a");
  link.href = _href;
  link.className = _class;
  link.id = _id;
  link.value = value;
  link.innerHTML = _innerHTML;
  link.onclick = function () {
    storeGameID(this.value);
  };
  return link;
}

// Gets the move count
async function setGameMovesRemaining(json) {
    moves_remaining = json["moves_remaining"];
    document.getElementById("smallMovesRemaining").innerText =
        "Moves Remaining: " + moves_remaining;
}

// Sets the Game ID and playthoughMove Number
async function storeGameID(clickedID) {
  var gid = [clickedID, 0]
  sessionStorage.setItem("gameID", JSON.stringify(gid));
}

// Disables the input text
async function disableTextInput() {
  document.getElementById("decision").disabled = true;
}

// *********** PLAY THORUGH FUNCTIONS ***********
// **********************************************

var playthroughJSON = "";
var playthroughMove = 0;

// Update move counter and get next move
async function backMove() {
  if (playthroughMove > 0) {
    playthroughMove--;
    getMove(playthroughMove);
    
    // Save the current move number (used when switching UI)
    sessionStorage.setItem("gameID", JSON.stringify([gameID, playthroughMove]));
  } else {
    alert("Warning: There is no move below '0'");
  }
}

// Update move counter and get next move
async function nextMove() {
  if(playthroughMove < Object.keys(playthroughJSON).length - 1) {
    playthroughMove++;
    getMove(playthroughMove);

    // Save the current move number (used when switching UI)
    sessionStorage.setItem("gameID", JSON.stringify([gameID, playthroughMove]));
  }
  else {
    alert("Warning: The is no move above '" + (Object.keys(playthroughJSON).length - 1) + "'");
  }
}

// Change the current UI
async function switchUI() {
  window.location.href = "./playthroughGUIClick.html";
}

// Get file with the current gameID
async function getGameIDFile() {
  try {
    const response = await fetch(EXPRESS_URL + "/file/" + gameID);
    playthroughJSON = await response.json();

    // Get current playthrough move from storage
    playthroughMove = JSON.parse(sessionStorage.getItem("gameID"))[1]

    // Show the current move
    getMove(playthroughMove);
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Show the current move 
async function getMove(moveID) {
  var move = playthroughJSON[moveID]["move"];
  var state = playthroughJSON[moveID]["state"];
  var status = playthroughJSON[moveID]["status"];
  translateGameState(state, move, status, playthroughMove);
}
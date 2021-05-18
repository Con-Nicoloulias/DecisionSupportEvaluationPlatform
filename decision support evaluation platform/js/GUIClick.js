// Placeholders
var gameID = -1;
var MAX_MOVES = 0;
var moves_remaining = 0;

// Titles
var gameTitle = "Wolf, Goat, Cabbage";
var playthroughTitle = "Playthrough - Wolf, Goat, Cabbage";

// Game end headers
var header = document.getElementById("heading");
var endState = "";

// Basic info to play Wolf Goat Cabbage
var scenarioInfo = ["<strong>Aim:</strong><br>"
+ "Get the Wolf, Goat, and Cabbage on the other side of the river.<br>" 
+ "<strong>Rules:</strong><br>"
+ "1. The Goat cannot be left alone with the Wolf.<br>"
+ "2. The Cabbage cannot be left alone with the Goat.<br>"
+ "3. You can only load one onto the boat at a time."];
var howToPlay = [
  "1. Click on Wolf, Goat, or Cabbage to load onto the boat. <br>"
  + "2. Click character that is loaded onto the boat to place them back to land. <br>"
  + "3. Click on boat man to finalise your move and cross the river. <br>"
  + "<strong>(NOTE: Game will end after 25 moves are made!)</strong>"];

// Create a variable to have an environment area.
var lowLand = document.getElementById("landDown");
var topLand = document.getElementById("landUp");
var nearRiver = document.getElementById("nearRiver");
var farRiver = document.getElementById("farRiver");

// Create a variable to have a SVG character.
var boatPos = document.getElementById("BoatMan");
var goatPos = document.getElementById("Goat");
var wolfPos = document.getElementById("Wolf");
var cabbagePos = document.getElementById("Cabbage");

// Express Server
var EXPRESS_URL = "http://localhost:8000";

// Route: Express --> Flask --------------------------------------
// Send command through Express -> Flask
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
    return await response.json(); // Return json from response
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Send the input move Express -> Flask
async function sendSVGInput(body) {
  try {
    const response = await fetch(EXPRESS_URL + "/game/" + gameID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    const json = await response.json();
    translateGameInfo(json, JSON.parse(body));
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Requests a new game and sets the gameID
async function getNewGame() {
  await sendCommand("new");
}

// Gets the current state of the game
async function showCurrentState() {
  sendSVGInput(JSON.stringify({
    verb: "observe",
  }));
}

// ********** Record game state information **************
// *******************************************************
async function loadInput(character) {
  // Create JSON body for Loading
  var body = JSON.stringify({
    verb: "load",
    object: character.toLowerCase(),
  });
  // Grab input data to send to Express.
  sendSVGInput(body);
}

async function unloadInput() {
  // Create JSON body for unloading
  var body = JSON.stringify({
    verb: "unload",
  });
  // Grab input data to send to Express.
  sendSVGInput(body);
}

async function crossInput() {
  // Create JSON body for move
  var body = JSON.stringify({
    verb: "cross",
  });
  // Grab input data to send to Express.
  sendSVGInput(body);
}

// ********* Translate the state of the game **********
// ****************************************************
// Determines how to proceed after the move
async function translateGameInfo(json, moveJson) {
  // Get the status and state
  const status = await getGameStatus(json);
  const state = await getGameState(json);

  // Translate state of the game
  translateGameState(
    await getGameState(json),
    moveJson,
    status,
    await getMoveNum()
  );

  // Continue
  if (status == "continue") {
    setGameMovesRemaining(json);
  } else if (status == "lose") {
    // Lose
    // Remove character if not in game state.
    if (!state["goat"]) {
    goatPos.remove();
    endState = "Wolf ate the Goat!";
    loseScreen(endState);
    } else if (!state["cabbage"]) {
    cabbagePos.remove();
    endState = "Goat ate the Cabbage!";
    loseScreen(endState);
    }
    disableAllCharacters();
    setGameMovesRemaining(json);
    alert("You lose...");
  } else if (status == "win") {
    // Win
    winScreen();
    disableAllCharacters();
    setGameMovesRemaining(json);
    alert("Winner!!!");
  } else {
    // Time is up...
    timeUpScreen();
    disableAllCharacters();
    setGameMovesRemaining(json);
    alert("Times Up... Better luck next time!");
  }
}

// Determines the move when a character is clicked.
async function characterClicked(character) {
  // Check character is on the boat.
  var onBoat = await checkOnBoat();

  // Record input to unload character off the boat. 
  if (onBoat != null && character.value == "boat") {
      unloadInput();
      // Enable all characters to be clickable.
      enableCharacters();
  } else {
    // Record input to load character onto boat.
    if (character.value == boatPos.value 
      && character.id != "BoatMan") {
        loadInput(character.id);
        // Disable characters to be clicked.
        disableCharacters(character);
    }
  }

  // Record input to cross the boat.
  if (character.id == "BoatMan") {
    crossInput();
  }
}

// Check if the character is on the boat.
async function checkOnBoat() {  
  if (goatPos.value == "boat") {
    return goatPos;
  } else if (wolfPos.value == "boat") {
    return wolfPos;
  } else if (cabbagePos.value == "boat") {
    return cabbagePos;
  }
  return null;
}

// Disable character clicks
async function disableCharacters(character) {
  if (character.id == "Goat") {
    wolfPos.disabled = true;
    cabbagePos.disabled = true;
  }
  else if (character.id == "Cabbage") {
    goatPos.disabled = true;
    wolfPos.disabled = true;
  }
  else if (character.id == "Wolf") {
    goatPos.disabled = true;
    cabbagePos.disabled = true;
  }
}

// Enable character clicks
async function enableCharacters() {
  goatPos.disabled = false;
  wolfPos.disabled = false;
  cabbagePos.disabled = false;
}

// Disable all characters when game ends.
async function disableAllCharacters() {
  goatPos.disabled = true;
  wolfPos.disabled = true;
  cabbagePos.disabled = true;
  boatPos.disabled = true;
}

// Determines the positions of each character
async function translateGameState(stateJson, moveJson, status, moveNum) {

  // Check character is on the boat.
  var onBoat = await checkOnBoat();

  // Create an array to collect state information.
  var stateArray = [];
  
  // To obtain text of the move made.
  var moveMade = "";
  if (moveJson != null) {
    if (moveJson["object"] != null) {
      moveMade = "[" + moveJson["verb"] + " " + moveJson["object"] + "]";
    } else {
      moveMade = "[" + moveJson["verb"] + "]";
    }
  }

  // State of characters.
  wolfPos.value = stateJson["wolf"];
  cabbagePos.value = stateJson["cabbage"];
  boatPos.value = stateJson["boat"];
  goatPos.value = stateJson["goat"];

  // Check to remove a character if not in game state.
  if (!stateJson["goat"]) {
    goatPos.remove();
  } else if (!stateJson["cabbage"]) {
    cabbagePos.remove();
  }

  // Check to move the boat to near_side, else move to far_side.
  boatPos.value == "near_side" ? moveBoatNear() : moveBoatFar();

  // Move character with the boat.
  if (onBoat != null) {
    moveWithBoat(onBoat);
  }

  // Update state of cabbage.
  // Load to boat, else unload from boat.
  if (cabbagePos.value == "boat") {
    loadOnBoat(cabbagePos);
  } else if (cabbagePos.value != "boat") {
    unloadFromBoat(cabbagePos);
  }
  
  // Update state of goat.  
  // Load to boat, else unload from boat.
  if (goatPos.value == "boat") {
    loadOnBoat(goatPos);
  } else if (goatPos.value != "boat") {
    unloadFromBoat(goatPos);
  }
  
  // Update state of wolf.    
  // Load to boat, else unload from boat.
  if (wolfPos.value == "boat") {
    loadOnBoat(wolfPos);
  } else if (wolfPos.value != "boat") {
    unloadFromBoat(wolfPos);    
  }

  // Get the state in text and call a function to display the state.
  stateArray.push("<strong>*** Move:</strong> " + moveNum);
  stateArray.push("<strong>*** Input:</strong> " + moveMade);
  stateArray.push("<strong>*** Status:</strong> " + status);
  outputToDisplay(stateArray);
}

// Gets the game result (i.e. "Continue", "Win", "Lose", "Timeup")
async function getGameStatus(json) {
  for (key in json) {
    if (key == "status") {
      return json[key];
    }
  }
}

// Gets the games state
async function getGameState(json) {
  for (key in json) {
    if (key == "state") {
      return json[key];
    }
  }
}

// Gets the move count
async function setGameMovesRemaining(json) {  
  for (key in json) {
    if (key == "moves_remaining") {
      moves_remaining = json[key];
      document.getElementById("movesRemaining").innerHTML = 
        "Moves remaining: " + moves_remaining;
      return json[key];
    }
  }
}

// Gets moves remaining
async function getMoveNum() {
  return MAX_MOVES - moves_remaining;
}

//********Game Set-up************
//*******************************
// Move character with the boat.
async function moveWithBoat(character) {
  if (boatPos.value == "near_side") {
    nearRiver.appendChild(character);
    setPosition(character, "50%", "10%");
  } else {
    farRiver.appendChild(character);
    setPosition(character, "50%", "55%");
  }
}

// Positionings to load character onto the boat.
async function loadOnBoat(character) {
  if (boatPos.value == "near_side") {
    nearRiver.appendChild(character);
    setPosition(character, "50%", "10%");
  } else {
    farRiver.appendChild(character);
    setPosition(character, "50%", "55%");
  }
}

// Positionings to unload character from the boat.
async function unloadFromBoat(character) {
  if (character.value == "near_side") {
    lowLand.appendChild(character);
    if (character.id == "Goat") {  
      setPosition(goatPos, "40%", "30%");
    }
    else if (character.id == "Wolf") {
      setPosition(wolfPos, "50%", "30%");
    }
    else if (character.id == "Cabbage") {
      setPosition(cabbagePos, "60%", "30%");
    }
  } else if (character.value == "far_side") {
    topLand.appendChild(character);
    if (character.id == "Goat") {  
      setPosition(goatPos, "40%", "10%");
    }
    else if (character.id == "Wolf") {
      setPosition(wolfPos, "50%", "10%");
    }
    else if (character.id == "Cabbage") {
      setPosition(cabbagePos, "60%", "10%");
    }
  }
}

// Set character positions.
async function setPosition(object, leftStyle, bottomStyle) {
  object.style.left = leftStyle;
  object.style.bottom = bottomStyle;  
}

// Move boat to the far river side.
async function moveBoatFar() {
  farRiver.appendChild(boatPos);
  boatPos.style.bottom = "30%";
}

// Move boat to the near river side.
async function moveBoatNear() {
  nearRiver.appendChild(boatPos);
  boatPos.style.bottom = "-20%";
}

// ********* Page Set-up **********
// ********************************
// Load the page GUIClick.html page.
async function pageLoad() {
  try {
    setTitle();
    setScenario();
    setGameID();
    // Display gameID
    document.getElementById("smallGameID").innerText = "GameID: " + gameID;
    setDefaultPositions();
  } catch (e) {}
}

// Load playthroughGUI.html page.
async function playthroughLoad() {
  try {
    setPlaythrough();
    setGameID();
    // Display gameID
    document.getElementById("smallGameID").innerText = "GameID: " + gameID;
    setDefaultPositions();
  } catch (e) {}
}

// Sets the gameID using the stored gameID in sessionStorage
async function setGameID() {
  gameID = JSON.parse(sessionStorage.getItem("gameID"))[0];
}

// Outputs the game state to the page in text.
async function outputToDisplay(text) {
  var par = document.getElementById("output");

  if (document.getElementById("output") != null) {
    var splitCommas = JSON.stringify(text).split(',').join(',<br>');
    var splitQuotes = splitCommas.split('"').join('');
    var displayText = splitQuotes.slice(1, -1);
    par.innerHTML = displayText;
  }
}

// Set default positions
async function setDefaultPositions() {
  // Set each SVG character to their default environment area.
  nearRiver.appendChild(boatPos);
  lowLand.appendChild(goatPos);
  lowLand.appendChild(wolfPos);
  lowLand.appendChild(cabbagePos);
  
  // Set positions for each SVG character.
  setPosition(boatPos, "50%", "-20%");
  setPosition(goatPos, "40%", "30%");
  setPosition(wolfPos, "50%", "30%");
  setPosition(cabbagePos, "60%", "30%");
}

// Set title of the page
async function setTitle() {
  if (document.getElementById("heading") != null) {
    return document.getElementById("heading").innerHTML = "Welcome to " + gameTitle
  }
}

// Set playthrough title
async function setPlaythrough() {
  if (document.getElementById("playthrough") != null) {
    return document.getElementById("playthrough").innerHTML = playthroughTitle;
  }
}

// Set scenario information
async function setScenario() {
  // Display Scenario information and How to play
  if (document.getElementById("scenario") != null
    && document.getElementById("instructions") != null) {
      document.getElementById("scenario").innerHTML = scenarioInfo;
      document.getElementById("instructions").innerHTML = howToPlay;
  }
}

// Displays end result
async function loseScreen(lose) {
  if (header != null) {
    header.innerHTML = "You Lose, " + lose + " Thanks for playing!";
  }
}
async function winScreen() {
  header.innerHTML = "You Win, thanks for playing!";
}
async function timeUpScreen(timeup) {
  header.innerHTML = "Time has run out, thanks for playing!";
}

// *********** PLAY THORUGH FUNCTIONS ***********
// **********************************************
var playthroughJSON = "";
var playthroughMove = 0;

// Playthrough the move made previously
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

// Playthrough the next move
async function nextMove() {
  if(playthroughMove < Object.keys(playthroughJSON).length - 1) {
    playthroughMove++;
    getMove(playthroughMove);

    // Save the current move number (used when switching UI)
    sessionStorage.setItem("gameID", JSON.stringify([gameID, playthroughMove]));
  }
  else {
    alert("Warning: There is no move above '" + (Object.keys(playthroughJSON).length - 1) + "'");
  }
}

// Switch UI
async function switchUI() {
  window.location.href = "./playthroughTextUI.html";
}

// Get a gameID file
async function getGameIDFile() {
  try {
    const response = await fetch(EXPRESS_URL + "/file/" + gameID);
    playthroughJSON = await response.json();

    // Get current playthrough move from storage
    playthroughMove = JSON.parse(sessionStorage.getItem("gameID"))[1]

    // Show current move
    getMove(playthroughMove);
  } catch (e) {
    console.log(`Error fetching ${e.message}`);
  }
}

// Translate the move, state, and status
async function getMove(moveID) {
  var move = playthroughJSON[moveID]["move"];
  var state = playthroughJSON[moveID]["state"];
  var status = playthroughJSON[moveID]["status"];
  translateGameState(state, move, status, playthroughMove);
}
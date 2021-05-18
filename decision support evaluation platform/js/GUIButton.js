// gameID placeholder
var gameID = -1;

// Titles
var gameTitle = 'Wolf, Goat, Cabbage';

// Basic info for Wolf Goat Cabbage
var scenarioInfo = ["<strong>Aim:</strong><br>"
+ "Get the Wolf, Goat, and Cabbage on the other side of the river.<br>"
+ "<strong>Rules:</strong><br>"
+ "1. The Goat cannot be left alone with the Wolf. <br>"
+ "2. The Cabbage cannot be left alone with the Goat. <br>"
+ "3. You can only load one onto the boat at a time."];

var howToPlay = ["<strong>Actions:</strong>"
+ "<br>1. Click on Load Wolf, Goat, or Cabbage button to load them onto the boat." 
+ "<br>2. Click on 'Unload' button to place the character back to land."
+ "<br>3. Click on 'Move Boat' button to finalise your move and cross the river."
+ "<br><strong>(NOTE: Game will end after 25 moves are made!)</strong>"];

// Create a variable to have a SVG character.
var boat = document.getElementById("BoatMan");
var goat = document.getElementById("Goat");
var wolf = document.getElementById("Wolf");
var cabbage = document.getElementById("Cabbage");

// Create a variable to have a button.
var unload = document.getElementById("UnloadBoat");
var loadCab = document.getElementById("OnCabbage");
var loadWolf = document.getElementById("OnWolf");
var loadGoat = document.getElementById("OnGoat");
var movingBoat = document.getElementById("MoveBoat");

// Create a variable to have an environment area.
var lowLand = document.getElementById("landDown");
var topLand = document.getElementById("landUp");
var nearRiver = document.getElementById("nearRiver");
var farRiver = document.getElementById("farRiver");

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

// Route: Flask
//async function newGame() {
//     try {
//       console.log("Request new Game");
//       const response = await fetch("http://localhost:5000/new_game");
//       const json = await response.json();
//       // returned {"new_game_id": 0}
  
//       gameID = Object.values(json)[0];
//       console.log("Response in JSON = " + JSON.stringify(json));

//       // Set each SVG character to their default positions.
//       setDefaultPositions()

//       // Set Load buttons to enabled.
//       loadGoat.disabled = false;
//       loadWolf.disabled = false;
//       loadCab.disabled = false;
      
//       // Set Unload button to disabled.
//       unload.disabled = true;

//     } catch (e) {
//         console.log(`Error fetching ${e.message}`);
//     }
// }

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
      translateGameInfo(json);
    } catch (e) {
      console.log(`Error fetching ${e.message}`);
    }
}

// Requests a new game, sets and displays the gameID
async function getNewGame() {
    var json = await sendCommand("new");
    gameID = Object.values(json)[0];
    document.getElementById("smallGameID").innerText = "GameID: " + gameID;
}

// Record game state information -------------------------------------------
async function loadInput(loaded) {
    // Create JSON body for Loading
    var body = JSON.stringify({
        verb: "load",
        object: loaded.toLowerCase(),
    });
    // Grab input data to send to Express.
    sendSVGInput(body);
}

async function unloadInput() {
    // Create JSON body for unloading
    var body = JSON.stringify({
        verb: "unload"
    });
    // Grab input data to send to Express.
    sendSVGInput(body);
}

async function moveInput() {    
    // Create JSON body for move
    var body = JSON.stringify({
        verb: "cross"
    });
    console.log(body);
    // Grab input data to send to Express.
    sendSVGInput(body);
}

// Determines how to proceed after the move
async function translateGameInfo(json) {

    const status = await getGameStatus(json);
    const move = await getMove(json);
  
    if (result == "continue") {
        getGameState(json);
        document.getElementById("moves").innerHTML = "Moves remaining: " + move;
    } 
    else if (status == "lose") {
        loseScreen();
        disableAllButtons();
        document.getElementById("moves").innerHTML = "Moves remaining: " + move;
        alert("You lose...");
    } 
    else if (status == "win") {
        winScreen();
        disableAllButtons();
        document.getElementById("moves").innerHTML = "Moves remaining: " + move;
        alert("Winner!!!");
    } 
    else {
        // Time is up...
        timeUpScreen();
        disableAllButtons();
        document.getElementById("moves").innerHTML = "Moves remaining: " + move;
        alert("Times Up... Better luck next time!");
    }
}

// Disable all buttons
async function disableAllButtons() {
    loadWolf.disabled = true;
    loadGoat.disabled = true;
    loadCab.disabled = true;
    unload.disabled = true;
    movingBoat.disabled = true;
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
async function getMove(json) {
    for (key in json) {
        if (key == "moves_remaining") {
            return json[key];
        }
    }
}

// Game set up -----------------------------------------------------
function moveBoat() {
    // Move the boat from nearRiver to farRiver.
    if (nearRiver.contains(boat)) {
        farRiver.appendChild(boat);
        boat.style.bottom ='50%';

        // Record boat crossed.
        moveInput();

        // Move SVG Character to farRiver.
        if (nearRiver.contains(goat)) {
            farRiver.appendChild(goat);
            goat.style.bottom = "50%";
        }
        if (nearRiver.contains(wolf)) {
            farRiver.appendChild(wolf);
            wolf.style.bottom = "50%";
        }
        if (nearRiver.contains(cabbage)) {
            farRiver.appendChild(cabbage);
            cabbage.style.bottom = "50%";
        }

        // Enable/Disable load buttons when boat is in farRiver.
        if (farRiver.contains(boat) == true &&
            farRiver.contains(goat) == false && 
            farRiver.contains(wolf) == false &&
            farRiver.contains(cabbage) == false) {

            // Enable SVG character buttons if they are in topLand.
            if (topLand.contains(goat)) {
                loadGoat.disabled = false;
            }
            if (topLand.contains(cabbage)) {
                loadCab.disabled = false;
            }
            if (topLand.contains(wolf)) {
                loadWolf.disabled = false;
            }

            // Disable SVG character buttons if they are not in topland.
            if (lowLand.contains(goat)) {
                loadGoat.disabled = true;
            }
            if (lowLand.contains(cabbage)) {
                loadCab.disabled = true;
            }                    
            if (lowLand.contains(wolf)) {
                loadWolf.disabled = true;                        
            }
        }
    }

    // Move the boat from farRiver to nearRiver.
    else if (boat.style.bottom == '50%') {
        nearRiver.appendChild(boat);
        boat.style.bottom = '0%';

        // Record boat crossed.
        moveInput();

        // Move SVG Character to nearRiver.
        if (farRiver.contains(goat)) {
            nearRiver.appendChild(goat);
            goat.style.bottom = "10%";
        }
        if (farRiver.contains(wolf)) {
            nearRiver.appendChild(wolf);
            wolf.style.bottom = "10%";
        }
        if (farRiver.contains(cabbage)) {
            nearRiver.appendChild(cabbage);
            cabbage.style.bottom = "10%";
        }

        // Enable/Disable load buttons when boat is in nearRiver.
        if (nearRiver.contains(boat) == true &&
            nearRiver.contains(goat) == false && 
            nearRiver.contains(wolf) == false &&
            nearRiver.contains(cabbage) == false) {

            // Enable SVG character buttons if they are in lowLand.
            if (lowLand.contains(goat)) {
                loadGoat.disabled = false;
            }
            if (lowLand.contains(cabbage)) {
                loadCab.disabled = false;
            }
            if (lowLand.contains(wolf)) {
                loadWolf.disabled = false;
            }

            // Disable SVG character buttons if they are not in lowland.
            if (topLand.contains(goat)) {
                loadGoat.disabled = true;
            }
            if (topLand.contains(cabbage)) {
                loadCab.disabled = true;
            }                    
            if (topLand.contains(wolf)) {
                loadWolf.disabled = true;
            }
        }
    }
}

function goatOnBoat() {
    // Append SVG character to nearRiver if they are on lowLand.
    if (nearRiver.contains(boat) && lowLand.contains(goat)) { 
        nearRiver.appendChild(goat);
        goat.style.left = "50%";
        goat.style.bottom = "10%";

        // Disable necessary load buttons.
        loadGoat.disabled = true;
        loadWolf.disabled = true;
        loadCab.disabled = true;               
        
        // Enable unload button
        unload.disabled = false;

        // Record SVG character loaded.
        loadInput(goat.id);
    }
    // Append SVG character to farRiver if they are on topLand.
    else if (farRiver.contains(boat) && topLand.contains(goat)) {
        farRiver.appendChild(goat);
        goat.style.left = "50%";
        goat.style.bottom = "50%";
        loadGoat.disabled = true;
        loadWolf.disabled = true;
        loadCab.disabled = true;
        unload.disabled = false;
        loadInput(goat.id);
    }
}

function wolfOnBoat() {
    // Append SVG character to nearRiver if they are on lowLand.
    if (nearRiver.contains(boat) && lowLand.contains(wolf)) { 
        nearRiver.appendChild(wolf);
        wolf.style.bottom = "10%";
        loadWolf.disabled = true;
        loadGoat.disabled = true;
        loadCab.disabled = true;
        unload.disabled = false;
        loadInput(wolf.id);
    }
    // Append SVG character to farRiver if they are on topLand.
    else if (farRiver.contains(boat) && topLand.contains(wolf)) {
        farRiver.appendChild(wolf);
        wolf.style.bottom = "50%";
        loadWolf.disabled = true;
        loadGoat.disabled = true;
        loadCab.disabled = true;
        unload.disabled = false;
        loadInput(wolf.id);
    }
}

function cabbageOnBoat() {
    // Append SVG character to nearRiver if they are on lowLand.
    if (nearRiver.contains(boat) && lowLand.contains(cabbage)) { 
        nearRiver.appendChild(cabbage);
        cabbage.style.left = "50%";
        cabbage.style.bottom = "10%";
        loadWolf.disabled = true;
        loadGoat.disabled = true;
        loadCab.disabled = true;
        unload.disabled = false;
        loadInput(cabbage.id);
    }
    // Append SVG character to farRiver if they are on topLand.
    else if (farRiver.contains(boat) && topLand.contains(cabbage)) {
        farRiver.appendChild(cabbage);
        cabbage.style.left = "50%";
        cabbage.style.bottom = "50%";
        loadCab.disabled = true;
        loadWolf.disabled = true;
        loadGoat.disabled = true;
        unload.disabled = false;
        loadInput(cabbage.id);
    }           
}

// Unloading a character
function OffBoat() {
    // Unload SVG character to lowLand if they are on nearRiver.
    if (nearRiver.contains(boat)) {
        if (nearRiver.contains(goat)) {
            lowLand.appendChild(goat);
            goat.style.left = "40%";
            goat.style.bottom = "30%";

            // Enable the LoadGoat button
            loadGoat.disabled = false;

            // Enable buttons for other svg characters
            if (lowLand.contains(wolf)) {
                loadWolf.disabled = false;
            }
            if (lowLand.contains(cabbage)) {
                loadCab.disabled = false;
            }

            // Disable the unload button
            unload.disabled = true;

            // Record SVG character unloaded
            unloadInput();
        }
        else if (nearRiver.contains(wolf)) {
            lowLand.appendChild(wolf);
            wolf.style.left = "50%";
            wolf.style.bottom = "30%";
            loadWolf.disabled = false;
            if (lowLand.contains(cabbage)) {
                loadCab.disabled = false;
            }
            if (lowLand.contains(goat)) {
                loadGoat.disabled = false;
            }
            unload.disabled = true;
            unloadInput();
        }   
        else if (nearRiver.contains(cabbage)) {
            lowLand.appendChild(cabbage);
            cabbage.style.left = "60%";
            cabbage.style.bottom = "30%";
            loadCab.disabled = false;
            if (lowLand.contains(goat)) {
                loadGoat.disabled = false;
            }
            if (lowLand.contains(wolf)) {
                loadWolf.disabled = false;
            }
            unload.disabled = true;
            unloadInput();
        }
    }
    
    // Unload SVG character to topLand if they are on farRiver.
    if (farRiver.contains(boat)) {
        if (farRiver.contains(goat)) {
            topLand.appendChild(goat);
            goat.style.left = "40%";
            goat.style.bottom = "30%";
            loadGoat.disabled = false;
            if (topLand.contains(cabbage)) {
                loadCab.disabled = false;
            }
            if (topLand.contains(wolf)) {
                loadWolf.disabled = false;
            }
            unload.disabled = true;
            unloadInput();
        }
        else if (farRiver.contains(wolf)) {
            topLand.appendChild(wolf);
            wolf.style.left = "50%";
            wolf.style.bottom = "30%";
            loadWolf.disabled = false;
            if (topLand.contains(goat)) {
                loadGoat.disabled = false;
            }
            if (topLand.contains(cabbage)) {
                loadCab.disabled = false;
            }
            unload.disabled = true;
            unloadInput();
        }
        else if (farRiver.contains(cabbage)) {
            topLand.appendChild(cabbage);
            cabbage.style.left = "60%";
            cabbage.style.bottom = "30%";
            loadCab.disabled = false;
            if (topLand.contains(wolf)) {
                loadWolf.disabled = false;
            }
            if (topLand.contains(goat)) {
                loadGoat.disabled = false;
            }
            unload.disabled = true;
            unloadInput();
        }
    }
}

// General Page set-up -----------------------------------------------
// Do function calls when page is loaded to set the page.
async function pageLoad() {
    setTitle();
    setPage();
    getNewGame();
    setDefaultPositions();
}

// Set the title of the page
async function setTitle() {
    document.getElementById("heading").innerHTML = "Welcome to " + gameTitle;
}

// Page setup information
async function setPage() {   
    // Display Scenario information and How to play
    document.getElementById("scenario").innerHTML = scenarioInfo;
    document.getElementById("instructions").innerHTML = howToPlay;
}

// Displays end result
async function loseScreen() {
    var header = document.getElementById("heading");
    header.innerHTML = "You Lose, thanks for playing";
}
async function winScreen() {
    var header = document.getElementById("heading");
    header.innerHTML = "You Win, thanks for playing";
}
async function timeUpScreen() {
    var header = document.getElementById("heading");
    header.innerHTML = "Time has run out, thanks for playing";
}

async function setDefaultPositions() {
    // Set each SVG character to their default environment area.
    nearRiver.appendChild(boat);
    lowLand.appendChild(goat);
    lowLand.appendChild(wolf);
    lowLand.appendChild(cabbage);
    
    // Set positions for each SVG character.
    boat.style.left = "50%";
    boat.style.bottom = "-20%";
    goat.style.left = "40%";
    goat.style.bottom = "30%";
    wolf.style.left = "50%";
    wolf.style.bottom = "30%";
    cabbage.style.left = "60%";
    cabbage.style.bottom = "30%";

    // Disable unload button
    unload.disabled = true;
}
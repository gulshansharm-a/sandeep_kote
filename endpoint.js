// Import necessary modules
const admin = require('firebase-admin');
const cron = require('node-cron');

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./sandeepkote-c67f5-firebase-adminsdk-qhggd-e95af41597.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sandeepkote-c67f5-default-rtdb.firebaseio.com"
});

// Initialize the Firebase Realtime Database
const db = admin.database();

// Initialize the current player's UID (Replace 'your_current_player_uid' with the actual UID)
let currentPlayerUid = 'O4gTr8sGvcYHrDPqISI77lM8m692';

// Reference to the 'timer/time' node in the database
const ref = db.ref('timer/time');

// Reference to the 'standing' node in the database
const standingRef = db.ref('standing');

// Reference to the 'earning' node in the database
const earningRef = db.ref('earning');

// Initialize the standing amount variable
let standingAmount = 0;

// Define the current player's UID (Replace 'your_current_player_uid' with the actual UID)
// let currentPlayerUid = 'vSXE1afmwoQMMIcPIjOkxg1kLdv2';

// Define the 'result' variable to store the game result
let result;

// Define a reference to the 'last10data' node in the database
const last10dataRef = db.ref('last10data');

// Define a reference to the 'result' node in the database
const totalRef = db.ref('result');

// Initialize the earning amount variable
let earningAmount = 0;

// Function to store the game result and delete the 'bet' collection
function storeResultAndDeleteBetCollection() {
  // Retrieve the current 'last10data' values from the database
  last10dataRef.once('value', (snapshot) => {
    // Get the 'last10data' array or initialize it as an empty array if it doesn't exist
    let last10data = snapshot.val() || [];

    // Add the new game result to the front of the 'last10data' array
    last10data.unshift(result);

    // If 'last10data' has more than 10 elements, remove the last one
    if (last10data.length > 10) {
      last10data.pop();
    }

    // Set the 'result' in the 'result' node in the database
    totalRef.set(result, (error) => {
      if (error) {
        console.error('Error storing total value:', error);
      } else {
        console.log('Total value stored successfully!');
        deleteBetCollection();
      }
    });

    // Schedule the update of 'last10data' using a setTimeout function
    setTimeout(() => {
      // Update 'last10data' in the Firebase database
      last10dataRef.set(last10data, (error) => {
        if (error) {
          console.error('Error updating last10data:', error);
        } else {
          console.log('last10data updated successfully!');
          console.log("ty");
          // console.log(playerUid);
          const betRef = db.ref('bet');

          // Reference to the 'earningPercentage' node in the database
          const earningPercentageRef = db.ref('earningPercentage');
        
          // Initialize the earning percentage variable
          let earningPercentage = 0;
          console.log("sd");

          // Retrieve the 'bet' data from the database
          // Reference to the 'bet' node in the database


// Reference to the 'bet' node in the database


betRef.once('value', (snapshot) => {
  snapshot.forEach((childSnapshot) => {
    const key = childSnapshot.key; // Get the random string as the key
    const betData = childSnapshot.val();
    if (betData) {
      const chapa = betData.chapa;
      const kata = betData.kata;

      // Now you have access to 'chapa' and 'kata' for each bet entry with a random string key
      console.log("Key (Random String):", key);
      console.log("Chapa:", chapa);
      console.log("Kata:", kata);

      // Call your function to update endpoints here with the necessary data
      // updateEndpointsForUser(chapa, kata, earningAmount);
    }
  });
});


         
          // Additional functionality to update endpoints for Agent and Distributor
          
        }
      });
    }, 10000); // Delay the update for 10 seconds (adjust as needed)
  });
}

// Schedule the field update using a cron job (runs every minute)
// ...

// Schedule the field update using a cron job (runs every minute)
cron.schedule('*/1 * * * *', () => {
  try {
    // Get the current time in milliseconds
    const currentTime = Date.now();

    // Update the 'timer/time' field in the database with the current time
    ref.set(currentTime, (error) => {
      if (error) {
        console.error('Error updating field:', error);
      } else {
        console.log('Field updated successfully!');

        const betRef = db.ref('bet');

        // Reference to the 'earningPercentage' node in the database
        const earningPercentageRef = db.ref('earningPercentage');
    
        // Initialize the earning percentage variable
        let earningPercentage = 0;
    
        // Retrieve the 'bet' data from the database
       


      }
    });

    // Reference to the 'bet' node in the database
    const betRef = db.ref('bet');

    // Reference to the 'earningPercentage' node in the database
    const earningPercentageRef = db.ref('earningPercentage');

    // Initialize the earning percentage variable
    let earningPercentage = 0;

    // Retrieve the 'bet' data from the database
    betRef.once('value', (snapshot) => {
      // Initialize total points for 'chapa' and 'kata'
      let totalChapa = 0;
      let totalKata = 0;

      // Iterate through each 'bet' entry
      snapshot.forEach((childSnapshot) => {
        // Get the data for a specific bet
        const childData = childSnapshot.val();

        // Update the total points for 'chapa' and 'kata'
        totalChapa += parseInt(childData.chapa);
        totalKata += parseInt(childData.kata);

        // Get the player UID from the bet data
        const playerUid = childData.betUid;
       console.log(playerUid);
        // Calculate the player's total points (sum of chapa and kata)
        const playerPoint = parseInt(childData.chapa) + parseInt(childData.kata);

        // Update the player's point in the 'Player' node
        updatePlayerPoint(playerUid, playerPoint);

      
      });

      // Get the standing amount from the 'standing' node
      standingRef.once('value', (snapshot) => {
        // Update the 'standingAmount' variable with the standing value from the database
        standingAmount = parseInt(snapshot.val());

        // Get the earning percentage from the 'earningPercentage' node
        earningPercentageRef.once('value', (snapshot) => {
          // Update the 'earningPercentage' variable with the percentage value from the database
          earningPercentage = parseFloat(snapshot.val()) / 100.0;

          // Calculate the game result based on 'chapa' and 'kata' points
          let minOfThem = Math.min(totalChapa, totalKata);
        let totalOfBoth = totalChapa + totalKata;
        let maxOfBoth = Math.max(totalChapa, totalKata);
        let earning = 0;
        console.log("total chapa: " + totalChapa + "  " + totalKata);
        if (totalChapa == totalKata) {
          console.log("commission time");
          const randomCharacter = Math.random() < 0.5 ? "c" : "k";
          if(randomCharacter == "c") {
            earning = totalChapa * earningPercentage;
            result = "commissionc";
          } else if(randomCharacter == "k") { 
            earning = totalKata * earningPercentage;
            result = "commissionk";
          }

        } else {
          console.log("other time");
          // for the case of standingAmount = 0 or less than max*2
          if (standingAmount === 0 || standingAmount <= maxOfBoth) {
            standingAmount = standingAmount + totalOfBoth - minOfThem * 2 - earning;
            setStanding(standingAmount);
            if (totalChapa > totalKata) {
              result = "kata";
            } else {
              result = "chapa";
            }
          }

          else if (standingAmount >= maxOfBoth * 3) {
            standingAmount = standingAmount + totalOfBoth - (maxOfBoth * 4) - earning;
            setStanding(standingAmount);
            if (totalChapa > totalKata) {
              result = "chapaj";
            } else {
              result = "kataj";
            }
          }

          else if (standingAmount >= maxOfBoth) {
            standingAmount = standingAmount + totalOfBoth - (maxOfBoth * 2) - earning;
            setStanding(standingAmount);
            if (totalChapa > totalKata) {
              result = "chapa";
            } else {
              result = "kata";
            }
          }
        }

          // Calculate the earning amount
          earningAmount = (totalChapa + totalKata) * earningPercentage;
          betRef.once('value', (snapshot) => {
            const betData = snapshot.val();
            if (betData) {
              const betUids = Object.keys(betData); // Get all child keys under 'bet'
              
              if (betUids.length > 0) {
                // Access the first child key
                const firstBetUid = betUids[0];
                
                // Now you can access the first and only key without its nested data
                updatePlayerData(result, totalChapa, totalKata, firstBetUid);
              }
            }
          });
          

         

          // Store the result and delete the 'bet' collection
          storeResultAndDeleteBetCollection();
        });
      });
    });
  } catch (error) {
    console.error('Error in the cron job:', error);
  }
});

// ...


// Function to update a player's point in the 'Player' node
// Function to update a player's point in the 'Player' node
function updatePlayerPoint(playerUid, amount) {
  if (!playerUid) {
    console.error('playerUid is undefined');
    return;
  }

  const playerRef = db.ref('Player').child(playerUid);

  playerRef.update({
    playerpoint: amount,
  }, (error) => {
    if (error) {
      console.error('Error updating playerpoint:', error);
    } else {
      console.log('Playerpoint updated successfully!');
    }
  });
}


function updatePlayerData(result, totalChapa, totalKata, firstBetUid) {
  console.log("it is working");
  const playerRef = db.ref('Player');
  const agentRef = db.ref('Agent');
  const distRef = db.ref('Distributor');

  playerRef.once('value', (snapshot) => {
    const playerData = snapshot.val();

    if (playerData) {
      Object.keys(playerData).forEach((playerUid) => {
        const player = playerData[playerUid];
        const playerpoint = player.playerpoint || 0;
        const endpoint = player.endpoint || 0;
        const win = player.win || 0;
        const agentid = player.agentID;
        const distid = player.distributorID;
        let updatedWin = win;
        let updatedEndpoint = endpoint;
       console.log(firstBetUid);
       console.log(playerUid);
        if (playerUid === firstBetUid) {
          if (result === 'chapa') {
            updatedWin = totalChapa * 2;
          } 
          else if (result === 'chapaj') {
            updatedWin = totalChapa * 4;
          } 
          
          else if (result === 'kata') {
            updatedWin = totalKata * 2;
          }

          else if (result === 'kataj') {
            updatedWin = totalKata * 4;
          }
          updatedEndpoint = -updatedWin + playerpoint;
        

        console.log(result);
        console.log(playerUid);
        console.log(updatedWin);

        // Update Player data
        playerRef.child(firstBetUid).update({
          win: updatedWin,
          endpoint: updatedEndpoint,
        });
        totalChapa=0;
        totalKata=0;
        // Update Distributor data
        if (distid) {
          distRef.once('value', (snapshot) => {
            const distributor = snapshot.child(distid).val();
            if (distributor) {
              const distributorEndpoint = distributor.endpoint || 0;
              distRef.child(distid).update({
                endpoint: distributorEndpoint + updatedEndpoint,
              });
            }
          });
        }

        // Update Agent data
        if (agentid) {
          agentRef.once('value', (snapshot) => {
            const agent = snapshot.child(agentid).val();
            if (agent) {
              const agentEndpoint = agent.endpoint || 0;
              agentRef.child(agentid).update({
                endpoint: agentEndpoint + updatedEndpoint,
              });
            }
          });
        }
        }
      });
    }
  });
}






// Function to set the standing amount in the 'standing' node
function setStanding(amount) {
  standingRef.set(amount, (error) => {
    if (error) {
      console.error('Error storing standing amount:', error);
    } else {
      console.log('Standing amount stored successfully!');
      console.log("hi");
      storeResultAndDeleteBetCollection();
    }
  });
}

// Function to delete the 'bet' collection
function deleteBetCollection() {
  const betRef = db.ref('bet');
  betRef.remove((error) => {
    if (error) {
      console.error('Error deleting bet collection:', error);
    } else {
      console.log('Bet collection deleted successfully!');
      console.log("hi");
    }
  });
}

// Don't forget to add necessary error handling and adapt this code to your specific Firebase Realtime Database structure.


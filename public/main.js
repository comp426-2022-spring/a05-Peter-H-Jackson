/* --------- FOR THE /app/flip/ API --------- */
// Get button for coin flip and add an event listener to it on click
const coin = document.getElementById("coin")
coin.addEventListener("click", flipCoin)

// Await response with async function
async function flipCoin() {
    // Build up URL and then wait for it to be called in the browser
    const endoint = "app/flip/"
    const url = document.baseURI + endoint
    await fetch(url)
    .then(function(response) { return response.json() })
    .then(function(result) { 
        console.log(result)
        // Set the result of the coin flip
        document.getElementById("result").innerHTML = result.flip;
        // Use the result to find and set the appropiate coin image
        document.getElementById("quarter").setAttribute("src", "assets/img/" + result.flip + ".png")
    })
}


/* --------- coinList() IMAGE GENERATOR --------- */
function coinList(array) {
    let text = "";
    let arrayLength = array.length
    for (let i = 0; i < arrayLength; i++) {
      text += '<li><img src="assets/img/'+array[i]+'.png" class="bigcoin"></li>';
    }
    return text
  }


/* --------- sendFlips() DATA SENDER --------- */
async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);
    console.log(formDataJson);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };
    const response = await fetch(url, options);
    return response.json()
}


/* --------- FOR THE /app/flip/coins API --------- */
// Get button for coin flips and add an event listener to it on click
const coins = document.getElementById("coins")
coins.addEventListener("submit", flipCoins)

// Await response with async function
async function flipCoins(event) {
    // Prevent a reload of the page
    event.preventDefault()
    // Build up URL and then wait for it to be called in the browser
    const endpoint = "app/flip/coins/"
	const url = document.baseURI + endpoint
    // Get the data object and give it to FormData
    const formEvent = event.currentTarget
    try {
        const formData = new FormData(formEvent)
        const flips = await sendFlips({url, formData})
        console.log(flips)
        // Set the result of the coin flip - heads count
        document.getElementById("heads").innerHTML = "Heads: " + flips.summary.heads;
		// Set the result of the coin flip - tails count
        document.getElementById("tails").innerHTML = "Tails: " + flips.summary.tails;
        // Set the list of coins
        document.getElementById("coinlist").innerHTML = coinList(flips.raw);
    } catch (e) {
        console.log(e)
    }   
}


/* --------- FOR THE /app/flip/call API --------- */
// Get button for call and add an event listener to it on click
const call = document.getElementById("call")
call.addEventListener("submit", flipCall)

// Await response with async function
async function flipCall(event) {
    // Prevent a reload of the page
    event.preventDefault()
    // Build up URL and then wait for it to be called in the browser
    const endpoint = "app/flip/call/"
	const url = document.baseURI + endpoint
    // Get the data object and give it to FormData
    const formEvent = event.currentTarget
    try {
        const formData = new FormData(formEvent)
        const results = await sendFlips({url, formData})
        console.log(results)
        // Set the call
        document.getElementById("choice").innerHTML = "Guess: " + results.call;
		// Set the result of the actual flip result
        document.getElementById("actual").innerHTML = "Actual: " + results.flip;
		// Set the result of the call
        document.getElementById("results").innerHTML = "Result: " + results.result;
        document.getElementById("coingame").innerHTML = '<li><img src="assets/img/'+results.call+'.png" class="bigcoin" id="callcoin"></li><li><img src="assets/img/'+results.flip+'.png" class="bigcoin"></li><li><img src="assets/img/'+results.result+'.png" class="bigcoin"></li>';
    } catch (e) {
        console.log(e)
    }  
}


/* NAVIGATION BUTTON SETTINGS */
function homeNav() {
    document.getElementById("homenav").className = "active";
    document.getElementById("home").className = "active";
    document.getElementById("singlenav").className = "";
    document.getElementById("single").className = "inactive";
    document.getElementById("multinav").className = "";
    document.getElementById("multi").className = "inactive";
    document.getElementById("guessnav").className = "";
    document.getElementById("guesscoin").className = "inactive";
  }
  function singleNav() {
    document.getElementById("homenav").className = "";
    document.getElementById("home").className = "inactive";
    document.getElementById("singlenav").className = "active";
    document.getElementById("single").className = "active";
    document.getElementById("multinav").className = "";
    document.getElementById("multi").className = "inactive";
    document.getElementById("guessnav").className = "";
    document.getElementById("guesscoin").className = "inactive";
  }
  function multiNav() {
    document.getElementById("homenav").className = "";
    document.getElementById("home").className = "inactive";
    document.getElementById("singlenav").className = "";
    document.getElementById("single").className = "inactive";
    document.getElementById("multinav").className = "active";
    document.getElementById("multi").className = "active";
    document.getElementById("guessnav").className = "";
    document.getElementById("guesscoin").className = "inactive";
  }
  function guessNav() {
    document.getElementById("homenav").className = "";
    document.getElementById("home").className = "inactive";
    document.getElementById("singlenav").className = "";
    document.getElementById("single").className = "inactive";
    document.getElementById("multinav").className = "";
    document.getElementById("multi").className = "inactive";
    document.getElementById("guessnav").className = "active";
    document.getElementById("guesscoin").className = "active";
  } 
GetData();

document.getElementById("button").addEventListener("click", searchFunction);
document.getElementById("sort-price").addEventListener("click", function () {
	sort("price")
});
document.getElementById("sort-date").addEventListener("click", function () {
	sort("date")
});

async function GetData() {
	let auktion = await fetchData('https://nackowskis.azurewebsites.net/api/Auktion/600/');

	let firstAuction = document.getElementById("titel");

	auktion.forEach(currentObject => {
		let auktionDiv = document.createElement("div");
		auktionDiv.classList.add("auktion-div");

		let auktionH1 = document.createElement("h2");
		let textH1 = document.createTextNode(currentObject.Titel);
		auktionH1.appendChild(textH1);
		auktionDiv.appendChild(auktionH1);

		let auktionH3 = document.createElement("h3");
		let textH3 = document.createTextNode(currentObject.Beskrivning);
		auktionH3.appendChild(textH3);
		auktionDiv.appendChild(auktionH3);

		let auktionSlut = document.createElement("p");
		let auktionStart = document.createElement("p");
		let textStart = document.createTextNode("Start datum: " + currentObject.StartDatum.replace('T', ' '));
		let textSlut = document.createTextNode("Slut datum: " + currentObject.SlutDatum.replace('T', ' '));
		auktionStart.appendChild(textStart);
		auktionSlut.appendChild(textSlut);
		auktionDiv.appendChild(auktionStart);
		auktionDiv.appendChild(auktionSlut);

		let auktionPrice = document.createElement("p");
		let textPrice = document.createTextNode("Utropspris: " + currentObject.Utropspris);
		auktionPrice.appendChild(textPrice);
		auktionDiv.appendChild(auktionPrice);

		var today = new Date();
		var auctionEndDate = new Date(currentObject.SlutDatum);

		let auktionInput = document.createElement("input");
		auktionInput.type = "text";
		auktionInput.classList.add("bid-container");
		auktionInput.classList.add("input-container");

		let auktionBtn = document.createElement("button");
		auktionBtn.innerHTML = "Lägg bud";
		auktionBtn.classList.add("bid-container");
		auktionBtn.classList.add("bid-button");
		firstAuction.appendChild(auktionDiv);

		auktionBtn.addEventListener("click", async function () {
			let checkBids = "https://nackowskis.azurewebsites.net/api/bud/600/" + currentObject.AuktionID;
			let checkCurrentBids = await apiCall(checkBids);
			let bidValue = auktionInput.value;

			let errorBid = document.createElement("div");
			let highestBid = checkCurrentBids.reduce((a, b) => a.Summa > b.Summa ? a : b);

			if (bidValue > highestBid.Summa) {
				addBids(currentObject.AuktionID, bidValue);
			} else {
				let toLowBid = document.createElement("h3");
				let toLowBidText = document.createTextNode("Lägg ett högre bud, nuvarande bud är : " + highestBid.Summa);
				toLowBid.appendChild(toLowBidText);
				auktionDiv.appendChild(toLowBid);
			}
		})


		if (auctionEndDate > today) {
			auktionDiv.appendChild(auktionInput);
			auktionDiv.appendChild(auktionBtn);
		} else {
			let auktionText = document.createElement("p");
			let textBud = document.createTextNode("Auktion över!");
			auktionText.classList.add("bid-over");
			auktionText.appendChild(textBud);
			auktionDiv.appendChild(auktionText);
		}

		let auktionBtnShowBids = document.createElement("input");
		auktionBtnShowBids.type = "submit";
		auktionBtnShowBids.value = "Visa bud";
		auktionBtnShowBids.classList.add("bid-container");
		auktionBtnShowBids.classList.add("bid-button");

		auktionBtnShowBids.onclick = function () {

			auktionBtnShowBids.style.visibility = "hidden";
		}
		auktionBtnShowBids.addEventListener("click", async function () {


			var currentBidSearch = 'https://nackowskis.azurewebsites.net/api/Bud/600/' + currentObject.AuktionID + "/";
			var currentBidSearchResult = await apiCall(currentBidSearch);
			currentBidSearchResult.sort((a, b) => a.Summa < b.Summa);

			// auktionDiv.innerHTML = "";
			// auktionDiv.appendChild(auktionH1);

			if (auctionEndDate > today) {
				auktionDiv.appendChild(auktionInput);
				auktionDiv.appendChild(auktionBtn);

			} else {
				var bidWin = document.createElement("h3");
				var bidTextWin = document.createTextNode("Vinnande bud: " + currentBidSearchResult[0].Summa);
				bidWin.appendChild(bidTextWin);
				auktionDiv.appendChild(bidWin);
			}

			auktionDiv.appendChild(auktionBtnShowBids);

			currentBidSearchResult.forEach(currentBid => {
				var bidDiv = document.createElement("div");
				bidDiv.classList.add("showBid");

				var bidP = document.createElement("p");
				var bidTextP = document.createTextNode("Bud: " + currentBid.Summa + " kr");
				bidP.appendChild(bidTextP);

				bidDiv.appendChild(bidP);
				auktionDiv.appendChild(bidDiv);


			})

			var bidhide = document.createElement("button");
			bidhide.innerHTML = "Dölj bud";
			bidhide.classList.add("bid-button");
			auktionDiv.appendChild(bidhide);


			bidhide.onclick = function () {

				var bids = document.getElementsByClassName("showBid");

				for (i = 0; i < bids.length; i++) {

					bids[i].style.display = 'none';
					bidhide.style.display = 'none';
					auktionBtnShowBids.style.visibility = 'visible';


				}
			}
		})

		auktionDiv.appendChild(auktionBtnShowBids);

	})

}


async function fetchData(url) {
	let promise = await fetch(url);
	let data = await promise.json();
	return data;
}

async function apiCall(stringUrl) {
	let auctionBid = await fetchData(stringUrl);
	return auctionBid;
}

function deleteData() {
	fetch("https://nackowskis.azurewebsites.net/api/auktion/600/459", {
		method: 'DELETE',
		body: JSON.stringify({
			"AuktionID": 459,
			"Gruppkod": 600,
		}),
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	}).then(function (data) {
		console.log('Request success: ', 'posten skapad');
	})
}
/*deleteData();*/

// Lägg till bud funktionen

function addBids(auctionId, bidValue) {
	fetch("https://nackowskis.azurewebsites.net/api/bud/600/", {
		method: 'post',
		body: JSON.stringify({
			"AuktionID": auctionId,
			"Summa": bidValue,
		}),
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	}).then(function (data) {
		console.log('Request success: ', 'posten skapad');
	})
}

// SÖK funktionen
function searchFunction() {

	var input = document.getElementById("Search");
	var filter = input.value.toLowerCase();
	var nodes = document.getElementsByClassName('auktion-div');
	for (i = 0; i < nodes.length; i++) {
		if (nodes[i].textContent.toLowerCase().includes(filter)) {
			nodes[i].style.display = 'block';
		} else {
			nodes[i].style.display = 'none';
		}
	}
}

// Funktionen som jämför priserna med varandra
function comparePrice(a, b) {

	var valueA = Number(a.querySelectorAll('p')[2].innerHTML.replace("Utropspris: ", ""));
	var valueB = Number(b.querySelectorAll('p')[2].innerHTML.replace("Utropspris: ", ""));;

	if (valueA < valueB) {
		return -1;
	}
	if (valueA > valueB) {
		return 1;
	}
	return 0;
}

// Funktionen som jämför datumen med varandra
function compareDate(a, b) {

	var valueA = new Date(a.querySelectorAll('p')[0].innerHTML.replace("Start datum: ", ""));
	var valueB = new Date(b.querySelectorAll('p')[0].innerHTML.replace("Start datum: ", ""));

	if (valueA < valueB) {
		return -1;
	}
	if (valueA > valueB) {
		return 1;
	}
	return 0;
}

// Funktionen som kallar på compareDate() eller comparePrice() beroende på vilken knapp du trycker
function sort(orderBy) {
	// Omvandlar items till en array 
	const items = Array.prototype.slice.call(document.querySelectorAll('.auktion-div'));
	// Tömmer hela listan för att kunna displaya det användaren sökt
	document.querySelector('#titel').innerHTML = '';

	// Om användaren klickar på Pris knappen så kallar sort funktionen på comparePrice()
	if (orderBy === 'price') {
		items.sort(comparePrice);
	}
	// Om användaren klickar på Datum knappen så kallar sort funktionen på compareDate()
	else if (orderBy === 'date') {
		items.sort(compareDate);
	}

	//Displayar så användaren kan se resultatet på sökningen 
	for (const item of items) {
		document.querySelector('#titel').appendChild(item);
	}
}

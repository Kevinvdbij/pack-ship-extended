/* eslint-disable no-inline-comments */

import { GM_addStyle, GM_addValueChangeListener, GM_getValue, GM_setValue } from "$";


// ---- Types ----

interface SettingsData {
	enabled: boolean;
	proceed: boolean;
	addButtons: boolean;
}

interface WaitForKeyElements {
	(
		selectorTxt: string,
		actionFunction: (elements: JQuery<HTMLElement>) => boolean | void,
		bWaitOnce?: boolean,
		iframeSelector?: string,
	): void;
	controlObj?: Record<string, ReturnType<typeof setInterval>>;
}

interface ReservationItem {
	reservationNumber: string;
	type: "singleLine" | "multiLine";
	ref: Element;
	status?: number;
}

interface VerificationReservationRow {
	rowId: string;
	listElement: Element;
}

interface ShopwareToken {
	token_type: string;
	expires_in: number;
	access_token: string;
	refresh_token: string;
}

interface ShopwareVersionResponse {
	version: string;
}

interface ShopwareApiError {
	status: number | string;
	code: number;
}

interface ShopwareErrorBody {
	errors: ShopwareApiError[];
}

interface ShopwareOrderEntry {
	id: string;
	customerComment: string | null;
}

interface ShopwareSearchResponse {
	data: ShopwareOrderEntry[];
}

interface SearchResponseState {
	isAlert: boolean;
	isUnfinished: boolean;
	isProductSelection: Element | null;
}

interface ReservationDetails {
	id: string;
	number: string;
}

interface LoginCredentials {
	username: string;
	password: string;
}

// ---- Settings ----

class Settings {
	#isEnabled: boolean = false;
	#isProceeding: boolean = false;
	#enableAddButtons: boolean = false;

	constructor() {
		this.load();
	}

	get enabled(): boolean {
		return this.#isEnabled;
	}

	set enabled(val: boolean) {
		this.#isEnabled = val;
		this.save();
		location.reload();
	}

	get proceed(): boolean {
		return this.#isProceeding;
	}

	set proceed(val: boolean) {
		this.#isProceeding = val;
		this.save();
	}

	get enableAddButtons(): boolean {
		return this.#enableAddButtons;
	}

	set enableAddButtons(val: boolean) {
		this.#enableAddButtons = val;
		this.save();
	}

	save(): void {
		const saveData: SettingsData = {
			enabled: this.#isEnabled,
			proceed: this.#isProceeding,
			addButtons: this.#enableAddButtons,
		};

		GM_setValue("NKHR_Settings", JSON.stringify(saveData));

		console.log(saveData);
	}

	load(): void {
		const defaultSettings: SettingsData = {
			enabled: true,
			proceed: true,
			addButtons: false,
		};

		const loadData: SettingsData = JSON.parse(
			GM_getValue("NKHR_Settings", JSON.stringify(defaultSettings)),
		);

		this.#isEnabled = loadData.enabled ?? defaultSettings.enabled;
		this.#isProceeding = loadData.proceed ?? defaultSettings.proceed;
		this.#enableAddButtons = loadData.addButtons ?? defaultSettings.addButtons;

		console.log(loadData);
	}
}


/* --- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
const waitForKeyElements: WaitForKeyElements = function(
	selectorTxt: string, /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
	actionFunction: (elements: JQuery<HTMLElement>) => boolean | void, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
	bWaitOnce?: boolean, /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
	iframeSelector?: string, /* Optional: If set, identifies the iframe to
                        search.
                    */
): void {
	let targetNodes: JQuery<HTMLElement>;
	let btargetsFound: boolean;

	if (typeof iframeSelector === "undefined") { targetNodes = $(selectorTxt); }
	else {
		targetNodes = $(iframeSelector).contents()
			.find(selectorTxt);
	}

	if (targetNodes && targetNodes.length > 0) {
		btargetsFound = true;
		/* --- Found target node(s).  Go through each and act if they
            are new.
        */
		targetNodes.each(function(this: HTMLElement) {
			const jThis = $(this);
			const alreadyFound = jThis.data("alreadyFound") || false;

			if (!alreadyFound) {
				// --- Call the payload function.
				const cancelFound = actionFunction(jThis);
				if (cancelFound) { btargetsFound = false; }
				else { jThis.data("alreadyFound", true); }
			}
		});
	}
	else {
		btargetsFound = false;
	}

	// --- Get the timer-control variable for this selector.
	const controlObj = waitForKeyElements.controlObj ?? {};
	const controlKey = selectorTxt.replace(/[^\w]/g, "_");
	let timeControl = controlObj[controlKey];

	// --- Now set or clear the timer as appropriate.
	if (btargetsFound && bWaitOnce && timeControl) {
		// --- The only condition where we need to clear the timer.
		clearInterval(timeControl);
		delete controlObj[controlKey];
	}
	else {
		// --- Set a timer, if needed.
		if (!timeControl) {
			timeControl = setInterval(function() {
				waitForKeyElements(selectorTxt,
					actionFunction,
					bWaitOnce,
					iframeSelector,
				);
			},
			300,
			);
			controlObj[controlKey] = timeControl;
		}
	}
	waitForKeyElements.controlObj = controlObj;
};


/* globals jQuery, $ */

(function() {
	"use strict";

	const settings = new Settings();

	// Get the path for the current window location
	const path = window.location.pathname;

	// Define the url params
	const urlParams = new URLSearchParams(window.location.search);

	// Path to the shopware API url the integration will use
	const shopwareApiUrl = "https://www.kampeerhalroden.nl";

	// Set whether or not this is a testing environment from storage variable
	const testingEnivronment = JSON.parse(GM_getValue("testingEnvironment", "false")) as boolean;

	// Ensure localstorage does not get too large
	manageLocalStorage();

	// Modify the footer to display userscript information
	modifyFooter();

	if (settings.enabled) {
		// Switch based on the current page location with regular expression testing
		switch (true) {
		case /bztrs\/packingportal\/CompleteReservations.*/.test(path):
			onCompleteReservationStep();
			break;

		case /bztrs\/packingportal\/Parcels.*/.test(path):
			onShipReservationStep();
			break;

		case /bztrs\/packingportal\/Reservations\/Index\/.*/.test(path):
			onVerifyReservationStep();
			break;

		case /bztrs\/packingportal\/AddParcels\/Search\?ReservationNumber=/
			.test(window.location.pathname + window.location.search):
			if (document.querySelector("head > title")!.innerHTML
				=== "Home Page - NedFox.RetailVista.Packing.UI") {

				onSelectReservationStep();
				return;
			}

			onAddParcels();
			break;

		case /bztrs\/packingportal\/AnnounceParcels.*/.test(path):
			proceedStep("#ReservationContainer > div.container.my-2 > div:nth-child(4) > div > button");
			break;

		case /bztrs\/packingportal.*/.test(path):
			onSelectReservationStep();
			break;
		}
	}

	// Create the options panel for modifying userscript settings
	createOptionsPanel();

	// Step 1: called on the home page where the user has to select a reservation
	function onSelectReservationStep(): void {
		console.log("Entered reservation selection step");

		addLastReservationButtons();
		silentLoadOnSearch();

		waitForKeyElements("#Productbarcode", (elements) => {
			(elements[0] as HTMLInputElement).focus();
			(elements[0] as HTMLInputElement).value = "";
		});
	}

	// Step 2: called on the second page where the user has to verify the products in the reservation
	function onVerifyReservationStep(): void {
		console.log("Entered verify reservation step");
		cacheProductList();

		// Skips the second step and sets all products to collected, we do not need the 2nd step anymore because of the loaded product list in step 3
		completeVerificationStep();
	}

	// Step 3: called on the third page where the user has to create the shipping parcel
	function onShipReservationStep(): void {
		console.log("Entered ship reservation step");

		// Click button to third step to finalize order processing when it is enabled
		if (urlParams.has("autoComplete")) {
			if (urlParams.get("autoComplete") !== "false") {
				proceedStep("#ParcelsContainer > div > div:nth-child(4) > div > button:not(:disabled)");
			}
		}
		else {
			proceedStep("#ParcelsContainer > div > div:nth-child(4) > div > button:not(:disabled)");
		}

		// HACKY WORKAROUND to clear input after scan
		// document.querySelector("#verifyProduct").addEventListener("click", clearInput("#productBarcode"), false);

		addProductList("Nodige Producten");
		editReservationDetails();
		createCommentBox();
		clearAllParcelItems();
		saveLastOpenReservation();
		autoFillParcel();

		onScanProductForParcel();
	}

	// Step 4: called on the fourth page with the completion status of the reservation
	function onCompleteReservationStep(): void {
		console.log("Entered complete reservation step");

		// Save current reservation as last completed.
		saveLastCompletedReservation();

		const completionSuccess = document.querySelector<HTMLInputElement>("#Reservation_Status")!.value === "ClosedByInvoiceSale";

		// Update mass complete status
		updateMassComplete(completionSuccess);

		// Click button to complete the process and go back to first step once it appears
		if (completionSuccess) {
			proceedStep("#ReservationContainer > div:nth-child(11) > div > button");
		}
	}

	// Called when the add parcels page is opened
	function onAddParcels(): void {
		console.log("Entered add parcels screen");

		addProductList("Producten", true);
	}

	// Modify the footer to display version information about the userscript
	function modifyFooter(): void {
		setTimeout(() => {
			const footerVersionText = document.querySelector<HTMLElement>(
				"footer > div > div > div.col-auto.mr-auto.text-left > div",
			)!;
			footerVersionText.insertAdjacentHTML("beforeend", `
                <div class="col ml-2">
                    <span>Nedfox Auto KHR DEV</span>
                </div>`);

			footerVersionText.insertAdjacentHTML("beforeend", `
                <div class="col">
                    <button id="settingsButton" type="button" class="nav-link btn btn-link remove-padding">Instellingen</button>
                </div>`);

			const settingsButton = document.querySelector<HTMLButtonElement>("[id=settingsButton]")!;
			settingsButton.onclick = function() {
				setOptionsPanelVisibility();
				console.log("Settings button clicked");
			};
		}, 0);
	}

	// Order the retrieved list of open orders and select the first one
	function processOrderSelection(): void {
		// Wait for the modal to exist before we start processing
		waitForKeyElements("#productReservationsModal", (modal) => {
			const reservations: ReservationItem[] = [];

			const singleLineReservationsElement = modal[0].querySelector(".singleline-reservations");

			// Process all of the needed info for single line reservations
			if (singleLineReservationsElement) {
				for (const reservation of Array.from<Element>(singleLineReservationsElement.children)) {
					const matchEl = Array.from<Element>(reservation.querySelector(".col-4")!.children)
						.find(child => /Reservering:.*/.test((child as HTMLElement).innerText)) as HTMLElement;
					const reservationNumber = matchEl.innerText.split(": ").pop()!;

					reservations.push({
						reservationNumber,
						type: "singleLine",
						ref: reservation,
					});
				}
			}

			const validReservationsElement = modal[0].querySelector(".valid-reservations");

			// Process all of the needed info for multi line reservations
			if (validReservationsElement) {
				for (const reservation of Array.from<Element>(validReservationsElement.children)) {
					const matchEl = Array.from<Element>(reservation.querySelector(".col-4")!.children)
						.find(child => /Reservering:.*/.test((child as HTMLElement).innerText)) as HTMLElement;
					const reservationNumber = matchEl.innerText.split(": ").pop()!;

					reservations.push({
						reservationNumber,
						type: "multiLine",
						ref: reservation,
					});
				}
			}

			const singleLineReservations = reservations.filter((reservation) => reservation.type === "singleLine");

			const massCompleteThreshold = 3;
			const massCompleteMaximum = 50;

			// If the amount of single line orders is past the threshold, create the mass complete button
			if (singleLineReservations.length >= massCompleteThreshold) {
				const massCompleteButton = document.createElement("button");
				massCompleteButton.setAttribute("class", "btn btn-primary");
				massCompleteButton.setAttribute("style", "height:40px;");
				massCompleteButton.innerText = "Massa voltooien" + (singleLineReservations.length >= massCompleteMaximum ? ` (${massCompleteMaximum})` : "");

				massCompleteButton.onclick = function() {
					startMassComplete(singleLineReservations.slice(0, massCompleteMaximum));
					massCompleteButton.disabled = true;
				};

				modal[0].querySelector("div > div > div.modal-body > div > div > div:nth-child(3)")!.append(massCompleteButton);
			}

			// Open the first reservation in the array
			if (singleLineReservations.length < massCompleteThreshold) {
				(reservations[0].ref.querySelector(".btn") as HTMLElement).click();
			}
		});
	}

	// Handles the initialization of the mass complete process
	function startMassComplete(reservations: ReservationItem[]): void {
		for (const reservation of reservations) {
			// Create element displaying status
			const statusEl = document.createElement("div");
			statusEl.setAttribute("id", "status_" + reservation.reservationNumber);
			statusEl.innerText = "Bezig...";

			// Find the open button, open the window and remove the element
			const button = reservation.ref.querySelector<HTMLButtonElement>("div > div.col-2 > div > button")!;
			button.setAttribute("target", "_blank");

			window.open(button.getAttribute("urlref") ?? undefined);

			button.after(statusEl);
			button.remove();

			// Set the status to uncompleted
			reservation.status = 0;
		}

		window.focus();

		GM_setValue("NKHR_MassCompleteStatus", JSON.stringify(reservations));
		monitorMassComplete();
	}

	// Checks to see if any of the mass orders have been completed and sets the status element
	function monitorMassComplete(): void {
		setInterval(function() {
			const status = JSON.parse(GM_getValue("NKHR_MassCompleteStatus", "[{}]")) as ReservationItem[];

			for (const reservation of status) {
				const statusElement = document.querySelector<HTMLElement>("#status_" + reservation.reservationNumber);

				if (statusElement) {
					switch (reservation.status) {
					case 1:
						statusElement.innerText = "Voltooid";
						break;

					case 2:
						statusElement.innerText = "Fout";
						break;
					}
				}
			}
		}, 200);
	}

	// Function that updates the mass complete status in storage
	function updateMassComplete(completionSuccess: boolean): void {
		const reservationNumber = document.querySelector<HTMLInputElement>("#Reservation_ReservationNumber")!.value;

		// Get the status value and parse it
		let status = JSON.parse(GM_getValue("NKHR_MassCompleteStatus", "[{}]")) as ReservationItem[];

		// Add the listener so the status value gets updated automatically
		GM_addValueChangeListener<string>("NKHR_MassCompleteStatus", (_key, _oldValue, newValue) => {
			if (newValue !== undefined) {
				status = JSON.parse(newValue) as ReservationItem[];
			}
		});

		// Check if the current order is tracked by masscomplete status
		if (status.find((reservation) => reservation.reservationNumber === reservationNumber)) {
			// Get the status again to be sure that we are working on the latest value
			status = JSON.parse(GM_getValue("NKHR_MassCompleteStatus", "[{}]")) as ReservationItem[];

			// Set the status value for the current reservation
			status.find((reservation) => reservation.reservationNumber === reservationNumber)!.status = completionSuccess ? 1 : 2;

			// Write the value to storage
			GM_setValue("NKHR_MassCompleteStatus", JSON.stringify(status));

			// Close window if the reservation has been completed and is part of mass complete instance
			if (completionSuccess) {
				window.close();
			}
		}
	}

	// Automatically fill the parcels with the needed item if the current order is in masscomplete
	function autoFillParcel(): void {
		const reservationNumber = (document.getElementById("Reservation_ReservationNumber") as HTMLInputElement).value;

		const status = JSON.parse(GM_getValue("NKHR_MassCompleteStatus", "[{}]")) as ReservationItem[];

		waitForKeyElements("#productList", (productList) => {
			// Check if the current reservation is being tracked by masscomplete
			if (status.find((reservation) => reservation.reservationNumber === reservationNumber)) {
				const productItems = Array.from(productList[0].querySelector("div > div > table > tbody")!.children);

				// iterate over the product list
				for (let i = 1; i < productItems.length; i++) {
					// Set the barcode input and click the button to scan
					document.querySelector<HTMLInputElement>("#productBarcode")!.value = (productItems[i].children[2] as HTMLElement).innerText;
					document.querySelector<HTMLButtonElement>("#verifyProduct")!.click();
				}
			}
		});
	}

	// Function that waits for element to exist and executes a click
	function proceedStep(selector: string): void {
		// disable the function for testing environment
		if (testingEnivronment || !settings.proceed) return;

		waitForKeyElements(selector, elements =>
			elements[0].click());
	}

	// Add product list in the 3rd step, this is useful for seeing which products need to be collected in the packages
	function addProductList(title: string, minimal?: boolean): void {
		// Create empty div to load list content into
		const productList = document.createElement("div");
		productList.setAttribute("id", "productList");
		productList.setAttribute("style", "min-height:173px; overflow-y: auto; overflow-x: hidden;");
		document.querySelector("#ReservationOverview > div:nth-child(2) > div.col-9")!.prepend(productList);

		// Create title for content
		const productListTitle = document.createElement("h4");
		document.querySelector("#ReservationOverview > div:nth-child(2) > div.col-9")!.prepend(productListTitle);
		$(productListTitle).html(title);

		const reservationID = (document.getElementById("ReservationId") as HTMLInputElement).value;

		// Load productlist content from previous step
		const cachedList = localStorage.getItem("NKHR_productList_" + reservationID);

		// Load productlist from cached data if it exists, otherwise AJAX load
		if (cachedList) {
			document.querySelector("#productList")!.innerHTML = cachedList;
			alterList(productList, minimal);
			console.log("Product list loaded from cache.");
		}
		else {
			$("#productList").load("https://retailvista.net/bztrs/packingportal/Reservations/Index/" + reservationID + " #ReservationContainer > div > div.container.my-2 > div", function() {
				alterList(productList);
				console.log("Product list retrieved with request.");
			});
		}
	}

	// Manage the storage to prevent hitting the storage limit
	function manageLocalStorage(): void {
		// If local storage does not contain more than 1.25 million characters do nothing
		if (JSON.stringify(localStorage).length < 1250000) return;

		// Get all keys from local storage
		const keys = Object.keys(localStorage);

		// Filter keys for cached product lists
		const productLists = keys.filter(key => key.startsWith("NKHR_productList_"));

		// Clear every productlist from localstorage
		productLists.forEach((list) => {
			localStorage.removeItem(list);
		});
	}

	// Companion function to structure the list
	function alterList(productList: HTMLElement, minimal?: boolean): void {
		// Remove scan message
		if (minimal) {
			$("#productList > div > div > div").remove();
		}
		else {
			document.querySelector<HTMLElement>("#productList > div > div > div")!.setAttribute("style", "max-width:47.5%;");
		}

		const list = productList.querySelector("div > div > table > tbody")!;
		(list.children[0].children[3] as HTMLElement).innerText = "Nodig aantal";
		for (let i = 1; i < list.children.length; i++) {
			const cell = list.children[i].children[3] as HTMLElement;
			cell.innerText = cell.innerText.split("van ").pop()!;
		}

		if (minimal) {
			for (let i = 0; i < list.children.length; i++) {
				if (i === 0) {
					(list.children[i].children[3] as HTMLElement).innerText = "Aantal";
				}

				list.children[i].children[4].remove();
			}
		}

		if (!minimal && settings.enableAddButtons) {
			const heading = document.createElement("th");
			heading.innerText = "Actie";
			list.children[0].append(heading);
			for (let i = 1; i < list.children.length; i++) {
				const element = document.createElement("td");

				const button = document.createElement("button");
				button.setAttribute("class", "btn btn-primary");
				button.innerHTML = "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0,0&icon_names=add\" /><span class=\"material-symbols-outlined\"> add </span>";
				button.setAttribute("style", "width:26px; height:26px; display: flex; justify-content: center; align-items: center;");
				button.setAttribute("type", "button");
				button.addEventListener("click", function() {
					document.querySelector<HTMLInputElement>("input[id=productBarcode]")!.value = (list.children[i].children[2].children[0] as HTMLElement).innerText;
					document.querySelector<HTMLButtonElement>("button[id=verifyProduct]")!.click();
				});

				element.append(button);
				list.children[i].append(element);
			}
		}
	}

	// Logic that verifies and visually modifies the product list to reflect the products that have been collected in the parcels
	function onScanProductForParcel(): void {
		const collectedHTML = "<span class=\"text-success\"><span class=\"material-icons\">done</span></span>";
		const uncollectedHTML = "<span class=\"text-warning\"><span class=\"material-icons\">close</span></span>";

		// Get a list of all the products in the product list
		const products = Array.from(document.querySelector("#productList > div > div > table > tbody")!.children);
		products.shift(); // remove the heading from the list

		// Assign a product list element to each reservation row based on the barcode
		const verificationReservationRows: VerificationReservationRow[] = Array.from(
			document.querySelectorAll<HTMLInputElement>(
				"input[id^='VerificationReservationRows_'][id$='__ProductMainBarcode']",
			),
		).map((input) => {
			return {
				rowId: input.id.split("VerificationReservationRows_").pop()!.split("__ProductMainBarcode").shift()!,
				listElement: products.splice(
					products.findIndex((product) => (product.children[2] as HTMLElement).innerText === input.value),
					1,
				)[0]!,
			};
		});

		// Create an observer that listens for changes in the parcels container
		const observer = new MutationObserver(() => {
			verificationReservationRows.forEach((reservationRow) => {
				// Get the required and verified amounts neccesary for the product
				const verifiedAmount = parseInt(
					document.querySelector<HTMLInputElement>(
						"input[id=VerificationReservationRows_" + reservationRow.rowId + "__VerifiedQuantity]",
					)!.value,
				);
				const requiredAmount = parseInt(
					document.querySelector<HTMLInputElement>(
						"input[id=VerificationReservationRows_" + reservationRow.rowId + "__ProductQuantity]",
					)!.value,
				);

				// Change the icon based on the state
				(reservationRow.listElement.children[4].children[0] as HTMLElement).innerHTML = verifiedAmount >= requiredAmount ? collectedHTML : uncollectedHTML;
				if (settings.enableAddButtons) {
					(reservationRow.listElement.querySelector("button") as HTMLButtonElement).disabled = verifiedAmount >= requiredAmount;
				}
			});

			const parcelList = document.querySelectorAll("div > div.card-body > table > tbody > tr");
			for (let i = 1; i < parcelList.length - 1; i++) {
				parcelList[i].querySelector("button")?.remove();
			}
		});

		const observerOptions: MutationObserverInit = {
			childList: true,
			subtree: true,
		};

		observer.observe(document.querySelector("#ParcelsContainer")!, observerOptions);
	}

	// Cache the product list from the verification step
	function cacheProductList(): void {
		const reservationID = document.getElementById("ReservationId") as HTMLInputElement | null;
		const productList = document.querySelector("#ReservationContainer > div > div.container.my-2 > div");

		// Cache the product list for the next page in the packing process
		if (reservationID && productList) {
			localStorage.setItem("NKHR_productList_" + reservationID.value, productList.outerHTML);
			console.log("Cached product list.");
		}
	}

	// Skip second step, set product values correctly and instantly forward page.
	function completeVerificationStep(): void {
		// Cache the product list for use in the third step
		cacheProductList();

		// Replace button with enabled variant
		$("#ReservationContainer > div > div:nth-child(5) > div").html("<div class=\"col-3\"><button type=\"submit\" class=\"btn btn-primary \" formaction=\"/bztrs/packingportal/Reservations/Update\">Volgende&nbsp;<span class=\"material-icons\">chevron_right</span></button></div>");

		// Loop through all products and set collected variables to true so the package fires correctly
		for (let i = 0; i < 200; i++) {
			const collected = document.querySelector<HTMLInputElement>("#ReservationRowsNotInCarriers_" + i + "__Collected");

			if (collected) {
				collected.value = "true";
			}
			else {
				break;
			}
		}

		// Click the button to continue step
		$("#ReservationContainer > div > div:nth-child(5) > div > div > button").click();
	}

	async function silentLoadOnSearch(): Promise<void> {
		// Create empty dummy element to load data into
		document.body.innerHTML += "<div id='dummyLoader' style='display:none;'></div>";
		const loadElement = document.getElementById("dummyLoader") as HTMLDivElement;
		console.log("Silent Load: created dummy element");

		// Intercept the submit event and prevent it from sending
		$("#frmReservations").on("submit", function(e) {
			e.preventDefault();
			$("body").addClass("busy");

			console.log("Silent Load: intercepted submit");

			// Fire our own search request and load the data into the dummy element
			const formData = $(this).serialize();
			reservationSearchRequest(formData).then(async (searchResponse) => {
				// On success load the response into the dummy element
				loadElement.innerHTML = searchResponse;
				console.log("Silent Load: loaded response into dummy");

				let responseState = evaluateSearchResponse(loadElement);

				// In case the response is an alert, display the message and stop loading
				if (responseState.isAlert) {
					$("body").removeClass("busy");

					// Load the messages from the loaded page if any exist
					document.querySelector("#messages")!.parentElement!.innerHTML = loadElement.querySelector("#alert")!.parentElement!.parentElement!.innerHTML;

					// Select and empty the barcode
					document.querySelector<HTMLInputElement>("#Productbarcode")!.focus();
					document.querySelector<HTMLInputElement>("#Productbarcode")!.value = "";

					console.log("Silent Load: loaded the alert message");
					return;
				}

				// When the response is a reservation selection modal, handle this and load a reservation
				if (responseState.isProductSelection) {
					await handleSelectionModal().then((selectedProductData) => {
						loadElement.innerHTML = selectedProductData;
						console.log("Silent Load: loaded selected product from selection modal");

						responseState = evaluateSearchResponse(loadElement);
					});
				}

				// In case the loaded reservation is unfinished, finish the run and load again
				if (responseState.isUnfinished) {
					await handleUnfinishedRun().then((finishedRunData) => {
						loadElement.innerHTML = finishedRunData;
						console.log("Silent Load: loaded finished run response");
					});
				}

				completeVerificationStep();
			});
		});
	}

	// Request that retrieves reservations from submitted data
	async function reservationSearchRequest(formData: string): Promise<string> {
		return new Promise((resolve) => {
			$.ajax({
				url: "/bztrs/packingportal/Reservations/Search",
				type: "GET",
				data: formData,
				success: function(data: string) {
					resolve(data);
				},
			});
		});
	}

	// Evaluate the state of the given response
	function evaluateSearchResponse(element: HTMLElement): SearchResponseState {
		const isUnfinished = element.querySelector("[id=unfinishedOrderPickingRunsModal]") !== null;
		const isAlert = element.querySelector("#alert") !== null && !isUnfinished;
		const isProductSelection = element.querySelector("#productReservationsModal");

		return { isAlert, isUnfinished, isProductSelection };
	}

	// Handle product selection modal, pick the first product if needed
	async function handleSelectionModal(): Promise<string> {
		return new Promise((resolve) => {
			let modalContainer = document.querySelector<HTMLElement>("[id=modalContainer]");
			if (!modalContainer) {
				modalContainer = document.createElement("div");
				modalContainer.setAttribute("id", "modalContainer");
				document.querySelector("body > div.vh-100.d-flex.flex-column.position-relative.retailvista-packing-ui > div > div")!.append(modalContainer);
				console.log(modalContainer);
			}

			// Check if the response contains a product list modal
			const dummyLoader = document.querySelector<HTMLElement>("[id=dummyLoader]")!;
			const loadedModal = dummyLoader.querySelector("#productReservationsModal");
			if (loadedModal) {
				$("body").removeClass("busy");

				console.log(loadedModal);
				// Move the modal and make it show to the user
				modalContainer!.innerHTML = loadedModal.outerHTML;
				loadedModal.remove();
				($("#productReservationsModal") as unknown as { modal(action: string): void }).modal("show");

				// Loop that replaces all the buttons with ones that also silently load the 3rd step, skipping the 2nd
				const openButtons = loadedModal.querySelectorAll<HTMLAnchorElement>("a.btn-primary");
				for (const anchorButton of Array.from(openButtons)) {
					const url = anchorButton.href;

					// Creating the new button
					const newButton = document.createElement("button");
					newButton.setAttribute("class", "btn btn-primary");
					newButton.innerHTML = anchorButton.innerHTML;
					newButton.onclick = function() {
						$.ajax({
							url: url,
							type: "GET",
							success: function(data: string) {
								resolve(data);
								$("body").addClass("busy");
							},
							error: function(_jXHR: unknown, _textStatus: string, errorThrown: string) {
								alert(errorThrown);
							},
						});
					};

					newButton.setAttribute("urlref", url);

					console.log(anchorButton.href);

					const foundButton = document.querySelector<HTMLAnchorElement>("[href='" + anchorButton.href.split("https://retailvista.net")[1] + "']");

					console.log(foundButton);

					// Remove the old button
					foundButton!.parentElement!.append(newButton);
					foundButton!.remove();
				}

				// Run logic that automatically proceeds modal
				processOrderSelection();
			}
		});
	}

	// Send http request that sets the orderpickingrun state to finished
	async function handleUnfinishedRun(): Promise<string> {
		return new Promise((resolve) => {
			const finishRunUrl = (document.querySelector("[id=unfinishedOrderPickingRunsModal]")!.querySelector(".btn") as HTMLAnchorElement).href;

			$.ajax({
				url: finishRunUrl,
				type: "GET",
				success: function(data: string) {
					resolve(data);
				},
			});
		});
	}

	// Clear all parcel items from the parcels
	function clearAllParcelItems(): void {
		// Get all delete buttons for parcel items and start iterating through them
		const removeButtons = Array.from(document.querySelectorAll<HTMLElement>("#button-addon2"));

		// Iterate through found remove buttons from the last with a delay, without this delay the removal fails
		if (removeButtons.length > 0) {
			// Set the class to busy so the user knows actions are happening
			$("body").addClass("busy");
			for (let i = 0; i < removeButtons.length; i++) {
				setTimeout(() => {
					$("body").addClass("busy");
					// format the onclick event to usable data
					const parcelInfo = removeButtons.pop()!.onclick!.toString().split("(").pop()!.split(")").shift()!.split(",");

					// Get the amount and active controls for the parcel item
					const amountControl = document.querySelector<HTMLInputElement>("#Items_" + parcelInfo[1] + "__Items_" + parcelInfo[2] + "__Amount")!;
					const activeControl = document.querySelector<HTMLInputElement>("#Items_" + parcelInfo[1] + "__Items_" + parcelInfo[2] + "__Active")!;

					// Set the controls to 0 and active, this makes the update remove the parcel items
					amountControl.value = "0";
					activeControl.value = "True";

					// Call the page native function to update the parcel item
					location.href = "javascript:void(update());";
				}, i * 250);
			}
			$("body").removeClass("busy");
		}
	}

	// Turn the ordernumber in the reservation details into a link that opens the order
	function editReservationDetails(): void {
		const returnButton = document.querySelector<HTMLAnchorElement>("#ReservationOverview > div:nth-child(1) > div > a")!;
		returnButton.setAttribute("href", "/bztrs/packingportal");
		returnButton.innerHTML = "<span class=\"material-icons\">chevron_left</span>&nbsp;Nieuwe zoekopdracht";
	}

	// Creates the shopware comment box
	function createCommentBox(): void {
		const orderNumber = document.querySelector<HTMLElement>("#ReservationSummary\\ mb-2 > div:nth-child(3)")!.innerHTML.split(" ")[2];

		// Return and do not create the comment box if the number length does not match shopware
		if (orderNumber.length !== 6) return;

		// Create the comment box dialog
		const commentBox = document.createElement("div");
		commentBox.setAttribute("id", "commentBox");
		commentBox.setAttribute("style", "margin-top: 20px;");

		const commentTextLabel = document.createElement("label");
		commentTextLabel.setAttribute("for", "commentTextArea");
		commentTextLabel.setAttribute("class", "row mb-2");
		commentTextLabel.setAttribute("style", "font-weight: bold;");
		commentTextLabel.innerText = "Shopware Notitie:";
		commentBox.appendChild(commentTextLabel);

		const commentTextArea = document.createElement("textarea");
		commentTextArea.setAttribute("name", "commentTextArea");
		commentTextArea.setAttribute("id", "commentTextArea");
		commentTextArea.setAttribute("class", "row mb2 form-control");
		commentTextArea.setAttribute("style", "height: 150px;width: 100%;-webkit-box-sizing: border-box; font-size:20px; color:black; /* Safari/Chrome, other WebKit */-moz-box-sizing: border-box;    /* Firefox, other Gecko */box-sizing: border-box; ");
		commentTextArea.disabled = true;
		commentBox.appendChild(commentTextArea);

		const commentSaveButton = document.createElement("button");
		commentSaveButton.setAttribute("id", "commentSaveButton");
		commentSaveButton.setAttribute("type", "button");
		commentSaveButton.setAttribute("class", "btn btn-primary row mb2");
		commentSaveButton.setAttribute("style", "width:100px; margin-top:10px;");
		commentSaveButton.innerText = "Opslaan";
		commentSaveButton.disabled = true;
		commentBox.appendChild(commentSaveButton);

		const openShopwareButton = document.createElement("button");
		openShopwareButton.setAttribute("id", "openShopwareButton");
		openShopwareButton.setAttribute("type", "button");
		openShopwareButton.setAttribute("class", "btn btn-primary row mb2");
		openShopwareButton.setAttribute("style", "width:100px; margin-top:10px; margin-left:20px;");
		openShopwareButton.innerText = "Open";
		openShopwareButton.disabled = true;
		commentBox.appendChild(openShopwareButton);

		document.querySelector("#ReservationOverview > div:nth-child(2) > div.col-3")!.insertBefore(
			commentBox,
			document.querySelector("#ReservationSummary\\ mb-2")!.nextSibling,
		);

		// Initialize shopware integration, this authenticates us and retrieves a valid token
		shopwareInitialize().then(async (token) => {
			// Get the order data from ordernumber
			const orderData = await shopwareGetOrderData(token, orderNumber);

			// Update the text box with the current customer comment data
			commentTextArea.value = orderData.data[0].customerComment ?? "";

			// enable comment box dialog
			openShopwareButton.disabled = false;
			commentSaveButton.disabled = false;
			commentTextArea.disabled = false;

			let clickTimeout: ReturnType<typeof setTimeout> | undefined;
			// Create onclick function that will update the customer comment in shopware
			commentSaveButton.onclick = () => {
				// Change the data object with value from text box
				orderData.data[0].customerComment = commentTextArea.value;

				// Send info to server
				shopwareUpdateOrderComment(token, orderData.data[0]);

				// clear timeout if one is already running
				if (clickTimeout !== undefined) { clearTimeout(clickTimeout); }

				// change comment box state to reflect save in progress
				commentSaveButton.innerHTML = "Opgeslagen!";
				commentTextArea.disabled = true;

				// reset comment box
				clickTimeout = setTimeout(function() {
					commentSaveButton.innerHTML = "Opslaan";
					commentTextArea.disabled = false;
				}, 2000);
			};

			// Set onclick for open button to open shopware order
			openShopwareButton.onclick = () => {
				window.open("https://www.kampeerhalroden.nl/admin#/sw/order/detail/" + orderData.data[0].id + "/general", "_blank")!.focus();
			};

			const hasValue = commentTextArea.value !== undefined && commentTextArea.value !== "";
			if (hasValue) {
				commentWarning();
			}
		});
	}

	function commentWarning(): void {
		const productListHeading = document.querySelector<HTMLElement>("#ReservationOverview > div:nth-child(2) > div.col-9")!;
		productListHeading.insertAdjacentHTML("afterbegin", `
            <div class="mt-2 alert alert-info" style="text-align: center; font-size: 24px; max-width:100%;color: #7f5353;background-color: #f6efef;border-color: #7f5353;"><b>Let op!</b> Er is een shopware notitie.</div>`);
	}

	// Add button to search portal to open last completed reservation, this makes it easy to add new packages to an order that was just completed.
	function addLastReservationButtons(): void {
		const lastCompletedReservationDetails = JSON.parse(
			localStorage.getItem("NKHR_LastCompletedReservationDetails") ?? "null",
		) as ReservationDetails | null;

		// Test if we have a saved last saved reservation and create the button if we do
		if (lastCompletedReservationDetails) {
			// Setup the button element with proper text, attributes and url
			const lastCompletedButton = document.createElement("a");
			lastCompletedButton.setAttribute("class", "btn btn-primary btn-block");
			lastCompletedButton.setAttribute("id", "lastCompletedButton");
			lastCompletedButton.setAttribute("href", "https://retailvista.net/bztrs/packingportal/AddParcels/Search?ReservationNumber=" + lastCompletedReservationDetails.number);
			lastCompletedButton.innerText = "Laatst voltooide reservering";

			// Insert the button after the reservation search button
			const afterAddParcelsBtn = document.querySelector("#frmAddParcels > div.form-group.pt-3 > button")!.nextSibling;
			document.querySelector("#frmAddParcels > div.form-group.pt-3")!.insertBefore(lastCompletedButton, afterAddParcelsBtn);
		}

		const lastOpenReservationDetails = JSON.parse(
			localStorage.getItem("NKHR_LastOpenReservationDetails") ?? "null",
		) as ReservationDetails | null;

		// Test if we have a saved last saved reservation and create the button if we do
		if (lastOpenReservationDetails !== null) {
			// Return and do not create the button if it is the same as last completed
			if (lastOpenReservationDetails && lastCompletedReservationDetails && lastOpenReservationDetails.number === lastCompletedReservationDetails.number) { return; }

			// Setup the button element with proper text, attributes and url
			const lastOpenButton = document.createElement("a");
			lastOpenButton.setAttribute("class", "btn btn-primary btn-block");
			lastOpenButton.setAttribute("id", "lastCompletedButton");
			lastOpenButton.setAttribute("href", "https://retailvista.net/bztrs/packingportal/Parcels?reservationId=" + lastOpenReservationDetails.id + "&allowCashOnDelivery=False&autoComplete=false");
			lastOpenButton.innerText = "Laatst geopende reservering";

			// Insert the button after the reservation search button
			const afterAddParcelsBtnOpen = document.querySelector("#frmAddParcels > div.form-group.pt-3 > button")!.nextSibling;
			document.querySelector("#frmReservations > div.form-group.pt-3")!.insertBefore(lastOpenButton, afterAddParcelsBtnOpen);
		}
	}

	// This function saves the currently open reservation to local storage as the last open reservation
	function saveLastOpenReservation(): void {
		const reservationNumber = document.querySelector<HTMLInputElement>("#Reservation_ReservationNumber")!.value;
		const reservationID = document.querySelector<HTMLInputElement>("#VerificationReservationRows_0__ReservationId")!.value;

		const reservationDetails: ReservationDetails = { id: reservationID, number: reservationNumber };

		localStorage.setItem("NKHR_LastOpenReservationDetails", JSON.stringify(reservationDetails));
	}

	// This function saves the currently open reservation to local storage as the last completed reservation
	function saveLastCompletedReservation(): void {
		const reservationNumber = document.querySelector<HTMLInputElement>("#Reservation_ReservationNumber")!.value;
		const reservationID = window.location.href.split("reservationId=").pop()!.split("&").shift()!;

		const reservationDetails: ReservationDetails = { id: reservationID, number: reservationNumber };

		localStorage.setItem("NKHR_LastCompletedReservationDetails", JSON.stringify(reservationDetails));
	}

	function setOptionsPanelVisibility(visible?: boolean): void {
		const panel = document.querySelector<HTMLElement>("#optionsPanel")!;

		if (visible === undefined) {
			visible = panel.style.display === "none";
		}

		if (visible) {
			panel.style.display = "block";
		}
		else {
			panel.style.display = "none";
		}
	}

	function createOptionsPanel(): void {
		const panelElement = document.createElement("div");
		panelElement.setAttribute("id", "optionsPanel");

		const style = `
            display:none;
            width:250px;
            min-height:200px;
            background-color:#eff6f3;
            position:absolute;
            right:0px;
            bottom: 0px;
            transform:translate(0, -50%);
            border-style:solid;
            border-width:1px;
            border-color:#3e5f42;
            z-index:1000;
        `;

		panelElement.setAttribute("style", style);
		document.body.append(panelElement);

		panelElement.innerHTML += `
            <h5 class="text-center" style="margin-top:10px;">Script Instellingen</h5>
        `;

		panelElement.innerHTML += `
            <input type="checkbox" id="checkboxEnabled" name="checkboxEnabled" style="margin-left:10px; vertical-align: middle;">
            <label for="checkboxEnabled" style="margin-left:10px;">Script inschakelen</label>
        `;

		panelElement.innerHTML += `
            <br>
            <input type="checkbox" id="checkboxProceed" name="checkboxProceed" style="margin-left:10px; vertical-align: middle;">
            <label for="checkboxProceed" style="margin-left:10px;">Automatisch doorgaan</label>
        `;

		panelElement.innerHTML += `
            <br>
            <input type="checkbox" id="checkboxAddButtons" name="checkboxAddButtons" style="margin-left:10px; vertical-align: middle;">
            <label for="checkboxAddButtons" style="margin-left:10px;">Toevoeg knoppen</label>
        `;

		const checkboxEnabled = document.querySelector<HTMLInputElement>("[id=checkboxEnabled]")!;

		if (settings.enabled) { checkboxEnabled.setAttribute("checked", ""); }
		checkboxEnabled.addEventListener("change", (event) => { settings.enabled = (event.target as HTMLInputElement).checked; });

		const checkboxProceed = document.querySelector<HTMLInputElement>("[id=checkboxProceed]")!;

		if (settings.proceed) { checkboxProceed.setAttribute("checked", ""); }
		checkboxProceed.addEventListener("change", (event) => { settings.proceed = (event.target as HTMLInputElement).checked; });

		const checkboxAddButtons = document.querySelector<HTMLInputElement>("[id=checkboxAddButtons]")!;

		if (settings.enableAddButtons) { checkboxAddButtons.setAttribute("checked", ""); }
		checkboxAddButtons.addEventListener("change", (event) => { settings.enableAddButtons = (event.target as HTMLInputElement).checked; });
	}

	/** ******************************************
     *                                          *
     *          SHOPWARE INTEGRATION            *
     *                                          *
     ********************************************/

	// This function initializes the shopware integration
	async function shopwareInitialize(): Promise<ShopwareToken> {
		let token: ShopwareToken;

		// Check if token exists locally
		const storageToken = localStorage.getItem("NKHR_ShopwareToken");
		if (storageToken !== null) {
			// Parse the local storage item if it exists
			token = JSON.parse(storageToken) as ShopwareToken;

			console.log("Retrieving token from storage...");
		}
		else {
			// If no token exists in local storage retrieve a new one
			const login = await shopwareLoginDialog();

			token = await shopwareGetToken(login.username, login.password);
		}

		let versionInfo: ShopwareVersionResponse;

		try {
			versionInfo = await shopwareGetVersion(token);
		}
		catch (err) {
			const jqErr = err as { responseJSON: ShopwareErrorBody };
			// If it throws unauthorized error try refreshing the token
			if (jqErr.responseJSON.errors[0].status == 401 && jqErr.responseJSON.errors[0].code == 9) {
				try {
					token = await shopwareRefreshToken(token);
				}
				catch {
					// get a new token if refreshing fails
					const login = await shopwareLoginDialog();

					token = await shopwareGetToken(login.username, login.password);
				}
			}
			else {
				// try getting a new token if the error is not recognized
				const login = await shopwareLoginDialog();

				token = await shopwareGetToken(login.username, login.password);
			}

			versionInfo = await shopwareGetVersion(token);
		}

		console.log(versionInfo);

		console.log("Shopware integration initialized");

		return token;
	}

	// Function that sends a request for a new token with the given credentials
	async function shopwareGetToken(username: string, password: string): Promise<ShopwareToken> {
		const ajaxSettings: JQuery.AjaxSettings = {
			async: true,
			crossDomain: true,
			url: shopwareApiUrl + "/api/oauth/token",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			processData: false,
			data: JSON.stringify({
				client_id: "administration",
				grant_type: "password",
				scopes: "write",
				username: username,
				password: password,
			}),
		};

		console.log("Retrieving shopware token...");

		const token = (await $.ajax(ajaxSettings)) as ShopwareToken;

		// Save the token to local storage
		localStorage.setItem("NKHR_ShopwareToken", JSON.stringify(token));

		return token;
	}

	// Function that refreshes the given token
	async function shopwareRefreshToken(token: ShopwareToken): Promise<ShopwareToken> {
		const ajaxSettings: JQuery.AjaxSettings = {
			async: true,
			crossDomain: true,
			url: shopwareApiUrl + "/api/oauth/token",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			processData: false,
			data: JSON.stringify({
				grant_type: "refresh_token",
				client_id: "administration",
				refresh_token: token.refresh_token,
			}),
		};

		console.log("Refreshing shopware token...");

		const newToken = (await $.ajax(ajaxSettings)) as ShopwareToken;

		// Save the token to local storage
		localStorage.setItem("NKHR_ShopwareToken", JSON.stringify(newToken));

		return newToken;
	}

	// Function that retrieves the shopware API version
	async function shopwareGetVersion(token: ShopwareToken): Promise<ShopwareVersionResponse> {
		const ajaxSettings: JQuery.AjaxSettings = {
			async: true,
			crossDomain: true,
			url: shopwareApiUrl + "/api/_info/version",
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token.access_token,
			},
		};

		console.log("Getting shopware version...");

		return (await $.ajax(ajaxSettings)) as ShopwareVersionResponse;
	}

	// Function that retrieves the order data for a given ordernumber
	async function shopwareGetOrderData(token: ShopwareToken, orderNumber: string): Promise<ShopwareSearchResponse> {
		const ajaxSettings: JQuery.AjaxSettings = {
			async: true,
			crossDomain: true,
			url: shopwareApiUrl + "/api/search/order",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: "Bearer " + token.access_token,
			},
			processData: false,
			// Create filter settings for ordernumber
			data: JSON.stringify({
				filter: [
					{
						type: "contains",
						field: "orderNumber",
						value: orderNumber,
					},
				],
			}),
		};

		console.log("Retrieving order data for order with number (" + orderNumber + ").");

		return (await $.ajax(ajaxSettings)) as ShopwareSearchResponse;
	}

	// Function that updates order customer comment
	async function shopwareUpdateOrderComment(token: ShopwareToken, data: ShopwareOrderEntry): Promise<unknown> {
		const ajaxSettings: JQuery.AjaxSettings = {
			async: true,
			crossDomain: true,
			url: shopwareApiUrl + "/api/order/" + data.id,
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/vnd.api+json, application/json",
				Authorization: "Bearer " + token.access_token,
			},
			// Filter out the rest of the data and send only the customer comment
			data: JSON.stringify({
				customerComment: data.customerComment,
			}),
		};

		console.log("Updating shopware order customer comment...");

		return $.ajax(ajaxSettings);
	}

	// Create a login dialog to retrieve shopware login credentials
	async function shopwareLoginDialog(): Promise<LoginCredentials> {
		// --- Use jQuery to add the form in a "popup" dialog.
		$("body").append(`
            <div id="shopwarePopupContainer">
            <center><h3>Shopware Login</h3></center>
                <form>
                <label for="sw_username">Username: </label><br>
                    <input type="text" id="sw_username" value=""><br>
                    <label for="sw_password">Password: </label><br>
                    <input type="text" id="sw_password" value=""><br>

                    <center><button id="shopwareLoginButton" type="button">Login</button></center>
                </form>
            </div>
        `);

		$("#shopwareLoginButton").click(function() {
			$("#gmPopupContainer").hide();
		});

		GM_addStyle(`
            #shopwarePopupContainer {
                position:               fixed;
                align-self:             center;
                top:                    25px;
                padding:                2em;
                background:             #eff6f3;
                border:                 1px solid black;
                border-radius:          1ex;
                z-index:                777;
            }
            #shopwarePopupContainer button{
                cursor:                 pointer;
                margin:                 1em 1em 0;
                border:                 1px outset buttonface;

            }
        `);

		return new Promise((resolve) => {
			$("#shopwareLoginButton").click(function() {
				const username = document.querySelector<HTMLInputElement>("#sw_username")!.value;
				const password = document.querySelector<HTMLInputElement>("#sw_password")!.value;

				$("#shopwarePopupContainer").hide();
				resolve({
					username,
					password,
				});
			});
		});
	}
})();

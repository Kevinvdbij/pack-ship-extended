import { GM_addStyle } from "$";

export interface ShopwareToken {
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

export interface ShopwareOrderEntry {
	id: string;
	customerComment: string;
}

interface ShopwareSearchResponse {
	data: ShopwareOrderEntry[];
}

interface LoginCredentials {
	username: string;
	password: string;
}

const shopwareApiUrl = "https://www.kampeerhalroden.nl";

	// This function initializes the shopware integration
	export async function shopwareInitialize(): Promise<ShopwareToken> {
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
	export async function shopwareGetOrderData(token: ShopwareToken, orderNumber: string): Promise<ShopwareSearchResponse> {
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
	export const updateOrderComment = async (token: ShopwareToken, data: ShopwareOrderEntry): Promise<Response> => {
		const url = `${shopwareApiUrl}/api/order/${data.id}`;
		
		const options = {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/vnd.api+json, application/json",
				Authorization: "Bearer " + token.access_token,
			},
			body: JSON.stringify({
				customerComment: data.customerComment,
			}),
		};

		return fetch(url, options).then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to update order comment. Status: ${response.status}`);
			}
			return response;
		});
	}

	export async function getImageUri(productEAN: string) {
		console.log(`SWIntegration: getting image URI (${productEAN}).`);

		const url = shopwareApiUrl + "/store-api/product";
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'sw-access-key': 'SWSCNGG4CDNHVVL4MJZ2YKDCMA',
				"sw-include-seo-urls":"true"
			},
			body: JSON.stringify({
				filter: [
					{
						type: "contains",
						field: "ean",
						value: productEAN
					}
				]
			})
		};

		try {
			const response = await fetch(url, options);
			const data = await response.json();
			
			if (data?.elements?.length > 0) {
            	const product = data.elements[0];

				return "https://www.kampeerhalroden.nl/" + product.cover.media.path;
			}
			else throw new Error("Product not found.");
		} 
		catch(error) {
			console.warn(error);

			return "";
		}
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
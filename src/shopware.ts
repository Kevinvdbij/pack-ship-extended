import { GM_addStyle } from "$";
import { SHOPWARE_URL } from "./constants.ts";
import { debug } from "./logger.ts";

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

const TOKEN_STORAGE_KEY = "NKHR_ShopwareToken";

// Public storefront key, safe to ship with the script.
const STORE_ACCESS_KEY = "SWSCNGG4CDNHVVL4MJZ2YKDCMA";

// Admin API call. Bodies are pre-stringified because processData is off.
function adminRequest<T>(path: string, options: { method: string, token?: ShopwareToken, body?: unknown }): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};

	if (options.token) {
		headers.Authorization = "Bearer " + options.token.access_token;
	}

	return $.ajax({
		async: true,
		crossDomain: true,
		url: SHOPWARE_URL + path,
		method: options.method,
		headers: headers,
		processData: false,
		data: options.body === undefined ? undefined : JSON.stringify(options.body),
	}) as unknown as Promise<T>;
}

// This function initializes the shopware integration
export async function shopwareInitialize(): Promise<ShopwareToken> {
	let token: ShopwareToken;

	// Check if token exists locally
	const storageToken = localStorage.getItem(TOKEN_STORAGE_KEY);
	if (storageToken !== null) {
		// Parse the local storage item if it exists
		token = JSON.parse(storageToken) as ShopwareToken;

		debug("Retrieving Shopware token from storage...");
	}
	else {
		// If no token exists in local storage retrieve a new one
		token = await promptForToken();
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
				token = await promptForToken();
			}
		}
		else {
			// try getting a new token if the error is not recognized
			token = await promptForToken();
		}

		versionInfo = await shopwareGetVersion(token);
	}

	debug("Shopware integration initialized", versionInfo);

	return token;
}

// Ask the user to sign in and exchange their credentials for a token
async function promptForToken(): Promise<ShopwareToken> {
	const login = await shopwareLoginDialog();

	return shopwareGetToken(login.username, login.password);
}

// Function that sends a request for a new token with the given credentials
async function shopwareGetToken(username: string, password: string): Promise<ShopwareToken> {
	debug("Retrieving shopware token...");

	const token = await adminRequest<ShopwareToken>("/api/oauth/token", {
		method: "POST",
		body: {
			client_id: "administration",
			grant_type: "password",
			scopes: "write",
			username: username,
			password: password,
		},
	});

	localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));

	return token;
}

// Function that refreshes the given token
async function shopwareRefreshToken(token: ShopwareToken): Promise<ShopwareToken> {
	debug("Refreshing shopware token...");

	const newToken = await adminRequest<ShopwareToken>("/api/oauth/token", {
		method: "POST",
		body: {
			grant_type: "refresh_token",
			client_id: "administration",
			refresh_token: token.refresh_token,
		},
	});

	localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newToken));

	return newToken;
}

// Function that retrieves the shopware API version
async function shopwareGetVersion(token: ShopwareToken): Promise<ShopwareVersionResponse> {
	debug("Getting shopware version...");

	return adminRequest<ShopwareVersionResponse>("/api/_info/version", { method: "GET", token: token });
}

// Function that retrieves the order data for a given ordernumber
export async function shopwareGetOrderData(token: ShopwareToken, orderNumber: string): Promise<ShopwareSearchResponse> {
	debug(`Retrieving order data for order with number (${orderNumber}).`);

	return adminRequest<ShopwareSearchResponse>("/api/search/order", {
		method: "POST",
		token: token,
		body: {
			filter: [
				{
					type: "contains",
					field: "orderNumber",
					value: orderNumber,
				},
			],
		},
	});
}

// Function that updates order customer comment
export const updateOrderComment = async (token: ShopwareToken, data: ShopwareOrderEntry): Promise<Response> => {
	const url = `${SHOPWARE_URL}/api/order/${data.id}`;

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
	debug(`Getting product image URI (${productEAN}).`);

	const url = SHOPWARE_URL + "/store-api/product";
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'sw-access-key': STORE_ACCESS_KEY,
			"sw-include-seo-urls": "true"
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

			return `${SHOPWARE_URL}/${product.cover.media.path}`;
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

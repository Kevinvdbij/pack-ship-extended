import { GM_getValue } from "$";
import { SHOPWARE_URL, STORAGE_KEYS } from "./constants.ts";
import { debug } from "./logger.ts";

export interface ShopwareToken {
	token_type: string;
	expires_in: number;
	access_token: string;
	refresh_token: string;
}

export interface ShopwareVersionResponse {
	version: string;
}

export interface ShopwareOrderEntry {
	id: string;
	customerComment: string;
}

export interface ShopwareSearchResponse {
	data: ShopwareOrderEntry[];
}

// Public storefront key, safe to ship with the script.
const STORE_ACCESS_KEY = "SWSCNGG4CDNHVVL4MJZ2YKDCMA";

function adminRequest<T>(path: string, options: { method: string, token?: ShopwareToken, body?: unknown }): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};

	if (options.token) {
		headers.Authorization = "Bearer " + options.token.access_token;
	}

	return fetch(SHOPWARE_URL + path, {
		method: options.method,
		headers: headers,
		body: options.body === undefined ? undefined : JSON.stringify(options.body),
	})
	.then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to fetch shopware data. Status: ${response.status}`);
		}
		// Writes such as PATCH answer 204 with an empty body, which json() cannot parse.
		if (response.status === 204 || !response.headers.get("Content-Type")?.includes("json")) {
			return undefined as T;
		}
		return response.json() as Promise<T>;
	});
}

// This function initializes the shopware integration
export async function shopwareInitialize(): Promise<ShopwareToken> {
	let token: ShopwareToken;

	token = await getToken();

	shopwareGetVersion(token).then((response) => {
		debug(`Shopware version: ${response.version}`);
	}).catch((error) => {
		console.error("Failed to retrieve shopware version.", error);
	});

	return token;
}

export async function getToken(): Promise<ShopwareToken> {
	const url = `${SHOPWARE_URL}/api/oauth/token`;

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			grant_type: "client_credentials",
			client_id: GM_getValue(STORAGE_KEYS.swClientId),
			client_secret: GM_getValue(STORAGE_KEYS.swClientSecret)
		}),
	}

	return fetch(url, options).then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to retrieve shopware token. Status: ${response.status}`);
		}
		return response.json();
	});
}

// Function that retrieves the shopware API version
export async function shopwareGetVersion(token: ShopwareToken): Promise<ShopwareVersionResponse> {
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
export async function updateOrderComment(token: ShopwareToken, data: ShopwareOrderEntry): Promise<void> {
	debug(`Updating order comment for order with id (${data.id}).`);

	return adminRequest<void>(`/api/order/${data.id}`, {
		method: "PATCH",
		token: token,
		body: {
			customerComment: data.customerComment,
		},
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

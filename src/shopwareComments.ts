import { toast } from "vue3-toastify";
import { ShopwareOrderEntry, ShopwareToken, updateOrderComment } from "./shopware.ts";
import { playSound } from "./sounds.ts";

// Saves a customer comment and reports progress through a toast. Callers are
// expected to disable their comment box for a moment afterwards so a double
// click cannot fire two updates.
//
// `subject` is what the toast calls the thing that was saved. The field holds
// both the customer's note and the rack bays appended to it, and a packer who
// pressed a bay should not be told their note is being saved.
export function saveOrderComment(
	token: ShopwareToken,
	orderData: ShopwareOrderEntry,
	orderNumber: string,
	subject: string = "notitie"
) {
	const updatePromise = updateOrderComment(token, orderData);

	toast.promise(updatePromise, {
		pending: `Order ${orderNumber} ${subject} wordt opgeslagen...`,
		success: `Order ${orderNumber} ${subject} succesvol opgeslagen.`,
		error: `Er is een fout opgetreden bij het opslaan van de ${subject} van order ${orderNumber}.`
	}).catch((error) => {
		console.error("Failed to save order comment.", error);
		// The toast says so on screen; this says so to whoever has already
		// turned back to the box.
		playSound("error");
	});

	return updatePromise;
}

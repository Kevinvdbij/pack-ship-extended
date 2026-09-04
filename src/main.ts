import { Component } from 'vue';
import * as RVUtils from "./retailVistaUtils";
import { mountApp } from './vue/mount.ts';
import SearchReservationsPage from './vue/pages/SearchReservationsPage.vue';
import VerifyProductsPage from './vue/pages/VerifyProductsPage.vue';
import CreateParcelsPage from './vue/pages/CreateParcelsPage.vue';
import CompletedPage from './vue/pages/CompletedPage.vue';
import AddParcelsPage from './vue/pages/AddParcelsPage.vue';
import FooterExtension from './vue/components/Footer.vue';
import Settings from "./settings.ts"
import "./style.css";
import "vue3-toastify/dist/index.css";

interface Route {
	pattern: RegExp;
	// Matched against the pathname, or against pathname + query string when the
	// route is only recognisable by its parameters.
	matchQuery?: boolean;
	// A route with no component is one the portal handles by itself.
	component?: Component;
	attach?: (host: HTMLDivElement) => void;
}

const appendToBody = (host: HTMLDivElement) => document.body.append(host);

// First match wins, so the catch-all search page has to come last.
const routes: Route[] = [
	{
		pattern: /outdoor\/packship\/CompleteReservations/,
		component: CompletedPage,
		attach: appendToBody,
	},
	{
		pattern: /outdoor\/packship\/Parcels/,
		component: CreateParcelsPage,
		attach: (host) => RVUtils.getParcelContainerParent()?.insertAdjacentElement("afterbegin", host),
	},
	{
		pattern: /outdoor\/packship\/Reservations\/Index\//,
		component: VerifyProductsPage,
		attach: appendToBody,
	},
	{
		pattern: /outdoor\/packship\/AddParcels\/Search\?ReservationNumber=/,
		matchQuery: true,
		component: AddParcelsPage,
		attach: appendToBody,
	},
	{
		pattern: /outdoor\/packship\/AnnounceParcels/,
	},
	{
		pattern: /outdoor\/packship/,
		component: SearchReservationsPage,
		attach: (host) => RVUtils.getContainer()?.append(host),
	},
];

Settings.load();

const path = window.location.pathname;
const pathWithQuery = path + window.location.search;

const route = routes.find((candidate) => candidate.pattern.test(candidate.matchQuery ? pathWithQuery : path));

if (route?.component && route.attach) {
	mountApp(route.component, route.attach);
}

mountApp(FooterExtension, appendToBody);

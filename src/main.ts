import * as Vue from 'vue';
import * as RVUtils from "./retailVistaUtils";
import SearchReservationsPage from './vue/pages/SearchReservationsPage.vue';
import VerifyProductsPage from './vue/pages/VerifyProductsPage.vue';
import CreateParcelsPage from './vue/pages/CreateParcelsPage.vue';
import CompletedPage from './vue/pages/CompletedPage.vue';
import AddParcelsPage from './vue/pages/AddParcelsPage.vue';
import FooterExtension from './vue/components/Footer.vue';
import Settings from "./settings.ts"
import "./style.css";

Settings.load();
const path = window.location.pathname;

switch(true) {
	case /bztrs\/packingportal\/CompleteReservations.*/.test(path):
		Vue.createApp(CompletedPage).mount(
			(() => {
				const app = document.createElement('div');
				document.body.append(app);
				return app;
			})(),
		);
	break;

	case /bztrs\/packingportal\/Parcels.*/.test(path):
		Vue.createApp(CreateParcelsPage).mount(
			(() => {
				const app = document.createElement('div');
				RVUtils.GetParcelContainerParent()?.insertAdjacentElement("afterbegin", app);
				return app;
			})(),
		);
		break;

	case /bztrs\/packingportal\/Reservations\/Index\/.*/.test(path):
		Vue.createApp(VerifyProductsPage).mount(
			(() => {
				const app = document.createElement('div');
				document.body.append(app);
				return app;
			})(),
		);
		break;

	case /bztrs\/packingportal\/AddParcels\/Search\?ReservationNumber=/.test(window.location.pathname + window.location.search):
		Vue.createApp(AddParcelsPage).mount(
			(() => {
				const app = document.createElement('div');
				document.body.append(app);
				return app;
			})(),
		);
		break;

	case /bztrs\/packingportal\/AnnounceParcels.*/.test(path):
		break;

	case /bztrs\/packingportal.*/.test(path):
		Vue.createApp(SearchReservationsPage).mount(
			(() => {
				const app = document.createElement('div');
				RVUtils.GetContainer()?.append(app);
				return app;
			})(),
		);
		break;
}

Vue.createApp(FooterExtension).mount(
  (() => {
    const app = document.createElement('div');
    document.body.append(app);
    return app;
  })(),
);
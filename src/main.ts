import { createApp } from 'vue';
import * as helperUtils from "./utilities.ts";
import PortalExtension from './vue/PortalExtension.vue';
import FooterExtension from './vue/FooterExtension.vue';
import ParcelsExtension from './vue/ParcelsExtension.vue';
import ReservationExtension from './vue/ReservationExtension.vue';


const path = window.location.pathname;

switch(true) {
	case /bztrs\/packingportal\/CompleteReservations.*/.test(path):
	break;

	case /bztrs\/packingportal\/Parcels.*/.test(path):
		createApp(ParcelsExtension).mount(
			(() => {
				const app = document.createElement('div');
				helperUtils.GetParcelContainerParent()?.insertAdjacentElement("afterbegin", app);
				return app;
			})(),
		);
		break;

	case /bztrs\/packingportal\/Reservations\/Index\/.*/.test(path):
		createApp(ReservationExtension).mount(
			(() => {
				const app = document.createElement('div');
				document.body.append(app);
				return app;
			})(),
		);
		break;

	case /bztrs\/packingportal\/AddParcels\/Search\?ReservationNumber=/.test(window.location.pathname + window.location.search):
		break;

	case /bztrs\/packingportal\/AnnounceParcels.*/.test(path):
		break;

	case /bztrs\/packingportal.*/.test(path):
		createApp(PortalExtension).mount(
			(() => {
				const app = document.createElement('div');
				helperUtils.GetContainer()?.append(app);
				return app;
			})(),
		);
		break;
}

createApp(FooterExtension).mount(
  (() => {
    const app = document.createElement('div');
    document.body.append(app);
    return app;
  })(),
);

//import "./script.ts";
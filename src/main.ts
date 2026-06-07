import { createApp } from 'vue';
import * as RVUtils from "./retailVistaUtils";
import PortalExtension from './vue/PortalExtension.vue';
import FooterExtension from './vue/components/Footer.vue';
import ParcelsExtension from './vue/ParcelsExtension.vue';
import ReservationExtension from './vue/ReservationExtension.vue';
import CompletedExtension from './vue/CompletedExtension.vue';
import AddParcelsExtension from './vue/AddParcelsExtension.vue';
import Settings from "./settings.ts"
import "./style.css";

const path = window.location.pathname;
Settings.load();
Settings.save();

switch(true) {
	case /bztrs\/packingportal\/CompleteReservations.*/.test(path):
		createApp(CompletedExtension).mount(
			(() => {
				const app = document.createElement('div');
				document.body.append(app);
				return app;
			})(),
		);
	break;

	case /bztrs\/packingportal\/Parcels.*/.test(path):
		createApp(ParcelsExtension).mount(
			(() => {
				const app = document.createElement('div');
				RVUtils.GetParcelContainerParent()?.insertAdjacentElement("afterbegin", app);
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
		createApp(AddParcelsExtension).mount(
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
		createApp(PortalExtension).mount(
			(() => {
				const app = document.createElement('div');
				RVUtils.GetContainer()?.append(app);
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
<script setup lang="ts">
import { onMounted, ref, Teleport, Transition } from 'vue';
import Modal from "../components/SettingsModal.vue";
import CredentialsPrompt from "../components/CredentialsPrompt.vue";
import pkg from "../../../package.json";
import powerIconUrl from "../../assets/power.svg";
import Settings from '../../settings.ts';
import { getCurrentUser, onCurrentUserChange } from '../../currentUser.ts';
import { FOOTER_SLOT_SELECTOR } from '../../constants.ts';
import { hasCredentials } from '../../shopware.ts';

const show = ref(false);
const showModal = ref(false);

const masterSwitch = ref(Settings.autoMasterSwitch);

// Without client credentials every Shopware call fails, so an empty store is
// asked about up front rather than left to surface as a failed order lookup.
// "Later" only holds for this page: the next load asks again, which is the
// point -- the script cannot do its work until the pair is there.
const showCredentialsPrompt = ref(!hasCredentials());

// Undefined when no login has been observed, in which case the badge stays
// hidden rather than guessing.
const currentUser = ref(getCurrentUser());
onCurrentUserChange((user) => currentUser.value = user);

onMounted(() => {
	show.value = true;
});

// Picked up again after the modal saves, which may have flipped it. 
function syncMasterSwitch() {
	masterSwitch.value = Settings.autoMasterSwitch;

	// The settings modal holds the same two fields, so filling them in there
	// settles the prompt as well.
	showCredentialsPrompt.value = !hasCredentials();
}

// Not entirely happy with this but works. 
function masterSwitchToggle() {
	Settings.autoMasterSwitch = !Settings.autoMasterSwitch;
	Settings.save();

	masterSwitch.value = Settings.autoMasterSwitch;
}
</script>

<template>
	<!-- Everything here reads from the GM value store, so it renders complete on
	     the first try, and it is mounted as soon as the footer slot is parsed
	     rather than at DOM-ready. -->
	<Teleport :to="FOOTER_SLOT_SELECTOR">
		<Transition>
			<button v-if="show" type="button" class="toggle-button" @click="masterSwitchToggle()">
				<img :src="powerIconUrl" :class="masterSwitch ? 'power-button-icon-on' : 'power-button-icon-off'" />
			</button>
		</Transition>
		<Transition>
			<div v-if="show && currentUser" class="col ml-2 current-user" :title="`Ingelogd sinds ${new Date(currentUser.loggedInAt).toLocaleString('nl-NL')}`">
				Ingelogd als <b>{{ currentUser.userName }}</b>
			</div>
		</Transition>
		<Transition>
			<div v-if="show" class="col ml-2">Pack&Ship Extended Versie {{ pkg.version }}</div>
		</Transition>
		<Transition>
			<button v-if="show" type="button" class="nav-link btn btn-link remove-padding col ml-3"
				@click="showModal = true;">Instellingen</button>
		</Transition>
	</Teleport>

	<Teleport to="body">
		<!-- Named, so the modal fades instead of taking the default vertical
		     collapse that suits the small footer items. -->
		<Transition name="modal">
			<Modal v-if="showModal" @close="showModal = false" @save="syncMasterSwitch()" />
		</Transition>

		<Transition name="modal">
			<CredentialsPrompt v-if="showCredentialsPrompt && !showModal"
				@saved="showCredentialsPrompt = false" @dismiss="showCredentialsPrompt = false" />
		</Transition>
	</Teleport>
</template>

<style scoped>
.current-user {
	white-space: nowrap;
	color: #689f69;
}

.toggle-button {
	background-color: transparent;
	border: none;
	margin-top: -5px;
	padding-left: 10px;
}

.toggle-button:hover,
.toggle-button:active,
.toggle-button:focus {
	outline: none;
	box-shadow: none;
}

.power-button-icon-on {
	filter: invert(79%) sepia(44%) saturate(550%) hue-rotate(67deg) brightness(92%) contrast(99%);
}

.power-button-icon-off {
	filter: invert(67%) sepia(17%) saturate(6115%) hue-rotate(316deg) brightness(91%) contrast(99%);
}
</style>
<script setup lang="ts">
import { ref } from "vue";
import closeIconUrl from "../../assets/close.svg";
import saveIconUrl from "../../assets/save.svg";
import { Settings } from "../../settings";

const savedData = Settings.loadData();

console.log(savedData);

const isEnabled = ref(savedData.enabled);
const useAutoComplete = ref(savedData.proceed);
const useAutoSelect = ref(savedData.proceed);
const useAddButtons = ref(savedData.addButtons);

function onSave() {
	Settings.saveData({
		enabled: isEnabled.value, 
		proceed: useAutoComplete.value, 
		addButtons: useAddButtons.value
	});
}
</script>

<template>
	<div class="settings-modal">
		<div class="settings-modal-content">
			<button class="close-button" @click="$emit('close')">
				<img :src="closeIconUrl" width="50" height="50" />
			</button>
			<h3>Pack&Ship Extended Instellingen</h3>
			
			<div class="settings-modal-content-options">
				<input type="checkbox" id="isEnabled" v-model="isEnabled">
				<label class="setting-label" for="isEnabled">Script ingeschakeld</label><br>
				
				<input type="checkbox" id="useAutoComplete" v-model="useAutoComplete">
				<label class="setting-label" for="useAutoComplete">Automatisch voltooien</label><br>
				
				<input type="checkbox" id="useAutoSelect" v-model="useAutoSelect">
				<label class="setting-label" for="useAutoSelect">Automatisch reservering selecteren</label><br>
				
				<input type="checkbox" id="useAddButtons" v-model="useAddButtons">
				<label class="setting-label" for="useAddButtons">Toevoeg knoppen</label><br>
				
				<button class="save-button" @click="onSave(); $emit('save'); $emit('close')">
					Opslaan
					<img :src="saveIconUrl" width="35" height="35" class="save-icon"/>
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.settings-modal {
	position: absolute;
    width: 100% !important;
    height: 100% !important;
    left: 0;
    top: 0;
    background: rgba(51,51,51,0.7);
    z-index: 100;
	background-color: rgba(0, 0, 0, 0.5);
}

.settings-modal-content {
	position: relative;
	background-color: rgb(255, 255, 255);
	min-width: 550px;
	min-height: 300px;
	width: 550px;
	height: 400px;
	max-width: 95%;
	max-height: 95%;
	top: 50%;
	justify-self: center;
	-webkit-transform: translateY(-50%);
	-ms-transform: translateY(-50%);
	transform: translateY(-50%);
	padding: 25px;
	font-size: 16px;
	border-radius: 15px;
}

.settings-modal-content-options {
	margin-top: 20px;
	margin-left: 20px;
}

.close-button {
	position: absolute;
	top: 20px;
	right: 15px;
	border: 0;
	width: 50;
	height: 50;
	background-color: transparent;
}

.save-button {
	position: absolute;
	right: 25px;
	bottom: 25px;
	width: 125px;
	height: 45px;
	background-color: #689f69;
	border-radius: 8px;
	border-style: none;
	box-sizing: border-box;
	color: #FFFFFF;
	transition: color 100ms;
	font-weight: 700;
	font-size: 16px;
}

.save-button:hover,
.save-button:focus {
  background-color: #537f5f;
}

.save-icon {
	filter: invert(1);
}

.setting-label {
	padding-left: 10px;
	justify-content: center;
}

input {
    vertical-align: -4px;
}
</style>
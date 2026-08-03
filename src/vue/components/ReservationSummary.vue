<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ShopwareLogoIconUrl from "../../assets/shopware.svg";

import * as Shopware from "../../shopware.ts";
import { saveOrderComment } from '../../shopwareComments.ts';
import { SHOPWARE_URL } from '../../constants.ts';
import { getCurrentOrderNumber, matchShopwareOrderNumber } from '../../retailVistaUtils.ts';

const show = ref(false);
const swCommentData = ref<string>();
const swOrderData = ref();

let saveTimeoutId: number;
const swCommentBoxEnabled = ref(false);

const swToken = ref<Shopware.ShopwareToken>();

onMounted(() => {
	show.value = true;

	if (renderComment()) {
		retrieveCommentData();
	}
})

function renderComment(): boolean {
	return matchShopwareOrderNumber(getCurrentOrderNumber());
}

function retrieveCommentData() {
	Shopware.shopwareInitialize().then(async (token) => {
		swToken.value = token;

		swOrderData.value = await Shopware.shopwareGetOrderData(token, getCurrentOrderNumber());
		swCommentData.value = swOrderData.value.data[0].customerComment ?? "";

		swCommentBoxEnabled.value = true;
	});
}

function onSaveButtonClick() {
	const orderNumber = getCurrentOrderNumber();
	swOrderData.value.data[0].customerComment = swCommentData.value;

	if (swToken.value) {
		saveOrderComment(swToken.value, swOrderData.value.data[0], orderNumber);
	}

	swCommentBoxEnabled.value = false;
	if (saveTimeoutId) { clearTimeout(saveTimeoutId) }
	saveTimeoutId = setTimeout(() => {
		swCommentBoxEnabled.value = true;
	}, 250);
}

function onOpenButtonClick() {
	window.open(`${SHOPWARE_URL}/admin#/sw/order/detail/${swOrderData.value.data[0].id}/general`, "_blank")!.focus();
}

function hasComment() {
	if (swCommentData && swCommentData.value && swCommentData.value != "") {
		return true;
	}
}
</script>

<template>
	<div v-if="renderComment()">
		<Transition>
			<div v-show="show" class="summary-wrapper">
				<Transition>
					<div class="mt-2 alert alert-info comment-alert" v-show="hasComment()">
						<b>Let op!</b> Er is een shopware notitie.
					</div>
				</Transition>
				<div class="card sw-card" v-show="show">
					<div class="card-header sw-header">
						<img :src="ShopwareLogoIconUrl" class="sw-logo" />
						<h4 class="sw-title">Shopware Notitie</h4>
					</div>
					<div class="sw-body">
						<div class="card-body sw-body sw-content">
							<div class="loader summary-loader" v-show="!swCommentBoxEnabled"></div>
							<textarea class="sw-textarea" :disabled="!swCommentBoxEnabled"
								v-model="swCommentData"
								:placeholder="swCommentBoxEnabled ? 'Nog geen notitie...' : ''"></textarea>
							<button class="sw-btn" type="button" @click="onOpenButtonClick()"
								:disabled="!swCommentBoxEnabled">Open</button>
							<button class="sw-btn btn-right" type="button" @click="onSaveButtonClick()"
								:disabled="!swCommentBoxEnabled">Opslaan</button>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.sw-card {
	min-width: 260px;
}

.sw-title {
	line-height: 22px;
}

.sw-btn {
	width: 100px;
}

.sw-textarea {
	min-height: 50px;
	font-size: 24px;
}

.btn-right {
	float: right;
}

.summary-wrapper {
	position: relative;
	right: 30px;
	margin-top: 32px;
}

.summary-loader {
	position: relative;
	margin-top: -30px;
	top: 45px;
	line-height: 20px;
	justify-self: center;
}

.comment-alert {
	animation: blink 0.75s infinite;
	min-width: 260px;
	text-align: center;
	font-size: 24px;
	max-width: 100%;
	color: #7f5353;
	background-color: #f6efef;
	border-color: #7f5353;
}
</style>

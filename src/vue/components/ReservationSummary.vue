<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ShopwareLogoIconUrl from "../../assets/shopware.svg";

import * as Shopware from "../../shopware.ts";
import { getCurrentOrderNumber, matchShopwareOrderNumber } from '../../retailVistaUtils.ts';

const show = ref(false);
const swCommentData = ref<string>();
const swOrderData = ref();

let saveTimeoutId:number;
const swCommentBoxEnabled = ref(false);

const swToken = ref();

onMounted(() => {
    show.value = true;

    if (renderComment()) {
        retrieveCommentData();
    }
})

function renderComment():boolean {
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
    swOrderData.value.data[0].customerComment = swCommentData.value;
    
    if (swToken) {
        Shopware.shopwareUpdateOrderComment(swToken.value, swOrderData.value.data[0]);
    }

    swCommentBoxEnabled.value = false;
    if (saveTimeoutId) { clearTimeout(saveTimeoutId) }
    saveTimeoutId = setTimeout(() => {
        swCommentBoxEnabled.value = true;
    }, 250);
}

function onOpenButtonClick() {
    window.open("https://www.kampeerhalroden.nl/admin#/sw/order/detail/" + swOrderData.value.data[0].id + "/general", "_blank")!.focus();
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
            <div style="position: relative; right: 30px; margin-top: 32px;">
                <Transition>
                    <div class="mt-2 alert alert-info comment-alert" style="text-align: center; font-size: 24px; max-width:100%;color: #7f5353;background-color: #f6efef;border-color: #7f5353;" v-show="hasComment()" ><b>Let op!</b> Er is een shopware notitie.</div>
                </Transition>
                <div class="card sw-card" v-show="show">
                    <div class="card-header sw-header">
                        <img :src="ShopwareLogoIconUrl" style="float: left; width: 25px; height: 25px; margin-right: 8px;" /><h4 style="line-height: 22px;">Shopware Notitie</h4>
                    </div>
                    <div class="sw-body">
                        <div class="card-body sw-body sw-content">
                            <div class="loader" style="position: relative; margin-top: -30px; top: 45px; line-height: 20px; justify-self: center;" v-show="!swCommentBoxEnabled" ></div>
                            <textarea class="text-box sw-textarea":disabled="!swCommentBoxEnabled" v-model="swCommentData" placeholder="Nog geen notitie..." ></textarea>
                            <button class="sw-btn" type="button" @click="onOpenButtonClick()" :disabled="!swCommentBoxEnabled">Open</button>
                            <button class="sw-btn btn-right" type="button" @click="onSaveButtonClick()" :disabled="!swCommentBoxEnabled">Opslaan</button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease, transform 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.text-box {
    width: 100%;
    min-height: 50px;
    font-size: 24px;
    border-color: rgb(206, 206, 206);
    border-radius: 3px;
}
.button-footer {
    padding-top: 5px;
}
.btn-right {
    float: right;
}

.sw-btn {
    width: 100px;
	height: 35px;
	background-color: #189eff;

    transition: all .15s ease-out;
    display: inline-block;
    border-radius: 4px;
    padding: 2px 24px;
    font-size: 14px;
    outline: none;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: middle;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    margin: 0;
    position: relative;

	background: #189eff;
    color: #fff;
    line-height: 32px;
    border: 0;
	margin: 3px;
}

.sw-btn:hover {
    background: #118cff;
}

.sw-btn:active {
	background: #0e82ff;
}

.sw-btn:disabled:hover,
.sw-btn:disabled {
	background: #727272;
}

.sw-header {
	background-color: #243758;
	color: #fff;
}

.sw-body {
	background-color: #f9fafb;
	border-color: #d1d9e0;
    padding: 5px;
}

.sw-textarea {
	field-sizing: content;
	width: 100%;
	margin-top: 4px;
	padding-left: 5px;
	font-size: 24px;
	border: 1px solid #d1d9e0;
}

.sw-card {
    min-width: 260px;
}

.loader {
  width: 60px;
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side,#d1d9e0 90%,#0000);
  background: 
    var(--_g) 0%   50%,
    var(--_g) 50%  50%,
    var(--_g) 100% 50%;
  background-size: calc(100%/3) 50%;
  animation: l3 1s infinite linear;
}
@keyframes l3 {
    20%{background-position:0%   0%, 50%  50%,100%  50%}
    40%{background-position:0% 100%, 50%   0%,100%  50%}
    60%{background-position:0%  50%, 50% 100%,100%   0%}
    80%{background-position:0%  50%, 50%  50%,100% 100%}
}

.comment-alert {
    animation: blink 0.75s infinite;
    min-width: 260px;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
  100% {
    opacity: 1;
  }
}
</style>
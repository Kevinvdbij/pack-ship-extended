<script setup lang="ts">
import { onMounted, ref } from 'vue';

const show = ref(false);

onMounted(() => {
    show.value = true;
})
</script>

<template>
    <Transition>
        <div class="card card-comment" v-show="show">
            <div class="card-header sw-header">
                <h4 class="card-title">Shopware Comment</h4>
            </div>
            <div class="card-body sw-body">
				<div class="card-body sw-content">
					<textarea class="text-box"></textarea>
					
					<button class="sw-btn button">Open</button>
					<button class="sw-btn button btn-right">Opslaan</button>
				</div>
            </div>
        </div>
    </Transition>
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

.card-body {
    padding: 10px;
}
.text-box {
    width: 100%;
    height: 150px;
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
.button {
    width: 100px;
}

.card-comment{
    margin-top: 25px;
    right: 20px;
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

.sw-header {
	background-color: #243758;
	color: #fff;
}

.sw-body {
	background-color: #f9fafb;
	border-color: #d1d9e0;
}

.sw-textarea {
	field-sizing: content;
	min-height: 34px;
	width: 100%;
	margin-top: 4px;
	padding-left: 5px;
	font-size: 18px;
	border: 1px solid #d1d9e0;
}
</style>
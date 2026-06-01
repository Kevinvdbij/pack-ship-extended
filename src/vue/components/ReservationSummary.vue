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
            <div class="card-header">
                <h4 class="card-title">Shopware Comment</h4>
            </div>
            <div class="card-body">
                <textarea class="text-box"></textarea>
                
                <div class="button-footer">
                    <button class="btn btn-primary button">Open</button>
                    <button class="btn btn-primary btn-right button">Opslaan</button>
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
</style>
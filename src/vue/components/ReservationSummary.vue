<script setup lang="ts">

</script>

<template>
    <div class="card">
        <div class="card-body">
            <textarea class="text-box">
                
            </textarea>

            <div class="button-footer">
                <button class="btn btn-primary">Save</button>
                <button class="btn btn-primary btn-right" style="right: 0px;">Open</button>
            </div>
        </div>
    </div>
</template>

<style>
.card-body {
    padding: 0px;
}
.text-box {
    width: 100%;
}
.button-footer {
    padding: 5px;
    padding-top: 0px;
}
.btn-right {
    align-items: end;
    right: 15px;
}
</style>
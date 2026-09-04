<script setup lang="ts">
import { clearCurrentUser } from '../../currentUser.ts';

// The portal shows this page both before (with a confirm button) and after
// signing out. Clearing on either is safe: the worst case for someone who
// backs out is an empty badge until their next login, never a wrong name.
clearCurrentUser();
</script>

<template />

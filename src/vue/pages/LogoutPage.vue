<script setup lang="ts">
import { clearCurrentUser } from '../../currentUser.ts';
import { erpLogout } from '../../erpSession.ts';
import { clearPendingLogout } from '../../idleLogout.ts';

// The portal shows this page both before (with a confirm button) and after
// signing out. Clearing on either is safe: the worst case for someone who
// backs out is an empty badge until their next login, never a wrong name.
clearCurrentUser();
clearPendingLogout();

// The ERP session goes with the portal's. Same reasoning as the name: someone
// who backs out of the confirm is asked for a password the next time they press
// a bay, which is a moment's inconvenience; someone who does not is one fewer
// session left behind for the next person on this station. See `erpLogout()`.
erpLogout();
</script>

<template />

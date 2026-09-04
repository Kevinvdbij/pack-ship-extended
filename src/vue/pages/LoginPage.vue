<script setup lang="ts">
import { clearCurrentUser, setCurrentUser } from '../../currentUser.ts';

// Landing on this page means there is no usable session: a fresh visit, a
// rejected login (the portal re-renders this page) or an expiry redirect. Drop
// whatever name was stored so nothing stale can outlive the session.
clearCurrentUser();

// Store the submitted name. If the login is rejected the page reloads and the
// clear above runs again, so only a successful login leaves a name behind.
const form = document.querySelector<HTMLFormElement>("form#account");

form?.addEventListener("submit", () => {
	const userName = form.querySelector<HTMLInputElement>("#Input_UserName")?.value.trim();
	const companyNumber = form.querySelector<HTMLInputElement>("#Input_CompanyNumber")?.value.trim() ?? "";

	if (userName) {
		setCurrentUser({ userName, companyNumber, loggedInAt: Date.now() });
	} else {
		clearCurrentUser();
	}
});
</script>

<template />

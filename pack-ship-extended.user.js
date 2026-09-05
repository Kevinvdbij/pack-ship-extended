// ==UserScript==
// @name         Pack&Ship Extended
// @namespace    npm/vite-plugin-monkey
// @version      1.0.34
// @description  Extension for the RetailVista Pack&Ship application with plenty of QOL improvements.
// @license      MIT
// @icon         https://www.kampeerhalroden.nl/media/e9/9d/08/1703346720/favicon.ico
// @match        https://retailvista.net/outdoor/packship*
// @connect      update.greasyfork.org
// @grant        GM.openInTab
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_deleteValue
// @grant        GM_deleteValues
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function() {
	"use strict";
	var s = new Set();
	var _css = async (t) => {
		if (s.has(t)) return;
		s.add(t);
		((c) => {
			if (typeof GM_addStyle === "function") GM_addStyle(c);
			else (document.head || document.documentElement).appendChild(document.createElement("style")).append(c);
		})(t);
	};
	_css(" .pse-modal[data-v-66d77727]{z-index:100;background-color:var(--pse-scrim);-webkit-backdrop-filter:blur(3px);text-align:left;color:var(--pse-ink);justify-content:center;align-items:center;padding:28px 20px;display:flex;position:fixed;inset:0}.pse-modal[data-v-66d77727] *{box-sizing:border-box}.is-elevated[data-v-66d77727]{z-index:200}.pse-modal-panel[data-v-66d77727]{box-sizing:border-box;border-radius:var(--pse-dialog-radius);width:100%;max-height:100%;box-shadow:var(--pse-dialog-shadow);background-color:#fff;flex-direction:column;display:flex}.is-sm[data-v-66d77727]{max-width:420px}.is-md[data-v-66d77727]{max-width:560px}.is-lg[data-v-66d77727]{max-width:780px}.is-xl[data-v-66d77727]{max-width:1000px}.pse-modal-head[data-v-66d77727]{border-bottom:1px solid var(--pse-line);flex:none;align-items:center;gap:16px;padding:17px 20px;display:flex}.pse-modal-title[data-v-66d77727]{min-width:0;color:var(--pse-ink);flex:1;margin:0;font-size:16px;font-weight:650;line-height:1.3}.pse-modal-close[data-v-66d77727]{width:32px;height:32px;color:var(--pse-ink-faint);cursor:pointer;background-color:#0000;border:0;border-radius:9px;flex:none;justify-content:center;align-items:center;padding:0;transition:background-color .15s,color .15s;display:flex}.pse-modal-close[data-v-66d77727]:hover{background-color:var(--pse-well);color:var(--pse-ink)}.pse-modal-close[data-v-66d77727]:focus{outline:none}.pse-modal-close[data-v-66d77727]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-modal-body[data-v-66d77727]{flex:1;min-height:0;padding:20px;font-size:14px;line-height:1.5;overflow-y:auto}.pse-modal-foot[data-v-66d77727]{border-top:1px solid var(--pse-line);flex:none;justify-content:flex-end;align-items:center;gap:9px;padding:15px 20px;display:flex}@media (width<=640px){.pse-modal[data-v-66d77727]{padding:16px 12px}.pse-modal-head[data-v-66d77727],.pse-modal-body[data-v-66d77727],.pse-modal-foot[data-v-66d77727]{padding-left:16px;padding-right:16px}}.pse-note[data-v-469a4fde]{text-align:left}.pse-note-alert[data-v-469a4fde]{color:#8a5a10;background-color:#e2a02e1c;border:1px solid #b4761452;border-left-width:3px;border-radius:12px;align-items:flex-start;gap:9px;margin:0 0 12px;padding:11px 13px;font-size:13px;font-weight:600;line-height:1.4;animation:2.4s ease-in-out infinite pse-note-breathe-469a4fde;display:flex}.pse-note-alert-icon[data-v-469a4fde]{flex:none;font-size:18px;line-height:1.2}@keyframes pse-note-breathe-469a4fde{50%{background-color:#e2a02e3d;border-color:#b47614bf}}.pse-note-card[data-v-469a4fde]{border:1px solid var(--pse-line);background-color:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px #1430210a}.pse-note-head[data-v-469a4fde]{border-bottom:1px solid var(--pse-line);background-color:var(--pse-well);align-items:center;gap:9px;padding:10px 14px;display:flex}.pse-note-logo[data-v-469a4fde]{filter:grayscale()brightness(.72);flex:none;width:18px;height:18px}.pse-note-title[data-v-469a4fde]{letter-spacing:.06em;text-transform:uppercase;color:var(--pse-ink-faint);margin:0;font-size:10.5px;font-weight:650;line-height:1.6}.pse-note-body[data-v-469a4fde]{padding:12px 14px 14px}.pse-note-field[data-v-469a4fde]{box-sizing:border-box;border:1px solid var(--pse-line);background-color:var(--pse-well);field-sizing:content;width:100%;min-height:76px;max-height:260px;font:inherit;color:var(--pse-ink);resize:vertical;border-radius:10px;margin:0;padding:9px 11px;font-size:14px;line-height:1.45;transition:border-color .15s,background-color .15s,box-shadow .15s;display:block}.pse-note-field[data-v-469a4fde]::placeholder{color:var(--pse-ink-faint)}.pse-note-field[data-v-469a4fde]:focus{border-color:var(--pse-brand);box-shadow:0 0 0 3px var(--pse-brand-ring);background-color:#fff;outline:none}.pse-note-field[data-v-469a4fde]:disabled{color:var(--pse-ink-soft);cursor:default}.pse-note-field-waiting[data-v-469a4fde]{resize:none;flex-direction:column;justify-content:center;gap:9px;display:flex}.pse-note-shimmer[data-v-469a4fde]{background-color:var(--pse-line);border-radius:5px;height:10px;animation:1.4s ease-in-out infinite pse-note-pulse-469a4fde}.pse-note-shimmer-short[data-v-469a4fde]{width:62%;animation-delay:.2s}@keyframes pse-note-pulse-469a4fde{50%{opacity:.45}}.pse-note-actions[data-v-469a4fde]{gap:8px;margin-top:10px;display:flex}.pse-note-btn[data-v-469a4fde]{background-color:var(--pse-brand-ink);min-width:0;height:36px;font:inherit;color:#fff;white-space:nowrap;text-overflow:ellipsis;cursor:pointer;border:1px solid #0000;border-radius:10px;flex:1;padding:0 12px;font-size:13px;font-weight:650;transition:background-color .15s,border-color .15s,color .15s;overflow:hidden}.pse-note-btn[data-v-469a4fde]:hover:not(:disabled){background-color:var(--pse-brand-ink-strong)}.pse-note-btn[data-v-469a4fde]:focus{outline:none}.pse-note-btn[data-v-469a4fde]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-note-btn[data-v-469a4fde]:disabled{color:#fff;cursor:not-allowed;background-color:#dfe6e2}.pse-note-btn-quiet[data-v-469a4fde]{border-color:var(--pse-line);color:var(--pse-ink-soft);background-color:#fff}.pse-note-btn-quiet[data-v-469a4fde]:hover:not(:disabled){border-color:var(--pse-brand);background-color:var(--pse-brand-soft);color:var(--pse-brand-ink)}.pse-note-btn-quiet[data-v-469a4fde]:disabled{border-color:var(--pse-line);color:var(--pse-ink-faint);background-color:#fff}@media (prefers-reduced-motion:reduce){.pse-note-alert[data-v-469a4fde]{background-color:#e2a02e3d;border-color:#b47614bf;animation:none}.pse-note-shimmer[data-v-469a4fde]{animation:none}}.pse-rescard[data-v-99ff8266]{border:1px solid var(--pse-line);background-color:#fff;border-radius:16px;transition:border-color .15s,box-shadow .15s;overflow:hidden}.pse-rescard+.pse-rescard[data-v-99ff8266]{margin-top:10px}.pse-rescard[data-v-99ff8266]:not(.is-incomplete):hover{border-color:var(--pse-brand);box-shadow:0 1px 2px #1430210a,0 14px 30px -24px #14302180}.pse-rescard-head[data-v-99ff8266]{background-color:var(--pse-well);border-bottom:1px solid var(--pse-line);align-items:center;gap:20px;padding:13px 16px;display:flex}.pse-rescard-id[data-v-99ff8266]{flex:none;min-width:108px}.pse-rescard-number[data-v-99ff8266]{font-variant-numeric:tabular-nums;color:var(--pse-ink);font-size:17px;font-weight:700;line-height:1.2;display:block}.pse-rescard-reference[data-v-99ff8266]{font-variant-numeric:tabular-nums;color:var(--pse-ink-soft);margin-top:1px;font-size:12px;display:block}.pse-rescard-facts[data-v-99ff8266]{flex:1;gap:26px;min-width:0;margin:0;display:flex}.pse-rescard-fact[data-v-99ff8266]{min-width:0}.pse-rescard-fact dt[data-v-99ff8266]{letter-spacing:.06em;text-transform:uppercase;color:var(--pse-ink-faint);margin:0;font-size:10.5px;font-weight:650}.pse-rescard-fact dd[data-v-99ff8266]{white-space:nowrap;text-overflow:ellipsis;color:var(--pse-ink);margin:2px 0 0;font-size:13.5px;font-weight:600;overflow:hidden}.pse-rescard-open[data-v-99ff8266]{background-color:var(--pse-brand-ink);height:36px;font:inherit;color:#fff;cursor:pointer;border:0;border-radius:10px;flex:none;align-items:center;gap:2px;padding:0 10px 0 15px;font-size:13.5px;font-weight:650;transition:background-color .15s;display:inline-flex}.pse-rescard-open[data-v-99ff8266]:hover{background-color:var(--pse-brand-ink-strong)}.pse-rescard-open[data-v-99ff8266]:focus{outline:none}.pse-rescard-open[data-v-99ff8266]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-rescard-open-icon[data-v-99ff8266]{font-size:18px}.pse-rescard-products[data-v-99ff8266]{overflow-x:auto}.pse-rescard-amount[data-v-99ff8266]{font-variant-numeric:tabular-nums;white-space:nowrap;border-radius:8px;padding:2px 9px;font-size:13px;font-weight:600;display:inline-block}.pse-table tbody tr.is-short td[data-v-99ff8266]{background-color:var(--pse-attention-wash-strong);border-top-color:var(--pse-attention-line-soft)}.pse-table tbody tr.is-short .pse-rescard-amount[data-v-99ff8266]{color:var(--pse-attention-ink);font-weight:700}.pse-rescard-note[data-v-99ff8266]{border-top:1px solid var(--pse-line);padding:14px 16px}@media (width<=720px){.pse-rescard-head[data-v-99ff8266]{flex-wrap:wrap;gap:12px 20px}.pse-rescard-facts[data-v-99ff8266]{flex-basis:100%;order:1;gap:18px}.pse-rescard-open[data-v-99ff8266]{margin-left:auto}}.pse-row[data-v-51c20dba]{border-top:1px solid var(--pse-line);grid-template-columns:auto minmax(0,1.4fr) minmax(0,1fr) auto;align-items:center;gap:16px;padding:11px 16px;font-size:14px;transition:background-color .15s;display:grid}.pse-row[data-v-51c20dba]:first-child{border-top:0}.pse-row[data-v-51c20dba]:hover{background-color:var(--pse-well)}.pse-row-number[data-v-51c20dba]{font-variant-numeric:tabular-nums;color:var(--pse-ink);font-weight:650}.pse-row-customer[data-v-51c20dba],.pse-row-reference[data-v-51c20dba]{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.pse-row-customer[data-v-51c20dba]{color:var(--pse-ink)}.pse-row-reference[data-v-51c20dba]{font-variant-numeric:tabular-nums;color:var(--pse-ink-soft);font-size:13px}.pse-row-open[data-v-51c20dba]{border:1px solid var(--pse-line);height:32px;font:inherit;color:var(--pse-ink-soft);cursor:pointer;background-color:#fff;border-radius:9px;align-items:center;gap:2px;padding:0 8px 0 12px;font-size:13px;font-weight:650;transition:border-color .15s,background-color .15s,color .15s;display:inline-flex}.pse-row:hover .pse-row-open[data-v-51c20dba]{border-color:var(--pse-brand);background-color:var(--pse-brand-soft);color:var(--pse-brand-ink)}.pse-row-open[data-v-51c20dba]:focus{outline:none}.pse-row-open[data-v-51c20dba]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-row-open-icon[data-v-51c20dba]{font-size:18px}.pse-row-state[data-v-51c20dba]{white-space:nowrap;border-radius:999px;align-items:center;gap:7px;padding:4px 11px;font-size:12.5px;font-weight:650;display:inline-flex}.pse-row-mark[data-v-51c20dba]{background-color:currentColor;border-radius:50%;flex:none;width:7px;height:7px}.pse-row-state.is-queued[data-v-51c20dba]{background-color:var(--pse-well);color:var(--pse-ink-faint)}.pse-row-state.is-stopped[data-v-51c20dba]{background-color:var(--pse-well);color:var(--pse-ink-soft)}.pse-row-state.is-busy[data-v-51c20dba]{color:#8a5a10;background-color:#e2a02e29}.pse-row-state.is-busy .pse-row-mark[data-v-51c20dba]{animation:1.6s ease-in-out infinite pse-row-pulse-51c20dba}@keyframes pse-row-pulse-51c20dba{50%{opacity:.3}}.pse-row-state.is-done[data-v-51c20dba]{background-color:var(--pse-brand-soft);color:var(--pse-brand-ink)}.pse-row-state.is-failed[data-v-51c20dba]{background-color:var(--pse-alert-soft);color:var(--pse-alert-ink)}.pse-row.is-failed[data-v-51c20dba]{background-color:var(--pse-alert-wash)}@media (prefers-reduced-motion:reduce){.pse-row-state.is-busy .pse-row-mark[data-v-51c20dba]{animation:none}}@media (width<=720px){.pse-row[data-v-51c20dba]{grid-template-columns:auto minmax(0,1fr) auto;gap:12px}.pse-row-reference[data-v-51c20dba]{display:none}}.pse-mc[data-v-5c92f516]{border:1px solid var(--pse-line);background-color:var(--pse-well);border-radius:14px;margin-bottom:12px;padding:15px 17px;transition:border-color .2s,background-color .2s}.pse-mc.is-running[data-v-5c92f516]{background-color:#e2a02e12;border-color:#e2a02e66}.pse-mc.is-done[data-v-5c92f516]{border-color:var(--pse-brand);background-color:var(--pse-brand-soft)}.pse-mc.is-stopped[data-v-5c92f516]{border-color:var(--pse-alert-soft);background-color:var(--pse-alert-wash)}.pse-mc.is-stopped .pse-mc-icon[data-v-5c92f516]{border-color:var(--pse-alert-soft);color:var(--pse-alert-ink)}.pse-mc.is-stopped .pse-mc-progress-fill[data-v-5c92f516]{background-color:var(--pse-alert)}.pse-mc-head[data-v-5c92f516]{align-items:center;gap:13px;display:flex}.pse-mc-icon[data-v-5c92f516]{border:1px solid var(--pse-line);width:36px;height:36px;color:var(--pse-brand-ink);background-color:#fff;border-radius:11px;flex:none;justify-content:center;align-items:center;display:flex}.pse-mc.is-running .pse-mc-icon[data-v-5c92f516]{color:#8a5a10;border-color:#e2a02e66}.pse-mc-titles[data-v-5c92f516]{flex:1;min-width:0}.pse-mc-title[data-v-5c92f516]{color:var(--pse-ink);margin:0;font-size:14.5px;font-weight:650;line-height:1.3}.pse-mc-subtitle[data-v-5c92f516]{color:var(--pse-ink-soft);margin:3px 0 0;font-size:12.5px;line-height:1.4}.pse-mc-controls[data-v-5c92f516]{flex:none;align-items:center;gap:10px;display:flex}.pse-mc-stepper[data-v-5c92f516]{border:1px solid var(--pse-line);background-color:#fff;border-radius:11px;align-items:center;height:40px;display:flex;overflow:hidden}.pse-mc-step[data-v-5c92f516]{width:34px;height:100%;font:inherit;color:var(--pse-ink-soft);cursor:pointer;background-color:#0000;border:0;padding:0;font-size:17px;line-height:1;transition:background-color .15s,color .15s}.pse-mc-step[data-v-5c92f516]:hover:not(:disabled){background-color:var(--pse-brand-soft);color:var(--pse-brand-ink)}.pse-mc-step[data-v-5c92f516]:disabled{color:var(--pse-line);cursor:not-allowed}.pse-mc-step[data-v-5c92f516]:focus{outline:none}.pse-mc-step[data-v-5c92f516]:focus-visible{box-shadow:inset 0 0 0 2px var(--pse-brand-ring);outline:none}.pse-mc-amount[data-v-5c92f516]{border:0;border-left:1px solid var(--pse-line);border-right:1px solid var(--pse-line);width:46px;height:100%;font:inherit;font-variant-numeric:tabular-nums;text-align:center;color:var(--pse-ink);background-color:#0000;padding:0;font-size:15px;font-weight:650}.pse-mc-amount[data-v-5c92f516]:focus{background-color:var(--pse-brand-soft);outline:none}.pse-mc-amount[data-v-5c92f516]::-webkit-inner-spin-button{appearance:none;margin:0}.pse-mc-amount[data-v-5c92f516]::-webkit-outer-spin-button{appearance:none;margin:0}.pse-mc-start[data-v-5c92f516]{flex:none}.pse-mc-tally[data-v-5c92f516]{flex:none;align-items:baseline;gap:6px;display:flex}.pse-mc-tally-count[data-v-5c92f516]{font-variant-numeric:tabular-nums;color:var(--pse-ink);font-size:20px;font-weight:700;line-height:1}.pse-mc-tally-of[data-v-5c92f516]{color:var(--pse-ink-faint);font-size:14px;font-weight:650}.pse-mc-tally-label[data-v-5c92f516]{color:var(--pse-ink-soft);font-size:12px}.pse-mc-progress[data-v-5c92f516]{background-color:#142b2214;border-radius:999px;height:6px;margin-top:13px;overflow:hidden}.pse-mc-progress-fill[data-v-5c92f516]{background-color:var(--pse-brand);border-radius:999px;height:100%;transition:width .4s cubic-bezier(.2,.9,.3,1)}@media (width<=720px){.pse-mc.is-stopped[data-v-5c92f516]{border-color:var(--pse-alert-soft);background-color:var(--pse-alert-wash)}.pse-mc.is-stopped .pse-mc-icon[data-v-5c92f516]{border-color:var(--pse-alert-soft);color:var(--pse-alert-ink)}.pse-mc.is-stopped .pse-mc-progress-fill[data-v-5c92f516]{background-color:var(--pse-alert)}.pse-mc-head[data-v-5c92f516]{flex-wrap:wrap}.pse-mc-titles[data-v-5c92f516]{flex-basis:100%;order:-1}.pse-mc-controls[data-v-5c92f516],.pse-mc-tally[data-v-5c92f516]{margin-left:auto}}.pse-found[data-v-d0ff4a59]{border:1px solid var(--pse-line);background-color:var(--pse-well);border-radius:14px;align-items:center;gap:16px;margin-bottom:20px;padding:14px 16px;display:flex}.pse-found-image[data-v-d0ff4a59]{border:1px solid var(--pse-line);background-color:#fff;border-radius:11px;flex:none;justify-content:center;align-items:center;width:58px;height:58px;display:flex;overflow:hidden}.pse-found-image img[data-v-d0ff4a59]{object-fit:contain;max-width:100%;max-height:100%}.pse-found-text[data-v-d0ff4a59]{flex:1;min-width:0}.pse-found-name[data-v-d0ff4a59]{color:var(--pse-ink);margin:0;font-size:15.5px;font-weight:650;line-height:1.3}.pse-found-barcode[data-v-d0ff4a59]{font-variant-numeric:tabular-nums;color:var(--pse-ink-soft);margin:3px 0 0;font-size:13px}.pse-found-count[data-v-d0ff4a59]{flex:none;align-items:baseline;gap:6px;display:flex}.pse-found-count-number[data-v-d0ff4a59]{font-variant-numeric:tabular-nums;color:var(--pse-brand-ink);font-size:22px;font-weight:700;line-height:1}.pse-found-count-label[data-v-d0ff4a59]{color:var(--pse-ink-soft);font-size:12.5px}.pse-countdown[data-v-d0ff4a59]{border:1px solid var(--pse-brand);background-color:var(--pse-brand-soft);color:var(--pse-brand-ink);border-radius:12px;align-items:center;gap:9px;margin:0 0 20px;padding:11px 14px;font-size:13.5px;font-weight:600;display:flex}.pse-countdown-mark[data-v-d0ff4a59]{background-color:var(--pse-brand);border-radius:50%;flex:none;width:8px;height:8px;animation:1s ease-in-out infinite pse-countdown-tick-d0ff4a59}@keyframes pse-countdown-tick-d0ff4a59{50%{opacity:.25}}@media (prefers-reduced-motion:reduce){.pse-countdown-mark[data-v-d0ff4a59]{animation:none}}.pse-group+.pse-group[data-v-d0ff4a59]{margin-top:26px}.pse-group-head[data-v-d0ff4a59]{margin-bottom:10px}.pse-group-title[data-v-d0ff4a59]{letter-spacing:.02em;color:var(--pse-ink);align-items:center;gap:8px;margin:0;font-size:14px;font-weight:650;display:flex}.pse-group-count[data-v-d0ff4a59]{background-color:var(--pse-brand-soft);font-variant-numeric:tabular-nums;min-width:22px;height:20px;color:var(--pse-brand-ink);border-radius:999px;justify-content:center;align-items:center;padding:0 7px;font-size:12px;font-weight:700;display:inline-flex}.pse-group-note[data-v-d0ff4a59]{color:var(--pse-ink-soft);margin:4px 0 0;font-size:12.5px;line-height:1.45}.pse-rows[data-v-d0ff4a59]{border:1px solid var(--pse-line);background-color:#fff;border-radius:14px;overflow:hidden}.pse-panel[data-v-2ad9890a]{flex-direction:column;gap:18px;min-width:0;display:flex}.pse-panel-head[data-v-2ad9890a]{align-items:center;gap:12px;display:flex}.pse-panel-icon[data-v-2ad9890a]{background-color:var(--pse-brand-soft);width:38px;height:38px;color:var(--pse-brand-ink);border-radius:11px;flex:none;justify-content:center;align-items:center;display:flex}.pse-panel-text[data-v-2ad9890a]{min-width:0}.pse-panel-title[data-v-2ad9890a]{color:var(--pse-ink);margin:0;font-size:16px;font-weight:650;line-height:1.3}.pse-panel-subtitle[data-v-2ad9890a]{color:var(--pse-ink-soft);margin:2px 0 0;font-size:12.5px;line-height:1.4}.pse-field[data-v-e35ea7a8]{cursor:text;margin:0;display:block}.pse-field-label[data-v-e35ea7a8]{letter-spacing:.07em;text-transform:uppercase;color:var(--pse-ink-soft);margin-bottom:7px;font-size:11px;font-weight:650;display:block}.pse-field-shell[data-v-e35ea7a8]{display:block}.pse-field-shell[data-v-e35ea7a8] .pse-input{box-sizing:border-box;border:1px solid var(--pse-line);background-color:var(--pse-well);width:100%;height:48px;font:inherit;color:var(--pse-ink);border-radius:12px;margin:0;padding:0 15px;font-size:15px;transition:border-color .15s,background-color .15s,box-shadow .15s;display:block}.pse-field-shell[data-v-e35ea7a8] .pse-input::placeholder{color:var(--pse-ink-faint)}.pse-field-shell[data-v-e35ea7a8] .pse-input:-webkit-autofill{-webkit-text-fill-color:var(--pse-ink);box-shadow:0 0 0 100px var(--pse-well) inset}.pse-field-shell[data-v-e35ea7a8] .pse-input:-webkit-autofill:hover{-webkit-text-fill-color:var(--pse-ink);box-shadow:0 0 0 100px var(--pse-well) inset}.pse-field-shell[data-v-e35ea7a8] .pse-input:focus{border-color:var(--pse-brand);box-shadow:0 0 0 3px var(--pse-brand-ring);background-color:#fff;outline:none}.pse-field-shell[data-v-e35ea7a8] .pse-input:-webkit-autofill:focus{box-shadow:0 0 0 100px #fff inset, 0 0 0 3px var(--pse-brand-ring)}.pse-notice[data-v-0438713d]{border:1px solid var(--pse-line);text-align:left;background-color:#fff;border-radius:14px;align-items:flex-start;gap:12px;padding:14px 16px;display:flex;box-shadow:0 1px 2px #1430210a,0 14px 30px -26px #14302173}.pse-notice-icon[data-v-0438713d]{border-radius:10px;flex:none;justify-content:center;align-items:center;width:32px;height:32px;display:flex}.pse-notice.is-notice .pse-notice-icon[data-v-0438713d]{background-color:var(--pse-attention-soft);color:var(--pse-attention-ink)}.pse-notice.is-alert .pse-notice-icon[data-v-0438713d]{background-color:var(--pse-alert-soft);color:var(--pse-alert-ink)}.pse-notice-text[data-v-0438713d]{min-width:0;padding-top:4px;display:block}.pse-notice-title[data-v-0438713d]{color:var(--pse-ink);font-size:14px;font-weight:650;line-height:1.35;display:block}.pse-notice-detail[data-v-0438713d]{color:var(--pse-ink-soft);margin-top:2px;font-size:12.5px;line-height:1.45;display:block}.pse-notice-close[data-v-0438713d]{width:28px;height:28px;color:var(--pse-ink-faint);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;margin-left:auto;padding:0;transition:background-color .15s,color .15s;display:flex}.pse-notice-close[data-v-0438713d]:hover{background-color:var(--pse-well);color:var(--pse-ink)}.pse-notice-close[data-v-0438713d]:focus{outline:none}.pse-notice-close[data-v-0438713d]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-resume[data-v-ead5c402]{border:1px solid var(--pse-line);width:100%;font:inherit;text-align:left;color:var(--pse-ink);cursor:pointer;background-color:#fff;border-radius:14px;align-items:center;gap:13px;margin:0;padding:13px 16px;transition:border-color .15s,box-shadow .15s,transform .15s;display:flex}.pse-resume[data-v-ead5c402]:hover:not(:disabled){border-color:var(--pse-brand);transform:translateY(-1px);box-shadow:0 6px 18px -12px #14302180}.pse-resume[data-v-ead5c402]:focus{outline:none}.pse-resume[data-v-ead5c402]:focus-visible{border-color:var(--pse-brand);box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-resume[data-v-ead5c402]:disabled{background-color:var(--pse-well);color:var(--pse-ink-faint);cursor:not-allowed}.pse-resume-icon[data-v-ead5c402]{background-color:var(--pse-brand-soft);width:34px;height:34px;color:var(--pse-brand-ink);border-radius:10px;flex:none;justify-content:center;align-items:center;display:flex}.pse-resume:disabled .pse-resume-icon[data-v-ead5c402]{color:var(--pse-ink-faint);background-color:#1430210d}.pse-resume-text[data-v-ead5c402]{flex-direction:column;gap:2px;min-width:0;margin-right:auto;display:flex}.pse-resume-label[data-v-ead5c402]{font-size:13px;font-weight:600;line-height:1.3}.pse-resume-number[data-v-ead5c402]{color:var(--pse-ink-soft);font-variant-numeric:tabular-nums;font-size:12px;line-height:1.3}.pse-resume:disabled .pse-resume-number[data-v-ead5c402]{color:var(--pse-ink-faint)}.pse-resume-chevron[data-v-ead5c402]{color:var(--pse-ink-faint);flex:none;transition:transform .15s,color .15s}.pse-resume:hover:not(:disabled) .pse-resume-chevron[data-v-ead5c402]{color:var(--pse-brand-ink);transform:translate(2px)}.pse-history[data-v-1532f3f2]{border:1px solid var(--pse-line);background-color:var(--pse-well);border-radius:20px;flex-direction:column;align-self:start;min-width:0;max-height:460px;padding:18px 8px 8px 18px;display:flex}.pse-history-head[data-v-1532f3f2]{align-items:flex-start;gap:11px;margin-bottom:14px;padding-right:10px;display:flex}.pse-history-icon[data-v-1532f3f2]{background-color:var(--pse-brand-soft);width:32px;height:32px;color:var(--pse-brand-ink);border-radius:10px;flex:none;justify-content:center;align-items:center;display:flex}.pse-history-text[data-v-1532f3f2]{min-width:0;margin-right:auto}.pse-history-title[data-v-1532f3f2]{color:var(--pse-ink);margin:0;font-size:15px;font-weight:650;line-height:1.3}.pse-history-subtitle[data-v-1532f3f2]{color:var(--pse-ink-soft);margin:1px 0 0;font-size:12px;line-height:1.4}.pse-history-clear[data-v-1532f3f2]{font:inherit;color:var(--pse-ink-faint);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;margin:0;padding:5px 9px;font-size:12px;font-weight:600;transition:background-color .15s,color .15s}.pse-history-clear[data-v-1532f3f2]:hover{color:var(--pse-ink-soft);background-color:#1430210d}.pse-history-clear[data-v-1532f3f2]:focus{outline:none}.pse-history-clear[data-v-1532f3f2]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-history-list[data-v-1532f3f2]{scrollbar-width:thin;scrollbar-color:var(--pse-line) transparent;flex-direction:column;gap:6px;min-height:0;margin:0;padding:0 8px 10px 0;list-style:none;display:flex;overflow-y:auto;-webkit-mask-image:linear-gradient(#000 calc(100% - 18px),#0000);mask-image:linear-gradient(#000 calc(100% - 18px),#0000)}.pse-history-row[data-v-1532f3f2]{width:100%;font:inherit;text-align:left;color:var(--pse-ink);cursor:pointer;background-color:#fff;border:1px solid #0000;border-radius:12px;align-items:center;gap:11px;margin:0;padding:9px 11px;transition:border-color .15s,box-shadow .15s,transform .15s;display:flex}.pse-history-row[data-v-1532f3f2]:hover{border-color:var(--pse-brand);transform:translateY(-1px);box-shadow:0 6px 16px -12px #14302180}.pse-history-row[data-v-1532f3f2]:focus{outline:none}.pse-history-row[data-v-1532f3f2]:focus-visible{border-color:var(--pse-brand);box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-history-marker[data-v-1532f3f2]{background-color:var(--pse-brand);border-radius:2px;flex:none;align-self:stretch;width:3px}.pse-history-row-failed .pse-history-marker[data-v-1532f3f2]{background-color:var(--pse-alert)}.pse-history-body[data-v-1532f3f2]{flex-direction:column;gap:2px;min-width:0;margin-right:auto;display:flex}.pse-history-number[data-v-1532f3f2]{font-variant-numeric:tabular-nums;font-size:13.5px;font-weight:600;line-height:1.3}.pse-history-customer[data-v-1532f3f2]{color:var(--pse-ink);white-space:nowrap;text-overflow:ellipsis;font-size:12.5px;line-height:1.35;overflow:hidden}.pse-history-meta[data-v-1532f3f2]{color:var(--pse-ink-soft);align-items:center;gap:5px;font-size:11.5px;line-height:1.4;display:flex}.pse-history-dot[data-v-1532f3f2]{color:var(--pse-ink-faint)}.pse-history-badge[data-v-1532f3f2]{background-color:var(--pse-alert-soft);letter-spacing:.01em;color:var(--pse-alert-ink);border-radius:999px;padding:1px 6px;font-size:10.5px;font-weight:650}.pse-history-add[data-v-1532f3f2]{color:var(--pse-ink-faint);opacity:.7;flex:none;transition:color .15s,opacity .15s}.pse-history-row:hover .pse-history-add[data-v-1532f3f2]{color:var(--pse-brand-ink);opacity:1}@media (width<=1120px){.pse-history[data-v-1532f3f2]{max-height:300px}}.pse-search[data-v-a4a94ab7]{box-sizing:border-box;width:100%;color:var(--pse-ink);text-align:left;margin:28px auto 56px;padding:0 24px}.pse-search[data-v-a4a94ab7] *{box-sizing:border-box}.pse-messages[data-v-a4a94ab7]:empty{display:none}.pse-search[data-v-a4a94ab7] .pse-notice{margin-bottom:18px}.pse-layout[data-v-a4a94ab7]{max-width:980px;margin:0 auto;display:grid}.pse-layout-history[data-v-a4a94ab7]{grid-template-columns:minmax(0,1fr) 322px;gap:20px;max-width:1300px}.pse-main[data-v-a4a94ab7]{min-width:0}.pse-card[data-v-a4a94ab7]{border:1px solid var(--pse-line);background-color:#fff;border-radius:20px;grid-template-columns:1fr auto 1fr;gap:34px;padding:30px 34px;display:grid;box-shadow:0 1px 2px #1430210a,0 18px 40px -28px #14302173}.pse-card-split[data-v-a4a94ab7]{background-color:var(--pse-line);width:1px}.pse-form[data-v-a4a94ab7]{flex-direction:column;flex:1;gap:18px;margin:0;display:flex}.pse-submit[data-v-a4a94ab7]{background-color:var(--pse-brand-ink);width:100%;height:48px;font:inherit;color:#fff;cursor:pointer;border:0;border-radius:12px;justify-content:center;align-items:center;gap:9px;margin:0;padding:0 18px;font-size:14.5px;font-weight:650;transition:background-color .15s,box-shadow .15s,transform .15s;display:flex}.pse-submit-end[data-v-a4a94ab7]{margin-top:auto}.pse-submit[data-v-a4a94ab7]:hover:not(:disabled){background-color:var(--pse-brand-ink-strong);transform:translateY(-1px);box-shadow:0 10px 22px -14px #143021cc}.pse-submit[data-v-a4a94ab7]:active:not(:disabled){box-shadow:none;transform:translateY(0)}.pse-submit[data-v-a4a94ab7]:focus{outline:none}.pse-submit[data-v-a4a94ab7]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-submit[data-v-a4a94ab7]:disabled{color:#fff;cursor:not-allowed;background-color:#cfdbd4}.pse-spinner[data-v-a4a94ab7]{border:2px solid #fff6;border-top-color:#fff;border-radius:50%;flex:none;width:15px;height:15px;animation:.7s linear infinite pse-spin-a4a94ab7}@keyframes pse-spin-a4a94ab7{to{transform:rotate(360deg)}}.pse-resume-row[data-v-a4a94ab7]{grid-template-columns:1fr 1fr;gap:14px;margin-top:18px;display:grid}@media (width<=1120px){.pse-layout-history[data-v-a4a94ab7]{grid-template-columns:minmax(0,1fr);max-width:980px}}@media (width<=860px){.pse-search[data-v-a4a94ab7]{padding:0 16px}.pse-card[data-v-a4a94ab7]{grid-template-columns:1fr;gap:26px;padding:26px 22px}.pse-card-split[data-v-a4a94ab7]{width:auto;height:1px}.pse-submit-end[data-v-a4a94ab7]{margin-top:0}.pse-resume-row[data-v-a4a94ab7]{grid-template-columns:1fr}}.pse-loading[data-v-38d33d98]{box-sizing:border-box;min-height:calc(100vh - 200px);color:var(--pse-ink);text-align:left;justify-content:center;align-items:center;padding:48px 24px;display:flex}.pse-loading-card[data-v-38d33d98]{border:1px solid var(--pse-line);background-color:#fff;border-radius:20px;align-items:center;gap:16px;width:100%;max-width:420px;padding:24px 26px;display:flex;box-shadow:0 1px 2px #1430210a,0 18px 40px -28px #14302173}.pse-loading-spinner[data-v-38d33d98]{border:3px solid var(--pse-brand-ring);border-top-color:var(--pse-brand);border-radius:50%;flex:none;width:28px;height:28px;animation:.7s linear infinite pse-loading-spin-38d33d98}@keyframes pse-loading-spin-38d33d98{to{transform:rotate(360deg)}}.pse-loading-text[data-v-38d33d98]{min-width:0}.pse-loading-title[data-v-38d33d98]{color:var(--pse-ink);margin:0;font-size:16px;font-weight:650;line-height:1.3}.pse-loading-subtitle[data-v-38d33d98]{color:var(--pse-ink-soft);margin:3px 0 0;font-size:12.5px;line-height:1.4}@media (prefers-reduced-motion:reduce){.pse-loading-spinner[data-v-38d33d98]{animation-duration:1.6s}}@media (width<=860px){.pse-loading[data-v-38d33d98]{padding:32px 16px}}.pse-sidebar[data-v-0979a8ff]{box-sizing:border-box;text-align:left;color:var(--pse-ink);flex-direction:column;gap:14px;display:flex}.pse-sidebar[data-v-0979a8ff] *{box-sizing:border-box}.pse-sidebar-card[data-v-0979a8ff]{border:1px solid var(--pse-line);background-color:#fff;border-radius:16px;padding:18px 18px 20px;box-shadow:0 1px 2px #1430210a,0 18px 40px -30px #14302173}.pse-sidebar-head[data-v-0979a8ff]{border-bottom:1px solid var(--pse-line);margin-bottom:14px;padding-bottom:14px}.pse-sidebar-heading-row[data-v-0979a8ff]{align-items:center;gap:4px;display:flex}.pse-sidebar-heading[data-v-0979a8ff]{min-width:0;color:var(--pse-ink);margin:0;font-size:19px;font-weight:700;line-height:1.25}.pse-sidebar-chips[data-v-0979a8ff]{flex-wrap:wrap;gap:6px;margin-top:10px;display:flex}.pse-sidebar-chip[data-v-0979a8ff]{border:1px solid var(--pse-brand-ring);background-color:var(--pse-brand-soft);color:var(--pse-brand-ink);border-radius:999px;padding:3px 10px;font-size:11.5px;font-weight:650;line-height:1.5}.pse-sidebar-rows[data-v-0979a8ff]{grid-template-columns:minmax(0,1fr);margin:0;display:grid}.pse-sidebar-label[data-v-0979a8ff]{letter-spacing:.06em;text-transform:uppercase;color:var(--pse-ink-faint);margin:0;font-size:10.5px;font-weight:650;line-height:1.6}.pse-sidebar-value[data-v-0979a8ff]{color:var(--pse-ink);overflow-wrap:anywhere;align-items:baseline;gap:6px;margin:2px 0 11px;font-size:13.5px;font-weight:550;line-height:1.35;display:flex}.pse-sidebar-value[data-v-0979a8ff]:last-child{margin-bottom:0}.pse-sidebar-value-text[data-v-0979a8ff]{overflow-wrap:anywhere;min-width:0}.pse-sidebar-address[data-v-0979a8ff]{border-top:1px solid var(--pse-line);margin-top:16px;padding-top:14px}.pse-sidebar-address-body[data-v-0979a8ff]{color:var(--pse-ink);flex-direction:column;margin:7px 0 0;font-size:13.5px;font-weight:550;line-height:1.45;display:flex}.pse-image[data-v-367f2428]{border:1px solid var(--pse-line);background-color:#fff;border-radius:14px;justify-content:center;align-items:center;padding:24px;display:flex}.pse-image-photo[data-v-367f2428]{object-fit:contain;width:100%;max-width:460px;height:46vh;min-height:260px;display:block}.pse-products[data-v-8a2b0c51]{box-sizing:border-box;color:var(--pse-ink);text-align:left;margin-bottom:26px}.pse-products[data-v-8a2b0c51] *{box-sizing:border-box}.pse-count[data-v-8a2b0c51]{font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--pse-ink);border-radius:8px;padding:3px 9px;font-size:13px;font-weight:600;display:inline-block}.pse-count-warn[data-v-8a2b0c51],.pse-count-alert[data-v-8a2b0c51]{animation:2.4s ease-in-out infinite pse-count-breathe-8a2b0c51}.pse-count-warn[data-v-8a2b0c51]{color:#8a5a10;background-color:#e2a02e2e}.pse-count-alert[data-v-8a2b0c51]{color:#a3372c;background-color:#b03a2e1f}@keyframes pse-count-breathe-8a2b0c51{50%{background-color:#e2a02e6b}}.pse-count-alert[data-v-8a2b0c51]{animation-name:pse-count-breathe-alert-8a2b0c51}@keyframes pse-count-breathe-alert-8a2b0c51{50%{background-color:#b03a2e4d}}.pse-count-resolved[data-v-8a2b0c51]{background-color:var(--pse-brand-soft);color:var(--pse-brand-ink)}.pse-mark[data-v-8a2b0c51]{vertical-align:middle;font-size:21px}.pse-mark-done[data-v-8a2b0c51]{color:var(--pse-brand)}.pse-mark-open[data-v-8a2b0c51]{color:var(--pse-ink-faint)}.pse-skeleton-row td[data-v-8a2b0c51]{height:58px}.pse-skeleton-cell[data-v-8a2b0c51]{background-color:var(--pse-line);border-radius:6px;height:12px;animation:1.4s ease-in-out infinite pse-products-pulse-8a2b0c51;display:block}@keyframes pse-products-pulse-8a2b0c51{50%{opacity:.45}}.pse-products-hint[data-v-8a2b0c51]{border:1px solid var(--pse-brand-ring);background-color:var(--pse-brand-soft);color:var(--pse-brand-ink);border-radius:12px;align-items:center;gap:8px;margin:12px 0 0;padding:10px 13px;font-size:13px;font-weight:550;line-height:1.4;display:flex}.pse-products-hint-icon[data-v-8a2b0c51]{flex:none;font-size:18px}@media (prefers-reduced-motion:reduce){.pse-skeleton-cell[data-v-8a2b0c51],.pse-count-warn[data-v-8a2b0c51],.pse-count-alert[data-v-8a2b0c51]{animation:none}}.pse-done[data-v-a93cc49a]{box-sizing:border-box;min-height:calc(100vh - 260px);color:var(--pse-ink);text-align:left;justify-content:center;align-items:center;padding:48px 24px;display:flex}.pse-done[data-v-a93cc49a] *{box-sizing:border-box}.pse-done-card[data-v-a93cc49a]{border:1px solid var(--pse-line);text-align:center;background-color:#fff;border-radius:20px;flex-direction:column;align-items:center;width:100%;max-width:460px;padding:34px 34px 30px;display:flex;box-shadow:0 1px 2px #1430210a,0 18px 40px -28px #14302173}.pse-done-mark[data-v-a93cc49a]{background-color:var(--pse-brand-soft);width:62px;height:62px;color:var(--pse-brand-ink);border-radius:50%;justify-content:center;align-items:center;margin-bottom:18px;display:flex}.pse-done.is-detailed[data-v-a93cc49a]{align-items:flex-start;min-height:0;padding-top:32px}.pse-done-layout[data-v-a93cc49a]{justify-content:center;align-items:flex-start;gap:20px;width:100%;display:flex}.pse-done-side[data-v-a93cc49a],.pse-done-parcels-column[data-v-a93cc49a]{text-align:left;flex-direction:column;flex:0 340px;gap:14px;min-width:0;display:flex}.pse-done-layout>.pse-done-card[data-v-a93cc49a]{flex:460px}.pse-done-side[data-v-a93cc49a] .pse-sidebar{width:100%}.pse-done-parcels[data-v-a93cc49a]{border:1px solid var(--pse-line);background-color:#fff;border-radius:20px;padding:18px 20px 20px;box-shadow:0 1px 2px #1430210a,0 18px 40px -28px #14302173}.pse-done-parcels-title[data-v-a93cc49a]{letter-spacing:.06em;text-transform:uppercase;color:var(--pse-ink-soft);margin:0 0 12px;font-size:12px;font-weight:700}.pse-done-parcel+.pse-done-parcel[data-v-a93cc49a]{border-top:1px solid var(--pse-line);margin-top:14px;padding-top:14px}.pse-done-parcel-name[data-v-a93cc49a]{color:var(--pse-ink);margin:0;font-size:14.5px;font-weight:700}.pse-done-parcel-fields[data-v-a93cc49a]{grid-template-columns:auto minmax(0,1fr);gap:2px 10px;margin:10px 0 0;font-size:12.5px;line-height:1.45;display:grid}.pse-done-parcel-fields dt[data-v-a93cc49a]{color:var(--pse-ink-faint)}.pse-done-parcel-fields dd[data-v-a93cc49a]{color:var(--pse-ink);overflow-wrap:anywhere;margin:0}.pse-done-parcel-lines[data-v-a93cc49a]{margin:12px 0 0;padding:0;list-style:none}.pse-done-parcel-lines li[data-v-a93cc49a]{background-color:var(--pse-well);border-radius:10px;gap:10px;padding:8px 10px;font-size:12.5px;line-height:1.4;display:flex}.pse-done-parcel-lines li+li[data-v-a93cc49a]{margin-top:6px}.pse-done-parcel-amount[data-v-a93cc49a]{font-variant-numeric:tabular-nums;color:var(--pse-brand-ink);flex:none;font-weight:700}.pse-done-parcel-product[data-v-a93cc49a]{flex-direction:column;min-width:0;display:flex}.pse-done-parcel-product-name[data-v-a93cc49a]{color:var(--pse-ink);overflow-wrap:anywhere}.pse-done-parcel-barcode[data-v-a93cc49a]{font-variant-numeric:tabular-nums;color:var(--pse-ink-faint);font-size:12px}.pse-done-card.is-failed[data-v-a93cc49a]{border-color:var(--pse-alert-soft)}.pse-done-mark.is-failed[data-v-a93cc49a]{background-color:var(--pse-alert-soft);color:var(--pse-alert-ink)}.pse-done-card.is-failed[data-v-a93cc49a]{max-width:560px}.pse-done-card.is-failed .pse-done-number[data-v-a93cc49a]{color:var(--pse-alert-ink)}.pse-done-card.is-failed .pse-done-text[data-v-a93cc49a]{max-width:46ch}.pse-done-failures[data-v-a93cc49a]{text-align:left;width:100%;margin:18px 0 0;padding:0;list-style:none}.pse-done-failure[data-v-a93cc49a]{border:1px solid var(--pse-alert-soft);border-left:3px solid var(--pse-alert);background-color:var(--pse-alert-wash);border-radius:12px;padding:12px 14px}.pse-done-failure+.pse-done-failure[data-v-a93cc49a]{margin-top:8px}.pse-done-failure-step[data-v-a93cc49a]{color:var(--pse-alert-ink);font-size:13.5px;font-weight:650;line-height:1.35;display:block}.pse-done-failure-detail[data-v-a93cc49a]{color:var(--pse-ink-soft);overflow-wrap:anywhere;margin-top:4px;font-size:13px;line-height:1.5;display:block}.pse-done-actions[data-v-a93cc49a]{gap:10px;width:100%;margin-top:22px;display:flex}.pse-done-actions .pse-done-button[data-v-a93cc49a]{margin-top:0}.pse-done-button.is-quiet[data-v-a93cc49a]{border:1px solid var(--pse-line);color:var(--pse-ink-soft);background-color:#fff}.pse-done-button.is-quiet[data-v-a93cc49a]:hover{border-color:var(--pse-ink-faint);background-color:var(--pse-well);color:var(--pse-ink);box-shadow:none}.pse-done-mark.is-working[data-v-a93cc49a]{background-color:var(--pse-well)}.pse-done-spinner[data-v-a93cc49a]{border:3px solid var(--pse-brand-ring);border-top-color:var(--pse-brand);border-radius:50%;width:26px;height:26px;animation:.7s linear infinite pse-done-spin-a93cc49a}@keyframes pse-done-spin-a93cc49a{to{transform:rotate(360deg)}}.pse-done-title[data-v-a93cc49a]{color:var(--pse-ink);margin:0;font-size:20px;font-weight:700;line-height:1.25}.pse-done-number[data-v-a93cc49a]{font-variant-numeric:tabular-nums;letter-spacing:.01em;color:var(--pse-brand-ink);justify-content:center;margin:8px 0 0;font-size:26px;font-weight:700;line-height:1.1}.pse-done-text[data-v-a93cc49a]{max-width:34ch;color:var(--pse-ink-soft);margin:12px 0 0;font-size:13.5px;line-height:1.5}.pse-done-button[data-v-a93cc49a]{background-color:var(--pse-brand-ink);width:100%;height:48px;font:inherit;color:#fff;cursor:pointer;border:0;border-radius:12px;margin-top:22px;padding:0 18px;font-size:14.5px;font-weight:650;transition:background-color .15s,box-shadow .15s,transform .15s}.pse-done-button[data-v-a93cc49a]:hover{background-color:var(--pse-brand-ink-strong);transform:translateY(-1px);box-shadow:0 10px 22px -14px #143021cc}.pse-done-button[data-v-a93cc49a]:active{box-shadow:none;transform:translateY(0)}.pse-done-button[data-v-a93cc49a]:focus{outline:none}.pse-done-button[data-v-a93cc49a]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}@media (prefers-reduced-motion:reduce){.pse-done-spinner[data-v-a93cc49a]{animation-duration:1.6s}}@media (width<=1200px){.pse-done-layout[data-v-a93cc49a]{flex-direction:column;align-items:center}.pse-done-layout>.pse-done-card[data-v-a93cc49a]{flex:none;order:-1;width:100%}.pse-done-side[data-v-a93cc49a],.pse-done-parcels-column[data-v-a93cc49a]{flex:none;width:100%;max-width:560px}}@media (width<=860px){.pse-done[data-v-a93cc49a]{padding:32px 16px}.pse-done-actions[data-v-a93cc49a]{flex-direction:column}.pse-done-card[data-v-a93cc49a]{padding:28px 22px 24px}}.pse-products[data-v-77facacc]{box-sizing:border-box;color:var(--pse-ink);text-align:left;margin-bottom:26px}.pse-products[data-v-77facacc] *{box-sizing:border-box}.pse-products-note[data-v-77facacc]{color:var(--pse-ink-faint);flex:none;font-size:12px}.pse-cell-quantity[data-v-77facacc]{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}.pse-back-row[data-v-29aa4ab2]{text-align:left;justify-content:flex-end;margin-bottom:10px;display:flex}.pse-header[data-v-895c5c8c]{box-sizing:border-box;text-align:left;border-bottom:1px solid var(--pse-line);background-color:#fff;width:100%}@media (display-mode:window-controls-overlay){.pse-header[data-v-895c5c8c]{-webkit-app-region:drag;app-region:drag}.pse-header-inner[data-v-895c5c8c]{min-height:env(titlebar-area-height,0px);padding-top:4px;padding-bottom:4px}.pse-header-logo[data-v-895c5c8c]{height:24px}.pse-header-link[data-v-895c5c8c],.pse-header-logo[data-v-895c5c8c]{-webkit-app-region:no-drag;app-region:no-drag}}.pse-header-inner[data-v-895c5c8c]{box-sizing:border-box;align-items:center;max-width:980px;margin:0 auto;padding:16px 24px;display:flex}.pse-header-link[data-v-895c5c8c]{border-radius:10px;margin:-6px -8px;padding:6px 8px;display:inline-flex}.pse-header-link[data-v-895c5c8c]:focus{outline:none}.pse-header-link[data-v-895c5c8c]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-header-logo[data-v-895c5c8c]{width:auto;height:34px;display:block}@media (width<=860px){.pse-header-inner[data-v-895c5c8c]{padding:14px 16px}.pse-header-logo[data-v-895c5c8c]{height:28px}}.pse-settings-switch[data-v-27ab1f89]{border:1px solid var(--pse-line);background-color:var(--pse-well);cursor:pointer;border-radius:13px;align-items:flex-start;gap:11px;padding:13px 14px;display:flex;margin:0 0 34px!important}.pse-settings-checkbox[data-v-27ab1f89]{width:17px;height:17px;accent-color:var(--pse-brand-ink);cursor:pointer;flex:none;margin:1px 0 0}.pse-settings-switch-text[data-v-27ab1f89]{min-width:0}.pse-settings-switch-title[data-v-27ab1f89]{color:var(--pse-ink);font-size:14px;font-weight:650;line-height:1.3;display:block}.pse-settings-sound[data-v-27ab1f89]{align-items:stretch;gap:8px;margin-bottom:8px;display:flex}.pse-settings-sound[data-v-27ab1f89]:last-child{margin-bottom:0}.pse-settings-switch-compact[data-v-27ab1f89]{flex:auto;min-width:0;margin:0!important}.pse-settings-listen[data-v-27ab1f89]{border-radius:13px;flex:none;align-items:center;gap:6px;min-width:0;height:auto;padding:0 14px;display:inline-flex}.pse-settings-listen-icon[data-v-27ab1f89]{font-size:18px}.pse-settings-field[data-v-27ab1f89]{margin-bottom:16px}.pse-settings-field[data-v-27ab1f89]:last-child{margin-bottom:0}.pse-settings-group[data-v-27ab1f89]{border-top:1px solid var(--pse-line);margin-top:20px;padding-top:18px}.pse-settings-group-title[data-v-27ab1f89]{color:var(--pse-ink);margin:0 0 14px;font-size:13px;font-weight:650}.pse-settings-masked[data-v-27ab1f89]{-webkit-text-security:disc;text-security:disc}.pse-credentials-intro[data-v-a3fdb084]{align-items:flex-start;gap:13px;margin-bottom:20px;display:flex}.pse-credentials-logo[data-v-a3fdb084]{flex:none;margin-top:1px}.pse-credentials-subtitle[data-v-a3fdb084]{color:var(--pse-ink-soft);margin:0;font-size:13.5px;line-height:1.45}.pse-credentials-field[data-v-a3fdb084]{margin-bottom:16px}.pse-credentials-error[data-v-a3fdb084]{color:#a3372c;background-color:#b03a2e0f;border:1px solid #b03a2e47;border-radius:12px;margin:0 0 14px;padding:11px 13px;font-size:13px;line-height:1.45}.pse-credentials-error-enter-active[data-v-a3fdb084],.pse-credentials-error-leave-active[data-v-a3fdb084]{transition:opacity .15s}.pse-credentials-error-enter-from[data-v-a3fdb084],.pse-credentials-error-leave-to[data-v-a3fdb084]{opacity:0}.pse-credentials-footnote[data-v-a3fdb084]{color:var(--pse-ink-faint);margin:0;font-size:12.5px;line-height:1.4}.pse-credentials-masked[data-v-a3fdb084]{-webkit-text-security:disc;text-security:disc}.pse-credentials-spinner[data-v-a3fdb084]{border:2px solid #fff6;border-top-color:#fff;border-radius:50%;flex:none;width:14px;height:14px;animation:.7s linear infinite pse-credentials-spin-a3fdb084}@keyframes pse-credentials-spin-a3fdb084{to{transform:rotate(360deg)}}.pse-bar[data-v-db3fb5b9]{--pse-on:#a8dcab;--pse-off:#f5bd74;--pse-ink:#ffffffb8;--pse-ink-strong:#fff;--pse-ink-soft:#ffffff73;--pse-well:#ffffff14;background-color:var(--pse-well);color:var(--pse-ink);white-space:nowrap;vertical-align:middle;border-radius:999px;align-items:center;gap:2px;margin-top:-5px;margin-bottom:-5px;padding:2px;font-family:inherit;font-size:12.5px;line-height:1;display:inline-flex}.pse-bar.is-minimal[data-v-db3fb5b9]{background-color:#0000;margin:0;padding:0}.pse-bar[data-v-db3fb5b9],.pse-bar[data-v-db3fb5b9] *{box-sizing:border-box;line-height:1}.pse-pill[data-v-db3fb5b9]{font:inherit;color:inherit;cursor:pointer;background-color:#0000;border:0;border-radius:999px;align-items:center;gap:7px;margin:0;padding:5px 11px;font-weight:600;transition:background-color .15s,color .15s;display:inline-flex}.pse-toggle-label[data-v-db3fb5b9]{text-align:left;min-width:74px;display:inline-block}.pse-pill[data-v-db3fb5b9]:focus,.pse-pill[data-v-db3fb5b9]:active{box-shadow:none;outline:none}.pse-pill[data-v-db3fb5b9]:focus-visible{outline-offset:2px;outline:2px solid}.pse-icon[data-v-db3fb5b9]{flex:none;width:15px;height:15px}.pse-toggle.is-on[data-v-db3fb5b9]{color:var(--pse-on);background-color:#a8dcab29}.pse-toggle.is-on[data-v-db3fb5b9]:hover{background-color:#a8dcab47}.pse-toggle.is-on .pse-icon[data-v-db3fb5b9]{filter:brightness(0)invert(88%)sepia(19%)saturate(505%)hue-rotate(72deg)brightness(97%)contrast(90%)}.pse-toggle.is-off[data-v-db3fb5b9]{color:var(--pse-off);background-color:#f5bd7429}.pse-toggle.is-off[data-v-db3fb5b9]:hover{background-color:#f5bd7447}.pse-toggle.is-off .pse-icon[data-v-db3fb5b9]{filter:brightness(0)invert(84%)sepia(29%)saturate(958%)hue-rotate(324deg)brightness(101%)contrast(92%)}.pse-install[data-v-db3fb5b9]{color:var(--pse-ink-strong);background-color:#ffffff24}.pse-install[data-v-db3fb5b9]:hover{background-color:#ffffff3d}.pse-install .pse-icon[data-v-db3fb5b9]{filter:brightness(0)invert()}.pse-settings[data-v-db3fb5b9]{color:var(--pse-ink)}.pse-settings[data-v-db3fb5b9]:hover{color:var(--pse-ink-strong);background-color:#ffffff24}.pse-settings .pse-icon[data-v-db3fb5b9]{filter:brightness(0)invert();opacity:.72;transition:transform .3s,opacity .15s}.pse-settings:hover .pse-icon[data-v-db3fb5b9]{opacity:1;transform:rotate(60deg)}.pse-divider[data-v-db3fb5b9]{opacity:.18;background-color:currentColor;width:1px;height:15px;margin:0 4px}.pse-user[data-v-db3fb5b9]{align-items:center;gap:6px;padding:0 6px;display:inline-flex}.pse-user-name[data-v-db3fb5b9]{color:var(--pse-ink-strong);font-weight:600}.pse-dot[data-v-db3fb5b9]{background-color:var(--pse-on);border-radius:50%;flex:none;width:6px;height:6px;animation:2.6s ease-out infinite pse-dot-pulse-db3fb5b9}@keyframes pse-dot-pulse-db3fb5b9{0%{box-shadow:0 0 #a8dcab80}70%{box-shadow:0 0 0 7px #a8dcab00}to{box-shadow:0 0 #a8dcab00}}@media (prefers-reduced-motion:reduce){.pse-dot[data-v-db3fb5b9]{animation:none;box-shadow:0 0 0 3px #a8dcab33}}.pse-version[data-v-db3fb5b9]{color:var(--pse-ink-soft);letter-spacing:.04em;text-transform:uppercase;align-items:baseline;gap:5px;padding:0 6px;font-size:10.5px;display:inline-flex}.pse-bar.is-minimal .pse-version[data-v-db3fb5b9]{padding-left:0}.pse-version-number[data-v-db3fb5b9]{font-variant-numeric:tabular-nums;letter-spacing:.02em}.pse-update[data-v-db3fb5b9]{letter-spacing:.04em;color:var(--pse-off);white-space:nowrap;background-color:#f5bd742e;border-radius:999px;align-self:center;align-items:center;gap:5px;padding:2px 8px;font-size:10px;font-weight:700;text-decoration:none;transition:background-color .15s,color .15s;display:inline-flex}.pse-update[data-v-db3fb5b9]:hover{color:#ffe1bb;background-color:#f5bd744d}.pse-update[data-v-db3fb5b9]:focus{outline:none}.pse-update[data-v-db3fb5b9]:focus-visible{outline:none;box-shadow:0 0 0 2px #f5bd7499}.pse-update-dot[data-v-db3fb5b9]{background-color:currentColor;border-radius:50%;flex:none;width:5px;height:5px}@media (width<=991px){.pse-bar:not(.is-minimal) .pse-brand[data-v-db3fb5b9]{display:none}}@media (width<=767px){.pse-settings-label[data-v-db3fb5b9]{display:none}.pse-install-label[data-v-db3fb5b9]{font-size:0}.pse-install-label[data-v-db3fb5b9]:after{content:\"App\";font-size:12.5px}}.pse-login[data-v-82786ab8]{box-sizing:border-box;min-height:calc(100vh - 200px);color:var(--pse-ink);text-align:left;justify-content:center;align-items:center;padding:48px 24px;display:flex}.pse-login[data-v-82786ab8] *{box-sizing:border-box}.pse-login-card[data-v-82786ab8]{border:1px solid var(--pse-line);background-color:#fff;border-radius:20px;width:100%;max-width:420px;padding:30px 34px;box-shadow:0 1px 2px #1430210a,0 18px 40px -28px #14302173}.pse-login-errors[data-v-82786ab8]:not(:has(.validation-summary-errors)){display:none}.pse-login-errors[data-v-82786ab8] ul{color:#a3372c;background-color:#b03a2e0f;border:1px solid #b03a2e47;border-radius:12px;margin:0;padding:12px 14px;font-size:13px;line-height:1.45;list-style:none}.pse-login[data-v-82786ab8] input[type=number]{appearance:textfield}.pse-login[data-v-82786ab8] input[type=number]::-webkit-outer-spin-button{appearance:none;margin:0}.pse-login[data-v-82786ab8] input[type=number]::-webkit-inner-spin-button{appearance:none;margin:0}.pse-submit[data-v-82786ab8]{background-color:var(--pse-brand-ink);width:100%;height:48px;font:inherit;color:#fff;cursor:pointer;border:0;border-radius:12px;justify-content:center;align-items:center;margin:4px 0 0;padding:0 18px;font-size:14.5px;font-weight:650;transition:background-color .15s,box-shadow .15s,transform .15s;display:flex}.pse-submit[data-v-82786ab8]:hover{background-color:var(--pse-brand-ink-strong);transform:translateY(-1px);box-shadow:0 10px 22px -14px #143021cc}.pse-submit[data-v-82786ab8]:active{box-shadow:none;transform:translateY(0)}.pse-submit[data-v-82786ab8]:focus{outline:none}.pse-submit[data-v-82786ab8]:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}@media (width<=860px){.pse-login[data-v-82786ab8]{padding:32px 16px}.pse-login-card[data-v-82786ab8]{padding:26px 22px}}\n/*$vite$:1*/ ");
	function makeMap(str) {
		const map = Object.create(null);
		for (const key of str.split(",")) map[key] = 1;
		return (val) => val in map;
	}
	var EMPTY_OBJ = {};
	var EMPTY_ARR = [];
	var NOOP = () => {};
	var NO = () => false;
	var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
	var isModelListener = (key) => key.startsWith("onUpdate:");
	var extend = Object.assign;
	var remove = (arr, el) => {
		const i = arr.indexOf(el);
		if (i > -1) arr.splice(i, 1);
	};
	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	var hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
	var isArray = Array.isArray;
	var isMap = (val) => toTypeString(val) === "[object Map]";
	var isSet = (val) => toTypeString(val) === "[object Set]";
	var isDate = (val) => toTypeString(val) === "[object Date]";
	var isFunction = (val) => typeof val === "function";
	var isString = (val) => typeof val === "string";
	var isSymbol = (val) => typeof val === "symbol";
	var isObject = (val) => val !== null && typeof val === "object";
	var isPromise = (val) => {
		return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
	};
	var objectToString = Object.prototype.toString;
	var toTypeString = (value) => objectToString.call(value);
	var toRawType = (value) => {
		return toTypeString(value).slice(8, -1);
	};
	var isPlainObject = (val) => toTypeString(val) === "[object Object]";
	var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
	var isReservedProp = makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
	var cacheStringFunction = (fn) => {
		const cache = Object.create(null);
		return ((str) => {
			return cache[str] || (cache[str] = fn(str));
		});
	};
	var camelizeRE = /-\w/g;
	var camelize = cacheStringFunction((str) => {
		return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
	});
	var hyphenateRE = /\B([A-Z])/g;
	var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
	var capitalize = cacheStringFunction((str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	});
	var toHandlerKey = cacheStringFunction((str) => {
		return str ? `on${capitalize(str)}` : ``;
	});
	var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
	var invokeArrayFns = (fns, ...arg) => {
		for (let i = 0; i < fns.length; i++) fns[i](...arg);
	};
	var def = (obj, key, value, writable = false) => {
		Object.defineProperty(obj, key, {
			configurable: true,
			enumerable: false,
			writable,
			value
		});
	};
	var looseToNumber = (val) => {
		const n = parseFloat(val);
		return isNaN(n) ? val : n;
	};
	var toNumber = (val) => {
		const n = isString(val) ? Number(val) : NaN;
		return isNaN(n) ? val : n;
	};
	var _globalThis;
	var getGlobalThis = () => {
		return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	};
	function normalizeStyle(value) {
		if (isArray(value)) {
			const res = {};
			for (let i = 0; i < value.length; i++) {
				const item = value[i];
				const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
				if (normalized) for (const key in normalized) res[key] = normalized[key];
			}
			return res;
		} else if (isString(value) || isObject(value)) return value;
	}
	var listDelimiterRE = /;(?![^(]*\))/g;
	var propertyDelimiterRE = /:([^]+)/;
	var styleCommentRE = /\/\*[^]*?\*\//g;
	function parseStringStyle(cssText) {
		const ret = {};
		cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
			if (item) {
				const tmp = item.split(propertyDelimiterRE);
				tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
			}
		});
		return ret;
	}
	function normalizeClass(value) {
		let res = "";
		if (isString(value)) res = value;
		else if (isArray(value)) for (let i = 0; i < value.length; i++) {
			const normalized = normalizeClass(value[i]);
			if (normalized) res += normalized + " ";
		}
		else if (isObject(value)) {
			for (const name in value) if (value[name]) res += name + " ";
		}
		return res.trim();
	}
	var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
	var isSpecialBooleanAttr = makeMap(specialBooleanAttrs);
	specialBooleanAttrs + "";
	function includeBooleanAttr(value) {
		return !!value || value === "";
	}
	function looseCompareArrays(a, b) {
		if (a.length !== b.length) return false;
		let equal = true;
		for (let i = 0; equal && i < a.length; i++) equal = looseEqual(a[i], b[i]);
		return equal;
	}
	function looseEqual(a, b) {
		if (a === b) return true;
		let aValidType = isDate(a);
		let bValidType = isDate(b);
		if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
		aValidType = isSymbol(a);
		bValidType = isSymbol(b);
		if (aValidType || bValidType) return a === b;
		aValidType = isArray(a);
		bValidType = isArray(b);
		if (aValidType || bValidType) return aValidType && bValidType ? looseCompareArrays(a, b) : false;
		aValidType = isObject(a);
		bValidType = isObject(b);
		if (aValidType || bValidType) {
			if (!aValidType || !bValidType) return false;
			if (Object.keys(a).length !== Object.keys(b).length) return false;
			for (const key in a) {
				const aHasKey = a.hasOwnProperty(key);
				const bHasKey = b.hasOwnProperty(key);
				if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) return false;
			}
		}
		return String(a) === String(b);
	}
	function looseIndexOf(arr, val) {
		return arr.findIndex((item) => looseEqual(item, val));
	}
	var isRef$1 = (val) => {
		return !!(val && val["__v_isRef"] === true);
	};
	var toDisplayString = (val) => {
		return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
	};
	var replacer = (_key, val) => {
		if (isRef$1(val)) return replacer(_key, val.value);
		else if (isMap(val)) return { [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2], i) => {
			entries[stringifySymbol(key, i) + " =>"] = val2;
			return entries;
		}, {}) };
		else if (isSet(val)) return { [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v)) };
		else if (isSymbol(val)) return stringifySymbol(val);
		else if (isObject(val) && !isArray(val) && !isPlainObject(val)) return String(val);
		return val;
	};
	var stringifySymbol = (v, i = "") => {
		var _a;
		return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
	};
	var activeEffectScope;
	var EffectScope = class {
		constructor(detached = false) {
			this.detached = detached;
			this._active = true;
			this._on = 0;
			this.effects = [];
			this.cleanups = [];
			this._isPaused = false;
			this._warnOnRun = true;
			this.__v_skip = true;
			if (!detached && activeEffectScope) if (activeEffectScope.active) {
				this.parent = activeEffectScope;
				this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
			} else {
				this._active = false;
				this._warnOnRun = false;
			}
		}
		get active() {
			return this._active;
		}
		pause() {
			if (this._active) {
				this._isPaused = true;
				let i, l;
				if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].pause();
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].pause();
			}
		}
		resume() {
			if (this._active) {
				if (this._isPaused) {
					this._isPaused = false;
					let i, l;
					if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].resume();
					for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].resume();
				}
			}
		}
		run(fn) {
			if (this._active) {
				const currentEffectScope = activeEffectScope;
				try {
					activeEffectScope = this;
					return fn();
				} finally {
					activeEffectScope = currentEffectScope;
				}
			}
		}
		on() {
			if (++this._on === 1) {
				this.prevScope = activeEffectScope;
				activeEffectScope = this;
			}
		}
		off() {
			if (this._on > 0 && --this._on === 0) {
				if (activeEffectScope === this) activeEffectScope = this.prevScope;
				else {
					let current = activeEffectScope;
					while (current) {
						if (current.prevScope === this) {
							current.prevScope = this.prevScope;
							break;
						}
						current = current.prevScope;
					}
				}
				this.prevScope = void 0;
			}
		}
		stop(fromParent) {
			if (this._active) {
				this._active = false;
				let i, l;
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].stop();
				this.effects.length = 0;
				for (i = 0, l = this.cleanups.length; i < l; i++) this.cleanups[i]();
				this.cleanups.length = 0;
				if (this.scopes) {
					for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].stop(true);
					this.scopes.length = 0;
				}
				if (!this.detached && this.parent && !fromParent) {
					const last = this.parent.scopes.pop();
					if (last && last !== this) {
						this.parent.scopes[this.index] = last;
						last.index = this.index;
					}
				}
				this.parent = void 0;
			}
		}
	};
	function getCurrentScope() {
		return activeEffectScope;
	}
	var activeSub;
	var pausedQueueEffects = new WeakSet();
	var ReactiveEffect = class {
		constructor(fn) {
			this.fn = fn;
			this.deps = void 0;
			this.depsTail = void 0;
			this.flags = 5;
			this.next = void 0;
			this.cleanup = void 0;
			this.scheduler = void 0;
			if (activeEffectScope) if (activeEffectScope.active) activeEffectScope.effects.push(this);
			else this.flags &= -2;
		}
		pause() {
			this.flags |= 64;
		}
		resume() {
			if (this.flags & 64) {
				this.flags &= -65;
				if (pausedQueueEffects.has(this)) {
					pausedQueueEffects.delete(this);
					this.trigger();
				}
			}
		}
		notify() {
			if (this.flags & 2 && !(this.flags & 32)) return;
			if (!(this.flags & 8)) batch(this);
		}
		run() {
			if (!(this.flags & 1)) return this.fn();
			this.flags |= 2;
			cleanupEffect(this);
			prepareDeps(this);
			const prevEffect = activeSub;
			const prevShouldTrack = shouldTrack;
			activeSub = this;
			shouldTrack = true;
			try {
				return this.fn();
			} finally {
				cleanupDeps(this);
				activeSub = prevEffect;
				shouldTrack = prevShouldTrack;
				this.flags &= -3;
			}
		}
		stop() {
			if (this.flags & 1) {
				for (let link = this.deps; link; link = link.nextDep) removeSub(link);
				this.deps = this.depsTail = void 0;
				cleanupEffect(this);
				this.onStop && this.onStop();
				this.flags &= -2;
			}
		}
		trigger() {
			if (this.flags & 64) pausedQueueEffects.add(this);
			else if (this.scheduler) this.scheduler();
			else this.runIfDirty();
		}
		runIfDirty() {
			if (isDirty(this)) this.run();
		}
		get dirty() {
			return isDirty(this);
		}
	};
	var batchDepth = 0;
	var batchedSub;
	var batchedComputed;
	function batch(sub, isComputed = false) {
		sub.flags |= 8;
		if (isComputed) {
			sub.next = batchedComputed;
			batchedComputed = sub;
			return;
		}
		sub.next = batchedSub;
		batchedSub = sub;
	}
	function startBatch() {
		batchDepth++;
	}
	function endBatch() {
		if (--batchDepth > 0) return;
		if (batchedComputed) {
			let e = batchedComputed;
			batchedComputed = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				e = next;
			}
		}
		let error;
		while (batchedSub) {
			let e = batchedSub;
			batchedSub = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				if (e.flags & 1) try {
					e.trigger();
				} catch (err) {
					if (!error) error = err;
				}
				e = next;
			}
		}
		if (error) throw error;
	}
	function prepareDeps(sub) {
		for (let link = sub.deps; link; link = link.nextDep) {
			link.version = -1;
			link.prevActiveLink = link.dep.activeLink;
			link.dep.activeLink = link;
		}
	}
	function cleanupDeps(sub) {
		let head;
		let tail = sub.depsTail;
		let link = tail;
		while (link) {
			const prev = link.prevDep;
			if (link.version === -1) {
				if (link === tail) tail = prev;
				removeSub(link);
				removeDep(link);
			} else head = link;
			link.dep.activeLink = link.prevActiveLink;
			link.prevActiveLink = void 0;
			link = prev;
		}
		sub.deps = head;
		sub.depsTail = tail;
	}
	function isDirty(sub) {
		for (let link = sub.deps; link; link = link.nextDep) if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) return true;
		if (sub._dirty) return true;
		return false;
	}
	function refreshComputed(computed) {
		if (computed.flags & 4 && !(computed.flags & 16)) return;
		computed.flags &= -17;
		if (computed.globalVersion === globalVersion) return;
		computed.globalVersion = globalVersion;
		if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) return;
		computed.flags |= 2;
		const dep = computed.dep;
		const prevSub = activeSub;
		const prevShouldTrack = shouldTrack;
		activeSub = computed;
		shouldTrack = true;
		try {
			prepareDeps(computed);
			const value = computed.fn(computed._value);
			if (dep.version === 0 || hasChanged(value, computed._value)) {
				computed.flags |= 128;
				computed._value = value;
				dep.version++;
			}
		} catch (err) {
			dep.version++;
			throw err;
		} finally {
			activeSub = prevSub;
			shouldTrack = prevShouldTrack;
			cleanupDeps(computed);
			computed.flags &= -3;
		}
	}
	function removeSub(link, soft = false) {
		const { dep, prevSub, nextSub } = link;
		if (prevSub) {
			prevSub.nextSub = nextSub;
			link.prevSub = void 0;
		}
		if (nextSub) {
			nextSub.prevSub = prevSub;
			link.nextSub = void 0;
		}
		if (dep.subs === link) {
			dep.subs = prevSub;
			if (!prevSub && dep.computed) {
				dep.computed.flags &= -5;
				for (let l = dep.computed.deps; l; l = l.nextDep) removeSub(l, true);
			}
		}
		if (!soft && !--dep.sc && dep.map) dep.map.delete(dep.key);
	}
	function removeDep(link) {
		const { prevDep, nextDep } = link;
		if (prevDep) {
			prevDep.nextDep = nextDep;
			link.prevDep = void 0;
		}
		if (nextDep) {
			nextDep.prevDep = prevDep;
			link.nextDep = void 0;
		}
	}
	var shouldTrack = true;
	var trackStack = [];
	function pauseTracking() {
		trackStack.push(shouldTrack);
		shouldTrack = false;
	}
	function resetTracking() {
		const last = trackStack.pop();
		shouldTrack = last === void 0 ? true : last;
	}
	function cleanupEffect(e) {
		const { cleanup } = e;
		e.cleanup = void 0;
		if (cleanup) {
			const prevSub = activeSub;
			activeSub = void 0;
			try {
				cleanup();
			} finally {
				activeSub = prevSub;
			}
		}
	}
	var globalVersion = 0;
	var Link = class {
		constructor(sub, dep) {
			this.sub = sub;
			this.dep = dep;
			this.version = dep.version;
			this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
		}
	};
	var Dep = class {
		constructor(computed) {
			this.computed = computed;
			this.version = 0;
			this.activeLink = void 0;
			this.subs = void 0;
			this.map = void 0;
			this.key = void 0;
			this.sc = 0;
			this.__v_skip = true;
		}
		track(debugInfo) {
			if (!activeSub || !shouldTrack || activeSub === this.computed) return;
			let link = this.activeLink;
			if (link === void 0 || link.sub !== activeSub) {
				link = this.activeLink = new Link(activeSub, this);
				if (!activeSub.deps) activeSub.deps = activeSub.depsTail = link;
				else {
					link.prevDep = activeSub.depsTail;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
				}
				addSub(link);
			} else if (link.version === -1) {
				link.version = this.version;
				if (link.nextDep) {
					const next = link.nextDep;
					next.prevDep = link.prevDep;
					if (link.prevDep) link.prevDep.nextDep = next;
					link.prevDep = activeSub.depsTail;
					link.nextDep = void 0;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
					if (activeSub.deps === link) activeSub.deps = next;
				}
			}
			return link;
		}
		trigger(debugInfo) {
			this.version++;
			globalVersion++;
			this.notify(debugInfo);
		}
		notify(debugInfo) {
			startBatch();
			try {
				for (let link = this.subs; link; link = link.prevSub) if (link.sub.notify()) link.sub.dep.notify();
			} finally {
				endBatch();
			}
		}
	};
	function addSub(link) {
		link.dep.sc++;
		if (link.sub.flags & 4) {
			const computed = link.dep.computed;
			if (computed && !link.dep.subs) {
				computed.flags |= 20;
				for (let l = computed.deps; l; l = l.nextDep) addSub(l);
			}
			const currentTail = link.dep.subs;
			if (currentTail !== link) {
				link.prevSub = currentTail;
				if (currentTail) currentTail.nextSub = link;
			}
			link.dep.subs = link;
		}
	}
	var targetMap = new WeakMap();
	var ITERATE_KEY = Symbol("");
	var MAP_KEY_ITERATE_KEY = Symbol("");
	var ARRAY_ITERATE_KEY = Symbol("");
	function track(target, type, key) {
		if (shouldTrack && activeSub) {
			let depsMap = targetMap.get(target);
			if (!depsMap) targetMap.set(target, depsMap = new Map());
			let dep = depsMap.get(key);
			if (!dep) {
				depsMap.set(key, dep = new Dep());
				dep.map = depsMap;
				dep.key = key;
			}
			dep.track();
		}
	}
	function trigger(target, type, key, newValue, oldValue, oldTarget) {
		const depsMap = targetMap.get(target);
		if (!depsMap) {
			globalVersion++;
			return;
		}
		const run = (dep) => {
			if (dep) dep.trigger();
		};
		startBatch();
		if (type === "clear") depsMap.forEach(run);
		else {
			const targetIsArray = isArray(target);
			const isArrayIndex = targetIsArray && isIntegerKey(key);
			if (targetIsArray && key === "length") {
				const newLength = Number(newValue);
				depsMap.forEach((dep, key2) => {
					if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
				});
			} else {
				if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
				if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
				switch (type) {
					case "add":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						} else if (isArrayIndex) run(depsMap.get("length"));
						break;
					case "delete":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						}
						break;
					case "set":
						if (isMap(target)) run(depsMap.get(ITERATE_KEY));
						break;
				}
			}
		}
		endBatch();
	}
	function reactiveReadArray(array) {
		const raw = toRaw(array);
		if (raw === array) return raw;
		track(raw, "iterate", ARRAY_ITERATE_KEY);
		return isShallow(array) ? raw : raw.map(toReactive);
	}
	function shallowReadArray(arr) {
		track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
		return arr;
	}
	function toWrapped(target, item) {
		if (isReadonly(target)) return isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
		return toReactive(item);
	}
	var arrayInstrumentations = {
		__proto__: null,
		[Symbol.iterator]() {
			return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
		},
		concat(...args) {
			return reactiveReadArray(this).concat(...args.map((x) => isArray(x) ? reactiveReadArray(x) : x));
		},
		entries() {
			return iterator(this, "entries", (value) => {
				value[1] = toWrapped(this, value[1]);
				return value;
			});
		},
		every(fn, thisArg) {
			return apply(this, "every", fn, thisArg, void 0, arguments);
		},
		filter(fn, thisArg) {
			return apply(this, "filter", fn, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
		},
		find(fn, thisArg) {
			return apply(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findIndex(fn, thisArg) {
			return apply(this, "findIndex", fn, thisArg, void 0, arguments);
		},
		findLast(fn, thisArg) {
			return apply(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findLastIndex(fn, thisArg) {
			return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
		},
		forEach(fn, thisArg) {
			return apply(this, "forEach", fn, thisArg, void 0, arguments);
		},
		includes(...args) {
			return searchProxy(this, "includes", args);
		},
		indexOf(...args) {
			return searchProxy(this, "indexOf", args);
		},
		join(separator) {
			return reactiveReadArray(this).join(separator);
		},
		lastIndexOf(...args) {
			return searchProxy(this, "lastIndexOf", args);
		},
		map(fn, thisArg) {
			return apply(this, "map", fn, thisArg, void 0, arguments);
		},
		pop() {
			return noTracking(this, "pop");
		},
		push(...args) {
			return noTracking(this, "push", args);
		},
		reduce(fn, ...args) {
			return reduce(this, "reduce", fn, args);
		},
		reduceRight(fn, ...args) {
			return reduce(this, "reduceRight", fn, args);
		},
		shift() {
			return noTracking(this, "shift");
		},
		some(fn, thisArg) {
			return apply(this, "some", fn, thisArg, void 0, arguments);
		},
		splice(...args) {
			return noTracking(this, "splice", args);
		},
		toReversed() {
			return reactiveReadArray(this).toReversed();
		},
		toSorted(comparer) {
			return reactiveReadArray(this).toSorted(comparer);
		},
		toSpliced(...args) {
			return reactiveReadArray(this).toSpliced(...args);
		},
		unshift(...args) {
			return noTracking(this, "unshift", args);
		},
		values() {
			return iterator(this, "values", (item) => toWrapped(this, item));
		}
	};
	function iterator(self, method, wrapValue) {
		const arr = shallowReadArray(self);
		const iter = arr[method]();
		if (arr !== self && !isShallow(self)) {
			iter._next = iter.next;
			iter.next = () => {
				const result = iter._next();
				if (!result.done) result.value = wrapValue(result.value);
				return result;
			};
		}
		return iter;
	}
	var arrayProto = Array.prototype;
	function apply(self, method, fn, thisArg, wrappedRetFn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !isShallow(self);
		const methodFn = arr[method];
		if (methodFn !== arrayProto[method]) {
			const result2 = methodFn.apply(self, args);
			return needsWrap ? toReactive(result2) : result2;
		}
		let wrappedFn = fn;
		if (arr !== self) {
			if (needsWrap) wrappedFn = function(item, index) {
				return fn.call(this, toWrapped(self, item), index, self);
			};
			else if (fn.length > 2) wrappedFn = function(item, index) {
				return fn.call(this, item, index, self);
			};
		}
		const result = methodFn.call(arr, wrappedFn, thisArg);
		return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
	}
	function reduce(self, method, fn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !isShallow(self);
		let wrappedFn = fn;
		let wrapInitialAccumulator = false;
		if (arr !== self) {
			if (needsWrap) {
				wrapInitialAccumulator = args.length === 0;
				wrappedFn = function(acc, item, index) {
					if (wrapInitialAccumulator) {
						wrapInitialAccumulator = false;
						acc = toWrapped(self, acc);
					}
					return fn.call(this, acc, toWrapped(self, item), index, self);
				};
			} else if (fn.length > 3) wrappedFn = function(acc, item, index) {
				return fn.call(this, acc, item, index, self);
			};
		}
		const result = arr[method](wrappedFn, ...args);
		return wrapInitialAccumulator ? toWrapped(self, result) : result;
	}
	function searchProxy(self, method, args) {
		const arr = toRaw(self);
		track(arr, "iterate", ARRAY_ITERATE_KEY);
		const res = arr[method](...args);
		if ((res === -1 || res === false) && isProxy(args[0])) {
			args[0] = toRaw(args[0]);
			return arr[method](...args);
		}
		return res;
	}
	function noTracking(self, method, args = []) {
		pauseTracking();
		startBatch();
		const res = toRaw(self)[method].apply(self, args);
		endBatch();
		resetTracking();
		return res;
	}
	var isNonTrackableKeys = makeMap(`__proto__,__v_isRef,__isVue`);
	var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
	function hasOwnProperty(key) {
		if (!isSymbol(key)) key = String(key);
		const obj = toRaw(this);
		track(obj, "has", key);
		return obj.hasOwnProperty(key);
	}
	var BaseReactiveHandler = class {
		constructor(_isReadonly = false, _isShallow = false) {
			this._isReadonly = _isReadonly;
			this._isShallow = _isShallow;
		}
		get(target, key, receiver) {
			if (key === "__v_skip") return target["__v_skip"];
			const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_isShallow") return isShallow2;
			else if (key === "__v_raw") {
				if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
				return;
			}
			const targetIsArray = isArray(target);
			if (!isReadonly2) {
				let fn;
				if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
				if (key === "hasOwnProperty") return hasOwnProperty;
			}
			const res = Reflect.get(target, key, isRef(target) ? target : receiver);
			if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
			if (!isReadonly2) track(target, "get", key);
			if (isShallow2) return res;
			if (isRef(res)) {
				const value = targetIsArray && isIntegerKey(key) ? res : res.value;
				return isReadonly2 && isObject(value) ? readonly(value) : value;
			}
			if (isObject(res)) return isReadonly2 ? readonly(res) : reactive(res);
			return res;
		}
	};
	var MutableReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(false, isShallow2);
		}
		set(target, key, value, receiver) {
			let oldValue = target[key];
			const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
			if (!this._isShallow) {
				const isOldValueReadonly = isReadonly(oldValue);
				if (!isShallow(value) && !isReadonly(value)) {
					oldValue = toRaw(oldValue);
					value = toRaw(value);
				}
				if (!isArrayWithIntegerKey && isRef(oldValue) && !isRef(value)) if (isOldValueReadonly) return true;
				else {
					oldValue.value = value;
					return true;
				}
			}
			const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
			const result = Reflect.set(target, key, value, isRef(target) ? target : receiver);
			if (target === toRaw(receiver)) {
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
			}
			return result;
		}
		deleteProperty(target, key) {
			const hadKey = hasOwn(target, key);
			const oldValue = target[key];
			const result = Reflect.deleteProperty(target, key);
			if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
			return result;
		}
		has(target, key) {
			const result = Reflect.has(target, key);
			if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
			return result;
		}
		ownKeys(target) {
			track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
			return Reflect.ownKeys(target);
		}
	};
	var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(true, isShallow2);
		}
		set(target, key) {
			return true;
		}
		deleteProperty(target, key) {
			return true;
		}
	};
	var mutableHandlers = new MutableReactiveHandler();
	var readonlyHandlers = new ReadonlyReactiveHandler();
	var shallowReactiveHandlers = new MutableReactiveHandler(true);
	var toShallow = (value) => value;
	var getProto = (v) => Reflect.getPrototypeOf(v);
	function createIterableMethod(method, isReadonly2, isShallow2) {
		return function(...args) {
			const target = this["__v_raw"];
			const rawTarget = toRaw(target);
			const targetIsMap = isMap(rawTarget);
			const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
			const isKeyOnly = method === "keys" && targetIsMap;
			const innerIterator = target[method](...args);
			const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
			!isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
			return extend(Object.create(innerIterator), { next() {
				const { value, done } = innerIterator.next();
				return done ? {
					value,
					done
				} : {
					value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
					done
				};
			} });
		};
	}
	function createReadonlyMethod(type) {
		return function(...args) {
			return type === "delete" ? false : type === "clear" ? void 0 : this;
		};
	}
	function createInstrumentations(readonly, shallow) {
		const instrumentations = {
			get(key) {
				const target = this["__v_raw"];
				const rawTarget = toRaw(target);
				const rawKey = toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
					track(rawTarget, "get", rawKey);
				}
				const { has } = getProto(rawTarget);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				if (has.call(rawTarget, key)) return wrap(target.get(key));
				else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
				else if (target !== rawTarget) target.get(key);
			},
			get size() {
				const target = this["__v_raw"];
				!readonly && track(toRaw(target), "iterate", ITERATE_KEY);
				return target.size;
			},
			has(key) {
				const target = this["__v_raw"];
				const rawTarget = toRaw(target);
				const rawKey = toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
					track(rawTarget, "has", rawKey);
				}
				return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
			},
			forEach(callback, thisArg) {
				const observed = this;
				const target = observed["__v_raw"];
				const rawTarget = toRaw(target);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				!readonly && track(rawTarget, "iterate", ITERATE_KEY);
				return target.forEach((value, key) => {
					return callback.call(thisArg, wrap(value), wrap(key), observed);
				});
			}
		};
		extend(instrumentations, readonly ? {
			add: createReadonlyMethod("add"),
			set: createReadonlyMethod("set"),
			delete: createReadonlyMethod("delete"),
			clear: createReadonlyMethod("clear")
		} : {
			add(value) {
				const target = toRaw(this);
				const proto = getProto(target);
				const rawValue = toRaw(value);
				const valueToAdd = !shallow && !isShallow(value) && !isReadonly(value) ? rawValue : value;
				if (!(proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue))) {
					target.add(valueToAdd);
					trigger(target, "add", valueToAdd, valueToAdd);
				}
				return this;
			},
			set(key, value) {
				if (!shallow && !isShallow(value) && !isReadonly(value)) value = toRaw(value);
				const target = toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = toRaw(key);
					hadKey = has.call(target, key);
				}
				const oldValue = get.call(target, key);
				target.set(key, value);
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
				return this;
			},
			delete(key) {
				const target = toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = toRaw(key);
					hadKey = has.call(target, key);
				}
				const oldValue = get ? get.call(target, key) : void 0;
				const result = target.delete(key);
				if (hadKey) trigger(target, "delete", key, void 0, oldValue);
				return result;
			},
			clear() {
				const target = toRaw(this);
				const hadItems = target.size !== 0;
				const oldTarget = void 0;
				const result = target.clear();
				if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
				return result;
			}
		});
		[
			"keys",
			"values",
			"entries",
			Symbol.iterator
		].forEach((method) => {
			instrumentations[method] = createIterableMethod(method, readonly, shallow);
		});
		return instrumentations;
	}
	function createInstrumentationGetter(isReadonly2, shallow) {
		const instrumentations = createInstrumentations(isReadonly2, shallow);
		return (target, key, receiver) => {
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_raw") return target;
			return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
		};
	}
	var mutableCollectionHandlers = { get: createInstrumentationGetter(false, false) };
	var shallowCollectionHandlers = { get: createInstrumentationGetter(false, true) };
	var readonlyCollectionHandlers = { get: createInstrumentationGetter(true, false) };
	var reactiveMap = new WeakMap();
	var shallowReactiveMap = new WeakMap();
	var readonlyMap = new WeakMap();
	var shallowReadonlyMap = new WeakMap();
	function targetTypeMap(rawType) {
		switch (rawType) {
			case "Object":
			case "Array": return 1;
			case "Map":
			case "Set":
			case "WeakMap":
			case "WeakSet": return 2;
			default: return 0;
		}
	}
	function reactive(target) {
		if (isReadonly(target)) return target;
		return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
	}
	function shallowReactive(target) {
		return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
	}
	function readonly(target) {
		return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
	}
	function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
		if (!isObject(target)) return target;
		if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
		if (target["__v_skip"] || !Object.isExtensible(target)) return target;
		const existingProxy = proxyMap.get(target);
		if (existingProxy) return existingProxy;
		const targetType = targetTypeMap(toRawType(target));
		if (targetType === 0) return target;
		const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
		proxyMap.set(target, proxy);
		return proxy;
	}
	function isReactive(value) {
		if (isReadonly(value)) return isReactive(value["__v_raw"]);
		return !!(value && value["__v_isReactive"]);
	}
	function isReadonly(value) {
		return !!(value && value["__v_isReadonly"]);
	}
	function isShallow(value) {
		return !!(value && value["__v_isShallow"]);
	}
	function isProxy(value) {
		return value ? !!value["__v_raw"] : false;
	}
	function toRaw(observed) {
		const raw = observed && observed["__v_raw"];
		return raw ? toRaw(raw) : observed;
	}
	function markRaw(value) {
		if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) def(value, "__v_skip", true);
		return value;
	}
	var toReactive = (value) => isObject(value) ? reactive(value) : value;
	var toReadonly = (value) => isObject(value) ? readonly(value) : value;
	function isRef(r) {
		return r ? r["__v_isRef"] === true : false;
	}
	function ref(value) {
		return createRef(value, false);
	}
	function shallowRef(value) {
		return createRef(value, true);
	}
	function createRef(rawValue, shallow) {
		if (isRef(rawValue)) return rawValue;
		return new RefImpl(rawValue, shallow);
	}
	var RefImpl = class {
		constructor(value, isShallow2) {
			this.dep = new Dep();
			this["__v_isRef"] = true;
			this["__v_isShallow"] = false;
			this._rawValue = isShallow2 ? value : toRaw(value);
			this._value = isShallow2 ? value : toReactive(value);
			this["__v_isShallow"] = isShallow2;
		}
		get value() {
			this.dep.track();
			return this._value;
		}
		set value(newValue) {
			const oldValue = this._rawValue;
			const useDirectValue = this["__v_isShallow"] || isShallow(newValue) || isReadonly(newValue);
			newValue = useDirectValue ? newValue : toRaw(newValue);
			if (hasChanged(newValue, oldValue)) {
				this._rawValue = newValue;
				this._value = useDirectValue ? newValue : toReactive(newValue);
				this.dep.trigger();
			}
		}
	};
	function unref(ref2) {
		return isRef(ref2) ? ref2.value : ref2;
	}
	var shallowUnwrapHandlers = {
		get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
		set: (target, key, value, receiver) => {
			const oldValue = target[key];
			if (isRef(oldValue) && !isRef(value)) {
				oldValue.value = value;
				return true;
			} else return Reflect.set(target, key, value, receiver);
		}
	};
	function proxyRefs(objectWithRefs) {
		return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
	}
	var CustomRefImpl = class {
		constructor(factory) {
			this["__v_isRef"] = true;
			this._value = void 0;
			const dep = this.dep = new Dep();
			const { get, set } = factory(dep.track.bind(dep), dep.trigger.bind(dep));
			this._get = get;
			this._set = set;
		}
		get value() {
			return this._value = this._get();
		}
		set value(newVal) {
			this._set(newVal);
		}
	};
	function customRef(factory) {
		return new CustomRefImpl(factory);
	}
	var ComputedRefImpl = class {
		constructor(fn, setter, isSSR) {
			this.fn = fn;
			this.setter = setter;
			this._value = void 0;
			this.dep = new Dep(this);
			this.__v_isRef = true;
			this.deps = void 0;
			this.depsTail = void 0;
			this.flags = 16;
			this.globalVersion = globalVersion - 1;
			this.next = void 0;
			this.effect = this;
			this["__v_isReadonly"] = !setter;
			this.isSSR = isSSR;
		}
		notify() {
			this.flags |= 16;
			if (!(this.flags & 8) && activeSub !== this) {
				batch(this, true);
				return true;
			}
		}
		get value() {
			const link = this.dep.track();
			refreshComputed(this);
			if (link) link.version = this.dep.version;
			return this._value;
		}
		set value(newValue) {
			if (this.setter) this.setter(newValue);
		}
	};
	function computed$1(getterOrOptions, debugOptions, isSSR = false) {
		let getter;
		let setter;
		if (isFunction(getterOrOptions)) getter = getterOrOptions;
		else {
			getter = getterOrOptions.get;
			setter = getterOrOptions.set;
		}
		return new ComputedRefImpl(getter, setter, isSSR);
	}
	var INITIAL_WATCHER_VALUE = {};
	var cleanupMap = new WeakMap();
	var activeWatcher = void 0;
	function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
		if (owner) {
			let cleanups = cleanupMap.get(owner);
			if (!cleanups) cleanupMap.set(owner, cleanups = []);
			cleanups.push(cleanupFn);
		}
	}
	function watch$1(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, once, scheduler, augmentJob, call } = options;
		const reactiveGetter = (source2) => {
			if (deep) return source2;
			if (isShallow(source2) || deep === false || deep === 0) return traverse(source2, 1);
			return traverse(source2);
		};
		let effect;
		let getter;
		let cleanup;
		let boundCleanup;
		let forceTrigger = false;
		let isMultiSource = false;
		if (isRef(source)) {
			getter = () => source.value;
			forceTrigger = isShallow(source);
		} else if (isReactive(source)) {
			getter = () => reactiveGetter(source);
			forceTrigger = true;
		} else if (isArray(source)) {
			isMultiSource = true;
			forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
			getter = () => source.map((s) => {
				if (isRef(s)) return s.value;
				else if (isReactive(s)) return reactiveGetter(s);
				else if (isFunction(s)) return call ? call(s, 2) : s();
			});
		} else if (isFunction(source)) if (cb) getter = call ? () => call(source, 2) : source;
		else getter = () => {
			if (cleanup) {
				pauseTracking();
				try {
					cleanup();
				} finally {
					resetTracking();
				}
			}
			const currentEffect = activeWatcher;
			activeWatcher = effect;
			try {
				return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
			} finally {
				activeWatcher = currentEffect;
			}
		};
		else getter = NOOP;
		if (cb && deep) {
			const baseGetter = getter;
			const depth = deep === true ? Infinity : deep;
			getter = () => traverse(baseGetter(), depth);
		}
		const scope = getCurrentScope();
		const watchHandle = () => {
			effect.stop();
			if (scope && scope.active) remove(scope.effects, effect);
		};
		if (once && cb) {
			const _cb = cb;
			cb = (...args) => {
				_cb(...args);
				watchHandle();
			};
		}
		let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
		const job = (immediateFirstRun) => {
			if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) return;
			if (cb) {
				const newValue = effect.run();
				if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
					if (cleanup) cleanup();
					const currentWatcher = activeWatcher;
					activeWatcher = effect;
					try {
						const args = [
							newValue,
							oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
							boundCleanup
						];
						oldValue = newValue;
						call ? call(cb, 3, args) : cb(...args);
					} finally {
						activeWatcher = currentWatcher;
					}
				}
			} else effect.run();
		};
		if (augmentJob) augmentJob(job);
		effect = new ReactiveEffect(getter);
		effect.scheduler = scheduler ? () => scheduler(job, false) : job;
		boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
		cleanup = effect.onStop = () => {
			const cleanups = cleanupMap.get(effect);
			if (cleanups) {
				if (call) call(cleanups, 4);
				else for (const cleanup2 of cleanups) cleanup2();
				cleanupMap.delete(effect);
			}
		};
		if (cb) if (immediate) job(true);
		else oldValue = effect.run();
		else if (scheduler) scheduler(job.bind(null, true), true);
		else effect.run();
		watchHandle.pause = effect.pause.bind(effect);
		watchHandle.resume = effect.resume.bind(effect);
		watchHandle.stop = watchHandle;
		return watchHandle;
	}
	function traverse(value, depth = Infinity, seen) {
		if (depth <= 0 || !isObject(value) || value["__v_skip"]) return value;
		seen = seen || new Map();
		if ((seen.get(value) || 0) >= depth) return value;
		seen.set(value, depth);
		depth--;
		if (isRef(value)) traverse(value.value, depth, seen);
		else if (isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], depth, seen);
		else if (isSet(value) || isMap(value)) value.forEach((v) => {
			traverse(v, depth, seen);
		});
		else if (isPlainObject(value)) {
			for (const key in value) traverse(value[key], depth, seen);
			for (const key of Object.getOwnPropertySymbols(value)) if (Object.prototype.propertyIsEnumerable.call(value, key)) traverse(value[key], depth, seen);
		}
		return value;
	}
	function callWithErrorHandling(fn, instance, type, args) {
		try {
			return args ? fn(...args) : fn();
		} catch (err) {
			handleError(err, instance, type);
		}
	}
	function callWithAsyncErrorHandling(fn, instance, type, args) {
		if (isFunction(fn)) {
			const res = callWithErrorHandling(fn, instance, type, args);
			if (res && isPromise(res)) res.catch((err) => {
				handleError(err, instance, type);
			});
			return res;
		}
		if (isArray(fn)) {
			const values = [];
			for (let i = 0; i < fn.length; i++) values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
			return values;
		}
	}
	function handleError(err, instance, type, throwInDev = true) {
		const contextVNode = instance ? instance.vnode : null;
		const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
		if (instance) {
			let cur = instance.parent;
			const exposedInstance = instance.proxy;
			const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
			while (cur) {
				const errorCapturedHooks = cur.ec;
				if (errorCapturedHooks) {
					for (let i = 0; i < errorCapturedHooks.length; i++) if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
				}
				cur = cur.parent;
			}
			if (errorHandler) {
				pauseTracking();
				callWithErrorHandling(errorHandler, null, 10, [
					err,
					exposedInstance,
					errorInfo
				]);
				resetTracking();
				return;
			}
		}
		logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
	}
	function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
		if (throwInProd) throw err;
		else console.error(err);
	}
	var queue = [];
	var flushIndex = -1;
	var pendingPostFlushCbs = [];
	var activePostFlushCbs = null;
	var postFlushIndex = 0;
	var resolvedPromise = Promise.resolve();
	var currentFlushPromise = null;
	function nextTick(fn) {
		const p = currentFlushPromise || resolvedPromise;
		return fn ? p.then(this ? fn.bind(this) : fn) : p;
	}
	function findInsertionIndex(id) {
		let start = flushIndex + 1;
		let end = queue.length;
		while (start < end) {
			const middle = start + end >>> 1;
			const middleJob = queue[middle];
			const middleJobId = getId(middleJob);
			if (middleJobId < id || middleJobId === id && middleJob.flags & 2) start = middle + 1;
			else end = middle;
		}
		return start;
	}
	function queueJob(job) {
		if (!(job.flags & 1)) {
			const jobId = getId(job);
			const lastJob = queue[queue.length - 1];
			if (!lastJob || !(job.flags & 2) && jobId >= getId(lastJob)) queue.push(job);
			else queue.splice(findInsertionIndex(jobId), 0, job);
			job.flags |= 1;
			queueFlush();
		}
	}
	function queueFlush() {
		if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs);
	}
	function queuePostFlushCb(cb) {
		if (!isArray(cb)) {
			if (activePostFlushCbs && cb.id === -1) activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
			else if (!(cb.flags & 1)) {
				pendingPostFlushCbs.push(cb);
				cb.flags |= 1;
			}
		} else pendingPostFlushCbs.push(...cb);
		queueFlush();
	}
	function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
		for (; i < queue.length; i++) {
			const cb = queue[i];
			if (cb && cb.flags & 2) {
				if (instance && cb.id !== instance.uid) continue;
				queue.splice(i, 1);
				i--;
				if (cb.flags & 4) cb.flags &= -2;
				cb();
				if (!(cb.flags & 4)) cb.flags &= -2;
			}
		}
	}
	function flushPostFlushCbs(seen) {
		if (pendingPostFlushCbs.length) {
			const deduped = [...new Set(pendingPostFlushCbs)].sort((a, b) => getId(a) - getId(b));
			pendingPostFlushCbs.length = 0;
			if (activePostFlushCbs) {
				activePostFlushCbs.push(...deduped);
				return;
			}
			activePostFlushCbs = deduped;
			for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
				const cb = activePostFlushCbs[postFlushIndex];
				if (cb.flags & 4) cb.flags &= -2;
				if (!(cb.flags & 8)) cb();
				cb.flags &= -2;
			}
			activePostFlushCbs = null;
			postFlushIndex = 0;
		}
	}
	var getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
	function flushJobs(seen) {
		try {
			for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
				const job = queue[flushIndex];
				if (job && !(job.flags & 8)) {
					if (job.flags & 4) job.flags &= -2;
					callWithErrorHandling(job, job.i, job.i ? 15 : 14);
					if (!(job.flags & 4)) job.flags &= -2;
				}
			}
		} finally {
			for (; flushIndex < queue.length; flushIndex++) {
				const job = queue[flushIndex];
				if (job) job.flags &= -2;
			}
			flushIndex = -1;
			queue.length = 0;
			flushPostFlushCbs(seen);
			currentFlushPromise = null;
			if (queue.length || pendingPostFlushCbs.length) flushJobs(seen);
		}
	}
	var currentRenderingInstance = null;
	var currentScopeId = null;
	function setCurrentRenderingInstance(instance) {
		const prev = currentRenderingInstance;
		currentRenderingInstance = instance;
		currentScopeId = instance && instance.type.__scopeId || null;
		return prev;
	}
	function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
		if (!ctx) return fn;
		if (fn._n) return fn;
		const renderFnWithContext = (...args) => {
			if (renderFnWithContext._d) setBlockTracking(-1);
			const prevInstance = setCurrentRenderingInstance(ctx);
			let res;
			try {
				res = fn(...args);
			} finally {
				setCurrentRenderingInstance(prevInstance);
				if (renderFnWithContext._d) setBlockTracking(1);
			}
			return res;
		};
		renderFnWithContext._n = true;
		renderFnWithContext._c = true;
		renderFnWithContext._d = true;
		return renderFnWithContext;
	}
	function withDirectives(vnode, directives) {
		if (currentRenderingInstance === null) return vnode;
		const instance = getComponentPublicInstance(currentRenderingInstance);
		const bindings = vnode.dirs || (vnode.dirs = []);
		for (let i = 0; i < directives.length; i++) {
			let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
			if (dir) {
				if (isFunction(dir)) dir = {
					mounted: dir,
					updated: dir
				};
				if (dir.deep) traverse(value);
				bindings.push({
					dir,
					instance,
					value,
					oldValue: void 0,
					arg,
					modifiers
				});
			}
		}
		return vnode;
	}
	function invokeDirectiveHook(vnode, prevVNode, instance, name) {
		const bindings = vnode.dirs;
		const oldBindings = prevVNode && prevVNode.dirs;
		for (let i = 0; i < bindings.length; i++) {
			const binding = bindings[i];
			if (oldBindings) binding.oldValue = oldBindings[i].value;
			let hook = binding.dir[name];
			if (hook) {
				pauseTracking();
				callWithAsyncErrorHandling(hook, instance, 8, [
					vnode.el,
					binding,
					vnode,
					prevVNode
				]);
				resetTracking();
			}
		}
	}
	function provide(key, value) {
		if (currentInstance) {
			let provides = currentInstance.provides;
			const parentProvides = currentInstance.parent && currentInstance.parent.provides;
			if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
			provides[key] = value;
		}
	}
	function inject(key, defaultValue, treatDefaultAsFactory = false) {
		const instance = getCurrentInstance();
		if (instance || currentApp) {
			let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
			if (provides && key in provides) return provides[key];
			else if (arguments.length > 1) return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
		}
	}
	var ssrContextKey = Symbol.for("v-scx");
	var useSSRContext = () => {
		{
			const ctx = inject(ssrContextKey);
			if (!ctx) {}
			return ctx;
		}
	};
	function watchEffect(effect, options) {
		return doWatch(effect, null, options);
	}
	function watchSyncEffect(effect, options) {
		return doWatch(effect, null, { flush: "sync" });
	}
	function watch(source, cb, options) {
		return doWatch(source, cb, options);
	}
	function doWatch(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, flush, once } = options;
		const baseWatchOptions = extend({}, options);
		const runsImmediately = cb && immediate || !cb && flush !== "post";
		let ssrCleanup;
		if (isInSSRComponentSetup) {
			if (flush === "sync") {
				const ctx = useSSRContext();
				ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
			} else if (!runsImmediately) {
				const watchStopHandle = () => {};
				watchStopHandle.stop = NOOP;
				watchStopHandle.resume = NOOP;
				watchStopHandle.pause = NOOP;
				return watchStopHandle;
			}
		}
		const instance = currentInstance;
		baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
		let isPre = false;
		if (flush === "post") baseWatchOptions.scheduler = (job) => {
			queuePostRenderEffect(job, instance && instance.suspense);
		};
		else if (flush !== "sync") {
			isPre = true;
			baseWatchOptions.scheduler = (job, isFirstRun) => {
				if (isFirstRun) job();
				else queueJob(job);
			};
		}
		baseWatchOptions.augmentJob = (job) => {
			if (cb) job.flags |= 4;
			if (isPre) {
				job.flags |= 2;
				if (instance) {
					job.id = instance.uid;
					job.i = instance;
				}
			}
		};
		const watchHandle = watch$1(source, cb, baseWatchOptions);
		if (isInSSRComponentSetup) {
			if (ssrCleanup) ssrCleanup.push(watchHandle);
			else if (runsImmediately) watchHandle();
		}
		return watchHandle;
	}
	function instanceWatch(source, value, options) {
		const publicThis = this.proxy;
		const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
		let cb;
		if (isFunction(value)) cb = value;
		else {
			cb = value.handler;
			options = value;
		}
		const reset = setCurrentInstance(this);
		const res = doWatch(getter, cb.bind(publicThis), options);
		reset();
		return res;
	}
	function createPathGetter(ctx, path) {
		const segments = path.split(".");
		return () => {
			let cur = ctx;
			for (let i = 0; i < segments.length && cur; i++) cur = cur[segments[i]];
			return cur;
		};
	}
	var pendingMounts = new WeakMap();
	var TeleportEndKey = Symbol("_vte");
	var isTeleport = (type) => type.__isTeleport;
	var isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
	var isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
	var isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
	var isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
	var resolveTarget = (props, select) => {
		const targetSelector = props && props.to;
		if (isString(targetSelector)) if (!select) return null;
		else return select(targetSelector);
		else return targetSelector;
	};
	var TeleportImpl = {
		name: "Teleport",
		__isTeleport: true,
		process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
			const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment, parentNode } } = internals;
			const disabled = isTeleportDisabled(n2.props);
			let { dynamicChildren } = n2;
			const mount = (vnode, container2, anchor2) => {
				if (vnode.shapeFlag & 16) mountChildren(vnode.children, container2, anchor2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			};
			const mountToTarget = (vnode = n2) => {
				const disabled2 = isTeleportDisabled(vnode.props);
				const target = vnode.target = resolveTarget(vnode.props, querySelector);
				const targetAnchor = prepareAnchor(target, vnode, createText, insert);
				if (target) {
					if (namespace !== "svg" && isTargetSVG(target)) namespace = "svg";
					else if (namespace !== "mathml" && isTargetMathML(target)) namespace = "mathml";
					if (parentComponent && parentComponent.isCE) (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = new Set())).add(target);
					if (!disabled2) {
						mount(vnode, target, targetAnchor);
						updateCssVars(vnode, false);
					}
				}
			};
			const queuePendingMount = (vnode) => {
				const mountJob = () => {
					if (pendingMounts.get(vnode) !== mountJob) return;
					pendingMounts.delete(vnode);
					if (isTeleportDisabled(vnode.props)) {
						mount(vnode, parentNode(vnode.el) || container, vnode.anchor);
						updateCssVars(vnode, true);
					}
					mountToTarget(vnode);
				};
				pendingMounts.set(vnode, mountJob);
				queuePostRenderEffect(mountJob, parentSuspense);
			};
			if (n1 == null) {
				const placeholder = n2.el = createText("");
				const mainAnchor = n2.anchor = createText("");
				insert(placeholder, container, anchor);
				insert(mainAnchor, container, anchor);
				if (isTeleportDeferred(n2.props) || parentSuspense && parentSuspense.pendingBranch) {
					queuePendingMount(n2);
					return;
				}
				if (disabled) {
					mount(n2, container, mainAnchor);
					updateCssVars(n2, true);
				}
				mountToTarget();
			} else {
				n2.el = n1.el;
				const mainAnchor = n2.anchor = n1.anchor;
				const pendingMount = pendingMounts.get(n1);
				if (pendingMount) {
					pendingMount.flags |= 8;
					pendingMounts.delete(n1);
					queuePendingMount(n2);
					return;
				}
				n2.targetStart = n1.targetStart;
				const target = n2.target = n1.target;
				const targetAnchor = n2.targetAnchor = n1.targetAnchor;
				const wasDisabled = isTeleportDisabled(n1.props);
				const currentContainer = wasDisabled ? container : target;
				const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
				if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
				else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
				if (dynamicChildren) {
					patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, namespace, slotScopeIds);
					traverseStaticChildren(n1, n2, true);
				} else if (!optimized) patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, false);
				if (disabled) {
					if (!wasDisabled) moveTeleport(n2, container, mainAnchor, internals, 1);
					else if (n2.props && n1.props && n2.props.to !== n1.props.to) n2.props.to = n1.props.to;
				} else if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
					const nextTarget = n2.target = resolveTarget(n2.props, querySelector);
					if (nextTarget) moveTeleport(n2, nextTarget, null, internals, 0);
				} else if (wasDisabled) moveTeleport(n2, target, targetAnchor, internals, 1);
				updateCssVars(n2, disabled);
			}
		},
		remove(vnode, parentComponent, parentSuspense, { um: unmount, o: { remove: hostRemove } }, doRemove) {
			const { shapeFlag, children, anchor, targetStart, targetAnchor, target, props } = vnode;
			const shouldRemove = doRemove || !isTeleportDisabled(props);
			const pendingMount = pendingMounts.get(vnode);
			if (pendingMount) {
				pendingMount.flags |= 8;
				pendingMounts.delete(vnode);
			}
			if (target) {
				hostRemove(targetStart);
				hostRemove(targetAnchor);
			}
			doRemove && hostRemove(anchor);
			if (!pendingMount && shapeFlag & 16) for (let i = 0; i < children.length; i++) {
				const child = children[i];
				unmount(child, parentComponent, parentSuspense, shouldRemove, !!child.dynamicChildren);
			}
		},
		move: moveTeleport,
		hydrate: hydrateTeleport
	};
	function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
		if (moveType === 0) insert(vnode.targetAnchor, container, parentAnchor);
		const { el, anchor, shapeFlag, children, props } = vnode;
		const isReorder = moveType === 2;
		if (isReorder) insert(el, container, parentAnchor);
		if (!pendingMounts.has(vnode) && (!isReorder || isTeleportDisabled(props))) {
			if (shapeFlag & 16) for (let i = 0; i < children.length; i++) move(children[i], container, parentAnchor, 2);
		}
		if (isReorder) insert(anchor, container, parentAnchor);
	}
	function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector, insert, createText } }, hydrateChildren) {
		function hydrateAnchor(target2, targetNode) {
			let targetAnchor = targetNode;
			while (targetAnchor) {
				if (targetAnchor && targetAnchor.nodeType === 8) {
					if (targetAnchor.data === "teleport start anchor") vnode.targetStart = targetAnchor;
					else if (targetAnchor.data === "teleport anchor") {
						vnode.targetAnchor = targetAnchor;
						target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
						break;
					}
				}
				targetAnchor = nextSibling(targetAnchor);
			}
		}
		function hydrateDisabledTeleport(node2, vnode2) {
			vnode2.anchor = hydrateChildren(nextSibling(node2), vnode2, parentNode(node2), parentComponent, parentSuspense, slotScopeIds, optimized);
		}
		const target = vnode.target = resolveTarget(vnode.props, querySelector);
		const disabled = isTeleportDisabled(vnode.props);
		if (target) {
			const targetNode = target._lpa || target.firstChild;
			if (vnode.shapeFlag & 16) if (disabled) {
				hydrateDisabledTeleport(node, vnode);
				hydrateAnchor(target, targetNode);
				if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert, parentNode(node) === target ? node : null);
			} else {
				vnode.anchor = nextSibling(node);
				hydrateAnchor(target, targetNode);
				if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert);
				hydrateChildren(targetNode && nextSibling(targetNode), vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
			}
			updateCssVars(vnode, disabled);
		} else if (disabled) {
			if (vnode.shapeFlag & 16) {
				hydrateDisabledTeleport(node, vnode);
				vnode.targetStart = node;
				vnode.targetAnchor = nextSibling(node);
			}
		}
		return vnode.anchor && nextSibling(vnode.anchor);
	}
	var Teleport = TeleportImpl;
	function updateCssVars(vnode, isDisabled) {
		const ctx = vnode.ctx;
		if (ctx && ctx.ut) {
			let node, anchor;
			if (isDisabled) {
				node = vnode.el;
				anchor = vnode.anchor;
			} else {
				node = vnode.targetStart;
				anchor = vnode.targetAnchor;
			}
			while (node && node !== anchor) {
				if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
				node = node.nextSibling;
			}
			ctx.ut();
		}
	}
	function prepareAnchor(target, vnode, createText, insert, anchor = null) {
		const targetStart = vnode.targetStart = createText("");
		const targetAnchor = vnode.targetAnchor = createText("");
		targetStart[TeleportEndKey] = targetAnchor;
		if (target) {
			insert(targetStart, target, anchor);
			insert(targetAnchor, target, anchor);
		}
		return targetAnchor;
	}
	var leaveCbKey = Symbol("_leaveCb");
	var enterCbKey = Symbol("_enterCb");
	function useTransitionState() {
		const state = {
			isMounted: false,
			isLeaving: false,
			isUnmounting: false,
			leavingVNodes: new Map()
		};
		onMounted(() => {
			state.isMounted = true;
		});
		onBeforeUnmount(() => {
			state.isUnmounting = true;
		});
		return state;
	}
	var TransitionHookValidator = [Function, Array];
	var BaseTransitionPropsValidators = {
		mode: String,
		appear: Boolean,
		persisted: Boolean,
		onBeforeEnter: TransitionHookValidator,
		onEnter: TransitionHookValidator,
		onAfterEnter: TransitionHookValidator,
		onEnterCancelled: TransitionHookValidator,
		onBeforeLeave: TransitionHookValidator,
		onLeave: TransitionHookValidator,
		onAfterLeave: TransitionHookValidator,
		onLeaveCancelled: TransitionHookValidator,
		onBeforeAppear: TransitionHookValidator,
		onAppear: TransitionHookValidator,
		onAfterAppear: TransitionHookValidator,
		onAppearCancelled: TransitionHookValidator
	};
	var recursiveGetSubtree = (instance) => {
		const subTree = instance.subTree;
		return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
	};
	var BaseTransitionImpl = {
		name: `BaseTransition`,
		props: BaseTransitionPropsValidators,
		setup(props, { slots }) {
			const instance = getCurrentInstance();
			const state = useTransitionState();
			return () => {
				const children = slots.default && getTransitionRawChildren(slots.default(), true);
				const child = children && children.length ? findNonCommentChild(children) : instance.subTree ? createCommentVNode() : void 0;
				if (!child) return;
				const rawProps = toRaw(props);
				const { mode } = rawProps;
				if (state.isLeaving) return emptyPlaceholder(child);
				const innerChild = getInnerChild$1(child);
				if (!innerChild) return emptyPlaceholder(child);
				let enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance, (hooks) => enterHooks = hooks);
				if (innerChild.type !== Comment) setTransitionHooks(innerChild, enterHooks);
				let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
				if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment) {
					let leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
					setTransitionHooks(oldInnerChild, leavingHooks);
					if (mode === "out-in" && innerChild.type !== Comment) {
						state.isLeaving = true;
						leavingHooks.afterLeave = () => {
							state.isLeaving = false;
							if (!(instance.job.flags & 8)) instance.update();
							delete leavingHooks.afterLeave;
							oldInnerChild = void 0;
						};
						return emptyPlaceholder(child);
					} else if (mode === "in-out" && innerChild.type !== Comment) leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
						const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
						leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
						el[leaveCbKey] = () => {
							earlyRemove();
							el[leaveCbKey] = void 0;
							delete enterHooks.delayedLeave;
							oldInnerChild = void 0;
						};
						enterHooks.delayedLeave = () => {
							delayedLeave();
							delete enterHooks.delayedLeave;
							oldInnerChild = void 0;
						};
					};
					else oldInnerChild = void 0;
				} else if (oldInnerChild) oldInnerChild = void 0;
				return child;
			};
		}
	};
	function findNonCommentChild(children) {
		let child = children[0];
		if (children.length > 1) {
			for (const c of children) if (c.type !== Comment) {
				child = c;
				break;
			}
		}
		return child;
	}
	var BaseTransition = BaseTransitionImpl;
	function getLeavingNodesForType(state, vnode) {
		const { leavingVNodes } = state;
		let leavingVNodesCache = leavingVNodes.get(vnode.type);
		if (!leavingVNodesCache) {
			leavingVNodesCache = Object.create(null);
			leavingVNodes.set(vnode.type, leavingVNodesCache);
		}
		return leavingVNodesCache;
	}
	function resolveTransitionHooks(vnode, props, state, instance, postClone) {
		const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
		const key = String(vnode.key);
		const leavingVNodesCache = getLeavingNodesForType(state, vnode);
		const callHook = (hook, args) => {
			hook && callWithAsyncErrorHandling(hook, instance, 9, args);
		};
		const callAsyncHook = (hook, args) => {
			const done = args[1];
			callHook(hook, args);
			if (isArray(hook)) {
				if (hook.every((hook2) => hook2.length <= 1)) done();
			} else if (hook.length <= 1) done();
		};
		const hooks = {
			mode,
			persisted,
			beforeEnter(el) {
				let hook = onBeforeEnter;
				if (!state.isMounted) if (appear) hook = onBeforeAppear || onBeforeEnter;
				else return;
				if (el[leaveCbKey]) el[leaveCbKey](true);
				const leavingVNode = leavingVNodesCache[key];
				if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) leavingVNode.el[leaveCbKey]();
				callHook(hook, [el]);
			},
			enter(el) {
				if (leavingVNodesCache[key] === vnode) return;
				let hook = onEnter;
				let afterHook = onAfterEnter;
				let cancelHook = onEnterCancelled;
				if (!state.isMounted) if (appear) {
					hook = onAppear || onEnter;
					afterHook = onAfterAppear || onAfterEnter;
					cancelHook = onAppearCancelled || onEnterCancelled;
				} else return;
				let called = false;
				el[enterCbKey] = (cancelled) => {
					if (called) return;
					called = true;
					if (cancelled) callHook(cancelHook, [el]);
					else callHook(afterHook, [el]);
					if (hooks.delayedLeave) hooks.delayedLeave();
					el[enterCbKey] = void 0;
				};
				const done = el[enterCbKey].bind(null, false);
				if (hook) callAsyncHook(hook, [el, done]);
				else done();
			},
			leave(el, remove) {
				const key2 = String(vnode.key);
				if (el[enterCbKey]) el[enterCbKey](true);
				if (state.isUnmounting) return remove();
				callHook(onBeforeLeave, [el]);
				let called = false;
				el[leaveCbKey] = (cancelled) => {
					if (called) return;
					called = true;
					remove();
					if (cancelled) callHook(onLeaveCancelled, [el]);
					else callHook(onAfterLeave, [el]);
					el[leaveCbKey] = void 0;
					if (leavingVNodesCache[key2] === vnode) delete leavingVNodesCache[key2];
				};
				const done = el[leaveCbKey].bind(null, false);
				leavingVNodesCache[key2] = vnode;
				if (onLeave) callAsyncHook(onLeave, [el, done]);
				else done();
			},
			clone(vnode2) {
				const hooks2 = resolveTransitionHooks(vnode2, props, state, instance, postClone);
				if (postClone) postClone(hooks2);
				return hooks2;
			}
		};
		return hooks;
	}
	function emptyPlaceholder(vnode) {
		if (isKeepAlive(vnode)) {
			vnode = cloneVNode(vnode);
			vnode.children = null;
			return vnode;
		}
	}
	function getInnerChild$1(vnode) {
		if (!isKeepAlive(vnode)) {
			if (isTeleport(vnode.type) && vnode.children) return findNonCommentChild(vnode.children);
			return vnode;
		}
		if (vnode.component) return vnode.component.subTree;
		const { shapeFlag, children } = vnode;
		if (children) {
			if (shapeFlag & 16) return children[0];
			if (shapeFlag & 32 && isFunction(children.default)) return children.default();
		}
	}
	function setTransitionHooks(vnode, hooks) {
		if (vnode.shapeFlag & 6 && vnode.component) {
			vnode.transition = hooks;
			setTransitionHooks(vnode.component.subTree, hooks);
		} else if (vnode.shapeFlag & 128) {
			vnode.ssContent.transition = hooks.clone(vnode.ssContent);
			vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
		} else vnode.transition = hooks;
	}
	function getTransitionRawChildren(children, keepComment = false, parentKey) {
		let ret = [];
		let keyedFragmentCount = 0;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
			if (child.type === Fragment) {
				if (child.patchFlag & 128) keyedFragmentCount++;
				ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
			} else if (keepComment || child.type !== Comment) ret.push(key != null ? cloneVNode(child, { key }) : child);
		}
		if (keyedFragmentCount > 1) for (let i = 0; i < ret.length; i++) ret[i].patchFlag = -2;
		return ret;
	}
	function defineComponent(options, extraOptions) {
		return isFunction(options) ? (() => extend({ name: options.name }, extraOptions, { setup: options }))() : options;
	}
	function markAsyncBoundary(instance) {
		instance.ids = [
			instance.ids[0] + instance.ids[2]++ + "-",
			0,
			0
		];
	}
	function useTemplateRef(key) {
		const i = getCurrentInstance();
		const r = shallowRef(null);
		if (i) {
			const refs = i.refs === EMPTY_OBJ ? i.refs = {} : i.refs;
			Object.defineProperty(refs, key, {
				enumerable: true,
				get: () => r.value,
				set: (val) => r.value = val
			});
		}
		return r;
	}
	function isTemplateRefKey(refs, key) {
		let desc;
		return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
	}
	var pendingSetRefMap = new WeakMap();
	function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
		if (isArray(rawRef)) {
			rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
			return;
		}
		if (isAsyncWrapper(vnode) && !isUnmount) {
			if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
			return;
		}
		const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
		const value = isUnmount ? null : refValue;
		const { i: owner, r: ref } = rawRef;
		const oldRef = oldRawRef && oldRawRef.r;
		const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
		const setupState = owner.setupState;
		const rawSetupState = toRaw(setupState);
		const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
			if (isTemplateRefKey(refs, key)) return false;
			return hasOwn(rawSetupState, key);
		};
		const canSetRef = (ref2, key) => {
			if (key && isTemplateRefKey(refs, key)) return false;
			return true;
		};
		if (oldRef != null && oldRef !== ref) {
			invalidatePendingSetRef(oldRawRef);
			if (isString(oldRef)) {
				refs[oldRef] = null;
				if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
			} else if (isRef(oldRef)) {
				const oldRawRefAtom = oldRawRef;
				if (canSetRef(oldRef, oldRawRefAtom.k)) oldRef.value = null;
				if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
			}
		}
		if (isFunction(ref)) callWithErrorHandling(ref, owner, 12, [value, refs]);
		else {
			const _isString = isString(ref);
			const _isRef = isRef(ref);
			if (_isString || _isRef) {
				const doSet = () => {
					if (rawRef.f) {
						const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef(ref) || !rawRef.k ? ref.value : refs[rawRef.k];
						if (isUnmount) isArray(existing) && remove(existing, refValue);
						else if (!isArray(existing)) if (_isString) {
							refs[ref] = [refValue];
							if (canSetSetupRef(ref)) setupState[ref] = refs[ref];
						} else {
							const newVal = [refValue];
							if (canSetRef(ref, rawRef.k)) ref.value = newVal;
							if (rawRef.k) refs[rawRef.k] = newVal;
						}
						else if (!existing.includes(refValue)) existing.push(refValue);
					} else if (_isString) {
						refs[ref] = value;
						if (canSetSetupRef(ref)) setupState[ref] = value;
					} else if (_isRef) {
						if (canSetRef(ref, rawRef.k)) ref.value = value;
						if (rawRef.k) refs[rawRef.k] = value;
					}
				};
				if (value) {
					const job = () => {
						doSet();
						pendingSetRefMap.delete(rawRef);
					};
					job.id = -1;
					pendingSetRefMap.set(rawRef, job);
					queuePostRenderEffect(job, parentSuspense);
				} else {
					invalidatePendingSetRef(rawRef);
					doSet();
				}
			}
		}
	}
	function invalidatePendingSetRef(rawRef) {
		const pendingSetRef = pendingSetRefMap.get(rawRef);
		if (pendingSetRef) {
			pendingSetRef.flags |= 8;
			pendingSetRefMap.delete(rawRef);
		}
	}
	getGlobalThis().requestIdleCallback;
	getGlobalThis().cancelIdleCallback;
	var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
	var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
	function onActivated(hook, target) {
		registerKeepAliveHook(hook, "a", target);
	}
	function onDeactivated(hook, target) {
		registerKeepAliveHook(hook, "da", target);
	}
	function registerKeepAliveHook(hook, type, target = currentInstance) {
		const wrappedHook = hook.__wdc || (hook.__wdc = () => {
			let current = target;
			while (current) {
				if (current.isDeactivated) return;
				current = current.parent;
			}
			return hook();
		});
		injectHook(type, wrappedHook, target);
		if (target) {
			let current = target.parent;
			while (current && current.parent) {
				if (isKeepAlive(current.parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
				current = current.parent;
			}
		}
	}
	function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
		const injected = injectHook(type, hook, keepAliveRoot, true);
		onUnmounted(() => {
			remove(keepAliveRoot[type], injected);
		}, target);
	}
	function injectHook(type, hook, target = currentInstance, prepend = false) {
		if (target) {
			const hooks = target[type] || (target[type] = []);
			const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
				pauseTracking();
				const reset = setCurrentInstance(target);
				const res = callWithAsyncErrorHandling(hook, target, type, args);
				reset();
				resetTracking();
				return res;
			});
			if (prepend) hooks.unshift(wrappedHook);
			else hooks.push(wrappedHook);
			return wrappedHook;
		}
	}
	var createHook = (lifecycle) => (hook, target = currentInstance) => {
		if (!isInSSRComponentSetup || lifecycle === "sp") injectHook(lifecycle, (...args) => hook(...args), target);
	};
	var onBeforeMount = createHook("bm");
	var onMounted = createHook("m");
	var onBeforeUpdate = createHook("bu");
	var onUpdated = createHook("u");
	var onBeforeUnmount = createHook("bum");
	var onUnmounted = createHook("um");
	var onServerPrefetch = createHook("sp");
	var onRenderTriggered = createHook("rtg");
	var onRenderTracked = createHook("rtc");
	function onErrorCaptured(hook, target = currentInstance) {
		injectHook("ec", hook, target);
	}
	var NULL_DYNAMIC_COMPONENT = Symbol.for("v-ndc");
	function renderList(source, renderItem, cache, index) {
		let ret;
		const cached = cache && cache[index];
		const sourceIsArray = isArray(source);
		if (sourceIsArray || isString(source)) {
			const sourceIsReactiveArray = sourceIsArray && isReactive(source);
			let needsWrap = false;
			let isReadonlySource = false;
			if (sourceIsReactiveArray) {
				needsWrap = !isShallow(source);
				isReadonlySource = isReadonly(source);
				source = shallowReadArray(source);
			}
			ret = new Array(source.length);
			for (let i = 0, l = source.length; i < l; i++) ret[i] = renderItem(needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i], i, void 0, cached && cached[i]);
		} else if (typeof source === "number") {
			ret = new Array(source);
			for (let i = 0; i < source; i++) ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
		} else if (isObject(source)) if (source[Symbol.iterator]) ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
		else {
			const keys = Object.keys(source);
			ret = new Array(keys.length);
			for (let i = 0, l = keys.length; i < l; i++) {
				const key = keys[i];
				ret[i] = renderItem(source[key], key, i, cached && cached[i]);
			}
		}
		else ret = [];
		if (cache) cache[index] = ret;
		return ret;
	}
	function renderSlot(slots, name, props = {}, fallback, noSlotted) {
		if (currentRenderingInstance.ce || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.ce) {
			const hasProps = Object.keys(props).length > 0;
			if (name !== "default") props.name = name;
			return openBlock(), createBlock(Fragment, null, [createVNode("slot", props, fallback && fallback())], hasProps ? -2 : 64);
		}
		let slot = slots[name];
		if (slot && slot._c) slot._d = false;
		openBlock();
		const validSlotContent = slot && ensureValidVNode(slot(props));
		const slotKey = props.key || validSlotContent && validSlotContent.key;
		const rendered = createBlock(Fragment, { key: (slotKey && !isSymbol(slotKey) ? slotKey : `_${name}`) + (!validSlotContent && fallback ? "_fb" : "") }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
		if (!noSlotted && rendered.scopeId) rendered.slotScopeIds = [rendered.scopeId + "-s"];
		if (slot && slot._c) slot._d = true;
		return rendered;
	}
	function ensureValidVNode(vnodes) {
		return vnodes.some((child) => {
			if (!isVNode(child)) return true;
			if (child.type === Comment) return false;
			if (child.type === Fragment && !ensureValidVNode(child.children)) return false;
			return true;
		}) ? vnodes : null;
	}
	var getPublicInstance = (i) => {
		if (!i) return null;
		if (isStatefulComponent(i)) return getComponentPublicInstance(i);
		return getPublicInstance(i.parent);
	};
	var publicPropertiesMap = extend(Object.create(null), {
		$: (i) => i,
		$el: (i) => i.vnode.el,
		$data: (i) => i.data,
		$props: (i) => i.props,
		$attrs: (i) => i.attrs,
		$slots: (i) => i.slots,
		$refs: (i) => i.refs,
		$parent: (i) => getPublicInstance(i.parent),
		$root: (i) => getPublicInstance(i.root),
		$host: (i) => i.ce,
		$emit: (i) => i.emit,
		$options: (i) => resolveMergedOptions(i),
		$forceUpdate: (i) => i.f || (i.f = () => {
			queueJob(i.update);
		}),
		$nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
		$watch: (i) => instanceWatch.bind(i)
	});
	var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
	var PublicInstanceProxyHandlers = {
		get({ _: instance }, key) {
			if (key === "__v_skip") return true;
			const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
			if (key[0] !== "$") {
				const n = accessCache[key];
				if (n !== void 0) switch (n) {
					case 1: return setupState[key];
					case 2: return data[key];
					case 4: return ctx[key];
					case 3: return props[key];
				}
				else if (hasSetupBinding(setupState, key)) {
					accessCache[key] = 1;
					return setupState[key];
				} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
					accessCache[key] = 2;
					return data[key];
				} else if (hasOwn(props, key)) {
					accessCache[key] = 3;
					return props[key];
				} else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
					accessCache[key] = 4;
					return ctx[key];
				} else if (shouldCacheAccess) accessCache[key] = 0;
			}
			const publicGetter = publicPropertiesMap[key];
			let cssModule, globalProperties;
			if (publicGetter) {
				if (key === "$attrs") track(instance.attrs, "get", "");
				return publicGetter(instance);
			} else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
			else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
				accessCache[key] = 4;
				return ctx[key];
			} else if (globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) return globalProperties[key];
		},
		set({ _: instance }, key, value) {
			const { data, setupState, ctx } = instance;
			if (hasSetupBinding(setupState, key)) {
				setupState[key] = value;
				return true;
			} else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
				data[key] = value;
				return true;
			} else if (hasOwn(instance.props, key)) return false;
			if (key[0] === "$" && key.slice(1) in instance) return false;
			else ctx[key] = value;
			return true;
		},
		has({ _: { data, setupState, accessCache, ctx, appContext, props, type } }, key) {
			let cssModules;
			return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
		},
		defineProperty(target, key, descriptor) {
			if (descriptor.get != null) target._.accessCache[key] = 0;
			else if (hasOwn(descriptor, "value")) this.set(target, key, descriptor.value, null);
			return Reflect.defineProperty(target, key, descriptor);
		}
	};
	function normalizePropsOrEmits(props) {
		return isArray(props) ? props.reduce((normalized, p) => (normalized[p] = null, normalized), {}) : props;
	}
	function mergeModels(a, b) {
		if (!a || !b) return a || b;
		if (isArray(a) && isArray(b)) return a.concat(b);
		return extend({}, normalizePropsOrEmits(a), normalizePropsOrEmits(b));
	}
	var shouldCacheAccess = true;
	function applyOptions(instance) {
		const options = resolveMergedOptions(instance);
		const publicThis = instance.proxy;
		const ctx = instance.ctx;
		shouldCacheAccess = false;
		if (options.beforeCreate) callHook$1(options.beforeCreate, instance, "bc");
		const { data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, expose, inheritAttrs, components, directives, filters } = options;
		const checkDuplicateProperties = null;
		if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
		if (methods) for (const key in methods) {
			const methodHandler = methods[key];
			if (isFunction(methodHandler)) ctx[key] = methodHandler.bind(publicThis);
		}
		if (dataOptions) {
			const data = dataOptions.call(publicThis, publicThis);
			if (!isObject(data)) {} else instance.data = reactive(data);
		}
		shouldCacheAccess = true;
		if (computedOptions) for (const key in computedOptions) {
			const opt = computedOptions[key];
			const c = computed({
				get: isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP,
				set: !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP
			});
			Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => c.value,
				set: (v) => c.value = v
			});
		}
		if (watchOptions) for (const key in watchOptions) createWatcher(watchOptions[key], ctx, publicThis, key);
		if (provideOptions) {
			const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
			Reflect.ownKeys(provides).forEach((key) => {
				provide(key, provides[key]);
			});
		}
		if (created) callHook$1(created, instance, "c");
		function registerLifecycleHook(register, hook) {
			if (isArray(hook)) hook.forEach((_hook) => register(_hook.bind(publicThis)));
			else if (hook) register(hook.bind(publicThis));
		}
		registerLifecycleHook(onBeforeMount, beforeMount);
		registerLifecycleHook(onMounted, mounted);
		registerLifecycleHook(onBeforeUpdate, beforeUpdate);
		registerLifecycleHook(onUpdated, updated);
		registerLifecycleHook(onActivated, activated);
		registerLifecycleHook(onDeactivated, deactivated);
		registerLifecycleHook(onErrorCaptured, errorCaptured);
		registerLifecycleHook(onRenderTracked, renderTracked);
		registerLifecycleHook(onRenderTriggered, renderTriggered);
		registerLifecycleHook(onBeforeUnmount, beforeUnmount);
		registerLifecycleHook(onUnmounted, unmounted);
		registerLifecycleHook(onServerPrefetch, serverPrefetch);
		if (isArray(expose)) {
			if (expose.length) {
				const exposed = instance.exposed || (instance.exposed = {});
				expose.forEach((key) => {
					Object.defineProperty(exposed, key, {
						get: () => publicThis[key],
						set: (val) => publicThis[key] = val,
						enumerable: true
					});
				});
			} else if (!instance.exposed) instance.exposed = {};
		}
		if (render && instance.render === NOOP) instance.render = render;
		if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
		if (components) instance.components = components;
		if (directives) instance.directives = directives;
		if (serverPrefetch) markAsyncBoundary(instance);
	}
	function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
		if (isArray(injectOptions)) injectOptions = normalizeInject(injectOptions);
		for (const key in injectOptions) {
			const opt = injectOptions[key];
			let injected;
			if (isObject(opt)) if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
			else injected = inject(opt.from || key);
			else injected = inject(opt);
			if (isRef(injected)) Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => injected.value,
				set: (v) => injected.value = v
			});
			else ctx[key] = injected;
		}
	}
	function callHook$1(hook, instance, type) {
		callWithAsyncErrorHandling(isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
	}
	function createWatcher(raw, ctx, publicThis, key) {
		let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
		if (isString(raw)) {
			const handler = ctx[raw];
			if (isFunction(handler)) watch(getter, handler);
		} else if (isFunction(raw)) watch(getter, raw.bind(publicThis));
		else if (isObject(raw)) if (isArray(raw)) raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
		else {
			const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
			if (isFunction(handler)) watch(getter, handler, raw);
		}
	}
	function resolveMergedOptions(instance) {
		const base = instance.type;
		const { mixins, extends: extendsOptions } = base;
		const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
		const cached = cache.get(base);
		let resolved;
		if (cached) resolved = cached;
		else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
		else {
			resolved = {};
			if (globalMixins.length) globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
			mergeOptions(resolved, base, optionMergeStrategies);
		}
		if (isObject(base)) cache.set(base, resolved);
		return resolved;
	}
	function mergeOptions(to, from, strats, asMixin = false) {
		const { mixins, extends: extendsOptions } = from;
		if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
		if (mixins) mixins.forEach((m) => mergeOptions(to, m, strats, true));
		for (const key in from) if (asMixin && key === "expose") {} else {
			const strat = internalOptionMergeStrats[key] || strats && strats[key];
			to[key] = strat ? strat(to[key], from[key]) : from[key];
		}
		return to;
	}
	var internalOptionMergeStrats = {
		data: mergeDataFn,
		props: mergeEmitsOrPropsOptions,
		emits: mergeEmitsOrPropsOptions,
		methods: mergeObjectOptions,
		computed: mergeObjectOptions,
		beforeCreate: mergeAsArray,
		created: mergeAsArray,
		beforeMount: mergeAsArray,
		mounted: mergeAsArray,
		beforeUpdate: mergeAsArray,
		updated: mergeAsArray,
		beforeDestroy: mergeAsArray,
		beforeUnmount: mergeAsArray,
		destroyed: mergeAsArray,
		unmounted: mergeAsArray,
		activated: mergeAsArray,
		deactivated: mergeAsArray,
		errorCaptured: mergeAsArray,
		serverPrefetch: mergeAsArray,
		components: mergeObjectOptions,
		directives: mergeObjectOptions,
		watch: mergeWatchOptions,
		provide: mergeDataFn,
		inject: mergeInject
	};
	function mergeDataFn(to, from) {
		if (!from) return to;
		if (!to) return from;
		return function mergedDataFn() {
			return extend(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
		};
	}
	function mergeInject(to, from) {
		return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
	}
	function normalizeInject(raw) {
		if (isArray(raw)) {
			const res = {};
			for (let i = 0; i < raw.length; i++) res[raw[i]] = raw[i];
			return res;
		}
		return raw;
	}
	function mergeAsArray(to, from) {
		return to ? [...new Set([].concat(to, from))] : from;
	}
	function mergeObjectOptions(to, from) {
		return to ? extend(Object.create(null), to, from) : from;
	}
	function mergeEmitsOrPropsOptions(to, from) {
		if (to) {
			if (isArray(to) && isArray(from)) return [...new Set([...to, ...from])];
			return extend(Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from != null ? from : {}));
		} else return from;
	}
	function mergeWatchOptions(to, from) {
		if (!to) return from;
		if (!from) return to;
		const merged = extend(Object.create(null), to);
		for (const key in from) merged[key] = mergeAsArray(to[key], from[key]);
		return merged;
	}
	function createAppContext() {
		return {
			app: null,
			config: {
				isNativeTag: NO,
				performance: false,
				globalProperties: {},
				optionMergeStrategies: {},
				errorHandler: void 0,
				warnHandler: void 0,
				compilerOptions: {}
			},
			mixins: [],
			components: {},
			directives: {},
			provides: Object.create(null),
			optionsCache: new WeakMap(),
			propsCache: new WeakMap(),
			emitsCache: new WeakMap()
		};
	}
	var uid$1 = 0;
	function createAppAPI(render, hydrate) {
		return function createApp(rootComponent, rootProps = null) {
			if (!isFunction(rootComponent)) rootComponent = extend({}, rootComponent);
			if (rootProps != null && !isObject(rootProps)) rootProps = null;
			const context = createAppContext();
			const installedPlugins = new WeakSet();
			const pluginCleanupFns = [];
			let isMounted = false;
			const app = context.app = {
				_uid: uid$1++,
				_component: rootComponent,
				_props: rootProps,
				_container: null,
				_context: context,
				_instance: null,
				version: version$1,
				get config() {
					return context.config;
				},
				set config(v) {},
				use(plugin, ...options) {
					if (installedPlugins.has(plugin)) {} else if (plugin && isFunction(plugin.install)) {
						installedPlugins.add(plugin);
						plugin.install(app, ...options);
					} else if (isFunction(plugin)) {
						installedPlugins.add(plugin);
						plugin(app, ...options);
					}
					return app;
				},
				mixin(mixin) {
					if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
					return app;
				},
				component(name, component) {
					if (!component) return context.components[name];
					context.components[name] = component;
					return app;
				},
				directive(name, directive) {
					if (!directive) return context.directives[name];
					context.directives[name] = directive;
					return app;
				},
				mount(rootContainer, isHydrate, namespace) {
					if (!isMounted) {
						const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
						vnode.appContext = context;
						if (namespace === true) namespace = "svg";
						else if (namespace === false) namespace = void 0;
						if (isHydrate && hydrate) hydrate(vnode, rootContainer);
						else render(vnode, rootContainer, namespace);
						isMounted = true;
						app._container = rootContainer;
						rootContainer.__vue_app__ = app;
						return getComponentPublicInstance(vnode.component);
					}
				},
				onUnmount(cleanupFn) {
					pluginCleanupFns.push(cleanupFn);
				},
				unmount() {
					if (isMounted) {
						callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16);
						render(null, app._container);
						delete app._container.__vue_app__;
					}
				},
				provide(key, value) {
					context.provides[key] = value;
					return app;
				},
				runWithContext(fn) {
					const lastApp = currentApp;
					currentApp = app;
					try {
						return fn();
					} finally {
						currentApp = lastApp;
					}
				}
			};
			return app;
		};
	}
	var currentApp = null;
	function useModel(props, name, options = EMPTY_OBJ) {
		const i = getCurrentInstance();
		const camelizedName = camelize(name);
		const hyphenatedName = hyphenate(name);
		const modifiers = getModelModifiers(props, camelizedName);
		const res = customRef((track, trigger) => {
			let localValue;
			let prevSetValue = EMPTY_OBJ;
			let prevEmittedValue;
			watchSyncEffect(() => {
				const propValue = props[camelizedName];
				if (hasChanged(localValue, propValue)) {
					localValue = propValue;
					trigger();
				}
			});
			return {
				get() {
					track();
					return options.get ? options.get(localValue) : localValue;
				},
				set(value) {
					const emittedValue = options.set ? options.set(value) : value;
					if (!hasChanged(emittedValue, localValue) && !(prevSetValue !== EMPTY_OBJ && hasChanged(value, prevSetValue))) return;
					const rawProps = i.vnode.props;
					if (!(rawProps && (name in rawProps || camelizedName in rawProps || hyphenatedName in rawProps) && (`onUpdate:${name}` in rawProps || `onUpdate:${camelizedName}` in rawProps || `onUpdate:${hyphenatedName}` in rawProps))) {
						localValue = value;
						trigger();
					}
					i.emit(`update:${name}`, emittedValue);
					if (hasChanged(value, emittedValue) && hasChanged(value, prevSetValue) && !hasChanged(emittedValue, prevEmittedValue)) trigger();
					prevSetValue = value;
					prevEmittedValue = emittedValue;
				}
			};
		});
		res[Symbol.iterator] = () => {
			let i2 = 0;
			return { next() {
				if (i2 < 2) return {
					value: i2++ ? modifiers || EMPTY_OBJ : res,
					done: false
				};
				else return { done: true };
			} };
		};
		return res;
	}
	var getModelModifiers = (props, modelName) => {
		return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
	};
	function emit(instance, event, ...rawArgs) {
		if (instance.isUnmounted) return;
		const props = instance.vnode.props || EMPTY_OBJ;
		let args = rawArgs;
		const isModelListener = event.startsWith("update:");
		const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
		if (modifiers) {
			if (modifiers.trim) args = rawArgs.map((a) => isString(a) ? a.trim() : a);
			if (modifiers.number) args = rawArgs.map(looseToNumber);
		}
		let handlerName;
		let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize(event))];
		if (!handler && isModelListener) handler = props[handlerName = toHandlerKey(hyphenate(event))];
		if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
		const onceHandler = props[handlerName + `Once`];
		if (onceHandler) {
			if (!instance.emitted) instance.emitted = {};
			else if (instance.emitted[handlerName]) return;
			instance.emitted[handlerName] = true;
			callWithAsyncErrorHandling(onceHandler, instance, 6, args);
		}
	}
	var mixinEmitsCache = new WeakMap();
	function normalizeEmitsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
		const cached = cache.get(comp);
		if (cached !== void 0) return cached;
		const raw = comp.emits;
		let normalized = {};
		let hasExtends = false;
		if (!isFunction(comp)) {
			const extendEmits = (raw2) => {
				const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
				if (normalizedFromExtend) {
					hasExtends = true;
					extend(normalized, normalizedFromExtend);
				}
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
			if (comp.extends) extendEmits(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendEmits);
		}
		if (!raw && !hasExtends) {
			if (isObject(comp)) cache.set(comp, null);
			return null;
		}
		if (isArray(raw)) raw.forEach((key) => normalized[key] = null);
		else extend(normalized, raw);
		if (isObject(comp)) cache.set(comp, normalized);
		return normalized;
	}
	function isEmitListener(options, key) {
		if (!options || !isOn(key)) return false;
		key = key.slice(2).replace(/Once$/, "");
		return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
	}
	function renderComponentRoot(instance) {
		const { type: Component, vnode, proxy, withProxy, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, props, data, setupState, ctx, inheritAttrs } = instance;
		const prev = setCurrentRenderingInstance(instance);
		let result;
		let fallthroughAttrs;
		try {
			if (vnode.shapeFlag & 4) {
				const proxyToUse = withProxy || proxy;
				const thisProxy = proxyToUse;
				result = normalizeVNode(render.call(thisProxy, proxyToUse, renderCache, props, setupState, data, ctx));
				fallthroughAttrs = attrs;
			} else {
				const render2 = Component;
				result = normalizeVNode(render2.length > 1 ? render2(props, {
					attrs,
					slots,
					emit
				}) : render2(props, null));
				fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
			}
		} catch (err) {
			blockStack.length = 0;
			handleError(err, instance, 1);
			result = createVNode(Comment);
		}
		let root = result;
		if (fallthroughAttrs && inheritAttrs !== false) {
			const keys = Object.keys(fallthroughAttrs);
			const { shapeFlag } = root;
			if (keys.length) {
				if (shapeFlag & 7) {
					if (propsOptions && keys.some(isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
					root = cloneVNode(root, fallthroughAttrs, false, true);
				}
			}
		}
		if (vnode.dirs) {
			root = cloneVNode(root, null, false, true);
			root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
		}
		if (vnode.transition) setTransitionHooks(root, vnode.transition);
		result = root;
		setCurrentRenderingInstance(prev);
		return result;
	}
	var getFunctionalFallthrough = (attrs) => {
		let res;
		for (const key in attrs) if (key === "class" || key === "style" || isOn(key)) (res || (res = {}))[key] = attrs[key];
		return res;
	};
	var filterModelListeners = (attrs, props) => {
		const res = {};
		for (const key in attrs) if (!isModelListener(key) || !(key.slice(9) in props)) res[key] = attrs[key];
		return res;
	};
	function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
		const { props: prevProps, children: prevChildren, component } = prevVNode;
		const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
		const emits = component.emitsOptions;
		if (nextVNode.dirs || nextVNode.transition) return true;
		if (optimized && patchFlag >= 0) {
			if (patchFlag & 1024) return true;
			if (patchFlag & 16) {
				if (!prevProps) return !!nextProps;
				return hasPropsChanged(prevProps, nextProps, emits);
			} else if (patchFlag & 8) {
				const dynamicProps = nextVNode.dynamicProps;
				for (let i = 0; i < dynamicProps.length; i++) {
					const key = dynamicProps[i];
					if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) return true;
				}
			}
		} else {
			if (prevChildren || nextChildren) {
				if (!nextChildren || !nextChildren.$stable) return true;
			}
			if (prevProps === nextProps) return false;
			if (!prevProps) return !!nextProps;
			if (!nextProps) return true;
			return hasPropsChanged(prevProps, nextProps, emits);
		}
		return false;
	}
	function hasPropsChanged(prevProps, nextProps, emitsOptions) {
		const nextKeys = Object.keys(nextProps);
		if (nextKeys.length !== Object.keys(prevProps).length) return true;
		for (let i = 0; i < nextKeys.length; i++) {
			const key = nextKeys[i];
			if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) return true;
		}
		return false;
	}
	function hasPropValueChanged(nextProps, prevProps, key) {
		const nextProp = nextProps[key];
		const prevProp = prevProps[key];
		if (key === "style" && isObject(nextProp) && isObject(prevProp)) return !looseEqual(nextProp, prevProp);
		return nextProp !== prevProp;
	}
	function updateHOCHostEl({ vnode, parent, suspense }, el) {
		while (parent) {
			const root = parent.subTree;
			if (root.suspense && root.suspense.activeBranch === vnode) {
				root.suspense.vnode.el = root.el = el;
				vnode = root;
			}
			if (root === vnode) {
				(vnode = parent.vnode).el = el;
				parent = parent.parent;
			} else break;
		}
		if (suspense && suspense.activeBranch === vnode) suspense.vnode.el = el;
	}
	var internalObjectProto = {};
	var createInternalObject = () => Object.create(internalObjectProto);
	var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
	function initProps(instance, rawProps, isStateful, isSSR = false) {
		const props = {};
		const attrs = createInternalObject();
		instance.propsDefaults = Object.create(null);
		setFullProps(instance, rawProps, props, attrs);
		for (const key in instance.propsOptions[0]) if (!(key in props)) props[key] = void 0;
		if (isStateful) instance.props = isSSR ? props : shallowReactive(props);
		else if (!instance.type.props) instance.props = attrs;
		else instance.props = props;
		instance.attrs = attrs;
	}
	function updateProps(instance, rawProps, rawPrevProps, optimized) {
		const { props, attrs, vnode: { patchFlag } } = instance;
		const rawCurrentProps = toRaw(props);
		const [options] = instance.propsOptions;
		let hasAttrsChanged = false;
		if ((optimized || patchFlag > 0) && !(patchFlag & 16)) {
			if (patchFlag & 8) {
				const propsToUpdate = instance.vnode.dynamicProps;
				for (let i = 0; i < propsToUpdate.length; i++) {
					let key = propsToUpdate[i];
					if (isEmitListener(instance.emitsOptions, key)) continue;
					const value = rawProps[key];
					if (options) if (hasOwn(attrs, key)) {
						if (value !== attrs[key]) {
							attrs[key] = value;
							hasAttrsChanged = true;
						}
					} else {
						const camelizedKey = camelize(key);
						props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
					}
					else if (value !== attrs[key]) {
						attrs[key] = value;
						hasAttrsChanged = true;
					}
				}
			}
		} else {
			if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
			let kebabKey;
			for (const key in rawCurrentProps) if (!rawProps || !hasOwn(rawProps, key) && ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) if (options) {
				if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
			} else delete props[key];
			if (attrs !== rawCurrentProps) {
				for (const key in attrs) if (!rawProps || !hasOwn(rawProps, key) && true) {
					delete attrs[key];
					hasAttrsChanged = true;
				}
			}
		}
		if (hasAttrsChanged) trigger(instance.attrs, "set", "");
	}
	function setFullProps(instance, rawProps, props, attrs) {
		const [options, needCastKeys] = instance.propsOptions;
		let hasAttrsChanged = false;
		let rawCastValues;
		if (rawProps) for (let key in rawProps) {
			if (isReservedProp(key)) continue;
			const value = rawProps[key];
			let camelKey;
			if (options && hasOwn(options, camelKey = camelize(key))) if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
			else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
			else if (!isEmitListener(instance.emitsOptions, key)) {
				if (!(key in attrs) || value !== attrs[key]) {
					attrs[key] = value;
					hasAttrsChanged = true;
				}
			}
		}
		if (needCastKeys) {
			const rawCurrentProps = toRaw(props);
			const castValues = rawCastValues || EMPTY_OBJ;
			for (let i = 0; i < needCastKeys.length; i++) {
				const key = needCastKeys[i];
				props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
			}
		}
		return hasAttrsChanged;
	}
	function resolvePropValue(options, props, key, value, instance, isAbsent) {
		const opt = options[key];
		if (opt != null) {
			const hasDefault = hasOwn(opt, "default");
			if (hasDefault && value === void 0) {
				const defaultValue = opt.default;
				if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
					const { propsDefaults } = instance;
					if (key in propsDefaults) value = propsDefaults[key];
					else {
						const reset = setCurrentInstance(instance);
						value = propsDefaults[key] = defaultValue.call(null, props);
						reset();
					}
				} else value = defaultValue;
				if (instance.ce) instance.ce._setProp(key, value);
			}
			if (opt[0]) {
				if (isAbsent && !hasDefault) value = false;
				else if (opt[1] && (value === "" || value === hyphenate(key))) value = true;
			}
		}
		return value;
	}
	var mixinPropsCache = new WeakMap();
	function normalizePropsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinPropsCache : appContext.propsCache;
		const cached = cache.get(comp);
		if (cached) return cached;
		const raw = comp.props;
		const normalized = {};
		const needCastKeys = [];
		let hasExtends = false;
		if (!isFunction(comp)) {
			const extendProps = (raw2) => {
				hasExtends = true;
				const [props, keys] = normalizePropsOptions(raw2, appContext, true);
				extend(normalized, props);
				if (keys) needCastKeys.push(...keys);
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
			if (comp.extends) extendProps(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendProps);
		}
		if (!raw && !hasExtends) {
			if (isObject(comp)) cache.set(comp, EMPTY_ARR);
			return EMPTY_ARR;
		}
		if (isArray(raw)) for (let i = 0; i < raw.length; i++) {
			const normalizedKey = camelize(raw[i]);
			if (validatePropName(normalizedKey)) normalized[normalizedKey] = EMPTY_OBJ;
		}
		else if (raw) for (const key in raw) {
			const normalizedKey = camelize(key);
			if (validatePropName(normalizedKey)) {
				const opt = raw[key];
				const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
				const propType = prop.type;
				let shouldCast = false;
				let shouldCastTrue = true;
				if (isArray(propType)) for (let index = 0; index < propType.length; ++index) {
					const type = propType[index];
					const typeName = isFunction(type) && type.name;
					if (typeName === "Boolean") {
						shouldCast = true;
						break;
					} else if (typeName === "String") shouldCastTrue = false;
				}
				else shouldCast = isFunction(propType) && propType.name === "Boolean";
				prop[0] = shouldCast;
				prop[1] = shouldCastTrue;
				if (shouldCast || hasOwn(prop, "default")) needCastKeys.push(normalizedKey);
			}
		}
		const res = [normalized, needCastKeys];
		if (isObject(comp)) cache.set(comp, res);
		return res;
	}
	function validatePropName(key) {
		if (key[0] !== "$" && !isReservedProp(key)) return true;
		return false;
	}
	var isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
	var normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
	var normalizeSlot = (key, rawSlot, ctx) => {
		if (rawSlot._n) return rawSlot;
		const normalized = withCtx((...args) => {
			return normalizeSlotValue(rawSlot(...args));
		}, ctx);
		normalized._c = false;
		return normalized;
	};
	var normalizeObjectSlots = (rawSlots, slots, instance) => {
		const ctx = rawSlots._ctx;
		for (const key in rawSlots) {
			if (isInternalKey(key)) continue;
			const value = rawSlots[key];
			if (isFunction(value)) slots[key] = normalizeSlot(key, value, ctx);
			else if (value != null) {
				const normalized = normalizeSlotValue(value);
				slots[key] = () => normalized;
			}
		}
	};
	var normalizeVNodeSlots = (instance, children) => {
		const normalized = normalizeSlotValue(children);
		instance.slots.default = () => normalized;
	};
	var assignSlots = (slots, children, optimized) => {
		for (const key in children) if (optimized || !isInternalKey(key)) slots[key] = children[key];
	};
	var initSlots = (instance, children, optimized) => {
		const slots = instance.slots = createInternalObject();
		if (instance.vnode.shapeFlag & 32) {
			const type = children._;
			if (type) {
				assignSlots(slots, children, optimized);
				if (optimized) def(slots, "_", type, true);
			} else normalizeObjectSlots(children, slots);
		} else if (children) normalizeVNodeSlots(instance, children);
	};
	var updateSlots = (instance, children, optimized) => {
		const { vnode, slots } = instance;
		let needDeletionCheck = true;
		let deletionComparisonTarget = EMPTY_OBJ;
		if (vnode.shapeFlag & 32) {
			const type = children._;
			if (type) if (optimized && type === 1) needDeletionCheck = false;
			else assignSlots(slots, children, optimized);
			else {
				needDeletionCheck = !children.$stable;
				normalizeObjectSlots(children, slots);
			}
			deletionComparisonTarget = children;
		} else if (children) {
			normalizeVNodeSlots(instance, children);
			deletionComparisonTarget = { default: 1 };
		}
		if (needDeletionCheck) {
			for (const key in slots) if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
		}
	};
	var queuePostRenderEffect = queueEffectWithSuspense;
	function createRenderer(options) {
		return baseCreateRenderer(options);
	}
	function baseCreateRenderer(options, createHydrationFns) {
		const target = getGlobalThis();
		target.__VUE__ = true;
		const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
		const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
			if (n1 === n2) return;
			if (n1 && !isSameVNodeType(n1, n2)) {
				anchor = getNextHostNode(n1);
				unmount(n1, parentComponent, parentSuspense, true);
				n1 = null;
			}
			if (n2.patchFlag === -2) {
				optimized = false;
				n2.dynamicChildren = null;
			}
			const { type, ref, shapeFlag } = n2;
			switch (type) {
				case Text:
					processText(n1, n2, container, anchor);
					break;
				case Comment:
					processCommentNode(n1, n2, container, anchor);
					break;
				case Static:
					if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
					break;
				case Fragment:
					processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					break;
				default: if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
				else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
			}
			if (ref != null && parentComponent) setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
			else if (ref == null && n1 && n1.ref != null) setRef(n1.ref, null, parentSuspense, n1, true);
		};
		const processText = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
			else {
				const el = n2.el = n1.el;
				if (n2.children !== n1.children) hostSetText(el, n2.children);
			}
		};
		const processCommentNode = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
			else n2.el = n1.el;
		};
		const mountStaticNode = (n2, container, anchor, namespace) => {
			[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
		};
		const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostInsert(el, container, nextSibling);
				el = next;
			}
			hostInsert(anchor, container, nextSibling);
		};
		const removeStaticNode = ({ el, anchor }) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostRemove(el);
				el = next;
			}
			hostRemove(anchor);
		};
		const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			if (n2.type === "svg") namespace = "svg";
			else if (n2.type === "math") namespace = "mathml";
			if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else {
				const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
				try {
					if (customElement) customElement._beginPatch();
					patchElement(n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				} finally {
					if (customElement) customElement._endPatch();
				}
			}
		};
		const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let el;
			let vnodeHook;
			const { props, shapeFlag, transition, dirs } = vnode;
			el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
			if (shapeFlag & 8) hostSetElementText(el, vnode.children);
			else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
			setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
			if (props) {
				for (const key in props) if (key !== "value" && !isReservedProp(key)) hostPatchProp(el, key, null, props[key], namespace, parentComponent);
				if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
				if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			}
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
			const needCallTransitionHooks = needTransition(parentSuspense, transition);
			if (needCallTransitionHooks) transition.beforeEnter(el);
			hostInsert(el, container, anchor);
			if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) queuePostRenderEffect(() => {
				try {
					vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
					needCallTransitionHooks && transition.enter(el);
					dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
				} finally {}
			}, parentSuspense);
		};
		const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
			if (scopeId) hostSetScopeId(el, scopeId);
			if (slotScopeIds) for (let i = 0; i < slotScopeIds.length; i++) hostSetScopeId(el, slotScopeIds[i]);
			if (parentComponent) {
				let subTree = parentComponent.subTree;
				if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
					const parentVNode = parentComponent.vnode;
					setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
				}
			}
		};
		const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
			for (let i = start; i < children.length; i++) patch(null, children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		};
		const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const el = n2.el = n1.el;
			let { patchFlag, dynamicChildren, dirs } = n2;
			patchFlag |= n1.patchFlag & 16;
			const oldProps = n1.props || EMPTY_OBJ;
			const newProps = n2.props || EMPTY_OBJ;
			let vnodeHook;
			parentComponent && toggleRecurse(parentComponent, false);
			if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
			if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
			parentComponent && toggleRecurse(parentComponent, true);
			if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) hostSetElementText(el, "");
			if (dynamicChildren) patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds);
			else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
			if (patchFlag > 0) {
				if (patchFlag & 16) patchProps(el, oldProps, newProps, parentComponent, namespace);
				else {
					if (patchFlag & 2) {
						if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
					}
					if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
					if (patchFlag & 8) {
						const propsToUpdate = n2.dynamicProps;
						for (let i = 0; i < propsToUpdate.length; i++) {
							const key = propsToUpdate[i];
							const prev = oldProps[key];
							const next = newProps[key];
							if (next !== prev || key === "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
						}
					}
				}
				if (patchFlag & 1) {
					if (n1.children !== n2.children) hostSetElementText(el, n2.children);
				}
			} else if (!optimized && dynamicChildren == null) patchProps(el, oldProps, newProps, parentComponent, namespace);
			if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
				dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
			}, parentSuspense);
		};
		const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
			for (let i = 0; i < newChildren.length; i++) {
				const oldVNode = oldChildren[i];
				const newVNode = newChildren[i];
				patch(oldVNode, newVNode, oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & 198) ? hostParentNode(oldVNode.el) : fallbackContainer, null, parentComponent, parentSuspense, namespace, slotScopeIds, true);
			}
		};
		const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
			if (oldProps !== newProps) {
				if (oldProps !== EMPTY_OBJ) {
					for (const key in oldProps) if (!isReservedProp(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, parentComponent);
				}
				for (const key in newProps) {
					if (isReservedProp(key)) continue;
					const next = newProps[key];
					const prev = oldProps[key];
					if (next !== prev && key !== "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
				}
				if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
			}
		};
		const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
			const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
			let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
			if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
			if (n1 == null) {
				hostInsert(fragmentStartAnchor, container, anchor);
				hostInsert(fragmentEndAnchor, container, anchor);
				mountChildren(n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			} else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, namespace, slotScopeIds);
				if (n2.key != null || parentComponent && n2 === parentComponent.subTree) traverseStaticChildren(n1, n2, true);
			} else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		};
		const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			n2.slotScopeIds = slotScopeIds;
			if (n1 == null) if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
			else mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
			else updateComponent(n1, n2, optimized);
		};
		const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
			const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
			if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
			setupComponent(instance, false, optimized);
			if (instance.asyncDep) {
				parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
				if (!initialVNode.el) {
					const placeholder = instance.subTree = createVNode(Comment);
					processCommentNode(null, placeholder, container, anchor);
					initialVNode.placeholder = placeholder.el;
				}
			} else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, namespace, optimized);
		};
		const updateComponent = (n1, n2, optimized) => {
			const instance = n2.component = n1.component;
			if (shouldUpdateComponent(n1, n2, optimized)) if (instance.asyncDep && !instance.asyncResolved) {
				updateComponentPreRender(instance, n2, optimized);
				return;
			} else {
				instance.next = n2;
				instance.update();
			}
			else {
				n2.el = n1.el;
				instance.vnode = n2;
			}
		};
		const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
			const componentUpdateFn = () => {
				if (!instance.isMounted) {
					let vnodeHook;
					const { el, props } = initialVNode;
					const { bm, m, parent, root, type } = instance;
					const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
					toggleRecurse(instance, false);
					if (bm) invokeArrayFns(bm);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
					toggleRecurse(instance, true);
					if (el && hydrateNode) {
						const hydrateSubTree = () => {
							instance.subTree = renderComponentRoot(instance);
							hydrateNode(el, instance.subTree, instance, parentSuspense, null);
						};
						if (isAsyncWrapperVNode && type.__asyncHydrate) type.__asyncHydrate(el, instance, hydrateSubTree);
						else hydrateSubTree();
					} else {
						if (root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type, instance.parent ? instance.parent.type : void 0);
						const subTree = instance.subTree = renderComponentRoot(instance);
						patch(null, subTree, container, anchor, instance, parentSuspense, namespace);
						initialVNode.el = subTree.el;
					}
					if (m) queuePostRenderEffect(m, parentSuspense);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
						const scopedInitialVNode = initialVNode;
						queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
					}
					if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, parentSuspense);
					instance.isMounted = true;
					initialVNode = container = anchor = null;
				} else {
					let { next, bu, u, parent, vnode } = instance;
					{
						const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
						if (nonHydratedAsyncRoot) {
							if (next) {
								next.el = vnode.el;
								updateComponentPreRender(instance, next, optimized);
							}
							nonHydratedAsyncRoot.asyncDep.then(() => {
								queuePostRenderEffect(() => {
									if (!instance.isUnmounted) update();
								}, parentSuspense);
							});
							return;
						}
					}
					let originNext = next;
					let vnodeHook;
					toggleRecurse(instance, false);
					if (next) {
						next.el = vnode.el;
						updateComponentPreRender(instance, next, optimized);
					} else next = vnode;
					if (bu) invokeArrayFns(bu);
					if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next, vnode);
					toggleRecurse(instance, true);
					const nextTree = renderComponentRoot(instance);
					const prevTree = instance.subTree;
					instance.subTree = nextTree;
					patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense, namespace);
					next.el = nextTree.el;
					if (originNext === null) updateHOCHostEl(instance, nextTree.el);
					if (u) queuePostRenderEffect(u, parentSuspense);
					if (vnodeHook = next.props && next.props.onVnodeUpdated) queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
				}
			};
			instance.scope.on();
			const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
			instance.scope.off();
			const update = instance.update = effect.run.bind(effect);
			const job = instance.job = effect.runIfDirty.bind(effect);
			job.i = instance;
			job.id = instance.uid;
			effect.scheduler = () => queueJob(job);
			toggleRecurse(instance, true);
			update();
		};
		const updateComponentPreRender = (instance, nextVNode, optimized) => {
			nextVNode.component = instance;
			const prevProps = instance.vnode.props;
			instance.vnode = nextVNode;
			instance.next = null;
			updateProps(instance, nextVNode.props, prevProps, optimized);
			updateSlots(instance, nextVNode.children, optimized);
			pauseTracking();
			flushPreFlushCbs(instance);
			resetTracking();
		};
		const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
			const c1 = n1 && n1.children;
			const prevShapeFlag = n1 ? n1.shapeFlag : 0;
			const c2 = n2.children;
			const { patchFlag, shapeFlag } = n2;
			if (patchFlag > 0) {
				if (patchFlag & 128) {
					patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				} else if (patchFlag & 256) {
					patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				}
			}
			if (shapeFlag & 8) {
				if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense);
				if (c2 !== c1) hostSetElementText(container, c2);
			} else if (prevShapeFlag & 16) if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else unmountChildren(c1, parentComponent, parentSuspense, true);
			else {
				if (prevShapeFlag & 8) hostSetElementText(container, "");
				if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
		};
		const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			c1 = c1 || EMPTY_ARR;
			c2 = c2 || EMPTY_ARR;
			const oldLength = c1.length;
			const newLength = c2.length;
			const commonLength = Math.min(oldLength, newLength);
			let i;
			for (i = 0; i < commonLength; i++) {
				const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
			if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
			else mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, commonLength);
		};
		const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let i = 0;
			const l2 = c2.length;
			let e1 = c1.length - 1;
			let e2 = l2 - 1;
			while (i <= e1 && i <= e2) {
				const n1 = c1[i];
				const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				i++;
			}
			while (i <= e1 && i <= e2) {
				const n1 = c1[e1];
				const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				e1--;
				e2--;
			}
			if (i > e1) {
				if (i <= e2) {
					const nextPos = e2 + 1;
					const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
					while (i <= e2) {
						patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						i++;
					}
				}
			} else if (i > e2) while (i <= e1) {
				unmount(c1[i], parentComponent, parentSuspense, true);
				i++;
			}
			else {
				const s1 = i;
				const s2 = i;
				const keyToNewIndexMap = new Map();
				for (i = s2; i <= e2; i++) {
					const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
					if (nextChild.key != null) keyToNewIndexMap.set(nextChild.key, i);
				}
				let j;
				let patched = 0;
				const toBePatched = e2 - s2 + 1;
				let moved = false;
				let maxNewIndexSoFar = 0;
				const newIndexToOldIndexMap = new Array(toBePatched);
				for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
				for (i = s1; i <= e1; i++) {
					const prevChild = c1[i];
					if (patched >= toBePatched) {
						unmount(prevChild, parentComponent, parentSuspense, true);
						continue;
					}
					let newIndex;
					if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
					else for (j = s2; j <= e2; j++) if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
						newIndex = j;
						break;
					}
					if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense, true);
					else {
						newIndexToOldIndexMap[newIndex - s2] = i + 1;
						if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
						else moved = true;
						patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						patched++;
					}
				}
				const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
				j = increasingNewIndexSequence.length - 1;
				for (i = toBePatched - 1; i >= 0; i--) {
					const nextIndex = s2 + i;
					const nextChild = c2[nextIndex];
					const anchorVNode = c2[nextIndex + 1];
					const anchor = nextIndex + 1 < l2 ? anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode) : parentAnchor;
					if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					else if (moved) if (j < 0 || i !== increasingNewIndexSequence[j]) move(nextChild, container, anchor, 2);
					else j--;
				}
			}
		};
		const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
			const { el, type, transition, children, shapeFlag } = vnode;
			if (shapeFlag & 6) {
				move(vnode.component.subTree, container, anchor, moveType);
				return;
			}
			if (shapeFlag & 128) {
				vnode.suspense.move(container, anchor, moveType);
				return;
			}
			if (shapeFlag & 64) {
				type.move(vnode, container, anchor, internals);
				return;
			}
			if (type === Fragment) {
				hostInsert(el, container, anchor);
				for (let i = 0; i < children.length; i++) move(children[i], container, anchor, moveType);
				hostInsert(vnode.anchor, container, anchor);
				return;
			}
			if (type === Static) {
				moveStaticNode(vnode, container, anchor);
				return;
			}
			if (moveType !== 2 && shapeFlag & 1 && transition) if (moveType === 0) if (transition.persisted && !el[leaveCbKey]) hostInsert(el, container, anchor);
			else {
				transition.beforeEnter(el);
				hostInsert(el, container, anchor);
				queuePostRenderEffect(() => transition.enter(el), parentSuspense);
			}
			else {
				const { leave, delayLeave, afterLeave } = transition;
				const remove2 = () => {
					if (vnode.ctx.isUnmounted) hostRemove(el);
					else hostInsert(el, container, anchor);
				};
				const performLeave = () => {
					const wasLeaving = el._isLeaving || !!el[leaveCbKey];
					if (el._isLeaving) el[leaveCbKey](true);
					if (transition.persisted && !wasLeaving) remove2();
					else leave(el, () => {
						remove2();
						afterLeave && afterLeave();
					});
				};
				if (delayLeave) delayLeave(el, remove2, performLeave);
				else performLeave();
			}
			else hostInsert(el, container, anchor);
		};
		const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
			const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs, cacheIndex, memo } = vnode;
			if (patchFlag === -2) optimized = false;
			if (ref != null) {
				pauseTracking();
				setRef(ref, null, parentSuspense, vnode, true);
				resetTracking();
			}
			if (cacheIndex != null) parentComponent.renderCache[cacheIndex] = void 0;
			if (shapeFlag & 256) {
				parentComponent.ctx.deactivate(vnode);
				return;
			}
			const shouldInvokeDirs = shapeFlag & 1 && dirs;
			const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
			let vnodeHook;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			if (shapeFlag & 6) unmountComponent(vnode.component, parentSuspense, doRemove);
			else {
				if (shapeFlag & 128) {
					vnode.suspense.unmount(parentSuspense, doRemove);
					return;
				}
				if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
				if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense, internals, doRemove);
				else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
				else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense);
				if (doRemove) remove(vnode);
			}
			const shouldInvalidateMemo = memo != null && cacheIndex == null;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
				shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
				if (shouldInvalidateMemo) vnode.el = null;
			}, parentSuspense);
		};
		const remove = (vnode) => {
			const { type, el, anchor, transition } = vnode;
			if (type === Fragment) {
				removeFragment(el, anchor);
				return;
			}
			if (type === Static) {
				removeStaticNode(vnode);
				return;
			}
			const performRemove = () => {
				hostRemove(el);
				if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
			};
			if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
				const { leave, delayLeave } = transition;
				const performLeave = () => leave(el, performRemove);
				if (delayLeave) delayLeave(vnode.el, performRemove, performLeave);
				else performLeave();
			} else performRemove();
		};
		const removeFragment = (cur, end) => {
			let next;
			while (cur !== end) {
				next = hostNextSibling(cur);
				hostRemove(cur);
				cur = next;
			}
			hostRemove(end);
		};
		const unmountComponent = (instance, parentSuspense, doRemove) => {
			const { bum, scope, job, subTree, um, m, a } = instance;
			invalidateMount(m);
			invalidateMount(a);
			if (bum) invokeArrayFns(bum);
			scope.stop();
			if (job) {
				job.flags |= 8;
				unmount(subTree, instance, parentSuspense, doRemove);
			}
			if (um) queuePostRenderEffect(um, parentSuspense);
			queuePostRenderEffect(() => {
				instance.isUnmounted = true;
			}, parentSuspense);
		};
		const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
			for (let i = start; i < children.length; i++) unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
		};
		const getNextHostNode = (vnode) => {
			if (vnode.shapeFlag & 6) return getNextHostNode(vnode.component.subTree);
			if (vnode.shapeFlag & 128) return vnode.suspense.next();
			const el = hostNextSibling(vnode.anchor || vnode.el);
			const teleportEnd = el && el[TeleportEndKey];
			return teleportEnd ? hostNextSibling(teleportEnd) : el;
		};
		let isFlushing = false;
		const render = (vnode, container, namespace) => {
			let instance;
			if (vnode == null) {
				if (container._vnode) {
					unmount(container._vnode, null, null, true);
					instance = container._vnode.component;
				}
			} else patch(container._vnode || null, vnode, container, null, null, null, namespace);
			container._vnode = vnode;
			if (!isFlushing) {
				isFlushing = true;
				flushPreFlushCbs(instance);
				flushPostFlushCbs();
				isFlushing = false;
			}
		};
		const internals = {
			p: patch,
			um: unmount,
			m: move,
			r: remove,
			mt: mountComponent,
			mc: mountChildren,
			pc: patchChildren,
			pbc: patchBlockChildren,
			n: getNextHostNode,
			o: options
		};
		let hydrate;
		let hydrateNode;
		if (createHydrationFns) [hydrate, hydrateNode] = createHydrationFns(internals);
		return {
			render,
			hydrate,
			createApp: createAppAPI(render, hydrate)
		};
	}
	function resolveChildrenNamespace({ type, props }, currentNamespace) {
		return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
	}
	function toggleRecurse({ effect, job }, allowed) {
		if (allowed) {
			effect.flags |= 32;
			job.flags |= 4;
		} else {
			effect.flags &= -33;
			job.flags &= -5;
		}
	}
	function needTransition(parentSuspense, transition) {
		return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
	}
	function traverseStaticChildren(n1, n2, shallow = false) {
		const ch1 = n1.children;
		const ch2 = n2.children;
		if (isArray(ch1) && isArray(ch2)) for (let i = 0; i < ch1.length; i++) {
			const c1 = ch1[i];
			let c2 = ch2[i];
			if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
				if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
					c2 = ch2[i] = cloneIfMounted(ch2[i]);
					c2.el = c1.el;
				}
				if (!shallow && c2.patchFlag !== -2) traverseStaticChildren(c1, c2);
			}
			if (c2.type === Text) {
				if (c2.patchFlag === -1) c2 = ch2[i] = cloneIfMounted(c2);
				c2.el = c1.el;
			}
			if (c2.type === Comment && !c2.el) c2.el = c1.el;
		}
	}
	function getSequence(arr) {
		const p = arr.slice();
		const result = [0];
		let i, j, u, v, c;
		const len = arr.length;
		for (i = 0; i < len; i++) {
			const arrI = arr[i];
			if (arrI !== 0) {
				j = result[result.length - 1];
				if (arr[j] < arrI) {
					p[i] = j;
					result.push(i);
					continue;
				}
				u = 0;
				v = result.length - 1;
				while (u < v) {
					c = u + v >> 1;
					if (arr[result[c]] < arrI) u = c + 1;
					else v = c;
				}
				if (arrI < arr[result[u]]) {
					if (u > 0) p[i] = result[u - 1];
					result[u] = i;
				}
			}
		}
		u = result.length;
		v = result[u - 1];
		while (u-- > 0) {
			result[u] = v;
			v = p[v];
		}
		return result;
	}
	function locateNonHydratedAsyncRoot(instance) {
		const subComponent = instance.subTree.component;
		if (subComponent) if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
		else return locateNonHydratedAsyncRoot(subComponent);
	}
	function invalidateMount(hooks) {
		if (hooks) for (let i = 0; i < hooks.length; i++) hooks[i].flags |= 8;
	}
	function resolveAsyncComponentPlaceholder(anchorVnode) {
		if (anchorVnode.placeholder) return anchorVnode.placeholder;
		const instance = anchorVnode.component;
		if (instance) return resolveAsyncComponentPlaceholder(instance.subTree);
		return null;
	}
	var isSuspense = (type) => type.__isSuspense;
	function queueEffectWithSuspense(fn, suspense) {
		if (suspense && suspense.pendingBranch) if (isArray(fn)) suspense.effects.push(...fn);
		else suspense.effects.push(fn);
		else queuePostFlushCb(fn);
	}
	var Fragment = Symbol.for("v-fgt");
	var Text = Symbol.for("v-txt");
	var Comment = Symbol.for("v-cmt");
	var Static = Symbol.for("v-stc");
	var blockStack = [];
	var currentBlock = null;
	function openBlock(disableTracking = false) {
		blockStack.push(currentBlock = disableTracking ? null : []);
	}
	function closeBlock() {
		blockStack.pop();
		currentBlock = blockStack[blockStack.length - 1] || null;
	}
	var isBlockTreeEnabled = 1;
	function setBlockTracking(value, inVOnce = false) {
		isBlockTreeEnabled += value;
		if (value < 0 && currentBlock && inVOnce) currentBlock.hasOnce = true;
	}
	function setupBlock(vnode) {
		vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
		closeBlock();
		if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
		return vnode;
	}
	function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
		return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
	}
	function createBlock(type, props, children, patchFlag, dynamicProps) {
		return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
	}
	function isVNode(value) {
		return value ? value.__v_isVNode === true : false;
	}
	function isSameVNodeType(n1, n2) {
		return n1.type === n2.type && n1.key === n2.key;
	}
	var normalizeKey = ({ key }) => key != null ? key : null;
	var normalizeRef = ({ ref, ref_key, ref_for }) => {
		if (typeof ref === "number") ref = "" + ref;
		return ref != null ? isString(ref) || isRef(ref) || isFunction(ref) ? {
			i: currentRenderingInstance,
			r: ref,
			k: ref_key,
			f: !!ref_for
		} : ref : null;
	};
	function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
		const vnode = {
			__v_isVNode: true,
			__v_skip: true,
			type,
			props,
			key: props && normalizeKey(props),
			ref: props && normalizeRef(props),
			scopeId: currentScopeId,
			slotScopeIds: null,
			children,
			component: null,
			suspense: null,
			ssContent: null,
			ssFallback: null,
			dirs: null,
			transition: null,
			el: null,
			anchor: null,
			target: null,
			targetStart: null,
			targetAnchor: null,
			staticCount: 0,
			shapeFlag,
			patchFlag,
			dynamicProps,
			dynamicChildren: null,
			appContext: null,
			ctx: currentRenderingInstance
		};
		if (needFullChildrenNormalization) {
			normalizeChildren(vnode, children);
			if (shapeFlag & 128) type.normalize(vnode);
		} else if (children) vnode.shapeFlag |= isString(children) ? 8 : 16;
		if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) currentBlock.push(vnode);
		return vnode;
	}
	var createVNode = _createVNode;
	function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
		if (!type || type === NULL_DYNAMIC_COMPONENT) type = Comment;
		if (isVNode(type)) {
			const cloned = cloneVNode(type, props, true);
			if (children) normalizeChildren(cloned, children);
			if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
			else currentBlock.push(cloned);
			cloned.patchFlag = -2;
			return cloned;
		}
		if (isClassComponent(type)) type = type.__vccOpts;
		if (props) {
			props = guardReactiveProps(props);
			let { class: klass, style } = props;
			if (klass && !isString(klass)) props.class = normalizeClass(klass);
			if (isObject(style)) {
				if (isProxy(style) && !isArray(style)) style = extend({}, style);
				props.style = normalizeStyle(style);
			}
		}
		const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
		return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
	}
	function guardReactiveProps(props) {
		if (!props) return null;
		return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
	}
	function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
		const { props, ref, patchFlag, children, transition } = vnode;
		const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
		const cloned = {
			__v_isVNode: true,
			__v_skip: true,
			type: vnode.type,
			props: mergedProps,
			key: mergedProps && normalizeKey(mergedProps),
			ref: extraProps && extraProps.ref ? mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref,
			scopeId: vnode.scopeId,
			slotScopeIds: vnode.slotScopeIds,
			children,
			target: vnode.target,
			targetStart: vnode.targetStart,
			targetAnchor: vnode.targetAnchor,
			staticCount: vnode.staticCount,
			shapeFlag: vnode.shapeFlag,
			patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
			dynamicProps: vnode.dynamicProps,
			dynamicChildren: vnode.dynamicChildren,
			appContext: vnode.appContext,
			dirs: vnode.dirs,
			transition,
			component: vnode.component,
			suspense: vnode.suspense,
			ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
			ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
			placeholder: vnode.placeholder,
			el: vnode.el,
			anchor: vnode.anchor,
			ctx: vnode.ctx,
			ce: vnode.ce
		};
		if (transition && cloneTransition) setTransitionHooks(cloned, transition.clone(cloned));
		return cloned;
	}
	function createTextVNode(text = " ", flag = 0) {
		return createVNode(Text, null, text, flag);
	}
	function createStaticVNode(content, numberOfNodes) {
		const vnode = createVNode(Static, null, content);
		vnode.staticCount = numberOfNodes;
		return vnode;
	}
	function createCommentVNode(text = "", asBlock = false) {
		return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
	}
	function normalizeVNode(child) {
		if (child == null || typeof child === "boolean") return createVNode(Comment);
		else if (isArray(child)) return createVNode(Fragment, null, child.slice());
		else if (isVNode(child)) return cloneIfMounted(child);
		else return createVNode(Text, null, String(child));
	}
	function cloneIfMounted(child) {
		return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
	}
	function normalizeChildren(vnode, children) {
		let type = 0;
		const { shapeFlag } = vnode;
		if (children == null) children = null;
		else if (isArray(children)) type = 16;
		else if (typeof children === "object") if (shapeFlag & 65) {
			const slot = children.default;
			if (slot) {
				slot._c && (slot._d = false);
				normalizeChildren(vnode, slot());
				slot._c && (slot._d = true);
			}
			return;
		} else {
			type = 32;
			const slotFlag = children._;
			if (!slotFlag && !isInternalObject(children)) children._ctx = currentRenderingInstance;
			else if (slotFlag === 3 && currentRenderingInstance) if (currentRenderingInstance.slots._ === 1) children._ = 1;
			else {
				children._ = 2;
				vnode.patchFlag |= 1024;
			}
		}
		else if (isFunction(children)) {
			children = {
				default: children,
				_ctx: currentRenderingInstance
			};
			type = 32;
		} else {
			children = String(children);
			if (shapeFlag & 64) {
				type = 16;
				children = [createTextVNode(children)];
			} else type = 8;
		}
		vnode.children = children;
		vnode.shapeFlag |= type;
	}
	function mergeProps(...args) {
		const ret = {};
		for (let i = 0; i < args.length; i++) {
			const toMerge = args[i];
			for (const key in toMerge) if (key === "class") {
				if (ret.class !== toMerge.class) ret.class = normalizeClass([ret.class, toMerge.class]);
			} else if (key === "style") ret.style = normalizeStyle([ret.style, toMerge.style]);
			else if (isOn(key)) {
				const existing = ret[key];
				const incoming = toMerge[key];
				if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
				else if (incoming == null && existing == null && !isModelListener(key)) ret[key] = incoming;
			} else if (key !== "") ret[key] = toMerge[key];
		}
		return ret;
	}
	function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
		callWithAsyncErrorHandling(hook, instance, 7, [vnode, prevVNode]);
	}
	var emptyAppContext = createAppContext();
	var uid = 0;
	function createComponentInstance(vnode, parent, suspense) {
		const type = vnode.type;
		const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
		const instance = {
			uid: uid++,
			vnode,
			type,
			parent,
			appContext,
			root: null,
			next: null,
			subTree: null,
			effect: null,
			update: null,
			job: null,
			scope: new EffectScope(true),
			render: null,
			proxy: null,
			exposed: null,
			exposeProxy: null,
			withProxy: null,
			provides: parent ? parent.provides : Object.create(appContext.provides),
			ids: parent ? parent.ids : [
				"",
				0,
				0
			],
			accessCache: null,
			renderCache: [],
			components: null,
			directives: null,
			propsOptions: normalizePropsOptions(type, appContext),
			emitsOptions: normalizeEmitsOptions(type, appContext),
			emit: null,
			emitted: null,
			propsDefaults: EMPTY_OBJ,
			inheritAttrs: type.inheritAttrs,
			ctx: EMPTY_OBJ,
			data: EMPTY_OBJ,
			props: EMPTY_OBJ,
			attrs: EMPTY_OBJ,
			slots: EMPTY_OBJ,
			refs: EMPTY_OBJ,
			setupState: EMPTY_OBJ,
			setupContext: null,
			suspense,
			suspenseId: suspense ? suspense.pendingId : 0,
			asyncDep: null,
			asyncResolved: false,
			isMounted: false,
			isUnmounted: false,
			isDeactivated: false,
			bc: null,
			c: null,
			bm: null,
			m: null,
			bu: null,
			u: null,
			um: null,
			bum: null,
			da: null,
			a: null,
			rtg: null,
			rtc: null,
			ec: null,
			sp: null
		};
		instance.ctx = { _: instance };
		instance.root = parent ? parent.root : instance;
		instance.emit = emit.bind(null, instance);
		if (vnode.ce) vnode.ce(instance);
		return instance;
	}
	var currentInstance = null;
	var getCurrentInstance = () => currentInstance || currentRenderingInstance;
	var internalSetCurrentInstance;
	var setInSSRSetupState;
	{
		const g = getGlobalThis();
		const registerGlobalSetter = (key, setter) => {
			let setters;
			if (!(setters = g[key])) setters = g[key] = [];
			setters.push(setter);
			return (v) => {
				if (setters.length > 1) setters.forEach((set) => set(v));
				else setters[0](v);
			};
		};
		internalSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v) => currentInstance = v);
		setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v) => isInSSRComponentSetup = v);
	}
	var setCurrentInstance = (instance) => {
		const prev = currentInstance;
		internalSetCurrentInstance(instance);
		instance.scope.on();
		return () => {
			instance.scope.off();
			internalSetCurrentInstance(prev);
		};
	};
	var unsetCurrentInstance = () => {
		currentInstance && currentInstance.scope.off();
		internalSetCurrentInstance(null);
	};
	function isStatefulComponent(instance) {
		return instance.vnode.shapeFlag & 4;
	}
	var isInSSRComponentSetup = false;
	function setupComponent(instance, isSSR = false, optimized = false) {
		isSSR && setInSSRSetupState(isSSR);
		const { props, children } = instance.vnode;
		const isStateful = isStatefulComponent(instance);
		initProps(instance, props, isStateful, isSSR);
		initSlots(instance, children, optimized || isSSR);
		const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
		isSSR && setInSSRSetupState(false);
		return setupResult;
	}
	function setupStatefulComponent(instance, isSSR) {
		const Component = instance.type;
		instance.accessCache = Object.create(null);
		instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
		const { setup } = Component;
		if (setup) {
			pauseTracking();
			const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
			const reset = setCurrentInstance(instance);
			const setupResult = callWithErrorHandling(setup, instance, 0, [instance.props, setupContext]);
			const isAsyncSetup = isPromise(setupResult);
			resetTracking();
			reset();
			if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
			if (isAsyncSetup) {
				setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
				if (isSSR) return setupResult.then((resolvedResult) => {
					handleSetupResult(instance, resolvedResult, isSSR);
				}).catch((e) => {
					handleError(e, instance, 0);
				});
				else instance.asyncDep = setupResult;
			} else handleSetupResult(instance, setupResult, isSSR);
		} else finishComponentSetup(instance, isSSR);
	}
	function handleSetupResult(instance, setupResult, isSSR) {
		if (isFunction(setupResult)) if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
		else instance.render = setupResult;
		else if (isObject(setupResult)) instance.setupState = proxyRefs(setupResult);
		finishComponentSetup(instance, isSSR);
	}
	var compile;
	var installWithProxy;
	function finishComponentSetup(instance, isSSR, skipOptions) {
		const Component = instance.type;
		if (!instance.render) {
			if (!isSSR && compile && !Component.render) {
				const template = Component.template || resolveMergedOptions(instance).template;
				if (template) {
					const { isCustomElement, compilerOptions } = instance.appContext.config;
					const { delimiters, compilerOptions: componentCompilerOptions } = Component;
					Component.render = compile(template, extend(extend({
						isCustomElement,
						delimiters
					}, compilerOptions), componentCompilerOptions));
				}
			}
			instance.render = Component.render || NOOP;
			if (installWithProxy) installWithProxy(instance);
		}
		{
			const reset = setCurrentInstance(instance);
			pauseTracking();
			try {
				applyOptions(instance);
			} finally {
				resetTracking();
				reset();
			}
		}
	}
	var attrsProxyHandlers = { get(target, key) {
		track(target, "get", "");
		return target[key];
	} };
	function createSetupContext(instance) {
		const expose = (exposed) => {
			instance.exposed = exposed || {};
		};
		return {
			attrs: new Proxy(instance.attrs, attrsProxyHandlers),
			slots: instance.slots,
			emit: instance.emit,
			expose
		};
	}
	function getComponentPublicInstance(instance) {
		if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
			get(target, key) {
				if (key in target) return target[key];
				else if (key in publicPropertiesMap) return publicPropertiesMap[key](instance);
			},
			has(target, key) {
				return key in target || key in publicPropertiesMap;
			}
		}));
		else return instance.proxy;
	}
	function isClassComponent(value) {
		return isFunction(value) && "__vccOpts" in value;
	}
	var computed = (getterOrOptions, debugOptions) => {
		return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
	};
	function h(type, propsOrChildren, children) {
		try {
			setBlockTracking(-1);
			const l = arguments.length;
			if (l === 2) if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
				if (isVNode(propsOrChildren)) return createVNode(type, null, [propsOrChildren]);
				return createVNode(type, propsOrChildren);
			} else return createVNode(type, null, propsOrChildren);
			else {
				if (l > 3) children = Array.prototype.slice.call(arguments, 2);
				else if (l === 3 && isVNode(children)) children = [children];
				return createVNode(type, propsOrChildren, children);
			}
		} finally {
			setBlockTracking(1);
		}
	}
	var version$1 = "3.5.35";
	var policy = void 0;
	var tt$1 = typeof window !== "undefined" && window.trustedTypes;
	if (tt$1) try {
		policy = tt$1.createPolicy("vue", { createHTML: (val) => val });
	} catch (e) {}
	var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
	var svgNS = "http://www.w3.org/2000/svg";
	var mathmlNS = "http://www.w3.org/1998/Math/MathML";
	var doc = typeof document !== "undefined" ? document : null;
	var templateContainer = doc && doc.createElement("template");
	var nodeOps = {
		insert: (child, parent, anchor) => {
			parent.insertBefore(child, anchor || null);
		},
		remove: (child) => {
			const parent = child.parentNode;
			if (parent) parent.removeChild(child);
		},
		createElement: (tag, namespace, is, props) => {
			const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
			if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
			return el;
		},
		createText: (text) => doc.createTextNode(text),
		createComment: (text) => doc.createComment(text),
		setText: (node, text) => {
			node.nodeValue = text;
		},
		setElementText: (el, text) => {
			el.textContent = text;
		},
		parentNode: (node) => node.parentNode,
		nextSibling: (node) => node.nextSibling,
		querySelector: (selector) => doc.querySelector(selector),
		setScopeId(el, id) {
			el.setAttribute(id, "");
		},
		insertStaticContent(content, parent, anchor, namespace, start, end) {
			const before = anchor ? anchor.previousSibling : parent.lastChild;
			if (start && (start === end || start.nextSibling)) while (true) {
				parent.insertBefore(start.cloneNode(true), anchor);
				if (start === end || !(start = start.nextSibling)) break;
			}
			else {
				templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
				const template = templateContainer.content;
				if (namespace === "svg" || namespace === "mathml") {
					const wrapper = template.firstChild;
					while (wrapper.firstChild) template.appendChild(wrapper.firstChild);
					template.removeChild(wrapper);
				}
				parent.insertBefore(template, anchor);
			}
			return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
		}
	};
	var TRANSITION = "transition";
	var ANIMATION = "animation";
	var vtcKey = Symbol("_vtc");
	var DOMTransitionPropsValidators = {
		name: String,
		type: String,
		css: {
			type: Boolean,
			default: true
		},
		duration: [
			String,
			Number,
			Object
		],
		enterFromClass: String,
		enterActiveClass: String,
		enterToClass: String,
		appearFromClass: String,
		appearActiveClass: String,
		appearToClass: String,
		leaveFromClass: String,
		leaveActiveClass: String,
		leaveToClass: String
	};
	var TransitionPropsValidators = extend({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators);
	var decorate$1 = (t) => {
		t.displayName = "Transition";
		t.props = TransitionPropsValidators;
		return t;
	};
	var Transition = decorate$1((props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots));
	var callHook = (hook, args = []) => {
		if (isArray(hook)) hook.forEach((h2) => h2(...args));
		else if (hook) hook(...args);
	};
	var hasExplicitCallback = (hook) => {
		return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
	};
	function resolveTransitionProps(rawProps) {
		const baseProps = {};
		for (const key in rawProps) if (!(key in DOMTransitionPropsValidators)) baseProps[key] = rawProps[key];
		if (rawProps.css === false) return baseProps;
		const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
		const durations = normalizeDuration(duration);
		const enterDuration = durations && durations[0];
		const leaveDuration = durations && durations[1];
		const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
		const finishEnter = (el, isAppear, done, isCancelled) => {
			el._enterCancelled = isCancelled;
			removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
			removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
			done && done();
		};
		const finishLeave = (el, done) => {
			el._isLeaving = false;
			removeTransitionClass(el, leaveFromClass);
			removeTransitionClass(el, leaveToClass);
			removeTransitionClass(el, leaveActiveClass);
			done && done();
		};
		const makeEnterHook = (isAppear) => {
			return (el, done) => {
				const hook = isAppear ? onAppear : onEnter;
				const resolve = () => finishEnter(el, isAppear, done);
				callHook(hook, [el, resolve]);
				nextFrame(() => {
					removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
					addTransitionClass(el, isAppear ? appearToClass : enterToClass);
					if (!hasExplicitCallback(hook)) whenTransitionEnds(el, type, enterDuration, resolve);
				});
			};
		};
		return extend(baseProps, {
			onBeforeEnter(el) {
				callHook(onBeforeEnter, [el]);
				addTransitionClass(el, enterFromClass);
				addTransitionClass(el, enterActiveClass);
			},
			onBeforeAppear(el) {
				callHook(onBeforeAppear, [el]);
				addTransitionClass(el, appearFromClass);
				addTransitionClass(el, appearActiveClass);
			},
			onEnter: makeEnterHook(false),
			onAppear: makeEnterHook(true),
			onLeave(el, done) {
				el._isLeaving = true;
				const resolve = () => finishLeave(el, done);
				addTransitionClass(el, leaveFromClass);
				if (!el._enterCancelled) {
					forceReflow(el);
					addTransitionClass(el, leaveActiveClass);
				} else {
					addTransitionClass(el, leaveActiveClass);
					forceReflow(el);
				}
				nextFrame(() => {
					if (!el._isLeaving) return;
					removeTransitionClass(el, leaveFromClass);
					addTransitionClass(el, leaveToClass);
					if (!hasExplicitCallback(onLeave)) whenTransitionEnds(el, type, leaveDuration, resolve);
				});
				callHook(onLeave, [el, resolve]);
			},
			onEnterCancelled(el) {
				finishEnter(el, false, void 0, true);
				callHook(onEnterCancelled, [el]);
			},
			onAppearCancelled(el) {
				finishEnter(el, true, void 0, true);
				callHook(onAppearCancelled, [el]);
			},
			onLeaveCancelled(el) {
				finishLeave(el);
				callHook(onLeaveCancelled, [el]);
			}
		});
	}
	function normalizeDuration(duration) {
		if (duration == null) return null;
		else if (isObject(duration)) return [NumberOf(duration.enter), NumberOf(duration.leave)];
		else {
			const n = NumberOf(duration);
			return [n, n];
		}
	}
	function NumberOf(val) {
		return toNumber(val);
	}
	function addTransitionClass(el, cls) {
		cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
		(el[vtcKey] || (el[vtcKey] = new Set())).add(cls);
	}
	function removeTransitionClass(el, cls) {
		cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
		const _vtc = el[vtcKey];
		if (_vtc) {
			_vtc.delete(cls);
			if (!_vtc.size) el[vtcKey] = void 0;
		}
	}
	function nextFrame(cb) {
		requestAnimationFrame(() => {
			requestAnimationFrame(cb);
		});
	}
	var endId = 0;
	function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
		const id = el._endId = ++endId;
		const resolveIfNotStale = () => {
			if (id === el._endId) resolve();
		};
		if (explicitTimeout != null) return setTimeout(resolveIfNotStale, explicitTimeout);
		const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
		if (!type) return resolve();
		const endEvent = type + "end";
		let ended = 0;
		const end = () => {
			el.removeEventListener(endEvent, onEnd);
			resolveIfNotStale();
		};
		const onEnd = (e) => {
			if (e.target === el && ++ended >= propCount) end();
		};
		setTimeout(() => {
			if (ended < propCount) end();
		}, timeout + 1);
		el.addEventListener(endEvent, onEnd);
	}
	function getTransitionInfo(el, expectedType) {
		const styles = window.getComputedStyle(el);
		const getStyleProperties = (key) => (styles[key] || "").split(", ");
		const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
		const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
		const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
		const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
		const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
		const animationTimeout = getTimeout(animationDelays, animationDurations);
		let type = null;
		let timeout = 0;
		let propCount = 0;
		if (expectedType === TRANSITION) {
			if (transitionTimeout > 0) {
				type = TRANSITION;
				timeout = transitionTimeout;
				propCount = transitionDurations.length;
			}
		} else if (expectedType === ANIMATION) {
			if (animationTimeout > 0) {
				type = ANIMATION;
				timeout = animationTimeout;
				propCount = animationDurations.length;
			}
		} else {
			timeout = Math.max(transitionTimeout, animationTimeout);
			type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
			propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
		}
		const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
		return {
			type,
			timeout,
			propCount,
			hasTransform
		};
	}
	function getTimeout(delays, durations) {
		while (delays.length < durations.length) delays = delays.concat(delays);
		return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
	}
	function toMs(s) {
		if (s === "auto") return 0;
		return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
	}
	function forceReflow(el) {
		return (el ? el.ownerDocument : document).body.offsetHeight;
	}
	function patchClass(el, value, isSVG) {
		const transitionClasses = el[vtcKey];
		if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
		if (value == null) el.removeAttribute("class");
		else if (isSVG) el.setAttribute("class", value);
		else el.className = value;
	}
	var vShowOriginalDisplay = Symbol("_vod");
	var vShowHidden = Symbol("_vsh");
	var CSS_VAR_TEXT = Symbol("");
	var displayRE = /(?:^|;)\s*display\s*:/;
	function patchStyle(el, prev, next) {
		const style = el.style;
		const isCssString = isString(next);
		let hasControlledDisplay = false;
		if (next && !isCssString) {
			if (prev) if (!isString(prev)) {
				for (const key in prev) if (next[key] == null) setStyle(style, key, "");
			} else for (const prevStyle of prev.split(";")) {
				const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
				if (next[key] == null) setStyle(style, key, "");
			}
			for (const key in next) {
				if (key === "display") hasControlledDisplay = true;
				const value = next[key];
				if (value != null) {
					if (!shouldPreserveTextareaResizeStyle(el, key, !isString(prev) && prev ? prev[key] : void 0, value)) setStyle(style, key, value);
				} else setStyle(style, key, "");
			}
		} else if (isCssString) {
			if (prev !== next) {
				const cssVarText = style[CSS_VAR_TEXT];
				if (cssVarText) next += ";" + cssVarText;
				style.cssText = next;
				hasControlledDisplay = displayRE.test(next);
			}
		} else if (prev) el.removeAttribute("style");
		if (vShowOriginalDisplay in el) {
			el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
			if (el[vShowHidden]) style.display = "none";
		}
	}
	var importantRE = /\s*!important$/;
	function setStyle(style, name, val) {
		if (isArray(val)) val.forEach((v) => setStyle(style, name, v));
		else {
			if (val == null) val = "";
			if (name.startsWith("--")) style.setProperty(name, val);
			else {
				const prefixed = autoPrefix(style, name);
				if (importantRE.test(val)) style.setProperty(hyphenate(prefixed), val.replace(importantRE, ""), "important");
				else style[prefixed] = val;
			}
		}
	}
	var prefixes = [
		"Webkit",
		"Moz",
		"ms"
	];
	var prefixCache = {};
	function autoPrefix(style, rawName) {
		const cached = prefixCache[rawName];
		if (cached) return cached;
		let name = camelize(rawName);
		if (name !== "filter" && name in style) return prefixCache[rawName] = name;
		name = capitalize(name);
		for (let i = 0; i < prefixes.length; i++) {
			const prefixed = prefixes[i] + name;
			if (prefixed in style) return prefixCache[rawName] = prefixed;
		}
		return rawName;
	}
	function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
		return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
	}
	var xlinkNS = "http://www.w3.org/1999/xlink";
	function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
		if (isSVG && key.startsWith("xlink:")) if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
		else el.setAttributeNS(xlinkNS, key, value);
		else if (value == null || isBoolean && !includeBooleanAttr(value)) el.removeAttribute(key);
		else el.setAttribute(key, isBoolean ? "" : isSymbol(value) ? String(value) : value);
	}
	function patchDOMProp(el, key, value, parentComponent, attrName) {
		if (key === "innerHTML" || key === "textContent") {
			if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
			return;
		}
		const tag = el.tagName;
		if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
			const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
			const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
			if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
			if (value == null) el.removeAttribute(key);
			el._value = value;
			return;
		}
		let needRemove = false;
		if (value === "" || value == null) {
			const type = typeof el[key];
			if (type === "boolean") value = includeBooleanAttr(value);
			else if (value == null && type === "string") {
				value = "";
				needRemove = true;
			} else if (type === "number") {
				value = 0;
				needRemove = true;
			}
		}
		try {
			el[key] = value;
		} catch (e) {}
		needRemove && el.removeAttribute(attrName || key);
	}
	function addEventListener(el, event, handler, options) {
		el.addEventListener(event, handler, options);
	}
	function removeEventListener(el, event, handler, options) {
		el.removeEventListener(event, handler, options);
	}
	var veiKey = Symbol("_vei");
	function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
		const invokers = el[veiKey] || (el[veiKey] = {});
		const existingInvoker = invokers[rawName];
		if (nextValue && existingInvoker) existingInvoker.value = nextValue;
		else {
			const [name, options] = parseName(rawName);
			if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(nextValue, instance), options);
			else if (existingInvoker) {
				removeEventListener(el, name, existingInvoker, options);
				invokers[rawName] = void 0;
			}
		}
	}
	var optionsModifierRE = /(?:Once|Passive|Capture)$/;
	function parseName(name) {
		let options;
		if (optionsModifierRE.test(name)) {
			options = {};
			let m;
			while (m = name.match(optionsModifierRE)) {
				name = name.slice(0, name.length - m[0].length);
				options[m[0].toLowerCase()] = true;
			}
		}
		return [name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2)), options];
	}
	var cachedNow = 0;
	var p$1 = Promise.resolve();
	var getNow = () => cachedNow || (p$1.then(() => cachedNow = 0), cachedNow = Date.now());
	function createInvoker(initialValue, instance) {
		const invoker = (e) => {
			if (!e._vts) e._vts = Date.now();
			else if (e._vts <= invoker.attached) return;
			const value = invoker.value;
			if (isArray(value)) {
				const originalStop = e.stopImmediatePropagation;
				e.stopImmediatePropagation = () => {
					originalStop.call(e);
					e._stopped = true;
				};
				const handlers = value.slice();
				const args = [e];
				for (let i = 0; i < handlers.length; i++) {
					if (e._stopped) break;
					const handler = handlers[i];
					if (handler) callWithAsyncErrorHandling(handler, instance, 5, args);
				}
			} else callWithAsyncErrorHandling(value, instance, 5, [e]);
		};
		invoker.value = initialValue;
		invoker.attached = getNow();
		return invoker;
	}
	var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
	var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
		const isSVG = namespace === "svg";
		if (key === "class") patchClass(el, nextValue, isSVG);
		else if (key === "style") patchStyle(el, prevValue, nextValue);
		else if (isOn(key)) {
			if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
		} else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
			patchDOMProp(el, key, nextValue);
			if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
		} else if (el._isVueCE && (shouldSetAsPropForVueCE(el, key) || el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))) patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
		else {
			if (key === "true-value") el._trueValue = nextValue;
			else if (key === "false-value") el._falseValue = nextValue;
			patchAttr(el, key, nextValue, isSVG);
		}
	};
	function shouldSetAsProp(el, key, value, isSVG) {
		if (isSVG) {
			if (key === "innerHTML" || key === "textContent") return true;
			if (key in el && isNativeOn(key) && isFunction(value)) return true;
			return false;
		}
		if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return false;
		if (key === "sandbox" && el.tagName === "IFRAME") return false;
		if (key === "form") return false;
		if (key === "list" && el.tagName === "INPUT") return false;
		if (key === "type" && el.tagName === "TEXTAREA") return false;
		if (key === "width" || key === "height") {
			const tag = el.tagName;
			if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") return false;
		}
		if (isNativeOn(key) && isString(value)) return false;
		return key in el;
	}
	function shouldSetAsPropForVueCE(el, key) {
		const props = el._def.props;
		if (!props) return false;
		const camelKey = camelize(key);
		return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
	}
	var getModelAssigner = (vnode) => {
		const fn = vnode.props["onUpdate:modelValue"] || false;
		return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
	};
	function onCompositionStart(e) {
		e.target.composing = true;
	}
	function onCompositionEnd(e) {
		const target = e.target;
		if (target.composing) {
			target.composing = false;
			target.dispatchEvent(new Event("input"));
		}
	}
	var assignKey = Symbol("_assign");
	function castValue(value, trim, number) {
		if (trim) value = value.trim();
		if (number) value = looseToNumber(value);
		return value;
	}
	var vModelText = {
		created(el, { modifiers: { lazy, trim, number } }, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			const castToNumber = number || vnode.props && vnode.props.type === "number";
			addEventListener(el, lazy ? "change" : "input", (e) => {
				if (e.target.composing) return;
				el[assignKey](castValue(el.value, trim, castToNumber));
			});
			if (trim || castToNumber) addEventListener(el, "change", () => {
				el.value = castValue(el.value, trim, castToNumber);
			});
			if (!lazy) {
				addEventListener(el, "compositionstart", onCompositionStart);
				addEventListener(el, "compositionend", onCompositionEnd);
				addEventListener(el, "change", onCompositionEnd);
			}
		},
		mounted(el, { value }) {
			el.value = value == null ? "" : value;
		},
		beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			if (el.composing) return;
			const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
			const newValue = value == null ? "" : value;
			if (elValue === newValue) return;
			const rootNode = el.getRootNode();
			if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
				if (lazy && value === oldValue) return;
				if (trim && el.value.trim() === newValue) return;
			}
			el.value = newValue;
		}
	};
	var vModelCheckbox = {
		deep: true,
		created(el, _, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			addEventListener(el, "change", () => {
				const modelValue = el._modelValue;
				const elementValue = getValue(el);
				const checked = el.checked;
				const assign = el[assignKey];
				if (isArray(modelValue)) {
					const index = looseIndexOf(modelValue, elementValue);
					const found = index !== -1;
					if (checked && !found) assign(modelValue.concat(elementValue));
					else if (!checked && found) {
						const filtered = [...modelValue];
						filtered.splice(index, 1);
						assign(filtered);
					}
				} else if (isSet(modelValue)) {
					const cloned = new Set(modelValue);
					if (checked) cloned.add(elementValue);
					else cloned.delete(elementValue);
					assign(cloned);
				} else assign(getCheckboxValue(el, checked));
			});
		},
		mounted: setChecked,
		beforeUpdate(el, binding, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			setChecked(el, binding, vnode);
		}
	};
	function setChecked(el, { value, oldValue }, vnode) {
		el._modelValue = value;
		let checked;
		if (isArray(value)) checked = looseIndexOf(value, vnode.props.value) > -1;
		else if (isSet(value)) checked = value.has(vnode.props.value);
		else {
			if (value === oldValue) return;
			checked = looseEqual(value, getCheckboxValue(el, true));
		}
		if (el.checked !== checked) el.checked = checked;
	}
	var vModelSelect = {
		deep: true,
		created(el, { value, modifiers: { number } }, vnode) {
			const isSetModel = isSet(value);
			addEventListener(el, "change", () => {
				const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map((o) => number ? looseToNumber(getValue(o)) : getValue(o));
				el[assignKey](el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]);
				el._assigning = true;
				nextTick(() => {
					el._assigning = false;
				});
			});
			el[assignKey] = getModelAssigner(vnode);
		},
		mounted(el, { value }) {
			setSelected(el, value);
		},
		beforeUpdate(el, _binding, vnode) {
			el[assignKey] = getModelAssigner(vnode);
		},
		updated(el, { value }) {
			if (!el._assigning) setSelected(el, value);
		}
	};
	function setSelected(el, value) {
		const isMultiple = el.multiple;
		const isArrayValue = isArray(value);
		if (isMultiple && !isArrayValue && !isSet(value)) return;
		for (let i = 0, l = el.options.length; i < l; i++) {
			const option = el.options[i];
			const optionValue = getValue(option);
			if (isMultiple) if (isArrayValue) {
				const optionType = typeof optionValue;
				if (optionType === "string" || optionType === "number") option.selected = value.some((v) => String(v) === String(optionValue));
				else option.selected = looseIndexOf(value, optionValue) > -1;
			} else option.selected = value.has(optionValue);
			else if (looseEqual(getValue(option), value)) {
				if (el.selectedIndex !== i) el.selectedIndex = i;
				return;
			}
		}
		if (!isMultiple && el.selectedIndex !== -1) el.selectedIndex = -1;
	}
	function getValue(el) {
		return "_value" in el ? el._value : el.value;
	}
	function getCheckboxValue(el, checked) {
		const key = checked ? "_trueValue" : "_falseValue";
		return key in el ? el[key] : checked;
	}
	var systemModifiers = [
		"ctrl",
		"shift",
		"alt",
		"meta"
	];
	var modifierGuards = {
		stop: (e) => e.stopPropagation(),
		prevent: (e) => e.preventDefault(),
		self: (e) => e.target !== e.currentTarget,
		ctrl: (e) => !e.ctrlKey,
		shift: (e) => !e.shiftKey,
		alt: (e) => !e.altKey,
		meta: (e) => !e.metaKey,
		left: (e) => "button" in e && e.button !== 0,
		middle: (e) => "button" in e && e.button !== 1,
		right: (e) => "button" in e && e.button !== 2,
		exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
	};
	var withModifiers = (fn, modifiers) => {
		if (!fn) return fn;
		const cache = fn._withMods || (fn._withMods = {});
		const cacheKey = modifiers.join(".");
		return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
			for (let i = 0; i < modifiers.length; i++) {
				const guard = modifierGuards[modifiers[i]];
				if (guard && guard(event, modifiers)) return;
			}
			return fn(event, ...args);
		}));
	};
	var keyNames = {
		esc: "escape",
		space: " ",
		up: "arrow-up",
		left: "arrow-left",
		right: "arrow-right",
		down: "arrow-down",
		delete: "backspace"
	};
	var withKeys = (fn, modifiers) => {
		const cache = fn._withKeys || (fn._withKeys = {});
		const cacheKey = modifiers.join(".");
		return cache[cacheKey] || (cache[cacheKey] = ((event) => {
			if (!("key" in event)) return;
			const eventKey = hyphenate(event.key);
			if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) return fn(event);
		}));
	};
	var rendererOptions = extend({ patchProp }, nodeOps);
	var renderer;
	function ensureRenderer() {
		return renderer || (renderer = createRenderer(rendererOptions));
	}
	var createApp = ((...args) => {
		const app = ensureRenderer().createApp(...args);
		const { mount } = app;
		app.mount = (containerOrSelector) => {
			const container = normalizeContainer(containerOrSelector);
			if (!container) return;
			const component = app._component;
			if (!isFunction(component) && !component.render && !component.template) component.template = container.innerHTML;
			if (container.nodeType === 1) container.textContent = "";
			const proxy = mount(container, false, resolveRootNamespace(container));
			if (container instanceof Element) {
				container.removeAttribute("v-cloak");
				container.setAttribute("data-v-app", "");
			}
			return proxy;
		};
		return app;
	});
	function resolveRootNamespace(container) {
		if (container instanceof SVGElement) return "svg";
		if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
	}
	function normalizeContainer(container) {
		if (isString(container)) return document.querySelector(container);
		return container;
	}
	var _GM = typeof GM != "undefined" ? GM : void 0;
	var _GM_addValueChangeListener = typeof GM_addValueChangeListener != "undefined" ? GM_addValueChangeListener : void 0;
	var _GM_deleteValue = typeof GM_deleteValue != "undefined" ? GM_deleteValue : void 0;
	var _GM_deleteValues = typeof GM_deleteValues != "undefined" ? GM_deleteValues : void 0;
	var _GM_getValue = typeof GM_getValue != "undefined" ? GM_getValue : void 0;
	var _GM_listValues = typeof GM_listValues != "undefined" ? GM_listValues : void 0;
	var _GM_setValue = typeof GM_setValue != "undefined" ? GM_setValue : void 0;
	var _GM_xmlhttpRequest = typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0;
	var ReservationSearchResponseType = function(ReservationSearchResponseType) {
		ReservationSearchResponseType[ReservationSearchResponseType["ContinueVerification"] = 1] = "ContinueVerification";
		ReservationSearchResponseType[ReservationSearchResponseType["RefreshMain"] = 2] = "RefreshMain";
		ReservationSearchResponseType[ReservationSearchResponseType["SelectionModal"] = 3] = "SelectionModal";
		ReservationSearchResponseType[ReservationSearchResponseType["UnfinishedRun"] = 4] = "UnfinishedRun";
		return ReservationSearchResponseType;
	}({});
	var MassCompleteStatus = function(MassCompleteStatus) {
		MassCompleteStatus[MassCompleteStatus["idle"] = 0] = "idle";
		MassCompleteStatus[MassCompleteStatus["started"] = 1] = "started";
		MassCompleteStatus[MassCompleteStatus["finished"] = 2] = "finished";
		MassCompleteStatus[MassCompleteStatus["failed"] = 3] = "failed";
		MassCompleteStatus[MassCompleteStatus["stopped"] = 4] = "stopped";
		return MassCompleteStatus;
	}({});
	var PACKING_PORTAL_URL = "https://retailvista.net/outdoor/packship";
	var SHOPWARE_URL = "https://www.kampeerhalroden.nl";
	var ENVIRONMENT_FORM_SELECTOR = "form#selectEnviroment";
	var ENVIRONMENT_SELECT_SELECTOR = "select#EnviromentId";
	var LANGUAGE_FORM_SELECTOR = "form#selectLanguage";
	var LANGUAGE_SELECT_SELECTOR = "select#LanguageId";
	var PARCEL_CONTAINER_PARENT_SELECTOR = "#ReservationOverview > div:nth-child(2) > div.col-9";
	var SEARCH_BLOCK_SELECTOR = ".container > div.row.justify-content-md-center";
	var HEADER_SELECTOR = ".row.nfmlcomp";
	var FOOTER_SLOT_SELECTOR = "footer > div > div > div.col-auto.mr-auto.text-left > div";
	var LOGIN_FOOTER_CONTAINER_SELECTOR = "footer > div.container";
	var RESERVATION_SUMMARY_SELECTOR = "[id^='ReservationSummary']";
	var PARCEL_GROUP_SELECTOR = "#parcelsGroup";
	var PARCEL_TABS_SELECTOR = "#tabs-parcels";
	var PAGE_COLUMN_SELECTOR = ".retailvista-packing-ui .container-fluid > div.d-flex.flex-column";
	var MAIN_CONTENT_SELECTOR = "div.col-12.mainContent";
	var COMPLETED_CONTAINER_SELECTOR = "#ReservationContainer";
	var PARCELS_RETURN_HASH = "#pse-return";
	var COMPLETED_STEP_SELECTOR = "#ReservationContainer li.list-group-item";
	var COMPLETED_PARCEL_SELECTOR = "#ReservationContainer .parcels .card, #ReservationContainer .container .card";
	var COMPLETED_PARCEL_TITLE_SELECTOR = ".card-title";
	var COMPLETED_PARCEL_FIELD_SELECTOR = ".card-text div:not(:has(div))";
	var COMPLETED_STEP_DETAIL_SELECTOR = ".pl-2";
	var VENDOR_BAND_LOGO_SELECTOR = "img.nfLogoSmall";
	var SETTINGS_SAVED_EVENT = "pse:settings-saved";
	var GREASYFORK_META_URL = `https://update.greasyfork.org/scripts/594401/Pack%26Ship%20Extended.meta.js`;
	var RELEASES_PAGE_URL = "https://github.com/Kevinvdbij/pack-ship-extended/releases/latest";
	var STORAGE_KEYS = {
		settings: "PSE_Settings",
		reservationCache: "PSE_Reservation_Cache",
		lastOpenReservation: "PSE_Last_Open_Reservation",
		lastCompletedReservation: "PSE_Last_Completed_Reservation",
		completedEntryPrefix: "PSE_Completed_",
		currentUser: "PSE_Current_User",
		updateCheck: "PSE_Update_Check",
		swClientId: "PSE_Shopware_Client_Id",
		swClientSecret: "PSE_Shopware_Client_Secret",
		massCompleteEntryPrefix: "PSE_MCEntry_"
	};
	function completedEntryKey(reservationNumber) {
		return `${STORAGE_KEYS.completedEntryPrefix}${reservationNumber}`;
	}
	function massCompleteEntryKey(reservationNumber) {
		return `${STORAGE_KEYS.massCompleteEntryPrefix}${reservationNumber}`;
	}
	var enabled$1 = _GM_getValue("PSE_Debug", false);
	function debug(...args) {
		if (enabled$1) console.log("[PSE]", ...args);
	}
	var READY_CLASS = "pse-ready";
	var FAILSAFE_MS = 3e3;
	var revealed = false;
	var pendingWork = [];
	function armReveal() {
		setTimeout(reveal, FAILSAFE_MS);
	}
	function afterReveal(work) {
		if (revealed) {
			work();
			return;
		}
		pendingWork.push(work);
	}
	function reveal() {
		if (revealed) return;
		revealed = true;
		document.documentElement.classList.add(READY_CLASS);
		while (pendingWork.length > 0) try {
			pendingWork.shift()();
		} catch (error) {
			console.error("Pack&Ship Extended failed to run work queued for the reveal.", error);
		}
	}
	var PAINT_TIMEOUT_MS = 400;
	function afterPaint(work) {
		let ran = false;
		const once = () => {
			if (ran) return;
			ran = true;
			work();
		};
		if (document.hidden) {
			once();
			return;
		}
		requestAnimationFrame(() => requestAnimationFrame(once));
		setTimeout(once, PAINT_TIMEOUT_MS);
	}
	function getSearchBlock() {
		return document.querySelector(SEARCH_BLOCK_SELECTOR);
	}
	function adoptElement(host, target, className) {
		if (!target) return null;
		if (className != void 0) target.className = className;
		host.append(target);
		return target;
	}
	function getPortalHeader() {
		return document.querySelector(HEADER_SELECTOR);
	}
	function getParcelContainerParent() {
		return document.querySelector(PARCEL_CONTAINER_PARENT_SELECTOR);
	}
	function getReservationSidebarColumn() {
		return document.querySelector("#ReservationOverview > div:nth-child(2) > div.col-3") ?? document.querySelector("[id^='ReservationSummary']")?.parentElement ?? null;
	}
	function getReservationDetailsFromOverview(ReservationOverview) {
		const target = ReservationOverview ? ReservationOverview : document;
		return {
			id: target.querySelector("input[name='Reservation.ReservationNumber']").value,
			products: Array.from(target.querySelectorAll("input[name^='ReservationRowsNotInCarriers['][name$='].ItemId']")).map((itemIdInput) => {
				const index = rowIndexFromName(itemIdInput.name);
				const field = (name) => target.querySelector(`input[name^='ReservationRowsNotInCarriers[${index}].${name}']`).value;
				return {
					itemId: itemIdInput.value,
					number: field("ProductNumber"),
					description: field("ProductDescription"),
					mainBarcode: field("ProductMainBarcode"),
					requiredQuantity: parseQuantity(field("PickedQty") || field("ProductQuantity")),
					verifiedQuantity: 0
				};
			})
		};
	}
	function rowIndexFromName(name) {
		return name.split("[").pop().split("]").shift();
	}
	function parseQuantity(value) {
		return Number((value ?? "").split(",").shift()) || 0;
	}
	function getVerificationRows(target = document) {
		return Array.from(target.querySelectorAll("input[name^='VerificationReservationRows['][name$='].ItemId']")).map((itemIdInput) => {
			const index = rowIndexFromName(itemIdInput.name);
			const field = (name) => target.querySelector(`input[name='VerificationReservationRows[${index}].${name}']`)?.value;
			return {
				rowIndex: index,
				itemId: itemIdInput.value,
				productId: field("ProductId") ?? "",
				number: field("ProductNumber") ?? "",
				description: field("ProductDescription") ?? "",
				mainBarcode: field("ProductMainBarcode") ?? "",
				requestedQuantity: parseQuantity(field("ProductQuantity")),
				requiredQuantity: parseQuantity(field("PickedQty") || field("ProductQuantity")),
				verifiedQuantity: parseQuantity(field("VerifiedQuantity"))
			};
		});
	}
	function getParcelItems(target = document) {
		return Array.from(target.querySelectorAll("input[name^='Items['][name$='].ReservationRowId']")).map((rowIdInput) => {
			const prefix = rowIdInput.name.slice(0, -16);
			const field = (name) => target.querySelector(`input[name='${prefix}${name}']`)?.value;
			return {
				rowId: rowIdInput.value,
				mainBarcode: field("ProductMainBarcode") ?? "",
				amount: parseQuantity(field("Amount"))
			};
		}).filter((item) => item.amount > 0);
	}
	function groupVerificationRows(rows, parcelItems = []) {
		const lines = new Map();
		rows.forEach((row) => {
			const key = row.productId || row.mainBarcode;
			const line = lines.get(key);
			if (line) {
				line.rows.push(row);
				line.requiredQuantity += row.requiredQuantity;
			} else lines.set(key, {
				key,
				productId: row.productId,
				description: row.description,
				mainBarcode: row.mainBarcode,
				requiredQuantity: row.requiredQuantity,
				verifiedQuantity: 0,
				rows: [row]
			});
		});
		const all = Array.from(lines.values());
		parcelItems.forEach((item) => {
			const line = all.find((candidate) => candidate.rows.some((row) => row.itemId == item.rowId)) ?? all.find((candidate) => candidate.mainBarcode == item.mainBarcode);
			if (line) line.verifiedQuantity += item.amount;
		});
		return all;
	}
	function cacheReservationDetails(reservationDetails) {
		let cacheData = _GM_getValue(STORAGE_KEYS.reservationCache, []);
		let existingIndex = cacheData.findIndex((reservation) => reservation.id == reservationDetails.id);
		if (existingIndex == -1) {
			if (cacheData.push(reservationDetails) > 50) cacheData.shift();
		} else cacheData[existingIndex] = reservationDetails;
		_GM_setValue(STORAGE_KEYS.reservationCache, cacheData);
		debug("Cached reservation product details:", cacheData);
	}
	function retrieveCachedReservationDetails() {
		try {
			let cacheData = _GM_getValue(STORAGE_KEYS.reservationCache, []);
			debug("Retrieved cached reservation details:", cacheData);
			return cacheData;
		} catch (error) {
			console.error(`Failed to retrieve cached reservation details: ${error}`);
			return [];
		}
	}
	function setLastOpenReservation(reservationDefinition) {
		return _GM_setValue(STORAGE_KEYS.lastOpenReservation, reservationDefinition);
	}
	function getLastOpenReservation() {
		return _GM_getValue(STORAGE_KEYS.lastOpenReservation);
	}
	function setLastCompletedReservation(reservationDefinition) {
		return _GM_setValue(STORAGE_KEYS.lastCompletedReservation, reservationDefinition);
	}
	function getLastCompletedReservation() {
		return _GM_getValue(STORAGE_KEYS.lastCompletedReservation);
	}
	function getCompletedHistory() {
		return completedEntryKeys().map((key) => _GM_getValue(key)).filter((entry) => entry && typeof entry.completedAt == "number").sort((first, second) => second.completedAt - first.completedAt).slice(0, 80);
	}
	function recordCompletedReservation(reservation) {
		_GM_setValue(completedEntryKey(reservation.number), reservation);
		pruneCompletedHistory();
	}
	function pruneCompletedHistory() {
		const keys = completedEntryKeys();
		if (keys.length <= 80) return;
		_GM_deleteValues(keys.map((key) => ({
			key,
			completedAt: _GM_getValue(key)?.completedAt ?? 0
		})).sort((first, second) => second.completedAt - first.completedAt).slice(80).map((entry) => entry.key));
	}
	function clearCompletedHistory() {
		_GM_deleteValues(completedEntryKeys());
	}
	function completedEntryKeys() {
		return _GM_listValues().filter((key) => key.startsWith(STORAGE_KEYS.completedEntryPrefix));
	}
	function getCurrentReservationNumber() {
		return document.querySelector("input[name='Reservation.ReservationNumber']").value;
	}
	function getCurrentReservationId() {
		return getReservationId(document.body);
	}
	function getCurrentCustomerName() {
		const block = document.querySelector(RESERVATION_SUMMARY_SELECTOR);
		for (const row of Array.from(block?.children ?? [])) {
			const text = row.textContent?.replace(/\s+/g, " ").trim() ?? "";
			const separator = text.indexOf(":");
			if (separator < 0 || !/^(customer|klant)$/i.test(text.slice(0, separator).trim())) continue;
			return text.slice(separator + 1).replace(/\(\d+\)\s*$/, "").trim();
		}
		return "";
	}
	function getCurrentOrderNumber() {
		return document.querySelector(`${RESERVATION_SUMMARY_SELECTOR} > div:nth-child(3)`).innerHTML.split(" ")[2];
	}
	function getReservationId(target) {
		return target.querySelector("#ReservationId").value;
	}
	async function fetchReservation(url) {
		return new Promise((resolve) => {
			$.ajax({
				url,
				type: "GET",
				success: function(data) {
					resolve(data);
				}
			});
		});
	}
	async function reservationSearchRequest(formData) {
		return new Promise((resolve) => {
			$.ajax({
				url: "/outdoor/packship/Reservations/Search",
				type: "GET",
				data: formData,
				success: function(data) {
					resolve(data);
				}
			});
		});
	}
	function evaluateSearchResponse(element) {
		const reservationOverview = element.querySelector("#ReservationOverview");
		const selectionModal = element.querySelector("#productReservationsModal");
		const unfinishedRunButton = element.querySelector("button[data-target='#unfinishedOrderPickingRunsModal']");
		switch (true) {
			case reservationOverview != void 0: return ReservationSearchResponseType.ContinueVerification;
			case unfinishedRunButton != void 0: return ReservationSearchResponseType.UnfinishedRun;
			case selectionModal != void 0: return ReservationSearchResponseType.SelectionModal;
			default: return ReservationSearchResponseType.RefreshMain;
		}
	}
	function skipVerification(target) {
		target.querySelectorAll("input[id^='ReservationRowsNotInCarriers_'][id$='__Collected']").forEach((collected) => collected.value = "true");
		const form = target.querySelector("#ReservationOverview");
		form.action = "/outdoor/packship/Reservations/Update";
		form.submit();
	}
	function focusBarcodeInput(selector = "#Productbarcode") {
		afterReveal(() => {
			const barcodeInput = document.querySelector(selector);
			if (!barcodeInput) return;
			barcodeInput.focus();
			barcodeInput.value = "";
		});
	}
	function setBusy(state) {
		if (state) {
			ensureBusyOverlay();
			document.body.classList.add("busy");
		} else document.body.classList.remove("busy");
	}
	function ensureBusyOverlay() {
		if (document.querySelector(".loading")) return;
		const overlay = document.createElement("div");
		overlay.className = "loading pse-busy-supplied";
		const spinner = document.createElement("div");
		spinner.className = "nfSpinner";
		const banner = document.createElement("h5");
		banner.className = "loadingBanner";
		banner.textContent = "Laden...";
		spinner.append(banner);
		overlay.append(spinner);
		document.body.append(overlay);
	}
	function retrieveModalData(modalElement) {
		const barcode = modalElement.querySelector("#productReservationsModal > div > div > div.modal-header > h5").innerText.split("'")[1];
		const name = modalElement.querySelector("#productReservationsModal > div > div > div.modal-body > div > div > div.row.text-success > div:nth-child(1) > h3").innerText.split("'")[1];
		const imgUrl = modalElement.querySelector("#productReservationsModal > div > div > div.modal-body > div > div > div.row.text-success > div:nth-child(2) > div > div.col-3.product-image > div > img").src;
		const singleLineElement = modalElement.querySelector("#productReservationsModal > div > div > div.modal-body > div > div > div.singleline-reservations");
		const validReservationElement = modalElement.querySelector("#productReservationsModal > div > div > div.modal-body > div > div > div.valid-reservations");
		const invalidReservationElement = modalElement.querySelector("#productReservationsModal > div > div > div.modal-body > div > div > div.invalid-reservations");
		const singleReservations = iterateModalContainer(singleLineElement);
		const validReservations = iterateModalContainer(validReservationElement);
		const invalidReservations = iterateModalContainer(invalidReservationElement);
		const movedReservations = [];
		validReservations.forEach((reservation) => {
			if (reservation.products.length == 2) {
				let shippingCostsProduct = reservation.products.find((x) => x.description == "verzendkosten");
				let searchProduct = reservation.products.find((x) => x.barcode == barcode);
				if (shippingCostsProduct && searchProduct && parseInt(searchProduct.amount) == 1) {
					let index = reservation.products.indexOf(shippingCostsProduct);
					reservation.products.splice(index, 1);
					singleReservations.push(reservation);
					movedReservations.push(reservation);
				}
			}
		});
		movedReservations.forEach((reservation) => {
			let reservationIndex = validReservations.indexOf(reservation);
			validReservations.splice(reservationIndex, 1);
		});
		return {
			searchProductName: name,
			searchProductBarcode: barcode,
			searchProductAmount: singleReservations.length + validReservations.length + invalidReservations.length,
			searchProductImageUrl: imgUrl,
			singleLineReservations: singleReservations,
			validReservations,
			invalidReservations
		};
	}
	function iterateModalContainer(container) {
		const reservations = [];
		const reservationElement = container;
		if (reservationElement && reservationElement.children.length > 0) Array.from(reservationElement.children).forEach((reservation) => {
			const reservationNumber = reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(1) > div:nth-child(1) > b").innerText;
			const saleOrderRef = reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(1) > div:nth-child(2) > b").innerText;
			const status = reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(2) > div:nth-child(1) > b").innerText;
			const deliveryStatus = reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(2) > div:nth-child(2) > b").innerText;
			const customer = reservation.querySelector("div.card-header > div > div.col-10 > div > div:nth-child(3) > div > b").innerText;
			const url = reservation.querySelector("div > div.col-2 > div > a")?.href;
			const products = [];
			const productListElement = reservation.querySelector("div.card-body > div > div.reservation-rows");
			Array.from(productListElement.children).forEach((product) => {
				const number = product.querySelector("div > div:nth-child(1)").innerText;
				const description = product.querySelector("div > div:nth-child(2)").innerText;
				const barcode = product.querySelector("div > div:nth-child(3)").innerText;
				const amount = product.querySelector("div > div:nth-child(4)").innerText;
				products.push({
					number,
					description,
					barcode,
					amount
				});
			});
			reservations.push({
				reservationNumber: parseInt(reservationNumber),
				saleOrderReference: saleOrderRef,
				status,
				deliveryStatus,
				customer,
				url,
				products,
				swOrderData: void 0
			});
		});
		return reservations;
	}
	function parseAmountString(amount) {
		return (amount.match(/\d+/g) ?? []).map((x) => parseInt(x));
	}
	function isAmountStringComplete(amount) {
		const amounts = parseAmountString(amount);
		if (amounts.length < 2) return true;
		return amounts[0] >= amounts[1];
	}
	async function handleUnfinishedRun(target) {
		return new Promise((resolve) => {
			const finishRunUrl = target.querySelector("[id=unfinishedOrderPickingRunsModal]").querySelector(".btn").href;
			$.ajax({
				url: finishRunUrl,
				type: "GET",
				success: function(data) {
					resolve(data);
				}
			});
		});
	}
	function matchShopwareOrderNumber(value) {
		return /^[0-9]{6,6}$/.test(value);
	}
	function initMassCompleteStatus(entries) {
		const mcEntries = _GM_listValues().filter((x) => x.startsWith(STORAGE_KEYS.massCompleteEntryPrefix));
		if (mcEntries) _GM_deleteValues(mcEntries);
		entries.forEach((entry) => {
			_GM_setValue(massCompleteEntryKey(entry.reservationNumber), entry.status);
		});
	}
	function updateMassCompleteStatus(entry) {
		_GM_setValue(massCompleteEntryKey(entry.reservationNumber), entry.status);
	}
	function isMassCompleteReservation(reservationNumber) {
		return _GM_getValue(massCompleteEntryKey(reservationNumber), void 0) != void 0;
	}
	function mountApp(component, attach, props) {
		const host = document.createElement("div");
		attach(host);
		createApp(component, props).mount(host);
	}
	function domReady() {
		if (document.readyState != "loading") return Promise.resolve();
		return new Promise((resolve) => {
			document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
		});
	}
	var ANCHOR_TIMEOUT_MS = 5e3;
	function whenPresent(find) {
		const existing = find();
		if (existing) return Promise.resolve(existing);
		return new Promise((resolve) => {
			const settle = (found) => {
				observer.disconnect();
				clearTimeout(timeout);
				resolve(found);
			};
			const observer = new MutationObserver(() => {
				const found = find();
				if (found) settle(found);
			});
			const timeout = window.setTimeout(() => {
				debug("Timed out waiting for an anchor element.");
				settle(null);
			}, ANCHOR_TIMEOUT_MS);
			observer.observe(document.documentElement, {
				childList: true,
				subtree: true
			});
		});
	}
	function getCredentials() {
		return {
			clientId: _GM_getValue(STORAGE_KEYS.swClientId, ""),
			clientSecret: _GM_getValue(STORAGE_KEYS.swClientSecret, "")
		};
	}
	function setCredentials(credentials) {
		_GM_setValue(STORAGE_KEYS.swClientId, credentials.clientId.trim());
		_GM_setValue(STORAGE_KEYS.swClientSecret, credentials.clientSecret.trim());
		debug("Stored Shopware client credentials.");
	}
	function hasCredentials() {
		const credentials = getCredentials();
		return credentials.clientId.length > 0 && credentials.clientSecret.length > 0;
	}
	var STORE_ACCESS_KEY = "SWSCNGG4CDNHVVL4MJZ2YKDCMA";
	function adminRequest(path, options) {
		const headers = {
			"Content-Type": "application/json",
			Accept: "application/json"
		};
		if (options.token) headers.Authorization = "Bearer " + options.token.access_token;
		return fetch(SHOPWARE_URL + path, {
			method: options.method,
			headers,
			body: options.body === void 0 ? void 0 : JSON.stringify(options.body)
		}).then((response) => {
			if (!response.ok) throw new Error(`Failed to fetch shopware data. Status: ${response.status}`);
			if (response.status === 204 || !response.headers.get("Content-Type")?.includes("json")) return;
			return response.json();
		});
	}
	async function shopwareInitialize() {
		let token;
		token = await getToken();
		shopwareGetVersion(token).then((response) => {
			debug(`Shopware version: ${response.version}`);
		}).catch((error) => {
			console.error("Failed to retrieve shopware version.", error);
		});
		return token;
	}
	async function getToken() {
		if (!hasCredentials()) throw new Error("No Shopware client credentials configured. Set them in the Pack&Ship Extended settings.");
		return requestToken(getCredentials());
	}
	async function requestToken(credentials) {
		const url = `${SHOPWARE_URL}/api/oauth/token`;
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({
				grant_type: "client_credentials",
				client_id: credentials.clientId.trim(),
				client_secret: credentials.clientSecret.trim()
			})
		};
		return fetch(url, options).then((response) => {
			if (!response.ok) throw new Error(`Failed to retrieve shopware token. Status: ${response.status}`);
			return response.json();
		});
	}
	async function shopwareGetVersion(token) {
		debug("Getting shopware version...");
		return adminRequest("/api/_info/version", {
			method: "GET",
			token
		});
	}
	async function shopwareGetOrderData(token, orderNumber) {
		debug(`Retrieving order data for order with number (${orderNumber}).`);
		return adminRequest("/api/search/order", {
			method: "POST",
			token,
			body: { filter: [{
				type: "contains",
				field: "orderNumber",
				value: orderNumber
			}] }
		});
	}
	async function updateOrderComment(token, data) {
		debug(`Updating order comment for order with id (${data.id}).`);
		return adminRequest(`/api/order/${data.id}`, {
			method: "PATCH",
			token,
			body: { customerComment: data.customerComment }
		});
	}
	async function getImageUri(productEAN) {
		debug(`Getting product image URI (${productEAN}).`);
		const url = SHOPWARE_URL + "/store-api/product";
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"sw-access-key": STORE_ACCESS_KEY,
				"sw-include-seo-urls": "true"
			},
			body: JSON.stringify({ filter: [{
				type: "contains",
				field: "ean",
				value: productEAN
			}] })
		};
		try {
			const data = await (await fetch(url, options)).json();
			if (data?.elements?.length > 0) return `${SHOPWARE_URL}/${data.elements[0].cover.media.path}`;
			else throw new Error("Product not found.");
		} catch (error) {
			console.warn(error);
			return "";
		}
	}
	var H = {
		TOP_LEFT: "top-left",
		TOP_RIGHT: "top-right",
		TOP_CENTER: "top-center",
		BOTTOM_LEFT: "bottom-left",
		BOTTOM_RIGHT: "bottom-right",
		BOTTOM_CENTER: "bottom-center"
	}, q = {
		LIGHT: "light",
		DARK: "dark",
		COLORED: "colored",
		AUTO: "auto"
	}, E = {
		INFO: "info",
		SUCCESS: "success",
		WARNING: "warning",
		ERROR: "error",
		DEFAULT: "default"
	}, Ie = {
		BOUNCE: "bounce",
		SLIDE: "slide",
		FLIP: "flip",
		ZOOM: "zoom",
		NONE: "none"
	}, Oe = {
		dangerouslyHTMLString: !1,
		multiple: !0,
		position: H.TOP_RIGHT,
		autoClose: 5e3,
		transition: "bounce",
		hideProgressBar: !1,
		pauseOnHover: !0,
		pauseOnFocusLoss: !0,
		closeOnClick: !0,
		className: "",
		bodyClassName: "",
		style: {},
		progressClassName: "",
		progressStyle: {},
		role: "alert",
		theme: "light"
	}, Pe = {
		rtl: !1,
		newestOnTop: !1,
		toastClassName: ""
	}, ge = {
		...Oe,
		...Pe
	};
	E.DEFAULT;
	var r = ((e) => (e[e.COLLAPSE_DURATION = 300] = "COLLAPSE_DURATION", e[e.DEBOUNCE_DURATION = 50] = "DEBOUNCE_DURATION", e.CSS_NAMESPACE = "Toastify", e))(r || {}), ne = ((e) => (e.ENTRANCE_ANIMATION_END = "d", e))(ne || {});
	var be = {
		enter: "Toastify--animate Toastify__bounce-enter",
		exit: "Toastify--animate Toastify__bounce-exit",
		appendPosition: !0
	}, Le = {
		enter: "Toastify--animate Toastify__slide-enter",
		exit: "Toastify--animate Toastify__slide-exit",
		appendPosition: !0
	}, $e = {
		enter: "Toastify--animate Toastify__zoom-enter",
		exit: "Toastify--animate Toastify__zoom-exit"
	}, we = {
		enter: "Toastify--animate Toastify__flip-enter",
		exit: "Toastify--animate Toastify__flip-exit"
	}, de = "Toastify--animate Toastify__none-enter";
	function Ee(e, t = !1) {
		var a;
		let n = be;
		if (!e || typeof e == "string") switch (e) {
			case "flip":
				n = we;
				break;
			case "zoom":
				n = $e;
				break;
			case "slide":
				n = Le;
				break;
		}
		else n = e;
		if (t) n.enter = de;
		else if (n.enter === de) {
			const o = (a = n.exit.split("__")[1]) == null ? void 0 : a.split("-")[0];
			n.enter = `Toastify--animate Toastify__${o}-enter`;
		}
		return n;
	}
	function Me(e) {
		return e.containerId || String(e.position);
	}
	var X = "will-unmount";
	function Be(e = H.TOP_RIGHT) {
		return !!document.querySelector(`.${r.CSS_NAMESPACE}__toast-container--${e}`);
	}
	function qe(e = H.TOP_RIGHT) {
		return `${r.CSS_NAMESPACE}__toast-container--${e}`;
	}
	function Re(e, t, n = !1) {
		const a = [
			`${r.CSS_NAMESPACE}__toast-container`,
			`${r.CSS_NAMESPACE}__toast-container--${e}`,
			n ? `${r.CSS_NAMESPACE}__toast-container--rtl` : null
		].filter(Boolean).join(" ");
		return B(t) ? t({
			position: e,
			rtl: n,
			defaultClassName: a
		}) : `${a} ${t || ""}`;
	}
	function Fe(e) {
		var m;
		const { position: t, containerClassName: n, rtl: a = !1, style: o = {} } = e, s = r.CSS_NAMESPACE, d = qe(t), C = document.querySelector(`.${s}`), c = document.querySelector(`.${d}`), _ = !!c && !((m = c.className) != null && m.includes(X)), v = C || document.createElement("div"), i = document.createElement("div");
		i.className = Re(t, n, a), i.dataset.testid = `${r.CSS_NAMESPACE}__toast-container--${t}`, i.id = Me(e);
		for (const T in o) if (Object.prototype.hasOwnProperty.call(o, T)) {
			const N = o[T];
			i.style[T] = N;
		}
		return C || (v.className = r.CSS_NAMESPACE, document.body.appendChild(v)), _ || v.appendChild(i), i;
	}
	function ae(e) {
		var a, o, s;
		const t = typeof e == "string" ? e : ((a = e.currentTarget) == null ? void 0 : a.id) || ((o = e.target) == null ? void 0 : o.id), n = document.getElementById(t);
		n && n.removeEventListener("animationend", ae, !1);
		try {
			k[t].unmount(), (s = document.getElementById(t)) == null || s.remove(), delete k[t], delete f[t];
		} catch {}
	}
	var k = reactive({});
	function xe(e, t) {
		const n = document.getElementById(String(t));
		n && (k[n.id] = e);
	}
	function oe(e, t = !0) {
		const n = String(e);
		if (!k[n]) return;
		const a = document.getElementById(n);
		a && a.classList.add(X), t ? (ke(e), a && a.addEventListener("animationend", ae, !1)) : ae(n), p.items = p.items.filter((o) => o.containerId !== e);
	}
	function Ue(e) {
		for (const t in k) oe(t, e);
		p.items = [];
	}
	function Ce(e, t) {
		const n = document.getElementById(e.toastId);
		if (n) {
			let a = e;
			a = {
				...a,
				...Ee(a.transition)
			};
			const o = a.appendPosition ? `${a.exit}--${a.position}` : a.exit;
			n.className += ` ${o}`, t && t(n);
		}
	}
	function ke(e) {
		for (const t in f) if (t === e) for (const n of f[t] || []) Ce(n);
	}
	function He(e) {
		const n = R().find((a) => a.toastId === e);
		return n == null ? void 0 : n.containerId;
	}
	function le(e) {
		return document.getElementById(e);
	}
	function De(e) {
		const t = le(e.containerId);
		return t && t.classList.contains(X);
	}
	function ue(e) {
		var n;
		const t = isVNode(e.content) ? toRaw(e.content.props) : null;
		return t != null ? t : toRaw((n = e.data) != null ? n : {});
	}
	function je(e) {
		return e ? p.items.filter((n) => n.containerId === e).length > 0 : p.items.length > 0;
	}
	function ze() {
		if (p.items.length > 0) {
			const e = p.items.shift();
			G(e == null ? void 0 : e.toastContent, e == null ? void 0 : e.toastProps);
		}
	}
	var f = reactive({}), p = reactive({ items: [] });
	function R() {
		return Object.values(toRaw(f)).reduce((t, n) => [...t, ...n], []);
	}
	function Ge(e) {
		return R().find((n) => n.toastId === e);
	}
	function G(e, t = {}) {
		if (De(t)) {
			const n = le(t.containerId);
			n && n.addEventListener("animationend", se.bind(null, e, t), !1);
		} else se(e, t);
	}
	function se(e, t = {}) {
		const n = le(t.containerId);
		n && n.removeEventListener("animationend", se.bind(null, e, t), !1);
		const a = f[t.containerId] || [], o = a.length > 0;
		if (!o && !Be(t.position)) {
			const s = Fe(t), d = createApp(Et, t);
			t.useHandler && t.useHandler(d), d.mount(s), xe(d, s.id);
		}
		o && !t.updateId && (t.position = a[0].position), nextTick(() => {
			t.updateId ? y.update(t) : y.add(e, t);
		});
	}
	var y = {
		add(e, t) {
			const { containerId: n = "" } = t;
			n && (f[n] = f[n] || [], f[n].find((a) => a.toastId === t.toastId) || setTimeout(() => {
				var a, o;
				t.newestOnTop ? (a = f[n]) == null || a.unshift(t) : (o = f[n]) == null || o.push(t), t.onOpen && t.onOpen(ue(t));
			}, t.delay || 0));
		},
		remove(e) {
			if (e) {
				const t = He(e);
				if (t) {
					const n = f[t];
					let a = n.find((o) => o.toastId === e);
					f[t] = n.filter((o) => o.toastId !== e), !f[t].length && !je(t) && oe(t, !1), ze(), nextTick(() => {
						a != null && a.onClose && (a.onClose(ue(a)), a = void 0);
					});
				}
			}
		},
		update(e = {}) {
			const { containerId: t = "" } = e;
			if (t && e.updateId) {
				f[t] = f[t] || [];
				const n = f[t].find((s) => s.toastId === e.toastId), a = (n == null ? void 0 : n.position) !== e.position || (n == null ? void 0 : n.transition) !== e.transition, o = {
					...e,
					disabledEnterTransition: !a,
					updateId: void 0
				};
				y.dismissForce(e == null ? void 0 : e.toastId), setTimeout(() => {
					l(o.content, o);
				}, e.delay || 0);
			}
		},
		clear(e, t = !0) {
			e ? oe(e, t) : Ue(t);
		},
		dismissCallback(e) {
			var a;
			const t = (a = e.currentTarget) == null ? void 0 : a.id, n = document.getElementById(t);
			n && (n.removeEventListener("animationend", y.dismissCallback, !1), setTimeout(() => {
				y.remove(t);
			}));
		},
		dismiss(e) {
			if (e) {
				const t = R();
				for (const n of t) if (n.toastId === e) {
					Ce(n, (a) => {
						a.addEventListener("animationend", y.dismissCallback, !1);
					});
					break;
				}
			}
		},
		dismissForce(e) {
			if (e) {
				const t = R();
				for (const n of t) if (n.toastId === e) {
					const a = document.getElementById(e);
					a && (a.remove(), a.removeEventListener("animationend", y.dismissCallback, !1), y.remove(e));
					break;
				}
			}
		}
	}, Ve = reactive({ useHandler: void 0 }), ye = reactive({}), K = reactive({});
	function ve() {
		return Math.random().toString(36).substring(2, 9);
	}
	function We(e) {
		return typeof e == "number" && !isNaN(e);
	}
	function re(e) {
		return typeof e == "string";
	}
	function B(e) {
		return typeof e == "function";
	}
	function J(...e) {
		return mergeProps(...e);
	}
	function V(e) {
		return typeof e == "object" && (!!(e != null && e.render) || !!(e != null && e.setup) || typeof (e == null ? void 0 : e.type) == "object");
	}
	function Qe(e = {}) {
		ye[`${r.CSS_NAMESPACE}-default-options`] = e;
	}
	function Se() {
		return ye[`${r.CSS_NAMESPACE}-default-options`] || ge;
	}
	function Ke() {
		const e = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
		return document.documentElement.classList.contains("dark") || e ? "dark" : "light";
	}
	var W = ((e) => (e[e.Enter = 0] = "Enter", e[e.Exit = 1] = "Exit", e))(W || {});
	var pe = {
		containerId: {
			type: [String, Number],
			required: !1,
			default: ""
		},
		clearOnUrlChange: {
			type: Boolean,
			required: !1,
			default: !0
		},
		disabledEnterTransition: {
			type: Boolean,
			required: !1,
			default: !1
		},
		dangerouslyHTMLString: {
			type: Boolean,
			required: !1,
			default: !1
		},
		multiple: {
			type: Boolean,
			required: !1,
			default: !0
		},
		limit: {
			type: Number,
			required: !1,
			default: void 0
		},
		position: {
			type: String,
			required: !1,
			default: H.TOP_LEFT
		},
		bodyClassName: {
			type: String,
			required: !1,
			default: ""
		},
		autoClose: {
			type: [Number, Boolean],
			required: !1,
			default: !1
		},
		closeButton: {
			type: [
				Boolean,
				Function,
				Object
			],
			required: !1,
			default: void 0
		},
		transition: {
			type: [String, Object],
			required: !1,
			default: "bounce"
		},
		hideProgressBar: {
			type: Boolean,
			required: !1,
			default: !1
		},
		pauseOnHover: {
			type: Boolean,
			required: !1,
			default: !0
		},
		pauseOnFocusLoss: {
			type: Boolean,
			required: !1,
			default: !0
		},
		closeOnClick: {
			type: Boolean,
			required: !1,
			default: !0
		},
		progress: {
			type: Number,
			required: !1,
			default: void 0
		},
		progressClassName: {
			type: String,
			required: !1,
			default: ""
		},
		toastStyle: {
			type: Object,
			required: !1,
			default() {
				return {};
			}
		},
		progressStyle: {
			type: Object,
			required: !1,
			default() {
				return {};
			}
		},
		role: {
			type: String,
			required: !1,
			default: "alert"
		},
		theme: {
			type: String,
			required: !1,
			default: q.AUTO
		},
		content: {
			type: [
				String,
				Object,
				Function
			],
			required: !1,
			default: ""
		},
		toastId: {
			type: [String, Number],
			required: !1,
			default: ""
		},
		data: {
			type: [Object, String],
			required: !1,
			default() {
				return {};
			}
		},
		type: {
			type: String,
			required: !1,
			default: E.DEFAULT
		},
		icon: {
			type: [
				Boolean,
				String,
				Number,
				Object,
				Function
			],
			required: !1,
			default: void 0
		},
		delay: {
			type: Number,
			required: !1,
			default: void 0
		},
		onOpen: {
			type: Function,
			required: !1,
			default: void 0
		},
		onClose: {
			type: Function,
			required: !1,
			default: void 0
		},
		onClick: {
			type: Function,
			required: !1,
			default: void 0
		},
		isLoading: {
			type: Boolean,
			required: !1,
			default: void 0
		},
		rtl: {
			type: Boolean,
			required: !1,
			default: !1
		},
		toastClassName: {
			type: String,
			required: !1,
			default: ""
		},
		updateId: {
			type: [String, Number],
			required: !1,
			default: ""
		},
		contentProps: {
			type: Object,
			required: !1,
			default: null
		},
		expandCustomProps: {
			type: Boolean,
			required: !1,
			default: !1
		}
	}, Ze = defineComponent({
		name: "ProgressBar",
		props: {
			autoClose: {
				type: [Number, Boolean],
				required: !0
			},
			isRunning: {
				type: Boolean,
				required: !1,
				default: void 0
			},
			type: {
				type: String,
				required: !1,
				default: E.DEFAULT
			},
			theme: {
				type: String,
				required: !1,
				default: q.AUTO
			},
			hide: {
				type: Boolean,
				required: !1,
				default: void 0
			},
			className: {
				type: [String, Function],
				required: !1,
				default: ""
			},
			controlledProgress: {
				type: Boolean,
				required: !1,
				default: void 0
			},
			rtl: {
				type: Boolean,
				required: !1,
				default: void 0
			},
			isIn: {
				type: Boolean,
				required: !1,
				default: void 0
			},
			progress: {
				type: Number,
				required: !1,
				default: void 0
			},
			closeToast: {
				type: Function,
				required: !1,
				default: void 0
			}
		},
		setup(e, { attrs: t }) {
			const n = ref(), a = computed(() => e.hide ? "true" : "false"), o = computed(() => ({
				...t.style || {},
				animationDuration: `${e.autoClose === !0 ? 5e3 : e.autoClose}ms`,
				animationPlayState: e.isRunning ? "running" : "paused",
				opacity: e.hide || e.autoClose === !1 ? 0 : 1,
				transform: e.controlledProgress ? `scaleX(${e.progress})` : "none"
			})), s = computed(() => [
				`${r.CSS_NAMESPACE}__progress-bar`,
				e.controlledProgress ? `${r.CSS_NAMESPACE}__progress-bar--controlled` : `${r.CSS_NAMESPACE}__progress-bar--animated`,
				`${r.CSS_NAMESPACE}__progress-bar-theme--${e.theme}`,
				`${r.CSS_NAMESPACE}__progress-bar--${e.type}`,
				e.rtl ? `${r.CSS_NAMESPACE}__progress-bar--rtl` : null
			].filter(Boolean).join(" ")), d = computed(() => `${s.value} ${(t == null ? void 0 : t.class) || ""}`), C = () => {
				n.value && (n.value.onanimationend = null, n.value.ontransitionend = null);
			}, c = () => {
				e.isIn && e.closeToast && e.autoClose !== !1 && (e.closeToast(), C());
			}, _ = computed(() => e.controlledProgress ? null : c), v = computed(() => e.controlledProgress ? c : null);
			return watchEffect(() => {
				n.value && (C(), n.value.onanimationend = _.value, n.value.ontransitionend = v.value);
			}), () => createVNode("div", {
				ref: n,
				role: "progressbar",
				"aria-hidden": a.value,
				"aria-label": "notification timer",
				class: d.value,
				style: o.value
			}, null);
		}
	}), Xe = defineComponent({
		name: "CloseButton",
		inheritAttrs: !1,
		props: {
			theme: {
				type: String,
				required: !1,
				default: q.AUTO
			},
			type: {
				type: String,
				required: !1,
				default: q.LIGHT
			},
			ariaLabel: {
				type: String,
				required: !1,
				default: "close"
			},
			closeToast: {
				type: Function,
				required: !1,
				default: void 0
			}
		},
		setup(e) {
			return () => createVNode("button", {
				class: `${r.CSS_NAMESPACE}__close-button ${r.CSS_NAMESPACE}__close-button--${e.theme}`,
				type: "button",
				onClick: (t) => {
					t.stopPropagation(), e.closeToast && e.closeToast(t);
				},
				"aria-label": e.ariaLabel
			}, [createVNode("svg", {
				"aria-hidden": "true",
				viewBox: "0 0 14 16"
			}, [createVNode("path", {
				"fill-rule": "evenodd",
				d: "M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"
			}, null)])]);
		}
	}), ee = ({ theme: e, type: t, path: n, ...a }) => createVNode("svg", mergeProps({
		viewBox: "0 0 24 24",
		width: "100%",
		height: "100%",
		style: { fill: e === "colored" ? "currentColor" : `var(--toastify-icon-color-${t})` }
	}, a), [createVNode("path", { d: n }, null)]);
	function Je(e) {
		return createVNode(ee, mergeProps(e, { path: "M23.32 17.191L15.438 2.184C14.728.833 13.416 0 11.996 0c-1.42 0-2.733.833-3.443 2.184L.533 17.448a4.744 4.744 0 000 4.368C1.243 23.167 2.555 24 3.975 24h16.05C22.22 24 24 22.044 24 19.632c0-.904-.251-1.746-.68-2.44zm-9.622 1.46c0 1.033-.724 1.823-1.698 1.823s-1.698-.79-1.698-1.822v-.043c0-1.028.724-1.822 1.698-1.822s1.698.79 1.698 1.822v.043zm.039-12.285l-.84 8.06c-.057.581-.408.943-.897.943-.49 0-.84-.367-.896-.942l-.84-8.065c-.057-.624.25-1.095.779-1.095h1.91c.528.005.84.476.784 1.1z" }), null);
	}
	function et(e) {
		return createVNode(ee, mergeProps(e, { path: "M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm.25 5a1.5 1.5 0 11-1.5 1.5 1.5 1.5 0 011.5-1.5zm2.25 13.5h-4a1 1 0 010-2h.75a.25.25 0 00.25-.25v-4.5a.25.25 0 00-.25-.25h-.75a1 1 0 010-2h1a2 2 0 012 2v4.75a.25.25 0 00.25.25h.75a1 1 0 110 2z" }), null);
	}
	function tt(e) {
		return createVNode(ee, mergeProps(e, { path: "M12 0a12 12 0 1012 12A12.014 12.014 0 0012 0zm6.927 8.2l-6.845 9.289a1.011 1.011 0 01-1.43.188l-4.888-3.908a1 1 0 111.25-1.562l4.076 3.261 6.227-8.451a1 1 0 111.61 1.183z" }), null);
	}
	function nt(e) {
		return createVNode(ee, mergeProps(e, { path: "M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z" }), null);
	}
	function at() {
		return createVNode("div", { class: `${r.CSS_NAMESPACE}__spinner` }, null);
	}
	var Q = {
		info: et,
		warning: Je,
		success: tt,
		error: nt,
		spinner: at
	}, ot = (e) => e in Q;
	function st({ theme: e, type: t, isLoading: n, icon: a }) {
		let o;
		const s = !!n || t === "loading", d = {
			theme: e,
			type: t
		};
		if (s && (a === void 0 || typeof a == "boolean")) return Q.spinner();
		if (a !== !1) {
			if (V(a)) o = toRaw(a);
			else if (B(a)) {
				const C = a;
				d.type = s ? "loading" : t, o = C(d), o = !o && s ? Q.spinner() : o;
			} else isVNode(a) ? o = cloneVNode(a, d) : re(a) || We(a) ? o = a : ot(t) && (o = Q[t](d));
			return o;
		}
	}
	var rt = () => {};
	function it(e, t, n = r.COLLAPSE_DURATION) {
		const { scrollHeight: a, style: o } = e, s = n;
		requestAnimationFrame(() => {
			o.minHeight = "initial", o.height = a + "px", o.transition = `all ${s}ms`, requestAnimationFrame(() => {
				o.height = "0", o.padding = "0", o.margin = "0", setTimeout(t, s);
			});
		});
	}
	function lt(e) {
		const t = ref(!1), n = ref(!1), a = ref(!1), o = ref(W.Enter), s = reactive({
			...e,
			appendPosition: e.appendPosition || !1,
			collapse: typeof e.collapse > "u" ? !0 : e.collapse,
			collapseDuration: e.collapseDuration || r.COLLAPSE_DURATION
		}), d = s.done || rt, C = computed(() => s.appendPosition ? `${s.enter}--${s.position}` : s.enter), c = computed(() => s.appendPosition ? `${s.exit}--${s.position}` : s.exit), _ = computed(() => e.pauseOnHover ? {
			onMouseenter: I,
			onMouseleave: A
		} : {});
		function v() {
			const S = C.value.split(" ");
			m().addEventListener(ne.ENTRANCE_ANIMATION_END, A, { once: !0 });
			const O = (w) => {
				const x = m();
				w.target === x && (x.dispatchEvent(new Event(ne.ENTRANCE_ANIMATION_END)), x.removeEventListener("animationend", O), x.removeEventListener("animationcancel", O), o.value === W.Enter && w.type !== "animationcancel" && x.classList.remove(...S));
			}, P = () => {
				const w = m();
				w.classList.add(...S), w.addEventListener("animationend", O), w.addEventListener("animationcancel", O);
			};
			e.pauseOnFocusLoss && T(), P();
		}
		function i() {
			if (!m()) return;
			const S = () => {
				const P = m();
				P.removeEventListener("animationend", S), s.collapse ? it(P, d, s.collapseDuration) : d();
			}, O = () => {
				const P = m();
				o.value = W.Exit, P && (P.className += ` ${c.value}`, P.addEventListener("animationend", S));
			};
			n.value || (a.value ? S() : setTimeout(O));
		}
		function m() {
			return e.toastRef.value;
		}
		function T() {
			document.hasFocus() || I(), window.addEventListener("focus", A), window.addEventListener("blur", I);
		}
		function N() {
			window.removeEventListener("focus", A), window.removeEventListener("blur", I);
		}
		function A() {
			(!e.loading.value || e.isLoading === void 0) && (t.value = !0);
		}
		function I() {
			t.value = !1;
		}
		function F(S) {
			S && (S.stopPropagation(), S.preventDefault()), n.value = !1;
		}
		return watchEffect(i), watchEffect(() => {
			n.value = R().findIndex((O) => O.toastId === s.toastId) > -1;
		}), watchEffect(() => {
			e.isLoading !== void 0 && (e.loading.value ? I() : A());
		}), onMounted(v), onUnmounted(() => {
			e.pauseOnFocusLoss && N();
		}), {
			isIn: n,
			isRunning: t,
			hideToast: F,
			eventHandlers: _
		};
	}
	function dt(e) {
		if (!e || typeof e != "object" || Array.isArray(e) || e.__v_isVNode) return !1;
		const t = e;
		return ["title", "content"].some((n) => n in t);
	}
	var ut = defineComponent({
		name: "ToastItem",
		inheritAttrs: !1,
		props: pe,
		setup(e) {
			const t = ref(), n = computed(() => !!e.isLoading), a = computed(() => e.progress !== void 0 && e.progress !== null), o = computed(() => st(e)), s = computed(() => [
				`${r.CSS_NAMESPACE}__toast`,
				`${r.CSS_NAMESPACE}__toast-theme--${e.theme}`,
				`${r.CSS_NAMESPACE}__toast--${e.type}`,
				e.rtl ? `${r.CSS_NAMESPACE}__toast--rtl` : void 0,
				e.toastClassName || ""
			].filter(Boolean).join(" ")), { isRunning: d, isIn: C, hideToast: c, eventHandlers: _ } = lt({
				toastRef: t,
				loading: n,
				done: () => {
					y.remove(e.toastId);
				},
				...Ee(e.transition, e.disabledEnterTransition),
				...e
			});
			function v() {
				const i = e.content;
				if (dt(i)) {
					const m = [];
					return i.title !== void 0 && m.push(createVNode("div", {
						"data-testid": "toast-text-title",
						class: `${r.CSS_NAMESPACE}__toast-text-title`
					}, [i.title])), i.content !== void 0 && m.push(createVNode("div", {
						"data-testid": "toast-text-content",
						class: `${r.CSS_NAMESPACE}__toast-text-content`
					}, [i.content])), createVNode("div", {
						"data-testid": "toast-text-content-wrapper",
						class: `${r.CSS_NAMESPACE}__toast-text`
					}, [m]);
				}
				return V(i) ? h(toRaw(i), {
					toastProps: toRaw(e),
					closeToast: c,
					data: e.data,
					...e.expandCustomProps ? e.contentProps : { contentProps: e.contentProps || {} }
				}) : B(i) ? i({
					toastProps: toRaw(e),
					closeToast: c,
					data: e.data
				}) : e.dangerouslyHTMLString ? h("div", { innerHTML: i }) : i;
			}
			return () => createVNode("div", mergeProps({
				id: e.toastId,
				class: s.value,
				style: e.toastStyle || {},
				ref: t,
				"data-testid": `toast-item-${e.toastId}`,
				onClick: (i) => {
					e.closeOnClick && c(), e.onClick && e.onClick(i);
				}
			}, _.value), [
				createVNode("div", {
					role: e.role,
					"data-testid": "toast-body",
					class: `${r.CSS_NAMESPACE}__toast-body ${e.bodyClassName || ""}`
				}, [o.value != null && createVNode("div", {
					"data-testid": `toast-icon-${e.type}`,
					class: [`${r.CSS_NAMESPACE}__toast-icon`, e.isLoading ? "" : `${r.CSS_NAMESPACE}--animate-icon ${r.CSS_NAMESPACE}__zoom-enter`].join(" ")
				}, [V(o.value) ? h(toRaw(o.value), {
					theme: e.theme,
					type: e.type
				}) : B(o.value) ? o.value({
					theme: e.theme,
					type: e.type
				}) : o.value]), createVNode("div", { "data-testid": "toast-content" }, [v()])]),
				(e.closeButton === void 0 || e.closeButton === !0) && createVNode(Xe, {
					theme: e.theme,
					closeToast: (i) => {
						i.stopPropagation(), i.preventDefault(), c();
					}
				}, null),
				V(e.closeButton) ? h(toRaw(e.closeButton), {
					closeToast: c,
					type: e.type,
					theme: e.theme
				}) : B(e.closeButton) ? e.closeButton({
					closeToast: c,
					type: e.type,
					theme: e.theme
				}) : null,
				createVNode(Ze, {
					className: e.progressClassName,
					style: e.progressStyle,
					rtl: e.rtl,
					theme: e.theme,
					isIn: C.value,
					type: e.type,
					hide: e.hideProgressBar,
					isRunning: d.value,
					autoClose: e.autoClose,
					controlledProgress: a.value,
					progress: e.progress,
					closeToast: e.isLoading ? void 0 : c
				}, null)
			]);
		}
	}), Y = "vue3-toastify:url-change";
	var j = 0, U;
	function ct() {
		if (!(typeof window > "u") && K.lastUrl !== window.location.href) {
			K.lastUrl = window.location.href;
			const e = (n) => typeof n.clearOnUrlChange == "boolean" ? n.clearOnUrlChange : Se().clearOnUrlChange !== !1, t = Object.values(f).reduce((n, a) => (Array.isArray(a) && n.push(...a), n), []);
			for (const n of t) n.toastId && e(n) && y.dismiss(n.toastId);
			p.items = p.items.filter((n) => !e(n.toastProps));
		}
	}
	function ft() {
		const { history: e } = window, t = e.pushState, n = e.replaceState;
		return e.pushState = function(...a) {
			const o = t.apply(this, a);
			return window.dispatchEvent(new Event(Y)), o;
		}, e.replaceState = function(...a) {
			const o = n.apply(this, a);
			return window.dispatchEvent(new Event(Y)), o;
		}, () => {
			e.pushState = t, e.replaceState = n;
		};
	}
	function mt() {
		if (typeof window > "u" || U) return;
		const e = ft(), t = () => ct();
		window.addEventListener(Y, t), window.addEventListener("popstate", t), window.addEventListener("hashchange", t), U = () => {
			e(), window.removeEventListener(Y, t), window.removeEventListener("popstate", t), window.removeEventListener("hashchange", t), U = void 0;
		};
	}
	function gt() {
		U && (U(), K.lastUrl = "");
	}
	var Et = defineComponent({
		name: "ToastifyContainer",
		inheritAttrs: !1,
		props: pe,
		setup(e) {
			const t = computed(() => e.containerId), n = computed(() => f[t.value] || []), a = computed(() => n.value.filter((o) => o.position === e.position));
			return onMounted(() => {
				typeof window < "u" && (j += 1, mt());
			}), onUnmounted(() => {
				typeof window < "u" && j > 0 && (j -= 1, j === 0 && gt());
			}), () => createVNode(Fragment, null, [a.value.map((o) => {
				const { toastId: s = "" } = o;
				return createVNode(ut, mergeProps({ key: s }, o), null);
			})]);
		}
	});
	var te = !1;
	var Te = {
		isLoading: !0,
		autoClose: !1,
		closeOnClick: !1,
		closeButton: !1,
		draggable: !1
	};
	function he() {
		const e = [];
		return R().forEach((n) => {
			const a = document.getElementById(n.containerId);
			a && !a.classList.contains(X) && e.push(n);
		}), e;
	}
	function Ct(e) {
		const t = he().length, n = e != null ? e : 0;
		return n > 0 && t + p.items.length >= n;
	}
	function yt(e) {
		Ct(e.limit) && !e.updateId && p.items.push({
			toastId: e.toastId,
			containerId: e.containerId,
			toastContent: e.content,
			toastProps: e
		});
	}
	function L(e, t, n = {}) {
		if (te) return;
		n = J(Se(), { type: t }, toRaw(n)), (!n.toastId || typeof n.toastId != "string" && typeof n.toastId != "number") && (n.toastId = ve()), n = {
			...n,
			...n.type === "loading" ? Te : {},
			content: e,
			containerId: n.containerId || String(n.position)
		};
		const a = Number(n == null ? void 0 : n.progress);
		return !isNaN(a) && a < 0 && (n.progress = 0), a > 1 && (n.progress = 1), n.theme === "auto" && (n.theme = Ke()), yt(n), K.lastUrl = window.location.href, n.multiple ? p.items.length ? n.updateId && G(e, n) : G(e, n) : (te = !0, l.clearAll(void 0, !1), setTimeout(() => {
			G(e, n);
		}, 0), setTimeout(() => {
			te = !1;
		}, 390)), n.toastId;
	}
	var l = (e, t) => L(e, E.DEFAULT, t);
	l.info = (e, t) => L(e, E.DEFAULT, {
		...t,
		type: E.INFO
	});
	l.error = (e, t) => L(e, E.DEFAULT, {
		...t,
		type: E.ERROR
	});
	l.warning = (e, t) => L(e, E.DEFAULT, {
		...t,
		type: E.WARNING
	});
	l.warn = l.warning;
	l.success = (e, t) => L(e, E.DEFAULT, {
		...t,
		type: E.SUCCESS
	});
	l.loading = (e, t) => L(e, E.DEFAULT, J(t, Te));
	l.dark = (e, t) => L(e, E.DEFAULT, J(t, { theme: q.DARK }));
	l.remove = (e) => {
		e ? y.dismiss(e) : y.clear();
	};
	l.clearAll = (e, t) => {
		nextTick(() => {
			y.clear(e, t);
		});
	};
	l.isActive = (e) => {
		let t = !1;
		return t = he().findIndex((a) => a.toastId === e) > -1, t;
	};
	l.update = (e, t = {}) => {
		setTimeout(() => {
			const n = Ge(e);
			if (n) {
				const a = toRaw(n), { content: o } = a, s = {
					...a,
					...t,
					toastId: t.toastId || e,
					updateId: ve()
				}, d = s.render || o;
				delete s.render, L(d, s.type, s);
			}
		}, 0);
	};
	l.done = (e) => {
		l.update(e, {
			isLoading: !1,
			progress: 1
		});
	};
	l.promise = vt;
	function vt(e, { pending: t, error: n, success: a }, o) {
		var v, i, m;
		let s;
		const d = {
			...o || {},
			autoClose: !1
		};
		t && (s = re(t) ? l.loading(t, d) : l.loading(t.render, {
			...d,
			...t
		}));
		const C = {
			autoClose: (v = o == null ? void 0 : o.autoClose) != null ? v : !0,
			closeOnClick: (i = o == null ? void 0 : o.closeOnClick) != null ? i : !0,
			closeButton: (m = o == null ? void 0 : o.autoClose) != null ? m : null,
			isLoading: void 0,
			draggable: null,
			delay: 100
		}, c = (T, N, A) => {
			if (N == null) {
				l.remove(s);
				return;
			}
			const I = {
				type: T,
				...C,
				...o,
				data: A
			}, F = re(N) ? { render: N } : N;
			return s ? l.update(s, {
				...I,
				...F,
				isLoading: !1
			}) : l(F.render, {
				...I,
				...F,
				isLoading: !1
			}), A;
		}, _ = B(e) ? e() : e;
		return _.then((T) => {
			c("success", a, T);
		}).catch((T) => {
			c("error", n, T);
		}), _;
	}
	l.POSITION = H;
	l.THEME = q;
	l.TYPE = E;
	l.TRANSITIONS = Ie;
	typeof window < "u" && (window.Vue3Toastify = { install(e, t = {}) {
		Ve.useHandler = t.useHandler || (() => {}), pt(t);
	} });
	function pt(e = {}) {
		Qe(J(ge, e));
	}
	function defaults() {
		return {
			enabled: true,
			autoMasterSwitch: true,
			autoProceed: true,
			autoSelect: true,
			environmentId: -1,
			environmentName: "",
			showCompletedHistory: true,
			soundSuccess: true,
			soundWarning: true,
			soundError: true
		};
	}
	var Settings = {
		...defaults(),
		load() {
			Object.assign(this, defaults(), _GM_getValue(STORAGE_KEYS.settings));
		},
		save() {
			_GM_setValue(STORAGE_KEYS.settings, {
				enabled: this.enabled,
				autoMasterSwitch: this.autoMasterSwitch,
				autoProceed: this.autoProceed,
				autoSelect: this.autoSelect,
				environmentId: this.environmentId,
				environmentName: this.environmentName,
				showCompletedHistory: this.showCompletedHistory,
				soundSuccess: this.soundSuccess,
				soundWarning: this.soundWarning,
				soundError: this.soundError
			});
		}
	};
	function enabled(kind) {
		switch (kind) {
			case "success": return Settings.soundSuccess;
			case "warning": return Settings.soundWarning;
			case "error": return Settings.soundError;
		}
	}
	function playSound(kind) {
		if (!enabled(kind)) return 0;
		return previewSound(kind);
	}
	function warmUpAudio() {
		const context = getContext();
		if (context?.state == "suspended") context.resume().catch(() => {});
	}
	function previewSound(kind) {
		const context = getContext();
		if (!context) return 0;
		if (context.state == "suspended") context.resume().catch(() => {});
		if (context.state != "running") {
			debug("Audio context is not running; the sound is dropped and the next gesture will unlock it.", kind);
			unlockOnGesture(context);
			return 0;
		}
		try {
			return Math.round(SOUNDS[kind](context) * 1e3);
		} catch (error) {
			console.error("Pack&Ship Extended failed to play a sound.", error);
			return 0;
		}
	}
	var audioContext;
	function getContext() {
		if (audioContext === void 0) try {
			audioContext = new AudioContext({ latencyHint: "interactive" });
		} catch (error) {
			console.error("Pack&Ship Extended could not create an audio context.", error);
			audioContext = null;
		}
		return audioContext;
	}
	var unlockArmed = false;
	function unlockOnGesture(context) {
		if (unlockArmed) return;
		unlockArmed = true;
		const unlock = () => {
			unlockArmed = false;
			context.resume().catch(() => {});
		};
		for (const type of ["pointerdown", "keydown"]) document.addEventListener(type, unlock, {
			once: true,
			capture: true
		});
	}
	function tone(context, options) {
		const { type, from, to = from, start, duration, volume } = options;
		const at = context.currentTime + start;
		const oscillator = context.createOscillator();
		const gain = context.createGain();
		oscillator.type = type;
		oscillator.frequency.setValueAtTime(from, at);
		if (to != from) oscillator.frequency.exponentialRampToValueAtTime(to, at + duration);
		gain.gain.setValueAtTime(1e-4, at);
		gain.gain.exponentialRampToValueAtTime(volume, at + .012);
		gain.gain.setValueAtTime(volume, at + duration - .05);
		gain.gain.exponentialRampToValueAtTime(1e-4, at + duration);
		oscillator.connect(gain).connect(context.destination);
		oscillator.start(at);
		oscillator.stop(at + duration + .02);
	}
	var SOUNDS = {
		success(context) {
			tone(context, {
				type: "triangle",
				from: 659,
				start: 0,
				duration: .11,
				volume: .55
			});
			tone(context, {
				type: "triangle",
				from: 880,
				start: .11,
				duration: .2,
				volume: .55
			});
			return .31;
		},
		warning(context) {
			tone(context, {
				type: "square",
				from: 440,
				start: 0,
				duration: .14,
				volume: .28
			});
			tone(context, {
				type: "square",
				from: 440,
				start: .22,
				duration: .14,
				volume: .28
			});
			return .36;
		},
		error(context) {
			tone(context, {
				type: "sawtooth",
				from: 330,
				to: 220,
				start: 0,
				duration: .65,
				volume: .32
			});
			tone(context, {
				type: "square",
				from: 165,
				to: 110,
				start: 0,
				duration: .65,
				volume: .2
			});
			return .65;
		}
	};
	function saveOrderComment(token, orderData, orderNumber) {
		const updatePromise = updateOrderComment(token, orderData);
		l.promise(updatePromise, {
			pending: `Order ${orderNumber} notitie wordt opgeslagen...`,
			success: `Order ${orderNumber} notitie succesvol opgeslagen.`,
			error: `Er is een fout opgetreden bij het opslaan van de notitie van order ${orderNumber}.`
		}).catch((error) => {
			console.error("Failed to save order comment.", error);
			playSound("error");
		});
		return updatePromise;
	}
	var _hoisted_1$24 = ["aria-label"];
	var _hoisted_2$24 = { class: "pse-modal-head" };
	var _hoisted_3$20 = { class: "pse-modal-title" };
	var _hoisted_4$18 = { class: "pse-modal-body" };
	var _hoisted_5$17 = {
		key: 0,
		class: "pse-modal-foot"
	};
	var ModalShell_vue_vue_type_script_setup_true_lang_default = defineComponent({
		__name: "ModalShell",
		props: {
			title: {},
			size: { default: "md" },
			elevated: {
				type: Boolean,
				default: false
			},
			dismissable: {
				type: Boolean,
				default: true
			}
		},
		emits: ["close"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emit = __emit;
			onMounted(() => document.addEventListener("keydown", onKeydown));
			onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
			function onKeydown(event) {
				if (event.key == "Escape" && props.dismissable) emit("close");
			}
			function onBackdropClick(event) {
				if (props.dismissable && event.target == event.currentTarget) emit("close");
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("div", {
					class: normalizeClass(["pse-modal", { "is-elevated": __props.elevated }]),
					role: "dialog",
					"aria-modal": "true",
					"aria-label": __props.title,
					onMousedown: onBackdropClick
				}, [createBaseVNode("div", { class: normalizeClass(["pse-modal-panel", `is-${__props.size}`]) }, [
					createBaseVNode("header", _hoisted_2$24, [createBaseVNode("h2", _hoisted_3$20, toDisplayString(__props.title), 1), createBaseVNode("button", {
						type: "button",
						class: "pse-modal-close",
						"aria-label": "Sluiten",
						onClick: _cache[0] || (_cache[0] = ($event) => emit("close"))
					}, [..._cache[1] || (_cache[1] = [createBaseVNode("svg", {
						viewBox: "0 0 24 24",
						width: "17",
						height: "17",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2.2",
						"stroke-linecap": "round",
						"aria-hidden": "true"
					}, [createBaseVNode("path", { d: "M6 6l12 12M18 6L6 18" })], -1)])])]),
					createBaseVNode("div", _hoisted_4$18, [renderSlot(_ctx.$slots, "default", {}, void 0, true)]),
					_ctx.$slots.footer ? (openBlock(), createElementBlock("footer", _hoisted_5$17, [renderSlot(_ctx.$slots, "footer", {}, void 0, true)])) : createCommentVNode("", true)
				], 2)], 42, _hoisted_1$24);
			};
		}
	});
	var _plugin_vue_export_helper_default = (sfc, props) => {
		const target = sfc.__vccOpts || sfc;
		for (const [key, val] of props) target[key] = val;
		return target;
	};
	var ModalShell_default = _plugin_vue_export_helper_default(ModalShell_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-66d77727"]]);
	var shopware_default = "data:image/svg+xml,%3csvg%20width='34'%20height='34'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cdefs%3e%3cpath%20d='M26.927%2030.07a.244.244%200%2001-.002.39%2016.76%2016.76%200%2001-10.04%203.307c-4.51%200-8.75-1.756-11.94-4.944A16.772%2016.772%200%20010%2016.884c0-4.51%201.756-8.75%204.945-11.939A16.775%2016.775%200%200116.885%200c4.173%200%208.18%201.535%2011.28%204.323a.243.243%200%2001-.195.42%2028.559%2028.559%200%2000-3.86-.248c-4.918%200-8.911%201.096-11.548%203.172-2.35%201.85-3.593%204.41-3.593%207.404%200%203.338%201.277%205.976%203.905%208.067%202.319%201.846%205.408%203.044%208.133%204.1%202.29.889%204.453%201.727%205.92%202.832zm6.77-14.746c.046.537.07%201.062.07%201.56%200%202.12-.389%204.19-1.155%206.154a.244.244%200%2001-.344.124c-2.008-1.114-4.195-1.93-6.31-2.718-4.104-1.53-7.647-2.852-7.647-5.752%200-1.035.433-1.917%201.252-2.55.946-.73%202.363-1.101%204.21-1.101%203.463%200%206.313%201.192%209.837%204.117.05.041.08.102.086.166z'%20id='a'/%3e%3c/defs%3e%3cuse%20fill='%23FFF'%20xlink:href='%23a'%20fill-rule='evenodd'/%3e%3c/svg%3e";
	var _hoisted_1$23 = { class: "pse-note" };
	var _hoisted_2$23 = {
		key: 0,
		class: "pse-note-alert"
	};
	var _hoisted_3$19 = { class: "pse-note-card" };
	var _hoisted_4$17 = { class: "pse-note-head" };
	var _hoisted_5$16 = ["src"];
	var _hoisted_6$13 = { class: "pse-note-body" };
	var _hoisted_7$12 = ["disabled", "placeholder"];
	var _hoisted_8$11 = {
		key: 1,
		class: "pse-note-field pse-note-field-waiting",
		"aria-hidden": "true"
	};
	var _hoisted_9$11 = { class: "pse-note-actions" };
	var _hoisted_10$11 = ["disabled"];
	var _hoisted_11$10 = ["disabled"];
	var ShopwareNote_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ShopwareNote",
		props: {
			orderData: {},
			enabled: { type: Boolean },
			showOpen: { type: Boolean },
			showAlert: { type: Boolean }
		},
		emits: ["save", "open"],
		setup(__props) {
			const props = __props;
			const hasNote = computed(() => Boolean(props.orderData?.customerComment?.trim()));
			const ready = computed(() => props.enabled && Boolean(props.orderData));
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("section", _hoisted_1$23, [createVNode(Transition, null, {
					default: withCtx(() => [__props.showAlert && hasNote.value ? (openBlock(), createElementBlock("p", _hoisted_2$23, [..._cache[3] || (_cache[3] = [createBaseVNode("span", {
						class: "material-icons pse-note-alert-icon",
						"aria-hidden": "true"
					}, "error_outline", -1), createTextVNode(" Let op — er is een notitie bij deze order. ", -1)])])) : createCommentVNode("", true)]),
					_: 1
				}), createBaseVNode("div", _hoisted_3$19, [createBaseVNode("header", _hoisted_4$17, [createBaseVNode("img", {
					class: "pse-note-logo",
					src: unref(shopware_default),
					alt: ""
				}, null, 8, _hoisted_5$16), _cache[4] || (_cache[4] = createBaseVNode("h3", { class: "pse-note-title" }, "Shopware notitie", -1))]), createBaseVNode("div", _hoisted_6$13, [__props.orderData ? withDirectives((openBlock(), createElementBlock("textarea", {
					key: 0,
					class: "pse-note-field",
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => __props.orderData.customerComment = $event),
					disabled: !ready.value,
					placeholder: ready.value ? "Nog geen notitie..." : ""
				}, null, 8, _hoisted_7$12)), [[vModelText, __props.orderData.customerComment]]) : (openBlock(), createElementBlock("div", _hoisted_8$11, [..._cache[5] || (_cache[5] = [createBaseVNode("span", { class: "pse-note-shimmer" }, null, -1), createBaseVNode("span", { class: "pse-note-shimmer pse-note-shimmer-short" }, null, -1)])])), createBaseVNode("div", _hoisted_9$11, [__props.showOpen ? (openBlock(), createElementBlock("button", {
					key: 0,
					type: "button",
					class: "pse-note-btn pse-note-btn-quiet",
					disabled: !ready.value,
					onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("open"))
				}, " Open in Shopware ", 8, _hoisted_10$11)) : createCommentVNode("", true), createBaseVNode("button", {
					type: "button",
					class: "pse-note-btn",
					disabled: !ready.value,
					onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("save"))
				}, " Opslaan ", 8, _hoisted_11$10)])])])]);
			};
		}
	}), [["__scopeId", "data-v-469a4fde"]]);
	async function writeToClipboard(value) {
		try {
			await navigator.clipboard.writeText(value);
			return true;
		} catch {
			return copyFallback(value);
		}
	}
	function copyFallback(value) {
		const field = document.createElement("textarea");
		field.value = value;
		field.style.cssText = "position:fixed;top:-1000px;opacity:0;";
		document.body.append(field);
		field.select();
		let copied = false;
		try {
			copied = document.execCommand("copy");
		} catch (error) {
			console.error("Pack&Ship Extended could not copy to the clipboard.", error);
		}
		field.remove();
		return copied;
	}
	var _hoisted_1$22 = ["title"];
	var _hoisted_2$22 = {
		class: "material-icons pse-copy-icon",
		"aria-hidden": "true"
	};
	var CopyButton_default = defineComponent({
		__name: "CopyButton",
		props: {
			value: {},
			label: {}
		},
		setup(__props) {
			const props = __props;
			const state = ref();
			let timeout;
			const icon = computed(() => state.value == void 0 ? "content_copy" : state.value ? "check" : "error_outline");
			onUnmounted(() => clearTimeout(timeout));
			async function copy() {
				if (!props.value) return;
				state.value = await writeToClipboard(props.value);
				clearTimeout(timeout);
				timeout = setTimeout(() => state.value = void 0, 1400);
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("button", {
					type: "button",
					class: normalizeClass(["pse-copy", {
						"is-copied": state.value == true,
						"is-failed": state.value == false
					}]),
					title: `${__props.label} kopiëren`,
					onClick: _cache[0] || (_cache[0] = withModifiers(($event) => copy(), ["stop"]))
				}, [createBaseVNode("span", _hoisted_2$22, toDisplayString(icon.value), 1)], 10, _hoisted_1$22);
			};
		}
	});
	var _hoisted_1$21 = { class: "pse-rescard-head" };
	var _hoisted_2$21 = { class: "pse-rescard-id" };
	var _hoisted_3$18 = { class: "pse-rescard-number" };
	var _hoisted_4$16 = { class: "pse-rescard-reference" };
	var _hoisted_5$15 = { class: "pse-rescard-facts" };
	var _hoisted_6$12 = { class: "pse-rescard-fact" };
	var _hoisted_7$11 = { class: "pse-rescard-fact" };
	var _hoisted_8$10 = { class: "pse-rescard-fact" };
	var _hoisted_9$10 = {
		key: 0,
		class: "pse-rescard-products"
	};
	var _hoisted_10$10 = { class: "pse-table" };
	var _hoisted_11$9 = { class: "pse-cell-barcode" };
	var _hoisted_12$8 = { class: "pse-cell-description" };
	var _hoisted_13$7 = { class: "pse-cell-barcode" };
	var _hoisted_14$6 = { class: "pse-copy-cell" };
	var _hoisted_15$5 = { class: "pse-table-right" };
	var _hoisted_16$4 = { class: "pse-rescard-amount" };
	var _hoisted_17$4 = {
		key: 1,
		class: "pse-rescard-note"
	};
	var ReservationCard_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ReservationCard",
		props: {
			reservation: {},
			showProducts: { type: Boolean },
			showOpenButton: { type: Boolean },
			highlightIncomplete: { type: Boolean },
			showNote: { type: Boolean },
			noteEnabled: { type: Boolean }
		},
		emits: ["open", "saveNote"],
		setup(__props) {
			const props = __props;
			function hasShopwareNote() {
				return matchShopwareOrderNumber(props.reservation.saleOrderReference);
			}
			function isShort(amount) {
				return props.highlightIncomplete && !isAmountStringComplete(amount);
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("article", { class: normalizeClass(["pse-rescard", { "is-incomplete": __props.highlightIncomplete }]) }, [
					createBaseVNode("header", _hoisted_1$21, [
						createBaseVNode("div", _hoisted_2$21, [createBaseVNode("span", _hoisted_3$18, toDisplayString(__props.reservation.reservationNumber), 1), createBaseVNode("span", _hoisted_4$16, toDisplayString(__props.reservation.saleOrderReference), 1)]),
						createBaseVNode("dl", _hoisted_5$15, [
							createBaseVNode("div", _hoisted_6$12, [_cache[2] || (_cache[2] = createBaseVNode("dt", null, "Klant", -1)), createBaseVNode("dd", null, toDisplayString(__props.reservation.customer), 1)]),
							createBaseVNode("div", _hoisted_7$11, [_cache[3] || (_cache[3] = createBaseVNode("dt", null, "Status", -1)), createBaseVNode("dd", null, toDisplayString(__props.reservation.status), 1)]),
							createBaseVNode("div", _hoisted_8$10, [_cache[4] || (_cache[4] = createBaseVNode("dt", null, "Logistiek", -1)), createBaseVNode("dd", null, toDisplayString(__props.reservation.deliveryStatus), 1)])
						]),
						createVNode(Transition, null, {
							default: withCtx(() => [__props.showOpenButton ? (openBlock(), createElementBlock("button", {
								key: 0,
								type: "button",
								class: "pse-rescard-open",
								onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("open", __props.reservation.url))
							}, [..._cache[5] || (_cache[5] = [createTextVNode(" Open ", -1), createBaseVNode("span", {
								class: "material-icons pse-rescard-open-icon",
								"aria-hidden": "true"
							}, "chevron_right", -1)])])) : createCommentVNode("", true)]),
							_: 1
						})
					]),
					__props.showProducts ? (openBlock(), createElementBlock("div", _hoisted_9$10, [createBaseVNode("table", _hoisted_10$10, [_cache[6] || (_cache[6] = createBaseVNode("thead", null, [createBaseVNode("tr", null, [
						createBaseVNode("th", null, "Artikel nr"),
						createBaseVNode("th", null, "Omschrijving"),
						createBaseVNode("th", null, "Hoofd barcode"),
						createBaseVNode("th", { class: "pse-table-right" }, "Geraapt")
					])], -1)), createBaseVNode("tbody", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.reservation.products, (product, index) => {
						return openBlock(), createElementBlock("tr", {
							key: index,
							class: normalizeClass({ "is-short": isShort(product.amount) })
						}, [
							createBaseVNode("td", _hoisted_11$9, toDisplayString(product.number), 1),
							createBaseVNode("td", _hoisted_12$8, toDisplayString(product.description), 1),
							createBaseVNode("td", _hoisted_13$7, [createBaseVNode("span", _hoisted_14$6, [createTextVNode(toDisplayString(product.barcode) + " ", 1), createVNode(CopyButton_default, {
								value: product.barcode,
								label: "Barcode"
							}, null, 8, ["value"])])]),
							createBaseVNode("td", _hoisted_15$5, [createBaseVNode("span", _hoisted_16$4, toDisplayString(product.amount), 1)])
						], 2);
					}), 128))])])])) : createCommentVNode("", true),
					__props.showNote && hasShopwareNote() ? (openBlock(), createElementBlock("div", _hoisted_17$4, [createVNode(ShopwareNote_default, {
						"order-data": __props.reservation.swOrderData,
						enabled: !!__props.noteEnabled,
						onSave: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("saveNote"))
					}, null, 8, ["order-data", "enabled"])])) : createCommentVNode("", true)
				], 2);
			};
		}
	}), [["__scopeId", "data-v-99ff8266"]]);
	var _hoisted_1$20 = { class: "pse-row-number" };
	var _hoisted_2$20 = { class: "pse-row-customer" };
	var _hoisted_3$17 = { class: "pse-row-reference" };
	var _hoisted_4$15 = { key: 2 };
	var ReservationRow_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ReservationRow",
		props: {
			reservation: {},
			status: {},
			showOpen: { type: Boolean }
		},
		emits: ["open"],
		setup(__props) {
			const props = __props;
			const STATES = {
				[MassCompleteStatus.idle]: {
					label: "In wachtrij",
					modifier: "is-queued"
				},
				[MassCompleteStatus.started]: {
					label: "Bezig",
					modifier: "is-busy"
				},
				[MassCompleteStatus.finished]: {
					label: "Afgerond",
					modifier: "is-done"
				},
				[MassCompleteStatus.failed]: {
					label: "Mislukt",
					modifier: "is-failed"
				},
				[MassCompleteStatus.stopped]: {
					label: "Gestopt",
					modifier: "is-stopped"
				}
			};
			const state = computed(() => props.status == void 0 ? void 0 : STATES[props.status] ?? STATES[MassCompleteStatus.failed]);
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("div", { class: normalizeClass(["pse-row", state.value?.modifier]) }, [
					createBaseVNode("span", _hoisted_1$20, toDisplayString(__props.reservation.reservationNumber), 1),
					createBaseVNode("span", _hoisted_2$20, toDisplayString(__props.reservation.customer), 1),
					createBaseVNode("span", _hoisted_3$17, toDisplayString(__props.reservation.saleOrderReference), 1),
					state.value ? (openBlock(), createElementBlock("span", {
						key: 0,
						class: normalizeClass(["pse-row-state", state.value.modifier])
					}, [_cache[1] || (_cache[1] = createBaseVNode("span", {
						class: "pse-row-mark",
						"aria-hidden": "true"
					}, null, -1)), createTextVNode(" " + toDisplayString(state.value.label), 1)], 2)) : __props.showOpen ? (openBlock(), createElementBlock("button", {
						key: 1,
						type: "button",
						class: "pse-row-open",
						onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("open", __props.reservation.url))
					}, [..._cache[2] || (_cache[2] = [createTextVNode(" Open ", -1), createBaseVNode("span", {
						class: "material-icons pse-row-open-icon",
						"aria-hidden": "true"
					}, "chevron_right", -1)])])) : (openBlock(), createElementBlock("span", _hoisted_4$15))
				], 2);
			};
		}
	}), [["__scopeId", "data-v-51c20dba"]]);
	var _hoisted_1$19 = { class: "pse-mc-head" };
	var _hoisted_2$19 = { class: "pse-mc-titles" };
	var _hoisted_3$16 = {
		key: 0,
		class: "pse-mc-subtitle"
	};
	var _hoisted_4$14 = {
		key: 1,
		class: "pse-mc-subtitle"
	};
	var _hoisted_5$14 = {
		key: 2,
		class: "pse-mc-subtitle"
	};
	var _hoisted_6$11 = {
		key: 3,
		class: "pse-mc-subtitle"
	};
	var _hoisted_7$10 = {
		key: 4,
		class: "pse-mc-subtitle"
	};
	var _hoisted_8$9 = {
		key: 0,
		class: "pse-mc-controls"
	};
	var _hoisted_9$9 = { class: "pse-mc-stepper" };
	var _hoisted_10$9 = ["disabled"];
	var _hoisted_11$8 = ["value"];
	var _hoisted_12$7 = ["disabled"];
	var _hoisted_13$6 = {
		key: 1,
		class: "pse-mc-tally"
	};
	var _hoisted_14$5 = { class: "pse-mc-tally-count" };
	var _hoisted_15$4 = { class: "pse-mc-tally-of" };
	var _hoisted_16$3 = { class: "pse-mc-tally-label" };
	var _hoisted_17$3 = {
		key: 0,
		class: "pse-mc-progress"
	};
	var MassCompletePanel_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "MassCompletePanel",
		props: {
			total: {},
			max: {},
			amount: {},
			started: { type: Boolean },
			finished: {},
			failed: {},
			stopped: { type: Boolean }
		},
		emits: ["update:amount", "start"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emit = __emit;
			const settled = computed(() => props.finished + props.failed);
			const done = computed(() => props.started && (props.stopped || settled.value >= props.amount));
			const progress = computed(() => props.started && props.amount > 0 ? Math.round(settled.value / props.amount * 100) : 0);
			function step(by) {
				emit("update:amount", props.amount + by);
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("section", { class: normalizeClass(["pse-mc", {
					"is-running": __props.started && !done.value,
					"is-done": done.value,
					"is-stopped": __props.stopped
				}]) }, [createBaseVNode("div", _hoisted_1$19, [
					_cache[6] || (_cache[6] = createBaseVNode("span", {
						class: "pse-mc-icon",
						"aria-hidden": "true"
					}, [createBaseVNode("svg", {
						viewBox: "0 0 24 24",
						width: "19",
						height: "19",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					}, [createBaseVNode("path", { d: "M4 7h16M4 12h16M4 17h9" }), createBaseVNode("path", { d: "M15.5 18.5l2 2 4-4.5" })])], -1)),
					createBaseVNode("div", _hoisted_2$19, [_cache[5] || (_cache[5] = createBaseVNode("h3", { class: "pse-mc-title" }, "Massa voltooien", -1)), !__props.started ? (openBlock(), createElementBlock("p", _hoisted_3$16, " Opent " + toDisplayString(__props.amount) + " van de " + toDisplayString(__props.total) + " reserveringen in de achtergrond en rondt ze af. ", 1)) : !done.value ? (openBlock(), createElementBlock("p", _hoisted_4$14, toDisplayString(settled.value) + " van " + toDisplayString(__props.amount) + " afgerond — laat dit scherm openstaan. ", 1)) : __props.stopped ? (openBlock(), createElementBlock("p", _hoisted_5$14, " Gestopt na een mislukte reservering. " + toDisplayString(__props.finished) + " afgerond, de rest is niet geprobeerd — het tabblad met de fout staat nog open. ", 1)) : __props.failed > 0 ? (openBlock(), createElementBlock("p", _hoisted_6$11, toDisplayString(__props.finished) + " afgerond, " + toDisplayString(__props.failed) + " mislukt. Mislukte reserveringen staan hieronder. ", 1)) : (openBlock(), createElementBlock("p", _hoisted_7$10, " Alle " + toDisplayString(__props.finished) + " reserveringen zijn afgerond. ", 1))]),
					!__props.started ? (openBlock(), createElementBlock("div", _hoisted_8$9, [createBaseVNode("div", _hoisted_9$9, [
						createBaseVNode("button", {
							type: "button",
							class: "pse-mc-step",
							"aria-label": "Eén minder",
							disabled: __props.amount <= 2,
							onClick: _cache[0] || (_cache[0] = ($event) => step(-1))
						}, "−", 8, _hoisted_10$9),
						createBaseVNode("input", {
							type: "number",
							class: "pse-mc-amount",
							value: __props.amount,
							inputmode: "numeric",
							"aria-label": "Aantal reserveringen",
							onInput: _cache[1] || (_cache[1] = ($event) => emit("update:amount", Number($event.target.value))),
							onFocusout: _cache[2] || (_cache[2] = ($event) => emit("update:amount", __props.amount))
						}, null, 40, _hoisted_11$8),
						createBaseVNode("button", {
							type: "button",
							class: "pse-mc-step",
							"aria-label": "Eén meer",
							disabled: __props.amount >= Math.min(__props.max, __props.total),
							onClick: _cache[3] || (_cache[3] = ($event) => step(1))
						}, "+", 8, _hoisted_12$7)
					]), createBaseVNode("button", {
						type: "button",
						class: "pse-dialog-btn pse-mc-start",
						onClick: _cache[4] || (_cache[4] = ($event) => emit("start"))
					}, " Start voltooien ")])) : (openBlock(), createElementBlock("div", _hoisted_13$6, [createBaseVNode("span", _hoisted_14$5, [createTextVNode(toDisplayString(settled.value), 1), createBaseVNode("span", _hoisted_15$4, "/" + toDisplayString(__props.amount), 1)]), createBaseVNode("span", _hoisted_16$3, toDisplayString(__props.stopped ? "gestopt" : done.value ? "klaar" : "afgerond"), 1)]))
				]), __props.started ? (openBlock(), createElementBlock("div", _hoisted_17$3, [createBaseVNode("div", {
					class: "pse-mc-progress-fill",
					style: normalizeStyle({ width: `${progress.value}%` })
				}, null, 4)])) : createCommentVNode("", true)], 2);
			};
		}
	}), [["__scopeId", "data-v-5c92f516"]]);
	var _hoisted_1$18 = { class: "pse-found" };
	var _hoisted_2$18 = { class: "pse-found-image" };
	var _hoisted_3$15 = ["src"];
	var _hoisted_4$13 = { class: "pse-found-text" };
	var _hoisted_5$13 = { class: "pse-found-name" };
	var _hoisted_6$10 = { class: "pse-found-barcode pse-copy-cell" };
	var _hoisted_7$9 = { class: "pse-found-count" };
	var _hoisted_8$8 = { class: "pse-found-count-number" };
	var _hoisted_9$8 = {
		key: 0,
		class: "pse-countdown"
	};
	var _hoisted_10$8 = {
		key: 0,
		class: "pse-group"
	};
	var _hoisted_11$7 = { class: "pse-group-head" };
	var _hoisted_12$6 = { class: "pse-group-title" };
	var _hoisted_13$5 = { class: "pse-group-count" };
	var _hoisted_14$4 = { class: "pse-rows" };
	var _hoisted_15$3 = {
		key: 1,
		class: "pse-group"
	};
	var _hoisted_16$2 = { class: "pse-group-head" };
	var _hoisted_17$2 = { class: "pse-group-title" };
	var _hoisted_18$2 = { class: "pse-group-count" };
	var _hoisted_19$2 = {
		key: 2,
		class: "pse-group"
	};
	var _hoisted_20$1 = { class: "pse-group-head" };
	var _hoisted_21$1 = { class: "pse-group-title" };
	var _hoisted_22$1 = { class: "pse-group-count" };
	var massCompleteMax = 50;
	var massCompleteThreshold = 2;
	var ReservationSelectionModal_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ReservationSelectionModal",
		props: { modalData: {} },
		emits: ["open", "close"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const props = __props;
			const swToken = ref();
			const swCommentBoxesEnabled = ref(false);
			const countdown = ref(2);
			let saveTimeoutId;
			const massCompleteShowDialog = ref(false);
			const massCompleteStarted = ref(false);
			const massCompleteAmount = ref(100);
			const massCompleteStatus = ref();
			const massCompleteStopped = ref(false);
			initMassComplete();
			onMounted(() => {
				shopwareInitialize().then((token) => {
					swToken.value = token;
					retrieveCommentData();
					autoSelectReservationCountdown();
				});
			});
			function onSaveButtonClick(orderData, orderNumber) {
				if (swToken.value) saveOrderComment(swToken.value, orderData, orderNumber);
				swCommentBoxesEnabled.value = false;
				if (saveTimeoutId) clearTimeout(saveTimeoutId);
				saveTimeoutId = setTimeout(() => {
					swCommentBoxesEnabled.value = true;
				}, 250);
			}
			function retrieveCommentData() {
				const reservationsToFetch = props.modalData.invalidReservations.concat(props.modalData.validReservations);
				Promise.all(reservationsToFetch.map((reservation) => shopwareGetOrderData(swToken.value, reservation.saleOrderReference))).then((responses) => {
					responses.forEach((response, index) => {
						reservationsToFetch[index].swOrderData = response.data[0];
					});
				}).then(() => {
					swCommentBoxesEnabled.value = true;
				});
			}
			function autoSelectReservationCountdown() {
				if (!canAutoProceed()) return;
				let countdownInterval = setInterval(() => {
					countdown.value--;
					if (countdown.value <= 0) {
						clearInterval(countdownInterval);
						autoSelectReservation();
					}
				}, 1e3);
			}
			function autoSelectReservation() {
				if (props.modalData.singleLineReservations.length > 0) {
					emit("open", props.modalData.singleLineReservations[0].url);
					return;
				}
				if (props.modalData.validReservations.length > 0) {
					emit("open", props.modalData.validReservations[0].url);
					return;
				}
			}
			function canAutoProceed() {
				if (!Settings.autoMasterSwitch) return false;
				if (props.modalData.singleLineReservations.length <= 0 && props.modalData.validReservations.length <= 0) return false;
				if (massCompleteShowDialog.value == true) return false;
				return true;
			}
			function initMassComplete() {
				if (props.modalData.singleLineReservations && props.modalData.singleLineReservations.length >= massCompleteThreshold) {
					setMassCompleteAmount(props.modalData.singleLineReservations.length);
					massCompleteShowDialog.value = true;
				}
			}
			function setMassCompleteAmount(value) {
				const totalReservations = props.modalData.singleLineReservations.length;
				massCompleteAmount.value = Math.min(Math.min(Math.max(2, value), massCompleteMax), totalReservations);
			}
			async function startMassComplete() {
				setMassCompleteAmount(massCompleteAmount.value);
				massCompleteStarted.value = true;
				let startedReservations = [];
				for (let i = 0; i < massCompleteAmount.value; i++) {
					const reservation = props.modalData.singleLineReservations[i];
					let tab = await _GM.openInTab(reservation.url, { active: false });
					const entry = {
						reservationNumber: String(reservation.reservationNumber),
						status: MassCompleteStatus.idle,
						close: tab.close
					};
					startedReservations.push(entry);
					monitorMassCompleteEntry(entry);
				}
				initMassCompleteStatus(startedReservations);
				massCompleteStatus.value = startedReservations;
			}
			function monitorMassCompleteEntry(entry) {
				_GM_addValueChangeListener(`PSE_MCEntry_${entry.reservationNumber}`, (_key, _oldValue, newValue, _remote) => {
					if (massCompleteStatus.value) {
						const entryIndex = massCompleteStatus.value.findIndex((statusEnt) => statusEnt.reservationNumber == entry.reservationNumber);
						if (entryIndex != -1) massCompleteStatus.value[entryIndex].status = newValue;
						if (newValue == MassCompleteStatus.finished) entry.close?.();
						if (newValue == MassCompleteStatus.failed) stopMassComplete(entry);
					}
				});
			}
			function stopMassComplete(failed) {
				if (massCompleteStopped.value) return;
				massCompleteStopped.value = true;
				for (const entry of massCompleteStatus.value ?? []) {
					if (entry.reservationNumber == failed.reservationNumber) continue;
					if (entry.status == MassCompleteStatus.finished || entry.status == MassCompleteStatus.failed) continue;
					entry.close?.();
					entry.status = MassCompleteStatus.stopped;
				}
			}
			function statusFor(reservationNumber) {
				return massCompleteStatus.value?.find((entry) => entry.reservationNumber == String(reservationNumber))?.status;
			}
			const massCompleteFinished = computed(() => countStatus(MassCompleteStatus.finished));
			const massCompleteFailed = computed(() => countStatus(MassCompleteStatus.failed));
			function countStatus(status) {
				return massCompleteStatus.value?.filter((entry) => entry.status == status).length ?? 0;
			}
			return (_ctx, _cache) => {
				return openBlock(), createBlock(ModalShell_default, {
					title: `${__props.modalData.searchProductAmount} reserveringen met dit product`,
					size: "xl",
					dismissable: false,
					onClose: _cache[4] || (_cache[4] = ($event) => emit("close"))
				}, {
					footer: withCtx(() => [createBaseVNode("button", {
						type: "button",
						class: "pse-dialog-btn pse-dialog-btn-quiet",
						onClick: _cache[3] || (_cache[3] = ($event) => emit("close"))
					}, " Sluiten ")]),
					default: withCtx(() => [
						createBaseVNode("section", _hoisted_1$18, [
							createBaseVNode("div", _hoisted_2$18, [__props.modalData.searchProductImageUrl ? (openBlock(), createElementBlock("img", {
								key: 0,
								src: __props.modalData.searchProductImageUrl,
								alt: "",
								loading: "lazy"
							}, null, 8, _hoisted_3$15)) : createCommentVNode("", true)]),
							createBaseVNode("div", _hoisted_4$13, [createBaseVNode("h3", _hoisted_5$13, toDisplayString(__props.modalData.searchProductName), 1), createBaseVNode("p", _hoisted_6$10, [createTextVNode(toDisplayString(__props.modalData.searchProductBarcode) + " ", 1), createVNode(CopyButton_default, {
								value: __props.modalData.searchProductBarcode,
								label: "Barcode"
							}, null, 8, ["value"])])]),
							createBaseVNode("div", _hoisted_7$9, [createBaseVNode("span", _hoisted_8$8, toDisplayString(__props.modalData.searchProductAmount), 1), _cache[5] || (_cache[5] = createBaseVNode("span", { class: "pse-found-count-label" }, "reserveringen", -1))])
						]),
						createVNode(Transition, null, {
							default: withCtx(() => [canAutoProceed() ? (openBlock(), createElementBlock("p", _hoisted_9$8, [_cache[6] || (_cache[6] = createBaseVNode("span", {
								class: "pse-countdown-mark",
								"aria-hidden": "true"
							}, null, -1)), createTextVNode(" Gaat automatisch verder over " + toDisplayString(countdown.value) + " seconden... ", 1)])) : createCommentVNode("", true)]),
							_: 1
						}),
						__props.modalData.singleLineReservations.length > 0 ? (openBlock(), createElementBlock("section", _hoisted_10$8, [
							createBaseVNode("header", _hoisted_11$7, [createBaseVNode("h3", _hoisted_12$6, [_cache[7] || (_cache[7] = createTextVNode(" Singleline ", -1)), createBaseVNode("span", _hoisted_13$5, toDisplayString(__props.modalData.singleLineReservations.length), 1)]), _cache[8] || (_cache[8] = createBaseVNode("p", { class: "pse-group-note" }, "Deze reserveringen bevatten 1 stuk van het product.", -1))]),
							massCompleteShowDialog.value ? (openBlock(), createBlock(MassCompletePanel_default, {
								key: 0,
								total: __props.modalData.singleLineReservations.length,
								max: massCompleteMax,
								amount: massCompleteAmount.value,
								started: massCompleteStarted.value,
								finished: massCompleteFinished.value,
								failed: massCompleteFailed.value,
								stopped: massCompleteStopped.value,
								"onUpdate:amount": setMassCompleteAmount,
								onStart: _cache[0] || (_cache[0] = ($event) => startMassComplete())
							}, null, 8, [
								"total",
								"amount",
								"started",
								"finished",
								"failed",
								"stopped"
							])) : createCommentVNode("", true),
							createBaseVNode("div", _hoisted_14$4, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.modalData.singleLineReservations, (reservation) => {
								return openBlock(), createBlock(ReservationRow_default, {
									key: reservation.reservationNumber,
									reservation,
									status: statusFor(reservation.reservationNumber),
									"show-open": !massCompleteStarted.value,
									onOpen: _cache[1] || (_cache[1] = (url) => emit("open", url))
								}, null, 8, [
									"reservation",
									"status",
									"show-open"
								]);
							}), 128))])
						])) : createCommentVNode("", true),
						__props.modalData.validReservations.length > 0 ? (openBlock(), createElementBlock("section", _hoisted_15$3, [createBaseVNode("header", _hoisted_16$2, [createBaseVNode("h3", _hoisted_17$2, [_cache[9] || (_cache[9] = createTextVNode(" Reserveringen ", -1)), createBaseVNode("span", _hoisted_18$2, toDisplayString(__props.modalData.validReservations.length), 1)]), _cache[10] || (_cache[10] = createBaseVNode("p", { class: "pse-group-note" }, "Klaar om verwerkt te worden.", -1))]), (openBlock(true), createElementBlock(Fragment, null, renderList(__props.modalData.validReservations, (reservation) => {
							return openBlock(), createBlock(ReservationCard_default, {
								key: reservation.reservationNumber,
								reservation,
								"show-products": "",
								"show-open-button": !massCompleteStarted.value,
								"show-note": "",
								"note-enabled": swCommentBoxesEnabled.value,
								onOpen: _cache[2] || (_cache[2] = (url) => emit("open", url)),
								onSaveNote: ($event) => onSaveButtonClick(reservation.swOrderData, reservation.saleOrderReference)
							}, null, 8, [
								"reservation",
								"show-open-button",
								"note-enabled",
								"onSaveNote"
							]);
						}), 128))])) : createCommentVNode("", true),
						__props.modalData.invalidReservations.length > 0 ? (openBlock(), createElementBlock("section", _hoisted_19$2, [createBaseVNode("header", _hoisted_20$1, [createBaseVNode("h3", _hoisted_21$1, [_cache[11] || (_cache[11] = createTextVNode(" Nog niet volledig geraapt ", -1)), createBaseVNode("span", _hoisted_22$1, toDisplayString(__props.modalData.invalidReservations.length), 1)]), _cache[12] || (_cache[12] = createBaseVNode("p", { class: "pse-group-note" }, " Deze reserveringen bevatten het product, maar hebben niet de juiste logistieke status of zijn nog niet volledig geraapt. Ze kunnen hier niet geopend worden. ", -1))]), (openBlock(true), createElementBlock(Fragment, null, renderList(__props.modalData.invalidReservations, (reservation) => {
							return openBlock(), createBlock(ReservationCard_default, {
								key: reservation.reservationNumber,
								reservation,
								"show-products": "",
								"highlight-incomplete": "",
								"show-note": "",
								"note-enabled": swCommentBoxesEnabled.value,
								onSaveNote: ($event) => onSaveButtonClick(reservation.swOrderData, reservation.saleOrderReference)
							}, null, 8, [
								"reservation",
								"note-enabled",
								"onSaveNote"
							]);
						}), 128))])) : createCommentVNode("", true)
					]),
					_: 1
				}, 8, ["title"]);
			};
		}
	}), [["__scopeId", "data-v-d0ff4a59"]]);
	var _hoisted_1$17 = { class: "pse-panel" };
	var _hoisted_2$17 = { class: "pse-panel-head" };
	var _hoisted_3$14 = {
		class: "pse-panel-icon",
		"aria-hidden": "true"
	};
	var _hoisted_4$12 = { class: "pse-panel-text" };
	var _hoisted_5$12 = { class: "pse-panel-title" };
	var _hoisted_6$9 = { class: "pse-panel-subtitle" };
	var SearchPanel_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "SearchPanel",
		props: {
			title: {},
			subtitle: {}
		},
		setup(__props) {
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("section", _hoisted_1$17, [createBaseVNode("header", _hoisted_2$17, [createBaseVNode("span", _hoisted_3$14, [renderSlot(_ctx.$slots, "icon", {}, void 0, true)]), createBaseVNode("span", _hoisted_4$12, [createBaseVNode("h2", _hoisted_5$12, toDisplayString(__props.title), 1), createBaseVNode("p", _hoisted_6$9, toDisplayString(__props.subtitle), 1)])]), renderSlot(_ctx.$slots, "default", {}, void 0, true)]);
			};
		}
	}), [["__scopeId", "data-v-2ad9890a"]]);
	var _hoisted_1$16 = { class: "pse-field" };
	var _hoisted_2$16 = { class: "pse-field-label" };
	var _hoisted_3$13 = ["placeholder"];
	var SearchField_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "SearchField",
		props: mergeModels({
			label: {},
			placeholder: {},
			adopt: {}
		}, {
			"modelValue": {},
			"modelModifiers": {}
		}),
		emits: ["update:modelValue"],
		setup(__props) {
			const props = __props;
			const model = useModel(__props, "modelValue");
			const shell = useTemplateRef("shell");
			onMounted(() => {
				if (!props.adopt) return;
				adoptElement(shell.value, document.querySelector(props.adopt), "pse-input");
			});
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("label", _hoisted_1$16, [createBaseVNode("span", _hoisted_2$16, toDisplayString(__props.label), 1), createBaseVNode("span", {
					class: "pse-field-shell",
					ref_key: "shell",
					ref: shell
				}, [!__props.adopt ? withDirectives((openBlock(), createElementBlock("input", {
					key: 0,
					class: "pse-input",
					type: "text",
					autocomplete: "off",
					placeholder: __props.placeholder,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => model.value = $event)
				}, null, 8, _hoisted_3$13)), [[vModelText, model.value]]) : createCommentVNode("", true)], 512)]);
			};
		}
	}), [["__scopeId", "data-v-e35ea7a8"]]);
	var _hoisted_1$15 = { class: "pse-notice-text" };
	var _hoisted_2$15 = { class: "pse-notice-title" };
	var _hoisted_3$12 = {
		key: 0,
		class: "pse-notice-detail"
	};
	var SearchNotice_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "SearchNotice",
		props: {
			title: {},
			detail: {},
			tone: {}
		},
		emits: ["dismiss"],
		setup(__props) {
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("div", {
					class: normalizeClass(["pse-notice", `is-${__props.tone}`]),
					role: "status"
				}, [
					_cache[2] || (_cache[2] = createStaticVNode("<span class=\"pse-notice-icon\" aria-hidden=\"true\" data-v-0438713d><svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" data-v-0438713d><circle cx=\"12\" cy=\"12\" r=\"8.5\" data-v-0438713d></circle><path d=\"M12 8v5\" data-v-0438713d></path><path d=\"M12 16.2v.1\" data-v-0438713d></path></svg></span>", 1)),
					createBaseVNode("span", _hoisted_1$15, [createBaseVNode("span", _hoisted_2$15, toDisplayString(__props.title), 1), __props.detail ? (openBlock(), createElementBlock("span", _hoisted_3$12, toDisplayString(__props.detail), 1)) : createCommentVNode("", true)]),
					createBaseVNode("button", {
						type: "button",
						class: "pse-notice-close",
						"aria-label": "Melding sluiten",
						onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("dismiss"))
					}, [..._cache[1] || (_cache[1] = [createBaseVNode("svg", {
						viewBox: "0 0 24 24",
						width: "16",
						height: "16",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2.2",
						"stroke-linecap": "round"
					}, [createBaseVNode("path", { d: "M6 6l12 12M18 6L6 18" })], -1)])])
				], 2);
			};
		}
	}), [["__scopeId", "data-v-0438713d"]]);
	var _hoisted_1$14 = ["disabled"];
	var _hoisted_2$14 = {
		class: "pse-resume-icon",
		"aria-hidden": "true"
	};
	var _hoisted_3$11 = { class: "pse-resume-text" };
	var _hoisted_4$11 = { class: "pse-resume-label" };
	var _hoisted_5$11 = { class: "pse-resume-number" };
	var ResumeButton_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ResumeButton",
		props: {
			label: {},
			reservationNumber: {},
			disabled: { type: Boolean }
		},
		emits: ["click"],
		setup(__props) {
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("button", {
					type: "button",
					class: "pse-resume",
					disabled: __props.disabled,
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click"))
				}, [
					createBaseVNode("span", _hoisted_2$14, [renderSlot(_ctx.$slots, "icon", {}, void 0, true)]),
					createBaseVNode("span", _hoisted_3$11, [createBaseVNode("span", _hoisted_4$11, toDisplayString(__props.label), 1), createBaseVNode("span", _hoisted_5$11, toDisplayString(__props.reservationNumber || "Nog geen"), 1)]),
					_cache[1] || (_cache[1] = createBaseVNode("svg", {
						class: "pse-resume-chevron",
						viewBox: "0 0 24 24",
						width: "18",
						height: "18",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round",
						"aria-hidden": "true"
					}, [createBaseVNode("path", { d: "M9 6l6 6-6 6" })], -1))
				], 8, _hoisted_1$14);
			};
		}
	}), [["__scopeId", "data-v-ead5c402"]]);
	var _hoisted_1$13 = { class: "pse-history" };
	var _hoisted_2$13 = { class: "pse-history-head" };
	var _hoisted_3$10 = { class: "pse-history-text" };
	var _hoisted_4$10 = { class: "pse-history-subtitle" };
	var _hoisted_5$10 = { class: "pse-history-list" };
	var _hoisted_6$8 = ["title", "onClick"];
	var _hoisted_7$8 = { class: "pse-history-body" };
	var _hoisted_8$7 = { class: "pse-history-number" };
	var _hoisted_9$7 = {
		key: 0,
		class: "pse-history-customer"
	};
	var _hoisted_10$7 = { class: "pse-history-meta" };
	var _hoisted_11$6 = {
		key: 0,
		class: "pse-history-badge"
	};
	var _hoisted_12$5 = { key: 1 };
	var CompletedHistoryPanel_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "CompletedHistoryPanel",
		props: { entries: {} },
		emits: ["open", "clear"],
		setup(__props) {
			const props = __props;
			const now = ref(Date.now());
			let tick;
			onMounted(() => {
				tick = window.setInterval(() => now.value = Date.now(), 6e4);
			});
			onBeforeUnmount(() => window.clearInterval(tick));
			const failedCount = computed(() => props.entries.filter((entry) => entry.failed).length);
			function ago(completedAt) {
				const minutes = Math.floor((now.value - completedAt) / 6e4);
				if (minutes < 1) return "Zojuist";
				if (minutes < 60) return `${minutes} min geleden`;
				const completed = new Date(completedAt);
				const time = completed.toLocaleTimeString("nl-NL", {
					hour: "2-digit",
					minute: "2-digit"
				});
				return isToday(completed) ? time : `${completed.toLocaleDateString("nl-NL", {
					day: "numeric",
					month: "short"
				})} ${time}`;
			}
			function isToday(date) {
				const today = new Date();
				return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
			}
			function parcelLabel(count) {
				return count == 1 ? "1 pakket" : `${count} pakketten`;
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("aside", _hoisted_1$13, [createBaseVNode("header", _hoisted_2$13, [
					_cache[2] || (_cache[2] = createBaseVNode("span", {
						class: "pse-history-icon",
						"aria-hidden": "true"
					}, [createBaseVNode("svg", {
						viewBox: "0 0 24 24",
						width: "18",
						height: "18",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					}, [createBaseVNode("circle", {
						cx: "12",
						cy: "12",
						r: "8.5"
					}), createBaseVNode("path", { d: "M12 7.5V12l3 2" })])], -1)),
					createBaseVNode("span", _hoisted_3$10, [_cache[1] || (_cache[1] = createBaseVNode("h2", { class: "pse-history-title" }, "Afgerond", -1)), createBaseVNode("p", _hoisted_4$10, [createTextVNode(toDisplayString(__props.entries.length) + " " + toDisplayString(__props.entries.length == 1 ? "reservering" : "reserveringen"), 1), failedCount.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(", " + toDisplayString(failedCount.value) + " geweigerd", 1)], 64)) : createCommentVNode("", true)])]),
					createBaseVNode("button", {
						type: "button",
						class: "pse-history-clear",
						onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("clear"))
					}, "Wissen")
				]), createBaseVNode("ol", _hoisted_5$10, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.entries, (entry) => {
					return openBlock(), createElementBlock("li", { key: entry.number }, [createBaseVNode("button", {
						type: "button",
						class: normalizeClass(["pse-history-row", { "pse-history-row-failed": entry.failed }]),
						title: `Pakket toevoegen aan reservering ${entry.number}${entry.customer ? ` -- ${entry.customer}` : ""}`,
						onClick: ($event) => _ctx.$emit("open", entry.number)
					}, [
						_cache[4] || (_cache[4] = createBaseVNode("span", {
							class: "pse-history-marker",
							"aria-hidden": "true"
						}, null, -1)),
						createBaseVNode("span", _hoisted_7$8, [
							createBaseVNode("span", _hoisted_8$7, toDisplayString(entry.number), 1),
							entry.customer ? (openBlock(), createElementBlock("span", _hoisted_9$7, toDisplayString(entry.customer), 1)) : createCommentVNode("", true),
							createBaseVNode("span", _hoisted_10$7, [
								entry.failed ? (openBlock(), createElementBlock("span", _hoisted_11$6, "Geweigerd")) : (openBlock(), createElementBlock("span", _hoisted_12$5, toDisplayString(parcelLabel(entry.parcels)), 1)),
								_cache[3] || (_cache[3] = createBaseVNode("span", {
									class: "pse-history-dot",
									"aria-hidden": "true"
								}, "·", -1)),
								createBaseVNode("span", null, toDisplayString(ago(entry.completedAt)), 1)
							])
						]),
						_cache[5] || (_cache[5] = createBaseVNode("svg", {
							class: "pse-history-add",
							viewBox: "0 0 24 24",
							width: "16",
							height: "16",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "2",
							"stroke-linecap": "round",
							"stroke-linejoin": "round",
							"aria-hidden": "true"
						}, [
							createBaseVNode("path", { d: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" }),
							createBaseVNode("path", { d: "M4 7.5l8 4.5 8-4.5" }),
							createBaseVNode("path", { d: "M12 12v9" })
						], -1))
					], 10, _hoisted_6$8)]);
				}), 128))])]);
			};
		}
	}), [["__scopeId", "data-v-1532f3f2"]]);
	var _hoisted_1$12 = { class: "pse-search" };
	var _hoisted_2$12 = { class: "pse-main" };
	var _hoisted_3$9 = { class: "pse-card" };
	var _hoisted_4$9 = ["disabled"];
	var _hoisted_5$9 = {
		key: 0,
		class: "pse-spinner",
		"aria-hidden": "true"
	};
	var _hoisted_6$7 = ["disabled"];
	var _hoisted_7$7 = { class: "pse-resume-row" };
	var RESERVATION_FORM_ID = "frmReservations";
	var RESERVATION_NUMBER_INPUT = "#ReservationNumber";
	var BARCODE_INPUT = "#Productbarcode";
	var SearchReservationsPage_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "SearchReservationsPage",
		setup(__props) {
			const showModal = ref(false);
			const modalData = ref();
			const lastOpenReservation = ref(getLastOpenReservation());
			const lastCompletedReservation = ref(getLastCompletedReservation());
			const completedHistory = ref(getCompletedHistory());
			const showHistory = ref(Settings.showCompletedHistory);
			const hasHistory = computed(() => showHistory.value && completedHistory.value.length > 0);
			const addParcelsNumber = ref("");
			const searching = ref(false);
			const messages = useTemplateRef("messages");
			const notice = ref();
			const canReopen = computed(() => Boolean(lastOpenReservation.value?.id) && lastOpenReservation.value.id != lastCompletedReservation.value?.id);
			const canAddToCompleted = computed(() => Boolean(lastCompletedReservation.value?.id));
			onMounted(() => {
				replacePortalSearchBlock();
				keepScannerFocused();
				document.addEventListener(SETTINGS_SAVED_EVENT, () => showHistory.value = Settings.showCompletedHistory);
				focusBarcodeInput();
			});
			function keepScannerFocused() {
				document.addEventListener("focusout", (event) => {
					if (event.target != document.querySelector(BARCODE_INPUT)) return;
					setTimeout(() => {
						if (showModal.value || document.activeElement != document.body) return;
						focusBarcodeInput();
					});
				});
			}
			const NOTICES = [{
				pattern: /reservation\s+(\d+)\s+is\s+not\s+processed\s+yet/i,
				notice: (match) => ({
					title: `Reservering ${match[1]} is nog niet ingepakt.`,
					detail: "Pak de reservering eerst in via \"Zoek reservering\". Pakketten toevoegen kan pas als de reservering is afgerond.",
					tone: "notice"
				})
			}];
			function readNotice() {
				const alert = messages.value?.querySelector(".alert");
				if (!alert) {
					notice.value = void 0;
					return;
				}
				const copy = alert.cloneNode(true);
				copy.querySelectorAll("button").forEach((button) => button.remove());
				const text = copy.textContent?.replace(/\s+/g, " ").trim();
				if (!text) {
					notice.value = void 0;
					return;
				}
				notice.value = NOTICES.map((entry) => {
					const match = text.match(entry.pattern);
					return match ? entry.notice(match) : void 0;
				}).find(Boolean) ?? {
					title: text,
					tone: alert.classList.contains("alert-danger") ? "alert" : "notice"
				};
				if (notice.value.tone == "alert") playSound("error");
			}
			function dismissNotice() {
				messages.value?.querySelector(".alert")?.remove();
				notice.value = void 0;
			}
			function closeModal() {
				showModal.value = false;
				focusBarcodeInput();
			}
			function replacePortalSearchBlock() {
				const block = getSearchBlock();
				if (!block) return;
				const portalMessages = (block.querySelector("#messages") ?? document.querySelector("#messages"))?.parentElement;
				if (portalMessages && messages.value) adoptElement(messages.value, portalMessages, "pse-portal-replaced");
				if (messages.value) {
					new MutationObserver(readNotice).observe(messages.value, {
						childList: true,
						subtree: true
					});
					readNotice();
				}
				block.classList.add("pse-portal-replaced");
				for (const selector of [RESERVATION_NUMBER_INPUT, BARCODE_INPUT]) document.querySelector(selector)?.setAttribute("form", RESERVATION_FORM_ID);
				document.querySelector("#frmReservations")?.addEventListener("submit", (e) => {
					e.preventDefault();
					onSearchReservation();
					focusBarcodeInput();
				});
			}
			async function onSearchReservation() {
				searching.value = true;
				handleResponse(await reservationSearchRequest($("#frmReservations").serialize()));
			}
			async function handleResponse(response) {
				const responseElement = document.createElement("div");
				responseElement.innerHTML = response;
				switch (evaluateSearchResponse(responseElement)) {
					case ReservationSearchResponseType.ContinueVerification:
						responseElement.setAttribute("hidden", "");
						document.body.append(responseElement);
						let responseOverview = responseElement.querySelector("#ReservationOverview");
						if (responseOverview) cacheReservationDetails(getReservationDetailsFromOverview(responseOverview));
						skipVerification(responseElement);
						break;
					case ReservationSearchResponseType.SelectionModal:
						modalData.value = retrieveModalData(responseElement);
						showModal.value = true;
						searching.value = false;
						setBusy(false);
						break;
					case ReservationSearchResponseType.RefreshMain:
						document.querySelector("#messages").parentElement.innerHTML = responseElement.querySelector("#alert").parentElement.parentElement.innerHTML;
						searching.value = false;
						setBusy(false);
						break;
					case ReservationSearchResponseType.UnfinishedRun:
						handleUnfinishedRun(responseElement).then(() => {
							onSearchReservation();
						});
						break;
				}
			}
			function reopenReservation(reservationId) {
				setBusy(true);
				window.location.href = `${PACKING_PORTAL_URL}/Parcels?reservationId=${reservationId}&allowCashOnDelivery=False`;
			}
			function openAddParcels(reservationNumber) {
				if (!reservationNumber) return;
				setBusy(true);
				window.location.href = `${PACKING_PORTAL_URL}/AddParcels/Search?ReservationNumber=${reservationNumber}`;
			}
			function clearHistory() {
				clearCompletedHistory();
				completedHistory.value = [];
			}
			function openReservation(url) {
				fetchReservation(url).then((response) => {
					handleResponse(response);
				});
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock(Fragment, null, [(openBlock(), createBlock(Teleport, { to: "body" }, [createVNode(Transition, { name: "modal" }, {
					default: withCtx(() => [showModal.value ? (openBlock(), createBlock(ReservationSelectionModal_default, {
						key: 0,
						"modal-data": modalData.value,
						onClose: _cache[0] || (_cache[0] = ($event) => closeModal()),
						onOpen: _cache[1] || (_cache[1] = (reservationId) => openReservation(reservationId))
					}, null, 8, ["modal-data"])) : createCommentVNode("", true)]),
					_: 1
				})])), createBaseVNode("div", _hoisted_1$12, [
					createBaseVNode("div", {
						class: "pse-messages",
						ref_key: "messages",
						ref: messages
					}, null, 512),
					notice.value ? (openBlock(), createBlock(SearchNotice_default, {
						key: 0,
						title: notice.value.title,
						detail: notice.value.detail,
						tone: notice.value.tone,
						onDismiss: _cache[2] || (_cache[2] = ($event) => dismissNotice())
					}, null, 8, [
						"title",
						"detail",
						"tone"
					])) : createCommentVNode("", true),
					createBaseVNode("div", { class: normalizeClass(["pse-layout", { "pse-layout-history": hasHistory.value }]) }, [createBaseVNode("div", _hoisted_2$12, [createBaseVNode("div", _hoisted_3$9, [
						createVNode(SearchPanel_default, {
							title: "Zoek reservering",
							subtitle: "Scan een product of vul een reserveringsnummer in."
						}, {
							icon: withCtx(() => [..._cache[9] || (_cache[9] = [createBaseVNode("svg", {
								viewBox: "0 0 24 24",
								width: "20",
								height: "20",
								fill: "none",
								stroke: "currentColor",
								"stroke-width": "2",
								"stroke-linecap": "round",
								"stroke-linejoin": "round"
							}, [createBaseVNode("circle", {
								cx: "11",
								cy: "11",
								r: "7"
							}), createBaseVNode("path", { d: "M20 20l-3.6-3.6" })], -1)])]),
							default: withCtx(() => [
								createVNode(SearchField_default, {
									label: "Reservering nr",
									adopt: RESERVATION_NUMBER_INPUT
								}),
								createVNode(SearchField_default, {
									label: "Product barcode",
									adopt: BARCODE_INPUT
								}),
								createBaseVNode("button", {
									type: "submit",
									class: "pse-submit pse-submit-end",
									form: RESERVATION_FORM_ID,
									disabled: searching.value
								}, [searching.value ? (openBlock(), createElementBlock("span", _hoisted_5$9)) : createCommentVNode("", true), createTextVNode(" " + toDisplayString(searching.value ? "Bezig met zoeken" : "Zoek"), 1)], 8, _hoisted_4$9)
							]),
							_: 1
						}),
						_cache[11] || (_cache[11] = createBaseVNode("span", {
							class: "pse-card-split",
							"aria-hidden": "true"
						}, null, -1)),
						createVNode(SearchPanel_default, {
							title: "Pakket toevoegen",
							subtitle: "Voor een reservering die al verwerkt is."
						}, {
							icon: withCtx(() => [..._cache[10] || (_cache[10] = [createBaseVNode("svg", {
								viewBox: "0 0 24 24",
								width: "20",
								height: "20",
								fill: "none",
								stroke: "currentColor",
								"stroke-width": "2",
								"stroke-linecap": "round",
								"stroke-linejoin": "round"
							}, [
								createBaseVNode("path", { d: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" }),
								createBaseVNode("path", { d: "M4 7.5l8 4.5 8-4.5" }),
								createBaseVNode("path", { d: "M12 12v9" })
							], -1)])]),
							default: withCtx(() => [createBaseVNode("form", {
								class: "pse-form",
								onSubmit: _cache[4] || (_cache[4] = withModifiers(($event) => openAddParcels(addParcelsNumber.value), ["prevent"]))
							}, [createVNode(SearchField_default, {
								label: "Reservering nr",
								placeholder: "Bijv. 1234567",
								modelValue: addParcelsNumber.value,
								"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => addParcelsNumber.value = $event)
							}, null, 8, ["modelValue"]), createBaseVNode("button", {
								type: "submit",
								class: "pse-submit pse-submit-end",
								disabled: !addParcelsNumber.value
							}, " Zoek ", 8, _hoisted_6$7)], 32)]),
							_: 1
						})
					]), createBaseVNode("div", _hoisted_7$7, [createVNode(ResumeButton_default, {
						label: "Laatst geopende reservering",
						"reservation-number": lastOpenReservation.value?.number,
						disabled: !canReopen.value,
						onClick: _cache[5] || (_cache[5] = ($event) => reopenReservation(lastOpenReservation.value.id))
					}, {
						icon: withCtx(() => [..._cache[12] || (_cache[12] = [createBaseVNode("svg", {
							viewBox: "0 0 24 24",
							width: "18",
							height: "18",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "2",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						}, [createBaseVNode("path", { d: "M3.5 12a8.5 8.5 0 1 0 2.9-6.4" }), createBaseVNode("path", { d: "M3 4v4.5h4.5" })], -1)])]),
						_: 1
					}, 8, ["reservation-number", "disabled"]), createVNode(ResumeButton_default, {
						label: "Laatst voltooide reservering",
						"reservation-number": lastCompletedReservation.value?.number,
						disabled: !canAddToCompleted.value,
						onClick: _cache[6] || (_cache[6] = ($event) => openAddParcels(lastCompletedReservation.value.number))
					}, {
						icon: withCtx(() => [..._cache[13] || (_cache[13] = [createBaseVNode("svg", {
							viewBox: "0 0 24 24",
							width: "18",
							height: "18",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "2",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						}, [createBaseVNode("circle", {
							cx: "12",
							cy: "12",
							r: "8.5"
						}), createBaseVNode("path", { d: "M12 8.5v7M8.5 12h7" })], -1)])]),
						_: 1
					}, 8, ["reservation-number", "disabled"])])]), hasHistory.value ? (openBlock(), createBlock(CompletedHistoryPanel_default, {
						key: 0,
						entries: completedHistory.value,
						onOpen: _cache[7] || (_cache[7] = (reservationNumber) => openAddParcels(reservationNumber)),
						onClear: _cache[8] || (_cache[8] = ($event) => clearHistory())
					}, null, 8, ["entries"])) : createCommentVNode("", true)], 2)
				])], 64);
			};
		}
	}), [["__scopeId", "data-v-a4a94ab7"]]);
	var _hoisted_1$11 = { class: "pse-loading" };
	var _hoisted_2$11 = { class: "pse-loading-card" };
	var _hoisted_3$8 = { class: "pse-loading-text" };
	var _hoisted_4$8 = { class: "pse-loading-title" };
	var _hoisted_5$8 = {
		key: 0,
		class: "pse-loading-subtitle"
	};
	var LoadingPanel_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "LoadingPanel",
		props: {
			title: {},
			subtitle: {}
		},
		setup(__props) {
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("div", _hoisted_1$11, [createBaseVNode("div", _hoisted_2$11, [_cache[0] || (_cache[0] = createBaseVNode("span", {
					class: "pse-loading-spinner",
					"aria-hidden": "true"
				}, null, -1)), createBaseVNode("div", _hoisted_3$8, [createBaseVNode("h2", _hoisted_4$8, toDisplayString(__props.title), 1), __props.subtitle ? (openBlock(), createElementBlock("p", _hoisted_5$8, toDisplayString(__props.subtitle), 1)) : createCommentVNode("", true)])])]);
			};
		}
	}), [["__scopeId", "data-v-38d33d98"]]);
	var VerifyProductsPage_default = defineComponent({
		__name: "VerifyProductsPage",
		setup(__props) {
			try {
				const reservationDetails = getReservationDetailsFromOverview();
				if (reservationDetails) cacheReservationDetails(reservationDetails);
			} catch (error) {
				console.error("Pack&Ship Extended failed to cache the reservation.", error);
			}
			onMounted(() => {
				document.querySelector("#ReservationOverview")?.classList.add("pse-portal-replaced");
				document.querySelector(VENDOR_BAND_LOGO_SELECTOR)?.closest(".row")?.classList.add("pse-portal-replaced");
				afterReveal(() => afterPaint(submit));
			});
			function submit() {
				try {
					skipVerification(document.body);
				} catch (error) {
					console.error("Pack&Ship Extended failed to skip the verification step.", error);
				}
			}
			return (_ctx, _cache) => {
				return openBlock(), createBlock(LoadingPanel_default, {
					title: "Reservering wordt geopend",
					subtitle: "Producten worden gecontroleerd."
				});
			};
		}
	});
	var add_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='ffffff'%3e%3cpath%20d='M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z'/%3e%3c/svg%3e";
	var image_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='ffffff'%3e%3cpath%20d='M200-120q-33%200-56.5-23.5T120-200v-560q0-33%2023.5-56.5T200-840h560q33%200%2056.5%2023.5T840-760v560q0%2033-23.5%2056.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480%20450-320l-90-120-120%20160Zm-40%2080v-560%20560Z'/%3e%3c/svg%3e";
	var _hoisted_1$10 = { class: "pse-sidebar" };
	var _hoisted_2$10 = { class: "pse-sidebar-card" };
	var _hoisted_3$7 = { class: "pse-sidebar-head" };
	var _hoisted_4$7 = { class: "pse-sidebar-heading-row" };
	var _hoisted_5$7 = { class: "pse-sidebar-heading" };
	var _hoisted_6$6 = {
		key: 0,
		class: "pse-sidebar-chips"
	};
	var _hoisted_7$6 = ["title"];
	var _hoisted_8$6 = { class: "pse-sidebar-rows" };
	var _hoisted_9$6 = { class: "pse-sidebar-label" };
	var _hoisted_10$6 = { class: "pse-sidebar-value" };
	var _hoisted_11$5 = { class: "pse-sidebar-value-text" };
	var _hoisted_12$4 = {
		key: 0,
		class: "pse-sidebar-address"
	};
	var _hoisted_13$4 = { class: "pse-sidebar-label" };
	var _hoisted_14$3 = { class: "pse-sidebar-address-body" };
	var ReservationSidebar_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ReservationSidebar",
		setup(__props) {
			const CHIP_PATTERNS = [/^status$/i, /^logisti/i];
			const isChip = (label) => CHIP_PATTERNS.some((pattern) => pattern.test(label));
			const heading = ref("");
			const fields = ref([]);
			const addressLabel = ref("");
			const address = ref([]);
			const chips = computed(() => fields.value.filter((field) => isChip(field.label)));
			const rows = computed(() => fields.value.filter((field) => !isChip(field.label)));
			const REFERENCE_PATTERN = /referen(tie|ce)/i;
			const isCopyable = (label) => REFERENCE_PATTERN.test(label);
			const reservationNumber = computed(() => heading.value.match(/\d{3,}/)?.[0] ?? "");
			const orderNumber = readOrderNumber();
			const hasShopwareOrder = Boolean(orderNumber) && matchShopwareOrderNumber(orderNumber);
			const orderEntry = ref();
			const noteEnabled = ref(false);
			let token;
			let saveTimeoutId;
			readPortalSummary();
			onMounted(() => {
				document.querySelector(RESERVATION_SUMMARY_SELECTOR)?.classList.add("pse-portal-replaced");
				if (hasShopwareOrder) loadNote();
			});
			function readPortalSummary() {
				const block = document.querySelector(RESERVATION_SUMMARY_SELECTOR);
				if (!block) return;
				for (const row of Array.from(block.children)) {
					if (row.tagName == "INPUT") continue;
					const lines = readLines(row);
					if (lines.length == 0) continue;
					if (!heading.value && row.classList.contains("lead")) {
						heading.value = lines.join(" ");
						continue;
					}
					const text = lines.join(" ");
					const separator = text.indexOf(":");
					if (separator < 0) {
						address.value.push(...lines);
						continue;
					}
					const label = text.slice(0, separator).trim();
					const value = text.slice(separator + 1).trim();
					if (!value) {
						addressLabel.value = label;
						continue;
					}
					fields.value.push({
						label,
						value
					});
				}
			}
			function readLines(element) {
				const lines = [];
				let current = "";
				for (const node of Array.from(element.childNodes)) {
					if (node.nodeName == "BR") {
						lines.push(current.trim());
						current = "";
						continue;
					}
					current += node.textContent ?? "";
				}
				lines.push(current.trim());
				return lines.filter(Boolean);
			}
			function readOrderNumber() {
				try {
					return getCurrentOrderNumber();
				} catch (error) {
					debug("No sale order reference in the reservation summary.", error);
					return "";
				}
			}
			function loadNote() {
				shopwareInitialize().then(async (shopwareToken) => {
					token = shopwareToken;
					orderEntry.value = (await shopwareGetOrderData(shopwareToken, orderNumber)).data[0];
					noteEnabled.value = true;
				}).catch((error) => {
					console.error("Pack&Ship Extended failed to load the Shopware note.", error);
				});
			}
			function onSave() {
				if (!token || !orderEntry.value) return;
				saveOrderComment(token, orderEntry.value, orderNumber);
				noteEnabled.value = false;
				clearTimeout(saveTimeoutId);
				saveTimeoutId = setTimeout(() => noteEnabled.value = true, 250);
			}
			function onOpen() {
				if (!orderEntry.value) return;
				window.open(`${SHOPWARE_URL}/admin#/sw/order/detail/${orderEntry.value.id}/general`, "_blank")?.focus();
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("aside", _hoisted_1$10, [
					unref(hasShopwareOrder) ? (openBlock(), createBlock(ShopwareNote_default, {
						key: 0,
						"order-data": orderEntry.value,
						enabled: noteEnabled.value,
						"show-open": "",
						"show-alert": "",
						onSave,
						onOpen
					}, null, 8, ["order-data", "enabled"])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_2$10, [
						createBaseVNode("header", _hoisted_3$7, [createBaseVNode("div", _hoisted_4$7, [createBaseVNode("h2", _hoisted_5$7, toDisplayString(heading.value), 1), reservationNumber.value ? (openBlock(), createBlock(CopyButton_default, {
							key: 0,
							value: reservationNumber.value,
							label: `Reserveringsnummer ${reservationNumber.value}`
						}, null, 8, ["value", "label"])) : createCommentVNode("", true)]), chips.value.length ? (openBlock(), createElementBlock("div", _hoisted_6$6, [(openBlock(true), createElementBlock(Fragment, null, renderList(chips.value, (chip) => {
							return openBlock(), createElementBlock("span", {
								key: chip.label,
								class: "pse-sidebar-chip",
								title: `${chip.label}: ${chip.value}`
							}, toDisplayString(chip.value), 9, _hoisted_7$6);
						}), 128))])) : createCommentVNode("", true)]),
						createBaseVNode("dl", _hoisted_8$6, [(openBlock(true), createElementBlock(Fragment, null, renderList(rows.value, (row) => {
							return openBlock(), createElementBlock(Fragment, { key: row.label }, [createBaseVNode("dt", _hoisted_9$6, toDisplayString(row.label), 1), createBaseVNode("dd", _hoisted_10$6, [createBaseVNode("span", _hoisted_11$5, toDisplayString(row.value), 1), isCopyable(row.label) ? (openBlock(), createBlock(CopyButton_default, {
								key: 0,
								value: row.value,
								label: row.label
							}, null, 8, ["value", "label"])) : createCommentVNode("", true)])], 64);
						}), 128))]),
						address.value.length ? (openBlock(), createElementBlock("div", _hoisted_12$4, [createBaseVNode("span", _hoisted_13$4, toDisplayString(addressLabel.value), 1), createBaseVNode("p", _hoisted_14$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(address.value, (line, index) => {
							return openBlock(), createElementBlock("span", { key: index }, toDisplayString(line), 1);
						}), 128))])])) : createCommentVNode("", true)
					]),
					renderSlot(_ctx.$slots, "default", {}, void 0, true)
				]);
			};
		}
	}), [["__scopeId", "data-v-0979a8ff"]]);
	var _hoisted_1$9 = { class: "pse-image" };
	var _hoisted_2$9 = ["src"];
	var ImageModal_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ImageModal",
		props: { imageUrl: {} },
		emits: ["close"],
		setup(__props) {
			return (_ctx, _cache) => {
				return openBlock(), createBlock(ModalShell_default, {
					title: "Productafbeelding",
					size: "lg",
					onClose: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("close"))
				}, {
					footer: withCtx(() => [createBaseVNode("button", {
						type: "button",
						class: "pse-dialog-btn pse-dialog-btn-quiet",
						onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close"))
					}, " Sluiten ")]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_1$9, [createBaseVNode("img", {
						class: "pse-image-photo",
						src: __props.imageUrl,
						alt: ""
					}, null, 8, _hoisted_2$9)])]),
					_: 1
				});
			};
		}
	}), [["__scopeId", "data-v-367f2428"]]);
	var _hoisted_1$8 = { class: "pse-products" };
	var _hoisted_2$8 = { class: "pse-products-head" };
	var _hoisted_3$6 = ["href"];
	var _hoisted_4$6 = { class: "pse-products-card" };
	var _hoisted_5$6 = { class: "pse-table" };
	var _hoisted_6$5 = { key: 0 };
	var _hoisted_7$5 = { class: "pse-cell-description" };
	var _hoisted_8$5 = { class: "pse-cell-barcode" };
	var _hoisted_9$5 = { class: "pse-copy-cell" };
	var _hoisted_10$5 = { class: "pse-table-centre" };
	var _hoisted_11$4 = {
		key: 0,
		class: "material-icons pse-mark pse-mark-done"
	};
	var _hoisted_12$3 = {
		key: 1,
		class: "material-icons pse-mark pse-mark-open"
	};
	var _hoisted_13$3 = { class: "pse-table-right" };
	var _hoisted_14$2 = { class: "pse-actions" };
	var _hoisted_15$2 = ["disabled", "onClick"];
	var _hoisted_16$1 = ["src"];
	var _hoisted_17$1 = ["onClick"];
	var _hoisted_18$1 = ["src"];
	var _hoisted_19$1 = {
		key: 1,
		"aria-hidden": "true"
	};
	var SCAN_INPUT = "#productBarcode";
	var SOUND_TAIL_MS = 150;
	var CreateParcelsPage_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "CreateParcelsPage",
		setup(__props) {
			const showRows = ref(false);
			const returning = window.location.hash == PARCELS_RETURN_HASH;
			const rows = ref(getVerificationRows());
			const parcelItems = ref(getParcelItems());
			const lines = computed(() => groupVerificationRows(rows.value, parcelItems.value));
			const showImageModal = ref(false);
			const imageModalUrl = ref("");
			onMounted(() => {
				domReady().then(() => {
					if (rows.value.length == 0) rows.value = getVerificationRows();
					return returning ? void 0 : removeParcelItems();
				}).then(() => {
					updateVerifiedQuantities();
					showRows.value = true;
					armScanSounds();
					focusBarcodeInput(SCAN_INPUT);
					processAutoComplete();
					observeParcelContainer();
				});
				setupSidebar();
				markParcelsLoading();
				keepScannerFocused();
				setLastOpenReservation({
					id: getCurrentReservationId(),
					number: getCurrentReservationNumber()
				});
			});
			function onClickAddProduct(barcode) {
				let barcodeInput = document.querySelector("#productBarcode");
				let scanButton = document.querySelector("#verifyProduct");
				barcodeInput.value = barcode;
				scanButton.click();
			}
			async function onClickShowImage(productEAN) {
				imageModalUrl.value = await getImageUri(productEAN);
				showImageModal.value = true;
			}
			function updateVerifiedQuantities() {
				parcelItems.value = getParcelItems();
				rows.value = getVerificationRows();
			}
			function observeParcelContainer() {
				const parcelContainerElement = document.querySelector("#ParcelsContainer");
				if (parcelContainerElement) new MutationObserver(() => {
					updateVerifiedQuantities();
					judgeScan();
					restoreScannerFocus();
					autoAnnounceParcels(parcelContainerElement);
				}).observe(parcelContainerElement, {
					attributes: true,
					childList: true,
					subtree: true
				});
			}
			let scanSoundsArmed = false;
			let lastCounts = new Map();
			let lastAlert = null;
			let soundPlayingUntil = 0;
			function armScanSounds() {
				lastCounts = countsByLine();
				lastAlert = document.querySelector("#ParcelsContainer #alert");
				scanSoundsArmed = !isMassCompleteReservation(getCurrentReservationNumber());
				if (scanSoundsArmed) warmUpAudio();
			}
			function noteSound(durationMs) {
				if (durationMs > 0) soundPlayingUntil = performance.now() + durationMs + SOUND_TAIL_MS;
			}
			function soundHoldMs() {
				return Math.max(0, soundPlayingUntil - performance.now());
			}
			function countsByLine() {
				return new Map(lines.value.map((line) => [line.key, line.verifiedQuantity]));
			}
			function judgeScan() {
				const counts = countsByLine();
				const alert = document.querySelector("#ParcelsContainer #alert");
				const previousCounts = lastCounts;
				const previousAlert = lastAlert;
				lastCounts = counts;
				lastAlert = alert;
				if (!scanSoundsArmed) return;
				if (alert && alert != previousAlert) {
					noteSound(playSound(alert.classList.contains("alert-danger") ? "error" : "warning"));
					return;
				}
				const grown = lines.value.filter((line) => line.verifiedQuantity > (previousCounts.get(line.key) ?? 0));
				if (grown.length == 0) return;
				const over = grown.some((line) => line.verifiedQuantity > line.requiredQuantity);
				debug(over ? "Scan went past the picked quantity" : "Scan landed", grown.map((line) => line.mainBarcode));
				noteSound(playSound(over ? "warning" : "success"));
			}
			function markParcelsLoading() {
				const container = document.querySelector("#ParcelsContainer");
				if (!container) return;
				const sync = () => {
					const group = document.querySelector(PARCEL_GROUP_SELECTOR);
					const tabs = document.querySelector(PARCEL_TABS_SELECTOR);
					if (!group) return;
					group.classList.toggle("pse-parcels-loading", !tabs || tabs.childElementCount == 0);
				};
				sync();
				new MutationObserver(sync).observe(container, {
					childList: true,
					subtree: true
				});
			}
			function keepScannerFocused() {
				document.addEventListener("focusout", (event) => {
					if (event.target != document.querySelector(SCAN_INPUT)) return;
					setTimeout(restoreScannerFocus);
				});
			}
			function restoreScannerFocus() {
				if (document.activeElement && document.activeElement != document.body) return;
				if (showImageModal.value) return;
				focusBarcodeInput(SCAN_INPUT);
			}
			function setupSidebar() {
				document.querySelector("#ReservationOverview")?.querySelector(":scope > div:nth-child(1)")?.classList.add("pse-portal-replaced");
				const column = getReservationSidebarColumn();
				if (!column) return;
				mountApp(ReservationSidebar_default, (host) => column.insertAdjacentElement("afterbegin", host));
			}
			let announceTimer;
			function autoAnnounceParcels(parcelContainerElement) {
				if (returning) return;
				if (!Settings.autoMasterSwitch && !isMassCompleteReservation(getCurrentReservationNumber())) return;
				const hold = soundHoldMs();
				if (hold > 0) {
					if (announceTimer === void 0) announceTimer = setTimeout(() => {
						announceTimer = void 0;
						autoAnnounceParcels(parcelContainerElement);
					}, hold);
					return;
				}
				const announceButton = parcelContainerElement?.querySelector("div > div:nth-child(4) > div > button");
				if (!announceButton?.hasAttribute("disabled")) {
					announceButton?.click();
					debug("Announcing labels");
				}
			}
			function processAutoComplete() {
				if (returning) return;
				const orderNumber = getCurrentReservationNumber();
				if (isMassCompleteReservation(orderNumber)) {
					updateMassCompleteStatus({
						reservationNumber: orderNumber,
						status: MassCompleteStatus.started
					});
					debug("Mass complete started for reservation", orderNumber);
					lines.value.forEach((line) => {
						for (let i = line.verifiedQuantity; i < line.requiredQuantity; i++) {
							document.querySelector("#productBarcode").value = line.mainBarcode;
							document.querySelector("#verifyProduct").click();
						}
					});
				}
			}
			function countClass(required, collected) {
				if (required > 1 && required == collected) return "pse-count pse-count-resolved";
				if (required > 1 && collected == 0) return "pse-count pse-count-alert";
				if (required > 1 && collected > 0) return "pse-count pse-count-warn";
				return "pse-count";
			}
			async function removeParcelItems() {
				const removeButtons = Array.from(document.querySelectorAll("#button-addon2"));
				if (removeButtons.length > 0) {
					setBusy(true);
					for (let i = 0; i < removeButtons.length; i++) setTimeout(() => {
						setBusy(true);
						const parcelInfo = removeButtons.pop().onclick.toString().split("(").pop().split(")").shift().split(",");
						const amountControl = document.querySelector("#Items_" + parcelInfo[1] + "__Items_" + parcelInfo[2] + "__Amount");
						const activeControl = document.querySelector("#Items_" + parcelInfo[1] + "__Items_" + parcelInfo[2] + "__Active");
						amountControl.value = "0";
						activeControl.value = "True";
						location.href = "javascript:void(update());";
					}, i * 250);
					return new Promise((resolve) => setTimeout(resolve, 250 + removeButtons.length * 250));
				}
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock(Fragment, null, [(openBlock(), createBlock(Teleport, { to: "body" }, [createVNode(Transition, { name: "modal" }, {
					default: withCtx(() => [showImageModal.value && imageModalUrl.value ? (openBlock(), createBlock(ImageModal_default, {
						key: 0,
						"image-url": imageModalUrl.value,
						onClose: _cache[0] || (_cache[0] = ($event) => {
							showImageModal.value = false;
						})
					}, null, 8, ["image-url"])) : createCommentVNode("", true)]),
					_: 1
				})])), createBaseVNode("section", _hoisted_1$8, [
					createBaseVNode("header", _hoisted_2$8, [_cache[2] || (_cache[2] = createBaseVNode("h2", { class: "pse-products-title" }, "Producten", -1)), createBaseVNode("a", {
						class: "pse-back",
						href: unref(PACKING_PORTAL_URL)
					}, [..._cache[1] || (_cache[1] = [createBaseVNode("span", {
						class: "material-icons pse-back-icon",
						"aria-hidden": "true"
					}, "chevron_left", -1), createTextVNode(" Nieuwe zoekopdracht ", -1)])], 8, _hoisted_3$6)]),
					createBaseVNode("div", _hoisted_4$6, [createBaseVNode("table", _hoisted_5$6, [_cache[4] || (_cache[4] = createBaseVNode("thead", null, [createBaseVNode("tr", null, [
						createBaseVNode("th", null, "Omschrijving"),
						createBaseVNode("th", null, "Hoofd barcode"),
						createBaseVNode("th", null, "Gescand"),
						createBaseVNode("th", { class: "pse-table-centre" }, "Verzameld"),
						createBaseVNode("th", { class: "pse-table-right" }, "Actie")
					])], -1)), showRows.value ? (openBlock(), createElementBlock("tbody", _hoisted_6$5, [(openBlock(true), createElementBlock(Fragment, null, renderList(lines.value, (product) => {
						return openBlock(), createElementBlock("tr", { key: product.key }, [
							createBaseVNode("td", _hoisted_7$5, toDisplayString(product.description), 1),
							createBaseVNode("td", _hoisted_8$5, [createBaseVNode("span", _hoisted_9$5, [createTextVNode(toDisplayString(product.mainBarcode) + " ", 1), createVNode(CopyButton_default, {
								value: product.mainBarcode,
								label: "Barcode"
							}, null, 8, ["value"])])]),
							createBaseVNode("td", null, [createBaseVNode("span", { class: normalizeClass(countClass(product.requiredQuantity, product.verifiedQuantity)) }, toDisplayString(product.verifiedQuantity) + " van " + toDisplayString(product.requiredQuantity), 3)]),
							createBaseVNode("td", _hoisted_10$5, [product.verifiedQuantity >= product.requiredQuantity ? (openBlock(), createElementBlock("span", _hoisted_11$4, "check_circle")) : (openBlock(), createElementBlock("span", _hoisted_12$3, "radio_button_unchecked"))]),
							createBaseVNode("td", _hoisted_13$3, [createBaseVNode("div", _hoisted_14$2, [createBaseVNode("button", {
								type: "button",
								class: "pse-action",
								title: "Product toevoegen",
								disabled: product.verifiedQuantity >= product.requiredQuantity,
								onClick: ($event) => onClickAddProduct(product.mainBarcode)
							}, [createBaseVNode("img", {
								src: unref(add_default),
								width: "18",
								height: "18",
								alt: "Toevoegen"
							}, null, 8, _hoisted_16$1)], 8, _hoisted_15$2), createBaseVNode("button", {
								type: "button",
								class: "pse-action pse-action-quiet",
								title: "Afbeelding tonen",
								onClick: ($event) => onClickShowImage(product.mainBarcode)
							}, [createBaseVNode("img", {
								src: unref(image_default),
								width: "18",
								height: "18",
								alt: "Afbeelding"
							}, null, 8, _hoisted_18$1)], 8, _hoisted_17$1)])])
						]);
					}), 128))])) : (openBlock(), createElementBlock("tbody", _hoisted_19$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(lines.value, (line) => {
						return openBlock(), createElementBlock("tr", {
							key: line.key,
							class: "pse-skeleton-row"
						}, [(openBlock(), createElementBlock(Fragment, null, renderList(5, (cell) => {
							return createBaseVNode("td", { key: cell }, [..._cache[3] || (_cache[3] = [createBaseVNode("span", { class: "pse-skeleton-cell" }, null, -1)])]);
						}), 64))]);
					}), 128))]))])]),
					_cache[5] || (_cache[5] = createBaseVNode("p", { class: "pse-products-hint" }, [createBaseVNode("span", {
						class: "material-icons pse-products-hint-icon",
						"aria-hidden": "true"
					}, "info"), createTextVNode(" Om producten te verzamelen, scan of voer de barcode in. ")], -1))
				])], 64);
			};
		}
	}), [["__scopeId", "data-v-8a2b0c51"]]);
	function standInForPortalPage(block) {
		const main = block.closest(MAIN_CONTENT_SELECTOR);
		if (!main) return () => {};
		const hidden = [];
		for (let node = block; node != main && node.parentElement; node = node.parentElement) for (const sibling of node.parentElement.children) {
			if (sibling == node || sibling.classList.contains("pse-portal-replaced")) continue;
			sibling.classList.add("pse-portal-replaced");
			hidden.push(sibling);
		}
		return () => {
			for (const element of hidden) element.classList.remove("pse-portal-replaced");
		};
	}
	var _hoisted_1$7 = { class: "pse-done-layout" };
	var _hoisted_2$7 = {
		key: 0,
		class: "pse-done-side"
	};
	var _hoisted_3$5 = {
		key: 0,
		viewBox: "0 0 24 24",
		width: "30",
		height: "30",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": "2.4",
		"stroke-linecap": "round",
		"stroke-linejoin": "round"
	};
	var _hoisted_4$5 = {
		key: 1,
		viewBox: "0 0 24 24",
		width: "30",
		height: "30",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": "2.4",
		"stroke-linecap": "round",
		"stroke-linejoin": "round"
	};
	var _hoisted_5$5 = {
		key: 2,
		class: "pse-done-spinner"
	};
	var _hoisted_6$4 = { class: "pse-done-title" };
	var _hoisted_7$4 = {
		key: 0,
		class: "pse-done-number pse-copy-cell"
	};
	var _hoisted_8$4 = {
		key: 1,
		class: "pse-done-failures"
	};
	var _hoisted_9$4 = {
		key: 0,
		class: "pse-done-failure-step"
	};
	var _hoisted_10$4 = {
		key: 1,
		class: "pse-done-failure-detail"
	};
	var _hoisted_11$3 = {
		key: 2,
		class: "pse-done-text"
	};
	var _hoisted_12$2 = {
		key: 3,
		class: "pse-done-text"
	};
	var _hoisted_13$2 = {
		key: 4,
		class: "pse-done-text"
	};
	var _hoisted_14$1 = {
		key: 5,
		class: "pse-done-text"
	};
	var _hoisted_15$1 = {
		key: 6,
		class: "pse-done-actions"
	};
	var _hoisted_16 = {
		key: 1,
		class: "pse-done-parcels-column"
	};
	var _hoisted_17 = {
		key: 0,
		class: "pse-done-parcels"
	};
	var _hoisted_18 = { class: "pse-done-parcel-name" };
	var _hoisted_19 = {
		key: 0,
		class: "pse-done-parcel-fields"
	};
	var _hoisted_20 = { class: "pse-copy-cell" };
	var _hoisted_21 = {
		key: 1,
		class: "pse-done-parcel-lines"
	};
	var _hoisted_22 = { class: "pse-done-parcel-amount" };
	var _hoisted_23 = { class: "pse-done-parcel-product" };
	var _hoisted_24 = { class: "pse-done-parcel-product-name" };
	var _hoisted_25 = {
		key: 0,
		class: "pse-done-parcel-barcode pse-copy-cell"
	};
	var CompletedPage_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "CompletedPage",
		props: { announced: { type: Boolean } },
		setup(__props) {
			const props = __props;
			const replaced = ref(false);
			const finalizing = ref(false);
			const reservationNumber = ref("");
			const failures = ref([]);
			const failed = computed(() => failures.value.length > 0);
			const detailed = computed(() => failed.value || props.announced);
			const heading = ref("");
			const parcelsUrl = ref("");
			const parcels = ref([]);
			const proceedLabel = ref("Afronden");
			const root = useTemplateRef("root");
			let restorePortalPage = null;
			onMounted(() => {
				const container = document.querySelector(COMPLETED_CONTAINER_SELECTOR);
				if (!container) return;
				reservationNumber.value = readReservationNumber();
				proceedLabel.value = proceedButton()?.textContent?.trim() || proceedLabel.value;
				failures.value = readFailures(container);
				heading.value = document.querySelector("#ReservationContainer h3")?.textContent?.trim() ?? "";
				parcelsUrl.value = readParcelsUrl();
				parcels.value = readParcels(container);
				const finished = {
					id: getCurrentReservationId(),
					number: getCurrentReservationNumber()
				};
				setLastCompletedReservation(finished);
				recordCompletedReservation({
					...finished,
					completedAt: Date.now(),
					customer: getCurrentCustomerName(),
					parcels: parcels.value.length,
					failed: failed.value
				});
				updateAutoComplete();
				container.classList.add("pse-portal-replaced");
				if (root.value) restorePortalPage = standInForPortalPage(root.value);
				document.querySelector(VENDOR_BAND_LOGO_SELECTOR)?.closest(".row")?.classList.add("pse-portal-replaced");
				replaced.value = true;
				if (failed.value) playSound("error");
				if (failed.value || props.announced || !Settings.autoMasterSwitch) return;
				finalizing.value = true;
				afterReveal(() => afterPaint(finalize));
			});
			function readParcels(container) {
				return [...container.querySelectorAll(COMPLETED_PARCEL_SELECTOR)].map(readParcel);
			}
			function readParcel(card) {
				const titles = [...card.querySelectorAll(COMPLETED_PARCEL_TITLE_SELECTOR)];
				const fields = [...titles.slice(1), ...card.querySelectorAll(COMPLETED_PARCEL_FIELD_SELECTOR)].map((cell) => splitField(text(cell))).filter((field) => Boolean(field?.value));
				return {
					title: text(titles[0]),
					fields,
					lines: readParcelLines(card)
				};
			}
			function readParcelLines(card) {
				const lines = [];
				for (const row of card.querySelectorAll("table tr")) {
					if (row.querySelector("th")) continue;
					const cells = [...row.children];
					const first = text(cells[0]);
					const last = cells[cells.length - 1];
					const barcode = first.match(/\d{8,14}$/)?.[0] ?? "";
					lines.push({
						name: barcode ? first.slice(0, -barcode.length).trim() : first,
						barcode,
						amount: text(last) || last.querySelector("input")?.value || ""
					});
				}
				return lines;
			}
			function isBarcode(label) {
				return /barcode/i.test(label);
			}
			function splitField(value) {
				const separator = value.indexOf(":");
				if (separator < 0) return null;
				return {
					label: value.slice(0, separator).trim(),
					value: value.slice(separator + 1).trim()
				};
			}
			function text(element) {
				return (element?.textContent ?? "").replace(/\s+/g, " ").trim();
			}
			function readFailures(container) {
				const failures = [];
				for (const step of container.querySelectorAll(COMPLETED_STEP_SELECTOR)) {
					if (!step.querySelector(".material-icons.text-error")) continue;
					const detail = step.querySelector(COMPLETED_STEP_DETAIL_SELECTOR);
					failures.push({
						step: rowName(step, detail),
						detail: detail?.textContent?.trim() ?? ""
					});
				}
				return failures;
			}
			function rowName(step, detail) {
				const scope = (detail?.parentElement ?? step).cloneNode(true);
				for (const part of scope.querySelectorAll(`${COMPLETED_STEP_DETAIL_SELECTOR}, .material-icons`)) part.remove();
				return (scope.textContent ?? "").replace(/\s+/g, " ").trim();
			}
			function readParcelsUrl() {
				const reservationId = new URLSearchParams(window.location.search).get("reservationId");
				if (!reservationId) return "";
				return `${PACKING_PORTAL_URL}/Parcels?reservationId=${encodeURIComponent(reservationId)}&allowCashOnDelivery=False${PARCELS_RETURN_HASH}`;
			}
			function backToParcels() {
				if (!parcelsUrl.value) return;
				setBusy(true);
				window.location.href = parcelsUrl.value;
			}
			function readReservationNumber() {
				try {
					return getCurrentReservationNumber();
				} catch {
					return "";
				}
			}
			function proceedButton() {
				return document.querySelector("#ReservationContainer > div:nth-child(11) > div > button") ?? document.querySelector("#ReservationContainer button.btn-primary");
			}
			function finalize() {
				const button = proceedButton();
				if (!button) {
					console.error("Pack&Ship Extended could not find the button that finishes the reservation.");
					finalizing.value = false;
					replaced.value = false;
					document.querySelector(COMPLETED_CONTAINER_SELECTOR)?.classList.remove("pse-portal-replaced");
					restorePortalPage?.();
					restorePortalPage = null;
					return;
				}
				button.click();
			}
			function updateAutoComplete() {
				const orderNumber = getCurrentReservationNumber();
				if (!isMassCompleteReservation(orderNumber)) return;
				updateMassCompleteStatus({
					reservationNumber: orderNumber,
					status: failed.value ? MassCompleteStatus.failed : MassCompleteStatus.finished
				});
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("div", {
					ref_key: "root",
					ref: root
				}, [replaced.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: normalizeClass(["pse-done", {
						"is-failed": failed.value,
						"is-detailed": detailed.value
					}])
				}, [createBaseVNode("div", _hoisted_1$7, [
					detailed.value ? (openBlock(), createElementBlock("aside", _hoisted_2$7, [createVNode(ReservationSidebar_default)])) : createCommentVNode("", true),
					createBaseVNode("div", { class: normalizeClass(["pse-done-card", { "is-failed": failed.value }]) }, [
						createBaseVNode("span", {
							class: normalizeClass(["pse-done-mark", {
								"is-working": finalizing.value,
								"is-failed": failed.value
							}]),
							"aria-hidden": "true"
						}, [failed.value ? (openBlock(), createElementBlock("svg", _hoisted_3$5, [..._cache[3] || (_cache[3] = [
							createBaseVNode("path", { d: "M12 8v5" }, null, -1),
							createBaseVNode("path", { d: "M12 16.6v.1" }, null, -1),
							createBaseVNode("path", { d: "M10.3 3.9L2.6 17.2A2 2 0 004.3 20.2h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" }, null, -1)
						])])) : !finalizing.value ? (openBlock(), createElementBlock("svg", _hoisted_4$5, [..._cache[4] || (_cache[4] = [createBaseVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1)])])) : (openBlock(), createElementBlock("span", _hoisted_5$5))], 2),
						createBaseVNode("h1", _hoisted_6$4, toDisplayString(failed.value ? heading.value || "Reservering niet verzonden" : __props.announced ? "Pakket aangemeld" : "Reservering afgerond"), 1),
						reservationNumber.value ? (openBlock(), createElementBlock("p", _hoisted_7$4, [createTextVNode(toDisplayString(reservationNumber.value) + " ", 1), createVNode(CopyButton_default, {
							value: reservationNumber.value,
							label: `Reserveringsnummer ${reservationNumber.value}`
						}, null, 8, ["value", "label"])])) : createCommentVNode("", true),
						failed.value ? (openBlock(), createElementBlock("ul", _hoisted_8$4, [(openBlock(true), createElementBlock(Fragment, null, renderList(failures.value, (failure, index) => {
							return openBlock(), createElementBlock("li", {
								class: "pse-done-failure",
								key: index
							}, [failure.step ? (openBlock(), createElementBlock("span", _hoisted_9$4, toDisplayString(failure.step), 1)) : createCommentVNode("", true), failure.detail ? (openBlock(), createElementBlock("span", _hoisted_10$4, toDisplayString(failure.detail), 1)) : createCommentVNode("", true)]);
						}), 128))])) : createCommentVNode("", true),
						failed.value ? (openBlock(), createElementBlock("p", _hoisted_11$3, " De pakketten zijn niet aangemeld. Ga terug naar de pakketten om het opnieuw te proberen. ")) : __props.announced ? (openBlock(), createElementBlock("p", _hoisted_12$2, " Het label is geprint en het pakket is aangemeld. De reservering was al afgerond en blijft dat. ")) : finalizing.value ? (openBlock(), createElementBlock("p", _hoisted_13$2, " Wordt afgesloten en gaat terug naar zoeken... ")) : (openBlock(), createElementBlock("p", _hoisted_14$1, " De pakketten zijn aangemeld. Sluit de reservering af om verder te gaan. ")),
						failed.value ? (openBlock(), createElementBlock("div", _hoisted_15$1, [parcelsUrl.value ? (openBlock(), createElementBlock("button", {
							key: 0,
							type: "button",
							class: "pse-done-button",
							onClick: _cache[0] || (_cache[0] = ($event) => backToParcels())
						}, " Terug naar pakketten ")) : createCommentVNode("", true), createBaseVNode("button", {
							type: "button",
							class: "pse-done-button is-quiet",
							onClick: _cache[1] || (_cache[1] = ($event) => finalize())
						}, toDisplayString(proceedLabel.value), 1)])) : !finalizing.value ? (openBlock(), createElementBlock("button", {
							key: 7,
							type: "button",
							class: "pse-done-button",
							onClick: _cache[2] || (_cache[2] = ($event) => finalize())
						}, toDisplayString(proceedLabel.value), 1)) : createCommentVNode("", true)
					], 2),
					detailed.value ? (openBlock(), createElementBlock("aside", _hoisted_16, [parcels.value.length ? (openBlock(), createElementBlock("section", _hoisted_17, [_cache[5] || (_cache[5] = createBaseVNode("h2", { class: "pse-done-parcels-title" }, "Pakketten", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(parcels.value, (parcel, index) => {
						return openBlock(), createElementBlock("article", {
							class: "pse-done-parcel",
							key: index
						}, [
							createBaseVNode("h3", _hoisted_18, toDisplayString(parcel.title), 1),
							parcel.fields.length ? (openBlock(), createElementBlock("dl", _hoisted_19, [(openBlock(true), createElementBlock(Fragment, null, renderList(parcel.fields, (field) => {
								return openBlock(), createElementBlock(Fragment, { key: field.label }, [createBaseVNode("dt", null, toDisplayString(field.label), 1), createBaseVNode("dd", null, [createBaseVNode("span", _hoisted_20, [createTextVNode(toDisplayString(field.value) + " ", 1), isBarcode(field.label) ? (openBlock(), createBlock(CopyButton_default, {
									key: 0,
									value: field.value,
									label: field.label
								}, null, 8, ["value", "label"])) : createCommentVNode("", true)])])], 64);
							}), 128))])) : createCommentVNode("", true),
							parcel.lines.length ? (openBlock(), createElementBlock("ul", _hoisted_21, [(openBlock(true), createElementBlock(Fragment, null, renderList(parcel.lines, (line, lineIndex) => {
								return openBlock(), createElementBlock("li", { key: lineIndex }, [createBaseVNode("span", _hoisted_22, toDisplayString(line.amount) + "×", 1), createBaseVNode("span", _hoisted_23, [createBaseVNode("span", _hoisted_24, toDisplayString(line.name), 1), line.barcode ? (openBlock(), createElementBlock("span", _hoisted_25, [createTextVNode(toDisplayString(line.barcode) + " ", 1), createVNode(CopyButton_default, {
									value: line.barcode,
									label: "Barcode"
								}, null, 8, ["value"])])) : createCommentVNode("", true)])]);
							}), 128))])) : createCommentVNode("", true)
						]);
					}), 128))])) : createCommentVNode("", true)])) : createCommentVNode("", true)
				])], 2)) : createCommentVNode("", true)], 512);
			};
		}
	}), [["__scopeId", "data-v-a93cc49a"]]);
	var _hoisted_1$6 = { class: "pse-products" };
	var _hoisted_2$6 = { class: "pse-products-card" };
	var _hoisted_3$4 = { class: "pse-table" };
	var _hoisted_4$4 = { class: "pse-cell-description" };
	var _hoisted_5$4 = { class: "pse-cell-barcode" };
	var _hoisted_6$3 = { class: "pse-copy-cell" };
	var _hoisted_7$3 = { class: "pse-cell-quantity" };
	var _hoisted_8$3 = { class: "pse-table-right" };
	var _hoisted_9$3 = { class: "pse-actions" };
	var _hoisted_10$3 = ["onClick"];
	var _hoisted_11$2 = ["src"];
	var ReservationProducts_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "ReservationProducts",
		props: { products: {} },
		setup(__props) {
			const showImageModal = ref(false);
			const imageModalUrl = ref("");
			async function onClickShowImage(productEAN) {
				imageModalUrl.value = await getImageUri(productEAN);
				showImageModal.value = true;
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock(Fragment, null, [(openBlock(), createBlock(Teleport, { to: "body" }, [createVNode(Transition, { name: "modal" }, {
					default: withCtx(() => [showImageModal.value && imageModalUrl.value ? (openBlock(), createBlock(ImageModal_default, {
						key: 0,
						"image-url": imageModalUrl.value,
						onClose: _cache[0] || (_cache[0] = ($event) => showImageModal.value = false)
					}, null, 8, ["image-url"])) : createCommentVNode("", true)]),
					_: 1
				})])), createBaseVNode("section", _hoisted_1$6, [_cache[2] || (_cache[2] = createBaseVNode("header", { class: "pse-products-head" }, [createBaseVNode("h2", { class: "pse-products-title" }, "Producten"), createBaseVNode("span", { class: "pse-products-note" }, "Uit de eerdere verwerking")], -1)), createBaseVNode("div", _hoisted_2$6, [createBaseVNode("table", _hoisted_3$4, [_cache[1] || (_cache[1] = createBaseVNode("thead", null, [createBaseVNode("tr", null, [
					createBaseVNode("th", null, "Omschrijving"),
					createBaseVNode("th", null, "Hoofd barcode"),
					createBaseVNode("th", null, "Aantal"),
					createBaseVNode("th", { class: "pse-table-right" }, "Actie")
				])], -1)), createBaseVNode("tbody", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.products, (product) => {
					return openBlock(), createElementBlock("tr", { key: product.itemId }, [
						createBaseVNode("td", _hoisted_4$4, toDisplayString(product.description), 1),
						createBaseVNode("td", _hoisted_5$4, [createBaseVNode("span", _hoisted_6$3, [createTextVNode(toDisplayString(product.mainBarcode) + " ", 1), createVNode(CopyButton_default, {
							value: product.mainBarcode,
							label: "Barcode"
						}, null, 8, ["value"])])]),
						createBaseVNode("td", _hoisted_7$3, toDisplayString(product.requiredQuantity), 1),
						createBaseVNode("td", _hoisted_8$3, [createBaseVNode("div", _hoisted_9$3, [createBaseVNode("button", {
							type: "button",
							class: "pse-action pse-action-quiet",
							title: "Afbeelding tonen",
							onClick: ($event) => onClickShowImage(product.mainBarcode)
						}, [createBaseVNode("img", {
							src: unref(image_default),
							width: "18",
							height: "18",
							alt: "Afbeelding"
						}, null, 8, _hoisted_11$2)], 8, _hoisted_10$3)])])
					]);
				}), 128))])])])])], 64);
			};
		}
	}), [["__scopeId", "data-v-77facacc"]]);
	var _hoisted_1$5 = { class: "pse-back-row" };
	var _hoisted_2$5 = ["href"];
	var BackLink_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "BackLink",
		setup(__props) {
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("div", _hoisted_1$5, [createBaseVNode("a", {
					class: "pse-back",
					href: unref(PACKING_PORTAL_URL)
				}, [..._cache[0] || (_cache[0] = [createBaseVNode("span", {
					class: "material-icons pse-back-icon",
					"aria-hidden": "true"
				}, "chevron_left", -1), createTextVNode(" Nieuwe zoekopdracht ", -1)])], 8, _hoisted_2$5)]);
			};
		}
	}), [["__scopeId", "data-v-29aa4ab2"]]);
	var AddParcelsPage_default = defineComponent({
		__name: "AddParcelsPage",
		setup(__props) {
			mountSidebar();
			mountProducts();
			mountBackLink();
			function mountSidebar() {
				const column = getReservationSidebarColumn();
				if (!column) return;
				mountApp(ReservationSidebar_default, (host) => column.insertAdjacentElement("afterbegin", host));
			}
			function mountProducts() {
				const products = cachedProducts();
				if (!products?.length) {
					debug("No cached products for this reservation; the list is left out.");
					return;
				}
				const column = getParcelContainerParent();
				if (!column) return;
				mountApp(ReservationProducts_default, (host) => column.insertAdjacentElement("afterbegin", host), { products });
			}
			function mountBackLink() {
				document.querySelector("#ReservationOverview > div:nth-child(1)")?.classList.add("pse-portal-replaced");
				const column = getParcelContainerParent();
				if (!column) return;
				mountApp(BackLink_default, (host) => column.insertAdjacentElement("afterbegin", host));
			}
			function cachedProducts() {
				try {
					const reservationNumber = getCurrentReservationNumber();
					return retrieveCachedReservationDetails().find((reservation) => reservation.id == reservationNumber)?.products;
				} catch (error) {
					debug("No reservation on this page.", error);
					return;
				}
			}
			return (_ctx, _cache) => {
				return null;
			};
		}
	});
	function getCurrentUser() {
		const user = _GM_getValue(STORAGE_KEYS.currentUser, void 0);
		return user?.userName ? user : void 0;
	}
	function setCurrentUser(user) {
		_GM_setValue(STORAGE_KEYS.currentUser, user);
		debug("Stored current user:", user);
	}
	function clearCurrentUser() {
		_GM_deleteValue(STORAGE_KEYS.currentUser);
		debug("Cleared current user");
	}
	function onCurrentUserChange(callback) {
		_GM_addValueChangeListener(STORAGE_KEYS.currentUser, () => callback(getCurrentUser()));
	}
	var kampeerhal_roden_default = "data:image/svg+xml,%3csvg%20width='211'%20height='50'%20viewBox='0%200%20211%2050'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M24.412%2035.6565V11.098L41.6909%2043.6364L24.412%2035.6565ZM22.0017%200.496094L19.282%201.47322L22.4577%207.45001L0%2049.7435L24.0863%2038.6205L48.1725%2049.7435L25.6985%207.43372L28.8579%201.48951L26.1382%200.528665L24.0863%204.40462L22.018%200.512379L22.0017%200.496094Z'%20fill='%23689F69'/%3e%3cpath%20d='M69.7016%2023.3452C69.7831%2023.4592%2069.8156%2023.5569%2069.8156%2023.6546C69.8156%2023.7686%2069.7342%2023.8337%2069.5551%2023.8337H65.4511C65.1417%2023.8337%2064.9788%2023.6872%2064.7834%2023.3777L61.2332%2017.9547L59.6372%2019.8438V23.3777C59.6372%2023.6872%2059.4743%2023.8337%2059.1649%2023.8337H55.9404C55.6309%2023.8337%2055.4844%2023.6709%2055.4844%2023.3777V8.50907C55.4844%208.21593%2055.6635%208.03679%2055.9404%208.03679H59.1323C59.3278%208.03679%2059.6535%208.23222%2059.6535%208.50907V14.3393L64.3111%208.37879C64.5717%208.06936%2064.702%208.02051%2065.1091%208.02051H69.0013C69.1642%208.02051%2069.2619%208.08565%2069.2619%208.21593C69.2619%208.31365%2069.2131%208.41136%2069.1316%208.52536L63.904%2014.7627L69.7016%2023.3289V23.3452Z'%20fill='%23689F69'/%3e%3cpath%20d='M80.1247%2017.8731L78.3822%2013.0363L76.6885%2017.8731H80.1247ZM76.4279%208.5089C76.5419%208.18319%2076.7699%208.03662%2077.0956%208.03662H79.7339C80.0433%208.03662%2080.2713%208.19948%2080.3853%208.5089L86.2807%2023.3776C86.3132%2023.4753%2086.3295%2023.5404%2086.3295%2023.6056C86.3295%2023.7684%2086.1992%2023.8499%2085.9712%2023.8499H82.7467C82.421%2023.8499%2082.2093%2023.687%2082.1116%2023.3776L81.3624%2021.293H75.4671L74.7342%2023.3776C74.6365%2023.687%2074.4248%2023.8499%2074.0828%2023.8499H70.8583C70.614%2023.8499%2070.5%2023.7684%2070.5%2023.6056C70.5%2023.5567%2070.5163%2023.4916%2070.5651%2023.3776L76.4279%208.5089Z'%20fill='%23689F69'/%3e%3cpath%20d='M91.5576%2023.3937C91.525%2023.7194%2091.3947%2023.866%2091.0853%2023.866H88.0073C87.6816%2023.866%2087.5025%2023.7194%2087.535%2023.3937L89.1473%208.52501C89.1799%208.1993%2089.3102%208.05273%2089.6196%208.05273H93.4141C93.691%208.05273%2093.7561%208.16673%2093.8864%208.52501L96.8341%2018.0846L99.7817%208.52501C99.8957%208.16673%2099.9772%208.05273%20100.254%208.05273H104.032C104.342%208.05273%20104.472%208.21559%20104.505%208.52501L106.117%2023.3937C106.149%2023.7031%20105.97%2023.866%20105.645%2023.866H102.567C102.257%2023.866%20102.127%2023.7194%20102.094%2023.3937L101.215%2015.0392L98.6906%2023.3611C98.5603%2023.7683%2098.4789%2023.8497%2098.1532%2023.8497H95.4661C95.1567%2023.8497%2095.0427%2023.752%2094.9287%2023.3611L92.437%2014.8275L91.525%2023.3937H91.5576Z'%20fill='%23689F69'/%3e%3cpath%20d='M112.646%2014.9743H114.974C116%2014.9743%20116.636%2014.1274%20116.636%2013.1992C116.636%2012.336%20115.984%2011.424%20114.974%2011.424H112.646V14.9743ZM108.477%208.52521C108.477%208.23207%20108.672%208.05293%20108.933%208.05293H115.87C118.72%207.98779%20120.919%2010.6423%20120.87%2013.2317C120.919%2015.7886%20118.769%2018.3942%20115.952%2018.3454H112.646V23.3939C112.646%2023.7033%20112.483%2023.8662%20112.157%2023.8662H108.949C108.639%2023.8662%20108.493%2023.7033%20108.493%2023.3939V8.50893L108.477%208.52521Z'%20fill='%23689F69'/%3e%3cpath%20d='M137.809%208.5089C137.809%208.18319%20137.971%208.03662%20138.281%208.03662H149.046C149.355%208.03662%20149.518%208.19948%20149.518%208.5089V11.2449C149.518%2011.5543%20149.355%2011.7171%20149.046%2011.7171H141.994V15.5442H145.756C146.098%2015.5442%20146.293%2015.7071%20146.293%2016.0328V18.2314C146.293%2018.5408%20146.114%2018.7036%20145.756%2018.7036H141.994V20.2182H149.241C149.567%2020.2182%20149.73%2020.3648%20149.73%2020.6905V23.4101C149.73%2023.7196%20149.567%2023.8824%20149.241%2023.8824H138.281C137.971%2023.8824%20137.809%2023.7196%20137.809%2023.4101V8.5089Z'%20fill='%23689F69'/%3e%3cpath%20d='M155.935%2015.1858H158.329C159.436%2015.1858%20160.25%2014.2575%20160.25%2013.2641C160.25%2012.2707%20159.404%2011.3261%20158.329%2011.3261H155.935V15.1858ZM151.766%208.50872C151.766%208.24815%20151.928%208.03644%20152.222%208.03644H159.387C162.335%207.95501%20164.566%2010.691%20164.517%2013.3455C164.517%2014.1761%20164.289%2014.9904%20163.801%2015.7721C163.312%2016.5538%20162.693%2017.2052%20161.895%2017.6938L164.989%2023.3774C164.989%2023.3774%20165.038%2023.5077%20165.038%2023.5728C165.038%2023.7194%20164.924%2023.8497%20164.713%2023.8497H160.82C160.511%2023.8497%20160.413%2023.7682%20160.234%2023.41L157.677%2018.5895H155.935V23.3774C155.935%2023.6868%20155.772%2023.8497%20155.462%2023.8497H152.222C151.912%2023.8497%20151.766%2023.6868%20151.766%2023.3774V8.50872Z'%20fill='%23689F69'/%3e%3cpath%20d='M170.933%2019.7459V23.3776C170.933%2023.687%20170.77%2023.8499%20170.412%2023.8499H167.236C166.927%2023.8499%20166.764%2023.687%20166.764%2023.3776V8.5089C166.764%208.24833%20166.927%208.03662%20167.236%208.03662H170.477C170.721%208.03662%20170.933%208.15062%20170.933%208.49261V15.984H176.356V8.5089C176.356%208.24833%20176.535%208.03662%20176.828%208.03662H180.069C180.297%208.03662%20180.525%208.15062%20180.525%208.49261V23.3939C180.525%2023.7033%20180.362%2023.8661%20180.004%2023.8661H176.828C176.519%2023.8661%20176.356%2023.7033%20176.356%2023.3939V19.7622H170.933V19.7459Z'%20fill='%23689F69'/%3e%3cpath%20d='M192.136%2017.8731L190.394%2013.0363L188.7%2017.8731H192.136ZM188.44%208.5089C188.554%208.18319%20188.782%208.03662%20189.107%208.03662H191.746C192.055%208.03662%20192.267%208.19948%20192.397%208.5089L198.292%2023.3776C198.325%2023.4753%20198.341%2023.5404%20198.341%2023.6056C198.341%2023.7684%20198.211%2023.8499%20197.983%2023.8499H194.758C194.433%2023.8499%20194.221%2023.687%20194.123%2023.3776L193.374%2021.293H187.479L186.746%2023.3776C186.648%2023.687%20186.437%2023.8499%20186.095%2023.8499H182.87C182.626%2023.8499%20182.512%2023.7684%20182.512%2023.6056C182.512%2023.5567%20182.528%2023.4916%20182.577%2023.3776L188.44%208.5089Z'%20fill='%23689F69'/%3e%3cpath%20d='M199.791%208.5089C199.791%208.21576%20199.986%208.03662%20200.247%208.03662H203.488C203.797%208.03662%20203.96%208.19948%20203.96%208.5089V20.0716H209.953C210.263%2020.0716%20210.425%2020.2182%20210.425%2020.5439V23.3776C210.425%2023.687%20210.263%2023.8499%20209.953%2023.8499H200.247C199.938%2023.8499%20199.791%2023.687%20199.791%2023.3776V8.5089Z'%20fill='%23689F69'/%3e%3cpath%20d='M59.7023%2036.3411H62.0963C63.22%2036.3411%2064.018%2035.4128%2064.018%2034.4194C64.018%2033.4259%2063.1711%2032.4814%2062.0963%2032.4814H59.7023V36.3411ZM55.5332%2029.664C55.5332%2029.4034%2055.6961%2029.1917%2055.9892%2029.1917H63.1711C66.1188%2029.1103%2068.3336%2031.8463%2068.301%2034.5008C68.301%2035.3314%2068.0568%2036.1456%2067.5845%2036.9273C67.0959%2037.709%2066.4771%2038.3605%2065.6791%2038.849L68.7733%2044.5327C68.7733%2044.5327%2068.8222%2044.663%2068.8222%2044.7281C68.8222%2044.8747%2068.7082%2045.0049%2068.4965%2045.0049H64.6042C64.2948%2045.0049%2064.1971%2044.9235%2064.018%2044.5652L61.4611%2039.7447H59.7186V44.5327C59.7186%2044.8421%2059.5557%2045.0049%2059.2463%2045.0049H56.0055C55.6961%2045.0049%2055.5495%2044.8421%2055.5495%2044.5327V29.664H55.5332Z'%20fill='%23689F69'/%3e%3cpath%20d='M78.023%2041.3243C80.3519%2041.3731%2082.1758%2039.4026%2082.127%2037.1063C82.1758%2034.7938%2080.3519%2032.8395%2078.023%2032.8884C75.7105%2032.8395%2073.8702%2034.7938%2073.9191%2037.1063C73.8702%2039.4188%2075.7268%2041.3731%2078.023%2041.3243ZM70.8737%2033.0186C71.6065%2031.7809%2072.6162%2030.7875%2073.8865%2030.0547C75.1568%2029.3218%2076.5248%2028.9473%2078.023%2028.9473C79.5213%2028.9473%2080.8893%2029.3218%2082.1596%2030.0547C83.4298%2030.7875%2084.4232%2031.7809%2085.1724%2033.0186C85.9215%2034.2726%2086.2961%2035.6243%2086.2961%2037.1063C86.2961%2038.5883%2085.9215%2039.94%2085.1724%2041.1777C84.4232%2042.4317%2083.4298%2043.4251%2082.1596%2044.1416C80.8893%2044.8745%2079.5213%2045.2491%2078.023%2045.2491C76.5248%2045.2491%2075.1568%2044.8745%2073.8865%2044.1416C72.6162%2043.4251%2071.6065%2042.4317%2070.8737%2041.1777C70.1246%2039.94%2069.75%2038.5883%2069.75%2037.1063C69.75%2035.6243%2070.1246%2034.2726%2070.8737%2033.0186Z'%20fill='%23689F69'/%3e%3cpath%20d='M94.211%2032.9534H92.6964V41.2264H94.211C96.5398%2041.2753%2098.4615%2039.3373%2098.4289%2037.1062C98.4778%2034.8588%2096.5561%2032.9208%2094.211%2032.9534ZM88.5273%2029.6637C88.5273%2029.338%2088.6902%2029.1914%2088.9996%2029.1914H94.6181C95.9535%2029.1914%2097.2401%2029.5497%2098.4778%2030.25C99.7155%2030.9665%20100.725%2031.9437%20101.491%2033.1488C102.256%2034.3702%20102.631%2035.6893%20102.631%2037.1062C102.631%2038.523%20102.272%2039.777%20101.556%2040.9821C100.839%2042.1872%2099.8621%2043.1644%2098.6406%2043.8972C97.4192%2044.6464%2096.0675%2045.0046%2094.6344%2045.0046H89.0159C88.7065%2045.0046%2088.5436%2044.8418%2088.5436%2044.5324V29.6637H88.5273Z'%20fill='%23689F69'/%3e%3cpath%20d='M123.64%2044.5324C123.64%2044.8418%20123.461%2045.0046%20123.102%2045.0046H120.089C119.78%2045.0046%20119.617%2044.8581%20119.617%2044.5324V29.6637C119.617%2029.4031%20119.78%2029.1914%20120.089%2029.1914H123.591C123.9%2029.1914%20124.161%2029.3543%20124.356%2029.6637L129.779%2038.295V29.6637C129.779%2029.4031%20129.942%2029.1914%20130.268%2029.1914H133.281C133.525%2029.1914%20133.818%2029.4031%20133.818%2029.6637V44.5324C133.818%2044.8418%20133.639%2045.0046%20133.281%2045.0046H130.121C129.796%2045.0046%20129.535%2044.8581%20129.34%2044.5324L123.656%2035.3148V44.5324H123.64Z'%20fill='%23689F69'/%3e%3cpath%20d='M105.023%2029.7945C105.023%2029.4688%20105.186%2029.3223%20105.496%2029.3223H116.26C116.57%2029.3223%20116.733%2029.4851%20116.733%2029.7945V32.5305C116.733%2032.8399%20116.57%2033.0028%20116.26%2033.0028H109.209V36.8299H112.971C113.313%2036.8299%20113.508%2036.9927%20113.508%2037.3185V39.517C113.508%2039.8264%20113.329%2039.9893%20112.971%2039.9893H109.209V41.5038H116.456C116.782%2041.5038%20116.944%2041.6504%20116.944%2041.9761V44.6958C116.944%2045.0052%20116.782%2045.1681%20116.456%2045.1681H105.496C105.186%2045.1681%20105.023%2045.0052%20105.023%2044.6958V29.8271V29.7945Z'%20fill='%23689F69'/%3e%3cpath%20d='M123.166%208.5089C123.166%208.18319%20123.329%208.03662%20123.638%208.03662H134.403C134.712%208.03662%20134.875%208.19948%20134.875%208.5089V11.2449C134.875%2011.5543%20134.712%2011.7171%20134.403%2011.7171H127.351V15.5442H131.113C131.455%2015.5442%20131.651%2015.7071%20131.651%2016.0328V18.2314C131.651%2018.5408%20131.472%2018.7036%20131.113%2018.7036H127.351V20.2182H134.598C134.924%2020.2182%20135.087%2020.3648%20135.087%2020.6905V23.4101C135.087%2023.7196%20134.924%2023.8824%20134.598%2023.8824H123.638C123.329%2023.8824%20123.166%2023.7196%20123.166%2023.4101V8.5089Z'%20fill='%23689F69'/%3e%3c/svg%3e";
	var _hoisted_1$4 = { class: "pse-header" };
	var _hoisted_2$4 = { class: "pse-header-inner" };
	var _hoisted_3$3 = ["href"];
	var _hoisted_4$3 = ["src"];
	var _hoisted_5$3 = ["src"];
	var Header_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "Header",
		props: { linked: {
			type: Boolean,
			default: true
		} },
		setup(__props) {
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock("header", _hoisted_1$4, [createBaseVNode("div", _hoisted_2$4, [__props.linked ? (openBlock(), createElementBlock("a", {
					key: 0,
					class: "pse-header-link",
					href: unref(PACKING_PORTAL_URL),
					title: "Nieuwe zoekopdracht"
				}, [createBaseVNode("img", {
					class: "pse-header-logo",
					src: unref(kampeerhal_roden_default),
					alt: "Kampeerhal Roden"
				}, null, 8, _hoisted_4$3)], 8, _hoisted_3$3)) : (openBlock(), createElementBlock("img", {
					key: 1,
					class: "pse-header-logo",
					src: unref(kampeerhal_roden_default),
					alt: "Kampeerhal Roden"
				}, null, 8, _hoisted_5$3))])]);
			};
		}
	}), [["__scopeId", "data-v-895c5c8c"]]);
	var pickerStyle$1;
	function hideEnvironmentPicker() {
		setPickerStyle(`${ENVIRONMENT_SELECT_SELECTOR} { display: none !important; }`);
	}
	function setPickerStyle(rule) {
		if (!pickerStyle$1) {
			pickerStyle$1 = document.createElement("style");
			document.documentElement.append(pickerStyle$1);
		}
		pickerStyle$1.textContent = rule;
	}
	function showEnvironmentPicker() {
		setPickerStyle(`${ENVIRONMENT_SELECT_SELECTOR} { display: inline-block !important; }`);
	}
	function getEnvironmentSelect() {
		return document.querySelector(ENVIRONMENT_SELECT_SELECTOR);
	}
	function getEnvironmentOptions() {
		const select = getEnvironmentSelect();
		if (!select) return [];
		return Array.from(select.options).map((option) => ({
			id: Number(option.value),
			name: option.text.trim()
		})).filter((option) => option.id > 0 && option.name.length > 0);
	}
	function getEnvironmentName(environmentId) {
		return getEnvironmentOptions().find((option) => option.id == environmentId)?.name;
	}
	function lockEnvironmentPicker() {
		const select = getEnvironmentSelect();
		if (select) syncEnvironmentPicker(select, Settings.environmentId);
	}
	function applyConfiguredEnvironment() {
		const select = getEnvironmentSelect();
		if (!select) return;
		const configured = Settings.environmentId;
		syncEnvironmentPicker(select, configured);
		if (!(configured > 0)) return;
		if (Number(select.value) == configured) return;
		if (!Array.from(select.options).some((option) => Number(option.value) == configured)) {
			console.warn(`Configured environment (${configured}) is not offered by the portal, leaving the session as it is.`);
			return;
		}
		debug(`Applying configured environment (${configured}), was (${select.value}).`);
		select.value = String(configured);
		$(select).trigger("change");
	}
	function environmentLabel(environmentId) {
		if (Settings.environmentName) return Settings.environmentName;
		const name = getEnvironmentName(environmentId);
		if (name) {
			Settings.environmentName = name;
			Settings.save();
		}
		return name ?? `#${environmentId}`;
	}
	function syncEnvironmentPicker(select, environmentId) {
		const container = select.closest("form#selectEnviroment") ?? select.parentElement;
		if (!container) return;
		let label = container.querySelector(".pse-environment-locked");
		if (!(environmentId > 0)) {
			showEnvironmentPicker();
			label?.remove();
			return;
		}
		hideEnvironmentPicker();
		if (!label) {
			label = document.createElement("span");
			label.className = "pse-environment-locked";
			label.title = "Vastgezet in de Pack&Ship Extended instellingen";
			select.insertAdjacentElement("afterend", label);
		}
		label.textContent = environmentLabel(environmentId);
	}
	var _hoisted_1$3 = { class: "pse-settings-switch" };
	var _hoisted_2$3 = { class: "pse-settings-switch" };
	var _hoisted_3$2 = { class: "pse-settings-field" };
	var _hoisted_4$2 = ["disabled"];
	var _hoisted_5$2 = ["value"];
	var _hoisted_6$2 = { class: "pse-settings-group" };
	var _hoisted_7$2 = { class: "pse-settings-switch pse-settings-switch-compact" };
	var _hoisted_8$2 = ["onUpdate:modelValue"];
	var _hoisted_9$2 = { class: "pse-settings-switch-text" };
	var _hoisted_10$2 = { class: "pse-settings-switch-title" };
	var _hoisted_11$1 = { class: "pse-dialog-hint" };
	var _hoisted_12$1 = ["title", "onClick"];
	var _hoisted_13$1 = { class: "pse-settings-group" };
	var _hoisted_14 = { class: "pse-settings-field" };
	var _hoisted_15 = { class: "pse-settings-field" };
	var SettingsModal_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "SettingsModal",
		emits: ["close", "save"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const SOUNDS = [
				{
					kind: "success",
					title: "Scan gelukt",
					hint: "Twee korte tonen omhoog. Het product is aan het pakket toegevoegd."
				},
				{
					kind: "warning",
					title: "Scan klopt niet",
					hint: "Twee piepjes. De barcode hoort niet bij deze reservering, of het product is één keer te veel gescand."
				},
				{
					kind: "error",
					title: "Fout in het proces",
					hint: "Eén lage, dalende zoemer. De aanmelding bij de vervoerder is geweigerd of een stap is mislukt."
				}
			];
			const soundSwitches = ref({
				success: Settings.soundSuccess,
				warning: Settings.soundWarning,
				error: Settings.soundError
			});
			const environmentOptions = getEnvironmentOptions();
			const masterSwitch = ref(Settings.autoMasterSwitch);
			const showCompletedHistory = ref(Settings.showCompletedHistory);
			const environmentId = ref(Settings.environmentId);
			const credentials = getCredentials();
			const clientId = ref(credentials.clientId);
			const clientSecret = ref(credentials.clientSecret);
			function save() {
				Settings.autoMasterSwitch = masterSwitch.value;
				Settings.environmentId = Number(environmentId.value);
				Settings.environmentName = environmentOptions.find((option) => option.id == Number(environmentId.value))?.name ?? "";
				Settings.soundSuccess = soundSwitches.value.success;
				Settings.soundWarning = soundSwitches.value.warning;
				Settings.soundError = soundSwitches.value.error;
				Settings.showCompletedHistory = showCompletedHistory.value;
				Settings.save();
				document.dispatchEvent(new CustomEvent(SETTINGS_SAVED_EVENT));
				setCredentials({
					clientId: clientId.value,
					clientSecret: clientSecret.value
				});
				applyConfiguredEnvironment();
				emit("save");
				emit("close");
			}
			return (_ctx, _cache) => {
				return openBlock(), createBlock(ModalShell_default, {
					title: "Pack&Ship Extended instellingen",
					size: "md",
					onClose: _cache[7] || (_cache[7] = ($event) => emit("close"))
				}, {
					footer: withCtx(() => [createBaseVNode("button", {
						type: "button",
						class: "pse-dialog-btn pse-dialog-btn-quiet",
						onClick: _cache[5] || (_cache[5] = ($event) => emit("close"))
					}, " Annuleren "), createBaseVNode("button", {
						type: "button",
						class: "pse-dialog-btn",
						onClick: _cache[6] || (_cache[6] = ($event) => save())
					}, " Opslaan ")]),
					default: withCtx(() => [
						createBaseVNode("label", _hoisted_1$3, [withDirectives(createBaseVNode("input", {
							type: "checkbox",
							class: "pse-settings-checkbox",
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => masterSwitch.value = $event)
						}, null, 512), [[vModelCheckbox, masterSwitch.value]]), _cache[8] || (_cache[8] = createBaseVNode("span", { class: "pse-settings-switch-text" }, [createBaseVNode("span", { class: "pse-settings-switch-title" }, "Automatische afhandeling"), createBaseVNode("span", { class: "pse-dialog-hint" }, " Verifieert, kondigt aan en rondt reserveringen af zonder tussenkomst. ")], -1))]),
						createBaseVNode("label", _hoisted_2$3, [withDirectives(createBaseVNode("input", {
							type: "checkbox",
							class: "pse-settings-checkbox",
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => showCompletedHistory.value = $event)
						}, null, 512), [[vModelCheckbox, showCompletedHistory.value]]), _cache[9] || (_cache[9] = createBaseVNode("span", { class: "pse-settings-switch-text" }, [createBaseVNode("span", { class: "pse-settings-switch-title" }, "Afgeronde reserveringen tonen"), createBaseVNode("span", { class: "pse-dialog-hint" }, " Zet de lijst met afgeronde reserveringen naast het zoekscherm. Uit betekent alleen verbergen: de lijst wordt bijgehouden en staat er compleet weer zodra je hem aanzet. ")], -1))]),
						createBaseVNode("div", _hoisted_3$2, [
							_cache[11] || (_cache[11] = createBaseVNode("label", {
								class: "pse-dialog-label",
								for: "environmentId"
							}, "Omgeving", -1)),
							withDirectives(createBaseVNode("select", {
								id: "environmentId",
								class: "pse-dialog-input",
								"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => environmentId.value = $event),
								disabled: unref(environmentOptions).length == 0
							}, [_cache[10] || (_cache[10] = createBaseVNode("option", { value: -1 }, "Niet vastgezet (kiezen in de portal)", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(unref(environmentOptions), (option) => {
								return openBlock(), createElementBlock("option", {
									key: option.id,
									value: option.id
								}, toDisplayString(option.name), 9, _hoisted_5$2);
							}), 128))], 8, _hoisted_4$2), [[
								vModelSelect,
								environmentId.value,
								void 0,
								{ number: true }
							]]),
							_cache[12] || (_cache[12] = createBaseVNode("small", { class: "pse-dialog-hint" }, " Hoort bij deze computer en de printer erachter. Vastzetten verbergt de keuzelijst in de portal en zet de omgeving bij elke pagina terug. ", -1))
						]),
						createBaseVNode("div", _hoisted_6$2, [_cache[14] || (_cache[14] = createBaseVNode("h3", { class: "pse-settings-group-title" }, "Geluiden", -1)), (openBlock(), createElementBlock(Fragment, null, renderList(SOUNDS, (sound) => {
							return createBaseVNode("div", {
								key: sound.kind,
								class: "pse-settings-sound"
							}, [createBaseVNode("label", _hoisted_7$2, [withDirectives(createBaseVNode("input", {
								type: "checkbox",
								class: "pse-settings-checkbox",
								"onUpdate:modelValue": ($event) => soundSwitches.value[sound.kind] = $event
							}, null, 8, _hoisted_8$2), [[vModelCheckbox, soundSwitches.value[sound.kind]]]), createBaseVNode("span", _hoisted_9$2, [createBaseVNode("span", _hoisted_10$2, toDisplayString(sound.title), 1), createBaseVNode("span", _hoisted_11$1, toDisplayString(sound.hint), 1)])]), createBaseVNode("button", {
								type: "button",
								class: "pse-dialog-btn pse-dialog-btn-quiet pse-settings-listen",
								title: `${sound.title} afspelen`,
								onClick: ($event) => unref(previewSound)(sound.kind)
							}, [..._cache[13] || (_cache[13] = [createBaseVNode("span", {
								class: "material-icons pse-settings-listen-icon",
								"aria-hidden": "true"
							}, "volume_up", -1), createTextVNode(" Luister ", -1)])], 8, _hoisted_12$1)]);
						}), 64))]),
						createBaseVNode("div", _hoisted_13$1, [
							_cache[17] || (_cache[17] = createBaseVNode("h3", { class: "pse-settings-group-title" }, "Shopware koppeling", -1)),
							createBaseVNode("div", _hoisted_14, [_cache[15] || (_cache[15] = createBaseVNode("label", {
								class: "pse-dialog-label",
								for: "pseSwClient"
							}, "Client ID", -1)), withDirectives(createBaseVNode("input", {
								type: "text",
								id: "pseSwClient",
								name: "pseSwClient",
								class: "pse-dialog-input",
								"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => clientId.value = $event),
								autocomplete: "off",
								spellcheck: "false",
								"data-1p-ignore": "",
								"data-lpignore": "true",
								"data-form-type": "other"
							}, null, 512), [[vModelText, clientId.value]])]),
							createBaseVNode("div", _hoisted_15, [_cache[16] || (_cache[16] = createBaseVNode("label", {
								class: "pse-dialog-label",
								for: "pseSwSecret"
							}, "Client secret", -1)), withDirectives(createBaseVNode("input", {
								type: "text",
								id: "pseSwSecret",
								name: "pseSwSecret",
								class: "pse-dialog-input pse-settings-masked",
								"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => clientSecret.value = $event),
								autocomplete: "off",
								spellcheck: "false",
								"data-1p-ignore": "",
								"data-lpignore": "true",
								"data-form-type": "other"
							}, null, 512), [[vModelText, clientSecret.value]])])
						])
					]),
					_: 1
				});
			};
		}
	}), [["__scopeId", "data-v-27ab1f89"]]);
	var _hoisted_1$2 = { class: "pse-credentials-intro" };
	var _hoisted_2$2 = ["src"];
	var _hoisted_3$1 = { class: "pse-credentials-field" };
	var _hoisted_4$1 = ["disabled"];
	var _hoisted_5$1 = { class: "pse-credentials-field" };
	var _hoisted_6$1 = ["disabled"];
	var _hoisted_7$1 = {
		key: 0,
		class: "pse-credentials-error"
	};
	var _hoisted_8$1 = ["disabled"];
	var _hoisted_9$1 = ["disabled"];
	var _hoisted_10$1 = {
		key: 0,
		class: "pse-credentials-spinner",
		"aria-hidden": "true"
	};
	var CredentialsPrompt_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "CredentialsPrompt",
		emits: ["saved", "dismiss"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const clientId = ref("");
			const clientSecret = ref("");
			const checking = ref(false);
			const error = ref("");
			const idField = ref(null);
			function filledIn() {
				return clientId.value.trim().length > 0 && clientSecret.value.trim().length > 0;
			}
			onMounted(() => nextTick(() => afterReveal(() => idField.value?.focus())));
			async function save() {
				if (!filledIn() || checking.value) return;
				const credentials = {
					clientId: clientId.value,
					clientSecret: clientSecret.value
				};
				checking.value = true;
				error.value = "";
				try {
					await requestToken(credentials);
				} catch {
					error.value = "Shopware accepteert deze gegevens niet. Controleer de client ID en het secret.";
					checking.value = false;
					return;
				}
				setCredentials(credentials);
				checking.value = false;
				emit("saved");
			}
			return (_ctx, _cache) => {
				return openBlock(), createBlock(ModalShell_default, {
					title: "Shopware koppeling instellen",
					size: "md",
					elevated: "",
					dismissable: false,
					onClose: _cache[6] || (_cache[6] = ($event) => emit("dismiss"))
				}, {
					footer: withCtx(() => [createBaseVNode("button", {
						type: "button",
						class: "pse-dialog-btn pse-dialog-btn-quiet",
						disabled: checking.value,
						onClick: _cache[4] || (_cache[4] = ($event) => emit("dismiss"))
					}, " Later ", 8, _hoisted_8$1), createBaseVNode("button", {
						type: "button",
						class: "pse-dialog-btn",
						disabled: !filledIn() || checking.value,
						onClick: _cache[5] || (_cache[5] = ($event) => save())
					}, [checking.value ? (openBlock(), createElementBlock("span", _hoisted_10$1)) : createCommentVNode("", true), createTextVNode(" " + toDisplayString(checking.value ? "Controleren..." : "Opslaan"), 1)], 8, _hoisted_9$1)]),
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_1$2, [createBaseVNode("img", {
							src: unref(shopware_default),
							class: "pse-credentials-logo",
							width: "34",
							height: "34",
							alt: ""
						}, null, 8, _hoisted_2$2), _cache[7] || (_cache[7] = createBaseVNode("p", { class: "pse-credentials-subtitle" }, " Pack&Ship Extended heeft de client gegevens van de Shopware integratie nodig om ordergegevens op te halen. Ze worden alleen op deze computer bewaard. ", -1))]),
						createBaseVNode("div", _hoisted_3$1, [_cache[8] || (_cache[8] = createBaseVNode("label", {
							class: "pse-dialog-label",
							for: "pseSetupClient"
						}, "Client ID", -1)), withDirectives(createBaseVNode("input", {
							ref_key: "idField",
							ref: idField,
							type: "text",
							id: "pseSetupClient",
							name: "pseSetupClient",
							class: "pse-dialog-input",
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => clientId.value = $event),
							disabled: checking.value,
							autocomplete: "off",
							spellcheck: "false",
							"data-1p-ignore": "",
							"data-lpignore": "true",
							"data-form-type": "other",
							onKeyup: _cache[1] || (_cache[1] = withKeys(($event) => save(), ["enter"]))
						}, null, 40, _hoisted_4$1), [[vModelText, clientId.value]])]),
						createBaseVNode("div", _hoisted_5$1, [_cache[9] || (_cache[9] = createBaseVNode("label", {
							class: "pse-dialog-label",
							for: "pseSetupSecret"
						}, "Client secret", -1)), withDirectives(createBaseVNode("input", {
							type: "text",
							id: "pseSetupSecret",
							name: "pseSetupSecret",
							class: "pse-dialog-input pse-credentials-masked",
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => clientSecret.value = $event),
							disabled: checking.value,
							autocomplete: "off",
							spellcheck: "false",
							"data-1p-ignore": "",
							"data-lpignore": "true",
							"data-form-type": "other",
							onKeyup: _cache[3] || (_cache[3] = withKeys(($event) => save(), ["enter"]))
						}, null, 40, _hoisted_6$1), [[vModelText, clientSecret.value]])]),
						createVNode(Transition, { name: "pse-credentials-error" }, {
							default: withCtx(() => [error.value ? (openBlock(), createElementBlock("p", _hoisted_7$1, toDisplayString(error.value), 1)) : createCommentVNode("", true)]),
							_: 1
						}),
						_cache[10] || (_cache[10] = createBaseVNode("p", { class: "pse-credentials-footnote" }, [
							createTextVNode(" Later te wijzigen via "),
							createBaseVNode("b", null, "Instellingen"),
							createTextVNode(" onderin de portal. ")
						], -1))
					]),
					_: 1
				});
			};
		}
	}), [["__scopeId", "data-v-a3fdb084"]]);
	var package_default = {
		name: "pack-ship-extended",
		"private": true,
		version: "1.0.34",
		type: "module",
		scripts: {
			"dev": "vite",
			"build": "vue-tsc -b && vite build",
			"preview": "vite preview",
			"version": "npm run build && node build/stage-artefacts.mjs && git add pack-ship-extended.user.js pack-ship-extended.user.css"
		},
		dependencies: {
			"@types/jquery": "^4.0.0",
			"vue": "^3.5.34",
			"vue3-toastify": "^0.2.9"
		},
		devDependencies: {
			"@types/node": "^26.4.1",
			"@vitejs/plugin-vue": "^6.0.6",
			"typescript": "^6.0.3",
			"vite": "^8.0.11",
			"vite-plugin-monkey": "^8.0.0",
			"vue-tsc": "^3.2.8"
		}
	};
	var install_default = "data:image/svg+xml,%3c!--%20The%20install%20control's%20icon:%20an%20arrow%20coming%20down%20onto%20a%20surface,%20which%20is%20what%20every%20platform%20draws%20for%20'put%20this%20on%20the%20machine'.%20Black%20like%20the%20other%20icons%20in%20the%20footer%20bar,%20which%20colour%20them%20with%20a%20filter.%20--%3e%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M12%203V15M12%2015L7%2010M12%2015L17%2010'%20stroke='%23000000'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M4%2017V19C4%2020.1046%204.89543%2021%206%2021H18C19.1046%2021%2020%2020.1046%2020%2019V17'%20stroke='%23000000'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e";
	var power_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='%23000000'%3e%3cpath%20d='M480-80q-83%200-156-31.5T197-197q-54-54-85.5-127T80-480q0-84%2031.5-156.5T197-763l56%2056q-44%2044-68.5%20102T160-480q0%20134%2093%20227t227%2093q134%200%20227-93t93-227q0-67-24.5-125T707-707l56-56q54%2054%2085.5%20126.5T880-480q0%2083-31.5%20156T763-197q-54%2054-127%2085.5T480-80Zm-40-360v-440h80v440h-80Z'/%3e%3c/svg%3e";
	var settings_default = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20height='24px'%20viewBox='0%20-960%20960%20960'%20width='24px'%20fill='%23000000'%3e%3cpath%20d='m370-80-16-128q-13-5-24.5-12T307-235l-119%2050L78-375l103-78q-1-7-1-13.5v-27q0-6.5%201-13.5L78-585l110-190%20119%2050q11-8%2023-15t24-12l16-128h220l16%20128q13%205%2024.5%2012t22.5%2015l119-50%20110%20190-103%2078q1%207%201%2013.5v27q0%206.5-2%2013.5l103%2078-110%20190-118-50q-11%208-23%2015t-24%2012L590-80H370Zm112-260q58%200%2099-41t41-99q0-58-41-99t-99-41q-59%200-99.5%2041T342-480q0%2058%2040.5%2099t99.5%2041Z'/%3e%3c/svg%3e";
	var pwa_icon_default = "<!-- The installed app's icon: the brand mark on a tile of its own, which is the\n     one place it stands without the wordmark beside it.\n\n     A launcher icon is small and sits among other small icons, so it is the\n     tile that has to be recognisable before the drawing inside it is. Hence a\n     filled green tile with the mark in white, rather than the mark in green on\n     white: at 24px the white one reads as a blank square with something faint\n     in it. The mark is sized to fill the tile with only its own margin left\n     around it, and the tile carries a soft top to bottom gradient so it has a\n     little depth next to the flat tiles Windows puts beside it.\n\n     The rounding is drawn in rather than left to the launcher. Chrome hands an\n     `any` icon over exactly as it is, so a square one stays square.\n\n     Rasterised to a PNG at runtime by `src/pwa.ts` rather than shipped as one:\n     a userscript has nowhere to put a binary, and a PNG inlined as base64 is a\n     wall of characters no one can check against the logo.\n\n     Because it is rasterised, this file is parsed as XML, and XML forbids a\n     double dash inside a comment. The house em dash cannot be used in here. -->\n<svg width=\"512\" height=\"512\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n	<defs>\n		<linearGradient id=\"tile\" x1=\"0\" y1=\"0\" x2=\"0.35\" y2=\"1\">\n			<stop offset=\"0\" stop-color=\"#7fb480\"/>\n			<stop offset=\"1\" stop-color=\"#48793f\"/>\n		</linearGradient>\n	</defs>\n	<rect width=\"100\" height=\"100\" rx=\"22\" fill=\"url(#tile)\"/>\n	<g transform=\"translate(25 23.93) scale(1.0379)\">\n		<path d=\"M24.412 35.6565V11.098L41.6909 43.6364L24.412 35.6565ZM22.0017 0.496094L19.282 1.47322L22.4577 7.45001L0 49.7435L24.0863 38.6205L48.1725 49.7435L25.6985 7.43372L28.8579 1.48951L26.1382 0.528665L24.0863 4.40462L22.018 0.512379L22.0017 0.496094Z\" fill=\"#ffffff\"/>\n	</g>\n</svg>\n";
	var pwa_icon_maskable_default = "<!-- The same tile for launchers that crop the icon to a shape of their own.\n     A maskable icon is only guaranteed to keep the middle 80% of its width, so\n     the mark is drawn smaller and the corners are left square and full of\n     green: whatever shape is cut out of it, it comes out as a filled tile with\n     the mark centred in it.\n\n     No double dash in this comment, and no rounding either: see `pwa-icon.svg`.\n     -->\n<svg width=\"512\" height=\"512\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n	<defs>\n		<linearGradient id=\"tile\" x1=\"0\" y1=\"0\" x2=\"0.35\" y2=\"1\">\n			<stop offset=\"0\" stop-color=\"#7fb480\"/>\n			<stop offset=\"1\" stop-color=\"#48793f\"/>\n		</linearGradient>\n	</defs>\n	<rect width=\"100\" height=\"100\" rx=\"0\" fill=\"url(#tile)\"/>\n	<g transform=\"translate(29 28.1) scale(0.8719)\">\n		<path d=\"M24.412 35.6565V11.098L41.6909 43.6364L24.412 35.6565ZM22.0017 0.496094L19.282 1.47322L22.4577 7.45001L0 49.7435L24.0863 38.6205L48.1725 49.7435L25.6985 7.43372L28.8579 1.48951L26.1382 0.528665L24.0863 4.40462L22.018 0.512379L22.0017 0.496094Z\" fill=\"#ffffff\"/>\n	</g>\n</svg>\n";
	var MANIFEST_LINK_ID = "pse-manifest";
	var SCOPE = PACKING_PORTAL_URL;
	var DISPLAY_MODES = [
		"window-controls-overlay",
		"standalone",
		"minimal-ui"
	];
	var canInstall = ref(false);
	var deferredPrompt = null;
	function isInstalledApp() {
		return DISPLAY_MODES.some((mode) => matchMedia(`(display-mode: ${mode})`).matches);
	}
	function installApp() {
		const prompt = deferredPrompt;
		if (!prompt) return Promise.resolve(false);
		deferredPrompt = null;
		canInstall.value = false;
		return prompt.prompt().then(() => prompt.userChoice).then((choice) => choice.outcome == "accepted").catch((error) => {
			console.error("Pack&Ship Extended failed to open the install prompt.", error);
			return false;
		});
	}
	function installManifest() {
		if (isInstalledApp()) document.documentElement.classList.add("pse-app");
		window.addEventListener("beforeinstallprompt", (event) => {
			event.preventDefault();
			deferredPrompt = event;
			canInstall.value = true;
		});
		window.addEventListener("appinstalled", () => {
			deferredPrompt = null;
			canInstall.value = false;
		});
		return buildManifest().then(link).catch((error) => console.error("Pack&Ship Extended failed to publish its web app manifest.", error));
	}
	async function buildManifest() {
		const [icon, maskable] = await icons();
		return {
			id: "pack-ship-extended",
			name: "Pack&Ship",
			short_name: "Pack&Ship",
			description: "RetailVista Pack&Ship, met Pack&Ship Extended.",
			lang: "nl-NL",
			dir: "ltr",
			start_url: SCOPE,
			scope: SCOPE,
			display: "standalone",
			display_override: [...DISPLAY_MODES],
			background_color: "#ffffff",
			theme_color: "#ffffff",
			icons: [{
				src: icon,
				sizes: `${ICON_SIZE}x${ICON_SIZE}`,
				type: "image/png",
				purpose: "any"
			}, {
				src: maskable,
				sizes: `${ICON_SIZE}x${ICON_SIZE}`,
				type: "image/png",
				purpose: "maskable"
			}]
		};
	}
	function link(manifest) {
		const url = "data:application/manifest+json;utf8," + encodeURIComponent(JSON.stringify(manifest));
		document.getElementById(MANIFEST_LINK_ID)?.remove();
		const element = document.createElement("link");
		element.id = MANIFEST_LINK_ID;
		element.rel = "manifest";
		element.href = url;
		(document.head ?? document.documentElement).append(element);
	}
	var ICON_CACHE_KEY = "pse-icons";
	async function icons() {
		const key = `${ICON_SIZE}:${fingerprint(pwa_icon_default + pwa_icon_maskable_default)}`;
		const cached = _GM_getValue(ICON_CACHE_KEY);
		if (cached?.key == key && cached.icon && cached.maskable) return [cached.icon, cached.maskable];
		const drawn = await Promise.all([rasterise(pwa_icon_default), rasterise(pwa_icon_maskable_default)]);
		_GM_setValue(ICON_CACHE_KEY, {
			key,
			icon: drawn[0],
			maskable: drawn[1]
		});
		return drawn;
	}
	function fingerprint(source) {
		let hash = 0;
		for (let index = 0; index < source.length; index++) hash = Math.imul(hash, 31) + source.charCodeAt(index) | 0;
		return hash.toString(36);
	}
	var ICON_SIZE = 256;
	async function rasterise(svg) {
		const image = new Image();
		image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
		await image.decode();
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = ICON_SIZE;
		canvas.getContext("2d")?.drawImage(image, 0, 0, ICON_SIZE, ICON_SIZE);
		return canvas.toDataURL("image/png");
	}
	function getKnownUpdate() {
		const cached = _GM_getValue(STORAGE_KEYS.updateCheck);
		return cached?.version && isNewer(cached.version, package_default.version) ? {
			version: cached.version,
			url: RELEASES_PAGE_URL
		} : void 0;
	}
	async function checkForUpdate() {
		const cached = _GM_getValue(STORAGE_KEYS.updateCheck);
		if (cached && Date.now() - cached.checkedAt < 36e5) return getKnownUpdate();
		try {
			const version = (await fetchMetadata()).match(/@version\s+(\S+)/)?.[1];
			if (!version) throw new Error("The published metadata block declares no version.");
			_GM_setValue(STORAGE_KEYS.updateCheck, {
				checkedAt: Date.now(),
				version
			});
			debug(`Greasy Fork has ${version}, this workplace runs ${package_default.version}.`);
		} catch (error) {
			debug("Could not check for an update:", error);
		}
		return getKnownUpdate();
	}
	function fetchMetadata() {
		return new Promise((resolve, reject) => {
			_GM_xmlhttpRequest({
				method: "GET",
				url: GREASYFORK_META_URL,
				timeout: 1e4,
				onload: (response) => response.status == 200 ? resolve(response.responseText) : reject(new Error(`Greasy Fork answered ${response.status}`)),
				onerror: () => reject(new Error("The request failed.")),
				ontimeout: () => reject(new Error("The request timed out."))
			});
		});
	}
	function isNewer(candidate, current) {
		const parts = (version) => version.split(".").map((part) => parseInt(part) || 0);
		const left = parts(candidate);
		const right = parts(current);
		for (let index = 0; index < Math.max(left.length, right.length); index++) {
			const difference = (left[index] ?? 0) - (right[index] ?? 0);
			if (difference != 0) return difference > 0;
		}
		return false;
	}
	var _hoisted_1$1 = ["aria-pressed", "title"];
	var _hoisted_2$1 = ["src"];
	var _hoisted_3 = { class: "pse-toggle-label" };
	var _hoisted_4 = {
		key: 1,
		class: "pse-divider",
		"aria-hidden": "true"
	};
	var _hoisted_5 = ["title"];
	var _hoisted_6 = { class: "pse-user-name" };
	var _hoisted_7 = {
		class: "pse-version",
		title: "Pack&Ship Extended"
	};
	var _hoisted_8 = { class: "pse-version-number" };
	var _hoisted_9 = ["href", "title"];
	var _hoisted_10 = {
		key: 3,
		class: "pse-divider",
		"aria-hidden": "true"
	};
	var _hoisted_11 = ["src"];
	var _hoisted_12 = {
		key: 5,
		class: "pse-divider",
		"aria-hidden": "true"
	};
	var _hoisted_13 = ["src"];
	var Footer_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "Footer",
		props: {
			minimal: {
				type: Boolean,
				default: false
			},
			to: { default: FOOTER_SLOT_SELECTOR }
		},
		setup(__props) {
			const props = __props;
			const update = ref(getKnownUpdate());
			onMounted(() => {
				checkForUpdate().then((available) => update.value = available);
			});
			const updateTitle = computed(() => update.value ? `Versie ${update.value.version} is beschikbaar, deze werkplek draait ${package_default.version}. Klik om de release te openen -- werk het script en de stijl allebei bij.` : void 0);
			const showModal = ref(false);
			const masterSwitch = ref(Settings.autoMasterSwitch);
			const showCredentialsPrompt = ref(!props.minimal && !hasCredentials());
			const currentUser = ref(getCurrentUser());
			onCurrentUserChange((user) => currentUser.value = user);
			const masterSwitchLabel = computed(() => masterSwitch.value ? "Automatisch" : "Handmatig");
			const masterSwitchTitle = computed(() => masterSwitch.value ? "Automatische afhandeling staat aan — klik om uit te zetten" : "Automatische afhandeling staat uit — klik om aan te zetten");
			const loginTitle = computed(() => currentUser.value ? `Ingelogd sinds ${new Date(currentUser.value.loggedInAt).toLocaleString("nl-NL")}` : void 0);
			function syncMasterSwitch() {
				masterSwitch.value = Settings.autoMasterSwitch;
				showCredentialsPrompt.value = !hasCredentials();
			}
			function install() {
				installApp();
			}
			function masterSwitchToggle() {
				Settings.autoMasterSwitch = !Settings.autoMasterSwitch;
				Settings.save();
				masterSwitch.value = Settings.autoMasterSwitch;
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock(Fragment, null, [(openBlock(), createBlock(Teleport, { to: __props.to }, [createBaseVNode("div", { class: normalizeClass(["pse-bar", { "is-minimal": __props.minimal }]) }, [
					!__props.minimal ? (openBlock(), createElementBlock("button", {
						key: 0,
						type: "button",
						class: normalizeClass(["pse-pill pse-toggle", masterSwitch.value ? "is-on" : "is-off"]),
						"aria-pressed": masterSwitch.value,
						title: masterSwitchTitle.value,
						onClick: _cache[0] || (_cache[0] = ($event) => masterSwitchToggle())
					}, [createBaseVNode("img", {
						class: "pse-icon",
						src: unref(power_default),
						alt: ""
					}, null, 8, _hoisted_2$1), createBaseVNode("span", _hoisted_3, toDisplayString(masterSwitchLabel.value), 1)], 10, _hoisted_1$1)) : createCommentVNode("", true),
					!__props.minimal ? (openBlock(), createElementBlock("span", _hoisted_4)) : createCommentVNode("", true),
					currentUser.value && !__props.minimal ? (openBlock(), createElementBlock("span", {
						key: 2,
						class: "pse-user",
						title: loginTitle.value
					}, [_cache[7] || (_cache[7] = createBaseVNode("span", {
						class: "pse-dot",
						"aria-hidden": "true"
					}, null, -1)), createBaseVNode("span", _hoisted_6, toDisplayString(currentUser.value.userName), 1)], 8, _hoisted_5)) : createCommentVNode("", true),
					createBaseVNode("span", _hoisted_7, [
						_cache[9] || (_cache[9] = createBaseVNode("span", { class: "pse-brand" }, "P&S Extended", -1)),
						createBaseVNode("span", _hoisted_8, "v" + toDisplayString(unref(package_default).version), 1),
						update.value ? (openBlock(), createElementBlock("a", {
							key: 0,
							class: "pse-update",
							href: update.value.url,
							target: "_blank",
							rel: "noopener",
							title: updateTitle.value
						}, [_cache[8] || (_cache[8] = createBaseVNode("span", {
							class: "pse-update-dot",
							"aria-hidden": "true"
						}, null, -1)), createTextVNode(" update " + toDisplayString(update.value.version), 1)], 8, _hoisted_9)) : createCommentVNode("", true)
					]),
					unref(canInstall) ? (openBlock(), createElementBlock("span", _hoisted_10)) : createCommentVNode("", true),
					unref(canInstall) ? (openBlock(), createElementBlock("button", {
						key: 4,
						type: "button",
						class: "pse-pill pse-install",
						title: "Pack&Ship als app op deze computer installeren",
						onClick: _cache[1] || (_cache[1] = ($event) => install())
					}, [createBaseVNode("img", {
						class: "pse-icon",
						src: unref(install_default),
						alt: ""
					}, null, 8, _hoisted_11), _cache[10] || (_cache[10] = createBaseVNode("span", { class: "pse-install-label" }, "App installeren", -1))])) : createCommentVNode("", true),
					!__props.minimal ? (openBlock(), createElementBlock("span", _hoisted_12)) : createCommentVNode("", true),
					!__props.minimal ? (openBlock(), createElementBlock("button", {
						key: 6,
						type: "button",
						class: "pse-pill pse-settings",
						title: "Pack&Ship Extended instellingen",
						onClick: _cache[2] || (_cache[2] = ($event) => {
							showModal.value = true;
						})
					}, [createBaseVNode("img", {
						class: "pse-icon",
						src: unref(settings_default),
						alt: ""
					}, null, 8, _hoisted_13), _cache[11] || (_cache[11] = createBaseVNode("span", { class: "pse-settings-label" }, "Instellingen", -1))])) : createCommentVNode("", true)
				], 2)], 8, ["to"])), !__props.minimal ? (openBlock(), createBlock(Teleport, {
					key: 0,
					to: "body"
				}, [createVNode(Transition, { name: "modal" }, {
					default: withCtx(() => [showModal.value ? (openBlock(), createBlock(SettingsModal_default, {
						key: 0,
						onClose: _cache[3] || (_cache[3] = ($event) => showModal.value = false),
						onSave: _cache[4] || (_cache[4] = ($event) => syncMasterSwitch())
					})) : createCommentVNode("", true)]),
					_: 1
				}), createVNode(Transition, { name: "modal" }, {
					default: withCtx(() => [showCredentialsPrompt.value && !showModal.value ? (openBlock(), createBlock(CredentialsPrompt_default, {
						key: 0,
						onSaved: _cache[5] || (_cache[5] = ($event) => showCredentialsPrompt.value = false),
						onDismiss: _cache[6] || (_cache[6] = ($event) => showCredentialsPrompt.value = false)
					})) : createCommentVNode("", true)]),
					_: 1
				})])) : createCommentVNode("", true)], 64);
			};
		}
	}), [["__scopeId", "data-v-db3fb5b9"]]);
	var _hoisted_1 = { class: "pse-login" };
	var _hoisted_2 = { class: "pse-login-card" };
	var LOGIN_FORM_ID = "account";
	var COMPANY_INPUT = "#Input_CompanyNumber";
	var USER_NAME_INPUT = "#Input_UserName";
	var PASSWORD_INPUT = "#Input_Password";
	var LoginPage_default = _plugin_vue_export_helper_default(defineComponent({
		__name: "LoginPage",
		setup(__props) {
			clearCurrentUser();
			const footerSlot = prepareFooter();
			const errors = useTemplateRef("errors");
			onMounted(() => {
				replacePortalLoginBlock();
				afterReveal(() => document.querySelector(USER_NAME_INPUT)?.focus());
			});
			function replacePortalLoginBlock() {
				adoptElement(errors.value, document.querySelector(`#${LOGIN_FORM_ID} .text-danger`));
				for (const selector of [
					COMPANY_INPUT,
					USER_NAME_INPUT,
					PASSWORD_INPUT
				]) document.querySelector(selector)?.setAttribute("form", LOGIN_FORM_ID);
				document.querySelector(".mainContainer")?.classList.add("pse-portal-replaced");
				document.querySelector(`#${LOGIN_FORM_ID}`)?.addEventListener("submit", () => {
					setBusy(true);
					const userName = document.querySelector(USER_NAME_INPUT)?.value.trim();
					const companyNumber = document.querySelector(COMPANY_INPUT)?.value.trim() ?? "";
					if (userName) setCurrentUser({
						userName,
						companyNumber,
						loggedInAt: Date.now()
					});
					else clearCurrentUser();
				});
			}
			function prepareFooter() {
				const container = document.querySelector(LOGIN_FOOTER_CONTAINER_SELECTOR);
				if (!container) return null;
				const vendor = document.createElement("span");
				vendor.className = "pse-footer-end";
				vendor.append(...container.childNodes);
				const build = document.querySelector(".mainContainer .text-muted");
				if (build?.textContent?.trim()) {
					const moved = document.createElement("span");
					moved.className = "pse-vendor";
					moved.textContent = build.textContent.trim();
					vendor.append(moved);
				}
				const slot = document.createElement("div");
				container.classList.add("pse-footer-login");
				container.append(slot, vendor);
				return slot;
			}
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock(Fragment, null, [
					createVNode(Header_default, { linked: false }),
					createBaseVNode("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createVNode(SearchPanel_default, {
						title: "Inloggen",
						subtitle: "Meld je aan om te beginnen met inpakken."
					}, {
						icon: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("svg", {
							viewBox: "0 0 24 24",
							width: "20",
							height: "20",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "2",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						}, [createBaseVNode("rect", {
							x: "4",
							y: "10.5",
							width: "16",
							height: "10.5",
							rx: "2.5"
						}), createBaseVNode("path", { d: "M8 10.5V7a4 4 0 0 1 8 0v3.5" })], -1)])]),
						default: withCtx(() => [
							createBaseVNode("div", {
								class: "pse-login-errors",
								ref_key: "errors",
								ref: errors
							}, null, 512),
							createVNode(SearchField_default, {
								label: "Bedrijf nr",
								adopt: COMPANY_INPUT
							}),
							createVNode(SearchField_default, {
								label: "Gebruikersnaam",
								adopt: USER_NAME_INPUT
							}),
							createVNode(SearchField_default, {
								label: "Wachtwoord",
								adopt: PASSWORD_INPUT
							}),
							createBaseVNode("button", {
								type: "submit",
								class: "pse-submit",
								form: LOGIN_FORM_ID
							}, " Inloggen ")
						]),
						_: 1
					})])]),
					unref(footerSlot) ? (openBlock(), createBlock(Footer_default, {
						key: 0,
						minimal: "",
						to: unref(footerSlot)
					}, null, 8, ["to"])) : createCommentVNode("", true)
				], 64);
			};
		}
	}), [["__scopeId", "data-v-82786ab8"]]);
	var LogoutPage_default = defineComponent({
		__name: "LogoutPage",
		setup(__props) {
			clearCurrentUser();
			return (_ctx, _cache) => {
				return null;
			};
		}
	});
	var DUTCH_LANGUAGE_VALUE = "nl-NL";
	var pickerStyle;
	function hideLanguagePicker() {
		if (!pickerStyle) {
			pickerStyle = document.createElement("style");
			document.documentElement.append(pickerStyle);
		}
		pickerStyle.textContent = `
		${LANGUAGE_FORM_SELECTOR}, ${LANGUAGE_SELECT_SELECTOR} { display: none !important; }
	`;
	}
	function getLanguageSelect() {
		return document.querySelector(LANGUAGE_SELECT_SELECTOR);
	}
	function applyDutchLanguage() {
		const select = getLanguageSelect();
		if (!select) return;
		if (select.value == DUTCH_LANGUAGE_VALUE) return;
		if (!Array.from(select.options).some((option) => option.value == DUTCH_LANGUAGE_VALUE)) {
			console.warn(`Dutch (${DUTCH_LANGUAGE_VALUE}) is not offered by the portal, leaving the session as it is.`);
			return;
		}
		debug(`Applying Dutch language, was (${select.value}).`);
		select.value = DUTCH_LANGUAGE_VALUE;
		$(select).trigger("change");
	}
	var HEIGHT_PROPERTY = "--pse-footer-height";
	var PINNED_CLASS = "pse-fixed-footer";
	async function pinFooter() {
		await domReady();
		const footer = document.querySelector("footer");
		if (!footer) {
			debug("No footer to pin.");
			return;
		}
		const publish = () => document.documentElement.style.setProperty(HEIGHT_PROPERTY, `${footer.offsetHeight}px`);
		publish();
		document.documentElement.classList.add(PINNED_CLASS);
		new ResizeObserver(publish).observe(footer);
	}
	_css(":root .mainContainerBorder{border:1px solid var(--pse-chrome-dark)}:root .footer{background-color:var(--pse-chrome-dark)}:root .btn-primary{background-color:var(--pse-brand);border-color:var(--pse-brand)}:root .btn-primary:hover{background-color:var(--pse-chrome-active);border-color:var(--pse-chrome-active)}:root .btn-primary:focus,:root .btn-primary.focus,:root .btn-primary:not(:disabled):not(.disabled):active:focus,:root .btn-primary:not(:disabled):not(.disabled).active:focus,:root .show>.btn-primary.dropdown-toggle:focus{box-shadow:0 0 0 .2rem var(--pse-brand-ring)}:root .btn-primary:not(:disabled):not(.disabled):active,:root .btn-primary:not(:disabled):not(.disabled).active,:root .show>.btn-primary.dropdown-toggle{background-color:var(--pse-chrome-active);border-color:var(--pse-chrome-active)}:root .backButton{background-color:var(--pse-brand)}:root .retailvista-packing-ui .btn-outline-primary{border-color:var(--pse-brand)}:root .retailvista-packing-ui .btn-outline-primary:not(:disabled):not(.disabled).active{background-color:var(--pse-brand);border-color:var(--pse-brand)}:root .retailvista-packing-ui .btn-outline-primary .tab-parcelnumber{color:var(--pse-brand)}:root .retailvista-packing-ui .btn-outline-primary:hover,:root .btn-outline-primary:not(:disabled):not(.disabled):active,:root .btn-outline-primary:not(:disabled):not(.disabled).active,:root .show>.btn-outline-primary.dropdown-toggle{background-color:var(--pse-chrome-tint);border-color:var(--pse-chrome-active)}:root .btn-outline-primary:not(:disabled):not(.disabled):active:focus,:root .btn-outline-primary:not(:disabled):not(.disabled).active:focus,:root .show>.btn-outline-primary.dropdown-toggle:focus{box-shadow:0 0 0 .2rem var(--pse-brand-ring)}:root .btn:focus,:root .btn.focus,:root .btn-outline-primary:focus,:root .btn-outline-primary.focus{box-shadow:0 0 0 .2rem #0000}:root .btn-link,:root .btn-link:disabled,:root .btn-link.disabled{color:var(--pse-chrome-on-dark)}:root .btn-link:hover,:root .btn-link:focus,:root .btn-link.focus,:root .btn-link:active{color:#fff}:root .pse-footer-cell .btn-link{letter-spacing:.03em;border:0;padding:0;font-size:12px;font-weight:700;line-height:1.5;text-decoration:none}:root .pse-footer-cell .btn-link:hover,:root .pse-footer-cell .btn-link:focus{text-decoration:none}:root .btn-link{transition:none}:root .form-control:focus{box-shadow:0 0 0 .2rem var(--pse-brand-ring);border-color:var(--pse-chrome-active)}:root .form-control:disabled,:root .readonlyInput[readonly],:root .searchCarrierDialog,:root .searchProductDialog{background-color:var(--pse-chrome-tint)}:root .alert-info{color:var(--pse-chrome-active);background-color:var(--pse-chrome-tint);border-color:var(--pse-chrome-active)}:root .text-muted{color:#d3d3d3!important}:root .loading{background-color:var(--pse-scrim);-webkit-backdrop-filter:blur(3px);opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s,background-color .15s linear,-webkit-backdrop-filter .15s linear,backdrop-filter .15s linear;display:block!important}:root body.busy .loading{opacity:1;visibility:visible}:is(:root body:has(.pse-modal) .loading,:root body:has(.modal-backdrop.show) .loading){-webkit-backdrop-filter:blur();background-color:#0000}:root .nfSpinner{border:1px solid var(--pse-line);text-align:center;background-color:#fff;border-radius:16px;flex-direction:column;justify-content:center;align-items:center;gap:16px;width:auto;min-width:200px;height:auto;margin:0;padding:30px 38px;transition:transform .2s cubic-bezier(.2,.9,.3,1);display:flex;top:50%;left:50%;transform:translate(-50%,-50%)scale(.96);box-shadow:0 18px 46px #1b2b222e}:root body.busy .nfSpinner{transform:translate(-50%,-50%)scale(1)}:root .nfSpinner>div{display:none}:root .nfSpinner:before{content:\"\";border:3px solid var(--pse-brand-ring);border-top-color:var(--pse-brand);border-radius:50%;width:34px;height:34px;animation:.7s linear infinite pse-busy-spin}:root .nfSpinner .loadingBanner{letter-spacing:.01em;width:auto;color:var(--pse-ink);margin:0;font-size:15px;font-weight:600}@keyframes pse-busy-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){:root .loading,:root .nfSpinner{transition:none}:root .nfSpinner:before{animation-duration:1.6s}}:root #add-parcel>img{background:url(https://i.imgur.com/zJ9sNJR.png) no-repeat!important;width:0!important;height:0!important;padding-top:42px!important;padding-left:42px!important}:root .pse-footer-login a{color:var(--pse-chrome-on-dark)}:root .pse-footer-login a:hover,:root .pse-footer-login a:focus{color:#fff}:root #ParcelsContainer h4{color:var(--pse-ink);margin:0 0 12px;font-size:17px;font-weight:650;line-height:1.3}:root .searchProductDialog{border:1px solid var(--pse-line);background-color:#fff;border-radius:14px;margin:0 0 22px;box-shadow:0 1px 2px #1430210a;padding:14px!important}:root .searchProductDialog .form-control{border:1px solid var(--pse-line);background-color:var(--pse-well);height:46px;color:var(--pse-ink);border-right:0;border-radius:11px 0 0 11px;font-size:15px}:root .searchProductDialog .form-control:focus{border-color:var(--pse-brand);box-shadow:0 0 0 3px var(--pse-brand-ring);background-color:#fff}:root .searchProductDialog .btn{background-color:var(--pse-brand-ink);border:0;border-color:var(--pse-brand-ink);border-radius:0 11px 11px 0;height:46px;font-size:14.5px;font-weight:650}:root .searchProductDialog .btn:hover{background-color:var(--pse-brand-ink-strong);border-color:var(--pse-brand-ink-strong)}:root #tabs-parcels{gap:8px;margin-bottom:14px!important}:root #tabs-parcels .nav-item{margin-right:0!important}:root #tabs-parcels .btn-outline-primary{border:1px solid var(--pse-line);background-color:#fff;border-radius:13px;justify-content:center;align-items:center;gap:7px;min-width:62px;height:52px;padding:0 14px;font-weight:650;transition:border-color .15s,background-color .15s;display:flex}:root #tabs-parcels .btn-outline-primary:hover{border-color:var(--pse-brand);background-color:var(--pse-brand-soft)}:root #tabs-parcels .btn-outline-primary.active{border-color:var(--pse-brand-ink);background-color:var(--pse-brand-ink)}:root #tabs-parcels .btn-outline-primary .tab-parcelnumber{color:var(--pse-ink-soft);font-size:15px}:root #tabs-parcels .btn-outline-primary.active .tab-parcelnumber{color:#fff}:root #tabs-parcels .btn-outline-primary.active img{filter:brightness(0)invert()}:root .parcels-content .card{border:1px solid var(--pse-line);background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px #1430210a,0 18px 40px -30px #14302173}:root .parcels-content .card-header{border-bottom:1px solid var(--pse-line);background-color:var(--pse-well);padding:15px 18px}:root .parcels-content .card-title{color:var(--pse-ink);margin:0;font-size:15.5px;font-weight:650}:root .parcels-content .card-text{color:var(--pse-ink-soft);margin:3px 0 0;font-size:12.5px;line-height:1.45}:root .parcels-content .card-body{padding:6px 18px 14px}:root .parcels-content .table th,:root .parcels-content .table td{border-color:var(--pse-line);vertical-align:middle;padding:11px 0}:root .parcels-content .table thead th,:root .parcels-content .table tbody tr:first-child th{border-top:0;border-bottom:1px solid var(--pse-line);letter-spacing:.06em;text-transform:uppercase;color:var(--pse-ink-faint);font-size:10.5px;font-weight:650}:root .parcels-content .btn,:root #ParcelsContainer>div>div:last-child .btn{border-radius:10px;font-size:13.5px;font-weight:650}:root .parcels-content .input-group>.form-control:first-child{border-top-left-radius:10px;border-bottom-left-radius:10px}:root .parcels-content .input-group-append .btn{border-top-left-radius:0;border-bottom-left-radius:0}:root .parcels-content .input-group-prepend .btn{border-top-right-radius:0;border-bottom-right-radius:0}:root .pse-parcels-loading{min-height:232px;position:relative}:root .pse-parcels-loading>*{visibility:hidden}:root .pse-parcels-loading:before{content:\"\";background-color:var(--pse-line);border-radius:13px;width:62px;height:52px;animation:1.4s ease-in-out infinite pse-parcels-pulse;position:absolute;top:0;left:0}:root .pse-parcels-loading:after{content:\"\";border:1px solid var(--pse-line);background-color:var(--pse-well);border-radius:16px;height:166px;animation:1.4s ease-in-out .15s infinite pse-parcels-pulse;position:absolute;top:66px;left:0;right:0}@keyframes pse-parcels-pulse{50%{opacity:.45}}@media (prefers-reduced-motion:reduce){:root .pse-parcels-loading:before,:root .pse-parcels-loading:after{animation:none}}:root.pse-fixed-footer .footer{z-index:10;bottom:0;left:0;right:0;position:fixed!important}:root.pse-fixed-footer .retailvista-packing-ui{min-height:calc(100vh - var(--pse-footer-height,56px));height:auto!important}:root.pse-fixed-footer .mainContainer .container-fluid.h-100,:root.pse-fixed-footer .mainContainer .container-fluid>div.d-flex.flex-column.h-100,:root.pse-fixed-footer .mainContent>.container.h-100{height:auto!important}:root.pse-fixed-footer body{padding-bottom:var(--pse-footer-height,56px)}:root .mainContent>.container.p-5{max-width:1800px;padding-top:28px!important}:root .loading.pse-busy-supplied{display:none}:root body.busy .loading.pse-busy-supplied{display:block}:root .modal-backdrop{background-color:var(--pse-scrim)}:root .modal-backdrop.show{opacity:1}:root #editParcelModal .modal-content,:root #deleteParcelModal .modal-content{border-radius:var(--pse-dialog-radius);box-shadow:var(--pse-dialog-shadow);background-color:#fff;border:0}:root #editParcelModal .modal-header,:root #deleteParcelModal .modal-header{border-bottom:1px solid var(--pse-line);align-items:center;padding:17px 20px}:root #editParcelModal .modal-title,:root #deleteParcelModal .modal-title{color:var(--pse-ink);font-size:16px;font-weight:650;line-height:1.3}:root #editParcelModal .close,:root #deleteParcelModal .close{width:32px;height:32px;color:var(--pse-ink-faint);opacity:1;text-shadow:none;background-color:#0000;border-radius:9px;justify-content:center;align-items:center;margin:0;padding:0;font-size:21px;font-weight:400;line-height:1;transition:background-color .15s,color .15s;display:flex}:root #editParcelModal .close:hover,:root #deleteParcelModal .close:hover{background-color:var(--pse-well);color:var(--pse-ink);opacity:1}:root #editParcelModal .modal-body,:root #deleteParcelModal .modal-body{color:var(--pse-ink);padding:20px;font-size:14px;line-height:1.5}:root #editParcelModal .modal-footer,:root #deleteParcelModal .modal-footer{border-top:1px solid var(--pse-line);justify-content:flex-end;gap:9px;padding:15px 20px}:root #editParcelModal .modal-footer>*,:root #deleteParcelModal .modal-footer>*{margin:0}:root #deleteParcelModal #deleteBtns{justify-content:flex-end;gap:9px;display:flex}:root #editParcelModal .modal-footer .btn,:root #deleteParcelModal .modal-footer .btn{border:1px solid #0000;border-radius:11px;min-width:104px;height:40px;padding:0 18px;font-size:14px;font-weight:650;line-height:38px}:root #editParcelModal .modal-footer .btn-primary,:root #deleteParcelModal .modal-footer .btn-primary,:root #deleteParcelModal .modal-footer .btn-danger{background-color:var(--pse-brand-ink);border-color:var(--pse-brand-ink);color:#fff}:root #editParcelModal .modal-footer .btn-primary:hover,:root #deleteParcelModal .modal-footer .btn-primary:hover{background-color:var(--pse-brand-ink-strong);border-color:var(--pse-brand-ink-strong)}:root #deleteParcelModal .modal-footer .btn-danger{background-color:#a3372c;border-color:#a3372c}:root #deleteParcelModal .modal-footer .btn-danger:hover{background-color:#8d2f25;border-color:#8d2f25}:root #editParcelModal .modal-footer .btn-secondary,:root #deleteParcelModal .modal-footer .btn-secondary{border-color:var(--pse-line);color:var(--pse-ink-soft);background-color:#fff}:root #editParcelModal .modal-footer .btn-secondary:hover,:root #deleteParcelModal .modal-footer .btn-secondary:hover{border-color:var(--pse-ink-faint);background-color:var(--pse-well);color:var(--pse-ink)}:root #editParcelModal .modal-body .form-control,:root #editParcelModal .modal-body select{border:1px solid var(--pse-line);background-color:var(--pse-well);height:42px;color:var(--pse-ink);border-radius:11px;padding:0 13px;font-size:14.5px}:root #editParcelModal .modal-body select{appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7d73' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\");background-position:right 14px center;background-repeat:no-repeat;background-size:13px;padding-right:40px}:root #editParcelModal .modal-body .input-group>.form-control:first-child{border-top-right-radius:0;border-bottom-right-radius:0}:root #editParcelModal .modal-body .input-group-append .input-group-text,:root #editParcelModal .modal-body .input-group-append .btn{border:1px solid var(--pse-line);background-color:var(--pse-line);height:42px;color:var(--pse-ink-soft);border-left:0;border-radius:0 11px 11px 0;padding:0 14px;font-size:13px;font-weight:600}:root #editParcelModal .modal-body .input-group-prepend .input-group-text{border:1px solid var(--pse-line);background-color:var(--pse-line);height:42px;color:var(--pse-ink-soft);border-right:0;border-radius:11px 0 0 11px;padding:0 14px;font-size:13px;font-weight:600}:root #editParcelModal .modal-body .form-control:focus,:root #editParcelModal .modal-body select:focus{border-color:var(--pse-brand);box-shadow:0 0 0 3px var(--pse-brand-ring);background-color:#fff}:root #editParcelModal .modal-body label{letter-spacing:.07em;text-transform:uppercase;color:var(--pse-ink-soft);margin-bottom:6px;font-size:11px;font-weight:650}");
	_css(":root{--pse-brand:#689f69;--pse-brand-ink:#4b7f4d;--pse-brand-ink-strong:#3f6b41;--pse-brand-soft:#689f6924;--pse-brand-ring:#689f694d;--pse-ink:#1b2b22;--pse-ink-soft:#6b7d73;--pse-ink-faint:#9aa8a0;--pse-line:#e2eae5;--pse-well:#f6f9f7;--pse-alert:#b03a2e;--pse-alert-ink:#a3372c;--pse-alert-soft:#b03a2e1f;--pse-alert-wash:#b03a2e0d;--pse-attention-ink:#8a5a12;--pse-attention-soft:#ba822029;--pse-attention-wash-strong:#e2a02e2e;--pse-attention-line-soft:#ba822038;--pse-scrim:#14231b85;--pse-dialog-shadow:0 1px 2px #1430210f, 0 28px 64px -24px #0b1a128c;--pse-dialog-radius:20px;--pse-chrome-dark:#3e5f42;--pse-chrome-tint:#eff6f3;--pse-chrome-active:#537f5f;--pse-chrome-on-dark:#c8d6cb}body{padding-left:calc(100vw - 100%)}html:not(.pse-ready) *{transition:none!important}.v-enter-active,.v-leave-active{transition:opacity .25s,transform .1s}.v-enter-from,.v-leave-to{opacity:0;transform:scaleY(0)}.modal-enter-active,.modal-leave-active{transition:opacity .2s}.modal-enter-from,.modal-leave-to{opacity:0}.modal-enter-active .pse-modal-panel,.modal-leave-active .pse-modal-panel{transition:transform .2s cubic-bezier(.2,.9,.3,1)}.modal-enter-from .pse-modal-panel,.modal-leave-to .pse-modal-panel{transform:translateY(10px)scale(.98)}@media (prefers-reduced-motion:reduce){.modal-enter-active .pse-modal-panel,.modal-leave-active .pse-modal-panel{transition:none}}.pse-dialog-btn{background-color:var(--pse-brand-ink);min-width:104px;height:40px;font:inherit;color:#fff;white-space:nowrap;cursor:pointer;border:1px solid #0000;border-radius:11px;justify-content:center;align-items:center;gap:8px;padding:0 18px;font-size:14px;font-weight:650;transition:background-color .15s,border-color .15s,color .15s;display:inline-flex}.pse-dialog-btn:hover:not(:disabled){background-color:var(--pse-brand-ink-strong)}.pse-dialog-btn:focus{outline:none}.pse-dialog-btn:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-dialog-btn:disabled{color:#fff;cursor:not-allowed;background-color:#dfe6e2}.pse-dialog-btn-quiet{border-color:var(--pse-line);color:var(--pse-ink-soft);background-color:#fff}.pse-dialog-btn-quiet:hover:not(:disabled){border-color:var(--pse-ink-faint);background-color:var(--pse-well);color:var(--pse-ink)}.pse-dialog-btn-quiet:disabled{border-color:var(--pse-line);color:var(--pse-ink-faint);background-color:#fff}.pse-dialog-label{letter-spacing:.07em;text-transform:uppercase;color:var(--pse-ink-soft);font-size:11px;font-weight:650;display:block;margin-bottom:6px!important}.pse-dialog-input{box-sizing:border-box;border:1px solid var(--pse-line);background-color:var(--pse-well);width:100%;height:42px;font:inherit;color:var(--pse-ink);border-radius:11px;margin:0;padding:0 13px;font-size:14.5px;transition:border-color .15s,background-color .15s,box-shadow .15s;display:block}.pse-dialog-input:focus{border-color:var(--pse-brand);box-shadow:0 0 0 3px var(--pse-brand-ring);background-color:#fff;outline:none}.pse-dialog-input:disabled{color:var(--pse-ink-faint);cursor:not-allowed}select.pse-dialog-input{appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7d73' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\");background-position:right 14px center;background-repeat:no-repeat;background-size:13px;padding-right:40px}.pse-dialog-hint{color:var(--pse-ink-soft);margin-top:6px;font-size:12.5px;line-height:1.4;display:block}@supports (appearance:base-select){select.pse-dialog-input,:root #editParcelModal .modal-body select{appearance:base-select}select.pse-dialog-input::picker(select){appearance:base-select}:root #editParcelModal .modal-body select::picker(select){appearance:base-select}select.pse-dialog-input,:root #editParcelModal .modal-body select{background-image:none;align-items:center;gap:10px;padding:0 14px;display:flex}select.pse-dialog-input::picker-icon{color:var(--pse-ink-soft);margin-left:auto;transition:transform .15s}:root #editParcelModal .modal-body select::picker-icon{color:var(--pse-ink-soft);margin-left:auto;transition:transform .15s}select.pse-dialog-input:open::picker-icon{transform:rotate(180deg)}:root #editParcelModal .modal-body select:open::picker-icon{transform:rotate(180deg)}select.pse-dialog-input::picker(select){border:1px solid var(--pse-line);background-color:#fff;border-radius:14px;max-height:320px;margin-top:6px;padding:6px;box-shadow:0 1px 2px #1430210f,0 18px 44px -20px #0b1a1273}:root #editParcelModal .modal-body select::picker(select){border:1px solid var(--pse-line);background-color:#fff;border-radius:14px;max-height:320px;margin-top:6px;padding:6px;box-shadow:0 1px 2px #1430210f,0 18px 44px -20px #0b1a1273}select.pse-dialog-input option,:root #editParcelModal .modal-body select option{color:var(--pse-ink);border-radius:9px;padding:9px 11px;font-size:14px}select.pse-dialog-input option:hover,:root #editParcelModal .modal-body select option:hover{background-color:var(--pse-well)}select.pse-dialog-input option:checked,:root #editParcelModal .modal-body select option:checked{background-color:var(--pse-brand-soft);color:var(--pse-brand-ink);font-weight:650}select.pse-dialog-input option::checkmark{display:none}:root #editParcelModal .modal-body select option::checkmark{display:none}}.pse-footer-row{align-items:center}.pse-footer-cell{flex-wrap:wrap;align-items:center;gap:20px 22px;display:flex}.pse-footer-cell .btn-link:focus{box-shadow:none}.pse-footer-end{color:#ffffff73;white-space:nowrap;justify-content:flex-end;align-items:center;gap:18px;font-size:11.5px;display:flex}.pse-footer-end form{margin:0}.pse-vendor{white-space:nowrap}.pse-environment-locked{color:#ffffffb8;font-weight:600}.pse-footer-login{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 22px;display:flex}.pse-footer-row{row-gap:22px}.pse-footer-cell>.row>.col.ml-2{margin-left:0!important}@media (width<=1199.98px){.pse-footer-end{justify-content:flex-start}}@media (width<=991px){.pse-footer-end{flex-wrap:wrap;gap:6px 16px}}.pse-portal-replaced{display:none!important}.pse-products-head{justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:12px;display:flex}.pse-products-title{color:var(--pse-ink);margin:0;font-size:17px;font-weight:650;line-height:1.3}.pse-products-card{border:1px solid var(--pse-line);background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px #1430210a,0 18px 40px -30px #14302173}.pse-table{border-collapse:collapse;width:100%;margin:0;font-size:14px}.pse-table th{border-bottom:1px solid var(--pse-line);background-color:var(--pse-well);letter-spacing:.06em;text-transform:uppercase;color:var(--pse-ink-faint);white-space:nowrap;padding:11px 16px;font-size:10.5px;font-weight:650}.pse-table td{border-top:1px solid var(--pse-line);vertical-align:middle;padding:12px 16px}.pse-table tbody tr:first-child td{border-top:0}.pse-table-centre{text-align:center}.pse-table-right{text-align:right}.pse-cell-description{width:100%;color:var(--pse-ink);font-weight:600}.pse-cell-barcode{font-variant-numeric:tabular-nums;color:var(--pse-ink-soft);white-space:nowrap;font-size:13.5px}.pse-copy{width:26px;height:26px;color:var(--pse-ink-faint);cursor:pointer;background-color:#0000;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;padding:0;transition:background-color .15s,color .15s;display:inline-flex}.pse-copy:hover{background-color:var(--pse-well);color:var(--pse-ink)}.pse-copy:focus{outline:none}.pse-copy:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-copy.is-copied{color:var(--pse-brand-ink);background-color:var(--pse-brand-soft)}.pse-copy.is-failed{color:#a3372c;background-color:#b03a2e1a}.pse-copy-icon{font-size:15px;line-height:1}.pse-copy-cell{align-items:center;gap:2px;display:inline-flex}.pse-actions{gap:6px;display:inline-flex}.pse-action{background-color:var(--pse-brand-ink);cursor:pointer;border:1px solid #0000;border-radius:10px;justify-content:center;align-items:center;width:34px;height:34px;padding:0;transition:background-color .15s,border-color .15s,opacity .15s;display:inline-flex}.pse-action img{filter:invert();display:block}.pse-action:hover:not(:disabled){background-color:var(--pse-brand-ink-strong)}.pse-action:focus{outline:none}.pse-action:focus-visible{box-shadow:0 0 0 3px var(--pse-brand-ring);outline:none}.pse-action:disabled{cursor:not-allowed;background-color:#dfe6e2}.pse-action-quiet{border-color:var(--pse-line);background-color:#fff}.pse-action-quiet img{filter:none;opacity:.55}.pse-action-quiet:hover:not(:disabled){border-color:var(--pse-brand);background-color:var(--pse-brand-soft)}.pse-action-quiet:hover:not(:disabled) img{opacity:.9}.pse-back{color:var(--pse-ink-soft);border-radius:9px;flex:none;align-items:center;gap:3px;padding:4px 10px 4px 4px;font-size:13px;font-weight:600;text-decoration:none;transition:background-color .15s,color .15s;display:inline-flex}.pse-back:hover{background-color:var(--pse-brand-soft);color:var(--pse-brand-ink);text-decoration:none}.pse-back-icon{font-size:19px}");
	_css(":root{--toastify-color-light:#fff;--toastify-color-dark:#121212;--toastify-color-info:#3498db;--toastify-color-success:#07bc0c;--toastify-color-warning:#f1c40f;--toastify-color-error:#e74c3c;--toastify-color-transparent:#ffffffb3;--toastify-icon-color-info:var(--toastify-color-info);--toastify-icon-color-success:var(--toastify-color-success);--toastify-icon-color-warning:var(--toastify-color-warning);--toastify-icon-color-error:var(--toastify-color-error);--toastify-toast-width:320px;--toastify-toast-background:#fff;--toastify-toast-min-height:64px;--toastify-toast-max-height:800px;--toastify-font-family:sans-serif;--toastify-z-index:9999;--toastify-text-color-light:#757575;--toastify-text-color-dark:#fff;--toastify-text-color-info:#fff;--toastify-text-color-success:#fff;--toastify-text-color-warning:#fff;--toastify-text-color-error:#fff;--toastify-spinner-color:#616161;--toastify-spinner-color-empty-area:#e0e0e0;--toastify-color-progress-light:linear-gradient(90deg,#4cd964,#5ac8fa,#007aff,#34aadc,#5856d6,#ff2d55);--toastify-color-progress-dark:#bb86fc;--toastify-color-progress-info:var(--toastify-color-info);--toastify-color-progress-success:var(--toastify-color-success);--toastify-color-progress-warning:var(--toastify-color-warning);--toastify-color-progress-error:var(--toastify-color-error);--toastify-color-progress-colored:#ddd}.Toastify__toast-container{box-sizing:border-box;color:#fff;transform:translate3d(0,0,var(--toastify-z-index) px);width:var(--toastify-toast-width);z-index:var(--toastify-z-index);padding:4px;position:fixed}.Toastify__toast-container--top-left{top:1em;left:1em}.Toastify__toast-container--top-center{top:1em;left:50%;transform:translate(-50%)}.Toastify__toast-container--top-right{top:1em;right:1em}.Toastify__toast-container--bottom-left{bottom:1em;left:1em}.Toastify__toast-container--bottom-center{bottom:1em;left:50%;transform:translate(-50%)}.Toastify__toast-container--bottom-right{bottom:1em;right:1em}@media only screen and (width<=480px){.Toastify__toast-container{width:100vw;margin:0;padding:0;left:0}.Toastify__toast-container--top-center,.Toastify__toast-container--top-left,.Toastify__toast-container--top-right{top:0;transform:translate(0)}.Toastify__toast-container--bottom-center,.Toastify__toast-container--bottom-left,.Toastify__toast-container--bottom-right{bottom:0;transform:translate(0)}.Toastify__toast-container--rtl{left:auto;right:0}}.Toastify__toast{box-sizing:border-box;cursor:pointer;font-family:var(--toastify-font-family);max-height:var(--toastify-toast-max-height);min-height:var(--toastify-toast-min-height);z-index:0;direction:ltr;border-radius:4px;justify-content:space-between;margin-bottom:1rem;padding:8px;display:flex;position:relative;overflow:hidden;box-shadow:0 1px 10px #0000001a,0 2px 15px #0000000d}.Toastify__toast--rtl{direction:rtl}.Toastify__toast-body{white-space:pre-wrap;flex:auto;align-items:center;margin:auto 0;padding:6px;display:flex}.Toastify__toast-body>div:last-child{flex:1}.Toastify__toast-icon{flex-shrink:0;width:20px;margin-inline-end:10px;display:flex}.Toastify__toast-text{flex-direction:column;gap:2px;width:100%;line-height:1.35;display:flex}.Toastify__toast-text-title{font-weight:600}.Toastify__toast-text-content{opacity:.92}.Toastify--animate{animation-duration:.7s;animation-fill-mode:both}.Toastify--animate-icon{animation-duration:.3s;animation-fill-mode:both}@media only screen and (width<=480px){.Toastify__toast{border-radius:0;margin-bottom:0}}.Toastify__toast-theme--dark{background:var(--toastify-color-dark);color:var(--toastify-text-color-dark)}.Toastify__toast-theme--colored.Toastify__toast--default,.Toastify__toast-theme--light{background:var(--toastify-color-light);color:var(--toastify-text-color-light)}.Toastify__toast-theme--colored.Toastify__toast--info{background:var(--toastify-color-info);color:var(--toastify-text-color-info)}.Toastify__toast-theme--colored.Toastify__toast--success{background:var(--toastify-color-success);color:var(--toastify-text-color-success)}.Toastify__toast-theme--colored.Toastify__toast--warning{background:var(--toastify-color-warning);color:var(--toastify-text-color-warning)}.Toastify__toast-theme--colored.Toastify__toast--error{background:var(--toastify-color-error);color:var(--toastify-text-color-error)}.Toastify__progress-bar-theme--light{background:var(--toastify-color-progress-light)}.Toastify__progress-bar-theme--dark{background:var(--toastify-color-progress-dark)}.Toastify__progress-bar--info{background:var(--toastify-color-progress-info)}.Toastify__progress-bar--success{background:var(--toastify-color-progress-success)}.Toastify__progress-bar--warning{background:var(--toastify-color-progress-warning)}.Toastify__progress-bar--error{background:var(--toastify-color-progress-error)}.Toastify__progress-bar-theme--colored.Toastify__progress-bar--default{background:var(--toastify-color-progress-colored)}.Toastify__progress-bar-theme--colored.Toastify__progress-bar--error,.Toastify__progress-bar-theme--colored.Toastify__progress-bar--info,.Toastify__progress-bar-theme--colored.Toastify__progress-bar--success,.Toastify__progress-bar-theme--colored.Toastify__progress-bar--warning{background:var(--toastify-color-transparent)}.Toastify__close-button{color:#fff;cursor:pointer;opacity:.7;background:0 0;border:none;outline:none;align-self:flex-start;padding:0;transition:all .3s}.Toastify__close-button--light{color:#000;opacity:.3}.Toastify__close-button>svg{fill:currentColor;width:14px;height:16px}.Toastify__close-button:focus,.Toastify__close-button:hover{opacity:1}@keyframes Toastify__trackProgress{0%{transform:scaleX(1)}to{transform:scaleX(0)}}.Toastify__progress-bar{opacity:.7;transform-origin:0;width:100%;height:5px;z-index:var(--toastify-z-index);position:absolute;bottom:0;left:0}.Toastify__progress-bar--animated{animation:linear forwards Toastify__trackProgress}.Toastify__progress-bar--controlled{transition:transform .2s}.Toastify__progress-bar--rtl{transform-origin:100%;left:auto;right:0}.Toastify__spinner{border:2px solid;border-color:var(--toastify-spinner-color-empty-area);border-right-color:var(--toastify-spinner-color);box-sizing:border-box;border-radius:100%;width:20px;height:20px;animation:.65s linear infinite Toastify__spin}@keyframes Toastify__bounceInRight{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate(3000px)}60%{opacity:1;transform:translate(-25px)}75%{transform:translate(10px)}90%{transform:translate(-5px)}to{transform:none}}@keyframes Toastify__bounceOutRight{20%{opacity:1;transform:translate(-20px)}to{opacity:0;transform:translate(2000px)}}@keyframes Toastify__bounceInLeft{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translate(-3000px)}60%{opacity:1;transform:translate(25px)}75%{transform:translate(-10px)}90%{transform:translate(5px)}to{transform:none}}@keyframes Toastify__bounceOutLeft{20%{opacity:1;transform:translate(20px)}to{opacity:0;transform:translate(-2000px)}}@keyframes Toastify__bounceInUp{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translateY(3000px)}60%{opacity:1;transform:translateY(-20px)}75%{transform:translateY(10px)}90%{transform:translateY(-5px)}to{transform:translateZ(0)}}@keyframes Toastify__bounceOutUp{20%{transform:translateY(-10px)}40%,45%{opacity:1;transform:translateY(20px)}to{opacity:0;transform:translateY(-2000px)}}@keyframes Toastify__bounceInDown{0%,60%,75%,90%,to{animation-timing-function:cubic-bezier(.215,.61,.355,1)}0%{opacity:0;transform:translateY(-3000px)}60%{opacity:1;transform:translateY(25px)}75%{transform:translateY(-10px)}90%{transform:translateY(5px)}to{transform:none}}@keyframes Toastify__bounceOutDown{20%{transform:translateY(10px)}40%,45%{opacity:1;transform:translateY(-20px)}to{opacity:0;transform:translateY(2000px)}}.Toastify__bounce-enter--bottom-left,.Toastify__bounce-enter--top-left{animation-name:Toastify__bounceInLeft}.Toastify__bounce-enter--bottom-right,.Toastify__bounce-enter--top-right{animation-name:Toastify__bounceInRight}.Toastify__bounce-enter--top-center{animation-name:Toastify__bounceInDown}.Toastify__bounce-enter--bottom-center{animation-name:Toastify__bounceInUp}.Toastify__bounce-exit--bottom-left,.Toastify__bounce-exit--top-left{animation-name:Toastify__bounceOutLeft}.Toastify__bounce-exit--bottom-right,.Toastify__bounce-exit--top-right{animation-name:Toastify__bounceOutRight}.Toastify__bounce-exit--top-center{animation-name:Toastify__bounceOutUp}.Toastify__bounce-exit--bottom-center{animation-name:Toastify__bounceOutDown}@keyframes Toastify__none{0%,60%,75%,90%,to{animation-duration:0;animation-timing-function:none}0%{opacity:1;transform:translateZ(0)}to{transform:translateZ(0)}}.Toastify__none-enter--bottom-center,.Toastify__none-enter--bottom-left,.Toastify__none-enter--bottom-right,.Toastify__none-enter--top-center,.Toastify__none-enter--top-left,.Toastify__none-enter--top-right{animation-name:Toastify__none}@keyframes Toastify__zoomIn{0%{opacity:0;transform:scale3d(.3,.3,.3)}50%{opacity:1}}@keyframes Toastify__zoomOut{0%{opacity:1}50%{opacity:0;transform:scale3d(.3,.3,.3)}to{opacity:0}}.Toastify__zoom-enter{animation-name:Toastify__zoomIn}.Toastify__zoom-exit{animation-name:Toastify__zoomOut}@keyframes Toastify__flipIn{0%{opacity:0;animation-timing-function:ease-in;transform:perspective(400px)rotateX(90deg)}40%{animation-timing-function:ease-in;transform:perspective(400px)rotateX(-20deg)}60%{opacity:1;transform:perspective(400px)rotateX(10deg)}80%{transform:perspective(400px)rotateX(-5deg)}to{transform:perspective(400px)}}@keyframes Toastify__flipOut{0%{transform:perspective(400px)}30%{opacity:1;transform:perspective(400px)rotateX(-20deg)}to{opacity:0;transform:perspective(400px)rotateX(90deg)}}.Toastify__flip-enter{animation-name:Toastify__flipIn}.Toastify__flip-exit{animation-name:Toastify__flipOut}@keyframes Toastify__slideInRight{0%{visibility:visible;transform:translate(110%)}to{transform:translateZ(0)}}@keyframes Toastify__slideInLeft{0%{visibility:visible;transform:translate(-110%)}to{transform:translateZ(0)}}@keyframes Toastify__slideInUp{0%{visibility:visible;transform:translateY(110%)}to{transform:translateZ(0)}}@keyframes Toastify__slideInDown{0%{visibility:visible;transform:translateY(-110%)}to{transform:translateZ(0)}}@keyframes Toastify__slideOutRight{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate(110%)}}@keyframes Toastify__slideOutLeft{0%{transform:translateZ(0)}to{visibility:hidden;transform:translate(-110%)}}@keyframes Toastify__slideOutDown{0%{transform:translateZ(0)}to{visibility:hidden;transform:translateY(500px)}}@keyframes Toastify__slideOutUp{0%{transform:translateZ(0)}to{visibility:hidden;transform:translateY(-500px)}}.Toastify__slide-enter--bottom-left,.Toastify__slide-enter--top-left{animation-name:Toastify__slideInLeft}.Toastify__slide-enter--bottom-right,.Toastify__slide-enter--top-right{animation-name:Toastify__slideInRight}.Toastify__slide-enter--top-center{animation-name:Toastify__slideInDown}.Toastify__slide-enter--bottom-center{animation-name:Toastify__slideInUp}.Toastify__slide-exit--bottom-left,.Toastify__slide-exit--top-left{animation-name:Toastify__slideOutLeft}.Toastify__slide-exit--bottom-right,.Toastify__slide-exit--top-right{animation-name:Toastify__slideOutRight}.Toastify__slide-exit--top-center{animation-name:Toastify__slideOutUp}.Toastify__slide-exit--bottom-center{animation-name:Toastify__slideOutDown}@keyframes Toastify__spin{0%{transform:rotate(0)}to{transform:rotate(1turn)}}");
	var pickerScrollbar_default = "/* ---- The select dropdown's scrollbar ---- *\n * Split out of `src/style.css`, and imported as raw text by `src/main.ts`\n * rather than as a stylesheet, for one reason: lightningcss -- the minifier the\n * build runs every other stylesheet through -- fails outright on\n * `::picker(select)::-webkit-scrollbar`, and takes the whole build down with\n * it. Text it never parses is text it cannot refuse.\n *\n * What it draws: Chrome's default scrollbar in the picker is the wide one with\n * a stepper button at each end, drawn hard against the panel's inner edge -- so\n * it ran the full height straight through both rounded corners and put two\n * little arrows in a card that has no other chrome on it. A thumb on an empty\n * track instead: the transparent border with `background-clip` insets it from\n * the edge, and the margin on the track holds it clear of the corners at either\n * end.\n *\n * The `::-webkit-` pseudo-elements rather than `scrollbar-width` and\n * `scrollbar-color`: they cannot be mixed -- Chrome drops these the moment the\n * standard properties are set on the same element -- and the standard pair can\n * neither inset the thumb nor hold it off the corners, which is the whole point\n * of the exercise.\n *\n * Spelled out flat, one selector per rule. Chrome matches a\n * `::-webkit-scrollbar` chained onto `::picker(select)` only written this way:\n * the same thing nested as `&::-webkit-scrollbar` inside the picker's own rule\n * parses, survives the build and then matches nothing, because nesting resolves\n * the parent into an `:is()` that a pseudo-element cannot live in.\n *\n * The values track `src/style.css`: `--pse-line` for the thumb, `--pse-ink-faint`\n * on hover, and a track margin a little over the picker's 14px corner radius.\n */\n@supports (appearance: base-select) {\n	select.pse-dialog-input::picker(select)::-webkit-scrollbar {\n		width: 11px;\n	}\n\n	select.pse-dialog-input::picker(select)::-webkit-scrollbar-track {\n		margin: 10px 0;\n		background: transparent;\n	}\n\n	select.pse-dialog-input::picker(select)::-webkit-scrollbar-thumb {\n		border: 3px solid transparent;\n		border-radius: 999px;\n		background-color: var(--pse-line);\n		background-clip: content-box;\n	}\n\n	select.pse-dialog-input::picker(select)::-webkit-scrollbar-thumb:hover {\n		background-color: var(--pse-ink-faint);\n	}\n\n	:root #editParcelModal .modal-body select::picker(select)::-webkit-scrollbar {\n		width: 11px;\n	}\n\n	:root #editParcelModal .modal-body select::picker(select)::-webkit-scrollbar-track {\n		margin: 10px 0;\n		background: transparent;\n	}\n\n	:root #editParcelModal .modal-body select::picker(select)::-webkit-scrollbar-thumb {\n		border: 3px solid transparent;\n		border-radius: 999px;\n		background-color: var(--pse-line);\n		background-clip: content-box;\n	}\n\n	:root #editParcelModal .modal-body select::picker(select)::-webkit-scrollbar-thumb:hover {\n		background-color: var(--pse-ink-faint);\n	}\n}\n";
	var pickerScrollbarStyle = document.createElement("style");
	pickerScrollbarStyle.textContent = pickerScrollbar_default;
	document.documentElement.append(pickerScrollbarStyle);
	var appendToBody = (host) => document.body.append(host);
	function mountIntoMainContent(host) {
		const main = document.querySelector(MAIN_CONTENT_SELECTOR);
		if (main) {
			main.append(host);
			return;
		}
		appendToBody(host);
	}
	var searchReservationsRoute = {
		pattern: /outdoor\/packship/,
		component: SearchReservationsPage_default,
		attach: (host) => getSearchBlock()?.insertAdjacentElement("afterend", host)
	};
	var routes = [
		{
			pattern: /outdoor\/packship\/Identity\/Account\/Login/,
			component: LoginPage_default,
			attach: (host) => document.querySelector("footer")?.insertAdjacentElement("beforebegin", host) ?? document.body.append(host),
			bareLayout: true
		},
		{
			pattern: /outdoor\/packship\/Identity\/Account\/Logout/,
			component: LogoutPage_default,
			attach: appendToBody
		},
		{
			pattern: /outdoor\/packship\/CompleteReservations/,
			component: CompletedPage_default,
			attach: (host) => mountIntoMainContent(host)
		},
		{
			pattern: /outdoor\/packship\/Parcels/,
			component: CreateParcelsPage_default,
			attach: (host) => getParcelContainerParent()?.insertAdjacentElement("afterbegin", host),
			anchor: getParcelContainerParent
		},
		{
			pattern: /outdoor\/packship\/Reservations\/Index\//,
			component: VerifyProductsPage_default,
			attach: (host) => mountIntoMainContent(host)
		},
		{
			pattern: /outdoor\/packship\/AddParcels\/Search\?ReservationNumber=/,
			matchQuery: true,
			component: AddParcelsPage_default,
			attach: appendToBody
		},
		{
			pattern: /outdoor\/packship\/AnnounceParcels/,
			component: CompletedPage_default,
			attach: (host) => mountIntoMainContent(host),
			props: { announced: true }
		},
		searchReservationsRoute
	];
	Settings.load();
	var path = window.location.pathname;
	var pathWithQuery = path + window.location.search;
	var route = routes.find((candidate) => candidate.pattern.test(candidate.matchQuery ? pathWithQuery : path));
	armReveal();
	installManifest();
	Promise.all([
		lockPicker(),
		lockLanguage(),
		mountHeader(),
		mountFooter(),
		pinFooter(),
		boot()
	]).catch((error) => console.error("Pack&Ship Extended failed to start.", error)).then(() => nextTick()).then(reveal);
	async function lockPicker() {
		if (route?.bareLayout || !(Settings.environmentId > 0)) return;
		hideEnvironmentPicker();
		await whenPresent(getEnvironmentSelect);
		lockEnvironmentPicker();
	}
	function lockLanguage() {
		if (route?.bareLayout) return;
		hideLanguagePicker();
	}
	async function mountHeader() {
		if (route?.bareLayout) return;
		const header = await findPortalHeader();
		if (header) {
			header.classList.add("pse-portal-replaced");
			mountApp(Header_default, (host) => header.insertAdjacentElement("beforebegin", host));
			return;
		}
		const column = document.querySelector(PAGE_COLUMN_SELECTOR);
		if (!column) return;
		mountApp(Header_default, (host) => column.insertAdjacentElement("afterbegin", host));
	}
	function findPortalHeader() {
		return Promise.race([whenPresent(getPortalHeader), domReady().then(getPortalHeader)]);
	}
	async function mountFooter() {
		if (route?.bareLayout) return;
		centreFooterRow(await whenPresent(() => document.querySelector(FOOTER_SLOT_SELECTOR)));
		mountApp(Footer_default, appendToBody);
		await moveVendorBuildLine();
	}
	function centreFooterRow(slot) {
		const cell = slot?.parentElement;
		if (!cell) return;
		cell.classList.add("pse-footer-cell");
		cell.parentElement?.classList.add("pse-footer-row");
	}
	async function moveVendorBuildLine() {
		const target = (await whenPresent(() => document.querySelector(ENVIRONMENT_FORM_SELECTOR)))?.parentElement;
		const footer = document.querySelector("footer");
		if (!target || !footer) return;
		const vendor = /NedFox|retail platform/i;
		const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
		const lines = [];
		for (let node = walker.nextNode(); node; node = walker.nextNode()) if (vendor.test(node.nodeValue ?? "")) lines.push(node);
		if (lines.length == 0) return;
		const moved = document.createElement("span");
		moved.className = "pse-vendor";
		moved.textContent = lines.map((line) => line.nodeValue?.trim()).filter(Boolean).join(" ");
		for (const line of lines) line.nodeValue = "";
		target.classList.add("pse-footer-end");
		target.prepend(moved);
	}
	function servedRoute(current) {
		if (current?.component != AddParcelsPage_default) return current;
		return !document.querySelector("#ReservationOverview") && Boolean(getSearchBlock()) ? searchReservationsRoute : current;
	}
	async function boot() {
		try {
			if (route?.component && route.attach && route.anchor) {
				await whenPresent(route.anchor);
				mountApp(route.component, route.attach, route.props);
			}
			await domReady();
			const served = servedRoute(route);
			if (served?.component && served.attach && !served.anchor) mountApp(served.component, served.attach, served.props);
			if (!route?.bareLayout) {
				applyConfiguredEnvironment();
				applyDutchLanguage();
			}
			await nextTick();
		} catch (error) {
			console.error("Pack&Ship Extended failed to mount.", error);
		}
	}
})();

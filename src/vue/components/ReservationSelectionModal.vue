<script setup lang="ts">
import { ref } from "vue";
import { ReservationSelectionModalData } from "../../interfaces";

const props = defineProps({
	modalData: {  }
});

const modalData:ReservationSelectionModalData = ref({
	searchProductName: "TESTNAME",
	searchProductBarcode: "TEST EAN",
	searchProductResults: 10,
	searchImageUrl: "data:image/gif;base64,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",

	singleLineReservations: "",
	singleLineReservationAmount: 1,

	multiLineReservations: "",
	multiLineReservationAmount: 1,

	invalidReservations: "",
	invalidReservationAmount:1
});
</script>

<template>
		<div class="settings-modal">
			<div class="modal show" id="productReservationsModal" tabindex="-1" role="dialog" data-backdrop="static" aria-modal="true" style="display: block; padding-left: 15px;">
				<div class="modal-dialog modal-xl" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">
								{{ modalData.searchProductResults }} reserveringen gevonden met product barcode '{{ modalData.searchProductBarcode }}'
							</h5>
							<button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="$emit('close')">
								<span aria-hidden="true">×</span>
							</button>
						</div>
						<div class="modal-body">
							<div class="modal-body">
								
								
								<div class="container my-2 text-left">
									<div class="row text-success ">
										<div class="col-6">
											<h3>
												Succesvol product '{{ modalData.searchProductName }}' gevonden
											</h3>
											<p>Het product komt voor in 2 reserveringen.</p>
										</div>
										<div class="col-6">
											<div class="row product border border-success rounded">
												<div class="col-9 product-details">
													<h4 class="card-title">{{ modalData.searchProductName }}</h4>
													<p class="card-text">{{ modalData.searchProductBarcode }}</p>
												</div>
												<div class="col-3 product-image">
													<div class="float-right">
														<img :src="modalData.searchProductImageUrl" class="img-fluid" loading="lazy">
													</div>
												</div>
											</div>            
										</div>
									</div>
									
									
									<hr>
									<div class="row">
										<div class="col">
											<h4>2 reserveringen zijn nog niet volledig geraapt.</h4>
											<div class="alert alert-danger">Onderstaande reserveringen bevatten het product, maar hebben niet de juiste logistieke status, of zijn nog niet volledig geraapt.</div>
										</div>
									</div>
									<div class="invalid-reservations">
										
										<div class="card mb-2">
											<div class="card-header">
												<div class="row">
													<div class="col-10">
														<div class="row">
															<div class="col-4">
																<div>Reservering: <b>312913</b></div>
																<div>Verkooporder referentiecode: <b>263515</b></div>
																
															</div>
															<div class="col-4">
																<div>Status: <b>Open</b></div>
																<div>Logistieke status: <b>Rapen gereed</b></div>
															</div>
															<div class="col-4">
																<div> Klant: <b>Van Vliet, Heico (321262)</b></div>
															</div>
														</div>
													</div>
													<div class="col-2">
													</div>
													
												</div>
											</div>
											<div class="card-body">
												<div class="reservation-rows reservation-rows">
													<div class="row nfTableHeader">
														<div class="col-3 ">Artikel nr</div>
														<div class="col-3">Omschrijving</div>
														<div class="col-3">Hoofd barcode</div>
														<div class="col-3">Geraapt aantal</div>
													</div>
													<div class="reservation-rows ">
														<div class="row nfTableRow bg-warning text-dark">
															<div class="col-3">122004</div>
															<div class="col-3">Ooni Eiken Stammetjes Karu 12 &amp; 16</div>
															<div class="col-3">5060568345130</div>
															<div class="col-3 font-weight-bold">0 van 1</div>
														</div>
														<div class="row nfTableRow ">
															<div class="col-3">141753</div>
															<div class="col-3">OONI THERMOMETER</div>
															<div class="col-3">5060967397211</div>
															<div class="col-3 ">1 van 1</div>
														</div>
													</div>
												</div>
												
											</div>
										</div>
										<div class="card mb-2">
											<div class="card-header">
												<div class="row">
													<div class="col-10">
														<div class="row">
															<div class="col-4">
																<div>Reservering: <b>314726</b></div>
																<div>Verkooporder referentiecode: <b>264608</b></div>
																
															</div>
															<div class="col-4">
																<div>Status: <b>Open</b></div>
																<div>Logistieke status: <b>Wordt geraapt</b></div>
															</div>
															<div class="col-4">
																<div> Klant: <b>Hylkema, Timothy (322959)</b></div>
															</div>
														</div>
													</div>
													<div class="col-2">
													</div>
													
												</div>
											</div>
											<div class="card-body">
												<div class="reservation-rows reservation-rows">
													<div class="row nfTableHeader">
														<div class="col-3 ">Artikel nr</div>
														<div class="col-3">Omschrijving</div>
														<div class="col-3">Hoofd barcode</div>
														<div class="col-3">Geraapt aantal</div>
													</div>
													<div class="reservation-rows ">
														<div class="row nfTableRow ">
															<div class="col-3">168740</div>
															<div class="col-3">Ooni Karu 2 Gasbrander 30 Mbar</div>
															<div class="col-3">5060967394937</div>
															<div class="col-3 ">1 van 1</div>
														</div>
														<div class="row nfTableRow bg-warning text-dark">
															<div class="col-3">166988</div>
															<div class="col-3">OONI KARU 2</div>
															<div class="col-3">5060967396467</div>
															<div class="col-3 font-weight-bold">0 van 1</div>
														</div>
														<div class="row nfTableRow ">
															<div class="col-3">94383</div>
															<div class="col-3">Ooni Perforated Peel 12 Inch</div>
															<div class="col-3">5060967397143</div>
															<div class="col-3 ">1 van 1</div>
														</div>
														<div class="row nfTableRow ">
															<div class="col-3">141859</div>
															<div class="col-3">Ooni Draaischep 17 Cm</div>
															<div class="col-3">5060967397167</div>
															<div class="col-3 ">1 van 1</div>
														</div>
														<div class="row nfTableRow ">
															<div class="col-3">168734</div>
															<div class="col-3">Ooni Draagtas/Cover Karu 12, Karu 12G &amp; Karu 2</div>
															<div class="col-3">5060967396672</div>
															<div class="col-3 ">1 van 1</div>
														</div>
														<div class="row nfTableRow ">
															<div class="col-3">122004</div>
															<div class="col-3">Ooni Eiken Stammetjes Karu 12 &amp; 16</div>
															<div class="col-3">5060568345130</div>
															<div class="col-3 ">1 van 1</div>
														</div>
													</div>
												</div>
												
											</div>
										</div>        </div>
									</div>
									
								</div>                    
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-primary" data-dismiss="modal">Sluiten</button>
							</div>
						</div>
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
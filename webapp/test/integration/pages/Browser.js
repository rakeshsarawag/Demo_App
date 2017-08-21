sap.ui.define([
	"sap/ui/test/Opa5",
	"sap.cdp.demo.demoApplication5/test/integration/pages/Common"
], function(Opa5, Common) {
	"use strict";

	Opa5.createPageObjects({
		onTheBrowserPage: {
			baseClass: Common,

			actions: {

				iChangeTheHashToObjectN: function(iObjIndex) {
					return this.waitFor(this.createAWaitForAnEntitySet({
						entitySet: "Objects",
						success: function(aEntitySet) {
							Opa5.getHashChanger().setHash("/TaskDemandColl/" + aEntitySet[iObjIndex].WorkItm);
						}
					}));
				},

				iChangeTheHashToTheRememberedItem: function() {
					return this.waitFor({
						success: function() {
							var sObjectId = this.getContext().currentListItem.getBindingContext().getProperty("WorkItm");
							Opa5.getHashChanger().setHash("/TaskDemandColl/" + sObjectId);
						}
					});
				},

				iChangeTheHashToTheRememberedId: function() {
					return this.waitFor({
						success: function() {
							var sObjectId = this.getContext().currentId;
							Opa5.getHashChanger().setHash("/TaskDemandColl/" + sObjectId);
						}
					});
				},

				iChangeTheHashToSomethingInvalid: function() {
					return this.waitFor({
						success: function() {
							Opa5.getHashChanger().setHash("/somethingInvalid");
						}
					});
				}

			},

			assertions: {

				iShouldSeeTheHashForObjectN: function(iObjIndex) {
					return this.waitFor(this.createAWaitForAnEntitySet({
						entitySet: "Objects",
						success: function(aEntitySet) {
							var oHashChanger = Opa5.getHashChanger(),
								sHash = oHashChanger.getHash();
							QUnit.strictEqual(sHash, "TaskDemandColl/" + aEntitySet[iObjIndex].WorkItm, "The Hash is not correct");
						}
					}));
				},

				iShouldSeeTheHashForTheRememberedObject: function() {
					return this.waitFor({
						success: function() {
							var sObjectId = this.getContext().currentListItem.getBindingContext().getProperty("WorkItm"),
								oHashChanger = Opa5.getHashChanger(),
								sHash = oHashChanger.getHash();
							QUnit.strictEqual(sHash, "TaskDemandColl/" + sObjectId, "The Hash is not correct");
						}
					});
				},

				iShouldSeeAnEmptyHash: function() {
					return this.waitFor({
						success: function() {
							var oHashChanger = Opa5.getHashChanger(),
								sHash = oHashChanger.getHash();
							QUnit.strictEqual(sHash, "", "The Hash should be empty");
						},
						errorMessage: "The Hash is not Correct!"
					});
				}

			}

		}

	});

});
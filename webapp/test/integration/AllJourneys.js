jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");

jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.pages.Common");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.pages.App");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.pages.Browser");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.pages.Master");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.pages.Detail");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.pages.NotFound");

sap.ui.test.Opa5.extendConfig({
	arrangements: new sap.cdp.demo.demoApplication5.test.integration.pages.Common(),
	viewNamespace: "sap.cdp.demo.demoApplication5.view."
});

jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.MasterJourney");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.NavigationJourney");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.NotFoundJourney");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.BusyJourney");
jQuery.sap.require("sap.cdp.demo.demoApplication5.test.integration.FLPIntegrationJourney");
sap.ui.define([
    "sap/cdp/demo/demoApplication5/controller/BaseController"
], function(BaseController) {
    "use strict";

    return BaseController.extend("sap.cdp.demo.demoApplication5.controller.NotFound", {

        /**
         * Event handler for 'GO_TO_TASKLIST' link. 
         * Navigates user back to worklist view
         */
        onLinkPressed: function() {
            this.getRouter().navTo("tasklist");
        }

    });

});

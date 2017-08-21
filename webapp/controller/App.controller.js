sap.ui.define([
    "sap/cdp/demo/demoApplication5/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("sap.cdp.demo.demoApplication5.controller.App", {

        //------------------------------------------------------------------
        // Lifecycle methods
        //------------------------------------------------------------------

        onInit: function() {
            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            // check for auth objects load 
            /*this.getOwnerComponent().oWhenAuthIsLoaded.always(function() {
                this.getOwnerComponent().oWhenMetadataIsLoaded.then(fnSetAppNotBusy, fnSetAppNotBusy);
            }.bind(this)); */

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }

        //------------------------------------------------------------------
        // Event handlers
        //------------------------------------------------------------------



        //------------------------------------------------------------------
        // Internal Methods
        //------------------------------------------------------------------
    });

});
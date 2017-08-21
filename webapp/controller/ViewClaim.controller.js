sap.ui.define([
    "sap/cdp/demo/demoApplication5/controller/BaseController",
    "sap/cdp/demo/demoApplication5/model/TaskListModel",
    "sap/cdp/demo/demoApplication5/model/formatter",
    "sap/ui/core/ValueState",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/cdp/demo/demoApplication5/util/TimeUtil",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/cdp/demo/demoApplication5/util/Configurations",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/TablePersoController"
], function(BaseController, TaskListModel, formatter, ValueState, Filter, FilterOperator, TimeUtil, JSONModel, Sorter, Configurations, MessageToast, MessageBox, TablePersoController) {
    "use strict";

    return BaseController.extend("sap.cdp.demo.demoApplication5.controller.ViewClaim", {
        //------------------------------------------------------------------
        // Lifecycle methods
        //------------------------------------------------------------------

        /**
         * Called when the TaskList controller is instantiated.
         * @public
         */
        onInit: function() {
            this._setupViewModel();
            this.getRouter().getRoute("viewClaim").attachPatternMatched(this._onNavigationPatternMatched, this);
        },
        _onNavigationPatternMatched: function(oEvent) {
            var oModel = this.getModel(),
                oArguments = oEvent.getParameter("arguments"),
                sContextPath,
                oCommonModel = this.getModel("commonData");

            oCommonModel.setProperty("/Company", oArguments.Company);
            oCommonModel.setProperty("/VendorNo", oArguments.VendorNo);
            oCommonModel.setProperty("/ClaimNo", oArguments.ClaimNo);
            oCommonModel.setProperty("/Guid", oArguments.Guid);

            oModel.metadataLoaded().then(function() {
                sContextPath = oModel.createKey("/ClaimsHistorySet", {
                    "Guid": oArguments.Guid
                });

                this.getView().bindElement({
                    path: sContextPath
                });
            }.bind(this));

            this._getNotesText();
            this._setHeaderTitle();
        },
        _setHeaderTitle: function(sText) {
            var oCommonModel = this.getModel("commonData"),
                oResourceBundle = this.getResourceBundle(),
                sClaimTitle = oResourceBundle.getText("CLAIM_NO_TITLE"),
                sTitle = oResourceBundle.getText("NAV_TITLE_601");

            oCommonModel.setProperty("/HeaderTitle",  jQuery.sap.formatMessage("{0} － {1}", oResourceBundle.getText("HEADER_TITLE"), sTitle));
            oCommonModel.setProperty("/ClaimNoTitle", jQuery.sap.formatMessage(sClaimTitle, oCommonModel.getProperty("/ClaimNo")));
        },
        /**
         * Function to setup view models
         * @private
         */
        _setupViewModel: function() {
            //Setting up Vendor model
            var oCommonModel = new JSONModel(this._getInitialCommonData());
            this.setModel(oCommonModel, "commonData");

        },
        _getNotesText: function() {
            var oDataModel = this.getModel(),
                oCommonModel = this.getModel("commonData"),
                sPath = oDataModel.createKey("/ClaimNotesSet", {
                    Guid: oCommonModel.getProperty("/Guid")
                });

            oDataModel.read(sPath, {
                success: function(oData, oResponse) {
                    this.getModel("commonData").setProperty("/NotesText", oData.Notes);
                }.bind(this),
                error: function(oError) {}.bind(this)
            });
        },
        /**
         * This function gets blank initial data
         *@return {object} returns object
         */
        _getInitialCommonData: function() {
            return {
                VendorNo: "",
                VendorName: "",
                Company: "",
                ClaimNo: "",
                Guid: "",
                ClaimNoTitle: "",
                HeaderTitle: "",
                NotesText: ""
            };
        }
    });
});

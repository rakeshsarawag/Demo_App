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

    return BaseController.extend("sap.cdp.demo.demoApplication5.controller.ViewRemittanceDetail", {
        formatter: formatter,
        //------------------------------------------------------------------
        // Lifecycle methods
        //------------------------------------------------------------------

        /**
         * Called when the TaskList controller is instantiated.
         * @public
         */
        onInit: function() {
            this._setupViewModel();
            this.getRouter().getRoute("viewRemittanceDetail").attachPatternMatched(this._onNavigationPatternMatched, this);

            /*this._getTable(sTableTxt).bindAggregation("items", {
                path: sEntitySet,
                template: sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment." + sFolderName + "." + sFragmentName, this),
                filters: this.createBaseFilter()
            });*/
        },
        onRemitDetailUpdateFinished: function(oEvent) {
            this.getModel("commonData").setProperty("/RemitDetailItems", oEvent.getParameter("total"));
        },
        /*
         * This function is called when controller pattern is matched and corresponding work item Data object is bind
         * @param - oEvent - when pattern matches
         */
        _onNavigationPatternMatched: function(oEvent) {
            var oCommonModel = this.getModel("commonData"),
                oArguments = oEvent.getParameters().arguments;

            oCommonModel.setProperty("/Company", oArguments.Company);
            oCommonModel.setProperty("/VendorNo", oArguments.VendorNo);
            oCommonModel.setProperty("/RefNumber", oArguments.RefNumber);
            oCommonModel.setProperty("/PaymentNumber", oArguments.PaymentNumber);

            this._bindRemitDetailTable();
            this._setHeaderTitle();
        },
        _getRemitDetailTable: function() {
            return this.byId("idViewRemitDetailTable");
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
        _bindRemitDetailTable: function() {
            this._getRemitDetailTable().bindAggregation("items", {
                path: "/RemittanceDetailsItemsSet",
                template: sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.RemittanceDetail", this),
                filters: this.createBaseFilter().concat([this._createRefNumberFilter()])
            });
        },
        _createRefNumberFilter: function() {
            return new Filter({
                path: "RefNumber",
                operator: FilterOperator.EQ,
                value1: this.getModel("commonData").getProperty("/RefNumber")
            });
        },
        _setHeaderTitle: function(sText) {
            var oCommonModel = this.getModel("commonData"),
                oResourceBundle = this.getResourceBundle(),
                sHeaderText = jQuery.sap.formatMessage(oResourceBundle.getText("NAV_TITLE_340"), oCommonModel.getProperty("/PaymentNumber")),
                oFormattedText = jQuery.sap.formatMessage("{0} － {1}", oResourceBundle.getText("HEADER_TITLE"), sHeaderText);

            oCommonModel.setProperty("/HeaderTitle", oFormattedText);
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
                RefNumber: "",
                HeaderTitle: "",
                PaymentNumber: "",
                RemitDetailItems: "",
                CheckAmount: "",
                CheckDate: ""
            };
        }

    });
});

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

    return BaseController.extend("sap.cdp.demo.demoApplication5.controller.TaskList", {
        formatter: formatter,
        // Client Model 
        PAYMENTS_TAB: "PaymentsTab",
        REMMITANCE_TAB: "RemmitanceTab",
        PENDING_ITEMS_TAB: "InvoicesTab",
        RECEIVINGS_TAB: "ReceivingsTab",
        IN_PROCESS_TAB: "InProcessTab",
        EDI_REJECTIONS_TAB: "EdiRejectionsTab",
        UNPAID_ITEMS_TAB: "UnPaidItemsTab",
        PAYMENT_FORECAST_TAB: "PaymentForecastTab",
        RECEIVING_ITEMS_TAB: "ReceivingItemsTab",
        CLAIMS_TAB: "ClaimsTab",
        CONSIGNMENTS_TAB: "ConsignmentsTab",
        MS_PER_DAY: 1000 * 60 * 60 * 24,
        TRACK_URL: "http://wwwapps.ups.com/WebTracking/track?track=yes&trackNums={0}",


        //------------------------------------------------------------------
        // Lifecycle methods
        //------------------------------------------------------------------

        /**
         * Called when the TaskList controller is instantiated.
         * @public
         */
        onInit: function() {

            this._setupViewModel();
            this._setHeaderTitle("ABOUT_YOU_BAR");
            this._component = this.getOwnerComponent();
            this._setInitialFragments();

            this.getRouter().getRoute("taskList").attachPatternMatched(this._onNavigationPatternMatched, this);
            // Adding the school picker button in launchpad
            this.getOwnerComponent().getChangeVendorButtonOnFLP(this, function(selectedItem) {}.bind(this));

            this._setUpTblPers(this.PAYMENTS_TAB);
            this._setUpTblPers(this.UNPAID_ITEMS_TAB);
            this._setUpTblPers(this.RECEIVING_ITEMS_TAB);
            this._setUpTblPers(this.CLAIMS_TAB);
            this._setUpTblPers(this.CONSIGNMENTS_TAB);

        },

        //------------------------------------------------------------------
        // Event handlers
        //------------------------------------------------------------------
        onAfterRendering: function() {
            this._getVendorChangeValueHelp().open();
        },
        onCreateClaimPress: function() {
            this.getRouter().navTo("createClaim", {
                VendorNo: this.getModel("commonData").getProperty("/VendorNo"),
                Company: this.getModel("commonData").getProperty("/Company")
            }); 
        },
        onViewRemittanceDetailPress : function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext().getObject();
            this.getRouter().navTo("viewRemittanceDetail", {
                VendorNo: this.getModel("commonData").getProperty("/VendorNo"),
                Company: this.getModel("commonData").getProperty("/Company"),
                RefNumber: oContext.RefNumber,
                PaymentNumber: oContext.PaymentNumber
            });
        },
        onCliamViewPress : function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext().getObject();
            this.getRouter().navTo("viewClaim", {
                VendorNo: this.getModel("commonData").getProperty("/VendorNo"),
                Company: this.getModel("commonData").getProperty("/Company"),
                ClaimNo: oContext.ClaimNo,
                Guid: oContext.Guid
            });
        },
        onAccReceivablePress: function(oEvent) {
            this._getAccReceivablePopover().openBy(oEvent.getSource());
        },
        onTrackingLinkPress: function(oEvent) {
            var sTrackNo = oEvent.getSource().getProperty("text");
            sap.m.URLHelper.redirect(this._getTrackingUrl(sTrackNo), true);
        },
        onPdfViewPress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext().getObject();
            sap.m.URLHelper.redirect(this._createPdfDownloadUri(oContext), true);
        },
        handleVendorConfirm: function(oEvent) {
            var sVendorName = oEvent.getParameter("selectedItem").getProperty("title"),
                sCompany = oEvent.getParameter("selectedItem").getProperty("description"),
                sVendorNumber = oEvent.getParameter("selectedItem").getProperty("info"),
                oCommonModel = this.getModel("commonData");

            oCommonModel.setProperty("/VendorName", sVendorName);
            oCommonModel.setProperty("/VendorNo", sVendorNumber);
            oCommonModel.setProperty("/Company", sCompany);
            this._setAboutViewData();
            this._setDefaultIconTab();

            /*this.getOwnerComponent().loadCollections(["PaymentMethod"], false, [this.createBaseFilter()]).done(function(data) {
                debugger;
            }.bind(this)).fail(function(oError) {
                debugger;
                // Showing backend error
                this.getOwnerComponent().displayErrorMessage("", "", oError);
            }.bind(this));*/
        },
        handleVendorSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value"),
                oFilter = new Filter("VendorName", FilterOperator.Contains, sValue),
                oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
        /**
         * On Back Navigation press for Planner Group Dashsboard
         * @param  {sap.ui.base.Event} oEvent Button Press event
         */
        onNavBack: function(oEvent) {
            var oHistory = sap.ui.core.routing.History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash(),
                oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

            // Navigate back to FLP home
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: "#"
                }
            });
        },
		onUserSettingPress : function(oEvent) {
			sap.m.URLHelper.redirect("https://hub.costco.com", true);
		},
		onEthicsHotlinePress : function(oEvent) {
			sap.m.URLHelper.redirect("http://www.costco.com/confidential-ethics-hotline-for-suppliers.html", true);
		},
		onLinkTermsPress : function(oEvent) {
			sap.m.URLHelper.redirect("https://useracceptance.costco.com/terms/termsandconditions/staticpage", true);
		},
        onPaymentSubTabPress: function(oEvent) {
            var oResource = this.getResourceBundle(),
                sText = oEvent.getSource().getText(),
                oLayout = this.byId("id_Vertical_Layout"),
                oFragment;
            oLayout.destroyContent();
            if (sText === oResource.getText("PAYMENT_HISTORY_SUBTAB")) {
                this._setHeaderTitle("PAYMENT_HISTORY_SUBTAB");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.Payments.PaymentHistory",
                    this);
                for (var i = 0; i < oFragment.length; i++) {
                    oLayout.addContent(oFragment[i]);
                }
                this._bindItemsAggregation(this.PAYMENTS_TAB, "/PaymentHistorySet", "Payments", "PaymentHistoryItems");
            } else {
                this._setHeaderTitle("REMMI_DETAIL_SUBTAB");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.Payments.RemmitanceDetail",
                    this);
                for (var i = 0; i < oFragment.length; i++) {
                    oLayout.addContent(oFragment[i]);
                }
                this._bindItemsAggregation(this.REMMITANCE_TAB, "/RemittanceDetailsSet", "Payments", "RemmitanceDetailItems");
            }
        },
        onUnpaidItemsSubTabPress: function(oEvent) {
            var oResource = this.getResourceBundle(),
                sText = oEvent.getSource().getText(),
                oLayout = this.byId("id_Pending_Items_Layout"),
                oFragment;
            oLayout.destroyContent();

            if (sText === oResource.getText("NAV_TITLE_410")) {
                this._setHeaderTitle("NAV_TITLE_410");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.PendingItems.Invoices",
                    this);
                for (var i = 0; i < oFragment.length; i++) {
                    oLayout.addContent(oFragment[i]);
                }
                this._bindItemsAggregation(this.PENDING_ITEMS_TAB, "/InprogressSet", "PendingItems", "InvoicesItems");
            } else if (sText === oResource.getText("NAV_TITLE_420")) {
                this._setHeaderTitle("NAV_TITLE_420");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.PendingItems.Receivings",
                    this);
                for (var i = 0; i < oFragment.length; i++) {
                    oLayout.addContent(oFragment[i]);
                }
                this._bindItemsAggregation(this.RECEIVINGS_TAB, "/ReceivingsSet", "PendingItems", "ReceivingItems");
            } else if (sText === oResource.getText("NAV_TITLE_430")) {
                this._setHeaderTitle("NAV_TITLE_430");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.PendingItems.InProcess",
                    this);
                for (var i = 0; i < oFragment.length; i++) {
                    oLayout.addContent(oFragment[i]);
                }
                this._bindItemsAggregation(this.IN_PROCESS_TAB, "/InprogressSet", "PendingItems", "InProcessItems");
            } else {
                this._setHeaderTitle("NAV_TITLE_440");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.PendingItems.EdiRejections",
                    this);
                for (var i = 0; i < oFragment.length; i++) {
                    oLayout.addContent(oFragment[i]);
                }
                this._bindItemsAggregation(this.EDI_REJECTIONS_TAB, "/RejectionsItemsSet", "PendingItems", "EdiRejectionItems");
            }
        },
        onPaymentForecastSubTabPress: function(oEvent) {
            var oResource = this.getResourceBundle(),
                sText = oEvent.getSource().getText(),
                oLayout = this.byId("id_Unpaid_Items_Layout"),
                oFragment;
            oLayout.destroyContent();

            if (sText === oResource.getText("NAV_TITLE_450")) {
                this._setHeaderTitle("NAV_TITLE_450");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.UnpaidItems.UnpaidItems",
                    this);
                for (var i = 0; i < oFragment.length; i++) {
                    oLayout.addContent(oFragment[i]);
                }
                this._bindItemsAggregation(this.UNPAID_ITEMS_TAB, "/PaymentHistorySet", "UnpaidItems", "UnpaidItemsList");
            } else {
                this._setHeaderTitle("NAV_TITLE_451");
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.UnpaidItems.PaymentForecast",
                    this);
                oLayout.addContent(oFragment);
                this._bindItemsAggregation(this.PAYMENT_FORECAST_TAB, "/PaymentForecastSet", "UnpaidItems", "PaymentForecastItems");
            }
        },
        onIconTabPress: function(oEvent) {
            var oSegmentBtn;
            if (oEvent.getParameter("key") === "AboutYou") {
                this._setHeaderTitle("ABOUT_YOU_BAR");
            } else if (oEvent.getParameter("key") === "Payments") {
                oSegmentBtn = this._getSegmentButton("idPaymentSegmentButton");
                if (oSegmentBtn.getSelectedKey() === "Payment") {
                    this._setHeaderTitle("PAYMENT_HISTORY_SUBTAB");
                    this._bindItemsAggregation(this.PAYMENTS_TAB, "/PaymentHistorySet", "Payments", "PaymentHistoryItems");
                } else {
                    this._setHeaderTitle("REMMI_DETAIL_SUBTAB");
                    oSegmentBtn = this._getSegmentButton("idPaymentSegmentButton");
                    this._bindItemsAggregation(this.REMMITANCE_TAB, "/RemittanceDetailsSet", "Payments", "RemmitanceDetailItems");
                }
            } else if (oEvent.getParameter("key") === "PendingItems") {
                oSegmentBtn = this._getSegmentButton("idPendingItemsSegmentButton");
                if (oSegmentBtn.getSelectedKey() === "Invoice") {
                    this._setHeaderTitle("NAV_TITLE_410");
                    oSegmentBtn = this._getSegmentButton("idPaymentSegmentButton");
                    this._bindItemsAggregation(this.PENDING_ITEMS_TAB, "/IncomingsSet", "PendingItems", "InvoicesItems");
                } else if (oSegmentBtn.getSelectedKey() === "Receivings") {
                    this._setHeaderTitle("NAV_TITLE_420");
                    this._bindItemsAggregation(this.RECEIVINGS_TAB, "/ReceivingsSet", "PendingItems", "ReceivingItems");
                } else if (oSegmentBtn.getSelectedKey() === "InProcess") {
                    this._setHeaderTitle("NAV_TITLE_430");
                    this._bindItemsAggregation(this.IN_PROCESS_TAB, "/InprogressSet", "PendingItems", "InProcessItems");
                } else {
                    this._setHeaderTitle("NAV_TITLE_440");
                    this._bindItemsAggregation(this.EDI_REJECTIONS_TAB, "/RejectionsItemsSet", "PendingItems", "EdiRejectionItems");
                }
            } else if (oEvent.getParameter("key") === "UnpaidItems") {
                oSegmentBtn = this._getSegmentButton("idUnpaidItemsSegmentButton");
                if (oSegmentBtn.getSelectedKey() === "UnpaidItems") {
                    this._setHeaderTitle("NAV_TITLE_450");
                    this._bindItemsAggregation(this.UNPAID_ITEMS_TAB, "/PaymentHistorySet", "UnpaidItems", "UnpaidItemsList");
                } else {
                    this._setHeaderTitle("NAV_TITLE_451");
                    this._bindItemsAggregation(this.PAYMENT_FORECAST_TAB, "/PaymentForecastSet", "UnpaidItems", "PaymentForecastItems");
                }

            } else if (oEvent.getParameter("key") === "Returns") {
                this._setHeaderTitle("RETURNS_BAR");
                this._bindItemsAggregation(this.RECEIVING_ITEMS_TAB, "/ReturnsSet", "Returns", "ReturnItems");

            } else if (oEvent.getParameter("key") === "Claims") {
                this._setHeaderTitle("CLAIMS_BAR");
                this._bindItemsAggregation(this.CLAIMS_TAB, "/ClaimsHistorySet", "Claims", "ClaimItems");

            } else if (oEvent.getParameter("key") === "Consignments") {
                this._setHeaderTitle("CONSIGNMENTS_BAR");
                this._bindItemsAggregation(this.CONSIGNMENTS_TAB, "/ConsignmentsSet", "Consignments", "ConsignmentItems");

            }
            /* else if (oEvent.getParameter("key") === "AccountsReceivable") {
                            this._getAccReceivablePopover().openBy(oEvent.getSource());
                        }*/
        },
        //------------------------------------------------------------------
        // On Personalization Press methods
        //------------------------------------------------------------------
        onPersonalizePayment: function() {
            this._oTablePaymentsPersoController.openDialog();
        },
        onPersonalizeClaims: function() {
            this._oTableClaimsPersoController.openDialog();
        },
        onPersonalizeUnpaidItems: function() {
            this._oTableUnpaidPersoController.openDialog();
        },
        onPersonalizeReturns: function() {
            this._oTableReturnsPersoController.openDialog();
        },
        onPersonalizeConsignments: function() {
            this._oTableConsignmentsPersoController.openDialog();
        },
        //------------------------------------------------------------------
        // On Upload finished methods
        //------------------------------------------------------------------
        onPaymentHistoryUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("PaymentHistoryItems", oEvent.getParameter("total"));
        },
        onRemmitanceDetailUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("RemmitanceItems", oEvent.getParameter("total"));
        },
        onInvoicesUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("InvoiceItems", oEvent.getParameter("total"));
        },
        onReceivingsUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("ReceivingItems", oEvent.getParameter("total"));
        },
        onInprocessUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("InProcessItems", oEvent.getParameter("total"));
        },
        onEdiRejectionsUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("EdiRejectionItems", oEvent.getParameter("total"));
        },
        onUnpaidItemsUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("UnpaidItems", oEvent.getParameter("total"));
        },
        onPaymentForecastUpdateFinished: function(oEvent) {
            this._setFilterModelProperty("PaymentForeCastItems", oEvent.getParameter("total"));
        },
        onReturnsUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("ReturnsItems", oEvent.getParameter("total"));
        },
        onClaimsUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("ClaimItems", oEvent.getParameter("total"));
        },
        onConsignmentsUpdateFinished: function(oEvent) {
            this._setCommonModelProperty("ConsignmentItems", oEvent.getParameter("total"));
        },
        //------------------------------------------------------------------
        // On Sort Press methods
        //------------------------------------------------------------------

        /**
         * Event handler for sort button on Invoice table
         * @param {object} oEvent Press event of sort button
         * @public
         */
        onSortInvoice: function(oEvent) {
            this._getSortDialog("PendingItems", "InvoicesSort").open();
        },
        onSortReceivings: function(oEvent) {
            this._getSortDialog("PendingItems", "ReceivingsSort").open();
        },
        onSortInProcess: function(oEvent) {
            this._getSortDialog("PendingItems", "InProcessSort").open();
        },
        onSortEdiRejection: function(oEvent) {
            this._getSortDialog("PendingItems", "EdiRejectionItemsSort").open();
        },
        onSortClaims: function(oEvent) {
            this._getSortDialog("Claims", "ClaimsSort").open();
        },

        //------------------------------------------------------------------
        // On Filter Press methods
        //------------------------------------------------------------------

        /***********Payments Tab**************/
        onPaymentDatePickerChange: function() {
            this._setDateValueStateNone(this.PAYMENTS_TAB);
        },
        onRemmitanceDatePickerChange: function() {
            this._setDateValueStateNone(this.REMMITANCE_TAB);
        },
        onReceivingDatePickerChange: function() {
            this._setDateValueStateNone(this.RECEIVINGS_TAB);
        },
        onConsignmentDatePickerChange: function() {
            this._setDateValueStateNone(this.CONSIGNMENTS_TAB);
        },
        onClaimDatePickerChange: function() {
            this._setDateValueStateNone(this.CLAIMS_TAB);
        },

        //------------------------------------------------------------------
        // On Filter Press methods
        //------------------------------------------------------------------

        /***********Payments Tab**************/

        /**
         * This function is called when user changes the Address Type
         * @param  {Object} oEvent User Change Event
         */
        onPaymentSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPoInvoiceVisiblity(oItem, this.PAYMENTS_TAB);
        },
        onPaymentTypeChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setFromToDateVisiblity(oItem, this.PAYMENTS_TAB);
        },
        onPaymentsFilterSearchChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            this._setDateFromToVisiblity(sValue, this.PAYMENTS_TAB);
        },
        onPaymentFilterPress: function(oEvent) {
            var oTable = this._getTable(this.PAYMENTS_TAB),
                oBinding = oTable.getBinding("items"),
                aFilters;

            if (this._checkDateValidation(this.PAYMENTS_TAB)) {
                aFilters = this._getFilters(this.PAYMENTS_TAB, true, false, "InvoiceDate");
                //Applying filters on table binding
                oBinding.filter(aFilters);
            }

        },
        /**************** Remmitance Tab **************/
        onRemmitanceSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPaymentNoAndAmountVisiblity(oItem, this.REMMITANCE_TAB);
        },
        onRemmitanceTypeChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setFromToDateVisiblity(oItem, this.REMMITANCE_TAB);
        },
        onRemmitanceFilterSearchChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            this._setDateFromToVisiblity(sValue, this.REMMITANCE_TAB);
            if (sValue) {
                this._setViewModelProperty("RemmitanceTab/PaymentTypesVisible", false);
            } else {
                this._setViewModelProperty("RemmitanceTab/PaymentTypesVisible", true);
            }
            oEvent.getSource().setValueState(ValueState.None);

            if (sap.ui.getCore().byId("id_Remit_Filter_Amount").getVisible() && sValue) {
                if (this._isNumber(sValue)) {
                    oEvent.getSource().setValueState(ValueState.None);
                } else {
                    oEvent.getSource().setValueState(ValueState.Error);
                    oEvent.getSource().setValueStateText(this._getText("SEARCH_NUMBER_ERR"));
                }
            }
        },
        onRemmitanceFilterPress: function(oEvent) {
            var oTable = this._getTable(this.REMMITANCE_TAB),
                oBinding = oTable.getBinding("items"),
                sPaymentTypeKey = this._getFilterModelProperty("RemmitanceTab/PaymentTypeSelectedKey"),
                aFilters;
            if (this._checkDateValidation(this.REMMITANCE_TAB)) {
                aFilters = this._getFilters(this.REMMITANCE_TAB, false, true, "PaymentDate");
                if (sPaymentTypeKey && this._getViewModelProperty("RemmitanceTab/PaymentTypesVisible")) {
                    aFilters.push(this._createFilter("PaymentMethodCode", sPaymentTypeKey));
                }
                //Applying filters on table binding
                oBinding.filter(aFilters);
            }
        },
        /************** Pending Items Tab ********************/
        onPendingItemsSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPoInvoiceVisiblity(oItem, this.PENDING_ITEMS_TAB);
        },
        onPendingItemsFilterPress: function(oEvent) {
            var oTable = this._getTable(this.PENDING_ITEMS_TAB),
                oBinding = oTable.getBinding("items"),
                aFilters;

            aFilters = this._getFilters(this.PENDING_ITEMS_TAB, true, false, "InvoiceDate");
            //Applying filters on table binding
            oBinding.filter(aFilters);
        },
        /************** Receivings Items Tab ********************/
        onReceivingsItemsSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPoInvoiceVisiblity(oItem, this.PAYMENTS_TAB);
        },
        onReceivingFilterPress: function(oEvent) {
            var oTable = this._getTable(this.RECEIVINGS_TAB),
                oBinding = oTable.getBinding("items"),
                aFilters;

            aFilters = this._getFilters(this.RECEIVINGS_TAB, true, false, "InvoiceDate");
            //Applying filters on table binding
            oBinding.filter(aFilters);
        },
        /************** In Process Items Tab ********************/
        onInProcessItemsSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPoInvoiceVisiblity(oItem, this.IN_PROCESS_TAB);
        },
        onInProcessFilterPress: function(oEvent) {
            var oTable = this._getTable(this.IN_PROCESS_TAB),
                oBinding = oTable.getBinding("items"),
                aFilters;

            aFilters = this._getFilters(this.IN_PROCESS_TAB, true, false, "InvoiceDate");
            //Applying filters on table binding
            oBinding.filter(aFilters);
        },
        /************** EDI Rejections Items Tab ********************/
        onEdiPoInvoiceChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            this._setDateFromToVisiblity(sValue, this.EDI_REJECTIONS_TAB);
        },
        onEdiRejectionsItemsSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPoInvoiceVisiblity(oItem, this.EDI_REJECTIONS_TAB);
        },
        onEdiRejectionsFilterPress: function(oEvent) {
            var oTable = this._getTable(this.EDI_REJECTIONS_TAB),
                oBinding = oTable.getBinding("items"),
                aFilters;

            aFilters = this._getFilters(this.EDI_REJECTIONS_TAB, true, false, "InvoiceDate");
            //Applying filters on table binding
            oBinding.filter(aFilters);
        },
        /************** Unpaid Items Tab ********************/
        onUnPaidItemsSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPoInvoiceVisiblity(oItem, this.UNPAID_ITEMS_TAB);
        },
        onUnPaidFilterPress: function(oEvent) {
            var oTable = this._getTable(this.UNPAID_ITEMS_TAB),
                oBinding = oTable.getBinding("items"),
                aFilters;

            aFilters = this._getFilters(this.UNPAID_ITEMS_TAB, true, false, "InvoiceDate");
            //Applying filters on table binding
            oBinding.filter(aFilters);
        },
        /************** Return Items Tab ********************/
        onReturnSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setFromToDateVisiblity(oItem, this.RECEIVING_ITEMS_TAB);
        },
        onReturnTypeChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setRaDeductionInputVisiblity(oItem, this.RECEIVING_ITEMS_TAB);
        },
        onReturnItemsFilterSearchChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
        },
        onReturnItemsFilterPress: function(oEvent) {
            var oTable = this._getTable(this.RECEIVING_ITEMS_TAB),
                oBinding = oTable.getBinding("items"),
                aFilters = this.createBaseFilter(),
                sSelectedDateKey = this._getFilterModelProperty(this.RECEIVING_ITEMS_TAB + "/DateFilterSelectedKey"),
                sStartDate,
                sEndDate;

            if (this._getFilterModelProperty(this.RECEIVING_ITEMS_TAB + "/RaNumber") && this._getViewModelProperty(this.RECEIVING_ITEMS_TAB + "/RaVisible")) {
                aFilters.push(this._createFilter("ReturnAuthorizationNumber", this._getFilterModelProperty(this.RECEIVING_ITEMS_TAB + "/RaNumber")));
            } else if (this._getFilterModelProperty(this.RECEIVING_ITEMS_TAB + "/DeductionNumber") && this._getViewModelProperty(this.RECEIVING_ITEMS_TAB + "/DeductionVisible")) {
                aFilters.push(this._createFilter("DeductionNumber", this._getFilterModelProperty(this.RECEIVING_ITEMS_TAB + "/DeductionNumber")));
            }
            if (this._checkDateValidation(this.RECEIVING_ITEMS_TAB)) {

                if (sSelectedDateKey === this._getConfigProperty("DATE_KEY_CD")) {
                    sStartDate = this._getFilterModelProperty(this.RECEIVING_ITEMS_TAB + "/FromDate");
                    sEndDate = this._getFilterModelProperty(this.RECEIVING_ITEMS_TAB + "/ToDate");
                    aFilters.push(this._getApplicationFilter(sSelectedDateKey, "DateShipped", sStartDate, sEndDate));
                } else {
                    aFilters.push(this._getApplicationFilter(sSelectedDateKey, "DateShipped"));
                }

                //Applying filters on table binding
                oBinding.filter(aFilters);
            }
        },
        /************** Claims Tab ********************/
        onClaimSearchChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setFromToDateVisiblity(oItem, this.CLAIMS_TAB);
        },
        onClaimFilterTypeChange: function(oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem"),
                oItem = selectedItem.getText();

            this._setPoInvoiceVisiblity(oItem, this.CLAIMS_TAB);
        },
        onClaimFilterInputChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            this._setDateFromToVisiblity(sValue, this.CLAIMS_TAB);
        },
        onClaimFilterPress: function(oEvent) {
            var oTable = this._getTable(this.CLAIMS_TAB),
                oBinding = oTable.getBinding("items"),
                sSelectedStatusKey = this._getFilterModelProperty("ClaimsTab/ClaimStatusSelectedKey"),
                sSelectedTypeKey = this._getFilterModelProperty("ClaimsTab/ClaimTypeSelectedKey"),
                aFilters;
            if (this._checkDateValidation(this.CLAIMS_TAB)) {
                aFilters = this._getFilters(this.CLAIMS_TAB, true, false, "ClaimDate");

                if (sSelectedStatusKey) {
                    aFilters.push(this._createFilter("ClaimStatusCode", this._getFilterModelProperty("ClaimsTab/ClaimStatusSelectedKey")));
                }
                if (sSelectedTypeKey) {
                    aFilters.push(this._createFilter("ClaimType", this._getFilterModelProperty(sSelectedTypeKey)));
                }
                //Applying filters on table binding
                oBinding.filter(aFilters);
            }
        },
        /************** Claims Tab ********************/
        onConsignmentsFilterPress: function() {
            var sStartDate = this._getFilterModelProperty("ConsignmentsTab/FromDate"),
                oTable = this._getTable(this.CONSIGNMENTS_TAB),
                oBinding = oTable.getBinding("items"),
                sEndDate = this._getFilterModelProperty("ConsignmentsTab/ToDate"),
                aFilters = [];
            if (this._checkDateValidation(this.CONSIGNMENTS_TAB, true)) {
                aFilters.push(this.createBaseFilter());
                if (sStartDate && sEndDate) {
                    aFilters.push(new Filter({
                        filters: [
                            new Filter({ // Start Date
                                path: 'SalesDate',
                                operator: FilterOperator.GE,
                                value1: sStartDate
                            }),
                            new Filter({ // End Date
                                path: 'SalesDate',
                                operator: FilterOperator.LE,
                                value1: sEndDate
                            })
                        ],
                        and: true
                    }));
                }

                //Applying filters on table binding
                oBinding.filter(aFilters);
            }
        },
        /**
         * Clears the Filterbar values
         * @param {object} oEvent Search event
         * @public
         */
        onFilterClear: function(oEvent) {
            var oViewModel = this.getModel("viewData"),
                oFilterModel = this.getModel("filterData");

            oViewModel.setData(this._getInitialViewData());
            oFilterModel.setData(this._getInitialFilterData());
        },


        //------------------------------------------------------------------
        // Internal Methods
        //------------------------------------------------------------------

        /*
         * This function is called when controller pattern is matched and corresponding work item Data object is bind
         * @param - oEvent - when pattern matches
         */
        _onNavigationPatternMatched: function(oEvent) {

        },
        _setAboutViewData: function() {
            var oDataModel = this.getModel(),
                oCommonModel = this.getModel("commonData"),
                sVendorNumber = oCommonModel.getProperty("/VendorNo"),
                sCompany = oCommonModel.getProperty("/Company"),
                sPath = oDataModel.createKey("/AboutYouSet", {
                    VendorNo: sVendorNumber,
                    Company: sCompany
                });

            oDataModel.read(sPath, {
                success: function(oData, oResponse) {
                    this.getView().setModel(new JSONModel(oData), "aboutYou");
                }.bind(this),
                error: function(oError) {}.bind(this)
            });
        },
        /**
         * Function to setup view models
         * @private
         */
        _setupViewModel: function() {
            var oFilterModel = new JSONModel(this._getInitialFilterData());
            this.setModel(oFilterModel, "filterData");

            //Setting up View Model
            var oViewModel = new JSONModel(this._getInitialViewData());
            this.setModel(oViewModel, "viewData");

            //Setting up Vendor model
            var oCommonModel = new JSONModel(this._getInitialCommonData());
            this.setModel(oCommonModel, "commonData");

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
                HeaderTitle: "",
                PaymentHistoryItems: "",
                RemmitanceItems: "",
                InvoiceItems: "",
                ReceivingItems: "",
                InProcessItems: "",
                EdiRejectionItems: "",
                UnpaidItems: "",
                PaymentForeCastItems: "",
                ReturnsItems: "",
                ClaimItems: "",
                ConsignmentItems: ""
            };
        },
        /**
         * This function gets blank initial data
         *@return {object} returns object
         */
        _getInitialViewData: function() {
            return {
                PaymentsTab: {
                    PoNumber: ValueState.None,
                    InvoiceNumber: ValueState.None,
                    PoVisible: true,
                    InvoiceVisible: false,
                    DateVisible: false,
                    FromDateValueState: ValueState.None,
                    FromDateValueStateText: "",
                    EndDateValueState: ValueState.None,
                    EndDateValueStateText: ""
                },
                RemmitanceTab: {
                    PaymentNumber: ValueState.None,
                    PaymentAmount: ValueState.None,
                    PaymentNumberVisible: true,
                    PaymentAmountVisible: false,
                    PaymentTypesVisible: true,
                    DateVisible: false,
                    FromDateValueState: ValueState.None,
                    FromDateValueStateText: "",
                    EndDateValueState: ValueState.None,
                    EndDateValueStateText: ""
                },
                InvoicesTab: {
                    PoNumber: ValueState.None,
                    InvoiceNumber: ValueState.None,
                    PoVisible: true,
                    InvoiceVisible: false
                },
                ReceivingsTab: {
                    PoNumber: ValueState.None,
                    InvoiceNumber: ValueState.None,
                    PoVisible: true,
                    InvoiceVisible: false
                },
                InProcessTab: {
                    PoNumber: ValueState.None,
                    InvoiceNumber: ValueState.None,
                    PoVisible: true,
                    InvoiceVisible: false,
                },
                EdiRejectionsTab: {
                    PoNumber: ValueState.None,
                    InvoiceNumber: ValueState.None,
                    PoVisible: true,
                    InvoiceVisible: false,
                    DateFilterVisible: true
                },
                UnPaidItemsTab: {
                    PoNumber: ValueState.None,
                    InvoiceNumber: ValueState.None,
                    PoVisible: true,
                    InvoiceVisible: false,
                },
                ReceivingItemsTab: {
                    RaNumber: ValueState.None,
                    DeductionNumber: ValueState.None,
                    RaVisible: true,
                    DeductionVisible: false,
                    DateVisible: false,
                    FromDateValueState: ValueState.None,
                    FromDateValueStateText: "",
                    EndDateValueState: ValueState.None,
                    EndDateValueStateText: ""
                },
                ClaimsTab: {
                    PoNumber: ValueState.None,
                    InvoiceNumber: ValueState.None,
                    PoVisible: true,
                    InvoiceVisible: false,
                    DateVisible: false,
                    FromDateValueState: ValueState.None,
                    FromDateValueStateText: "",
                    EndDateValueState: ValueState.None,
                    EndDateValueStateText: ""
                },
                ConsignmentsTab: {
                    FromDateValueState: ValueState.None,
                    FromDateValueStateText: "",
                    EndDateValueState: ValueState.None,
                    EndDateValueStateText: ""
                }
            };
        },
        _getInitialFilterData: function() {
            return {
                PaymentsTab: {
                    TotalItems: "",
                    DateFilterSelectedKey: "90-d",
                    FilterSearchKey: "",
                    InvoiceNumber: "",
                    PurchaseOrder: "",
                    FromDate: "",
                    ToDate: ""
                },
                RemmitanceTab: {
                    TotalItems: "",
                    PaymentTypeSelectedKey: "",
                    DateFilterSelectedKey: "90-d",
                    FilterSearchKey: "",
                    PaymentNumber: "",
                    PaymentAmount: "",
                    FromDate: "",
                    ToDate: ""
                },
                InvoicesTab: {
                    TotalItems: "",
                    FilterSearchKey: "",
                    InvoiceNumber: "",
                    PurchaseOrder: ""
                },
                ReceivingsTab: {
                    TotalItems: "",
                    FilterSearchKey: "",
                    InvoiceNumber: "",
                    PurchaseOrder: ""
                },
                InProcessTab: {
                    TotalItems: "",
                    FilterSearchKey: "",
                    InvoiceNumber: "",
                    PurchaseOrder: ""
                },
                EdiRejectionsTab: {
                    TotalItems: "",
                    FilterSearchKey: "",
                    InvoiceNumber: "",
                    PurchaseOrder: ""
                },
                UnPaidItemsTab: {
                    TotalItems: "",
                    FilterSearchKey: "",
                    InvoiceNumber: "",
                    PurchaseOrder: ""
                },
                ReceivingItemsTab: {
                    TotalItems: "",
                    DateFilterSelectedKey: "30-d",
                    FilterSearchKey: "",
                    RaNumber: "",
                    DeductionNumber: "",
                    FromDate: "",
                    ToDate: ""
                },
                ClaimsTab: {
                    TotalItems: "",
                    DateFilterSelectedKey: "90-d",
                    ClaimStatusSelectedKey: "",
                    ClaimTypeSelectedKey: "",
                    FilterSearchKey: "",
                    InvoiceNumber: "",
                    PurchaseOrder: "",
                    FromDate: "",
                    ToDate: ""
                },
                ConsignmentsTab: {
                    TotalItems: "",
                    FromDate: "",
                    ToDate: ""
                }

            };
        },
        /**
         * This function returns config property
         * @param  {string} property Property Name
         * @return {object}          Property Value
         */
        _getConfigProperty: function(property) {
            return this._component.getConfigHandler().getConfigProperty(property);
        },
        _getTable: function(sValue) {
            if (sValue === this.PAYMENTS_TAB) {
                return sap.ui.getCore().byId("idPaymentHistoryTable");
            } else if (sValue === this.REMMITANCE_TAB) {
                return sap.ui.getCore().byId("idRemmitDetailTable");
            } else if (sValue === this.PENDING_ITEMS_TAB) {
                return sap.ui.getCore().byId("idInvoicesTable");
            } else if (sValue === this.RECEIVINGS_TAB) {
                return sap.ui.getCore().byId("idRecievingsTable");
            } else if (sValue === this.IN_PROCESS_TAB) {
                return sap.ui.getCore().byId("idInProgressTable");
            } else if (sValue === this.EDI_REJECTIONS_TAB) {
                return sap.ui.getCore().byId("idEdiRejectionTable");
            } else if (sValue === this.UNPAID_ITEMS_TAB) {
                return sap.ui.getCore().byId("idUnpaidItemsTable");
            } else if (sValue === this.PAYMENT_FORECAST_TAB) {
                return sap.ui.getCore().byId("idPaymentForecastTable");
            } else if (sValue === this.RECEIVING_ITEMS_TAB) {
                return this.byId("idReturnItemsTable");
            } else if (sValue === this.CLAIMS_TAB) {
                return this.byId("idClaimsTable");
            } else if (sValue === this.CONSIGNMENTS_TAB) {
                return this.byId("idConsignmentsTable");
            }
        },
        _getDateFromKey: function(key, endDate) {
            var keys = key.split('-');
            if (keys && keys.length == 2) {
                // add one day to start date because each date starts at 00:00:00
                if (keys[1] == 'd') {
                    return new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) - (Number(keys[0]) * this._getConfigProperty("MS_PER_DAY")) + this._getConfigProperty("MS_PER_DAY"));
                } else if (keys[1] == 'm') {
                    return new Date(Date.UTC(endDate.getFullYear() - ((Number(keys[0])) / 12), endDate.getMonth(), endDate.getDate()) + this._getConfigProperty("MS_PER_DAY"));
                }
            }
        },
        _getApplicationFilter: function(sKey, sPath, StartDate, EndDate) {
            var sStartDate,
                sEndDate,
                filter;
            if (sKey === this._getConfigProperty("DATE_KEY_CD")) {
                sStartDate = StartDate;
                sEndDate = EndDate;
            } else {
                sStartDate = this._getDateFromKey(sKey, this.getUTCDate());
                sEndDate = this.getUTCDate();
            }

            filter = new Filter({
                filters: [
                    new Filter({ // Start Date
                        path: sPath,
                        operator: FilterOperator.GE,
                        value1: sStartDate
                    }),
                    new Filter({ // End Date
                        path: sPath,
                        operator: FilterOperator.LE,
                        value1: sEndDate
                    })
                ],
                and: true
            });
            return filter;
        },
        _getFilterModelProperty: function(sPropertyName) {
            var oFilterModel = this.getModel("filterData");
            return oFilterModel.getProperty("/" + sPropertyName);
        },
        _setFilterModelProperty: function(sPropertyName, sValue) {
            var oFilterModel = this.getModel("filterData");
            return oFilterModel.setProperty("/" + sPropertyName, sValue);
        },
        _setCommonModelProperty: function(sPropertyName, sValue) {
            var oCommonModel = this.getModel("commonData");
            return oCommonModel.setProperty("/" + sPropertyName, sValue);
        },
        _getViewModelProperty: function(sPropertyName) {
            var oViewModel = this.getModel("viewData");
            return oViewModel.getProperty("/" + sPropertyName);
        },
        _setViewModelProperty: function(sPropertyName, sValue) {
            var oViewModel = this.getModel("viewData");
            return oViewModel.setProperty("/" + sPropertyName, sValue);
        },
        _createFilter: function(sName, sValue) {
            return new Filter({
                path: sName,
                operator: FilterOperator.EQ,
                value1: sValue
            });
        },
        _getText: function(sText) {
            return this.getResourceBundle().getText(sText);
        },
        _setDateFromToVisiblity: function(sValue, sPropertyName) {
            if (sValue) {
                this._setViewModelProperty(sPropertyName + "/DateFilterVisible", false);
                this._setViewModelProperty(sPropertyName + "/DateVisible", false);
            } else {
                if (this._getFilterModelProperty(sPropertyName + "/DateFilterSelectedKey") === this._getConfigProperty("DATE_KEY_CD")) {
                    this._setViewModelProperty(sPropertyName + "/DateVisible", true);
                }
                this._setViewModelProperty(sPropertyName + "/DateFilterVisible", true);
            }
        },
        _setPoInvoiceVisiblity: function(oItem, sPropertyName) {
            if (oItem === this._getText("FILTER_SEARCH_PO_DESC")) {
                this._setViewModelProperty(sPropertyName + "/PoVisible", true);
                this._setViewModelProperty(sPropertyName + "/InvoiceVisible", false);
            } else {
                this._setViewModelProperty(sPropertyName + "/InvoiceVisible", true);
                this._setViewModelProperty(sPropertyName + "/PoVisible", false);
            }
        },
        _setRaDeductionInputVisiblity: function(oItem, sPropertyName) {
            if (oItem === this._getText("RA_NUM_500")) {
                this._setViewModelProperty(sPropertyName + "/RaVisible", true);
                this._setViewModelProperty(sPropertyName + "/DeductionVisible", false);
            } else {
                this._setViewModelProperty(sPropertyName + "/DeductionVisible", true);
                this._setViewModelProperty(sPropertyName + "/RaVisible", false);
            }
        },
        _setPaymentNoAndAmountVisiblity: function(oItem, sPropertyName) {
            if (oItem === this._getText("FILTER_SEARCH_PAYMENTNO_DESC")) {
                this._setViewModelProperty(sPropertyName + "/PaymentNumberVisible", true);
                this._setViewModelProperty(sPropertyName + "/PaymentAmountVisible", false);
            } else {
                this._setViewModelProperty(sPropertyName + "/PaymentAmountVisible", true);
                this._setViewModelProperty(sPropertyName + "/PaymentNumberVisible", false);
            }
        },
        _setFromToDateVisiblity: function(oItem, sPropertyName) {
            if (oItem === this._getText("FILTER_BAR_DATEP_CUSTOM")) {
                this._setViewModelProperty(sPropertyName + "/DateVisible", true);
            } else {
                this._setViewModelProperty(sPropertyName + "/DateVisible", false);
            }
        },
        _getFilters: function(sProperty, sPoRequired, sPaymentRequired, sPath) {
            var aFilters = [],
                sStartDate,
                sEndDate,
                sSelectedDateKey = this._getFilterModelProperty(sProperty + "/DateFilterSelectedKey");

            aFilters = this.createBaseFilter();

            if (sPoRequired && this._getFilterModelProperty(sProperty + "/PurchaseOrder") && this._getViewModelProperty(sProperty + "/PoVisible")) {
                aFilters.push(this._createFilter("PoNumber", this._getFilterModelProperty(sProperty + "/PurchaseOrder")));
            } else if (sPoRequired && this._getFilterModelProperty(sProperty + "/InvoiceNumber") && this._getViewModelProperty(sProperty + "/InvoiceVisible")) {
                aFilters.push(this._createFilter("InvoiceNumber", this._getFilterModelProperty(sProperty + "/InvoiceNumber")));
            } else if (sPaymentRequired && this._getFilterModelProperty(sProperty + "/PaymentNumber") && this._getViewModelProperty(sProperty + "/PaymentNumberVisible")) {
                aFilters.push(this._createFilter("PaymentNumber", this._getFilterModelProperty(sProperty + "/PaymentNumber")));
            } else if (sPaymentRequired && this._getFilterModelProperty(sProperty + "/PaymentAmount") && this._getViewModelProperty(sProperty + "/PaymentAmountVisible")) {
                aFilters.push(this._createFilter("PaymentAmount", this._getFilterModelProperty(sProperty + "/PaymentAmount")));
            } else {
                if (sSelectedDateKey === this._getConfigProperty("DATE_KEY_CD")) {
                    sStartDate = this._getFilterModelProperty(sProperty + "/FromDate");
                    sEndDate = this._getFilterModelProperty(sProperty + "/ToDate");
                    aFilters.push(this._getApplicationFilter(sSelectedDateKey, sPath, sStartDate, sEndDate));
                } else {
                    aFilters.push(this._getApplicationFilter(sSelectedDateKey, sPath));
                }
            }
            return aFilters;
        },
        _bindItemsAggregation: function(sTableTxt, sEntitySet, sFolderName, sFragmentName) {
            this._getTable(sTableTxt).bindAggregation("items", {
                path: sEntitySet,
                template: sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment." + sFolderName + "." + sFragmentName, this),
                filters: this.createBaseFilter()
            });
        },
        _setHeaderTitle: function(sText) {
            var oCommonModel = this.getModel("commonData"),
                oFormattedText = jQuery.sap.formatMessage("{0} － {1}", this._getText("HEADER_TITLE"), this._getText(sText));

            oCommonModel.setProperty("/HeaderTitle", oFormattedText);
        },
        _getSegmentButton: function(sButtonId) {
            return this.byId(sButtonId);
        },
        _getVendorChangeValueHelp: function() {
            if (!this._vendorChangeValueHelpDialog) {
                this._vendorChangeValueHelpDialog = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.VendorChangeValueHelpDialog", this);
                this.getView().addDependent(this._vendorChangeValueHelpDialog);
            }
            return this._vendorChangeValueHelpDialog;
        },
        _getAccReceivablePopover: function() {
            if (!this._accReceivablePopover) {
                this._accReceivablePopover = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.AccountReceivable", this);
                this.getView().addDependent(this._accReceivablePopover);
            }
            return this._accReceivablePopover;
        },
        _setDefaultIconTab: function() {
            var sIconTab = this.byId("id_Icon_Tab_Bar");
            if (!(sIconTab.getSelectedKey() === "AboutYou")) {
                sIconTab.setSelectedKey("AboutYou");
            }
        },
        /**
         * Function to get if input value is a number or not
         * @param  {String}  sValue value
         * @return {Boolean}        True if input value is a number, otherwise false
         * @private
         */
        _isNumber: function(sValue) {
            var regexp = /^[0-9]+$/;
            return regexp.test(sValue);
        },
        /**
         * Getter function for sort dialog of  table
         * @returns {sap.m.Dialog} Sort Dialog
         * @private 
         */
        _getSortDialog: function(sFolderName, sFragmentName) {
            // if (!this._oSortDialog) {
            this._oSortDialog = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment." + sFolderName + "." + sFragmentName, this);
            this.getView().addDependent(this._oSortDialog);
            // }
            return this._oSortDialog;
        },
        /**
         * Function to sort the  table
         * @param {object} oEvent Sort event
         * @public
         */
        onSortConfirm: function(oEvent) {
            var mParams = oEvent.getParameters(),
                sSortKey = mParams.sortItem.getKey(),
                oTable = this._getTable(sSortKey.split('-')[0]),
                oBinding = oTable.getBinding("items"),
                aSorters,
                sPath,
                bDescending;

            //Creating the sorter array
            aSorters = [];
            sPath = sSortKey.split('-')[1];
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));

            //applying the sorting
            oBinding.sort(aSorters);
        },
        /**
         * Function to setup Supplier Table personalization
         * @private
         */
        _setUpTblPers: function(sText) {
            var oPersonalizationService = sap.ushell.Container.getService("Personalization"),
                oScope,
                oPersonalizer,
                oComponent = this.getOwnerComponent(),
                oPersId;

            oPersId = {
                container: "sap.cdp.demo.demoApplication5.prsnliz",
                item: "Tble"
            };

            oScope = {
                keyCategory: oPersonalizationService.constants.keyCategory.FIXED_KEY,
                writeFrequency: oPersonalizationService.constants.writeFrequency.LOW,
                clientStorageAllowed: true
            };

            oPersonalizer = oPersonalizationService.getPersonalizer(oPersId, oScope, oComponent);
            if (sText === this.PAYMENTS_TAB) {
                this._oTablePaymentsPersoController = new TablePersoController({
                    table: this._getTable(sText),
                    persoService: oPersonalizer
                });
                this._oTablePaymentsPersoController.activate();
            } else if (sText === this.CLAIMS_TAB) {
                this._oTableClaimsPersoController = new TablePersoController({
                    table: this._getTable(sText),
                    persoService: oPersonalizer
                });
                this._oTableClaimsPersoController.activate();
            } else if (sText === this.UNPAID_ITEMS_TAB) {
                this._oTableUnpaidPersoController = new TablePersoController({
                    table: this._getTable(sText),
                    persoService: oPersonalizer
                });
                this._oTableUnpaidPersoController.activate();
            } else if (sText === this.RECEIVING_ITEMS_TAB) {
                this._oTableReturnsPersoController = new TablePersoController({
                    table: this._getTable(sText),
                    persoService: oPersonalizer
                });
                this._oTableReturnsPersoController.activate();
            } else if (sText === this.CONSIGNMENTS_TAB) {
                this._oTableConsignmentsPersoController = new TablePersoController({
                    table: this._getTable(sText),
                    persoService: oPersonalizer
                });
                this._oTableConsignmentsPersoController.activate();
            }

        },
        _setInitialFragments: function() {
            var oLayout = this.byId("id_Vertical_Layout"),
                oView = this.getView(),
                oFragment;
            oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.Payments.PaymentHistory",
                this);
            for (var i = 0; i < oFragment.length; i++) {
                oLayout.addContent(oFragment[i]);
            }

            var oPendingtemsLayout = this.byId("id_Pending_Items_Layout"),
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.PendingItems.Invoices",
                    this);
            for (var i = 0; i < oFragment.length; i++) {
                oPendingtemsLayout.addContent(oFragment[i]);
            }

            var oUnpaidItemsLayout = this.byId("id_Unpaid_Items_Layout"),
                oFragment = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.UnpaidItems.UnpaidItems",
                    this);
            for (var i = 0; i < oFragment.length; i++) {
                oUnpaidItemsLayout.addContent(oFragment[i]);
            }
        },
        _checkDateValidation: function(sTab, bConsignments) {
            var bDateVisible = this._getViewModelProperty(sTab + "/DateVisible"),
                bValid = true;
            if (bConsignments) {
                bDateVisible = true;
            }
            if (bDateVisible) {
                var sStartDate,
                    sEndDate,
                    sText,
                    bValid = true,
                    sminDate = new Date(new Date().getFullYear() - 7, 0, 1), // last 7 years, including this year     
                    smaxDate = new Date(new Date().getFullYear(), 11, 31);

                if (this._getFilterModelProperty(sTab + "/FromDate")) {
                    sStartDate = new Date(this._getFilterModelProperty(sTab + "/FromDate"));
                }
                if (this._getFilterModelProperty(sTab + "/ToDate")) {
                    sEndDate = new Date(this._getFilterModelProperty(sTab + "/ToDate"));
                }
                if (!sStartDate || !sEndDate) {
                    if (!sStartDate) {
                        sText = this._getText("FILTER_INVALID_START_DATE");
                        this._setViewModelProperty(sTab + "/FromDateValueState", ValueState.Error);
                        this._setViewModelProperty(sTab + "/FromDateValueStateText", sText);
                    } else {
                        sText = this._getText("FILTER_INVALID_END_DATE");
                        this._setViewModelProperty(sTab + "/EndDateValueState", ValueState.Error);
                        this._setViewModelProperty(sTab + "/EndDateValueStateText", sText);
                    }
                    bValid = false;
                } else if (sEndDate.getTime() < sStartDate.getTime()) {
                    sText = this._getText("FILTER_INVALID_END_DATE2_DESC");
                    this._setViewModelProperty(sTab + "/EndDateValueState", ValueState.Error);
                    this._setViewModelProperty(sTab + "/EndDateValueStateText", sText);
                    bValid = false;

                } else if (sStartDate.getTime() > sEndDate.getTime()) {
                    sText = this._getText("FILTER_INVALID_START_DATE2_DESC");
                    this._setViewModelProperty(sTab + "/FromDateValueState", ValueState.Error);
                    this._setViewModelProperty(sTab + "/FromDateValueStateText", sText);
                    bValid = false;

                } else if (sStartDate.getTime() < (new Date(new Date(sEndDate.getFullYear() - 1, sEndDate.getMonth(), sEndDate.getDate())).getTime() + this.MS_PER_DAY)) {
                    sText = this._getText("FILTER_INVALID_DATE_RANGE_DESC");
                    this._setViewModelProperty(sTab + "/FromDateValueState", ValueState.Error);
                    this._setViewModelProperty(sTab + "/EndDateValueState", ValueState.Error);
                    this._setViewModelProperty(sTab + "/FromDateValueStateText", sText);
                    this._setViewModelProperty(sTab + "/EndDateValueStateText", sText);
                    bValid = false;
                } else if ((sStartDate.getTime() < sminDate.getTime()) || (sEndDate.getTime() > smaxDate.getTime())) {
                    if (sStartDate.getTime() < sminDate.getTime()) {
                        sText = this._getText("FILTER_INVALID_START_DATE_DESC");
                        this._setViewModelProperty(sTab + "/FromDateValueState", ValueState.Error);
                        this._setViewModelProperty(sTab + "/FromDateValueStateText", sText);
                    } else {
                        sText = this._getText("FILTER_INVALID_END_DATE_DESC");
                        this._setViewModelProperty(sTab + "/EndDateValueState", ValueState.Error);
                        this._setViewModelProperty(sTab + "/EndDateValueStateText", sText);
                    }
                    bValid = false;
                } else if (bConsignments) {
                    this._checkConsignmentDates();

                }
            }
            return bValid;
        },
        _setDateValueStateNone: function(sTab) {
            this._setViewModelProperty(sTab + "/FromDateValueState", ValueState.None);
            this._setViewModelProperty(sTab + "/EndDateValueState", ValueState.None);
        },
        _checkConsignmentDates: function() {
            var bValid = true,
                sText,
                sStartDate = new Date(this._getFilterModelProperty("ConsignmentsTab/FromDate")),
                sEndDate = new Date(this._getFilterModelProperty("ConsignmentsTab/ToDate"));;
            if ((sEndDate - sStartDate) / 864E5 > 7) {
                sText = this._getText("DURATION_MORE_THAN_7");
                this._setViewModelProperty("ConsignmentsTab/FromDateValueState", ValueState.Error);
                this._setViewModelProperty("ConsignmentsTab/EndDateValueState", ValueState.Error);
                this._setViewModelProperty("ConsignmentsTab/FromDateValueStateText", sText);
                this._setViewModelProperty("ConsignmentsTab/EndDateValueStateText", sText);
                bValid = false;
            }
            return bValid;
        },
        _getTrackingUrl: function(trackingNum) {
            var key = null;
            if (trackingNum != null && trackingNum != undefined && trackingNum.indexOf('1Z') == 0)
                key = 'UPS';

            if (key == null)
                return '';

            // var url = app.config.url._500.trackingLinkMap[key];
            var url = jQuery.sap.formatMessage(this.TRACK_URL, trackingNum);
            return url;
        },
        _createPdfDownloadUri : function(context) {
            var oModel = this.getModel();
            return "/" + oModel.sServiceUrl + "ViewPdfSet(ViewKey='" + context.ViewKey + "')" + "/$value?$filter=VendorNo eq '" + context.VendorNo + "' and Company eq '" + context.Company + "'";
        }

    });
});
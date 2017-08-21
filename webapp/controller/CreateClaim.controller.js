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

    return BaseController.extend("sap.cdp.demo.demoApplication5.controller.CreateClaim", {
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


        //------------------------------------------------------------------
        // Lifecycle methods
        //------------------------------------------------------------------

        /**
         * Called when the TaskList controller is instantiated.
         * @public
         */
        onInit: function() {
            this._setViewModels();

            this.getRouter().getRoute("createClaim").attachPatternMatched(this._onNavigationPatternMatched, this);
        },
        onClaimTypeChange: function(oEvent) {
            var sKey = oEvent.getSource().getSelectedKey(),
                sItems = this.getModel("claimTypes").getData(),
                sSelectedItem;

            sSelectedItem = sItems.claimTypes.filter(function(oItem) {
                if (oItem.ClaimType === sKey) {
                    return oItem;
                }
            });

            this.getModel("claimTypes").setProperty("/claimType", sSelectedItem[0]);
        },
        //------------------------------------------------------------------
        // Event handlers
        //------------------------------------------------------------------
        onAfterRendering: function() {

            this._getClaimTypes();

        },
        onEmailChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            if (!sValue) {
                this._setClaimInputNoneState("Email");
                this._setDirtyFlagProperty(false);
                return;
            }
            this._setDirtyFlagProperty(true);
            if (!this.isValidEmail(sValue)) {
                this._setClaimInputErrorState("Email", "CREATE_INVALID_EMAIL");
            } else {
                this._setClaimInputNoneState("Email");
            }
        },
        onClaimAmountChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            if (!sValue) {
                this._setClaimInputNoneState("ClaimAmount");
                this._setDirtyFlagProperty(false);
                return;
            }
            this._setDirtyFlagProperty(true);
            if (!this.isNumber(sValue)) {
                this._setClaimInputErrorState("ClaimAmount", "CREATE_INVALID_DECIMAL");
            } else {
                this._setClaimInputNoneState("ClaimAmount");
            }
        },
        onPhoneNumberChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            if (!sValue) {
                this._setClaimInputNoneState("Phone");
                this._setDirtyFlagProperty(false);
                return;
            }
            this._setDirtyFlagProperty(true);
            if (!this.isValidPhone(sValue)) {
                this._setClaimInputErrorState("Phone", "CREATE_INVALID_PHONE");
            } else {
                this._setClaimInputNoneState("Phone");
            }
        },
        onInputChange: function(oEvent) {
            var sValue = oEvent.getSource().getValue();
            oEvent.getSource().setValueState(ValueState.None);

            if (sValue) {
                this._setDirtyFlagProperty(true);
            } else {
                this._setDirtyFlagProperty(false);
            }

        },
        onClaimSubmitPress: function() {
            if (this._checkFieldsValidation()) {
                this.getConfirmationBox(this._getText("CONFIRM_SUBMIT_MSG"), this._submitClaimReq.bind(this), this);
            } else {
                MessageBox.error(this._getText("VALIDATION_ERR_MSG"));
            }
        },
        onClaimCancelPress: function() {
            var bDirtyFlag = this.getModel("claimData").getProperty("/dirtyFlag");
            if (bDirtyFlag) {
                this.getConfirmationBox(this._getText("DATA_LOSS_CONFIRM"), this._cancelClaimReq.bind(this), this);
            } else {
                this._navigationBack();
            }
        },
        onFileChange: function(oEvent) {
            var sItems = oEvent.getParameter('files').length;
            this.getModel("claimData").setProperty("/AttachmentMsgState", "Information");
        },
        //------------------------------------------------------------------
        // Internal Methods
        //------------------------------------------------------------------
        _onNavigationPatternMatched: function(oEvent) {
            var oClaimDataModel = this.getModel("claimData");

            oClaimDataModel.setProperty("/Company", oEvent.getParameters().arguments.Company);
            oClaimDataModel.setProperty("/VendorNo", oEvent.getParameters().arguments.VendorNo);
        },
        _setViewModels: function() {
            this.getView().setModel(new JSONModel(this._getInitialClaimTypeData()), "claimTypes");
            this.getView().setModel(new JSONModel(this._getClaimData()), "claimData");
        },
        _getClaimTypes: function() {
            var oDataModel = this.getModel();
            // sPath = oDataModel.createKey("/ClaimsConfigSet", {});

            oDataModel.read("/ClaimsConfigSet", {
                success: function(oData, oResponse) {
                    this.getModel("claimTypes").setProperty("/claimTypes", oData.results);
                    this.getModel("claimTypes").setProperty("/claimType", oData.results[0]);
                }.bind(this),
                error: function(oError) {}.bind(this)
            });
        },
        _getText: function(sText) {
            return this.getResourceBundle().getText(sText);
        },
        _submitClaimReq: function() {
            var oPayload = this._getClaimPayload(),
                oParams = {
                    success: this._onCreateClaimSuccess.bind(this),
                    error: this._onCreateClaimError.bind(this)
                };
            this.getModel().create("/ClaimSubmitSet", oPayload, oParams);
        },
        _onCreateClaimSuccess: function(oResultData) {
            // To-Do Replace ClaimGuid with ClaimNo from oResultData it is not getting generate now
            var sMsg = jQuery.sap.formatMessage("{0} {1} {2}", [this._getText("CLAIM_RESULT_NUMBER"), oResultData.ClaimGuid, this._getText("CLAIM_RESULT_SUCCESS_MSG")]);
            MessageBox.success(sMsg);
            this.getModel("claimTypes").setProperty("/claimType", this._getInitialClaimTypeData());
            this.getModel("claimData").setProperty("/", this._getClaimData());
            this.byId("UploadCollection").removeAllItems();
            this.byId("idComboBoxClaimType").fireChange(this.byId("idComboBoxClaimType").getSelectedItem());
        },
        _onCreateClaimError: function(oEvent) {},
        _cancelClaimReq: function() {
            this._navigationBack();
        },
        /**
         * To navigate Back
         * @private
         */
        _navigationBack: function() {
            var oHistory = sap.ui.core.routing.History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                // The history contains a previous entry
                history.go(-1);
            } else {
                // Navigate back to FLP home
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: "#"
                    }
                });
            }
        },
        _getClaimData: function() {
            return {
                dirtyFlag: "",
                Company: "",
                VendorNo: "",
                SelectedClaimType: "",
                AttachmentMsgState: "Information",
                FirstName: "",
                LastName: "",
                Email: "",
                EmailValueState: ValueState.None,
                EmailValueStateText: "",
                Phone: "",
                PhoneValueState: ValueState.None,
                PhoneValueStateText: "",
                ClaimType: "",
                ClaimAmount: "",
                ClaimAmountValueState: ValueState.None,
                ClaimAmountValueStateText: "",
                InvoiceNumber: "",
                InvoiceNumberValueState: ValueState.None,
                InvoiceNumberValueStateText: "",
                PoNumber: "",
                PoNumberValueState: ValueState.None,
                PoNumberValueStateText: "",
                ClaimNotes: "",
                ClaimTypeValueState: ValueState.None,
                ClaimTypeValueState: ""

            }
        },
        _setDirtyFlagProperty: function(bValue) {
            this.getModel("claimData").setProperty("/dirtyFlag", bValue);
        },
        _checkFieldsValidation: function() {
            var bValid = true,

                claimModel = this.getModel("claimTypes"),
                claimDataModel = this.getModel("claimData"),
                sEmail = claimDataModel.getProperty("/Email"),
                iClaimAmount = claimDataModel.getProperty("/ClaimAmount"),
                sInvoiceNo = claimDataModel.getProperty("/InvoiceNumber"),
                sPoNo = claimDataModel.getProperty("/PoNumber"),
                sExplanation = claimDataModel.getProperty("/ClaimNotes"),
                sClaimAmount = claimDataModel.getProperty("/ClaimAmount"),
                sPhone = claimDataModel.getProperty("/Phone"),

                bEmail = claimModel.getProperty("/claimType/Email") === "R",
                bClaimAmount = claimModel.getProperty("/claimType/ClaimAmount") === "R",
                bInvoiceNo = claimModel.getProperty("/claimType/InvoiceNumber") === "R",
                bPoNo = claimModel.getProperty("/claimType/PoNumber") === "R",
                bExplanation = claimModel.getProperty("/claimType/ClaimNotes") === "R";

            if (bEmail && !sEmail) {
                bValid = false;
                this._setClaimInputErrorState("Email", "EMAIL_MANDATORY");
            }
            if (bClaimAmount && !iClaimAmount) {
                bValid = false;
                this._setClaimInputErrorState("ClaimAmount", "CLAIM_AMT_MANDT");
            }
            if (bInvoiceNo && !sInvoiceNo) {
                bValid = false;
                this._setClaimInputErrorState("InvoiceNumber", "INVOICE_NO_MANDT");
            }
            if (bPoNo && !sPoNo) {
                bValid = false;
                this._setClaimInputErrorState("PoNumber", "PO_NO_MANDT");
            }
            if (bExplanation && !sExplanation) {
                bValid = false;
                this._setClaimInputErrorState("ClaimNotes", "CLAIM_NOTES_MANDT");
            }
            if (sEmail && !this.isValidEmail(sEmail)) {
                bValid = false;
            }
            if (sClaimAmount && !this.isNumber(sClaimAmount)) {
                bValid = false;
            }
            if (sPhone && !this.isValidPhone(sPhone)) {
                bValid = false;
            }
            if (!this._validateAttachments()) {
                bValid = false;
            }

            return bValid;

        },
        _getClaimPayload: function() {
            var claimModel = this.getModel("claimTypes"),
                claimDataModel = this.getModel("claimData");

            return {
                Company: claimDataModel.getProperty("/Company"),
                VendorNo: claimDataModel.getProperty("/VendorNo"),
                FirstName: claimDataModel.getProperty("/FirstName"),
                LastName: claimDataModel.getProperty("/LastName"),
                Email: claimDataModel.getProperty("/Email"),
                Phone: claimDataModel.getProperty("/Phone"),
                ClaimType: claimDataModel.getProperty("/ClaimType"),
                ClaimAmount: claimDataModel.getProperty("/ClaimAmount"),
                InvoiceNumber: claimDataModel.getProperty("/InvoiceNumber"),
                PoNumber: claimDataModel.getProperty("/PoNumber"),
                ClaimNotes: claimDataModel.getProperty("/ClaimNotes"),
                ClaimType: claimModel.getProperty("/claimType/ClaimType"),
                ClaimCurrency: "USD", //To-Do check from whr to get this currency

            }
        },
        _validateAttachments: function() {
            var claimModel = this.getModel("claimTypes"),
                claimDataModel = this.getModel("claimData"),
                sItems = this.byId("UploadCollection").getItems().length,
                iReqItems,
                bValid = true,

                bFile1 = claimModel.getProperty("/claimType/File1") === "R",
                bFile2 = claimModel.getProperty("/claimType/File2") === "R";

            if (bFile1 && bFile2) {
                iReqItems = 2;
            } else if (bFile1 || bFile2) {
                iReqItems = 1;
            } else {
                iReqItems = 0;
            }

            if (sItems >= iReqItems) {
                bValid = true;
            } else {
                claimDataModel.setProperty("/AttachmentMsgState", "Error");
                bValid = false;
            }
            return bValid;

        },
        _setClaimInputErrorState: function(sPath, sText) {
            var oClaimDataModel = this.getModel("claimData");

            oClaimDataModel.setProperty("/" + sPath + "ValueState", ValueState.Error);
            oClaimDataModel.setProperty("/" + sPath + "ValueStateText", this._getText(sText));
        },
        _setClaimInputNoneState: function(sPath) {
            var oClaimDataModel = this.getModel("claimData");

            oClaimDataModel.setProperty("/" + sPath + "ValueState", ValueState.None);
        },
        _getInitialClaimTypeData: function() {
            return {
                claimType: {
                    ClaimAmount: "D",
                    ClaimAmountHolder: "",
                    ClaimDescription: "",
                    ClaimNotes: "D",
                    ClaimNotesHolder: "",
                    ClaimType: "",
                    ClaimTypeVersion: "",
                    Email: "",
                    EmailHolder: "",
                    ExpContent: "",
                    ExpNote: "",
                    File1: "",
                    File1Label: "",
                    File2: "",
                    File2Label: "",
                    File3: "",
                    File3Label: "",
                    FileOthers: "",
                    FileOthersHolder: "",
                    FilesRequired: "",
                    FirstName: "",
                    FisrtNameHolder: "",
                    InvoiceNumber: "D",
                    InvoiceNumberHolder: "",
                    LastName: "",
                    LastNameHolder: "",
                    Phone: "",
                    PhoneHolder: "",
                    PoNumber: "D",
                    PoNumberHolder: ""
                }
            }
        }
    });
});

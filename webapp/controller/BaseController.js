sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat"
], function(Controller, MessageBox, History, Filter, FilterOperator, DateFormat) {
    "use strict";

    return Controller.extend("sap.cdp.demo.demoApplication5.controller.BaseController", {

        /**
         * Convenience method for access the current router
         * @public
         * @return {sap.ui.core.routing.Router} router for this component
         */
        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        createBaseFilter: function() {
            var sVendor = this.getModel("commonData").getProperty("/VendorNo");
            var sCompany = this.getModel("commonData").getProperty("/Company");
            var filters = [
                // company
                new Filter({
                    path: 'Company',
                    operator: FilterOperator.EQ,
                    value1: sCompany
                }),
                // vendor no
                new Filter({
                    path: 'VendorNo',
                    operator: FilterOperator.EQ,
                    value1: sVendor
                })
            ];
            return filters;
        },
        getUTCDate: function(date) {
            if (date) {
                return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            } else {
                var date = new Date();
                return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            }
        },

        /**
         * Convenience method for getting today's date without time.
         * @public
         * @return {date} Current date
         */
        getTodayDate: function() {
            var d = new Date();
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * 
         * This function provide the Configuration value for a given property
         * @public
         * @params - oProperty
         * @returns - Configuration value
         */
        getConfigurationValue: function(oProperty) {
            return this.getOwnerComponent().getConfiguration().getProperty(oProperty);
        },

        /**
         * Generic utility method to use error message method of component
         * @param  {string} sTitle       Title
         * @param  {string} sMessage     Error message
         * @param  {string} sDescription Description text for error
         */
        showError: function(sTitle, sMessage, sDescription) {
            this.getOwnerComponent().displayErrorMessage(sTitle, sMessage, sDescription);
        },

        /**
         * This function send a request to load all the collections
         * @param  {[type]} collections [description]
         * @return {[type]}             [description]
         */
        loadCollections: function(collections) {
            return this.getOwnerComponent().loadConfigCollections(collections);
        },

        /**
         * Default event for back navigation for each controller. 
         * This method will be overriden by most controllers
         * @param  {event} oEvent Button press event
         */
        onNavBack: function(oEvent) {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                // The history contains a previous entry
                history.go(-1);
            } else {
                // Otherwise we go backwards with a forward history
                var bReplace = true;
                this.getRouter().navTo("taskList", {}, bReplace);
            }
        },
        /**
         * Function to get if input value is a number or not
         * @param  {String}  sValue value
         * @return {Boolean}        True if input value is a number, otherwise false
         * @private
         */
        isNumber: function(sValue) {
            var regexp = /^[0-9]+$/;
            return regexp.test(sValue);
        },

        /**
         * Function to validate the mail
         * @param  {string}  str mail string to validate
         * @return {Boolean}     is mail is validated or not
         */
        isValidEmail: function(str) {
            if (str) {
                var re = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
                return re.test(str);
            }
        },
        /**
         * Function to validate the phone number
         * @param  {string}  str phone number
         * @return {Boolean}     is Phone number is validated or not
         */
        isValidPhone: function(str) {
            if (str) {
                var re = new RegExp(/^((\+)?[1-9](\d{1,3})?)?([0-9]\d\d[0-9]\d{6})(x(\d{1,5}))?$/);
                return re.test(str);
            }
        },
        /**
         * This function is called to get the confirmation popup
         * @param  {string} sMsg      Message
         * @param  {function} fCallback Function Callback
         */
        getConfirmationBox: function(sMsg, fCallback, oContext) {
            MessageBox.confirm(sMsg, function(result) {
                if (result === MessageBox.Action.OK && (fCallback instanceof Function)) {
                    fCallback.call(oContext);
                }
            });
        }
    });

});
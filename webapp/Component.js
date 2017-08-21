sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/cdp/demo/demoApplication5/model/models",
    "sap/cdp/demo/demoApplication5/util/ErrorHandler",
    "sap/cdp/demo/demoApplication5/util/Configurations",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/odata/CountMode"
], function(UIComponent, Device, models, ErrorHandler, Configurations, JSONModel, MessageBox, CountMode) {
    "use strict";
    return UIComponent.extend("sap.cdp.demo.demoApplication5.Component", {

        metadata: {
            manifest: "json",
            config: {
                fullWidth: true
            }
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * In this function, the FLP and device models are set and the router is initialized.
         * @public
         * @override
         */
        init: function() {
            // initialize the config util
            this.initializeConfigUtil();

            // initialize the error handler with the component
            this.initializeErrorHandler();

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // create the views based on the url/hash
            this.getRouter().initialize();

            //Setting the InLine mode for retrieving the count of collections
            this.getModel().setDefaultCountMode(CountMode.Inline);
        },



        /**
         * Initializes the Reuse Error handler
         */
        initializeErrorHandler: function() {
            // initialize the error handler with the component
            this._oErrorHandler = new sap.cdp.demo.demoApplication5.util.ErrorHandler(this);
        },

        /**
         * Initializes the Reuse Configuration Utility
         */
        initializeConfigUtil: function() {
            //set the configuration model
            this.setModel(new JSONModel(), "ConfigurationModel");
            // initialize the Config Util with the component
            this._oConfigHandler = new Configurations(this);
            // set the oData model and Config Model
            this._oConfigHandler.initialize(this.getModel(), this.getModel("ConfigurationModel"));
            this._serverModel = this.getModel();
            this._configModel = this.getModel("ConfigurationModel");
            //Setting the size limit of the configurationModel
            var iDataSize = this.getConfigHandler().getConfigProperty("DATA_SIZE_LIMIT");
            this.getModel("ConfigurationModel").setSizeLimit(iDataSize);
        },


        /**
         * Uses the error handler instance to open error message box if not already open for another error
         * @param  {string} sTitle          Title
         * @param  {string} sErrorMessage   Message Text
         * @param  {string} sMessageDetails Description text
         */
        displayErrorMessage: function(sTitle, sErrorMessage, sMessageDetails) {
            this._oErrorHandler.showServiceError(sTitle, sErrorMessage, sMessageDetails);
        },

        /**
         * This function loads the collection
         * @param {Array} aCollection  Collection List
         * @param {Array} forceLoad    Force load
         * @param {Object} aFilter     Filter array
         * @return {Object}            Configurations
         */
        loadCollections: function(aCollection, forceLoad, aFilter) {
            return this._oConfigHandler.loadConfigCollections(aCollection, forceLoad, aFilter);
        },

        /**
         * This function return the Config util handler
         * @return {Object}       Config Util
         */
        getConfigHandler: function() {
            return this._oConfigHandler;
        },

        /**
         * The component is destroyed by UI5 automatically.
         * In this method, the ErrorHandler, ConfigHandler is destroyed.
         * @public
         * @override
         */
        destroy: function() {
            this._oErrorHandler.destroy();
            this.getConfigHandler().destroy();
            // call the base component's destroy function
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        /**
         * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
         * design mode class should be set, which influences the size appearance of some controls.
         * @public
         * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
         */
        getContentDensityClass: function() {
            this._sContentDensityClass = "sapUiSizeCompact";
            return this._sContentDensityClass;
        },
        /**
         * This function is called to get the Vendor picker
         * button in FLP
         * 
         * @param {Object}
         *            Controller Context
         * @param {function}
         *            Callback function when Vendor picker is
         *            called
         */
        getChangeVendorButtonOnFLP: function(oContext, fCallback) {
            // set the Vendor picker
            this._oConfigHandler.getChangeVendorBtn(oContext, fCallback);
        },


    });

});
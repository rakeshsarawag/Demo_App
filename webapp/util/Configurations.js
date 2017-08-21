sap.ui.define([
    "sap/ui/base/Object",
    "sap/cdp/demo/demoApplication5/model/oI18nModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/Device"
], function(Object, oI18nModel, DateFormat, FilterOperator, MessageBox, Device) {
    "use strict";

    /**
     * All Config Parameters for DoE Apps
     * @type {Object}
     */
    var config = {
        DATE_KEY_7D: '7-d',
        DATE_KEY_30D: '30-d',
        DATE_KEY_90D: '90-d',
        DATE_KEY_12M: '12-m',
        DATE_KEY_CD: '-cd',
        MS_PER_DAY:1000*60*60*24,

        SEARCH_KEY_PO: 'PoNumber',
        SEARCH_KEY_CLAIM: 'claim',
        SEARCH_KEY_INV: 'InvoiceNumber',
        SEARCH_KEY_RA: 'ReturnAuthorizationNumber',
        SEARCH_KEY_DEDUCT: 'DeductionNumber',
        SEARCH_KEY_PAYMENTNO: 'PaymentNumber',
        SEARCH_KEY_PAYMENTAMT: 'PaymentAmount',
        // Prefetch the collection
        PREFETCH_COLLECTION: true,

        // Date format as required by backend
        EDM_DATE_FORMAT: "yyyy-MM-ddTHH:mm:ss",

        // Minimum number of Attachments
        MIN_NO_OF_ATTACHMENT: 0,

        // Minimum number of Notes
        MIN_NO_NOTES: 0,

        // Model data size Limit
        DATA_SIZE_LIMIT: 10000,

        // Rev posting date
        REV_POSTING_DATE: 1,

        // Increase Rev posting month by
        INCREASE_REV_POSTING_MONTH: 1,

        // Max attachment file size in MB
        MAX_ATTACHMENT_FILE_SIZE: 10,

        // Max attachment file name length
        MAX_ATTACHMENT_FILE_NAME: 255,

        // Max attachment file size in MB
        ATTACHMENT_FILE_TYPE: ['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'msg']
    };

    /**
     * Configuration for loading the collection
     * @type {Object}
     */
    var configCollections = {};

    /**
     * This function returns the colletion
     * @return {Object} Config Collection
     */
    var getConfigCollection = function() {
        return {
            "PaymentMethod": {}
        };
    };

    /*
     * This function generates a random GUID
     * @private
     * @returns - {string} guid
     */
    var _generateGuid = function() {
        function r() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return r() + r() + '-' + r() + '-' + r() + '-' + r() + '-' + r() + r() + r();
    };

    /**
     * This function loads data for specified collection from backend and populates the configuration
     * object passed to it.
     * @private
     * @param {object} model OData model to fetch the configuration data from
     * @param {object} configModel configuration model
     * @param {array} collectionName name of the collection
     * @param {string} batchId id to create the batch request
     * @returns {object} jQuery promise for the loading of the configuration data
     **/
    var loadConfigCollectionData = function(model, configModel, collectionName, batchId, aFilter) {
        var loaded = jQuery.Deferred(),
            configPath = "/" + collectionName,
            promise = loaded.promise();

        model.setDeferredBatchGroups([batchId]);
        model.read(configPath, {
            batchGroupId: batchId,
            filters: aFilter,
            success: function(data) {
                configModel.setProperty("/" + collectionName, data.results);
                loaded.resolveWith(data);
            },
            error: function(error) {
                var errorMessage = jQuery.sap.formatMessage("loadConfigCollectionData failed for: {0}", [collectionName]);
                jQuery.sap.log.error(errorMessage);
                loaded.rejectWith("", [error]);
            }
        });

        configCollections[collectionName].loaded = promise;
        return promise;
    };

    /**
     * This function returns a common promise for loading of config collections passed.
     * checks if collection has already been loaded or not.
     * @private
     * @param {object} oDataModel OData model to fetch the configuration data from
     * @returns {object} jQuery promise for the loading of all collections
     **/
    var whenConfigsHaveLoaded = function(oDataModel, configModel, collections, forceLoad, aFilter) {
        var batchId = _generateGuid(),
            readCall = false,
            promises = collections.map(function(collection) {
                if (collection in configCollections) {
                    if (!forceLoad && configCollections[collection].loaded) {
                        jQuery.sap.log.debug("whenConfigsHaveLoaded: collection " + collection + " already requested, existing promise to be returned");
                        return configCollections[collection].loaded;
                    } else {
                        jQuery.sap.log.debug("whenConfigsHaveLoaded: collection " + collection + " not loaded already, will be loaded");
                        readCall = true;
                        return loadConfigCollectionData(oDataModel, configModel, collection, batchId, aFilter);
                    }
                } else {
                    jQuery.sap.log.error("whenConfigsHaveLoaded: collection " + collection + " was requested but not in the Configurations");
                    return jQuery.Deferred().reject(collection).promise();
                }
            });

        if (readCall) {
            // call the read method
            oDataModel.submitChanges({
                batchGroupId: batchId
            });
        }

        return jQuery.when.apply(null, promises);
    };

    /**
     * This function gets the select parameters
     * @param  {string} sEntityName Entity Name
     * @return {string}             Comma Seperated Parameters
     */
    var _getSelectParameters = function(aSelectParams) {
        var sParamString = "";
        if (aSelectParams && aSelectParams.length > 0) {
            sParamString = aSelectParams.join(",");
            sParamString = jQuery.sap.formatMessage("&$select={0}", sParamString);
        }
        return sParamString;
    };

    return Object.extend("sap.cdp.demo.demoApplication5.util.Configurations", {

        /**
         * Initializes
         * @param  {object} oDataModel  OData Model for server calls
         * @param  {object} configModel Configuration Model
         */
        initialize: function(oDataModel, configModel) {
            this._serverModel = oDataModel;
            this._configModel = configModel;
            configCollections = getConfigCollection();
        },

        /**
         * This method is called when destroyed is called
         */
        destroy: function() {
            this._serverModel = null;
            this._configModel = null;
            configCollections = null;
        },

        /**
         * Returns the configuration value for the propertyname provided .
         * It checks the 'config' variable defined and returns the corresponding value
         * @public
         * @param  {string} oProperty Property name
         * @return {string}           Property Value
         */
        getConfigProperty: function(oProperty) {
            if (oProperty) {
                return config[oProperty];
            } else {
                return undefined;
            }
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @param  {string} sCode ResourceCode
         * @returns {string} Resource Text Value
         */
        getResourceText: function(sCode) {
            return oI18nModel.getResourceBundle().getText(sCode);
        },

        /*
         * This function loads the collection
         * @public
         * @param - [Array] collection - Collection Name
         * @param - [Bool]  forceLoad 
         * @param - [Array]  Filter List
         * @returns - Collection of Promises
         */
        loadConfigCollections: function(collections, forceLoad, aFilter) {
            var configsLoaded = jQuery.Deferred();

            // set empty filter if aFilter is undefined
            if (!aFilter) {
                aFilter = [];
            }

            // check if config collection is null
            if (configCollections === null) {
                configCollections = getConfigCollection();
            }

            whenConfigsHaveLoaded(this._serverModel, this._configModel, collections, forceLoad, aFilter)
                .done(function() {
                    configsLoaded.resolve();
                })
                .fail(function(error) {
                    configsLoaded.rejectWith("", [error]);
                });

            return configsLoaded.promise();
        },

        /**
         * Converts standard date to date formatted in Edm Time format with HH:MM:SS as 00:00:00
         * @param  {Date} sDate         date in standard format
         * @return {string}             formatted date
         */
        convertToEdmDateOnly: function(sDate) {
            try {
                var dateFormat = DateFormat.getDateTimeInstance({
                        pattern: config.EDM_DATE_FORMAT
                    }),
                    tzOffSet = sDate.getTimezoneOffset() * 60 * 1000,
                    browserName = Device.browser.name,
                    newDate;
                // set the time
                sDate.setHours(0, 0, 0, 0);
                // check for browser
                if (browserName === "ie" || browserName === "ff") { //IF IE > 10
                    newDate = new Date(sDate.getTime() - tzOffSet);
                } else {
                    newDate = new Date(sDate.getTime());
                }
                return dateFormat.format(newDate);

            } catch (e) {
                jQuery.sap.log.warning("Date value received is undefined.", "Returning null", "sap.cdp.mprs.managerosters");
                return null;
            }
        },

        /**
         * This function redirects to Cross Application
         * @param  {string} sTarget Semantic Object
         */
        crossAppNavigation: function(sSemanticObj, sRoute, oParam) {
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"),
                sTarget;

            if (sSemanticObj) {
                sTarget = sSemanticObj;
                if (sRoute && oParam) {
                    sTarget = jQuery.sap.formatMessage("{0}&/{1}{2}", sTarget, sRoute, oParam);
                } else if (oParam) {
                    sTarget = jQuery.sap.formatMessage("{0}&/{1}", sTarget, oParam);
                }
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: sTarget
                    }
                });
            } else {
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: "#"
                    }
                });
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
        },
        /**
         * This function is called to get the Error popup
         * @param  {string} sMsg      Message
         */
        getErrorBox: function(sMsg) {
            MessageBox.error(sMsg);
        },
        /**
         * This function is called to get the success popup
         * @param  {string} sMsg      Message
         * @param  {function} fCallback Function Callback
         */
        getSuccessBox: function(sMsg, fCallback, oContext) {
            MessageBox.success(sMsg, {
                onClose: function(oAction) {
                    if (oAction === "OK" && fCallback) {
                        fCallback.call(oContext);
                    }
                }
            });
        },

        /**
         * This function sets the page title 
         * @param {String} sText TitleText
         */
        setPageTitle: function(sText) {
            document.title = sText;
        },
        /**
         * This function adds the Change Vendor Button to the Menu
         * @public
         * @param {Object} oContext Controller Context
         * @param {function} fCallback Callback function once Vendor is picked
         */
        getChangeVendorBtn: function(oContext, fCallback) {
            var rendererExt = sap.ushell.renderers.fiori2.RendererExtensions;
            rendererExt.addHeaderEndItem(this._getHeaderButton(oContext, fCallback));
        },
        /**
         * This function returns the Change Vendor Button
         * @param {Object} oContext Controller Context
         * @param {function} fCallback Callback function once Vendor is picked
         * @return {Object} Shell Header Item
         */
        _getHeaderButton: function(oContext, fCallback) {
            var sChangeVendor = this.getResourceText("LINK_CHANGE_VENDOR");

            if (!this._oVendorPickerBtn) {
                this._oVendorPickerBtn = new sap.ushell.ui.shell.ShellHeadItem("changeVendorBtn", {
                    icon: "sap-icon://user-edit",
                    tooltip: sChangeVendor,
                    showSeparator: true,
                    press: function(oEvent) {
                        // get the Vendor picker dialog
                        this._getVendorChangeValueHelp(oContext, fCallback).open();
                    }.bind(this)
                });
            }
            return this._oVendorPickerBtn;
        },
        _getVendorChangeValueHelp: function(oContext, fCallback) {
            //create value Help Dialog for Approved By FilterItem
            if (!this._vendorChangeValueHelpDialog) {
                this._vendorChangeValueHelpDialog = sap.ui.xmlfragment("sap.cdp.demo.demoApplication5.fragment.VendorChangeValueHelpDialog",
                    oContext);
                oContext.getView().addDependent(this._vendorChangeValueHelpDialog);
                // this._vendorChangeValueHelpDialog.attachEvent("confirm", fCallback.call(oContext), this);
            }
            return this._vendorChangeValueHelpDialog;
        },
    });
});
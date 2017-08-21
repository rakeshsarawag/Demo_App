sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/cdp/demo/demoApplication5/model/oI18nModel",
], function(Object, MessageBox, oI18nModel) {
    "use strict";

    return Object.extend("sap.cdp.demo.demoApplication5.util.ErrorHandler", {
        /**
         * Handles application errors by automatically attaching to the model events and displaying errors when needed.
         * @class
         * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
         * @public
         */
        constructor: function(oComponent) {
            this._oComponent = oComponent;
            this._oModel = oComponent.getModel();
            this._bMessageOpen = false;
            this._sErrorText = this.getResourceText("GENERIC_SERVICE_FAIL_DESC");
            this._sErrorTitle = this.getResourceText("SERVICE_OPERATION_FAILED");

            //handler for metadata load failure
            this._oModel.attachMetadataFailed(function(oEvent) {
                var oParams = oEvent.getParameters();
                this.showServiceError(this.getResourceText("SERVICE_REQUEST_FAILED"),
                    this.getResourceText("METADATA_LOAD_FAILED_TEXT"),
                    oParams.response);
            }, this);

            //default hanlder for all service failures - used in case failure message is not handled
            this._oModel.attachRequestFailed(function(oEvent) {
                var oParams = oEvent.getParameters();

                // An entity that was not found in the service is also throwing a 404 error in oData.
                // We already cover this case with a notFound target so we skip it here.
                // A request that cannot be sent to the server is a technical error that we have to handle though
                if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf(
                        "Cannot POST") === 0)) {
                    this.showServiceError("", "", oParams.response);
                }
            }, this);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceText: function(sCode) {
            return oI18nModel.getResourceBundle().getText(sCode);
        },

        /**
         * Shows a {@link sap.m.MessageBox} when a service call has failed.
         * Only the first error message will be display.
         * @param {string} sDetails a technical error to be displayed on request
         * @public
         */
        showServiceError: function(sTitle, sErrorMessage, sDetails, fCallback) {
            var sInnerDetails = "";

            if (this._bMessageOpen) {
                return;
            }
            this._bMessageOpen = true;

            //set title in case invoking controller does not
            if (!sTitle) {
                sTitle = this.getResourceText("SERVICE_OPERATION_FAILED");
            }

            sInnerDetails = this.parseError(sDetails);

            // check for any additional message
            if (sErrorMessage) {
                sErrorMessage = jQuery.sap.formatMessage("{0}\n\n{1}", [sErrorMessage, sInnerDetails]);
            } else {
                sErrorMessage = jQuery.sap.formatMessage("{0}", sInnerDetails);
            }

            MessageBox.show(
                sErrorMessage, {
                    icon: MessageBox.Icon.ERROR,
                    title: sTitle,
                    styleClass: this._oComponent.getContentDensityClass(),
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function() {
                        this._bMessageOpen = false;

                        // check for callback and execute
                        if (fCallback) {
                            fCallback();
                        }
                    }.bind(this)
                }
            );
        },

        /**
         * This function parses the error message 
         * @param  {Object} sDetails Error Object
         * @return {string}          Parsed Error String
         */
        parseError: function(sDetails) {
            var sInnerDetails = "",
                innerDetails = "";

            if (sDetails && sDetails.message) {
                sInnerDetails += jQuery.sap.formatMessage(this.getResourceText("SERVICE_ERROR_MSG"), sDetails.message);
            }

            if (sDetails && sDetails.statusText) {
                sInnerDetails += jQuery.sap.formatMessage(this.getResourceText("SERVICE_ERROR_STATUS_TXT"), sDetails.statusText);
            }


            if (sDetails && sDetails.responseText) {
                try {
                    var response = JSON.parse(sDetails.responseText);
                    if (response.error && response.error.innererror && response.error.innererror.errordetails) {
                        var errorDetails = response.error.innererror.errordetails;
                        innerDetails += this.getResourceText("SERVICE_ERROR_REASON_TXT");
                        errorDetails.forEach(function(err) {
                            innerDetails += jQuery.sap.formatMessage(this.getResourceText("SERVICE_ERROR_REASON_VALUE"), err.message);
                        }.bind(this));

                        //add reason text to main message in normal scnearios
                        sInnerDetails += innerDetails;

                    }
                    if (response.error && response.error.message) {
                        sInnerDetails += jQuery.sap.formatMessage(this.getResourceText("SERVICE_ERROR_RESPONSE_MSG"), response.error.message.value);
                    }
                } catch (e) {
                    sInnerDetails = sDetails.responseText;
                }
            }

            if (!sInnerDetails) {
                sInnerDetails = sDetails;
            }

            return sInnerDetails;
        }
    });

});
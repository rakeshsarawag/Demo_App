sap.ui.define([
    "sap/ui/core/ValueState",
    "sap/cdp/demo/demoApplication5/util/Configurations",
    "sap/ui/core/format/DateFormat",
    "sap/cdp/demo/demoApplication5/util/TimeUtil"
], function(ValueState, Configurations, DateFormat, TimeUtil) {
    "use strict";

    /**
     * Generic method that provides descripton text for a property value from respective collection
     * @param  {string} collection          Collection Name
     * @param  {string} keyProperty         Key property to be looked up
     * @param  {string} descriptionProperty Description property containing description
     * @param  {string} inputValue          Key Value Entered
     * @param  {object} controller          Controller object
     * @return {string}                     Description Value for corresponding key
     */
    var _getDescriptionForKey = function(collection, keyProperty, descriptionProperty, inputValue, controller) {
        var oDescription = "",
            oCollection = controller.getOwnerComponent().getModel("ConfigurationModel").getProperty(collection);

        var logMessage = jQuery.sap.formatMessage(
            "_getDescriptionForKey failed for collection: {0}, {1}={2}", [collection, keyProperty, inputValue]);

        if (!oCollection) {
            jQuery.sap.log.error(logMessage, "Collection is not present", "sap.cdp.demo.demoApplication5");
            return oDescription;
        }

        var CollLen = oCollection.length;
        for (var idx = 0; idx < CollLen; idx++) {
            if (oCollection[idx][keyProperty] === inputValue) {
                oDescription = oCollection[idx][descriptionProperty];
                return oDescription;
            }
        }

        jQuery.sap.log.error(logMessage, "", "sap.cdp.demo.demoApplication5");
        return oDescription;
    };



    return {

        /**
         * Formats date to DD.MM.YYYY format if passed value is valid date
         * @param  {string} sDateValue date value
         * @return {string}            formatted date
         */
        dateFormatter: function(sDateValue) {
            var dateFormat = DateFormat.getDateInstance({
                pattern: Configurations.getProperty("FORMATTER_DATE_FORMAT_STRING_DD_MM_YYYY")
            });
            if (sDateValue) {
                return dateFormat.format(sDateValue);
            }
            return sDateValue;
        },
        /**
         * Shows Company id and Vendor Name together
         * @param  {oDesignation} oVendor Vendor value
         * @return {string}     CompanyId | Vendor
         */
        VendorHeaderFormat: function(oVendor) {
            if (!oVendor) {
                return "";
            }
            return jQuery.sap.formatMessage("| {0}", [oVendor]);
        },

        /*
         * @function: TaskTypeFormatter
         * @description: This is a formatter function for Task Type
         * @public
         * @param - oTaskType - Task Type
         * @returns - Task Type Description Text
         */
        taskTypeFormatter: function(oTaskType) {
            if (oTaskType) {
                return _getDescriptionForKey("/TaskTypeConfColl", "TaskType", "TaskTypeDesc", oTaskType, this);
            }
            jQuery.sap.log.warning("TaskTypeFormatter got empty Task type");
            return "";
        },
        /**
         * Function to concatenate the address
         * @param  {string} addrLine1  Address line 1
         * @param  {string} addrLine2  Address line 2
         * @param  {string} city       city
         * @param  {string} state      state
         * @param  {string} postalCode postal code
         * @param  {string} country    country
         * @return {string}            Concatenated string
         */
        addrFormatter: function(addrLine1, addrLine2, city, state, postalCode, country) {
            return addrLine1 + '\n' + ((addrLine2 != null && addrLine2 != '') ? addrLine2 + '\n' : '') + city + ', ' + state + ' ' + postalCode + '\n' + country;
        },
        /**
         * Function to add the first name and last name
         * @param {string} fName    First name
         * @param {string} lName    Last name
         */
        addInfoAdmin: function(fName, lName) {
            return fName + ' ' + lName;
        },
        formatFieldVisiblity: function(sValue) {
            if (sValue === "D") {
                return false;
            } else if (sValue === "R") {
                return true;
            }
        },
        formatFieldsMandatory: function(sValue) {
            if (sValue === "R") {
                return true;
            } else {
                return false;
            }
        },
        formatUploadVisiblity: function(sFile1, sFile2, sFile3, sOthers) {
            if (!sFile1 && !sFile2 && !sFile3 && !sOthers) {
                return false;
            } else if (sFile1 === "D" && sFile2 === "D" && sFile3 === "D" && sOthers === "D") {
                return false;
            } else if (sFile1 === "R" || sFile2 === "R" || sFile3 === "R" || sOthers === "R") {
                return true;
            } else if (sFile1 === "O" || sFile2 === "O" || sFile3 === "O" || sOthers === "O") {
                return true;
            } else {
                return false;
            }
        },
        formatMsgStripVisiblity: function(sFile1, sFile2, sFile3, sOthers, sOthersText) {
            if (!sFile1 && !sFile2 && !sFile3 && !sOthers) {
                return false;
            } else if (sFile1 === "D" && sFile2 === "D" && sFile3 === "D" && sOthers === "D") {
                return false;
            } else if (sFile1 === "R" || sFile2 === "R" || sFile3 === "R" || sOthers === "R") {
                return true;
            } else if (sFile1 === "O" || sFile2 === "O") {
                return true;
            } else {
                return false;
            }
        },
        formatMessageStripText: function(sFile1, sFile1Text, sFile2, sFile2Text) {
            if (sFile1 === "R" && sFile2 === "R") {
                return jQuery.sap.formatMessage("{0} and {1} files are required", [sFile1Text, sFile2Text]);
            } else if (sFile1 === "R") {

                return jQuery.sap.formatMessage("{0} is required", sFile1Text);

            } else if (sFile2 === "R") {

                return jQuery.sap.formatMessage("{0} is required", sFile2Text);
            }
        },
        /**
         * Converts standard date to DDMMYYY
         * @param  {object} oDate Date object
         * @return {string}       Date in DDMMYYY
         */
        getDateInDDMMYYYY: function(oDate) {

            if (!oDate) { //TODO: Check if invalid date
                return "";
            }
            var dateFormat = DateFormat.getDateTimeInstance({
                pattern: "dd-MM-YYYY"
            });
            return dateFormat.format(oDate);

        }
    };

});
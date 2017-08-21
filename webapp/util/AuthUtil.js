sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function(JSONModel) {
    "use strict";

    return {
        // model
        AUTH_MODEL: "AuthConfModel",
        // auth backend sub objects
        AUTH_SUB_OBJECTS: {
            BLANK: "",
            DAILY: "MRS_1DAY",
            THREE_MONTH: "MRS_3MON",
            FLEXI: "MRS_FLEXI",
            ONE_MONTH: "MRS_1MON",
            UNAVAILABILITY_REPORT: "MRS_UNAV",
            RULE_VIOLATION_REPORT: "MRS_RULE",
            PLRD_REPORT: "MRS_PLRD",
            COVERAGE_REPORT: "MRS_COVR",
            ADHOC_DEMAND_LINKING_REPORT: "MRS_ADHC",
            COST_REPORT: "MRS_COST",
            BILLED_UNBILLED_REPORT: "MRS_BILL"
        },
        // auth backend activity
        AUTH_ACTIVITY: {
            DISPLAY: "001",
            EDIT: "002",
            COPY: "003",
            MOVE: "004",
            SPLIT: "005",
            OPEN: "006",
            GENERATE_DEPLOYMENT: "007",
            GENERATE_Task: "008",
            CANCEL: "009",
            TRIGGER_Task_PLAN: "010",
            APPROVE: "012",
            SUBMIT: "014",
            CREATE_UNPLANNED_ABSENCE: "015",
            EXCEL_DOWNLOAD: "018"
        },
        // work item authorization
        initialAuth: {
            DailyTaskDisplay: "",
            MonthlyTaskDisplay: "",
            ThreeMonthTaskDisplay: "",
            DailyTaskEdit: "",
            OneMonthTaskEdit: "",
            ExcelDownload: ""
        },

        /**
         * @func: loadConfigs @description: This function loads all configutation
         *        configuration data from backend.
         * @param {object} oDataModel OData model to fetch the configuration data from
         * @param {array} configCollections list of configuration collections to load
         * @returns {object} jQuery promise for the loading of the configuration data
         **/
        loadAuthObjects: function(oDataModel, component) {
            var configPath = "/AuthConfItemColl",
                loaded = jQuery.Deferred(),
                promise = loaded.promise();

            oDataModel.read(configPath, {
                success: function(data) {
                    var authObj = this.parseAuthObjects(data.results);
                    component.setModel(new JSONModel(authObj), this.AUTH_MODEL);
                    loaded.resolveWith(data);
                }.bind(this),
                error: function(error) {
                    loaded.rejectWith(error);
                }
            });

            return promise;
        },

        /**
         * @func: parseAuthObjects @description: This function parses all the auth objects.
         * @param {object} auths - Auth Objects
         * @returns {object} auth objects
         **/
        parseAuthObjects: function(authObjs) {
            var authVal = this.initialAuth,
                authSubObj = this.AUTH_SUB_OBJECTS,
                authActivity = this.AUTH_ACTIVITY;

            authObjs.forEach(function(auth) {
                switch (auth.Subobject) {

                    case authSubObj.BLANK:
                        if (auth.Activity === authActivity.EXCEL_DOWNLOAD) {
                            authVal.ExcelDownload = auth.Authorization;
                        }
                        break;

                    case authSubObj.DAILY:
                        if (auth.Activity === authActivity.EDIT) {
                            authVal.DailyTaskEdit = auth.Authorization;
                        }
                        break;

                    case authSubObj.ONE_MONTH:
                        if (auth.Activity === authActivity.EDIT) {
                            authVal.OneMonthTaskEdit = auth.Authorization;
                        }
                        break;
                }
            });

            return authVal;
        }
    };
});

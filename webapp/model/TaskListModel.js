sap.ui.define([
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Sorter",
    ],
    function(JSONModel, Sorter) {
        return JSONModel.extend("sap.cdp.demo.demoApplication5.model.TaskListModel", {

            initialize: function(oDataModel, resourceBundle, component) {
                this._serverModel = oDataModel;
                this._resourceBundle = resourceBundle;
                this._component = component;
            }
        });
    });

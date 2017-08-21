sap.ui.define([
    "sap/ui/model/resource/ResourceModel"
], function(ResourceModel) {
    "use strict";
    var resourceModel = (function() {
        var oI18nModel = new ResourceModel({
            bundleName: "sap.cdp.demo.demoApplication5.i18n.i18n"
        });
        return oI18nModel;
    }());
    return resourceModel;
}, /* bExport= */ true);

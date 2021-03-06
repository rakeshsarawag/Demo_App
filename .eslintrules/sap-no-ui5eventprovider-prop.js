/**
 * @fileoverview 	Check "sap-no-ui5eventprovider-prop" should detect direct usage of private property names of sap.ui.base.EventProvider
 * @author 			Roman Horch (D030497) with advice from Armin Gienger (D028623)
 * @ESLint			Version 0.14.0 / February 2015
 */


// ------------------------------------------------------------------------------
// Rule Disablement
// ------------------------------------------------------------------------------
/*eslint-disable strict*/
// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------


module.exports = function(context) {
    "use strict";

    // Alphabetical list of the "private property names" from UI5 event provider which this check shall detect
    var PRIVATE_MEMBERS = [ "mEventRegistry", "oEventPool" ];

    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {

            if (obj === a[i]) {
                return true;
            }
        }
        return false;
    }

    // --------------------------------------------------------------------------
    // Public
    // --------------------------------------------------------------------------

    return {

        "MemberExpression": function(node) {

            var val = node.property.name;

            if ((typeof val === "string") && contains(PRIVATE_MEMBERS, val)) {

                context
                        .report(node,
                                "Direct usage of a private property from sap.ui.base.EventProvider detected!");

            }

        }
    };

};

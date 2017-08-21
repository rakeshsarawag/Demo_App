sap.ui.define([
        "sap/ui/Device",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/format/DateFormat",
        "sap/cdp/demo/demoApplication5/util/Configurations"
    ],
    function(Device, JSONModel, DateFormat, Configurations) {
        "use strict";

        return {

            //date format as required for Daily Task
            EDM_DATE_FORMAT: "yyyy-MM-ddTHH:mm:ss",

            //date format as required for Daily Task - discarding the Hours, minutes and seconds
            EDM_DATE_ONLY_FORMAT: "yyyy-MM-ddT00:00:00",

            //time format as required for Backend Save Operations
            EDM_TIME_FORMAT: "PTHH'H'mm'M'ss'S'",
            //------------------------------------------------------------------
            // Time Related methods
            //------------------------------------------------------------------

            /**
             * Converts standard date to date formatted in Edm Time format
             * @param  {Date} sDate       date in standard format
             * @return {string}             formatted date
             */
            formatDateToEdm: function(sDate) {
                var dateFormat = DateFormat.getDateTimeInstance({ pattern: this.EDM_DATE_FORMAT });
                return dateFormat.format(sDate);
            },


            /**
             * Converts standard date to date formatted in Edm Time format with HH:MM:SS as 00:00:00
             * @param  {string} sDate       date in standard format
             * @return {string}             formatted date
             */
            formatToEdmDateOnly: function(sDate) {
                var newDate = new Date(sDate);
                var dateFormat = DateFormat.getDateTimeInstance({ pattern: this.EDM_DATE_ONLY_FORMAT });
                return dateFormat.format(newDate);
            },

            /**
             * Converts standard date to date formatted in Edm Time format with HH:MM:SS as 00:00:00
             * @param  {string} sDate       date in standard format
             * @return {string}             formatted date
             */
            formatToEdmDateWithOffSet: function(sDate) {

                try {

                    jQuery.sap.log.debug("Adding offset to resolve browser specific ui5 time offset issues", "", "sap.cdp.demo.demoApplication5");
                    //TODO: This is a temporary hack to resolve a bug with UI5. It might need to be changed in future post patch correction by ui5
                    var dateFormat = DateFormat.getDateTimeInstance({ pattern: this.EDM_DATE_FORMAT }),
                        tzOffSet = sDate.getTimezoneOffset() * 60 * 1000,
                        browserName = Device.browser.name,
                        newDate;

                    if (browserName === "ie" || browserName === "ff") { //IF IE > 10
                        newDate = new Date(sDate.getTime() - tzOffSet);
                    } else {
                        newDate = new Date(sDate.getTime());
                    }
                    return dateFormat.format(newDate);

                } catch (e) {
                    jQuery.sap.log.warning("Date value received is undefined.", "Returning null", "sap.cdp.demo.demoApplication5");
                    return null;
                }
            },

            /**
             * Formats time for HHMM to Edm.Time format
             * @param  {string} timeInHHMM Time in HH: MM format
             * @return {string}            Time in Edm.Time
             */
            formatHHMMToEdmTime: function(timeInHHMM) {

                var aTime = timeInHHMM.split(":");
                var sChangeTime = (parseInt(aTime[0]) * 60 * 60 * 1000) + (parseInt(aTime[1]) * 60 * 1000);

                var newDateTime = new Date(sChangeTime);
                newDateTime = new Date(newDateTime.getUTCFullYear(), newDateTime.getUTCMonth(), newDateTime.getUTCDate(), newDateTime.getUTCHours(), newDateTime.getUTCMinutes(), newDateTime.getUTCSeconds());


                var timeFormat = DateFormat.getDateTimeInstance({ pattern: this.EDM_TIME_FORMAT });
                sChangeTime = timeFormat.format(newDateTime);
                return sChangeTime;
            },


            //------------------------------------------------------------------
            // Date related methods
            //------------------------------------------------------------------

            /**
             * Returns the start date for next month
             * @return {date}            Date
             */
            getNextMonthStartDate: function(dateFormat) {
                var currentDate = new Date();
                var nextMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                return nextMonthStartDate;
            },

            /**
             * Returns the End Date for next month
             * @return {date}            Date
             */
            getNextMonthEndDate: function() {
                var currentDate = new Date();
                var nextMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
                return nextMonthEndDate;
            },

            /**
             * Returns the current days Date as per dateFormate provided.
             * If DateFormat is undefined, returns in standard format
             * @param  {string} dateFormat Date Format for the required date
             * @return {date}            Date
             */
            getTodaysDate: function(dateFormat) {

                var todaysDate = null;
                if (dateFormat) {
                    todaysDate = new Date(dateFormat);
                } else {
                    todaysDate = new Date();
                }
                return todaysDate;
            },

            /**
             * Returns the month value for passed date
             * @param  {date} oDate Date Object
             * @param {string} sDatePattern DateFormat pattern
             * @return {string}       Month value
             */
            getMonthFromDate: function(oDate, sDatePattern) {
                if (!oDate) {
                    return "";
                }
                if (!sDatePattern) {
                    sDatePattern = "MMMM";
                }
                var dateFormat = DateFormat.getDateTimeInstance({ pattern: sDatePattern });
                return dateFormat.format(oDate);
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
                var dateFormat = DateFormat.getDateTimeInstance({ pattern: "dd-MM-YYYY" });
                return dateFormat.format(oDate);

            },

            /**
             * Converts DDMMYYYY to standard date
             * @param  {string} sDate       date in DDMMYYYY
             * @param  {string} sDateFormat dateformat required
             * @return {string}             formatted date
             */
            getDateFromDDMMYYYY: function(sDate, sDateFormat) {
                var parts = sDate.split("-");
                var newDate = new Date(parts[2], parts[1] - 1, parts[0]);
                var dateFormat = DateFormat.getDateTimeInstance({ pattern: sDateFormat });
                return dateFormat.format(newDate);
            },


            /**
             * Returns date in short format for display
             * @param  {date} oDate       Date to be formatted
             * @param  {string} sDateFormat dateformat
             * @return {string}             Formatted Date
             */
            getFormattedDate: function(oDate, sDateFormat) {
                if (!sDateFormat) {
                    sDateFormat = DateFormat.getDateTimeInstance({ style: "long" });
                }
                var dateFormat = DateFormat.getDateTimeInstance({ pattern: sDateFormat });
                return dateFormat.format(oDate);
            },

            /**
             * Returns date in short format for display
             * @param  {date} oEdmDate       Date Object in Edm
             * @return {Date}             Formatted Date as JS Date Object
             */
            getFormattedDateWithOffSet: function(oEdmDate) {
                if (oEdmDate) {
                    var oDate = new Date(oEdmDate);
                    return oDate;
                } else {
                    return null;
                }
            },


            /**
             * Formats EDM Time to HH:MM format
             * @param  {string} edmTime time in Edm.Time format
             * @return {string}         Time in HH:MM
             */
            formatEdmTime: function(edmTime) {
                var hours = this.getHoursFromEdmTime(edmTime),
                    totalMinutes = this.getMinutesFromEdmTime(edmTime),
                    minutes = totalMinutes > 59 ? totalMinutes % 60 : totalMinutes;

                return jQuery.sap.formatMessage("{0}:{1}", [hours < 10 ? "0" + hours : hours, minutes < 10 ? "0" + minutes : minutes]);
            },

            /**
             * GEts Hours based on EDM Time
             * @param  {object} edmTime Edm.Time
             * @return {integer}         hours
             */
            getHoursFromEdmTime: function(edmTime) {
                return Math.floor(edmTime.ms / 3600000);
            },

            /**
             * Get Minutes based on Edm Time
             * @param  {object} edmTime Edm.Time
             * @return {integer}         minutes
             */
            getMinutesFromEdmTime: function(edmTime) {
                return Math.floor(edmTime.ms / 60000);
            },

            /**
             * Returns an array of dates for full month duration.
             * @param  {date} oDate Date for which the month needs to be displayed
             * @return {array}       array of dates
             */
            getDatesForMonthlyDisplay: function(oDate) {

                var originalMonthIndex = oDate.getMonth();
                var originalYear = oDate.getFullYear();
                var originalDate = 1; //first day of the month

                var aMonthDates = [];
                var nextDate = new Date(originalYear, originalMonthIndex, originalDate);
                do {
                    aMonthDates.push(nextDate);
                    //TODO: Check year and month here.
                    nextDate = new Date(originalYear, originalMonthIndex, nextDate.getDate() + 1);
                } while (originalMonthIndex === nextDate.getMonth());


                if (isNaN(parseInt(aMonthDates[0].getDay()))) {
                    jQuery.sap.log.Error("Calendar Day is not in integer format. ", "Aborting !!", "sap.cdp.demo.demoApplication5");
                    return [];
                }
                //add days to beginning if month doesn't start on a Sunday
                var firstDay = new Date(aMonthDates[0].getFullYear(), aMonthDates[0].getMonth(), aMonthDates[0].getDate() - 1);
                while (firstDay.getDay() !== 0) {
                    firstDay = new Date(aMonthDates[0].getFullYear(), aMonthDates[0].getMonth(), aMonthDates[0].getDate() - 1);
                    aMonthDates.unshift(firstDay);
                }

                var lastIndex = aMonthDates.length - 1;
                if (isNaN(parseInt(aMonthDates[lastIndex].getDay()))) {
                    jQuery.sap.log.Error("Calendar Day is not in integer format. ", "Aborting !!", "sap.cdp.demo.demoApplication5");
                    return [];
                }
                //add days to end if month doesn't end on a Saturday
                var lastDay = aMonthDates.length - 1;
                while (aMonthDates[lastIndex].getDay() !== 6) {
                    lastDay = new Date(aMonthDates[lastIndex].getFullYear(), aMonthDates[lastIndex].getMonth(), aMonthDates[lastIndex].getDate() + 1);
                    aMonthDates.push(lastDay);
                    lastIndex = aMonthDates.length - 1;
                }

                //add days to end
                return aMonthDates;
            },

            /**
             * Returns Calendar Dates for 3 calendar months starting .
             * Example: If passed Date is 4th April -> Calendar Dates for April, May, June will be returned.
             * @param  {Date} oDate Date from which 3 months need to be calculated
             * @return {array}       Array of Dates
             */
            getMonthCalendarDates: function(oDate) {
                var originalMonthIndex = oDate.getMonth(),
                    originalYear = oDate.getFullYear(),
                    originalDate = 1; //first day of the month

                var aCalendarDates = [];
                var nextDate = new Date(originalYear, originalMonthIndex, originalDate);

                while (nextDate.getMonth() == originalMonthIndex) {
                    aCalendarDates.push(nextDate);
                    nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate() + 1);
                }
                return aCalendarDates;
            },

            /**
             * Returns Calendar Dates for 3 calendar months starting .
             * Example: If passed Date is 4th April -> Calendar Dates for April, May, June will be returned.
             * @param  {Date} oDate Date from which 3 months need to be calculated
             * @return {array}       Array of Dates
             */
            get3MonthCalendarDates: function(oDate) {
                var originalMonthIndex = oDate.getMonth(),
                    originalYear = oDate.getFullYear(),
                    originalDate = 1, //first day of the month
                    secondMonthIndex = (originalMonthIndex + 1) % 12,
                    lastMonthIndex = (originalMonthIndex + 2) % 12; //2 months from original month

                var aCalendarDates = [];
                var nextDate = new Date(originalYear, originalMonthIndex, originalDate);

                while ((nextDate.getMonth() == originalMonthIndex) || (nextDate.getMonth() == secondMonthIndex) || (nextDate.getMonth() == lastMonthIndex)) {
                    aCalendarDates.push(nextDate);
                    nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate() + 1);
                }
                return aCalendarDates;
            },

            /**
             * Checks whether both the provided dates match.
             * Note: Comparison is only for the date and not for time
             * @param  {date} oDate1 First Date object
             * @param  {date} oDate2 Second Date object
             * @return {Boolean}        true - if dates match, false otherwise
             */
            areBothDatesEqual: function(oDate1, oDate2) {

                if (!(typeof oDate1.getFullYear === 'function') && (typeof oDate2.getFullYear === 'function')) {
                    jQuery.sap.log.error("Date comparison failed with exception as objects are not of type Date", "", "sap.cdp.demo.demoApplication5");
                    return false;
                }

                if ((oDate1.getDate() === oDate2.getDate()) &&
                    (oDate1.getMonth() === oDate2.getMonth()) &&
                    (oDate1.getFullYear() === oDate2.getFullYear())) {
                    return true;
                } else {
                    return false;
                }
            },

            /**
             * Returns date in YYYYMMDD format
             * @param  {date} oDate Date to be formatted
             * @return {string} Formatted Date
             */
            formatDateInYYYYMMDD: function(oDate) {
                if (!oDate) {
                    return;
                }
                return this.getFormattedDate(oDate, "YYYYMMdd");
            },

            /**
             * Returns the next date
             * @param  {date} oDate Date to be formatted
             * @return {string} Formatted Date
             */
            getNextDate: function(oDate) {
                var tomorrow;
                if (!oDate) {
                    return;
                }

                tomorrow = new Date(oDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return this.getFormattedDate(tomorrow, "dd-MM-YYYY");
            },

            /**
             * Returns the previous date
             * @param  {date} oDate Date to be formatted
             * @return {string} Formatted Date
             */
            getPreviousDate: function(oDate) {
                var yesterday;
                if (!oDate) {
                    return;
                }

                yesterday = new Date(oDate);
                yesterday.setDate(yesterday.getDate() - 1);
                return this.getFormattedDate(yesterday, "dd-MM-YYYY");
            },

            /**
             * Converts the HH:MM Value to Minutes
             * @param  {string} hhmm Time in HHMM
             * @return {integer}      Number of Minutes
             */
            hhmmToMinutes: function(hhmm) {
                if (!hhmm) {
                    return 0;
                }
                var parts = hhmm.split(":").map(function(p) {
                        return parseInt(p);
                    }),
                    hours = 0,
                    minutes = 0,
                    totalMinutes;
                if (parts.length >= 0) {
                    hours = parts[0];
                }
                if (parts.length > 1) {
                    minutes = parts[1];
                }
                return hours * 60 + minutes;
            },

            /**
             * Converts the HH:MM Value to HHMMSS
             * @param  {string} hhmm Time in HHMM
             * @return {string} formatted time in HHMMSS
             */
            hhmmToHHMMSS: function(hhmm) {
                if (!hhmm) {
                    return 0;
                }
                var formattedTime = hhmm.replace(":", "");
                return jQuery.sap.formatMessage("{0}00", formattedTime);

            }
        };
    }
);

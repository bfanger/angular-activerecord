angular.module('ExampleFilters', ['ng'])
	/**
	 * Converts string containing a (ISO8601 formatted) date into a Date object.
	 * @returns {Date}
	 */
	.filter('toDateObject', function() {
		var fromIsoString = (function(){
			var tzoffset = (new Date).getTimezoneOffset();
			function fastDateParse(y, m, d, h, i, s, ms){ // this -> tz
				return new Date(y, m - 1, d, h || 0, +(i || 0) - this, s || 0, ms || 0);
			}

			// result function
			return function(isoDateString){
				var tz = isoDateString.substr(10).match(/([\-\+])(\d{1,2}):?(\d{1,2})?/) || 0;
				if (tz) {
					tz = tzoffset + (tz[1] == '-' ? -1 : 1) * (tz[3] != null ? +tz[2] * 60 + (+tz[3]) : +tz[2]);
				} else {
					tz = tzoffset;
				}
				return fastDateParse.apply(tz || 0, isoDateString.split(/\D/));
			}
		})();

		return function(value) {
			if (typeof value === 'string') {
				var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/.exec(value);
				return match ? fromIsoString(value) : value;
			}
			return value;
		};
	}).filter('toISO8601', function(value) {
		if (value instanceof Date) {
			return value.toISOString();
		}
		return value;
	}).filter('suffix', function() {
		return function(value, suffix) {
			return value + suffix;
		}
	});

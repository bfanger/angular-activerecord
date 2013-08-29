angular.module('ExampleFilters', ['ng'])
	/**
	 * Converts string containing a (ISO8601 formatted) date into a Date object.
	 * @returns {Date}
	 */
	.filter('toDateObject', function() {
		return function(value) {
			if (typeof value === 'string') {
				var match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/.exec(value);
				if (match) {
					return new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6]));
				}
			}
			return value; // return the original value
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

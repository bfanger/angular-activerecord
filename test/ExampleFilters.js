angular.module('ExampleFilters', ['ng'])
	/**
	 * Converts string containing a (ISO8601 Extended format) date into a Date object.
	 * @returns {Date}
	 */
	.filter('toDateObject', function() {
		function parseISO8601(str) {
			var parts = str.split('T');
			var dateParts = parts[0].split('-');
			var timeParts = parts[1].split('Z');
			var timeSubParts = timeParts[0].split(':');
			var timeSecParts = timeSubParts[2].split('.');
			var timeHours = Number(timeSubParts[0]);
			var date = new Date();

			date.setUTCFullYear(Number(dateParts[0]));
			date.setUTCMonth(Number(dateParts[1])-1);
			date.setUTCDate(Number(dateParts[2]));
			date.setUTCHours(Number(timeHours));
			date.setUTCMinutes(Number(timeSubParts[1]));
			date.setUTCSeconds(Number(timeSecParts[0]));
			if (timeSecParts[1]) {
				date.setUTCMilliseconds(Number(timeSecParts[1]));
			}
			return date;
		}
		return function(value) {
			if (typeof value === 'string') {
				if (value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/) === null) {
					console.warn(value, ' is not a valid ISO8601 date');
					return value;
				}
				var date = new Date(value);
				if (isNaN(date)) { // ES3 doensn't parse ISO8601
					return parseISO8601(value);
				}
				return date;
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
		};
	});

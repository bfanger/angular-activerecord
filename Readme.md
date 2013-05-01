# ActiveRecord for AngularJS

angular-activerecord is an Backbone.Model inspired modellayer for AngularJS.

## Differences compared to Backbone.Model

* Added static fetchOne(id) and fetchAll() methods.
* No attributes property
* Because the properties and methods are on the same level the ActiveRecord method & properties are prefixed with "$""
* Stripped out functionality that is provided by angular)
  * No getter/setter methods
  * No event system.
  * No dependancy on underscore
  * No dependancy on jQuery
  * No Collection class

## Goals / Features (compared to $resource)

 * Extendable OOP designed models (instance methods per type, )
 * Enable parsing jsonData
 * Allow default values
 * Allow alternative backends
 * Allow alternative url schemes (like .json suffixed)
 * Minimal configuration (only an urlRoot), the json-object from the rest api is the spec.

 ## Usage
 Add "ActiveRecord" as module dependancy.

 ```js
 YOUR_MODULE.factory('Task', function (ActiveRecord) {

	return ActiveRecord.extend({

		// rest api configuration for retrieving and saving tasks.
		$urlRoot: '/api/tasks',

		// optional defaults
		$defaults: {
			title: '',
			estimate: ''
		},

		// optional named constructor (Shows "Task" as the type in a console.log)
		$constructor: function Task(properties) {
			this.$initialize.apply(this, arguments)
		},

		// A method for task instances
		/**
		 * Return the estimate in hours
		 * @return {Number}
		 */
		estimateInHours: function () {
			var value = parseFloat(this.estimate);
			if (isNaN(value)) {
				return 0.0;
			}
			return value;
		}
	});
 ```
 The ActiveRecord methods are prefixed with "$" to prevent naming-collisions with properties from your rest api.
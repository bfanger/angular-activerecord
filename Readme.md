# ActiveRecord for AngularJS

angular-activerecord is a [Backbone.Model](http://backbonejs.org/#Model) inspired modellayer for [AngularJS](http://angularjs.org/).

[![Build Status](https://travis-ci.org/bfanger/angular-activerecord.png)](https://travis-ci.org/bfanger/angular-activerecord)

[API Documentation](http://bfanger.github.io/angular-activerecord/api/#!/api/ActiveRecord)

## Differences compared to Backbone.Model

* No attributes property.
* Because the properties and methods are on the same level the ActiveRecord methods & config-properties are prefixed with "$" to prevent naming collisions.
* Stripped out functionality that is provided by angular)
  * No getter/setter methods. (Angular has $scope.$watch)
  * No event system. (Angular has $scope.$emit)
  * No dependency on underscore. (angular.extend, angular.isFunction, etc)
  * No dependency on jQuery. (Angular has $http)
  * No Collection class. (Angular works with plain javascript array's)
* Added static fetchOne(id) and fetchAll() class-methods.
* Added read & write filtering of properties through angular filters.

## Goals / Features (compared to ngResource)

 * Extendable OOP designed models (instance methods per type)
 * Enable parsing the response.
 * Allow default values.
 * Allow alternative backends.
 * Allow alternative url schemes (like .json suffixed)
 * Minimal configuration (only a $urlRoot), the json-object from the rest-api is the spec.

 ## Example

 ```js
 module('myApp', ['ActiveRecord']); // Add "ActiveRecord" as module dependency.

 module('myApp').factory('Task', function (ActiveRecord) {

	return ActiveRecord.extend({

		// Rest API configuration for retrieving and saving tasks.
		$urlRoot: '/api/tasks',

		// Optional defaults
		$defaults: {
			title: 'Untitled',
			estimate: ''
		},

		// optional named constructor (Shows "Task" as the type in a console.log)
		$constructor: function Task(properties) {
			this.$initialize.apply(this, arguments)
		},

		// An example method for task instances
		/**
		 * Return the estimate in hours
		 * @return {Number}
		 */
		estimateInHours: function () {
			var value = parseFloat(this.estimate);
			if (isNaN(value)) {
				return 0.0;
			}
			return value / 3600;
		}
	});
 ```

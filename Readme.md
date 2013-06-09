# ActiveRecord for AngularJS

angular-activerecord is a [Backbone.Model](http://backbonejs.org/#Model) inspired modellayer for [AngularJS](http://angularjs.org/).

[![Build Status](https://travis-ci.org/bfanger/angular-activerecord.png)](https://travis-ci.org/bfanger/angular-activerecord)

## Differences compared to Backbone.Model

* Added static fetchOne(id) and fetchAll() class-methods.
* No attributes property.
* Because the properties and methods are on the same level the ActiveRecord methods & config-properties are prefixed with "$""
* Stripped out functionality that is provided by angular)
  * No getter/setter methods. (Angular has $scope.$watch)
  * No event system. (Angular has $scope.$emit)
  * No dependancy on underscore. (angular.extend, angular.isFunction, etc)
  * No dependancy on jQuery. (Angular has $http)
  * No Collection class. (Angular works with plain js Array's)

## Goals / Features (compared to ngResource)

 * Extendable OOP designed models (instance methods per type)
 * Enable parsing the response.
 * Allow default values.
 * Allow alternative backends
 * Allow alternative url schemes (like .json suffixed)
 * Minimal configuration (only an $urlRoot), the json-object from the rest-api is the spec.

 ## Usage example


 ```js
 module('myApp', ['ActiveRecord']); // Add "ActiveRecord" as module dependancy.

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

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
 * Allow alternative url schemes (like a .json suffix)
 * Minimal configuration (only a $urlRoot), the json-object from the rest-api is the spec.

## Examples

### Defining a model
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

### Defining Relations (Single-loaded from server)
This section is for single loaded nested data. If one of the property of a model is another relational model, it can be declared in `$relations` property. 

In the example below, there is an array property named `comments`, and each comment object will be automatically an instance of the `Comment` model. This also works for object properties.

Sample Nested Object of a Task model:
```js
var dataFromServer = {
	id: 1,
	name: "Learn ActiveRecord",
	comments: [
		{
			id: 1,
			text: "Woow! Cool!"
		},{
			id: 2,
			text: "Awesome!"
		}
	]
};

var task = new Task(dataFromServer);
console.log(task.comments); // array of Comment models
```
Models:
```js
app.factory('Task', function (ActiveRecord, Comment) {

	return ActiveRecord.extend({
		// ...some codes before
		$relations: {
			comments: {
				model: Comment
			}
		}
	});
});

app.factory('Comment', function (ActiveRecord, Comment) {
	return ActiveRecord.extend({
		// ...some codes 
	});
});
```

You can also rename the relation property instead of `comments`. 

```js
app.factory('Task', function (ActiveRecord, Comment) {

	return ActiveRecord.extend({
		// ...some codes before
		$relations: {
			coolComments: {
				model: Comment,
				prop: comments
			}
		}
	});
});

// This relation is now accessible via
console.log(Task.coolComments); // array of Comment models
```

### Fetching and saving data.
```js
module('myApp').controller('TaskCtrl', function ($scope, Task, $document) {

	Task.fetchOne(7).then(function (task7) { // Fetches '/api/tasks/7'
		$scope.task = task7;
		$document.title = task7.title  + ' - MyApp';
	});

	/**
	 * @param {Task} task
	 */
	$scope.saveTask = function (task) {
		$scope.spinnerVisible = true;
		task.$save().then(function () {
			$scope.successVisible = true;
		}).catch(function (error) {
			$scope.error = error;
		}).finally(function () {
			$scope.spinnerVisible = false;
		});
	};
});
```

### Loading models via ngRoute

```js
module('myApp', ['ngRoute']).config(function ($routeProvider) {
	$routeProvider
		.when('/tasks', {
			templateUrl: 'tasks.html',
			controller: 'TaskListCtrl',
			resolve: {
				tasks: function (Task) {
					return Task.fetchAll();
				}
			}
		})
		.when('/tasks/:taskId', {
			templateUrl: 'task.html',
			controller: 'TaskCtrl',
			resolve: {
				task: function ($routeParams, Task) {
					return Task.fetchOne($routeParams.taskId);
				}
			}
		});
});

module('myApp').controller('TaskCtrl', function ($scope, task) {
	$scope.task = task;
});
```

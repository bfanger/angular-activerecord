describe("ActiveRecord", function() {
	"use strict";

	beforeEach(function () {
		module('ActiveRecord');
		module('ExampleFilters');
	});


	var $httpBackend, ActiveRecord;

	beforeEach(inject(function($injector) {
		$httpBackend = $injector.get('$httpBackend');
		ActiveRecord = $injector.get('ActiveRecord');
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("initialize", function() {
		var Model = ActiveRecord.extend({
			$initialize: function() {
				this.one = 1;
			}
		});
		var model = new Model();
		expect(model.one).toBe(1);
	});

	it("initialize with attributes and options", function() {
		var Model = ActiveRecord.extend({
			$initialize: function(attributes, options) {
				this.one = options.one;
			}
		});
		var model = new Model({}, {one: 1});
		expect(model.one).toBe(1);
	});

	it("initialize with parsed attributes", function() {
		var Model = ActiveRecord.extend({
			$parse: function(attrs) {
				attrs.value += 1;
				return attrs;
			}
		});
		var model = new Model({value: 1}, {parse: true});
		expect(model.value).toBe(2);
	});

	it("initialize with defaults", function() {
		var Model = ActiveRecord.extend({
			defaults: {
				first_name: 'Unknown',
				last_name: 'Unknown'
			}
		});
		var model = new Model({first_name: 'John'});
		expect(model.first_name, 'John');
		expect(model.last_name, 'Unknown');
	});

	var createBasicModel = function () {
		var Model = ActiveRecord.extend({
			$urlRoot: '/resources'
		});
		return new Model();
	};

	it("change, hasChanged, changedAttributes, previous, previousAttributes", function() {
		var model = new ActiveRecord({name: "Tim", age: 10});
		expect(model.$changedAttributes()).toEqual({});
		expect(model.$hasChanged()).toBe(false);
		model.name = 'Rob';
		expect(model.$hasChanged('name')).toBe(true, 'name changed');
		expect(model.$hasChanged('age')).toBe(false, 'age did not');
		expect(model.$changedAttributes()).toEqual({name: 'Rob'}, 'changedAttributes returns the changed properties');
		expect(model.$previous('name')).toBe('Tim');
		expect(model.$previousAttributes()).toEqual({name: "Tim", age: 10}, 'previousAttributes is correct');
	});

	it("changedAttributes", function() {
		var model = new ActiveRecord({a: 'a', b: 'b'});
		expect(model.$changedAttributes()).toEqual({});
		expect(model.$changedAttributes({a: 'a'})).toEqual({});
		expect(model.$changedAttributes({a: 'b'})).toEqual({a: 'b'});
	});

	it("previousAttributes are syched with fetch", function () {
		var model = createBasicModel();
		expect(model.$previousAttributes()).toEqual({});
		model.id = 1;
		$httpBackend.expectGET('/resources/1').respond('{"id": 1, "title": "Fetched"}');
		model.$fetch();
		$httpBackend.flush();
		expect(model.$previousAttributes()).toEqual({id: 1, title: "Fetched"});
		model.title = 'Changed';
		expect(model.$changedAttributes()).toEqual({title: 'Changed'});
		expect(model.$previous('title')).toBe('Fetched');
	});

	it("previousAttributes are syched with save", function () {
		var model = createBasicModel();
		model.id = 1;
		model.title = 'Saving';

		expect(model.$previousAttributes()).toEqual({});
		$httpBackend.expectPUT('/resources/1').respond('{"id": 1, "title": "Saved"}');
		model.$save();
		$httpBackend.flush();
		expect(model.$previousAttributes()).toEqual({id: 1, title: "Saved"});
		model.title = 'Changed';
		expect(model.$changedAttributes()).toEqual({title: 'Changed'});
		expect(model.$previous('title')).toBe('Saved');
	});

	it("save", function() {
		$httpBackend.expectPOST('/resources', '{"title":"Henry V "}').respond('{"id": 1, "title": "Henry V"}');
		var model = createBasicModel();
		model.$save({title : "Henry V "}).then(function (result) {
			expect(result).toBe(model);
			expect(model.id).toBe(1);
			expect(model.title).toBe('Henry V');
		});
		$httpBackend.flush();
	});

	it("delete", function() {
		$httpBackend.expectDELETE('/resources/1').respond('');
		var model = createBasicModel();
		model.id = 1;
		model.$destroy().then(function(){
			// no expectations
		});
		$httpBackend.flush();
	});

	it("save with custom id attribute", function() {
		$httpBackend.expectPUT('/resources/1', '{"_id":1,"title":"Henry V "}').respond('{"id": 1, "title": "Henry V"}');
		var CustomIdModel = ActiveRecord.extend({
			$idAttribute: '_id',
			$urlRoot: '/resources'
		});
		var model = new CustomIdModel();
		model.$save({_id: 1, title : "Henry V "}).then(function (result) {
			expect(result).toBe(model);
			expect(model._id).toBe(1);
			expect(model.title).toBe('Henry V');
		});
		$httpBackend.flush();
	});

	it("save in positional style", function() {
		$httpBackend.expectPOST('/resources', '{"title":"Twelfth Night"}').respond('');
		var model = createBasicModel();
		model.$save('title', 'Twelfth Night').then(function (result) {
			expect(result).toBe(model);
			expect(model.title).toBe('Twelfth Night');
		});
		$httpBackend.flush();
	});

	it("save with non-object success response", function () {
		$httpBackend.expectPUT('/resources/1', '{"id":1,"title":"Henry V"}').respond('');
		var model = createBasicModel();
		model.$save({id: 1, title: 'Henry V'}).then(function (result) {
			expect(result).toBe(model);
			expect(model.title).toBe('Henry V');
		});
		$httpBackend.flush();
	});

	it('fetchOne', function () {
		var Model = ActiveRecord.extend({
			$urlRoot: '/resources/'
		});
		$httpBackend.expectGET('/resources/1').respond( {id: 1, name: 'Test'});
		Model.fetchOne(1).then(function (model) {
			expect(model.id).toBe(1);
			expect(model.name).toBe('Test');
		});
		$httpBackend.flush();
	 });

	it('convert properties with $readFilters', function() {
		var Model = ActiveRecord.extend({
			$urlRoot: '/resources/',
			$readFilters: {
				// basic filter via angular registered filters
				date: 'toDateObject',
				// filtering via a function
				title: function (title) {
					return title + ' Extraordinaire';
				},
				'address.street': 'suffix:", London"|uppercase' // Even works on nested properties and multiple filters
			}
		});
		$httpBackend.expectGET('/resources/1').respond({id: 1, date: '2013-07-30T17:59:35.220Z', title: 'Detective', address: {street: '221B Baker street'}});
		Model.fetchOne(1).then(function(model) {
			expect(model.id).toBe(1);
			expect(model.date).toEqual(jasmine.any(Date));
			expect(model.title).toBe('Detective Extraordinaire');
			expect(model.address.street).toBe('221B BAKER STREET, LONDON');
		});
		$httpBackend.expectGET('/resources/').respond([{id: 1, date: '2013-07-30T17:59:35.220Z'}]);
		Model.fetchAll().then(function(models) {
			expect(models[0].id).toBe(1);
			expect(models[0].date).toEqual(jasmine.any(Date));
		});

		$httpBackend.expectPUT('/resources/2', '{"id":2,"date":"2013-04-10T00:00:00.000Z"}').respond('{"id": 2, "date": "2013-07-30T00:00:00.000Z"}');
		var model = new Model({
			id: 2,
			date: new Date(Date.UTC(2013, 3, 10))
		});
		model.$save().then(function(result) {
			expect(result).toBe(model);
			expect(model.date).toEqual(jasmine.any(Date));
			expect(model.date.toISOString()).toBe('2013-07-30T00:00:00.000Z'); // the date from response is converted via the filter
		});
		$httpBackend.flush();
	});

	it('Applies $writeFilters before save', function() {
		var Model = ActiveRecord.extend({
			$urlRoot: '/resources/',
			$writeFilters: {
				date: 'date:"shortDate"' // @see http://docs.angularjs.org/api/ng.filter:date
			}
		});
		$httpBackend.expectPOST('/resources/', '{"date":"7/30/13"}').respond('{"id": 1}');
		var model = new Model({
			date: new Date(Date.UTC(2013, 6, 30))
		});
		model.date.$special = 'remember me';
		model.$save().then(function(result) {
			expect(result).toBe(model);
			// No `date` in response so the model.date should be the same object as before.
			expect(model.date).toEqual(jasmine.any(Date));
			expect(model.date.toISOString()).toBe('2013-07-30T00:00:00.000Z');
			expect(model.date.$special).toBe('remember me');
		});
		$httpBackend.flush();
	});

});
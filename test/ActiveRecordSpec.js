describe("ActiveRecord", function() {

	beforeEach(angular.mock.module("ActiveRecord"));

	var $httpBackend, ActiveRecord;

	beforeEach(inject(function($injector) {
		$httpBackend = $injector.get('$httpBackend');
		ActiveRecord = $injector.get('ActiveRecord');
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('fetches data', function () {
		var TestRecord = ActiveRecord.extend({
	 		$urlRoot: '/resources/'
		});

		$httpBackend.expectGET('/resources/1').respond( {id: '1', name: 'Test1'});
		TestRecord.fetchOne(1).then(function (test1) {
			expect(test1.id).toBe('1');
			expect(test1.name).toBe('Test1');
		});
		$httpBackend.flush();
	 });
});
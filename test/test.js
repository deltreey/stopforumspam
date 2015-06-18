'use strict';
var assert = require('assert');
var stopforumspam = require('../');

describe('stopforumspam node module', function () {
	describe('#config', function () {
		it('should set some defaults', function () {
	    assert.deepEqual(stopforumspam.config, {
				url: 'http://stopforumspam.com',
				routes: [{
					name: 'search',
					path: '/api?f=json'
				},{
					name: 'submit',
					path: '/add.php?api_key=%s'
				}],
				searchParameters: [{
					name: 'ip',
					searchAdd: '&ip=%s',
					submitAdd: '&ip_addr=%s'
				},{
					name: 'email',
					searchAdd: '&email=%s',
					submitAdd: '&email=%s'
				},{
					name: 'username',
					searchAdd: '&username=%s',
					submitAdd: '&username=%s'
				}],
				apiKey: ''
	    });
	  });
	});

	describe('#isSpammer', function () {
		describe('@username', function () {
			it('can find users by username alone', function (done) {
				// Given: a common username likely to be a spammer
				var username = 'username';
				
				// When: we call isSpammer
				stopforumspam.isSpammer({ username: username })

				// Then: we should see the data come back truthish as an object
					.then(function (result) {
						assert(result);
						assert.equal(typeof(result), typeof({}));
						done();
					})
					.catch(function (error) {
						done(error);
					});
			});

			it('returns false when only username is provided and username is not fonud', function (done) {
				// Given: a very unusual username unlikely to even be permitted
				var username = 'Z5Anymsu1SYIuY6m4QG9P2T6E3O2yzdbBpo45Ura08uZE';
				
				// When: we call isSpammer
				stopforumspam.isSpammer({ username: username })

				// Then: we should see the result is false
					.then(function (result) {
						assert.equal(false, result);
						done();
					})
					.catch(function (error) {
						done(error);
					});
			});
		});

		describe('@ip', function () {
			it('can find users by ip alone', function (done) {
				// Given: a common ip likely to be a spammer
				var ip = '37.57.200.173';	// top spammer on 6/15/2015
				
				// When: we call isSpammer
				stopforumspam.isSpammer({ ip: ip })

				// Then: we should see the data come back truthish as an object
					.then(function (result) {
						assert(result);
						assert.equal(typeof(result), typeof({}));
						done();
					})
					.catch(function (error) {
						done(error);
					});
			});
			
			it('returns false when only ip is provided and ip is not fonud', function (done) {
				// Given: a very safe ip unlikely to be considered spam
				var ip = '8.8.8.8';	// google's DNS, probably whitelisted
				
				// When: we call isSpammer
				stopforumspam.isSpammer({ ip: ip })

				// Then: we should see the result is false
					.then(function (result) {
						assert.equal(false, result);
						done();
					})
					.catch(function (error) {
						done(error);
					});
			});
		});

		describe('@email', function () {
			it('can find users by email alone', function (done) {
				// Given: a common email likely to be a spammer
				var email = 'cuanegbuytodyd@gmail.com';	// top spammer on 6/15/2015
				
				// When: we call isSpammer
				stopforumspam.isSpammer({ email: email })

				// Then: we should see the data come back truthish as an object
					.then(function (result) {
						assert(result);
						assert.equal(typeof(result), typeof({}));
						done();
					})
					.catch(function (error) {
						done(error);
					});
			});
			
			it('returns false when only email is provided and email is not fonud', function (done) {
				// Given: a very safe email unlikely to be considered spam
				var email = 'support@gmail.com';	// google's support team, probably whitelisted
				
				// When: we call isSpammer
				stopforumspam.isSpammer({ email: email })

				// Then: we should see the result is false
					.then(function (result) {
						assert.equal(false, result);
						done();
					})
					.catch(function (error) {
						done(error);
					});
			});
		});
	});

	// skip submit function because it adds to SFS and has to be cleared manually
	describe.skip('#submit', function () {
		before(function() {
	    stopforumspam.config.apiKey = '';
	  });

		describe('@username', function () {
			it('can find users by username', function (done) {
				// Given: a common username likely to be a spammer, and the stopforumspam config set to use username only
				var username = 'username';
				var ip = '37.57.200.173';	// top spammer on 6/15/2015
				var email = 'kamfertina14382@mail.ru';	// second top spammer on 6/15/2015
				
				// When: we call submit
				stopforumspam.submit({ username: username, ip: ip, email: email })

				// Then: we should see the data come back truthish as an object
					.then(function () {
						done();
					})
					.catch(function (error) {
						done(error);
					});
			});
		});
	});

	describe('#Key', function () {
		it('should set the configuration apiKey setting', function () {
			// Given: the apiKey set explicitly, and a new key value
			stopforumspam.config.apiKey = 'nothing';
			var key = 'something';

			// When: we call Key with the new key value
			stopforumspam.Key(key);

			// Then: we should see the apiKey has been changed
			assert.equal(key, stopforumspam.config.apiKey);
		});

		it('should return the value of the configuration apiKey setting', function () {
			// Given: the apiKey set explicitly
			var key = 'nothing';
			stopforumspam.config.apiKey = key;

			// When: we call Key with no value
			stopforumspam.Key();

			// Then: we should see the apiKey has been changed
			assert.equal(key, stopforumspam.config.apiKey);
		});

		it('should can set the apiKey to a falsy value', function () {
			// Given: the apiKey set explicitly
			stopforumspam.config.apiKey = 'nothing';

			// When: we call Key with an empty string
			stopforumspam.Key('');

			// Then: we should see the apiKey has been changed
			assert.equal(false, stopforumspam.config.apiKey);
		});
	});
});

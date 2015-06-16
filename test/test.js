'use strict';
var assert = require('assert'),
		_ = require('lodash');
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
					use: true,
					searchAdd: '&ip=%s',
					submitAdd: '&ip_addr=%s'
				},{
					name: 'email',
					use: true,
					searchAdd: '&email=%s',
					submitAdd: '&email=%s'
				},{
					name: 'username',
					use: false,
					searchAdd: '&username=%s',
					submitAdd: '&username=%s'
				}],
				apiKey: ''
	    });
	  });
	});

	describe('#isSpammer', function () {
		describe('@username', function () {
			it('can find users by username, when set to true', function (done) {
				// Given: a common username likely to be a spammer, and the stopforumspam config set to use username only
				var username = 'username';
				_.findWhere(stopforumspam.config.searchParameters, { name: 'username' }).use = true;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'ip' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'email' }).use = false;
				
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

			it('returns false when only username is selected and username is not fonud', function (done) {
				// Given: a very unusual username unlikely to even be permitted, and the stopforumspam config set to use username only
				var username = 'Z5Anymsu1SYIuY6m4QG9P2T6E3O2yzdbBpo45Ura08uZE';
				_.findWhere(stopforumspam.config.searchParameters, { name: 'username' }).use = true;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'ip' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'email' }).use = false;
				
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
			it('can find users by ip, when set to true', function (done) {
				// Given: a common ip likely to be a spammer, and the stopforumspam config set to use ip only
				var ip = '37.57.200.173';	// top spammer on 6/15/2015
				_.findWhere(stopforumspam.config.searchParameters, { name: 'username' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'ip' }).use = true;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'email' }).use = false;
				
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
			
			it('returns false when only ip is selected and ip is not fonud', function (done) {
				// Given: a very safe ip unlikely to be considered spam, and the stopforumspam config set to use ip only
				var ip = '8.8.8.8';	// google's DNS, probably whitelisted
				_.findWhere(stopforumspam.config.searchParameters, { name: 'username' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'ip' }).use = true;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'email' }).use = false;
				
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
			it('can find users by email, when set to true', function (done) {
				// Given: a common email likely to be a spammer, and the stopforumspam config set to use email only
				var email = 'cuanegbuytodyd@gmail.com';	// top spammer on 6/15/2015
				_.findWhere(stopforumspam.config.searchParameters, { name: 'username' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'ip' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'email' }).use = true;
				
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
			
			it('returns false when only email is selected and email is not fonud', function (done) {
				// Given: a very safe email unlikely to be considered spam, and the stopforumspam config set to use email only
				var email = 'support@gmail.com';	// google's support team, probably whitelisted
				_.findWhere(stopforumspam.config.searchParameters, { name: 'username' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'ip' }).use = false;
				_.findWhere(stopforumspam.config.searchParameters, { name: 'email' }).use = true;
				
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

	describe('#checkAndSubmit', function () {
		// TODO: test this
	});
});

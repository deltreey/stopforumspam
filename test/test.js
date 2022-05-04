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
					path: '/api?f=json&nobadusername'
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
				var username = 'homeautomation';

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
				var ip = '195.242.103.103'; // Reported Feb 1 2022

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

			it('returns false when only ipv4 is provided and ip is not fonud', function (done) {
				// Given: a very safe ip unlikely to be considered spam
				var ip = '127.0.0.1';	// localhost IPv4

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

			it('returns false when only ipv6 is provided and ip is not fonud', function (done) {
				// Given: a very safe ip unlikely to be considered spam
				var ip = '0:0:0:0:0:0:0:1';	// localhost IPv6

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


			it('throws an error on invalid IP', function (done) {
				// Given: an invalid IP address
				var ip = 'not-a-valid-address'; // fake

				// When: we call isSpammer with the IP address
				stopforumspam.isSpammer({ ip: ip })

				// Then: we should see an error occur
					.then(function () {
						done(new Error('This should throw an error.'));
					})
					.catch(function (error) {
						assert.equal('Error: The searched IP is not a valid IP address', error.toString());
						done();
					});
			});
		});

		describe('@email', function () {
			it('can find users by email alone', function (done) {
				// Given: a common email likely to be a spammer
				var email = 'admin@noexist.xx';	// Reported Feb 1 2022

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

			it('throws an error on invalid email', function (done) {
				// Given: an invalid email address
				var email = 'thisIsNot@nEmail';	//not a real email

				// When: we call isSpammer with the IP address
				stopforumspam.isSpammer({ email: email })

				// Then: we should see an error occur
					.then(function () {
						done(new Error('This should throw an error.'));
					})
					.catch(function (error) {
						assert.equal('Error: The searched email is not a valid email address', error.toString());
						done();
					});
			});
		});

		it('finds spammers by all parameters', function (done) {
			// Given: a spammer ip, username, and email
			var username = 'admin';
			var email = 'admin@noexist.xx';	// Reported Feb 1 2022
			var ip = '195.242.103.103'; // Reported Feb 1 2022

			// When: we call isSpammer
			stopforumspam.isSpammer({ username: username, email: email, ip: ip })

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

		it('finds users by email and username', function (done) {
			// Given: a common username likely to be a spammer, and a spammer email
			var username = 'admin';
			var email = 'admin@noexist.xx';	// Reported Feb 1 2022

			// When: we call isSpammer
			stopforumspam.isSpammer({ username: username, email: email })

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

		it('finds users by ip and username', function (done) {
			// Given: a common username likely to be a spammer, and a spammer ip
			var username = 'admin';
			var ip = '195.242.103.103'; // Reported Feb 1 2022

			// When: we call isSpammer
			stopforumspam.isSpammer({ username: username, ip: ip })

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

		it('finds users by ip and email', function (done) {
			// Given: a spammer ip and email
			var email = 'admin@noexist.xx';	// Reported Feb 1 2022
			var ip = '195.242.103.103'; // Reported Feb 1 2022

			// When: we call isSpammer
			stopforumspam.isSpammer({ email: email, ip: ip })

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

		it('does not hang with null/undefined parameters', function (done) {
			// Given: a spammer username, a null email, and an undefined ip
			var username = 'homeautomation';
			var email = null;
			var ip = undefined; // jshint ignore:line

			// When: we call isSpammer
			stopforumspam.isSpammer({ username: username, email: email, ip: ip })

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
	});

	// skip submit function because it adds to SFS and has to be cleared manually
	describe('#submit', function () {
		before(function() {
	    stopforumspam.config.apiKey = '';
	  });

		describe('@username', function () {
			it('can find users by username', function (done) {
				// Given: a common username likely to be a spammer, and the stopforumspam config set to use username only
				var username = 'admin';
				var ip = '195.242.103.103'; // Reported Feb 1 2022
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

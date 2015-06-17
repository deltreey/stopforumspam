'use strict';

var request = require('request'),
		sprintf = require('sprintf-js').sprintf,
		_ = require('lodash'),
		Q = require('q'),
		utf8 = require('utf8');

/**
* StopForumSpam Module
* @exports stopforumspam
* @namespace sfs
*/
var sfs = {
	/**
	* Default Configuration settings for stopforumspam
	*/
	config: {
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
			searchWith: true,
			submitWhen: true,
			searchAdd: '&ip=%s',
			submitAdd: '&ip_addr=%s'
		},{
			name: 'email',
			searchWith: true,
			submitWhen: true,
			searchAdd: '&email=%s',
			submitAdd: '&email=%s'
		},{
			name: 'username',
			searchWith: false,
			submitWhen: false,
			searchAdd: '&username=%s',
			submitAdd: '&username=%s'
		}],
		apiKey: ''
	}
};

/**
* Checks if a user is a spammer.  This relies heavily on searchParameters searchWith values.
* @param userObject should contain properties for each searchParameter where use is set to true
* @example
* stopforumspam.isSpammer({ ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' })
*   .then(function (result) {
*   // result if false if not found
*   // result = {
*   //   success: 1,
*   //   username: {
*   //     lastseen: '2015-03-09 15:22:49',
*   //     frequency: 3830,
*   //     appears: 1,
*   //     confidence: 90.2 } }
* });
* @returns Promise which returns true if the user is found on StopForumSpam.com
*/
sfs.isSpammer = function (userObject) {
	var deferred = Q.defer();

	var url = sfs.config.url + _.findWhere(sfs.config.routes, { name: 'search' }).path;
	_.each(sfs.config.searchParameters, function (parameter) {
		if (parameter.use) {
			if (!userObject[parameter.name]) {
				// send an error to the console, but this isn't really crashworthy
				console.error(sprintf('Parameter: %s required but not defined', parameter.name));
			}
			else {
				url += sprintf(parameter.searchAdd, encodeURIComponent(utf8.encode(userObject[parameter.name])));
			}
		}
	});

	request(url, function (error, response, body) {
		if (error) { return deferred.reject(error); }
		if (response.statusCode !== 200) { return deferred.reject(new Error('Response Status: ' + response.statusCode + ', ' + body)); }
		var result = false;
		var jsBody = JSON.parse(body);

		_.each(sfs.config.searchParameters, function (parameter) {
			if (parameter.use && userObject[parameter.name] && jsBody[parameter.name].appears > 0) {
				result = JSON.parse(body);
			}
		});
		deferred.resolve(result);
	});

	return deferred.promise;
};

/**
* Syncronous version of isSpammer
* Uses ES6 yield trick https://github.com/luciotato/waitfor-ES6#the-funny-thing-is
*/
sfs.isSpammerSync = function* (userObject) {
	yield [sfs.isSpammer, userObject];
};

/**
* Submits the user to StopForumSpam.com under your API key
* Requires config.apiKey is set
* @param userObject must contain properties for each searchParameter
* 	empty parameters will throw an error
* @example
* stopforumspam.Key('some-api-key');
* // or stopforumspam.config.apiKey = 'some-api-key';
* stopforumspam.submit({ ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' }, 'Caught You!');
* @param evidence {string} (optional) you can tell StopForumSpam.com your reasoning if you like
* @returns Promise
*/
sfs.submit = function (userObject, evidence) {
	var deferred = Q.defer();
	if (!sfs.config.apiKey) {
		deferred.reject(new Error('You cannot submit spammers without an API Key.'));
	}
	else {
		var url = sfs.config.url + sprintf(_.findWhere(sfs.config.routes, { name: 'submit' }).path, sfs.config.apiKey);
		var error = false;
		_.each(sfs.config.searchParameters, function (parameter) {
			if (!userObject[parameter.name]) {
				error = true;
			}
			else {
				url += sprintf(parameter.searchAdd, encodeURIComponent(utf8.encode(userObject[parameter.name])));
			}
		});
		if (error) {
			deferred.reject(new Error('You must have all search parameters for StopForumSpam.com to accept your submission.'));
		}
		else {
			if (evidence) {
				// unescape in JS is a simple way to convert to UTF-8, which StopForumSpam requires
				url += sprintf('&evidence=%s', encodeURIComponent(utf8.encode(evidence)));
			}

			request(url, function (error, response, body) {
				if (error) { return deferred.reject(error); }
				if (response.statusCode !== 200) { return deferred.reject(new Error('Response Status: ' + response.statusCode + ', ' + body)); }
				
				deferred.resolve();
			});
		}
	}

	return deferred.promise;
};

/**
* Syncronous version of submit
* Uses ES6 yield trick https://github.com/luciotato/waitfor-ES6#the-funny-thing-is
*/
sfs.submitSync = function* (userObject, evidence) {
	yield [sfs.submit, userObject, evidence];
};

/**
* Checks if the user is a spammer, and submits them back to StopForumSpam.com automatically if they are.
* Requires config.apiKey is set.  This relies heavily on the searchParameters submitWhen values
* @param userObject should contain properties for each searchParameter
* @example
* stopforumspam.Key('some-api-key');
* // or stopforumspam.config.apiKey = 'some-api-key';
* stopforumspam.checkAndSubmit({ ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' }, 'Found on StopForumSpam.com and resubmitted')
*   .then(function (result) {
*   // result if false if not found
*   // result = {
*   //   success: 1,
*   //   username: {
*   //     lastseen: '2015-03-09 15:22:49',
*   //     frequency: 3830,
*   //     appears: 1,
*   //     confidence: 90.2 } }
* });
* @param evidence {string} (optional) you can tell StopForumSpam.com your reasoning if you like
* @returns Promise
*/
sfs.checkAndSubmit = function (userObject, evidence) {
	var deferred = Q.defer();

	sfs.isSpammer(userObject)
		.then(function (findings) {
			if (findings) {
				var submit = true;
				_.each(sfs.config.searchParameters, function (parameter) {
					if (parameter.submitWhen && findings[parameter.name] === 0) {
						submit = false;
					}
				});
				if (submit) {
					sfs.submit(userObject, evidence)
						.then(deferred.resolve(findings))
						.catch(deferred.reject);
				}
			}
		}, function (error) {
			deferred.reject(error);
		});

	return deferred.promise;
};

/**
* Syncronous version of checkAndSubmit
* Uses ES6 yield trick https://github.com/luciotato/waitfor-ES6#the-funny-thing-is
*/
sfs.checkAndSubmitSync = function* (userObject, evidence) {
	yield [sfs.checkAndSubmit, userObject, evidence];
};

/**
* Creates a user object to utilize the APi in a more human manner
* @memberOf sfs
* @namespace User
* @param ip {string} the IP address of the user
* @param email {string} the email address of the user
* @param username {string} the username of the user
*/
sfs.User = function (ip, email, username) {
	return {
		ip: ip,
		email: email,
		username: username
	};
};

/**
* The User object implements isSpammer
* @example
* var sfsUser = stopforumspam.User('123.456.789.100', 'test@test.com', 'Spammer!');
* sfsUser.isSpammer().then(function (result) {
*   // do something with result
* });
*/
sfs.User.prototype.isSpammer = function () {
	return sfs.isSpammer(this);
};

/**
* The User object implements isSpammerSync
*/
sfs.User.prototype.isSpammerSync = function* () {
	yield [this.isSpammer];
};

/**
* The User object implements submit
* @example
* var sfsUser = stopforumspam.User('123.456.789.100', 'test@test.com', 'Spammer!');
* sfsUser.submit();
*/
sfs.User.prototype.submit = function (evidence) {
	return sfs.submit(this, evidence);
};

/**
* The User object implements submitSync
*/
sfs.User.prototype.submitSync = function* (evidence) {
	yield [this.submit, evidence];
};

/**
* The User object implements checkAndSubmit
* @example
* var sfsUser = stopforumspam.User('123.456.789.100', 'test@test.com', 'Spammer!');
* sfsUser.checkAndSubmit().then(function (result) {
*   // ...maybe stop the user from logging in if result is not false?
* });
*/
sfs.User.prototype.checkAndSubmit = function (evidence) {
	return sfs.checkAndSubmit(this, evidence);
};

/**
* The User object implements checkAndSubmitSync
*/
sfs.User.prototype.checkAndSubmitSync = function* (evidence) {
	yield [this.checkAndSubmit, evidence];
};

/**
* Getter & Setter for the API Key
* @param key {string} The API Key for StopForumSpam.com  Necessary for
* 	submitting users to the database.  Unset it with an empty string or false.
* @returns {string} The current API Key as it is set 
*/
sfs.Key = function(key) {
	if (key !== null) {
		sfs.config.apiKey = key;
	}

	return sfs.config.apiKey;
};

/**
* Decide which parameters to use for searches
* @param useParameters {array} an array of parameter names to search with
* @example
* stopforumspam.SearchWith(['ip', 'email', 'username']);
*/
sfs.SearchWith = function (useParameters) {
	_.each(sfs.config.searchParameters, function(parameter) {
		if (useParameters.indexOf(parameter.name)) {
			parameter.searchWith = true;
		}
		else {
			parameter.searchWith = false;
		}
	});
};

/**
* Decide which parameters to automatically submit when matched using checkAndSubmit
* @param useParameters {array} an array of parameter names required to be matched for automatic
* 	submission
* @example
* stopforumspam.SubmitWhenMatched(['ip', 'email', 'username']);
*/
sfs.SubmitWhenMatched = function (useParameters) {
	_.each(sfs.config.searchParameters, function(parameter) {
		if (useParameters.indexOf(parameter.name)) {
			parameter.submitWhen = true;
		}
		else {
			parameter.submitWhen = false;
		}
	});
};

module.exports = sfs;

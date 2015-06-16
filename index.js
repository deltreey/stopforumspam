'use strict';

var request = require('request'),
		sprintf = require('sprintf-js').sprintf,
		_ = require('lodash'),
		Q = require('q'),
		utf8 = require('utf8');

var sfs = {
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
	}
};

/**
* Checks if a user is a spammer
* @param userObject should contain properties for each searchParameter where use is set to true
* 	@example: { ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' }
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
* Submits the user to StopForumSpam.com under your API key
* Requires config.apiKey is set
* @param userObject must contain properties for each searchParameter
* 	empty parameters will throw an error
* 	@example: { ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' }
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
* Checks if the user is a spammer, and submits them back to StopForumSpam.com automatically if they are
* Requires config.apiKey is set
* @param userObject should contain properties for each searchParameter
* 	@example: { ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' }
* @param evidence {string} (optional) you can tell StopForumSpam.com your reasoning if you like
* 	example: 'Found on StopForumSpam.com and resubmitted'
* @returns Promise
*/
sfs.checkAndSubmit = function (userObject, evidence) {
	var deferred = Q.defer();

	sfs.isSpammer(userObject)
		.then(function (findings) {
			if (findings) {
				sfs.submit(userObject, evidence)
					.then(deferred.resolve)
					.catch(deferred.reject);
			}
		}, function (error) {
			deferred.reject(error);
		});

	return deferred.promise;
};

module.exports = sfs;

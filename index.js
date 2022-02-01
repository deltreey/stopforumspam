'use strict';

// this is necessary due to a change in node-fetch that no longer supports require
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var _ = require('lodash'),
		Q = require('q'),
		utf8 = require('utf8'),
		validator = require('validator');

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
			path: '/api?f=json&nobadusername'	// ignore partial username string search
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
	}
};

/**
	* Checks if a user is a spammer.  Pass only the parameters you wish to search for
	* @param userObject {object} a hashlike object with each of the  parameters to search for.
	* 	Search for as many or as few as you wish.
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
	* @throws throws an error if the email or IP is passed and invalid or the IP is not IPv4.
	* 	Stopforumsspam.com does not support IPv6 addresses.
	* @throws throws any error it recieves from the response, including status codes that are not 200
*/
sfs.isSpammer = function (userObject) {
	var deferred = Q.defer();

	var url = sfs.config.url + _.find(sfs.config.routes, { name: 'search' }).path;
	var fail = false;
	_.each(sfs.config.searchParameters, function (parameter) {
		if (userObject[parameter.name]) {
			if (parameter.name === 'email' && userObject[parameter.name] && !validator.isEmail(userObject[parameter.name])) {
				fail = 'email';
			}
			else if (parameter.name === 'ip' && userObject[parameter.name] && !validator.isIP(userObject[parameter.name], 4)) {
				fail = 'ip';
			}
			url += parameter.searchAdd.replace('%s', encodeURIComponent(utf8.encode(userObject[parameter.name])));
		}
	});

	if (fail) {
		if (fail === 'email') {
			deferred.reject(new Error('The searched email is not a valid email address'));
		}
		else if (fail === 'ip') {
			deferred.reject(new Error('The searched IP is not a valid IPv4 address'));
		}
	}
	else {
		fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          return deferred.reject(new Error('Response Status: ' + response.statusCode));
        }
        return response.json();
      })
      .then((jsBody) => {
        var result = false;
        _.each(sfs.config.searchParameters, function (parameter) {
          if (userObject[parameter.name] && jsBody[parameter.name].appears > 0) {
            result = jsBody;
          }
        });
        deferred.resolve(result);
      }).catch((error) => {
        return deferred.reject(error);
    });
	}

	return deferred.promise;
};

/**
	* Synchronous version of isSpammer
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
	* @throws throws an error if you have not set the API key
	* @throws throws an error if you don't pass a user object with all of the parameters
	* 	(ip, email, & username)
	* @throws throws any error it recieves from the response, including status codes that are not 200
*/
sfs.submit = function (userObject, evidence) {
	var deferred = Q.defer();
	if (!sfs.config.apiKey) {
		deferred.reject(new Error('You cannot submit spammers without an API Key.'));
	}
	else {
		var url = sfs.config.url + _.find(sfs.config.routes, { name: 'submit' }).path.replace('%s', sfs.config.apiKey);
		var error = false;
		_.each(sfs.config.searchParameters, function (parameter) {
			if (!userObject[parameter.name]) {
				error = true;
			}
			else {
				url += parameter.searchAdd.replace('%s', encodeURIComponent(utf8.encode(userObject[parameter.name])));
			}
		});
		if (error) {
			deferred.reject(new Error('You must have all search parameters for StopForumSpam.com to accept your submission.'));
		}
		else {
			if (evidence) {
				// unescape in JS is a simple way to convert to UTF-8, which StopForumSpam requires
				url += `&evidence=${encodeURIComponent(utf8.encode(evidence))}`;
			}

			fetch(url)
        .then((response) => {
          if (response.status !== 200) { return deferred.reject(new Error('Response Status: ' + response.statusCode)); }

          deferred.resolve();
        }).catch((error) => {
          return deferred.reject(error);
      });
		}
	}

	return deferred.promise;
};

/**
	* Synchronous version of submit
	* Uses ES6 yield trick https://github.com/luciotato/waitfor-ES6#the-funny-thing-is
*/
sfs.submitSync = function* (userObject, evidence) {
	yield [sfs.submit, userObject, evidence];
};

/**
	* Creates a user object to utilize the APi in a more human manner
	* @memberOf sfs
	* @namespace User
	* @param ip {string} the IP address of the user
	* @param email {string} the email address of the user
	* @param username {string} the username of the user
	* @throws throws an error if the email or IP is passed and invalid or the IP is not IPv4.
	* 	Stopforumsspam.com does not support IPv6 addresses.
*/
sfs.User = function (ip, email, username) {
	if (email && !validator.isEmail(email)) {
		throw new Error('The email address is not a valid email address');
	}
	if (ip && !validator.isIP(ip, 4)) {
		throw new Error('The IP address is not a valid IPv4 address');
	}
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
	* Getter & Setter for the API Key
	* @param key {string} The API Key for StopForumSpam.com  Necessary for
	* 	submitting users to the database.  Unset it with an empty string or false.
	* @returns {string} The current API Key as it is set
*/
sfs.Key = function(key) {
	if (key !== undefined) {
		sfs.config.apiKey = key;
	}

	return sfs.config.apiKey;
};

module.exports = sfs;

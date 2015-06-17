# StopForumSpam

[![Join the chat at https://gitter.im/deltreey/stopforumspam](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/deltreey/stopforumspam?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url][![Code Climate](https://codeclimate.com/github/deltreey/stopforumspam/badges/gpa.svg)](https://codeclimate.com/github/deltreey/stopforumspam)[![Test Coverage](https://codeclimate.com/github/deltreey/stopforumspam/badges/coverage.svg)](https://codeclimate.com/github/deltreey/stopforumspam/coverage)[![bitHound Score](https://www.bithound.io/github/deltreey/stopforumspam/badges/score.svg?)](https://www.bithound.io/github/deltreey/stopforumspam)

> A nodejs wrapper for the [StopForumSpam.com][sfs] REST API


## Install

```sh
$ npm install --save stopforumspam
```


## Usage

```js
var stopforumspam = require('stopforumspam');
```

The simplest way to use this is to create a user like this
```js
var sfsUser = stopforumspam.User('127.0.0.1', 'test@test.com', 'testUserName');
```

Then you can check the stopforumspam.com database easily.
```js
sfsUser.isSpammer().then(function (result) {
	 .then(function (result) {
			// result is false if not found
			
			// if true result looks something like this
			// result = {
			//   success: 1,
			//   username: {
			//     lastseen: '2015-03-09 15:22:49',
			//     frequency: 3830,
			//     appears: 1,
			//     confidence: 90.2 } }
);
});
```

You can easily submit them if they're spammers too.
```js
stopforumspam.Key('my-api-key');
sfsUser.submit('This text is an optional way to tell SFS why you submitted the user.');
// you can use .then() if you want to wait until after the submit, though I can't imagine why
```

Or better yet, automatically submit the spammer if they're found
```js
sfs.Key('my-api-key');
sfsUser.checkAndSubmit('Found on StopForumSpam.com and resubmitted.')
	.then(function (result) {
		// result is just like isSpammer above, so you can use the information for your needs,
		// or bypass the then function altogether
	});
});
```

If you would prefer to call things manually, that's fine too.  For example:
```js
stopforumspam.isSpammer({ ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' })
	.then(function (result) {
		// result is just like above
	});
```

And if you're using ES6 and want synchronous code, then there's a Sync function for everything
```js
var spammer = stopforumspam.isSpammerSync({ ip: '123.456.789.100', email: 'test@test.com', username: 'Spammer!' });
if (spammer) {
	// do stuff
}
// User functions too!
var sfsUser = stopforumspam.User('127.0.0.1', 'test@test.com', 'testUserName');
if (sfsUser.isSpammerSync()) {
	// do stuff
}
```

## Configuration

By default, email and IP address is the only thing checked against StopForumSpam.com.  You can change this using the `SearchWith` function.
```js
stopforumspam.SearchWith(['ip', 'username']);
// searches will not check email, but will check username & ip
stopforumspam.SearchWith(['email']);
// searches will only check emails
```

By default, checkAndSubmit only submits spammers who match both IP & email on StopForumSpam.com.  This can be changed using the `SubmitWhenMatched` function.
```js
stopforumspam.SubmitWhenMatched(['ip', 'username']);
// searches will ignore email results, but will submit if both username & ip match
stopforumspam.SubmitWhenMatched([]);
// submissions will happen if any value that is searched for matches
```

## License

MIT © [Ted](https://github.com/deltreey)


[npm-image]: https://badge.fury.io/js/stopforumspam.svg
[npm-url]: https://npmjs.org/package/stopforumspam
[travis-image]: https://travis-ci.org/deltreey/stopforumspam.svg?branch=master
[travis-url]: https://travis-ci.org/deltreey/stopforumspam
[daviddm-image]: https://david-dm.org/deltreey/stopforumspam.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/deltreey/stopforumspam
[sfs]: http://stopforumspam.com

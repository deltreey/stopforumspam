# StopForumSpam

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> A nodejs wrapper for the StopForumSpam.com REST API


## Install

```sh
$ npm install --save stopforumspam
```


## Usage

```js
var stopforumspam = require('stopforumspam');

stopforumspam.isSpammer({ username: 'test', email: 'test@test.com', ip: '127.0.0.1' })
// @returns a Promise with the results
// false if not a spammer, an object showing matched information if found
	.then(function (found) {
		if (found) {
			console.log(found);	// details about the found user
		}
	});

stopforumspam.submit({ username: 'test', email: 'test@test.com', ip: '127.0.0.1' }, 'Caught You!');
// the second parameter is optional

stopforumspam.checkAndSubmit({ username: 'test', email: 'test@test.com', ip: '127.0.0.1' }, 'Already on SFS');
// the second parameter is optional
// this auto-submits anyone found on StopForumSpam.com, calling both of the above functions
```


## License

MIT © [Ted](https://github.com/deltreey)


[npm-image]: https://badge.fury.io/js/stopforumspam.svg
[npm-url]: https://npmjs.org/package/stopforumspam
[travis-image]: https://travis-ci.org/deltreey/stopforumspam.svg?branch=master
[travis-url]: https://travis-ci.org/deltreey/stopforumspam
[daviddm-image]: https://david-dm.org/deltreey/stopforumspam.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/deltreey/stopforumspam

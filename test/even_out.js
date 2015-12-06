
var moment = require('moment');
var test = require('unit.js');
var fParseString = require('xml2js').parseString;
var fReadFile = require('fs').readFileSync;

var fExpandToSeconds = require('../src/even_out.js').ExpandToSeconds;
var fFormat = require('../src/format.js').Format;
var oEvenOut = require('../src/even_out.js');


test.value(oEvenOut.oForTesting.CollectIntoChunks([
	{time: ['2015-11-28T07:25:31.6Z']},
	{time: ['2015-11-28T07:25:32.1Z']},
	{time: ['2015-11-28T07:25:32.7Z']}
], 1, 500))
.is([
	{
		aTrkpts: [
			{time: ['2015-11-28T07:25:31.6Z']},
			{time: ['2015-11-28T07:25:32.1Z']}
		],
		oTimeEnd: moment('2015-11-28T07:25:32.5Z')
	}, {
		aTrkpts: [
			{time: ['2015-11-28T07:25:32.7Z']}
		],
		oTimeEnd: moment('2015-11-28T07:25:33.5Z')
	}
]);

fParseString(fReadFile('./test/even_out_in.gpx', {encoding: 'UTF-8'}), function (err, oGpx)
{
	fExpandToSeconds(oGpx);

	test.value(fFormat(oGpx)).is(fReadFile('./test/even_out_out.gpx', {encoding: 'UTF-8'}));
});

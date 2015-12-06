
var test = require('unit.js');
var fReadFile = require('fs').readFileSync;
var fParseString = require('xml2js').parseString;

var fFormat = require('../src/format.js').Format;
var fSplitAtGaps = require('../src/split_at_gaps.js').SplitAtGaps;


fParseString(fReadFile('./test/split_at_gaps_in.gpx', {encoding: 'UTF-8'}), function (err, oGpx)
{
	fSplitAtGaps(oGpx);

	test.value(fFormat(oGpx)).is(fReadFile('./test/split_at_gaps_out.gpx', {encoding: 'UTF-8'}));
});

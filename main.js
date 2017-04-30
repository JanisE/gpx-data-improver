var oProgram = require('commander');
var fParseString = require('xml2js').parseString;
var fReadFile = require('fs').readFileSync;
//var fStringify = require('node-stringify');
//var util = require('util');

var fAnalyse = require('./src/analyse.js').Analyse;
var fExpandToSeconds = require('./src/even_out.js').ExpandToSeconds;
var fFormat = require('./src/format.js').Format;
var fSplitAtGaps = require('./src/split_at_gaps.js').SplitAtGaps;


oProgram
	.version('1.0.0-alpha.1')
	.option('--stats', 'Analyse the (after modifications, if applied) GPX data.')
	.option('--even', 'Even out the <trkpt>s to whole seconds.')
	.option('--even_algorithm <algorithm_name>', '"average_intervals" or "discard_spares" (default).')
	.option('--even_interval_length <seconds>', '1 s by default.', parseInt)
	.option('--source <filename>', 'Source GPX file.')
	.option('--split_at_gaps', 'Split tracks into different <trkseg>s if time between positions is bigger than 22s.')
	.parse(process.argv);

if (! process.argv.slice(2).length) {
	oProgram.outputHelp();
	process.exit(1);
}

fParseString(fReadFile(oProgram.source, {encoding: 'UTF-8'}), function (err, oGpx)
{
	if (oProgram.split_at_gaps) {
		fSplitAtGaps(oGpx);
	}

	if (oProgram.even) {
		fExpandToSeconds(oGpx, oProgram.even_interval_length, oProgram.even_algorithm);
	}

	//console.log(util.inspect(oGpx, {depth: 12}));

	// Format and output.
	if (oProgram.stats) {
		console.log(fAnalyse(oGpx));
	}
	else {
		console.log(fFormat(oGpx));
	}
});

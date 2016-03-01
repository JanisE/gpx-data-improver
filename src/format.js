//var fJsToXml = new require('xml2js').Builder().buildObject;
var xml2js = require('xml2js');
var oJsToXml = new xml2js.Builder();
var _ = require('underscore');


function Format (oGpx)
{
	//console.log(util.inspect(oGpx, {depth: 12}));

	// Remove needless "extensions" elements, e.g.:
	// 		<trkpt ..><ele>..</ele><time>..</time><extensions><geotracker:meta c="220.3" s="0.5"/></extensions></trkpt>
	_.each(oGpx.gpx.trk, function (oTrk)
	{
		// Remove also <extensinos> inside <trk>, or else Endomondo gives an error parsing file.
		delete oTrk.extensions;

		_.each(oTrk.trkseg, function (oTrkseg)
		{
			_.each(oTrkseg.trkpt, function (oTrkpt)
			{
				delete oTrkpt.extensions;
			});
		});
	});

	return oJsToXml.buildObject(oGpx)
		// Format each <trkpt> into one line.
		.replace(/>\s*<ele>/g, '><ele>')
		.replace(/>\s*<time>/g, '><time>')
		.replace(/>\s*<\/trkpt>/g, '><\/trkpt>')
		// Combine several <trk> into one, or else Endomondo won't import.
		.replace(/<\/trk>\s*<trk>[^]*?<trkseg>/g, '<trkseg>');
}

module.exports = {
	Format: Format
};

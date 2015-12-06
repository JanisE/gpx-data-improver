//var fJsToXml = new require('xml2js').Builder().buildObject;
var xml2js = require('xml2js');
var oJsToXml = new xml2js.Builder();


function Format (oGpx)
{
	//console.log(util.inspect(oGpx, {depth: 12}));

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

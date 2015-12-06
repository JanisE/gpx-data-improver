
var moment = require('moment');
//var util = require('util');
var _ = require('underscore');

var CONST = {
	iMinPointCountInSegment: 1
};


function SplitAtGaps (oGpx)
{
	//console.log(util.inspect(oGpx, {depth: 12}));

	_.each(oGpx.gpx.trk, function (oTrk)
	{
		var aNewTrksegs = [];
		var aTrksegPts = [];

		_.each(oTrk.trkseg, function (oTrkseg)
		{
			// Add the previously collected <trkseg> to the result and start with the new one.
			if (aTrksegPts.length > 0) {
				if (aTrksegPts.length > CONST.iMinPointCountInSegment) {
					aNewTrksegs.push({trkpt: aTrksegPts});
				}
				// Else: those few points get discarded completely.

				aTrksegPts = [];
			}

			var oPrevTime;

			_.each(oTrkseg.trkpt, function (oTrkpt)
			{
				var oCurrentTime = moment(oTrkpt.time[0]);

				if (oPrevTime) {
					if (oCurrentTime.diff(oPrevTime, 'seconds') > 22) {
						//console.log('A long pause detected: '
						//	+ oPrevTime.format('HH:mm:ss') + ' - ' + oCurrentTime.format('HH:mm:ss'));

						// Split into two <trkseg>s at this point.
						// Add the previously collected <trkseg> to the result and start a new one.
						if (aTrksegPts.length > 0) {
							if (aTrksegPts.length > CONST.iMinPointCountInSegment) {
								aNewTrksegs.push({trkpt: aTrksegPts});
							}
							// Else: those few points get discarded completely.

							aTrksegPts = [];
						}
					}
				}

				aTrksegPts.push(oTrkpt);

				oPrevTime = oCurrentTime;
			});
		});

		// Add the last collected <trkseg> to the result. (TODO Deduplicate!)
		if (aTrksegPts.length > 0) {
			if (aTrksegPts.length > CONST.iMinPointCountInSegment) {
				aNewTrksegs.push({trkpt: aTrksegPts});
			}
			// Else: those few points get discarded completely.

			aTrksegPts = [];
		}

		oTrk.trkseg = aNewTrksegs;	// Will changing the object while it's being traversed work?
	});

	//console.log(util.inspect(oGpx, {depth: 12}));
}

module.exports = {
	SplitAtGaps: SplitAtGaps
};

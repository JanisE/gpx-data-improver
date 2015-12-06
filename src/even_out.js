var moment = require('moment');
var _ = require('underscore');

function TrkPt (oInitialProperties)
{
	var self = this;

	this.fEle = 0.0;
	this.fLat = 0.0;
	this.fLon = 0.0;
	this.oTime = null;

	if (typeof oInitialProperties === 'object') {
		_.each(oInitialProperties, function (mValue, sKey)
		{
			// TODO Some input checking in order?
			self[sKey] = mValue;
		});
	}
}

/**
 * @returns object As expected by "xml2js".
 */
TrkPt.prototype.ToXmlStruct = function ()
{
	// TODO Check if the values are all right (or do not allow to set them directly).
	return {
		$: {
			lat: this.fLat.toFixed(9),	// 9 because in my MyTracks file 9 was the precision. TODO Should probably actually detect it.
			lon: this.fLon.toFixed(9)	// 9 because in my MyTracks file 9 was the precision. TODO Should probably actually detect it.
		},
		ele: this.fEle.toFixed(6),	// 6 because in my MyTracks file 6 was the precision. TODO Should probably actually detect it.
		time: this.oTime.toISOString()
	};
};

TrkPt.prototype.ToString = function ()
{
	return ''
		+ 'lat: ' + this.fLat
		+ 'lon: ' + this.fLon
		+ 'ele: ' + this.fEle
		+ 'time: ' + this.oTime.toISOString();
};

/*
function TrkptsToString (aTrkpts)
{
	var aStrings = [];

	_.each(aTrkpts, function (oTrkpt)
	{
		aStrings.push(oTrkpt.ToString());
	});

	return aStrings.join('; ');
}
*/

function CollectIntoChunks (aTrkpts, iChunkLength, iMsOffset)
{
	var aTrkptChunks = [];

	if (_.size(aTrkpts) > 0) {
		// Get the very first chunk time. All other cunks are going to be aligned to this time.
		var oFirstTrkptTime = moment(_.first(aTrkpts).time[0]);
		var oChunksStartTime = moment(oFirstTrkptTime).milliseconds(0).add(iMsOffset, 'milliseconds');
		if (oChunksStartTime.isAfter(oFirstTrkptTime)) {
			oChunksStartTime.add(-1, 'seconds');
		}

		var aChunkTrkpts = [];
		var oChunkTimeEnd = null;

		_.each(aTrkpts, function (oTrkpt)
		{
			var oTrkptTime = moment(oTrkpt.time[0]);

			if (!! oChunkTimeEnd) {
				if (! oTrkptTime.isBefore(oChunkTimeEnd)) {
					// Collect the previous chunk.
					aTrkptChunks.push({
						aTrkpts: aChunkTrkpts,
						oTimeEnd: oChunkTimeEnd
					});

					aChunkTrkpts = [];
					oChunkTimeEnd = null;
				}
				else {
					// Yet another <trkpt> into the chunk.
					aChunkTrkpts.push(oTrkpt);
				}
			}
			// Else it is the very first <trkpt>, no existing chunks are involved.

			if (! oChunkTimeEnd) {
				oChunkTimeEnd = moment(oChunksStartTime).add(
					Math.ceil(moment(oTrkptTime).diff(oChunksStartTime, 'milliseconds') / iChunkLength / 1000) * iChunkLength * 1000,
					'milliseconds'
				);
				aChunkTrkpts.push(oTrkpt);
			}
		});

		// Collect the last chunk.
		aTrkptChunks.push({
			aTrkpts: aChunkTrkpts,
			oTimeEnd: oChunkTimeEnd
		});
	}

	return aTrkptChunks;
}

/* For debugging.
function ChunkToString (oChunk)
{
	var aTrkptsRaw = [];
	_.each(oChunk.aTrkpts, function (oTrkpt)
	{
		aTrkptsRaw.push(''
			+ 'lat: ' + oTrkpt.$.lat
			+ ', lon: ' + oTrkpt.$.lon
			+ ', ele: ' + oTrkpt.ele[0]
		);
	});

	return ''
		+ 'oTimeEnd: ' + oChunk.oTimeEnd.toISOString()
		+ ', aTrkpts: ' + aTrkptsRaw.join('; ');
}

function ChunksToString (aResult)
{
	var aStrings = [];

	_.each(aResult, function (oChunk)
	{
		aStrings.push(ChunkToString(oChunk));
	});

	return aStrings.join(';\n');
}
*/

//function ExpandToSecondsOverlappingIntervals () TODO

function ExpandToSecondsAverageIntervals (oGpx, iMinTimeDiff)
{
	//console.log(util.inspect(oGpx, {depth: 12}));
	if (! iMinTimeDiff) {
		iMinTimeDiff = 1;	// Default time difference to expand to = 1s.
	}

	_.each(oGpx.gpx.trk, function (oTrk)
	{
		_.each(oTrk.trkseg, function (oTrkseg)
		{
			var aTrksegPts = [];

			//console.log('ChunksToString: \n', ChunksToString(CollectIntoChunks(oTrkseg.trkpt, iMinTimeDiff, (iMinTimeDiff % 2 === 0 ? 0 : 500))));

			_.each(
				CollectIntoChunks(oTrkseg.trkpt, iMinTimeDiff, iMinTimeDiff % 2 === 0 ? 0 : 500),
				function (oChunk)
				{
					var oResultingSample = new TrkPt({
						oTime: moment(oChunk.oTimeEnd).add(-1000 * iMinTimeDiff / 2, 'milliseconds'),
						fEle: 0.0,
						fLat: 0.0,
						fLon: 0.0
					});

					_.each(oChunk.aTrkpts, function (oTrkpt)
					{
						oResultingSample.fEle += +oTrkpt.ele[0];
						oResultingSample.fLat += +oTrkpt.$.lat;
						oResultingSample.fLon += +oTrkpt.$.lon;
					});

					var iTrkpts = _.size(oChunk.aTrkpts);

					oResultingSample.fEle /= iTrkpts;
					oResultingSample.fLat /= iTrkpts;
					oResultingSample.fLon /= iTrkpts;

					aTrksegPts.push(oResultingSample.ToXmlStruct());
				}
			);

			oTrkseg.trkpt = aTrksegPts;
		});
	});
}

function ExpandToSecondsDiscardSpares (oGpx, iMinTimeDiff)
{
	//console.log(util.inspect(oGpx, {depth: 12}));
	if (! iMinTimeDiff) {
		iMinTimeDiff = 1;	// Default time difference to expand to = 1s.
	}

	_.each(oGpx.gpx.trk, function (oTrk)
	{
		_.each(oTrk.trkseg, function (oTrkseg)
		{
			var aTrksegPts = [];

			var oPrevTrkpt;
			var oNextTimeNoEarlierThan;

			_.each(oTrkseg.trkpt, function (oTrkpt)
			{
				var oCurrentTime = moment(oTrkpt.time[0]);

				// if the time pair crosses a second, do linear interpolation, store the value of the second change.
					// TODO What if the pair is too far apart
				// else ignore all samples within a second.

				if (oPrevTrkpt) {
					if (! oNextTimeNoEarlierThan || ! oCurrentTime.isBefore(oNextTimeNoEarlierThan)) {
						var oResultingSample = new TrkPt({oTime: moment(oCurrentTime).milliseconds(0)});

						// TODO Check - vai diff ir sekundes ietvaros, vai patvaļīgi liels skaitlis
						var oPrevTime = moment(oPrevTrkpt.time[0]);
						var fChange = oCurrentTime.diff(oResultingSample.oTime, 'milliseconds') / oCurrentTime.diff(oPrevTime, 'milliseconds');

						oResultingSample.fEle = oTrkpt.ele[0] - (oTrkpt.ele[0] - oPrevTrkpt.ele[0]) * fChange;

						// Assuming a plane when interpolating coordinates is enough in our case,
						//		the error/difference is too small to try a more precise Earth model.
						//		According to http://stackoverflow.com/a/1739066/99904 and http://math.stackexchange.com/questions/601453/interpolating-gps-coordinates
						oResultingSample.fLat = oTrkpt.$.lat - (oTrkpt.$.lat - oPrevTrkpt.$.lat) * fChange;
						oResultingSample.fLon = oTrkpt.$.lon - (oTrkpt.$.lon - oPrevTrkpt.$.lon) * fChange;

						aTrksegPts.push(oResultingSample.ToXmlStruct());

						oNextTimeNoEarlierThan = oResultingSample.oTime.add(iMinTimeDiff, 'seconds');
					}
					// Else: the point gets discarded.
				}
				// Else: TODO What to do with the first (and the last) sample? Extend or ignore?

				oPrevTrkpt = oTrkpt;
			});

			oTrkseg.trkpt = aTrksegPts;
		});
	});
}


module.exports = {
	ExpandToSeconds: function (oGpx, iMinTimeDiff, sAlgorithm)
	{
		//console.log(util.inspect(oGpx, {depth: 12}));
		if (! iMinTimeDiff) {
			iMinTimeDiff = 1;	// Default time difference to expand to = 1s.
		}

		switch (sAlgorithm) {
			case 'average_intervals':
				ExpandToSecondsAverageIntervals(oGpx, iMinTimeDiff);
				break;
			case 'discard_spares':
			/* falls through */
			default:
				ExpandToSecondsDiscardSpares(oGpx, iMinTimeDiff);
		}

	},
	oForTesting: {
		CollectIntoChunks: CollectIntoChunks
	}
};
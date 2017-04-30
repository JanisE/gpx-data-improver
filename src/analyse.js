
var moment = require('moment');
var _ = require('underscore');

var CONST = {
	iEarthRadius: 6378137	// In metres.
	//iEarthRadius: 6372797	// Or better this value? Got from different sources.
};

/**
 * @param {Number} fAngleInDegrees
 * @returns {Number}
 */
function DegreesToRadians (fAngleInDegrees)
{
	return fAngleInDegrees * Math.PI / 180;
}

/**
 * @param {Object} oCoordA
 * @param oCoordA.lat
 * @param oCoordA.lon
 * @param {Object} oCoordB
 * @param oCoordB.lat
 * @param oCoordB.lon
 * @returns {number}
 */
function CalculateHaversineDistanceOnEarth (oCoordA, oCoordB)
{
	var fLat1 = DegreesToRadians(oCoordA.lat);
	var fLat2 = DegreesToRadians(oCoordB.lat);
	var fDeltaLatBy2 = (fLat2 - fLat1) / 2;

	var fDeltaLonBy2 = DegreesToRadians(oCoordB.lon - oCoordA.lon) / 2;

	var f = Math.sin(fDeltaLatBy2) * Math.sin(fDeltaLatBy2) +
		Math.sin(fDeltaLonBy2) * Math.sin(fDeltaLonBy2) *
		Math.cos(fLat1) * Math.cos(fLat2);

	return 2 * CONST.iEarthRadius * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));
};

function Analyse (oGpx)
{
	var fTotalLength = 0;	// In metres.
	var fTotalDuration = 0;	// In milliseconds.

	_.each(oGpx.gpx.trk, function (oTrk)
	{
		_.each(oTrk.trkseg, function (oTrkseg)
		{
			var oPrevTime;
			var oPrevCoord;

			_.each(oTrkseg.trkpt, function (oTrkpt)
			{
				var oCurrentTime = moment(oTrkpt.time[0]);
				var oCurrentCoord = {
					lat: oTrkpt.$.lat,
					lon: oTrkpt.$.lon
				};

				if (oPrevTime) {
					fTotalLength += CalculateHaversineDistanceOnEarth(oPrevCoord, oCurrentCoord);
					fTotalDuration += oCurrentTime.diff(oPrevTime, 'milliseconds');
				}

				oPrevTime = oCurrentTime;
				oPrevCoord = oCurrentCoord;
			});
		});
	});

	return {
		'Total length, km': Math.round(fTotalLength) / 1000,
		'Total duration, min': Math.round(fTotalDuration / 600) / 100,
		'Average speed, km/h': Math.round(fTotalLength / fTotalDuration * 36000) / 10
	}
}

module.exports = {
	Analyse: Analyse
};

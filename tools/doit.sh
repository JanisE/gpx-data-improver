#!/bin/bash

# My personal helper script.

# Set up.
rm --force /home/janis/Darbvirsma/UntitledFolder/combined_split*.gpx

cd /home/janis/Projekti/gps/GpxDataImprover

# Output stats for each file.
for gpxFile in /home/janis/Darbvirsma/UntitledFolder/*.gpx
do
	echo "Stats for '$(basename "$gpxFile")':"
	nodejs main --source "$gpxFile" --split_at_gaps --stats
done

# Combine and prepare different various processed versions.
echo '--------'
bash ./tools/combine.sh

nodejs main --source /home/janis/Darbvirsma/UntitledFolder/res.gpx --split_at_gaps > /home/janis/Darbvirsma/UntitledFolder/combined_split.gpx

echo 'Stats for combined and split:'
nodejs main --source /home/janis/Darbvirsma/UntitledFolder/combined_split.gpx --stats

nodejs main --source /home/janis/Darbvirsma/UntitledFolder/res.gpx --split_at_gaps --even > /home/janis/Darbvirsma/UntitledFolder/combined_split_even.gpx

echo 'Stats for combined and split even:'
nodejs main --source /home/janis/Darbvirsma/UntitledFolder/combined_split_even.gpx --stats

# Clear.
rm /home/janis/Darbvirsma/UntitledFolder/res.gpx

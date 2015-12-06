# Merges several GPX files into one for importing as one Endomondo workout.
# TODO Include this into the main application.

args=()
args+=(-i gpx)

for gpxFile in ~/Darbvirsma/UntitledFolder/*.gpx
do
	args+=(-f "$gpxFile")
done

args+=(-o gpx)
args+=(-F ~/Darbvirsma/UntitledFolder/res.gpx)

gpsbabel "${args[@]}"

# gpsbabel izņem no meta tagiem kaut kādu topografix aprakstu, tāpēc Endomondo uzkaras pie topografix tagiem.
# 	Man tos nevajag, tāpēc vienkārši izņemu (nevis papildinu meta tagus).
perl -i -pe 's/<topografix.*?<\/topografix:color>//g' ~/Darbvirsma/UntitledFolder/res.gpx


# Apmainu vietām atribūtus, citādi Endomondo neimportē. - nē, pie vainas topografix

# Lai darbotos pāri rindiņu pārtraukumiem: http://stackoverflow.com/a/1030819/99904
#perl -i -pe 'BEGIN{undef $/;} s/xmlns:xsi="http:\/\/www.w3.org\/2001\/XMLSchema-instance"\s+xmlns="http:\/\/www.topografix.com\/GPX\/1\/1"/xmlns="http:\/\/www.topografix.com\/GPX\/1\/1" xmlns:xsi="http:\/\/www.w3.org\/2001\/XMLSchema-instance"/g' ~/Darbvirsma/UntitledFolder/res.gpx

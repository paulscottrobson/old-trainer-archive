#
#	Script to rebuild and update sound, graphics and fonts in application.
#
echo "Making Graphics"
cd graphics
mv *.png source
rm source/sprites.png
mv source/loader.png .

python makenumbers.py
python makeatlas.py

echo "Copying to assets"
cp sprites.* ../app/assets/sprites
cp loader.png ../app/assets/sprites
cd ..
cp instruments/* app/assets/instruments
cp fonts/*.png fonts/*.fnt app/assets/fonts

echo "Updating .ogg files"
rm app/assets/sounds/*.ogg app/assets/sounds/*.mp3 app/assets/sounds/ocarina/* app/assets/sounds/dulcimer/*
cp sound/dulcimer/[0-9]*.ogg  app/assets/sounds/dulcimer
cp sound/ocarina/[0-9]*.ogg  app/assets/sounds/ocarina
cp sound/metronome.ogg app/assets/sounds

echo "Converting OGG to MP3"
cd app/assets/sounds
for f in *.ogg; do ffmpeg -v 0 -i "$f" -c:a libmp3lame -q:a 2 "${f/ogg/mp3}"; done
cd dulcimer
for f in *.ogg; do ffmpeg -v 0 -i "$f" -c:a libmp3lame -q:a 2 "${f/ogg/mp3}"; done
cd ../ocarina
for f in *.ogg; do ffmpeg -v 0 -i "$f" -c:a libmp3lame -q:a 2 "${f/ogg/mp3}"; done
cd ../../../..

echo "Done."

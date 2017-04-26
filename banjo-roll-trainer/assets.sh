#
#	Script to rebuild and update sound, graphics and fonts in application.
#
echo "Making Graphics"
cd graphics
python makeatlas.py

echo "Copying to assets"
cp sprites.* ../app/assets/sprites
cp loader.png ../app/assets/sprites
cd ..
cp fonts/*.png fonts/*.fnt app/assets/fonts

echo "Updating .ogg files"
rm app/assets/sounds/*.ogg app/assets/sounds/*.mp3 
cp sound/[0-9]*.ogg  app/assets/sounds
cp sound/metronome.ogg app/assets/sounds

echo "Converting OGG to MP3"
cd app/assets/sounds
for f in *.ogg; do ffmpeg -v 0 -i "$f" -c:a libmp3lame -q:a 2 "${f/ogg/mp3}"; done
cd ../../..

echo "Done."

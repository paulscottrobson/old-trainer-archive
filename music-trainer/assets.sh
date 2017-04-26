echo "Building main graphics"
cd graphics
python makeatlas.py
cp sprites.png sprites.json standalone/* ../app/assets/sprites
cp fonts/* ../app/assets/fonts
cd ..

echo "Copying sounds"
rm app/assets/sounds/ocarina/* 
rm app/assets/sounds/dulcimer/*
cp sounds/ocarina/[0-9]*.ogg app/assets/sounds/ocarina
cp sounds/dulcimer/[0-9]*.ogg app/assets/sounds/dulcimer

echo "Building Ocarina Fingering Graphics"
cd ocarinagfx
python process.py
python makeatlas.py
cp *atlas*.png *atlas*.json ../app/assets/sprites/ocarina
cd ..

echo "Converting OGG to MP3"
cd app/assets/sounds/ocarina
for f in *.ogg; do ffmpeg -v 0 -i "$f" -c:a libmp3lame -q:a 2 "${f/ogg/mp3}"; done
cd ../dulcimer
for f in *.ogg; do ffmpeg -v 0 -i "$f" -c:a libmp3lame -q:a 2 "${f/ogg/mp3}"; done
cd ../../../..
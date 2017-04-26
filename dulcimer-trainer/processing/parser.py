# **************************************************************************************************
# **************************************************************************************************
#
#									Parse Music and Song Files.
#
# **************************************************************************************************
# **************************************************************************************************

from entities import *
from containers import *
from tuning import *
import re,sys

# **************************************************************************************************
#
#										General Parser
#
# **************************************************************************************************

class BaseParser:
	#
	#	Parse a single source file, returning a song object
	#	
	def parse(self,sourceFile):
		# create a new song.
		self.song = Song()
		# read and preprocess source file 
		src = [x if x.find("//") < 0 else x[:x.find("//")] for x in open(sourceFile).readlines()]
		src = [x.strip() for x in src if x.strip() != ""]
		# get and process assigns.
		for assigns in [x for x in src if x.find(":=") >= 0]:
			parts = [x.strip() for x in assigns.split(":=")]
			if len(parts) != 2 or parts[0] == "":
				raise MusicException("Bad assignment "+assigns)
			self.song.setValue(parts[0].lower(),parts[1])
		# remove assigns
		src = [x for x in src if x.find(":=") < 0]
		# now process each line.
		for line in src:
			for bar in [x.strip() for x in line.split("|") if x.strip() != ""]:
				self.song.startNewBar()
				while bar != "":
					bar = self.extractElement(bar)
		self.song.validate(self.song.getBeats()*4)
		return self.song 
	#
	#	Extract one thing from the bar string (rest, note, modifier, strum) and apply it to
	#	the current song.
	#
	def extractElement(self,src):
		# rest check (&)
		if src[0] == '&':
			self.song.add(Rest())
			return src[1:].strip()
		# modifier check (o - = .) 
		if AbstractNoteClass.isModifier(src[0]):
			self.song.modify(src[0])
			return src[1:].strip()			
		# note check e.g. C, D#, a#, bb
		m = re.match("^([A-Ga-g][\\,]?[b\\#\\@]?)(.*)$",src)
		if m is not None:
			self.addMusicNote(m.group(1))
			return m.group(2).strip()
		# strum check 046+ and so on.
		match = Strum.Encoding.lower()+Strum.Encoding.upper()
		m = re.match("^(["+match+"\\+]*)(.*)$",src)
		if m is not None:
			self.song.add(Strum(m.group(1).upper()))
			return m.group(2).strip()
		# no idea what is left.
		raise MusicException("Syntax : "+src)
	#
	#	Add a music note - convert from C c c, format to C#2 format.
	#
	def addMusicNote(self,note):
		# figure out which octave
		octave = 1 if note[0] < 'a' else 2
		if note.find(",") >= 0:
			octave = 0
			note = note.replace(",","")
		note = note.upper()
		# if note is natural use that and ignore accidentals.
		if note[-1] == '@':
			note = note[0]
		# if not natural check accidentals if not directly specified.
		elif len(note) == 1:
			n = self.song.getValue("accidentals").upper().find(note)
			if n >= 0:
				note = note + self.song.getValue("accidentals")[n+1]

		self.song.add(Note(note.upper()+str(octave)))

if __name__ == '__main__':
	p = BaseParser()
	song = p.parse("nowhereman.music")
	print(song.toString())
	song.toJSON(open("../app/music.json","w"),{ "tuning":Instrument(207),"transpose":-3 })
	print(song.analyse())
	#print(Instrument(202).toString())

	#song = p.parse("ojc.song")
	#print(song.toString())
	#song.toJSON(open("../app/music2.json","w"),{ })


# TODO: Generating .song file to allow editing.
# TODO: Analyser specify transpose range (?)
# TODO: Capo support.
# TODO: Playback support.
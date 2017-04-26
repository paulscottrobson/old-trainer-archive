# **************************************************************************************************
# **************************************************************************************************
#
#										String and Instrument.
#
# **************************************************************************************************
# **************************************************************************************************

from entities import *
from containers import *
from parser import *

# **************************************************************************************************
#
#								Single fretted string class
#
# **************************************************************************************************

class FrettedString:
	def __init__(self,name,baseNote,setup):
		self.name = name
		self.baseNote = baseNote
		# add defaults and save setup
		setup.setdefault("has6plus",True)
		setup.setdefault("fretCount",15)
		self.setup = setup
		# create list of chromatic offsets from base note and note name to fret mapping.
		self.fretChromatic = []
		self.nameToFretNumber = {}
		# add 6 plus at the start.
		if self.setup["has6plus"]:
			self.addFretChromatic(6.5,self.baseNote.getByValue(11),self.baseNote.getByName(11))
		i = 0 
		while len(self.fretChromatic) != self.setup["fretCount"]:
			offset = FrettedString.chromaticOffsets[i % 7] + int(i / 7) * 12
			self.addFretChromatic(i,self.baseNote.getByValue(offset),self.baseNote.getByName(offset))
			i = i + 1
		self.fretChromatic.sort()

	def addFretChromatic(self,fret,value,name):
		self.fretChromatic.append(value)
		self.nameToFretNumber[name.lower()] = fret 

	def toString(self):
		notes = [x for x in self.nameToFretNumber.keys()]
		notes.sort(key = lambda x:self.nameToFretNumber[x])
		return (self.name+"    ")[:7]+": ["+("|".join(notes))+"]"

	def getNoteFret(self,noteName):
		noteName = noteName.lower()
		return None if noteName not in self.nameToFretNumber else self.nameToFretNumber[noteName]

FrettedString.chromaticOffsets = [
	0,2,4, 5,7,9,10
#	D E F# G A B C  
]

# **************************************************************************************************
#
#						Representation of a specific instrument & tuning
#
# **************************************************************************************************

class Instrument:
	def __init__(self,index,setup = { }):
		self.baseNotes = []
		self.strings = []
		self.index = index
		self.setup = setup
		# calculate the offsets from the index.
		for i in range(0,3):
			offset = index % Instrument.Ranges[i][1]
			self.baseNotes.append(Note(Instrument.Ranges[i][0].getByName(offset)))
			index = int(index / Instrument.Ranges[i][1])
		# create strings
		for i in range(0,3):
			self.strings.append(FrettedString(["Bass","Middle","Melody"][i],self.baseNotes[i],setup))
	#
	#	Return name as note/octave seperated by commas.
	#
	def getTuningName(self):
		return (",".join(x.getByName() for x in self.baseNotes)).lower()
	#
	#	Get the number of possible tunings.
	#
	@staticmethod
	def getIndexCount():
		return Instrument.Ranges[0][1] * Instrument.Ranges[1][1] * Instrument.Ranges[2][1]
	#
	#	Convert to string
	#
	def toString(self):
		s = "Dulcimer tuned "+self.getTuningName()+" tuning index "+str(self.index)+"\n"
		s = s + "\n".join([x.toString() for x in self.strings])
		return s
	#
	#	Check to see if instrument can play note, return the string.
	#
	def getNoteString(self,note):
		foundString = None 
		for i in range(0,3):
			if self.strings[i].getNoteFret(note) is not None:
				foundString = i 
		return foundString
	#
	#	Check to see if instrument can play note, return the fretting
	#
	def getNoteFretting(self,note):
		foundFretting = None 
		for i in range(0,3):
			if self.strings[i].getNoteFret(note) is not None:
				foundFretting = self.strings[i].getNoteFret(note)
		return foundFretting
#
#	Defines the tuning search area. Change if you think the strings won't be too floppy
# 	or break :)
#
Instrument.Ranges = [ 
				  [Note("C0"),5],				# Bass start, number of options
				  [Note("E0"),9], 				# Middle start, number of options
				  [Note("F0"),10] 				# Melody start, number of options
				]

Instrument.BASS = 0 							# constant string numbers
Instrument.MIDDLE = 1
Instrument.MELODY = 2

if __name__ == '__main__':
	t = Instrument(432)
	print(t.toString())

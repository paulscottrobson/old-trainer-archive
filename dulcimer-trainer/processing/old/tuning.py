# *************************************************************************
#
#								Tuning class
#
# *************************************************************************

from note import Note 
from string import String

class Tuning:
	#
	#	Initialise the tuning, which is basically three strings.
	#
	def __init__(self,bass,middle,melody,fretLayout = None):
		self.strings = []
		self.strings.append(String(melody,fretLayout))
		self.strings.append(String(middle,fretLayout))
		self.strings.append(String(bass,fretLayout))
		self.tuningName = bass.getName()[:-1]+middle.getName()[:-1]+melody.getName()[:-1].lower()
		self.fullTuningName = bass.getName()+","+middle.getName()+","+melody.getName()
	#
	#	Get the name of the tuning.
	#
	def getTuningName(self):
		return self.tuningName 
	def getFullTuningName(self):
		return self.fullTuningName
	#
	#	See if a note, by value is playable. Returns 0 (melody) 1 (middle) 2 (bass) -1 (No)
	#
	def isPlayable(self,noteValue):
		for n in range(0,len(self.strings)):
			if self.strings[n].isPlayable(noteValue):
				return n 
		return -1 
	#
	#	Get playable notes in string form.
	#
	def getNotes(self):
		return "\n".join([x.getNotes() for x in self.strings])

#
#	Uses a number to sequentially generate plausible tunings
#
class IndexTuning(Tuning):

	def __init__(self,index,fretLayout = None):		
		# Base tuning for each string
		n1 = Note("C0")
		n2 = Note("F0")
		n3 = Note("G0")
		# Use number to offset each note
		n1.set(n1.get()+index % IndexTuning.BassCount)
		n2.set(n2.get()+int(index/IndexTuning.BassCount) % IndexTuning.MiddleCount)
		n3.set(n3.get()+int(index/IndexTuning.BassCount/IndexTuning.MiddleCount) % IndexTuning.MelodyCount)
		# call super constructor
		Tuning.__init__(self,n1,n2,n3,fretLayout)

	#
	#	Get total number of tunings to check.
	#
	def getTotalTunings(self):
		return IndexTuning.BassCount * IndexTuning.MiddleCount * IndexTuning.MelodyCount

IndexTuning.BassCount = 5 							# C C# D D# E
IndexTuning.MiddleCount = 7 						# F F# G G# A A# B
IndexTuning.MelodyCount = 8							# G G# A A# B C C# D

if __name__ == '__main__':
	t1 = Tuning(Note("d0"),Note("a0"),Note("d1"))		
	print(t1.getTuningName())
	print(t1.getNotes())
	print()
	for r in range(0,10):
		t2 = IndexTuning(r)
		print(r,t2.getTuningName())

# *************************************************************************
#
#								String class
#
# *************************************************************************

from note import Note 

class String:
	#
	#	For string create list of notes it can play
	#
	def __init__(self,baseNote,fretLayout = None):

		# default fret information
		if fretLayout is None:
			fretLayout = { "has6plus":True,"has6normal":True,"frets":14 }

		# add one because we have a "0 fret"
		frets = fretLayout["frets"]+1
		self.noteList = []
		self.isAvailable = {}
		# Add the 6 fret (whic is not in Seagull Merlin, only has a 6+)
		if fretLayout["has6normal"]:
			self.isAvailable[baseNote.getName(10)] = True
			self.noteList.append(baseNote.getName(10))
			frets -= 1
		# Add the common 6+ fret
		if fretLayout["has6plus"]:
			self.isAvailable[baseNote.getName(11)] = True
			self.noteList.append(baseNote.getName(11))
			frets -= 1
		# Add the standard frets up to the maximum
		for f in String.Frets:
			if frets > 0:
				self.isAvailable[baseNote.get(f)] = True
				self.noteList.append(baseNote.getName(f))
				frets -= 1
		self.noteList.sort(key = lambda x: x[-1]+x[:-1])
	#
	#	Get notes as a string
	#
	def getNotes(self):
		return ",".join(self.noteList).lower()
	#
	#	Check if a note can be played.
	#
	def isPlayable(self,noteValue):
		return noteValue in self.isAvailable 


# D [D#] E F [F#] G [G#] A [A#] B [C] [C#]
# 0  1   2 3  4   5  6   7  8   9 10   11

String.Frets = [ 0,2,4,5,7,9,12,14,16,17,19,21,24 ]									

if __name__ == '__main__':
	s1 = String(Note("d0"))
	print(s1.getNotes())
	print(s1.isAvailable)
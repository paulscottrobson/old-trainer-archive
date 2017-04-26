

class Note:
	def __init__(self,chordName):
		self.chords = [ "c","c#","d","d#","e","f","f#","g","g#","a","a#","b"]
		self.note = self.chords.index(chordName.lower().strip())
	def get(self):
		return self.chords[self.note]
	def offset(self,offset):
		return self.chords[(self.note+offset+12*100) % 12] 

class Chord:
	def __init__(self,chordName,i1,i2,i3 = None):
		self.base = Note(chordName)
		self.interval1 = i1
		self.interval2 = i2
		self.interval3 = i3
	def get(self):
		chords = [ ]
		chords.append(self.base.offset(self.interval1))
		if self.interval2 is not None:
			chords.append(self.base.offset(self.interval2))
		chords.sort()
		if self.interval3 is not None:
			chords.append(self.base.offset(self.interval3))
		return [ ",".join(chords)	]

class MajorChord(Chord):
	def __init__(self,chordName):
		Chord.__init__(self,chordName,0,4,7)

class MinorChord(Chord):
	def __init__(self,chordName):
		Chord.__init__(self,chordName,0,3,7)

class PowerChord(Chord):
	def __init__(self,chordName):
		Chord.__init__(self,chordName,0,7)

c = MajorChord("d")
print(c.get())
c = MinorChord("d")
print(c.get())
c = PowerChord("d")
print(c.get())
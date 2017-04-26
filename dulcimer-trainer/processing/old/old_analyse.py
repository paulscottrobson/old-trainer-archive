import random
#
#	Represents a single note.
#
class Note:
	def __init__(self,value):
		self.names = "A,A#,B,C,C#,D,D#,E,F,F#,G,G#".split(",")
		value = value.strip().upper()
		self.value = self.names.index(value[:-1])+int(value[-1]) * 12
	#
	#	Get current value in display format
	#	
	def get(self,transposition = 0):
		n = self.value + transposition
		return self.names[n % 12] + str(int(n/12))
	#
	#	Get a numeric sequential representation of the value
	#
	def getValue(self):
		return self.value
	#
	#	Advance a note by 1.
	#
	def advance(self):
		self.value += 1
#
#	Represents a single string.
#
class String:
	#
	#	Create hash of available and list of used notes for this tuning.
	#
	def __init__(self,baseNote,has65 = True,maxFrets = 17): 
		self.notes = [ ]
		# D [D#] E [F] F# G [G#] A [A#] B C C#
		self.used = [1,0,1,0,1,1,0,1,0,1,1,2]		
		self.noteAvailable = {}
		# starting note.
		baseNote = Note(baseNote)
		count = 0
		# over two octaves
		for i in range(0,25):
			# see if fret exists
			n = self.used[i % 12]
			# 6+ is a special case.
			if n == 2 and (not has65):
				n = 0
			# add to list if okay
			if n != 0 and count < maxFrets:
				self.notes.append(baseNote.get())
				self.noteAvailable[baseNote.getValue()] = True
				count += 1
			# go to next note
			baseNote.advance()
		#print(self.notes)

	def getNotes(self):
		return (",".join(self.notes)).lower()

	def isPlayable(self,noteValue):
		return noteValue in self.noteAvailable
#
#	Represents a tuning, or a set of 3 strings
#		 
class Tuning:
	#
	#	Basically three strings
	#
	def __init__(self,bass,middle,melody):
		self.bassString = String(bass)
		self.middleString = String(middle)
		self.melodyString = String(melody)
		self.tuningName = (bass[:-1]+middle[:-1]+melody[:-1]).upper()
	#
	#	Get tuning name
	#
	def get(self):
		return self.tuningName 

	def score(self,noteList,transposition = 0):
		missingList = []
		bassList = []
		middleList = []
		melodyList = []
		score = 0
		for note in noteList:			
			v = note.getValue() + transposition
			if self.melodyString.isPlayable(v):
				#print("MELODY",note.get())
				score = score + 200
				melodyList.append(note.get(transposition))
			elif self.middleString.isPlayable(v):
				#print("MIDDLE",note.get())
				score = score + 30
				middleList.append(note.get(transposition))
			elif self.bassString.isPlayable(v):
				#print("BASS",note.get())
				score = score + 5
				bassList.append(note.get(transposition))
			else:
				#print("FAIL",note.get())
				missingList.append(note.get(transposition))
		if len(missingList) == 0:
			score += 1000
		return[int(score / len(noteList)),melodyList,middleList,bassList,missingList]

class Analyser:	
	def __init__(self):
		pass

	def analyse(self,notes):
		# Split into notes.
		notes = [x for x in notes.split() if x != ""]
		# Convert all flats to the equivalent sharps.
		notes = [self.toSharp(x) if x[-1] == "b" and len(x) == 2 else x for x in notes]
		# Convert all notes to note objects
		self.notes = [self.toInternalFormat(x) for x in notes]
		


	#
	#	Convert a note to an internal format. A0-G0 A1-G1 A2-G2 with
	#	a sharp where appropriate. D0 is the lowest tuning.
	#
	def toInternalFormat(self,note):
		if note[0] >= 'a':
			return Note(note.upper()+"2")
		else:
			return Note(note.upper()+"1")
	#
	#	Convert flats to sharps.
	#
	def toSharp(self,note):
		# the lower ab does not have a sharp representation
		if note == "ab":
			raise Exception("Lower A is as far as we go.....")
		# middle A flat goes to lower g#
		if note == "Ab":
			note = "g#"
		# everything else back one.
		else:
			note = chr(ord(note[0])-1)+"#"
		return note







#
#	Anything capitalised is above the A on the stave (e.g. B is the
#	middle line.)
#
notes = "A A# g# C D E e d f"


a = Analyser()
a.analyse(notes)
print([a.get() for a in a.notes])


for i in range(0,10000):
	t1 = [Note("c0"),Note("c0"),Note("c0")]
	t1[0].value = random.randint(0,8)
	t1[1].value = random.randint(0,8)+6
	t1[2].value = random.randint(0,8)+12
	t1 = [x.get() for x in t1]
	dad = Tuning(t1[0],t1[1],t1[2])
	for r in range(-7,7):
		s = dad.score(a.notes,r)
		if len(s[1]) > 6 and len(s[4]) == 0:
			print(len(s[1]),s,t1,r)

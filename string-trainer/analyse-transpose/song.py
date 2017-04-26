# *****************************************************************************************
# *****************************************************************************************
#
#						Classes wrapping a .song file
#
# *****************************************************************************************
# *****************************************************************************************

import re,sys

# *****************************************************************************************
#						Class representing a single note.
# *****************************************************************************************

class Note:
	def __init__(self,note,qbPos):
		assert note.upper() in Note.toChromatic,"Bad note '"+note+"'"
		self.noteOffset = Note.toChromatic[note.upper()]+12 * 3
		if note[0] >= 'a' and note[0] <= 'z':
			self.noteOffset += 12
		self.qbPos = qbPos

	def getID(self,transpose = 0):
		n = self.noteOffset + transpose
		return n if n >= 0 else None 

	def getName(self,transpose = 0):
		n = self.getID(transpose)
		return None if n is None else Note.toName[n % 12] + str(int(n/12))

	def tweakID(self,offset):
		self.noteOffset += offset

	def getQBPos(self):
		return self.qbPos
		
	def toString(self):
		return self.getName()+"."+str(self.qbPos)

Note.toChromatic = { "C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11, \
					 "C#":1,"DB":1,"D#":3,"EB":3,"F#":6,"GB":6, \
					 "G#":8,"AB":8,"A#":10,"BB":11 }

Note.toName = [ "C","C#","D","D#","E","F","F#","G","G#","A","A#","B" ]

# *****************************************************************************************
#										Bar Class
# *****************************************************************************************

class Bar:
	def __init__(self,source,accidentals = "",beats = 4):
		self.notes = []
		self.isEndOfLine = False
		initSource = source
		source = source.strip()
		qbPos = 0
		while source != "":
			m = re.match("^([A-Ga-g][\\#b\\@]?)(.*)$",source)
			if m is not None:
				note = m.group(1)
				if len(note) == 1:
					assert qbPos < beats * 4,"Bar overflow "+initSource
					self.notes.append(Note(note,qbPos))
					if accidentals.upper().find(note.upper()+"#") >= 0:
						self.notes[-1].tweakID(1)
					if accidentals.upper().find(note.upper()+"B") >= 0:
						self.notes[-1].tweakID(-1)
				else:
					note = note if note[-1] != '@' else note[0]
					self.notes.append(Note(note,qbPos))
				qbPos += 4
				source = m.group(2)
			elif source[0] == '&':
				qbPos += 4
				source = source[1:]
			elif source[0] in Bar.qbOffsets:
				qbPos += Bar.qbOffsets[source[0]]
				source = source[1:]				
			else:
				raise Exception("Syntax error in bar "+initSource+" ("+source+")")
			source = source.strip()

	def getNote(self,n):
		return self.notes[n]

	def getNoteCount(self):
		return len(self.notes)

	def toString(self):
		return " ".join(note.toString() for note in self.notes)

	def isEndOfLine(self):
		return self.isEndOfLine

	def setEndOfLine(self):
		self.isEndOfLine = True 

Bar.qbOffsets = { "o":4,"O":4,".":2,"-":-2,"=": -3 }

# *****************************************************************************************
#						Class representing a single song
# *****************************************************************************************

class Song:
	def __init__(self,sourceFile):
		self.keys = { "title":"","author":"","beats":"4","tempo":"100", \
					  "version":"1", "tuning":"d3,a4,d4", "type":"dulcimer", \
					  "accidentals":"" }
		# comments, spaces tabs
		src = [x if x.find("//") < 0 else x[:x.find("//")] for x in open(sourceFile).readlines()]
		src = [x.replace("\t"," ").strip() for x in src]
		# assignments
		for assign in [x for x in src if x.find(":=") >= 0]:
			parts = [x.strip() for x in assign.split(":=")]
			self.keys[parts[0].lower()] = parts[1]
		src = [x.strip() for x in src if x.find(":=") < 0]
		# now just have the bar data.
		self.bars = []
		for line in src:
			count = 0
			for barSrc in [x.strip() for x in line.split("|") if x.strip() != ""]:
				self.bars.append(Bar(barSrc,self.keys["accidentals"],int(self.keys["beats"])))
				count += 1
			if count > 0:
				self.bars[-1].setEndOfLine()

	def getKey(self,key):
		return None if key not in self.keys else self.keys[key]

	def getKeyList(self):
		return [x for x in self.keys.keys()]

	def getBar(self,n):
		return self.bars[n]

	def getBarCount(self):
		return len(self.bars)

	def toString(self):
		return "|".join(bar.toString() for bar in self.bars)

if __name__ == '__main__':
	sn = Song("yesterday.tune")
	print(sn.toString())
	sn = Song("herecomesthesun.tune")
	print(sn.toString())
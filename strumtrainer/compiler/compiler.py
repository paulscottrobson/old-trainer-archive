#
#	Song compiler
#
import sys,re 

class CompilerException(Exception):
	pass

#
#	Class representing a chord
#
class Chord:
	def __init__(self,name,frets,extendedName):
		self.name = name
		self.frets = frets
		self.extendedName = extendedName
	def render(self,handle):
		handle.write("{\n");
		handle.write('"name":"{0}",\n'.format(self.name))
		handle.write('"display":"{0}",\n'.format(self.extendedName))
		handle.write('"frets":[{0}]\n'.format(",".join([str(x) for x in self.frets])))
		handle.write("}\n");
#
#	Chord storage
#
class ChordStore:

	def __init__(self):
		self.extendedFind = {}
		self.normalFind = {}

	def add(self,chord):
		if chord.extendedName != "":
			self.extendedFind[chord.extendedName.lower()] = chord 
		self.normalFind[chord.name.lower()] = chord

	def find(self,key):
		key = key.lower()
		if key in self.extendedFind:
			return self.extendedFind[key]
		if key in self.normalFind:
			return self.normalFind[key]
		raise CompilerException("Cannot find chord definition for '"+key+"'")		

	def render(self,handle):
		chords = [c for c in self.normalFind.keys()]
		chords.sort()
		handle.write('"chords":[\n')
		for n in range(0,len(chords)):
			if n > 0:
				handle.write(",\n")
			self.normalFind[chords[n]].render(handle)			
		handle.write("]\n")
#
#	Bar
#
class Bar:
	def __init__(self,defn,beats,compiler):
		self.lyrics = ""
		self.chords = [ None ] * beats 
		self.chordPosition = 0
		self.pattern = compiler.pattern

		# look for @n
		m = re.match("(\\@\\d)",defn)
		if m is not None:
			self.pattern = int(m.group(1)[-1])
			defn = defn.replace(m.group(1),"")

		# look for [<stuff>]
		while defn.find("[") >= 0:
			m = re.match("(\\[.*?\\])",defn)
			if m is None:
				raise CompilerException("Missing ]")
			# setting chord to None
			if m.group(1) == "[]":
				self.fillRest(None,beats)
			# look at each item in group
			for chordExec in m.group(1)[1:-1].split():
				if chordExec != "":
					# remove the chord position changes
					while re.match("^[0-9]",chordExec) is not None:
						self.chordPosition = int(chordExec[0])
						chordExec = chordExec[1:]
						if self.chordPosition >= beats:
							raise CompilerException("Bad beat position")
					# find chord by name
					cDef = compiler.chordStore.find(chordExec)
					self.fillRest(cDef.name,beats)
			# remove chord from group
			defn = defn.replace(m.group(1),"")
		# remove double spaces then strip
		while defn.find("  ") >= 0:
			defn = defn.replace("  "," ")
		self.lyrics = defn.strip()

		#print("{"+defn+"}",beats,self.lyrics,self.pattern,self.chords)

		compiler.currentChord = self.chords[-1]
		compiler.pattern = self.pattern

	def fillRest(self,cDef,beats):
		for p in range(self.chordPosition,beats):
			self.chords[p] = cDef
		if self.chordPosition == 0:
			self.chordPosition = int(beats/2)
		else:
			self.chordPosition += 1

	def render(self,handle):
		cf = ",".join(["null" if x is None else '"'+x+'"' for x in self.chords])
		handle.write("{\n")
		handle.write('"pattern":{0},\n'.format(self.pattern))
		handle.write('"chords":[{0}],\n'.format(cf))
		handle.write('"lyrics":"{0}",\n'.format(self.lyrics))
		handle.write('"justify":"c"\n')
		handle.write("}\n")


#
#	Compiler
#
class Compiler:

	def reset(self):
		self.chordStore = ChordStore()
		self.assigns = { "name":"","performer":"","composer":"","beats":"4","speed":"100"}
		self.assigns["compiler"] = "0.1"
		self.assigns["tuning"] = "ukulele"
		self.bars = []
		self.voices = 4
		self.lineNumber = 0
		self.pattern = 0
		self.currentChord = None

	def load(self,sourceFile):
		self.source = open(sourceFile).readlines()
		self.source = [x if x.find("//") < 0 else x[:x.find("//")] for x in self.source]
		self.source = [x.replace("\t"," ").strip() for x in self.source]

	def preProcess(self):
		for n in range(0,len(self.source)):
			self.lineNumber = n+1
			if (self.source[n]+" ")[0] == '#':
				self.processChord(self.source[n][1:].strip())
				self.source[n] = ""
			if self.source[n].find(":=") > 0:
				parts = [x.strip() for x in self.source[n].split(":=")]
				self.assigns[parts[0].lower()] = parts[1]
				self.source[n] = ""

	def processChord(self,chordDef):
		m = re.match("^([A-Za-z0-9\\#]+)\\s*([0-9\\,]+)\\s*(.*)\\s*$",chordDef)
		if m is None:
			raise CompilerException("Bad chord definition "+chordDef)
		name = m.group(1)
		try:
			chords = [int(x) for x in m.group(2).split(",")]
		except ValueError:
			raise CompilerException("Bad chord definition")
		if len(chords) != self.voices:
			raise CompilerException("Not enough fret values in chord definition")
		dispName = m.group(3)
		if dispName != "":
			if dispName[0] != '"' and dispName[-1] != '"':
				raise CompilerException("Bad extended name")
			dispName = dispName[1:-1].strip()
		else:
			dispName = name
		self.chordStore.add(Chord(dispName,chords,name))

	def process(self):
		for n in range(0,len(self.source)):
			self.lineNumber = n+1
			if self.source[n] != "":
				for barDef in [x.strip() for x in self.source[n].split("|")]:
					if barDef != "":
						self.bars.append(Bar(barDef,int(self.assigns["beats"]),self))

	def renderFile(self,fileName):
		handle = open(fileName,"w")
		self.render(handle)
		handle.close()

	def render(self,handle):
		handle.write("{\n")
		handle.write("".join(['"{0}":"{1}",\n'.format(x,self.assigns[x]) for x in self.assigns.keys()]))
		self.chordStore.render(handle)
		handle.write(',\n"bars":[\n')
		for i in range(0,len(self.bars)):
			self.bars[i].render(handle)
			if i != len(self.bars)-1:
				handle.write(",\n")
		handle.write("]\n}\n")

c = Compiler()
c.reset()
c.load("test.song")
c.preProcess()
c.process()
c.renderFile("../app/music.json")
#print(c.source)
#print(c.assigns)
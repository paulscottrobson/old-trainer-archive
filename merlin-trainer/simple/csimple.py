# *****************************************************************************************
#
#							  Simple compiler for TAB1 format
#
# *****************************************************************************************

import re,sys

# *****************************************************************************************
#								Compiler / Processor Exception
# *****************************************************************************************

class CompilerException(Exception):
	def __init__(self,message):
		self.message = message
		Exception.__init__(self)

# *****************************************************************************************
#										Strum class
# *****************************************************************************************

class Strum:
	def __init__(self,strumDef,qbTime,voices,label = ""):
		self.strum = strumDef
		self.qbTime = qbTime
		self.label = label
		self.preRender = self.convertToRender(strumDef,voices)

	def getStrum(self):
		return self.strum 

	def getQuarterBeatTime(self):
		return self.qbTime 

	def getLabel(self):
		return self.label 

	def toString(self):
		s = self.strum+"@"+str(self.time)
		if self.label != "":
			s = s + "("+self.label+")"
		return s

	def convertToRender(self,strum,voices):
		strum = strum.upper().strip()
		r = []
		while strum != "":
			if strum[0] == 'X':
				r.append(-1)
				strum = strum[1:]
			elif strum[0] >= '0' and strum[0] <= '7':
				r.append(Strum.TOCHROMATIC[int(strum[0])])
				strum = strum[1:]
				if (strum+" ")[0] == '+':
					r[-1] += 1
					strum = strum[1:]
			else:
				raise CompilerException("Bad strum "+strum)
		# first strum given is the treble so make it the last.
		r.reverse()
		# right pad
		while len(r) < voices:
			r.insert(0,-1)
		return "".join([chr(x+97) if x >= 0 else "-" for x in r])

	def render(self):
		return self.preRender

Strum.TOCHROMATIC = [
		0, 	2, 	4, 	5,	7,	9,	11,	 12
	#	D 	E 	F#	G 	A 	B 	C# 	 D
]
# *****************************************************************************************
#										Bar class
# *****************************************************************************************

class Bar:
	def __init__(self,barNumber,beats,voices):
		self.barNumber = barNumber
		self.beats = beats
		self.strums = []
		self.voices = voices
		self.qbPosition = 0 
		self.qbOffsets = { "O":8, "o":8, "-":-2, "=":-3, ".":2 }

	def add(self,strumDef,label = ""):
		self.strums.append(Strum(strumDef,self.qbPosition,self.voices,label))
		self.qbPosition += 4
		return self 

	def toString(self):
		s = "#{0} B:{1} V:{2} C:{3} {{".format(self.barNumber,self.beats,self.voices,len(self.strums))
		s = s + " ".join([x.toString() for x in self.strums]) + "}"
		return s 

	def isOffset(self,c):
		return c in self.qbOffsets

	def offset(self,c):
		if not self.isOffset(c):
			raise CompilerException("Unknown offset "+c)
		self.qbPosition += self.qbOffsets[c]

	def render(self):
		r = ""
		qbPosition = 0
		for strum in self.strums:
			qbElapsed = strum.getQuarterBeatTime() - qbPosition
			while qbElapsed > 0:
				amt = min(8,qbElapsed)
				r = r + str(amt)
				qbElapsed = qbElapsed - amt 
			r = r + strum.render()
			qbPosition = strum.getQuarterBeatTime()
		return r 

# *****************************************************************************************
#										Song Class
# *****************************************************************************************

class Song:
	def __init__(self,sourceFile):
		self.reset()
		self.loadTab1(sourceFile)
		self.compileBody()
		if self.get("title") == "":
			raise CompilerException("No title provided")

	def reset(self):
		self.bars = []
		self.keys = { "title":"","author":"","beats":"4","tempo":"100", \
					  "version":"1", "tuning":"d3,a4,d4" }

	def get(self,key):
		return self.keys[key.strip().lower()]

	def loadTab1(self,sourceFile):
		# pre process file - tabs, spaces, comments					  
		source = open(sourceFile).readlines()
		source = [x if x.find("//") < 0 else x[:x.find("//")] for x in source]					  
		source = [x.replace("\t"," ").strip() for x in source]
		# key updates.
		for assign in [x for x in source if x.find(":=") >= 0]:
			assign = [x.strip() for x in assign.split(":=")]
			if assign[0] == '"' and assign[-1] == '"':
				assign = assign[1:-1]				
			self.keys[assign[0].lower()] = assign[1]
		source = [x for x in source if x.find(":=") < 0]
		self.source = source

	def compileBody(self):
		for line in range(0,len(self.source)):
			if self.source[line] != "":
				for barPart in [x.strip() for x in self.source[line].split("|") if x.strip() != ""]:
					newBar = Bar(len(self.bars),int(self.get("beats")),3)
					self.bars.append(newBar)
					try:
						self.compileTab1(newBar,barPart)
					except CompilerException as cEx:
						newMsg = cEx.message+" @ "+str(line+1)
						raise Exception(newMsg)

	def compileTab1(self,bar,src):
		while src != "":
			m = re.match("^([0-9X\\+]+)\\s*(.*)$",src)
			if m is not None:
				strum = m.group(1)
				bar.add(strum)
				src = m.group(2)
			elif src[0] in bar.qbOffsets:
				bar.offset(src[0])
				src = src[1:].strip()
			else:
				raise CompilerException("Unknown command "+src)

	def exportToJSON(self,handle):
		handle.write("{  \n")
		keys = [x for x in self.keys.keys()]
		keys.sort()
		for k in keys:
			handle.write('   {0:14}:"{1}",\n'.format('"'+k+'"',self.keys[k]))
		handle.write('   "bars": [\n')
		for n in range(0,len(self.bars)):
			r = self.bars[n].render()
			handle.write('{0:14}"{1}"{2}\n'.format("",r,"," if n < len(self.bars)-1 else ""))
		handle.write("\n           ]\n")
		handle.write("}  \n")

s = Song("twinkle.tab1")
s.exportToJSON(sys.stdout)
s.exportToJSON(open("../app/music.json","w"))

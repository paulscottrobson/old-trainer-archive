
import sys,re

class Compiler:
	#
	#	Compile a source file.
	#
	def compile(self,sourceFile):
		# set up default control values
		self.header = { "name":"","author":"", "instrument":"", 			\
									"type":None, "speed":"100", "beats":"4"}

		# read and process the file									
		source = open(sourceFile).readlines()
		source = [x if x.find("//") < 0 else x[:x.find("//")] for x in source]
		source = [x.replace("\t"," ").strip() for x in source]

		# music bars
		self.bars = []

		# for each source line
		for n in range(0,len(source)):
			self.lineNumber = n + 1
			# if present, check to see if assignment, if not split into bars and compile
			if source[n] != "":
				if source[n].find(":=") >= 0:
					parts = [x.strip() for x in source[n].split(":=")]
					self.header[parts[0].lower()] = parts[1]
				else:
					for bar in source[n].split("|"):
						self.bars.append(self.compileBar(bar.strip()))

	#
	#	Compile a single bar
	#
	def compileBar(self,barSrc):
		#print(">>>",barSrc)
		barElements = []
		barPositionQuarterBeats = 0
		barSrcStart = barSrc
		barSrc = barSrc.strip()
		# notes used to specify frets/notes
		self.dulcimerNotes = "0123456789TLWHUIXV"
		self.ocarinaNotes = "abcdefgABCDEFG"
		# all legal ones
		allNotes = self.dulcimerNotes.lower()+self.dulcimerNotes.upper()+self.ocarinaNotes
		# position modifiers and list of keys
		modifiers = { "-":-0.5 , "=":-0.75,"o":1.0, ".":0.5 }
		modifierKeys = "".join(modifiers.keys())
		# do the whole bar
		while barSrc != "":
			# look for a strum/note
			m = re.match("^(["+allNotes+"\\#\\+\\&]+)\\s*(.*)$",barSrc)
			# if found add it
			if m is not None:
				if barPositionQuarterBeats < 0 or barPositionQuarterBeats > self.getBeats()*4:
					self.error("Bar position error "+barSrcStart)
				barElements.append([self.compilePlay(m.group(1)),barPositionQuarterBeats])
				barSrc = m.group(2)
				barPositionQuarterBeats += 4
			# otherwise modifier				
			elif modifierKeys.find(barSrc[0]) >= 0:
				barPositionQuarterBeats += int(modifiers[barSrc[0]] * 4)
				barSrc = barSrc[1:].strip()
			# otherwise error
			else:
				self.error("Don't understand "+barSrcStart)

		#print(barElements,barPositionQuarterBeats)

		# convert that list of [notes],timeQuarter into encoded music.
		barObj = ""
		barPositionQuarterBeats = 0
		# for each note
		for note in barElements:
			# advance the pointer forward.
			while barPositionQuarterBeats != note[1]:
				diff = note[1] - barPositionQuarterBeats 
				if diff > 8:
					barPositionQuarterBeats += 8
					barObj += "8"
				else:
					barPositionQuarterBeats += diff
					barObj += str(diff)
			# convert to character representation
			notes = ["-" if x is None else chr(x+65) for x in note[0]]
			# then a single string.
			barObj = barObj + "".join(notes)

		return barObj
	#
	#	Compile and post process one sequence of notes.
	#
	def compilePlay(self,notes):
		noteList = []
		for c in notes:
			toChromatic = [0,2,4,5,7,9,10]
			n = self.dulcimerNotes.find(c.upper())
			if n < 0:
				n = self.ocarinaNotes.find(c)
				toChromatic = [0,2,3,5,7,8,10]
			if n < 0:
				if c == '&':
					noteList.append(None)
				else:
					if len(noteList) == 0 or noteList[-1] is None:
						self.error("Badly placed note adjuster "+notes)
					noteList[-1] += 1
			else:
				# convert to chromatic offset and add to note list.
				n = toChromatic[n % 7]+int(n/7)*12
				noteList.append(n)

		# Does it need left justifying ?
		if self.getStrings() > 1:
			while len(noteList) < self.getStrings():
				noteList.insert(0,None if noteList[-1] is None else 0)

		if len(noteList) > self.getStrings():
			self.error("Note too long for instrument "+notes)
		return noteList
	#
	#	Report an error
	#
	def error(self,msg):
		print("ERROR : {0} at {1}".format(msg,self.lineNumber))
		sys.exit(0)

	#
	#	Get the correct number of strings. This is hardcoded here and mirrored
	#	in the typescript instrument classes. The compiler needs to know this.
	#	
	def getStrings(self):
		assert self.header["type"] is not None,"No type of instrument given"
		return 1 if self.header["type"].upper().find("OCARINA") >= 0 else 3
	#
	#	Get the number of beats in a bar
	#
	def getBeats(self):
		return int(self.header["beats"])
	#
	#	Render JSON.
	#
	def render(self,stream):
		assert self.header["type"] is not None,"No type of instrument given"
		self.header["type"] = self.header["type"].upper()
		stream.write("{\n")
		for k,v in self.header.items():
			stream.write('  "{0}":"{1}",\n'.format(k,v))
		stream.write('  "bars":[\n')
		for n in range(0,len(self.bars)):
			stream.write('          "{0}"{1}\n'.format(self.bars[n],"" if n == len(self.bars)-1 else ","))
		stream.write("         ]\n}\n")
	#
	#	Render to file
	#
	def renderFile(self,tgtfile):
		h = open(tgtfile,"w")
		self.render(h)
		h.close()


if __name__ == '__main__':
	c = Compiler()		
	c.compile("demo.ms1")
	c.renderFile("../app/water.json")

	c.compile("demo2.ms1")
	c.renderFile("../app/races.json")
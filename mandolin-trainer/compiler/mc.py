
import sys,re

# ************************************************************************************************
#
#										 Compiler Exception
#
# ************************************************************************************************

class CompilerError(Exception):
	pass

# ************************************************************************************************
#
#									Standard Mandolin Bar class
#
# ************************************************************************************************

class MandolinBar:
	#
	#	Initialise and create from definition.
	#
	def __init__(self,definition,headers):
		# bar notes
		self.notes = []
		# current position in song
		quarterPos = 0
		# get number of beats
		beats = int(headers["beats"])
		# note length modifiers
		self.modifiers = { "&":4, "=":-3,"O":4,"-":-2,".":2 }			
		# Convert fret (in single octave) to Chromatic D E F# G A B C#
		self.toChromatic = [ 0,2,4,5,7,9,10 ]		
		# Code for fretting (X is no strum)
		self.noteChars = "0123456789TLWHRFX"
		# Add to chromatic value for rendering
		self.strumConvert = 65

		definition = definition.upper()
		pos = 0 
		# Work through entire definition
		while pos < len(definition):
			# get first character
			ch = definition[pos]

			# switch tab line
			if "EADG".find(ch) >= 0:
				MandolinBar.currentString = MandolinBar.currentShift = "EADG".find(ch)
				pos += 1

			# note 0-9 etc.
			elif self.noteChars.find(ch) >= 0:
				# basic validation
				if quarterPos >= beats * 4:
					raise CompilerError("Bar Overflow")
				if MandolinBar.currentShift < 0 or MandolinBar.currentShift > 3:
					raise CompilerError("Bad shift position")
				# build strum
				strum = ["-"] * 4
				strum[MandolinBar.currentShift] = chr(self.noteChars.find(ch)+self.strumConvert)				
				strum = "".join(strum)
				# add to notes
				self.notes.append([strum,quarterPos])
				# reset any shift
				MandolinBar.currentShift = MandolinBar.currentString
				# forward a beat
				quarterPos += 4
				pos += 1

			# [frets] e.g. a chord
			elif ch == "[":
				# check validation
				if quarterPos >= beats * 4:
					raise CompilerError("Bar Overflow")
				pos += 1
				# build note from 4 fret positions
				note = ""
				for n in range(0,4):
					ch = (definition+"?")[pos]
					pos = pos + 1
					if ch == "-" or self.noteChars.find(ch) >= 0:
						note = note + (chr(self.noteChars.find(ch)+self.strumConvert) if ch != "-" else "-")
					else:
						raise CompilerError("Bad chord definition")
				# check ending ]
				if (definition+"?")[pos] != "]":
					raise CompilerError("Missing ]")
				# add to notes
				self.notes.append([note,quarterPos])
				quarterPos += 4
				pos += 1

			# temporary shift (reset after note)
			elif ch == "^" or ch == "V":
				MandolinBar.currentShift += -1 if ch == "^" else 1
				pos += 1

			# skip over spaces
			elif ch == ' ':
				pos += 1

			# modify position for modifiers.
			elif ch in self.modifiers:
				quarterPos += self.modifiers[ch]
				if quarterPos < 0:
					raise CompilerError("Bar underflow")
				pos += 1

			else:
				raise CompilerError("Unknown character "+ch)

	#
	#	Create Rendering for a bar
	#
	def render(self):
		render = ""
		quarterPos = 0
		for note in self.notes:
			# advance current position with quarter-beat spacing until reached note position
			while quarterPos != note[1]:
				offset = min(note[1]-quarterPos,8)
				render += str(offset)
				quarterPos += offset
			# add the note strum.
			render += note[0]
		return render

MandolinBar.currentString = -1 												# static value current string 0=E
MandolinBar.currentShift = -1 												# current shifted value.

# ************************************************************************************************
#
#											Compiler class
#
# ************************************************************************************************

class MandolinCompiler:
	#
	#	Reset the compiler
	#
	def reset(self):
		self.header = { "name":"<unknown>","author":"<unknown>","beats":"4","speed":"100",	\
						"voices":"4","tuning":"normal","capo":"0","version":"1.0", \
						"diatonic":"0","transpose":"0","format":"0" }

		self.bars = []
		self.lineNumber = 0
	#
	#	Load and pre-process source
	#
	def load(self,source):
		# remove comments
		self.source = [x if x.find("//") < 0 else x[:x.find("//")] for x in open(source).readlines()]
		# remove tabs, leading trailing spaces
		self.source = [x.replace("\t"," ").strip() for x in self.source]
		# process assignments.
		for assign in [x for x in self.source if x.find(":=") >= 0]:
			# split into before/after :=
			parts = [x.strip() for x in assign.split(":=")]
			if len(parts) != 2 or parts[0].lower() not in self.header:
				raise CompilerError("Bad assignment '"+assign+"'")
			self.header[parts[0].lower()] = parts[1]
		# remove assignments
		self.source = [x if x.find(":=") < 0 else "" for x in self.source]
	#
	#	Compile all the bars.
	#
	def compileBars(self):
		# each line
		for n in range(0,len(self.source)):
			# set error line number
			self.lineNumber = n + 1
			# for each bar
			for barDef in [x for x in self.source[n].split("|")]:
				# if not empty, create bar from it and add it.
				if barDef != "":
					self.bars.append(MandolinBar(barDef,self.header))
					#print(barDef,self.bars[-1].notes)
					#print('"'+self.bars[-1].render(int(self.header["beats"]))+'"')
	#
	#	Render the JSON.
	#
	def render(self,handle):
		# must have tuning.
		if self.header["tuning"] == "":
			raise CompilerError("Failed to set tuning")			
		handle.write("{\n")
		# write out assignments
		keys = [x for x in self.header.keys()]
		keys.sort()
		for k in keys:
			handle.write('    "{0}":"{1}",\n'.format(k,self.header[k]))
		# write out bars array			
		handle.write('    "bars":[')			
		# rendering is done by the object
		handle.write(",".join(['\n                "'+x.render()+'"' for x in self.bars]))
		handle.write("\n           ]\n}\n")
	#
	#	Render to a file
	#
	def renderFile(self,jsonFile):
		handle = open(jsonFile,"w")
		self.render(handle)
		handle.close()
	#
	#	Compile a single file. Does them all in order.
	#
	def compileFile(self,source,target = ""):
		self.reset()
		self.load(source)
		self.compileBars()
		if target == "":
			target = source.replace(".song",".json").replace(" ","_")
		self.renderFile(target)

if __name__ == '__main__':
	c = MandolinCompiler()
	c.compileFile("demo.song","../app/music.json")

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
#									Standard Dulcimer Bar class
#
# ************************************************************************************************

class DulcimerBar:
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
		self.noteChars = "X0123456789TEWHUF"
		# Add to chromatic value for rendering
		self.strumConvert = 65

		definition = definition.upper()
		pos = 0 
		# Work through entire definition
		while pos < len(definition):
			ch = definition[pos]
			# is first character a note
			if self.noteChars.find(ch) >= 0:
				# check bar overflowed ?
				if quarterPos >= beats *4:
					raise CompilerError("Bar overflow")
				note = ""
				# build up notes
				while self.noteChars.find((definition+" ")[pos]) >= 0:
					ch = definition[pos]
					pos = pos + 1
					# diatonic value (-1 because of X on self.notechars)
					noteDiatonic = self.noteChars.find(ch)-1
					if noteDiatonic >= 0:
						# add capo positin
						noteDiatonic = noteDiatonic + int(headers["capo"])
						# convert to chromatic						
						noteChromatic = self.toChromatic[noteDiatonic % 7] + int(noteDiatonic/7) * 12
						# adjust +1 semitone for + fret
						if (definition+" ")[pos] == '+':
							pos = pos + 1
							noteChromatic = noteChromatic + 1
					# add - for no strum or chromatic encoded
					note = note + ("-" if noteDiatonic < 0 else chr(noteChromatic+self.strumConvert))
				if len(note) > 3:
					raise CompilerError("Note too long")
				# right justify result with no-strum or 0.
				note = ("---" if headers["drone"].upper()[0] != 'Y' else "AAA") + note
				# add to note list and advance four quarterbeats
				self.notes.append([note[-3:],quarterPos])
				quarterPos += 4
				#print(self.notes[-1])

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

# ************************************************************************************************
#
#											Compiler class
#
# ************************************************************************************************

class DulcimerCompiler:
	#
	#	Reset the compiler
	#
	def reset(self):
		self.header = { "name":"<unknown>","author":"<unknown>","beats":"4","speed":"100",			\
						"voices":3,"tuning":"","drone":"yes","capo":0,								\
						"diatonic":1,"transpose":0,"format":0 }

		self.headerNumbers = [ "beats","speed","voices","capo","diatonic","transpose","format" ]
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
					if self.header["format"] == "1":
						barDef = self.convertFromFormat1(barDef)
					self.bars.append(DulcimerBar(barDef,self.header))
					#print(barDef,self.bars[-1].notes)
					#print('"'+self.bars[-1].render(int(self.header["beats"]))+'"')
	#
	#	Convert from format 1 (DAA style note tunes, which can be transposed.)
	#
	def convertFromFormat1(self,defn):
		result = ""
		self.noteChars = "X0123456789TEWHUF"
		defn = defn.upper().replace(" ","")
		for c in defn:
			if self.noteChars.find(c) >= 0 and c != 'X':
				n = self.noteChars.find(c)-1+ int(self.header["transpose"])
				if n < 0:
					result = result + "0"+self.noteChars[n+1+3]+"X "
				else:
					result = result + "00"+self.noteChars[n+1]+" "
			else:
				result += c+" "

		print(defn,result)
		return result
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
			handle.write('    "{0}":{1},\n'.format(k,self.header[k] if k in self.headerNumbers else '"'+self.header[k]+'"'))
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
	c = DulcimerCompiler()
	c.compileFile("demo.song","../app/music.json")
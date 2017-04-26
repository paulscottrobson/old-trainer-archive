
import sys,re

# ************************************************************************************************
#
#										 Compiler Exception
#
# ************************************************************************************************

class OC1Error(Exception):
	pass

# ************************************************************************************************
#
#											  Bar class
#
# ************************************************************************************************

class Bar:
	#
	#	Initialise and create from definition.
	#
	def __init__(self,definition,beats):
		self.notes = []
		self.quarterPos = 0
		self.toChromatic = [ 0,2,3,5,7,8,10 ]			# A [A#] B C [C#] D [D#] E F [F#] G [G#]
		self.modifiers = { "=":-3,"o":4,"-":-2,".":2 }	# Modifiers.
		self.lengths = [ 1,2,3,4,6,8,12,16 ]			# length values.
		for c in [x for x in definition]:
			self.compileCharacter(c,beats)
	#
	#	Compile a single character
	#
	def compileCharacter(self,ch,beats):
		if "ABCDEFG".find(ch.upper()) >= 0:				# Note A-Ga-g
			if self.quarterPos >= beats * 4:
				raise OC1Error("Bar overflow")
			note = self.toChromatic["ABCDEFG".find(ch.upper())]
			if ch.isupper():
				note = note + 12
			self.notes.append([note,self.quarterPos])
			self.quarterPos += 4
		elif ch == '&':									# Rest
			if self.quarterPos >= beats * 4:
				raise OC1Error("Bar overflow")
			self.notes.append([None,self.quarterPos])
			self.quarterPos += 4
		elif ch == '#':									# Sharp
			if len(self.notes) == 0 or self.notes[-1][0] is None:
				raise OC1Error("No note to apply sharp to")
			self.notes[-1][0] += 1
		elif ch in self.modifiers:						# time modifiers
			self.quarterPos += self.modifiers[ch]
			if self.quarterPos < 0:
				raise OC1Error("Bar underflow")
		else:
			raise OC1Error("Unknown in bar definition '"+ch+"'")
	#
	#	Create Rendering for a bar
	#
	def render(self):
		render = ""
		#print(self.notes)
		for i in range(0,len(self.notes)):
			np = self.notes[i]
			render = render + ("-" if np[0] is None else chr(np[0]+65))
			ln = self.quarterPos - np[1] if i == len(self.notes)-1 else self.notes[i+1][1] - np[1]
			if self.lengths.index(ln) < 0:
				raise OC1Error("Bar contains note length of {0} beats".format(ln/4))
			render = render + str(self.lengths.index(ln))
		return render

# ************************************************************************************************
#
#											Compiler class
#
# ************************************************************************************************

class OC1Compiler:
	#
	#	Reset the compiler
	#
	def reset(self):
		self.header = { "name":"<unknown>","author":"<unknown>","beats":"4","speed":"100" }
		self.headerNumbers = [ "beats","speed" ]
		self.bars = []
		self.lineNumber = 0
	#
	#	Load and pre-process source
	#
	def load(self,source):
		self.source = [x if x.find("//") < 0 else x[:x.find("//")] for x in open(source).readlines()]
		self.source = [x.replace("\t"," ").strip() for x in self.source]
		for assign in [x for x in self.source if x.find(":=") >= 0]:
			parts = [x.strip() for x in assign.split(":=")]
			if len(parts) != 2 or parts[0].lower() not in self.header:
				raise OC1Error("Bad assignment '"+assign+"'")
			self.header[parts[0].lower()] = parts[1]
		self.source = [x if x.find(":=") < 0 else "" for x in self.source]
	#
	#	Compile all the bars.
	#
	def compileBars(self):
		for n in range(0,len(self.source)):
			self.lineNumber = n + 1
			for barDef in [x.replace(" ","") for x in self.source[n].split("|")]:
				if barDef != "":
					self.bars.append(Bar(barDef,int(self.header["beats"])))
					#print(barDef,self.bars[-1].notes)
					#print('"'+self.bars[-1].render(int(self.header["beats"]))+'"')
	#
	#	Render the JSON.
	#
	def render(self,handle):
		handle.write("{\n")
		keys = [x for x in self.header.keys()]
		keys.sort()
		for k in keys:
			handle.write('    "{0}":{1},\n'.format(k,self.header[k] if k in self.headerNumbers else '"'+self.header[k]+'"'))
		handle.write('    "bars":[')			
		handle.write(",".join(['\n                "'+x.render()+'"' for x in self.bars]))
		handle.write("\n           ]\n}\n")
	#
	#	Render to a file
	#
	def renderFile(self,jsonFile):
		handle = open(jsonFile,"w")
		self.render(handle)
		handle.close()

if __name__ == '__main__':
	c = OC1Compiler()	
	c.reset()	
	c.load("camptown.oc1")
	c.compileBars()
	c.render(sys.stdout)
	c.renderFile("../app/music.json")

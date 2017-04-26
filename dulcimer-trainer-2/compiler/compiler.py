# *********************************************************************************************************
#
#		Name:		compiler.py
#		Purpose:	compiler wrapper / utilities
#		Author:		Paul Robson (paul@robsons.org.uk)
#		Date:		4 Nov 2016
#
# *********************************************************************************************************

import os,sys,re
from songc import SongCompiler

# *********************************************************************************************************
#												Compiler class
# *********************************************************************************************************

class Compiler:
	def __init__(self,sourceFile,objectFile,compilerObject):
		src = self.readSourceFile(sourceFile)											# read and preprocess
		src = self.processAssignments(src,sourceFile)									# process assignments
		self.tgt = open(objectFile,"w")													# write to object file.
		#self.tgt = sys.stdout 
		self.renderAssignments(self.tgt)												# render assignments
		self.currentBar = 10001000 														# current bar position
		self.currentBeat = 0 															# beat position in note.
		self.chromaticMap = [99,0,2,4,5,7,9,10,12,14,16,17,19,21,22,24]					# diatonic -> chromatic
		for i in range(0,len(src)):														# for each line
			if src[i] != "":															# if not empty
				compilerObject.processLine(src[i],i+1,self)								# compile it.
		if self.tgt != sys.stdout:														# close file.
			self.tgt.close()

	def readSourceFile(self,sourceFile):
		if not os.path.isfile(sourceFile):												# check file exists
			raise CompilerException("File "+sourceFile+"does not exist")
		src = [x.replace("\t"," ") for x in open(sourceFile).readlines()]				# read file, handle tabs
		src = [x if x.find("//") < 0 else x[:x.find("//")] for x in src]				# remove comments
		src = [x.strip().lower() for x in src]											# trim lines
		return src
		
	def processAssignments(self,src,sourceFile):
		self.assignments = { "beats":"4","tempo":"120","syncopation":"50","translator":"paul robson","author":"","drone":"n" }
		self.assignments["name"] = os.path.splitext(os.path.split(sourceFile)[1])[0].lower()
		for s in [x for x in src if x.find(":=") >= 0]:									# find assignments
			sa = [x.strip().lower() for x in s.split(":=")]								# split into parts
			if len(sa) != 2:
				raise CompilerException("Syntax error in assignment "+s)
			self.assignments[sa[0]] = sa[1]												# update assignments		
		return [x if x.find(":=") < 0 else "" for x in src]								# remove assignments

	def renderAssignments(self,tgt):
		keys = [x for x in self.assignments.keys()]										# get keys
		keys.sort()																		# sort them.
		for i in range(0,len(keys)):													# for each key.
			tgt.write("{0:08}:{1}:={2}\n".format(i+1000000,keys[i],self.assignments[keys[i]]))

	def generateLyric(self,lyric):
		self.tgt.write("{0:08}:\"{1}\"\n".format(self.currentBar,lyric))

	def generateNote(self,note,line,chord = "",upStroke = False):
		note = [x if x is not None else 99 for x in note]								# convert non-played to 99
		note = "".join(["{0:02}".format(x) for x in note])								# make a string
		if chord != "":																	# add chord if required
			note = note + ";"															# add semicolon seperator
			if upStroke:																# add ^ if upstroke.
				note = note + "^"
			note = note + (chord.lower())												# add chord body
		self.tgt.write("{0:08}:{1}\n".format(int(self.currentBar+self.currentBeat),note)) # write it out.

	def isBeatPositionValid(self):
		return int(self.currentBeat) < 1000

	def advancePointer(self,beatNumber):
		beats = int(self.assignments["beats"])
		self.currentBeat += 1000.0 / beats * beatNumber

	def advanceUnit(self,beatCount):
		self.currentBeat += beatCount

	def getBeats(self):
		return int(self.assignments["beats"])

	def getAssign(self,key):
		key = key.lower().strip()
		if key in self.assignments:
			return self.assignments[key]
		else:
			return None
			
	def getBar(self):
		return (self.currentBar - 10000000) / 1000

	def getFretCharacters(self):
		return "x0123456789tlwhf"
		
	def translateChromatic(self,note):
		chromatic = []															# chromatic go here
		while note != "":														# while not done
			n = self.getFretCharacters().find(note[0])							# get diatonic note
			n = self.chromaticMap[n]											# convert to chromatic note
			note = note[1:]														# remove first character
			if note != "" and note[0] == '+':									# handle x+
				if n == 99:														# can't do for no strum
					raise CompilerException("Cannot use + on x in note")
				note = note[1:]													# remove the +
				n = n + 1 														# advance one chromatically
			chromatic.append(n)
		if len(chromatic) > 3:
			raise CompilerException("Too many notes")
		isDrone = self.getAssign("drone").lower()[0] == 'y'
		while len(chromatic) < 3:												# add drones/no strums
			chromatic.append(0 if isDrone else 99)
		return chromatic

	def nextBar(self):
		self.currentBar += 1000
		self.currentBeat = 0

if __name__ == '__main__':
	from builder import CompilerDispatcher
	c = Compiler("test.song","../app/media/music/test2.music",CompilerDispatcher())

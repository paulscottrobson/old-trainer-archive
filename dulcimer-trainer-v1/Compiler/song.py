# ************************************************************************************************************
# ************************************************************************************************************
#
#		File:		song.py
#		Author:		Paul Robson	(paul@robsons.org.uk)
#		Purpose:	Compiler "Song" format
#		Date: 		10th September 2016
#
# ************************************************************************************************************
# ************************************************************************************************************

import os,sys,re,random 
from compiler import Compiler,CompilerException
from elements import NoteElement,LyricElement,ElementStore

class SongCompiler(Compiler):
	def __init__(self,sourceFile,targetFile,force = False):
		self.currentChord = "x" 
		self.currentPattern = None
		self.currentMacro = None
		self.pendingChord = None
		self.macros = {}
		self.chromaConv = [0,2,4,5,7,9,10,12,14,16,17,19,21,22]
		random.seed()
		Compiler.__init__(self,sourceFile,targetFile,force)

	def compileLine(self,line):
		line = line.lower().strip()		
		if line != "" and self.currentMacro is not None:									# building a macro
			closeMacro = False
			if line[-1] == ';':																# end of macro
				line = line[:-1].strip()													# remove semicolon
				closeMacro = True 
			self.macros[self.currentMacro] = self.macros[self.currentMacro]+" "+line 		# build macro.
			if closeMacro:																	# close macro if required.
				self.currentMacro = None 

		elif re.match("^\\$[a-z]$",line) is not None:										# Macro expansion ?
				self.compileLine(self.macros[line[1]])										# do it ?

		elif re.match("^\\:[a-z]",line) is not None:										# Macro definition
			self.currentMacro = line[1]
			self.macros[self.currentMacro] = ""
			self.compileLine(line[2:])

		elif line != "":																	# if something present
			if line[-1] != '|':																# check the closing bar
				raise CompilerException("Line is missing closing bar")
			line = line[:-1].strip().split("|")												# split into bits
			for l in line:																	# for each bar in the line.
				self.compileBar(l)

	def compileBar(self,l):
		l = self.checkPatternSwitch(l).strip()												# check for new pattern
		if l.find("[") >= 0:																# chordal data ?
			m = re.search('\\"(.*\\/.*)\\"',l)												# quote contains a /
			if m is not None:
				lyrics = [x.strip() for x in m.group(1).split("/")]							# lyric list
				l = l.replace(m.group(0),"").strip()										# chordal information
				for lyric in lyrics:
					self.checkLyric('"'+lyric+'"')
					self.generateChordBar(l)
					self.nextBar()
			else:
				l = self.checkLyric(l).strip() 												# lyric check
				self.generateChordBar(l)
				self.nextBar()
		else:
			l = self.checkLyric(l).strip() 													# lyric check
			while l != "":																	# while something to do
				l = self.generateMusicItem(l).strip()										# process it
			self.nextBar()

	def checkPatternSwitch(self,line):
		m = re.search("\\@(\\d)",line)														# look for @n
		if m is not None:
			self.currentPattern = int(m.group(1))											# new pattern
			if not self.storage.contains("pattern_"+str(self.currentPattern)):				# does it exist ?
				raise CompilerException("Pattern {0} undefined".format(self.currentPattern))
			line = line.replace(m.group(0)," ")												# remove pattern
			if line.find("@") >= 0:															# two of them ????
				raise CompilerException("Multiple patterns in bar")
		return line

	def checkLyric(self,line):
		m = re.search('\\"(.*)\\"',line)													# look for lyric
		if m is not None:																	# if found.
			self.compileLyric(m.group(1).strip().lower())									# compile it in.
			line = line.replace(m.group(0)," ")												# remove it.			
		return line

	def generateMusicItem(self,line):
		m = re.match("^([0-9tewx\\,\\+\\^]+)\\s*(.*)$",line)								# is it a strum definition ?
		if m is not None:
			s = self.toStrum(m.group(1))													# get strum
			#print(m.group(1),s)
			self.compileNote(s,self.pendingChord)											# compile it in.
			self.pendingChord = None
			self.moveForward(1)																# forward 1 beat
			line = m.group(2)
		elif line[0] == '<':																# set pending chord
			m = re.match("^\\<([0-9a-z\\#]+)>\\s*(.*)$",line)								# pull chord out.
			if m is None:
				raise CompilerException("Pending chord syntax")
			self.pendingChord = m.group(1).strip().lower()
			line = m.group(2).strip()
		elif self.moveCommand(line[0]):														# timing/move command
			line = line[1:]
		else:																				# we give up.
			raise CompilerException("Syntax "+line)
		return line

	def generateChordBar(self,chords):
		if self.currentPattern is None:														# check the pattern set
			raise CompilerException("No pattern set for chord bar")
		chords = chords.strip()
		if chords[0] != '[' or chords[-1] != ']':											# check only rhythm left
			raise CompilerException("Syntax error in chord bar")
		chords = chords[1:-1].strip().split()
		if len(chords) == 0:																# carry on, using []
			chords = [ '-' ]
		chords = [x if x != '-' and x != '.' else None for x in chords]						# convert - . to None
		while len(chords) < self.getBeats():												# pad out to correct size
			chords.append(None)
		if chords[0] is None:																# carrying on previous chord
			chords[0] = self.currentChord
			
		for i in range(0,self.getBeats()):
			if chords[i] == 'q':
				if self.storage.contains('chord_q') is None:
					raise CompilerException("Q Chord selection Missing")
				chords[i] = random.choice(self.storage.get("chord_q").split(";"))
			

		for i in range(1,self.getBeats()):													# pad chord out.		
			if chords[i] is None:															# so all are defined.
				chords[i] = chords[i-1]
		self.currentChord = chords[-1]														# new current chord is last chord
		pattern = self.storage.get("pattern_"+str(self.currentPattern))						# get pattern		
		for b in range(0,self.getBeats()*2):												# for each half beat.
			if pattern[b] != '.':															# strum on this beat ?
				time = 1000 / self.getBeats() * int(b/2)									# base time
				if b % 2 != 0:																# off beat ?
					time = time + 1000 / self.getBeats() * int(self.storage.get("syncopation")) / 100
				self.generateChord(time,chords[int(b/2)],b % 2 != 0)						# generate chord

	def generateChord(self,time,chord,offBeat):
		if chord != "x":																	# if not no-chord	
			note = self.getChord(chord)
			if chord.find(".") > 0:															# chord contains non display part ?
				chord = chord.split(".")[0]
			if re.match("^[abcdefg]",chord) is None:
				chord = ""
			self.add(NoteElement(self.barNumber,time,note,chord))							# add the chord

	def getChord(self,chord):
		key = "chord_"+chord 
		if not self.storage.contains(key):
			if re.match("^[0-9tew+\\,]+$",chord):
				return self.toStrum(chord)
			else:
				raise CompilerException("Chord "+chord+" is unknown.")
		return self.toStrum(self.storage.get(key))

	def toStrum(self,strum):
		self.originalStrum = strum 															# save it
		while strum[0] == '^':																# process string shift
			strum = strum[1:]+",x"
		notes = []																			# this is the notes vector
		while strum != "":																	# while something left to process
			strum = self.getString(strum,notes)												# get the next string.
		if len(notes) == 0 or len(notes) > 3:												# check length.
			raise CompilerException("Bad strum length "+self.originalStrum)					# and throw it.
		notes.reverse()																		# pad the front with 99
		defaultValue = 99
		if self.storage.get("drone").lower()[0] == 'y':
			defaultValue = 0
		while len(notes) != 3:
			notes.append(defaultValue)
		notes.reverse()
		for i in range(0,3):																# convert to chromatic
			n = notes[i]
			if n != 99:																		# if not no strum
				notes[i] = self.chromaConv[int(n)]
				if n != int(n):																# handle .5
					notes[i] = notes[i]+1
		return notes

	def getString(self,strum,notes):
		c = strum[0]																		# remove first character
		strum = strum[1:]

		if c == '1':																		# if 1
			if strum != "":																	# check if following digit.
				if strum[0] >= '0' and strum[0] <= '9':				
					c = c + strum[0]														# if so take that in.
					strum = strum[1:]
			notes.append(int(c))															# and add it.

		elif c == 't':																		# handle t (ten)
			notes.append(10)

		elif c == 'e':																		# handle e (eleven)
			notes.append(11)

		elif c == 'w':																		# handle w (twelve)
			notes.append(12)

		elif c == 'x':																		# handle no strum (99)
			notes.append(99)

		else:
			if c < '0' or c > '9':															# check digit
				raise CompilerException("Can't understand "+self.originalStrum)
			notes.append(int(c))

		if strum != "":																		# check for +
			if strum[0] == '+':
				notes[-1] += 0.5
				strum = strum[1:]
		if strum != "":																		# remove seperating comma
			if strum[0] == ',':
				strum = strum[1:]
		return strum

if __name__ == "__main__":
	c = SongCompiler(".\\demo.song","..\\app\\media\\music\\demo.music",True)

		
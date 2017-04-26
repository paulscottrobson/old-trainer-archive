# *********************************************************************************************************
#
#		Name:		songc.py
#		Purpose:	song format compiler.
#		Author:		Paul Robson (paul@robsons.org.uk)
#		Date:		4 Nov 2016
#
# *********************************************************************************************************

import os,sys,re
from compilerex import CompilerException

# *********************************************************************************************************
#												Song Compiler
# *********************************************************************************************************

class SongCompiler:
	def __init__(self):
		self.defaultBeat = 1.0 															# default for note.
		self.adjusters = { "&":1,"o":1,"-":-0.5,"=":-0.75,".":0.5 }						# offsetters

	def processLine(self,line,number,wrapper):
		self.currentNumber = number 													# save line number.
		self.wrapper = wrapper
		fretCharacters = self.wrapper.getFretCharacters()
		fretExpression = "([\\+"+fretCharacters+"]+)"
		for bar in line.split("|"):														# for each bar.
			bar = bar.strip().lower()													# preprocess		
			if bar != "":																# if not empty.
				#print("**** "+bar+" ****")
				bar = self.processLyrics(bar).strip()
				while bar != "":														# something to do.
					if fretCharacters.find(bar[0]) >= 0:								# is it a note ?
						m = re.match(fretExpression,bar)								# find whole fretset
						assert m is not None
						note = self.wrapper.translateChromatic(m.group(1))				# convert it
						#print(">>>","{"+m.group(1)+"}",note)
						bar = bar[len(m.group(1)):].strip()								# remove it.

						if not self.wrapper.isBeatPositionValid():
							self.reportError("Bar too long",bar)
						self.wrapper.generateNote(note,self.currentNumber) 				# render it.
						self.wrapper.advancePointer(self.defaultBeat)					# and move by the default beat
					elif bar[0] in self.adjusters:										# positional adjuster ?
						self.wrapper.advancePointer(self.adjusters[bar[0]])
						bar = bar[1:]
					elif bar[0] == '@':													# standard beat change
						if len(bar) == 1 or bar[1] < "1" or bar[1] > "4":
							self.reportError("Bad default rate ",bar)
						self.defaultBeat = 1.0 / int(bar[1])
						bar = bar[2:]
					else:
						self.reportError("Syntax Error",bar)
					bar = bar.strip()
				self.wrapper.nextBar()

	def reportError(self,msg,item):
		raise CompilerException(msg+" "+item+" @ "+str(self.currentNumber))

	def processLyrics(self,bar):
		m = re.search('(\\"[a-z0-9\\.\\,\\;\\:\\s]+\\")',bar)							# check for lyrics
		if m is not None:
			self.wrapper.generateLyric(m.group(1)[1:-1].strip())						# create lyrics
			bar = bar.replace(m.group(1),"")
		return bar



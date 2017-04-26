# ************************************************************************************************************
# ************************************************************************************************************
#
#		File:		compiler.py
#		Author:		Paul Robson	(paul@robsons.org.uk)
#		Purpose:	Compiler base class
#		Date: 		1st September 2016
#
# ************************************************************************************************************
# ************************************************************************************************************

import os,sys,re 

from elements import NoteElement,LyricElement,ElementStore

# ************************************************************************************************************
#											Compiler exception
# ************************************************************************************************************

class CompilerException(Exception):
	pass

# ************************************************************************************************************
#											Base Compiler Class
# ************************************************************************************************************

class Compiler:
	def __init__(self,sourceFile,targetFile,force = False):
		targetFile = targetFile.lower()
		if force or self.checkCompile(sourceFile,targetFile):								# check if needs compiling.
			self.compile(sourceFile,targetFile)

	def compile(self,sourceFile,targetFile):
		print("Compiling {0}".format(sourceFile))		
		self.sourceFile = sourceFile														# save source file.
		if os.path.isfile(targetFile):														# delete target if exists.
			os.remove(targetFile)
		source = open(self.sourceFile).readlines()											# read in source file
		stub = os.path.split(sourceFile)[1]													# get name part of file name
		stub = os.path.splitext(stub)[0].lower()
		self.storage = ElementStore(stub)													# create storage for elements
		source = [x if x.find("//") < 0 else x[:x.find("//")] for x in source]				# remove comments
		source = [x.replace("\t"," ").strip().lower() for x in source]						# process tabs, remove spaces
		for s in [x for x in source if x.find(":=") >= 0]:									# look for assignments.
			self.storage.set(s.split(":=")[0],s.split(":=")[1])

		self.barNumber = 1 																	# current position
		self.beatPosition = 0 
		self.offsets = { "o":1.0, ".":0.5, "-":-0.5, "=":-0.75, "&":1.0 }					# offset look up

		try:
			for n in range(0,len(source)):													# for each line
				self.currentLine = n + 1 													# set current line.
				if source[n].find(":=") < 0:												# if not assignment
					self.compileLine(source[n])												# compile it.
			#print(self.storage.render())
			open(targetFile,"w").write(self.storage.render())

		except CompilerException as ex:
			print("  [{0}:{1}] {2}".format(os.path.split(self.sourceFile)[1],self.currentLine,ex))
			pass

	def getBeats(self):
		return int(self.storage.get("beats"))

	def add(self,element):
		self.storage.add(element)

	def compileLine(self,line):
		raise CompilerException("Cannot compile with Compiler class.")

	def checkCompile(self,sourceFile,targetFile):
		if not os.path.exists(targetFile):
			return True
		return os.path.getmtime(sourceFile) > os.path.getmtime(targetFile)

	def moveForward(self,beats):
		self.beatPosition += int(beats * 1000 / self.getBeats())

	def moveCommand(self,command):
		if command in self.offsets:
			self.moveForward(self.offsets[command])
			return True
		return False

	def nextBar(self):
		self.barNumber += 1
		self.beatPosition = 0

	def compileLyric(self,lyric):
		self.add(LyricElement(self.barNumber,0,lyric))

	def compileNote(self,note,chord):
		if self.beatPosition >= 1000:
			raise CompilerException("Does not fit in bar")
		self.add(NoteElement(self.barNumber,self.beatPosition,note,chord))

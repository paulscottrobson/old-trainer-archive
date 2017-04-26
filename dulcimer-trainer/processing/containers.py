# **************************************************************************************************
# **************************************************************************************************
#
#										Entity Containers
#
# **************************************************************************************************
# **************************************************************************************************

from entities import *

import sys

# **************************************************************************************************
#
#								Class representing a single bar
#
# **************************************************************************************************
class Bar:

	def __init__(self,quarterBeatSize = 16):
		self.contents = []
		self.quarterBeatSize = quarterBeatSize 
	#
	#	Add a single note, rest or strum.
	#
	def add(self,entity):
		self.contents.append(entity)
	#
	#	Add a modifier to the last added note, rest or strum
	#
	def modify(self,modifier):
		if len(self.contents) == 0:
			raise MusicException("Cannot modify an empty bar")
		self.contents[-1].addModifier(modifier)
	#
	#	Convert to string.
	#
	def toString(self):
		return "|"+(",".join([x.toString() for x in self.contents]))+"|"
	#
	#	Convert to JSON
	#
	def toJSON(self,handle,isLast,information):
		handle.write('            "')
		handle.write("".join([x.toJSONString(information) for x in self.contents]))
		handle.write('"{0}\n'.format("" if isLast else ","))
	#
	#	Analyse bar
	#
	def analyse(self,analysis):
		for bar in self.contents:
			analysis = bar.analyse(analysis)
		return analysis
	#
	#	Validate bar data length
	#	
	def validate(self,quarterBeatSize):
		pos = 0
		for item in self.contents:
			if pos >= quarterBeatSize:
				raise MusicException("Bar outsized "+self.toString())
			pos = pos + item.getQuarterBeatLength()			

# **************************************************************************************************
#
#									Class representing a song.
#
# **************************************************************************************************

class Song:
	#
	#	Initialise 
	#
	def __init__(self):
		# no bars yet
		self.bars = []
		# default header values
		self.headers = { "name":"","author":"","beats":"4","speed":"100","accidentals":"", \
						 "tuning":"dad","drone":"no","capo":"0","format":"0","transpose":"0", \
						 "voices":"3","diatonic":"1" }
		self.headers["version"] = "1.0"

		# next add will need a new bar
		self.newBarRequired = True 
	#
	#	get a key
	#
	def getValue(self,key):
		key = key.lower().strip()
		if key not in self.headers:
			raise MusicException("Unknown key "+key)
		return self.headers[key]
	#
	#	set a key
	#
	def setValue(self,key,value):
		key = key.lower().strip()
		if key not in self.headers:
			raise MusicException("Unknown key "+key)
		self.headers[key] = value.strip()
	#
	#	start a new bar with the next note
	#
	def startNewBar(self):
		self.newBarRequired = True
	#
	#	add a note, rest or strum.
	#
	def add(self,entity):
		if self.newBarRequired:
			self.bars.append(Bar(self.getBeats()*4))
			self.newBarRequired = False 
		self.bars[-1].add(entity)
	#
	#	add a modifiers.
	#
	def modify(self,modifier):
		if self.newBarRequired:
			raise MusicException("Modifying bar with no content")
		self.bars[-1].modify(modifier)
	#
	#	get beats in a bar
	#
	def getBeats(self):
		return int(self.headers["beats"])
	#
	#	convert to string.
	#
	def toString(self):
		r = "\n".join(["{0}:={1}".format(x,self.headers[x]) for x in self.headers.keys()])
		r = r + "\n" + "\n".join([b.toString() for b in self.bars])
		return r
	#
	#	convert to JSON, stream to handle.
	#
	def toJSON(self,handle,information):
		handle.write("{\n")
		# make copy of headers so we can update
		copyHeaders = {}
		for k in self.headers.keys():
			copyHeaders[k] = self.headers[k]
		if "tuning" in information:
			copyHeaders["tuning"] = information["tuning"].getTuningName()
		# headers first
		keys = [x for x in self.headers.keys()]
		keys.sort()
		handle.write("\n".join(['    "{0}":"{1}",'.format(x,copyHeaders[x]) for x in keys]))
		# then bar data
		handle.write('\n    "bars":[\n')
		for i in range(0,len(self.bars)):
			self.bars[i].toJSON(handle,(i == len(self.bars)-1),information)
		handle.write("    ]\n}\n")
	#
	#	Analyse song. Returns has of notes:usage count, so we can figure out how important
	#	different notes are.
	#
	def analyse(self,analysis = {}):
		for bar in self.bars:
			analysis = bar.analyse(analysis)
		return analysis
	#
	#	Validate whole song
	#	
	def validate(self,quarterBeatSize):
		for bar in self.bars:
			bar.validate(quarterBeatSize)

if __name__ == '__main__':
	b = Song()
	b.add(Rest())
	b.modify("=")
	b.add(Strum("56+8"))
	b.modify(".")
	b.add(Strum("310"))
	b.modify("-")
	print(b.toString())
	b.toJSON(sys.stdout)


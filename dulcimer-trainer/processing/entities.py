# **************************************************************************************************
# **************************************************************************************************
#
#							Entities that make up parts of a song or music
#
# **************************************************************************************************
# **************************************************************************************************

class MusicException(Exception):
	pass

# **************************************************************************************************
#
#											Base Class
#
# **************************************************************************************************

class BaseEntity:
	def toJSONString(self):
		raise "Cannot generate JSON data for entity"
	def analyse(self,analysis):
		return analysis

# **************************************************************************************************
#
#				Abstract note class which has a length but no actual representation
#
# **************************************************************************************************

class AbstractNoteClass(BaseEntity):
	#
	#	Set up, the default length of a note is 1 beat = 4 quarter beats
	#
	def __init__(self):
		self.quarterBeatLength = 4
	#
	#	Add value in quarterbeats
	#
	def addQuarterBeat(self,count):
		self.quarterBeatLength += count 
	#
	#	Check if given string character is a modifier
	#
	@staticmethod
	def isModifier(modifier):
		return modifier in AbstractNoteClass.Modifiers
	#
	#	Add beats for given modifier character
	#
	def addModifier(self,modifier):
		modifier = modifier.lower()
		if not AbstractNoteClass.isModifier(modifier):
			raise MusicException("Unknown modifier "+modifier)
		self.addQuarterBeat(AbstractNoteClass.Modifiers[modifier])
	#
	#	Return length.
	#
	def getQuarterBeatLength(self):
		return self.quarterBeatLength
	#
	#	Convert to string
	#
	def toString(self):
		return "("+str(self.quarterBeatLength/4)+")"
	#
	#	Convert to JSON string
	#
	def toJSONString(self,information):
		json = ""
		qRemaining = self.getQuarterBeatLength()
		while qRemaining != 0:
			toRemove = min(qRemaining,8)
			json += str(toRemove)
			qRemaining -= toRemove
		return json

AbstractNoteClass.Modifiers = { "o":4 , ".":2, "-":-2, "=":-3 }

# **************************************************************************************************
#
#											Rest note
#
# **************************************************************************************************

class Rest(AbstractNoteClass):
	def __init__(self):
		AbstractNoteClass.__init__(self)
	#
	#	Convert to string
	#
	def toString(self):
		return "Rest"+AbstractNoteClass.toString(self)
	#
	#	Convert to JSON string
	#
	def toJSONString(self,information):
		json = "-" * Strum.StringCount
		json += AbstractNoteClass.toJSONString(self,information)
		return json
		
# **************************************************************************************************
#
#							Representation of a single dulcimer strum
#
# **************************************************************************************************

class Strum(AbstractNoteClass):

	def __init__(self,definition,isDrone = True):
		AbstractNoteClass.__init__(self)
		# preprocess it
		originalDefinition = definition
		definition = definition.upper().replace(" ","")
		# get strum out of the definition
		self.chromaticOffset = []
		while definition != "":
			# identify the fret position
			n = ("X"+Strum.Encoding).find(definition[0])
			if n < 0:
				raise MusicException("Cannot understand strum "+originalDefinition)
			definition = definition[1:]
			# add the fret position in as a chromatic value, None if X.
			self.chromaticOffset.append(None if n == 0 else self.toChromatic(n-1))
			# too many fret positions
			if len(self.chromaticOffset) > Strum.StringCount:
				raise MusicException("Too many fret positions "+originalDefinition)
			# handle '+' frets.
			if (definition+" ")[0] == "+":
				definition = definition[1:]
				self.chromaticOffset[-1] += 1

		# right justify with 0 or None depending on drone setting.
		while len(self.chromaticOffset) < Strum.StringCount:
			self.chromaticOffset.insert(0,0 if isDrone else None)
	#
	#	Convert diatonic fret position to chromatic value.
	#
	def toChromatic(self,n):
		return int(n/7) * 12 + Strum.ConvertChromatic[n % 7]
	#
	#	Convert to string
	#
	def toString(self):
		return ":".join([self.toDiatonicText(x) for x in self.chromaticOffset])+AbstractNoteClass.toString(self)
	#
	#	Convert to text-diatonic
	#
	def toDiatonicText(self,chromaticOffset):
		if chromaticOffset is None:
			return "X"
		n = int(chromaticOffset / 12) * 7 + Strum.ConvertDiatonic[chromaticOffset % 12]
		return str(n) if n == int(n) else str(int(n))+"+"
	#
	#	Convert to JSON string
	#
	def toJSONString(self,information):
		json = "".join(["-" if x is None else chr(x+65) for x in self.chromaticOffset])		
		json += AbstractNoteClass.toJSONString(self,information)
		return json
	#
	#	Analyse tune
	#
	def analyse(self,analysis):
		raise MusicException("Cannot analyse strum data")

Strum.Encoding = "0123456789TLWHRF"
Strum.StringCount = 3
Strum.ConvertChromatic = [ 0, 2, 4, 5, 7, 9, 10 ]
Strum.ConvertDiatonic = [ 0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 6, 6.5 ]
						
# **************************************************************************************************
#
#									Represents a Single note
#
# **************************************************************************************************

class Note(AbstractNoteClass):
	def __init__(self,definition):
		AbstractNoteClass.__init__(self)
		self.setByName(definition)
	#
	#	Set note by name
	#
	def setByName(self,definition):
		# last digit is octave, work out base then remove it
		self.chromaticOffset = int(definition[-1]) * 12
		definition = definition.upper()[:-1]
		# convert Eb to D# Db to C# etc.
		if len(definition) == 2 and definition[1] == 'B':
			definition = chr(ord(definition[0])-1)+"#" if definition != "AB" else "G#"
		# find offset in octave and add to chromatic value.
		n = Note.NoteLookUp.index(definition)
		if n < 0:
			raise MusicException("Do not recognise note "+definition)
		self.chromaticOffset += n
	#
	#	Set note by value
	#
	def setByValue(self,index):
		if index < 0 or index >= 3 * 12:
			raise MusicException("Bad value for note "+str(index))
		self.chromaticOffset = index
	#
	#	Get by name
	#
	def getByName(self,transpose = 0):
		n = self.chromaticOffset + transpose
		if n < 0 or n > 3*12:
			return None
		return Note.NoteLookUp[n % 12] + str(int(n/12))
	#
	#	Get by value
	#
	def getByValue(self,transpose = 0):
		n = self.chromaticOffset + transpose
		return None if n < 0 or n > 3*12 else n
	#
	#	Convert to string
	#
	def toString(self):
		return self.getByName()+AbstractNoteClass.toString(self)
	#
	#	Convert to JSON string
	#
	def toJSONString(self,information):
		# identify the transposed note
		noteName = self.getByName(information["transpose"])
		# get the string to use.
		string = information["tuning"].getNoteString(noteName)
		assert string is not None
		# get the fretting on that string
		fretting = information["tuning"].getNoteFretting(noteName)
		assert fretting is not None
		# build result.
		result = ["-","-","-"]
		chromatic = int(fretting/7) * 12 + Strum.ConvertChromatic[int(fretting) % 7]
		if fretting != int(fretting):
			chromatic = chromatic + 1
		result[string] = chr(chromatic+65)
		#print(noteName,string,fretting,self.getByName(),result)
		return ("".join(result)) +  AbstractNoteClass.toJSONString(self,information)

	#
	#	Analyse note
	#
	def analyse(self,analysis):
		name = self.getByName().lower()
		if name not in analysis:
			analysis[name] = 0
		analysis[name] += 1
		return analysis

Note.NoteLookUp = [ "C","C#","D","D#","E","F","F#","G","G#","A","A#","B" ]

if __name__ == '__main__':
	s1 = Strum("16+5")
	print(s1.chromaticOffset,s1.quarterBeatLength)
	s2 = Note("Bb2")
	print(s2.chromaticOffset,s2.quarterBeatLength)
	print(s2.getByName())


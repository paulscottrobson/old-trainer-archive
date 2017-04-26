# *****************************************************************************************
# *****************************************************************************************
#
#									Instruments and Buckets
#
# *****************************************************************************************
# *****************************************************************************************

from song import Song,Bar,Note

# *****************************************************************************************
#										Mountain Dulcimer
# *****************************************************************************************

class MountainDulcimer:
	def __init__(self,tuning="D,A,d"):
		self.baseNotes = []
		for n in tuning.split(","):
			self.baseNotes.append(Note(n,0))
		self.keyName = ",".join([x.getName() for x in self.baseNotes])
		#print([x.getID() for x in self.baseNotes])

	def getBestString(self,noteID):
		for s in range(2,-1,-1):
			offset = noteID - self.baseNotes[s].getID()
			if offset in self.getChromaticOffsets():
				return s
		return -1

	def getStringChromaticPosition(self,strID,noteID):
		offset = noteID - self.baseNotes[strID].getID()
		assert offset in self.getChromaticOffsets()
		return offset

	def getChromaticOffsets(self):
		return 	[0,2,4,5,7,9,10,11,12,14,16,17,19 ]

	def getKey(self):
		return self.keyName 

	def getStringScore(self,stn):
		return MountainDulcimer.scores[stn]

	def getType(self):
		return "dulcimer"

MountainDulcimer.scores = {			\
		2:		1000,				\
		1:		200,				\
		0:		50,					\
		-1:		-50000
}

# *****************************************************************************************
#								Mountain Dulcimer Bucket
# *****************************************************************************************

class DulcimerBucket:
	def __init__(self):
		self.bucket = []
		for bass in "C,C#,D,D#,E".split(","):
			for middle in "F,F#,G,G#,A,A#,B".split(","):
				for melody in "A,A#,B,c,c#,d,d#,e,f,f#".split(","):
					key = bass+","+middle+","+melody 
					instrument = MountainDulcimer(key)
					self.bucket.append(instrument)

	def get(self):
		return self.bucket

# *****************************************************************************************
#									Seagull Merlin
# *****************************************************************************************

class SeagullMerlin(MountainDulcimer):
	def getChromaticOffsets(self):
		return [0,2,4,5,7,9,11,12]
	def getType(self):
		return "merlin"

# *****************************************************************************************
#								Seagull Merlin Bucket
# *****************************************************************************************

class SeagullMerlinBucket(DulcimerBucket):
	def __init__(self):
		self.bucket = []
		for bass in "C,C#,D,D#,E".split(","):
			for middle in "G,G#,A,A#,B".split(","):
				for melody in "c,c#,d,d#,e".split(","):
					key = bass+","+middle+","+melody 
					instrument = SeagullMerlin(key)
					self.bucket.append(instrument)


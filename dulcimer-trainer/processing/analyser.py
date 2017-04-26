# **************************************************************************************************
# **************************************************************************************************
#
#									Song Analyser
#
# **************************************************************************************************
# **************************************************************************************************

from entities import *
from containers import *
from parser import *
from tuning import *

# **************************************************************************************************
#
#									Analyser class
#
# **************************************************************************************************

class Analyser:
	#
	#	Analyse song for the given instrument (tuning) and transposition.
	#
	def analyse(self,song,instrument,transposition):
		self.instrument = instrument
		self.transposition = transposition
		self.playedOn = [ [],[],[],[] ]
		noteCount = 0
		stringScores = [ 500, 100, 20, -3500 ]
		# figure out what notes are used.
		usage = song.analyse({})
		# reset score, score for transposition.
		self.score = 100 if transposition == 0 else -pow(transposition+4,2)*10
		# for each note.
		for note in usage.keys():
			# count the notes
			noteCount += usage[note]
			# create the transposed note
			checkNote = Note(note)
			# get its name when transposed e.g. the actual note we want to get
			noteName = checkNote.getByName(self.transposition)
			# transposition failed. Put in 'couldn't find' list and score badly.
			if noteName is None:
				targetList = 3
				self.score -= 1000
			# transposition okay. Find out which string if any and score accordingly.
			else:
				found = instrument.getNoteString(noteName)			
				# put in the right slot (Melody,Middle,Bass,Can't Play)	
				targetList = 3 if found is None else 2-found 
				# Score this note.
				self.score += stringScores[targetList] * usage[note]
			# add note to target list so we know where it can be played
			self.playedOn[targetList].append(note+"("+str(usage[note])+")")
		#
		#	Scale score for number of notes.
		#
		self.score = int(self.score * 1000 / noteCount)
		#
		# 	Bonuses for popular tuning and no fails
		#
		if len(self.playedOn[3]) == 0:
			self.score += 10000
		if len(self.playedOn[3])+len(self.playedOn[2]) == 0:
			self.score += 40000
		if len(self.playedOn[3])+len(self.playedOn[2])+len(self.playedOn[1]) == 0:
			self.score += 80000

		tuning = self.instrument.getTuningName().lower()
		if tuning[:2] == "d0":
			self.score += 5000
		if tuning[:5] == "d0,g0":
			self.score += 5000
		if tuning[:5] == "d0,a0":
			self.score += 10000
		if tuning[:8] == "d0,a0,a0":
			self.score += 80000
		if tuning[:8] == "d0,a0,d1":
			self.score += 100000

		return self.score
	#
	#	Get the score
	#
	def getScore(self):
		return self.score 
	#
	#	Get the string usage / fails.
	#
	def getInformation(self):
		s = ""
		for i in range(0,4):
			if len(self.playedOn[i]) > 0:
				s = s + [ "MELODY","MIDDLE","BASS","FAIL"][i]+":"
				s = s + " ".join(self.playedOn[i])+ " "
		return s 

# **************************************************************************************************
#
#						Class that runs and prints the best analyses
#
# **************************************************************************************************

class RunAnalysis:

	def __init__(self,songFile):
		self.parser = BaseParser()
		self.song = self.parser.parse(songFile)
		self.analyser = Analyser()

		self.results = []
		for tuning in range(0,Instrument.getIndexCount()):
			instrument = Instrument(tuning)
			for transpose in range(-8,8):
				score = self.analyser.analyse(self.song,instrument,transpose)
				if score > 0:
					result = { "score":score,"tuningindex":tuning,"transposition":transpose }
					result["tuning"] = instrument.getTuningName()
					result["information"] = self.analyser.getInformation()
					self.results.append(result)

		self.results.sort(key = lambda x:-x["score"])

	def show(self,resultCount = 10):
		#self.results = [x for x in self.results if x["tuning"][:8] == "d0,a0,a0"]
		self.results.sort(key = lambda x:-x["score"])

		daa = [x for x in self.results if x["tuning"] == "d0,a0,a0"][0]
		dad = [x for x in self.results if x["tuning"] == "d0,a0,d1"][0]

		results = self.results[:resultCount]
		results.append(daa)
		results.append(dad)
		results.sort(key = lambda x:-x["score"])

		print("\n".join([self.format(x) for x in results]))

	def format(self,result):
		t = result["tuning"].replace(",","")
		return "{0:7} {1}/{2} {3}\n\t{4}".format(result["score"],result["tuningindex"],result["transposition"],t,result["information"])

if __name__ == '__main__':
	ra = RunAnalysis("nowhereman.music")
	ra.show(10)
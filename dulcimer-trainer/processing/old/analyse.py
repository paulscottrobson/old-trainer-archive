# *************************************************************************
#
#							Analysing class
#
# *************************************************************************

from note import Note 
from tuning import IndexTuning,Tuning
import re

class Analyser:
	def __init__(self,tuneNotes):
		# Convert to List of notes
		self.notes = []
		self.usage = {}
		for x in tuneNotes.keys():
			note = Note(x)
			self.notes.append(note)
			self.usage[note.getName()] = tuneNotes[x]
		self.results = []
	#
	#	Do a single analysis. 
	#
	def analyse(self,tuning,index,transposition):
		usageList = [[],[],[],[]]
		analyseScores = [ 1000,80,10,0 ]
		score = -pow(transposition*2,2) * 4
		if transposition == 0:
			score = 100
			
		# for each note
		for note in self.notes:
			# see if it is playable
			check = tuning.isPlayable(note.get(transposition))
			# add note to correct list (melody,middle,base,not-played)
			entry = 3 if check < 0 else check
			usageList[entry].append(note.getName(transposition*0)+"("+str(self.usage[note.getName()])+")")
			# score it depending on how often it is used			
			if entry < 2:
				scalar = 40 if entry == 0 else 10
				score = score + scalar * self.usage[note.getName()] 
		# no fails, add bonus.
		if len(usageList[3]) == 0:
			score += 5000
			if len(usageList[1])+len(usageList[2]) == 0:
				score += 5000
			# check for bonuses
			bonusKeys = Analyser.TuningBonuses.keys()
			for bonus in bonusKeys:
				if tuning.getFullTuningName().upper()[:len(bonus)] == bonus:
					score += Analyser.TuningBonuses[bonus]

		# score in list
		usageList.insert(0,int(score))
		usageList.insert(1,tuning.getFullTuningName())
		usageList.insert(2,index)
		usageList.insert(3,transposition)
		# add to results if has 2/3 of the notes on the melody string.
		if len(usageList[4]) / len(self.notes) >= 0.66:
			self.results.append(usageList)
		return usageList 
	#
	#	Analyse all tunings and transpositions.
	#
	def analyseAll(self,fretLayout = None):
		count = IndexTuning(0).getTotalTunings()
		for tuningID in range(0,count):
			tuning = IndexTuning(tuningID,fretLayout)
			for trans in range(-6,7):
				self.analyse(tuning,tuningID,trans)
		self.results.sort(key=lambda x: -x[0])

#
#	Bonuses for popular keys or things not too far off
#
Analyser.TuningBonuses = { "D0,A1,A1":600 ,"D0,A1,D1": 400, "D0,A1":200, "D0":100 }

class AnalyserLoader:
	def __init__(self,fileName):
		src = open(fileName).readlines()
		src = [x if x.find("//") < 0 else x[:x.find("//")] for x in src]
		src = [x.strip() for x in src if x.find(":=") < 0]
		src = " ".join(src)
		src = src.replace("&"," ").replace("-"," ").replace("."," ").replace("o"," ")
		src = src.replace("O"," ").replace("|"," ").replace("="," ")
		self.notes = {}
		for note in src.split(" "):
			if note != "":
				if note[0] >= 'a':
					note = note.upper()+"1"
				else:
					note = note.upper()+"2"
				if note not in self.notes:
					self.notes[note] = 0
				self.notes[note] += 1

	def get(self):
		return self.notes

if __name__ == '__main__':
	al = AnalyserLoader("herecomes.song")
	tuneNotes = al.get()
	an = Analyser(tuneNotes)
	an.analyseAll()
	for r in range(0,min(30,len(an.results))):
		print(r,an.results[r])

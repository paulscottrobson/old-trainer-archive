# *****************************************************************************************
# *****************************************************************************************
#
#									Analyser class
#
# *****************************************************************************************
# *****************************************************************************************

from song import Song,Bar,Note
from args import ArgumentAnalyser
import instruments,getopt,sys

# *****************************************************************************************
#									Start a new analysis
# *****************************************************************************************

class Analyser:
	def __init__(self):
		self.results = []
	#
	#	Create the information structure for this song, one element per note.
	#
	def analyseSong(self,song,transposition):
		failed = False
		self.noteInfo = {}
		# work through bars
		for barNo in range(0,song.getBarCount()):
			bar = song.getBar(barNo)
			# work through notes
			for noteNo in range(0,bar.getNoteCount()):
				noteName = bar.getNote(noteNo).getName(transposition)
				# if not failed, create record if required and bump count.
				if noteName is not None:
					if noteName not in self.noteInfo:
						self.noteInfo[noteName] = { }
						self.noteInfo[noteName]["count"] = 0
						self.noteInfo[noteName]["name"] = noteName
						self.noteInfo[noteName]["noteid"] = bar.getNote(noteNo).getID(transposition)
						self.noteInfo[noteName]["targetid"] = None
					self.noteInfo[noteName]["count"] += 1
				else:
					failed = True
		return failed

	#
	#	Score the current analysed song for the given instrument.
	#
	def scoreFor(self,instrument):
		score = 0
		self.usageLists = [[],[],[],[]]
		# for each note
		for ni in self.noteInfo.keys():
			nInfo = self.noteInfo[ni]
			# identify best string if any
			stn = instrument.getBestString(nInfo["noteid"])
			# put in usage lists
			self.usageLists[stn+1].append(ni)
			# get the 'score' for that string.
			scr = instrument.getStringScore(stn)
			# update the score
			score = score + pow(nInfo["count"],1.0) * scr
		# if a positive score, score for popular tunings.
		if score > 0:
			key = instrument.getKey().lower()
			if key[:2] == "d3":
				score += 10000
			if key[:5] == "d3,a3":
				score += 30000
			if key[:8] == "d3,a3,a3":
				score += 60000
			if key[:8] == "d3,a3,a4":
				score += 90000

		return int(score)
	#
	#	Get summary of notes used in this transposition
	#
	def getNotesUsed(self):
		return " ".join(["{0}:{1}".format(x,self.noteInfo[x]["count"]) for x in self.noteInfo])
	#
	#	Get usage of notes in this transposition/instrument pairing.
	#
	def getUsage(self):
		s = []
		for n in range(0,4):
			s1 = ["Unused","Bass","Middle","Melody"][n] + ":" + ",".join(self.usageLists[n]).lower()
			if len(self.usageLists[n]) > 0:
				s.append(s1)
		s.reverse()
		return " ".join(s)
	#
	#	Analyse song for the given instrument with a range of transpositions
	#
	def analyseKey(self,song,instrument,transposeLimit = None):
		# the range
		for transpose in range(-5,25):
			# can lock to a given transposition if you want to.
			if transposeLimit is None or transposeLimit == transpose:
				# analyse it
				self.analyseSong(song,transpose)
				# score it
				score = an.scoreFor(instrument)
				# add to score if +ve
				if score > 0:
					result = { "score":score, "transpose":transpose, "key":instrument.getKey() }
					result["usage"] = self.getUsage()
					self.results.append(result)
					# sort and chop the results list.
					self.results.sort(key = lambda x:-x["score"])
					self.results = self.results[:20]
	#
	#	Analyse for the whole bcket.
	#
	def analyse(self,song,instrumentBucket,transposeLimit = None):
		for instrument in instrumentBucket:
			self.analyseKey(song,instrument,transposeLimit)
	#
	#	Report result.
	#
	def report(self,handle = sys.stdout):
		for n in range(0,len(self.results)):
			r = self.results[n]
			s = "{0:2}) {1:6} {2:2} {3:11} {4}\n".format(n,r["score"],r["transpose"],r["key"],r["usage"])
			handle.write(s)

if __name__ == '__main__':
	args = ArgumentAnalyser("m","t"," -m [ -t <fix transpose> ] <.tune file>")
	if args.get("m"):
		bucket = instruments.SeagullMerlinBucket().get()
	else:
		#bucket = instruments.DulcimerBucket().get()
		pass
	song = Song(args.getFiles()[0])
	#print(sn.toString())
	an = Analyser()
	transpose = args.get("t")
	transpose = None if transpose == "" else int(transpose)
	an.analyse(song,bucket,transpose)
	an.report()
	
#
#	-t <n>	Fix transpose at n
#	-m 		Seagull Merlin layout.
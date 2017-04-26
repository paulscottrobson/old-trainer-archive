# *****************************************************************************************
# *****************************************************************************************
#
#									Transpose/Render App
#
# *****************************************************************************************
# *****************************************************************************************

from song import Song,Bar,Note
from args import ArgumentAnalyser
import sys,instruments

class BaseRenderer:
	def __init__(self,song,instrument,transpose):
		self.song = song
		self.instrument = instrument 
		self.transpose = transpose

	def render(self,handle):
		# header
		self.renderHeader(handle)
		# assignments
		keys = {}
		for k in self.song.getKeyList():
			keys[k] = self.song.getKey(k)
		keys["tuning"] = self.instrument.getKey()
		keyList = [x for x in keys.keys() if x != "accidentals"]
		keyList.sort()
		self.renderKeys(handle,keyList,keys)
		# music data
		bars = []
		for n in range(0,self.song.getBarCount()):
			bars.append(self.song.getBar(n))
		self.renderBars(handle,bars)
		# end of music data.
		self.renderFooter(handle)

	def renderHeader(self,handle):
		assert false
	def renderFooter(self,handle):
		assert false
	def renderKeys(self,handle,keyList,keys):
		assert false
	def renderBars(self,handle,barList):
		assert false


class JSONRenderer(BaseRenderer):
	def renderHeader(self,handle):
		handle.write("{\n")

	def renderFooter(self,handle):
		handle.write("}\n")

	def renderKeys(self,handle,keyList,keys):
		for k in keyList:
			handle.write('    "{0}":"{1}",\n'.format(k,keys[k]))

	def renderBars(self,handle,bars):
		handle.write('    "bars":[\n')
		for n in range(0,len(bars)):
			barText = self.barToString(bars[n])
			handle.write('            "{0}"{1}\n'.format(barText,"," if n < len(bars)-1 else ""))
		handle.write('     ]\n')

	def barToString(self,bar):
		render = ""
		qbPos = 0
		for nix in range(0,bar.getNoteCount()):
			note = bar.getNote(nix)
			while qbPos != note.getQBPos():
				offset = min(8,note.getQBPos()-qbPos)
				qbPos += offset
				render += str(offset)
			stn = self.instrument.getBestString(note.getID(self.transpose))
			if stn >= 0:
				chrom = self.instrument.getStringChromaticPosition(stn,note.getID(self.transpose))
				#print(note.getName(),note.getName(self.transpose),note.getID(self.transpose),stn,chrom)
				noteTxt = ["-","-","-"]
				noteTxt[stn] = chr(chrom+97)
				render += "".join(noteTxt)
			else:
				render += "---"
		if bar.getNoteCount() == 0:
			render += "---"
		return render

if __name__ == '__main__':
	args = ArgumentAnalyser("mj","tk"," -m -j -t <transpose> -k <tuning>del <.tune file>")
	key = args.get("k")
	if args.get("m"):
		instrument = instruments.MountainDulcimer(key)
	else:
		instrument = instruments.SeagullMerlin(key)
	song = Song(args.getFiles()[0])
	if args.get("j"):
		r = JSONRenderer(song,instrument,int(args.get("t")))
	r.render(sys.stdout)
#
#	-t <n>	Set transpose to n
#	-k <k>	Set tuning to D,A,d whatever.
#	-m 		Seagull Merlin rather than dulcimer.
# 	-j 		Render as JSON.
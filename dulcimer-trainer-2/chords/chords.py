
def nearly(offsets,n1,n2):
	if offsets[1] == n1 or offsets[1] == n2:
		if offsets[2] == 0 or offsets[2] == n1+n2-offsets[1]:
			return True
	if offsets[2] == n1 or offsets[2] == n2:
		if offsets[1] == 0 or offsets[1] == n1+n2-offsets[2]:
			return True
	return False

def powerChord(offsets):
	if offsets[1] == 7 and offsets[2] == 7:
		return True
	if offsets[2] == 7 and offsets[1] == 0:
		return True
	return False

def isSeventh(offsets):
	return offsets[2] == 12 and (offsets[1] == 4 or offsets[1] == 7)

def frettingOk(f1,f2,f3):
	s = 3
	if f1 != 0 and (abs(f1-f2) > s or abs(f1-f3) > s):
		return False
	if f2 != 0 and (abs(f2-f1) > s or abs(f2-f3) > s):
		return False
	if f3 != 0 and (abs(f3-f1) > s or abs(f2-f3) > s):
		return False
	return True

fretPosition = [0,2,4,5,7,9,10,11,12,14]									# positions of frets.
notes = "c,c#,d,d#,e,f,f#,g,g#,a,a#,b".split(",")							# notes
toChromatic = {}															# map name to chromatic#
for i in range(0,len(notes)):
	toChromatic[notes[i]] = i

tuning = "d3,a3,d4"															# dulcimer tuning D-A-D

baseNote = [] 																# convert to base notes.
for t in tuning.split(","): 												# this is chromatic index where
	baseNote.append((int(t[-1])-1)*12 + toChromatic[t[:-1]])				# 0 = C1.
print(baseNote)
fretCount = len(fretPosition)

for f1 in range(0,fretCount):												# fret loops
	for f2 in range(0,fretCount):
		for f3 in range(0,fretCount):
			if frettingOk(f1,f2,f3):
				diatonic = [f1,f2,f3]
				chromatic = [0,0,0]											# chromatic notes played.
				for f in range(0,3):										# work them out.
					chromatic[f] = baseNote[f] + fretPosition[diatonic[f]]
				reduced = [x for x in chromatic]							# copy chromatic list
				reduced.sort()
				reduced = [0, reduced[1]-reduced[0],reduced[2]-reduced[0]] 	# now it would be 0-4-7 for normal etc.

				if isSeventh(reduced):
					print(notes[chromatic[0] % 12]+" seventh",diatonic,baseNote,diatonic,[notes[x%12] for x in chromatic],reduced)

				# check for major 0-4-12 0-7-12 0-9-12 etc.

				reduced = [x % 12 for x in reduced]							# now forget about octaves
				reduced.sort()

				if reduced[1] == 4 and reduced[2] == 7:
					print(notes[chromatic[0] % 12]+" major",diatonic,baseNote,diatonic,[notes[x%12] for x in chromatic],reduced)
				elif nearly(reduced,4,7):
					print(notes[chromatic[0] % 12]+" major-",diatonic,baseNote,diatonic,[notes[x%12] for x in chromatic],reduced)

				if reduced[1] == 3 and reduced[2] == 7:
					print(notes[chromatic[0] % 12]+" minor",diatonic,baseNote,diatonic,[notes[x%12] for x in chromatic],reduced)

				if powerChord(reduced):
					print(notes[chromatic[0] % 12]+" power",diatonic,baseNote,diatonic,[notes[x%12] for x in chromatic],reduced)

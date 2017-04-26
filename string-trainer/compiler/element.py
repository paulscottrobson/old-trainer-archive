
import re

# ***********************************************************************************************
#								 Compiler main exception
# ***********************************************************************************************

class CompilerException(Exception):
	def __init__(self,msg):
		self.errorMessage = msg 
		Exception.__init__(self)

# ***********************************************************************************************
#				Class represents a single note, which can be transposed when fetched.
# ***********************************************************************************************

class Note:

	def __init__(self,value):
		self.set(value)

	def set(self,value):
		# self.note is offset from C1.
		self.note = None
		# 0-7 are offsets from D4.
		if re.match("^[0-7]$",value) is not None:
			self.note = 12 * (4-1) + 2 + Note.DIATONICOFFSET[int(value)]
		# otherwise either the D#3 format or the C# c# format. Capital is lower octave (3 vs 4)
		else:
			# check for letter without octave and add octave specified dependent on case of A-G
			m = re.match("^([A-Ga-g])([\\#b\\@B]?)$",value)
			if m is not None:
				value = value+("3" if m.group(1) <= "Z" else "4")
			# capitalise and remove the natural which is superfluous.
			value = value.upper().replace("@","")
			# convert it
			self.note = Note.toNoteIndex(value)

	def get(self,transpose = 0):
		n = self.note + transpose 
		return None if n <= (2-1)*12 + 11 or n >= (5-1)*12+6 else n

	def getText(self,transpose = 0):
		n = self.get(transpose)
		if n is not None:
			n = Note.NAME[n % 12] + str(int(n/12)+1)
		return n 

	@staticmethod 
	def toNoteIndex(value):
		m = re.match("^([A-G])([\\#B]?)([1-5])$",value)
		if m is None:
			raise CompilerException("Bad Note ["+value+"]")
		# handle flats. Db -> C# Eb -> D# Gb -> F# Ab -> G# Bb -> A#
		parts = [x for x in m.groups()]
		if (parts[1] == 'B'):
			parts[1] = '#'
			parts[0] = chr(ord(parts[0])-1) if parts[0] != 'A' else 'G'
		# identify the note.
		if parts[0]+parts[1] not in Note.NAME:
			raise CompilerException("Bad Note ["+value+"]")
		return Note.NAME.index(parts[0]+parts[1]) + (int(parts[2])-1) * 12

Note.DIATONICOFFSET = [ 0, 2, 4,  5, 7, 9, 11, 12 ]
#						D  E  F#  G  A  B  C#  D

Note.NAME = [ "C","C#","D","D#","E","F","F#","G","G#","A","A#","B" ]

if __name__ == '__main__':
	for x in range(0,8):
		n = Note(str(x))
		print(x,n.get(),n.get(1),n.getText(),n.getText(-2))

	for t in ["C#","d","F","Db","Eb","Gb","Ab","Bb"]:
		print(t)
		n = Note(t)
		print(n.get(),n.get(1),n.getText(),n.getText(1))


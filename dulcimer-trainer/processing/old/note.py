# *************************************************************************
#
#									Note class
#
# *************************************************************************

class Note:
	def __init__(self,initialValue = 0):
		self.set(initialValue)
	#
	#	Set by direct value or using internal notation [A-G][#][0-2]
	#
	def set(self,value):
		if type(value) == type(""):
			# internal notation
			value = value.strip().upper()
			# octave
			self.value = int(value[-1]) * 12
			value = value[:-1].strip()
			# handle flats, as we use sharps throughout.
			if len(value) == 2 and value[1] == 'B':
				if value == "AB":
					value = "G#"
					assert self.value > 0,"Cannot use Ab0, A0 is lowest note"
					self.value -= 12
				else:
					value = chr(ord(value[0])-1)+"#"
			# note value
			assert Note.noteList.index(value) >= 0,"Unknown note "+value
			self.value += Note.noteList.index(value)			
		else:
			# just a value.
			self.value = value
		assert self.value >= 0,"Bad note value set"
	#
	#	get value optionally transposed
	#
	def get(self,transposition = 0):
		return self.value + transposition 
	#
	#	get name optionally transposed.
	#
	def getName(self,transposition = 0):
		n = self.value + transposition 
		if n < 0:
			return "?"
		else:
			return Note.noteList[n%12]+str(int(n/12))

Note.noteList = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"]

if __name__ == '__main__':
	n1 = Note(1)
	n2 = Note("G#2")
	print(n1.get(),n2.get())
	print(n1.getName(-1),n2.getName(-1))	
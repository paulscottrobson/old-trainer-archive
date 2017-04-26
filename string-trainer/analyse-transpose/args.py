# *****************************************************************************************
# *****************************************************************************************
#
#									sys.argv analysis class
#
# *****************************************************************************************
# *****************************************************************************************

import sys

class ArgumentAnalyser:
	def __init__(self,booleanOptions = "",parameterOptions = "",message = ""):
		self.options = {}
		for op in booleanOptions.split():
			self.options[op] = False
		for op in parameterOptions.split():
			self.options[op] = ""
		self.files = []

		arguments = [x for x in sys.argv[1:]]
		if len(arguments) == 0:
			print("Parameters: "+message)
			sys.exit(0)
		for i in range(0,len(arguments)):
			if arguments[i] != "" and arguments[i][0] == '-':
				if booleanOptions.find(arguments[i][1:]) >= 0:
					self.options[arguments[i][1:]] = True
				if parameterOptions.find(arguments[i][1:]) >= 0:
					self.options[arguments[i][1:]] = arguments[i+1]
					arguments[i+1] = ""
			else:
				if arguments[i] != "":
					self.files.append(arguments[i])

	def get(self,key):
		return self.options[key];

	def getFiles(self):
		return self.files


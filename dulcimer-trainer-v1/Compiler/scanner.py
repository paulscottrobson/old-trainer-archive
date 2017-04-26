# ************************************************************************************************************
# ************************************************************************************************************
#
#		File:		scanner.py
#		Author:		Paul Robson	(paul@robsons.org.uk)
#		Purpose:	Scan directories,compile files, build indexes.
#		Date: 		1st September 2016
#
# ************************************************************************************************************
# ************************************************************************************************************

import os
from song import SongCompiler

scanDirectory = "../app/media/music"												# start scanning from here.

class ScannerCompiler:

	def compiler(self,fileName,forceAll = False):
		parts = os.path.splitext(fileName)
		if parts[1] == ".song":
			SongCompiler(fileName,parts[0]+".music",forceAll)


	def scan(self,root,forceAll = False):
		root = root.replace("/",os.sep)
		count = 0
		for root,dirs,files in os.walk(root):
			index = []
			for f in files:
				if f[-6:] != ".music" and f[-4:] != ".txt":
					self.compiler(root+os.sep+f,forceAll)
					index.append((os.path.splitext(f)[0]+".music").lower())
			for d in dirs:
				index.append("*"+d.lower())
			open(root+os.sep+"index.txt","w").write("\n".join(index))
			count += 1
		print("Created {0} indices.".format(count))




ScannerCompiler().scan(scanDirectory)


# ************************************************************************************************************
# ************************************************************************************************************
#
#		File:		elements.py
#		Author:		Paul Robson	(paul@robsons.org.uk)
#		Purpose:	Handle storage of elements and rendering
#		Date: 		1st September 2016
#
# ************************************************************************************************************
# ************************************************************************************************************

# ************************************************************************************************************
#												File Elements
# ************************************************************************************************************

#
#	Root element
#
class Element:
	def render(self):
		return "{0:08}:{1}".format(self.getTime(),self.getElement())
#
#	Assignment element
#
class AssignmentElement(Element):
	def __init__(self,assignee,value):
		self.element = assignee + ":=" + value
		self.time = AssignmentElement.nextTime
		AssignmentElement.nextTime += 1

	def getTime(self):
		return self.time*1000

	def getElement(self):
		return self.element
#
#	Element with a position in the song
#
class TimedElement(Element):
	def __init__(self,bar,milliBeats):
		self.time = 10000000 + 1000 * bar + milliBeats

	def getTime(self):
		return self.time
#
#	Lyric element
#	
class LyricElement(TimedElement):
	def __init__(self,bar,millibeats,lyric):
		TimedElement.__init__(self,bar,millibeats)
		self.element = lyric

	def getElement(self):
		return '"'+self.element+'"'
#
#	Note/Strum
#
class NoteElement(TimedElement):
	def __init__(self,bar,milliBeats,fretting,chords = None):
		TimedElement.__init__(self,bar,milliBeats)
		fretting = [x if x is not None else 99 for x in fretting]
		self.element = "".join("{0:02}".format(x) for x in fretting)
		if chords is not None:
			self.element += ";"+chords.lower()

	def getElement(self):
		return self.element

# ************************************************************************************************************
#									Element Store with assignments
# ************************************************************************************************************

class ElementStore:
	def __init__(self,name = ""):
		name = name.lower().strip()
		self.assignments = { "name":name,"type":"dulcimer","beats":"4","syncopation":"50","author":"","tempo":"120" }
		self.assignments["tuning"] = "d3,a3,a4"												# load defaults
		self.assignments["translator"] = "paul robson"
		self.assignments["transpose"] = "0"
		self.assignments["syncopation"] = "50"
		self.assignments["drone"] = "yes"
		self.storage = []																	# list of elements in music

	def get(self,key):																		# get assignments
		return self.assignments[key.lower().strip()]

	def set(self,assignee,value):															# set assignments
		self.assignments[assignee.lower().strip()] = value.lower().strip()

	def add(self,element):																	# add element
		self.storage.append(element)

	def contains(self,key):
		return key.lower().strip() in self.assignments

	def render(self):																		# render all elements in order
		AssignmentElement.nextTime = 1000													# reset ids for assignment elements
		self.storage = [x for x in self.storage if not isinstance(x,AssignmentElement)]		# remove all assignment elements
		keys = self.assignments.keys()														# get sorted list of assign keys
		keys.sort()
		keys.reverse()																		# puts TYPE before TUNING
		for k in keys:																		# add in AssignmentElements
			self.add(AssignmentElement(k,self.assignments[k]))
		body = [x for x in self.storage]													# copy list
		body.sort(key = lambda x:x.getTime())												# sort on time
		body = "\n".join([x.render() for x in body])										# build result
		return body


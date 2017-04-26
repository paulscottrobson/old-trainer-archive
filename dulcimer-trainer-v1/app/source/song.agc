// ****************************************************************************************************************************************************************
// ****************************************************************************************************************************************************************
//
//		File:		song.agc
//		Purpose:	Load in a song
//		Date:		28th August 2016
//		Author:		Paul Robson (paul@robsons.org.uk)
//
// ****************************************************************************************************************************************************************
// ****************************************************************************************************************************************************************

// ****************************************************************************************************************************************************************
//																Load and process a song
// ****************************************************************************************************************************************************************

function SONGLoad(song ref as Song,fileName as string)
	__SONGClear(song)																					// Clear out structure
	handle = IOOpen(fileName)
	while FileEOF(handle) = 0 																			// Read whole file
		line$ = ReadLine(handle)																		// Read each line in turn
		line$ = ReplaceString(line$,chr(9)," ",99999)
		line$ = Lower(TrimString(line$," "))
		if FindString(line$,":=") > 0																	// Assignment
			n = FindString(line$,":=")
			__SONGAssign(song,mid(line$,10,n-10),mid(line$,n+2,99999))
		else
			if line$ <> ""
				ASSERT(Val(left(line$,8)) >= 10000000,"Bad time "+line$)								// Check time
				barNumber = Val(left(line$,5)) - 10000
				while song.barCount < barNumber															// Keep adding empty bars until done.
					__SONGAddEmptyBar(song)
				endwhile
				time$ = left(line$,8)																	// Split it up
				action$ = mid(line$,10,9999)
				bar = Floor((val(time$)-10000000) / 1000) 
				//debug$ = debug$ + str(bar)+" "+time$+" "+action$+"&"
				if left(action$,1) = chr(34)															// Is it a speech mark.
					a$ = mid(action$,2,len(action$)-2)
					a$ = ReplaceString(a$,"*","|",99999)												// Convert * to seperators which expand
					if FindString(a$,"|") <= 0:															// No separators
						a$ = ReplaceString(a$," ","|",99999)											// Use all spaces as seperators
					endif
					song.bars[bar].lyric$ = a$
				else
					__SONGAddNoteEvent(song,bar,Val(right(time$,3)),action$)							// Add a note event
				endif
			endif
		endif
	endwhile
	CloseFile(handle)																					// Close file.
	__SONGCreateConversionTable(song)
	__SONGCalculateLongestStringSize(song)
	__SONGJustifyLyrics(song)
	__SONGGetStrokeDirection(song)
	__SONGCheckStrummed(song)
endfunction

// ****************************************************************************************************************************************************************
//																	Add a new empty bar
// ****************************************************************************************************************************************************************

function __SONGAddEmptyBar(song ref as Song)
	inc song.barCount 																					// Bump bar count
	if song.barCount > song.bars.length then song.bars.length = song.barCount + 4 						// Make sure there's enough space
	n = song.barCount
	song.bars[n].barNumber = n 																			// Initialise it
	song.bars[n].baseID = mod(n,10) * 1000 + 10000
	song.bars[n].lyric$ = ""
	song.bars[n].noteCount = 0 
	song.bars[n].notes.length = 6
endfunction 

// ****************************************************************************************************************************************************************
//																	Add a note event
// ****************************************************************************************************************************************************************

function __SONGAddNoteEvent(song ref as Song,bar as integer,millibars as integer,action$ as string)
	inc song.bars[bar].noteCount 																		// One more note
	n = song.bars[bar].noteCount
	if n > song.bars[bar].notes.length then song.bars[bar].notes.length = n + 6 						// Make space
	song.bars[bar].notes[n].time = millibars															// Time
	song.bars[bar].notes[n].name$ = mid(action$,8,9999)													// Name if any
	song.bars[bar].notes[n].chromatic.length = song.strings
	for i = 1 to song.strings
		song.bars[bar].notes[n].chromatic[i] = val(mid(action$,i*2-1,2))
	next i
	if song.bars[bar].notes[n].name$ <> ""																// Has name
		newCE = song.chordCount = 0 																	// Add if no chords
		if song.chordCount > 0 																			// If chords already
			if song.bars[bar].notes[n].name$ <> song.chordEvents[song.chordCount].name$ then newCE = 1	// And different to last one.add it
		endif
	endif
	if newCE <> 0																						// New chord event ?
		inc song.chordCount																				// Bump count 
		if song.chordCount > song.chordEvents.length then song.chordEvents.length = song.chordCount + 4	// Allocate space
		song.chordEvents[song.chordCount].name$ = song.bars[bar].notes[n].name$							// Fill in record
		song.chordEvents[song.chordCount].time = millibars + bar * 1000
		for i = 1 to song.strings
			song.chordEvents[song.chordCount].chromatic[i] = song.bars[bar].notes[n].chromatic[i]
		next i
		//debug$ = debug$ + song.chordEvents[song.chordCount].name$+"<<<<&"
	endif
	//debug$ = debug$ + str(bar)+" "+str(millibars)+" "+action$+"&"
endfunction

// ****************************************************************************************************************************************************************
//																Handle song assignments
// ****************************************************************************************************************************************************************

function __SONGAssign(song ref as Song,assign$ as string,value$ as string)
	assign$ = lower(TrimString(assign$," "))
	value$ = lower(TrimString(value$," "))
	//debug$ = debug$ + assign$ + "=" + value$ + "|&"
	select assign$
		case "type"
			ASSERT(value$ = "dulcimer","Only dulcimer supported at present")
			song.type$ = value$
		endcase
		case "tuning"
			song.tuning$ = value$ 																		
			__SONGDecodeTuning(song,value$)
		endcase
		case "beats"
			song.beats = Val(value$)
			ASSERT(song.beats >= 2 and song.beats <= 8,"Bad beats value (2-8)")
		endcase
		case "strings"
			song.strings = Val(value$)
			ASSERT(song.strings >= 1 and song.strings <= 8,"Bad string count")
		endcase		
		case "tempo"
			song.tempo = Val(value$)
			ASSERT(song.tempo >= 40 and song.tempo <= 250,"Bad tempo value (40-250)")
		endcase
		case "syncopation"
			song.syncopation = Val(value$)
			ASSERT(song.syncopation >= 20 and song.syncopation <= 80,"Bad syncopation value (20-80)")
		endcase
		case "name"
			song.name$ = value$
		endcase
		case "author"
			song.author$ = value$
		endcase
		case "translator"
			song.translator$ = value$
		endcase	
	endselect
endfunction

// ****************************************************************************************************************************************************************
//															Create diatonic to chromatic conversion scale
// ****************************************************************************************************************************************************************

function __SONGCreateConversionTable(song ref as Song)
	note$ = "D,D#,E,F,F#,G,G#,A,A#,B,C,C#"
	song.toDiatonic#.length = 24
	for chrom = 0 to song.toDiatonic#.length
		diat# = chrom / 2.0
		if chrom > 4 then diat# = diat# + 0.5
		if chrom > 9 then diat# = diat# + 0.5
		if chrom > 16 then diat# = diat# + 0.5
		if chrom > 21 then diat# = diat# + 0.5
		//debug$ = debug$ + str(chrom)+" "+GetStringToken(note$,",",mod(chrom,12)+1)+" "+left(str(diat#),4)+"&"
		song.toDiatonic#[chrom] = diat#
	next chrom
endfunction 

// ****************************************************************************************************************************************************************
//																	Clear out song structure
// ****************************************************************************************************************************************************************

function __SONGClear(song ref as Song)
	song.tempo = 120																					// Default values
	song.beats = 4
	song.strings = 3
	song.syncopation = 50
	song.type$ = "dulcimer"
	song.tuning$ = "d3,a3,d4"
	song.name$ = ""
	song.author$ = ""
	song.translator$ = "Paul Robson"
	song.barCount = 0
	song.chordCount = 0
	song.stringBase.length = 1																			// Set up after file loaded
	song.bars.length = 1																				// Set up as loaded
	song.chordEvents.length = 1
endfunction

// ****************************************************************************************************************************************************************
//																Decode tuning settings
// ****************************************************************************************************************************************************************

function __SONGDecodeTuning(song ref as Song,tuning$ as string)
	ASSERT(CountStringTokens(tuning$,",") = song.strings,"Tuning must be for "+str(song.strings))
	note$ = "c,c#,d,d#,e,f,f#,g,g#,a,a#,b"																// Possible notes.
	song.stringBase.length = song.strings 																// Make array correct length.
	for i = 1 to song.strings																			// For each string.
		tune$ = TrimString(GetStringToken(tuning$,",",i)," ")											// Get the tuning.
		SetTextString(SPR_STRING+i,Upper(left(tune$,1)))												// Update the tuning display
		octave = Val(right(tune$,1))																	// get octave
		ASSERT(octave >= 3 and octave <= 5,"Bad tuning octave "+tuning$)							// Validate it
		tune$ = left(tune$,len(tune$)-1)																// Remove it.
		song.stringBase[i] = 0 																			// Mark as not found
		for n = 1 to CountStringTokens(note$,",")														// Look for a valid note
			if GetStringToken(note$,",",n) = tune$ then song.stringBase[i] = n 							// Record if found
		next n
		ASSERT(song.stringBase[i] > 0,"Tuning unknown "+tuning$)										// Check found
		song.stringBase[i] = song.stringBase[i] + (octave - 3) * 12 									// Adjust for octave		
		//debug$ = debug$ + GetStringToken(tuning$,",",i)+"="+str(song.stringBase[i])+"&"
	next i
endfunction

// ****************************************************************************************************************************************************************
//																		Bar to String
// ****************************************************************************************************************************************************************

function __SONGBarToString(song ref as Song,bar ref as Bar)
	s$ = str(bar.barNumber)+" ID:"+str(bar.baseID)+" '"+bar.lyric$+"'&"
	for i = 1 to bar.noteCount
		s$ = s$+"   @"+left(str(bar.notes[i].time)+"    ",4)
		for s = 1 to bar.notes[i].chromatic.length
			c = bar.notes[i].chromatic[s]
			if c <> 99 then c = song.toDiatonic#[c]
			s$ = s$ + str(c)+" "
		next s
		s$ = s$+" ["+bar.notes[i].name$+"]&"
	next i
endfunction s$

// ****************************************************************************************************************************************************************
//											Calculate longest string size of lyrics at size 40.0
// ****************************************************************************************************************************************************************

function __SONGCalculateLongestStringSize(song ref as Song)
	_longestSizeAt40 = 1 																					// Stops division by zero if no lyrics.
	textObject = CreateText("")																				// Working text object
	SetTextSize(textObject,40.0)																			// Set size to 40.
	for b = 1 to song.barCount
		if song.bars[b].lyric$ <> ""																		// If some lyrics
			SetTextString(textObject,song.bars[b].lyric$)													// Measure them.
			if GetTextTotalWidth(textObject) > _longestSizeAt40 then _longestSizeAt40 = GetTextTotalWidth(textObject)
		endif
	next b
	DeleteText(textObject)																					// Delete working object
	song.lyricSize# = 40.0 * ctl.barWidth * 0.95 / _longestSizeAt40											// Work out size to use
	if song.lyricSize# > MAX_LYRIC_FONTSIZE then song.lyricSize# = MAX_LYRIC_FONTSIZE						// Maximum size.
endfunction

// ****************************************************************************************************************************************************************
//															Justify lyrics to full width
// ****************************************************************************************************************************************************************

function __SONGJustifyLyrics(song ref as Song)
	textObject = CreateText("")																				// Working text object
	SetTextSize(textObject,song.lyricSize#)																	// Font size used
	for b = 1 to song.barCount
		if song.bars[b].lyric$ <> "" and FindString(song.bars[b].lyric$,"|") > 0
			best$ = song.bars[b].lyric$																		// Best so far.
			done = 0
			while done = 0
				next$ = ReplaceString(best$,"|"," | ",99999)												// add more spacing
				next$ = TrimString(next$," ")																// remove leading/trailing spaces
				SetTextString(textObject,next$)																// measure it.
				if GetTextTotalWidth(textObject) >= ctl.barWidth * 0.95 									// too wide ?
					done = 1																				// we've finished
				else
					best$ = next$ 																			// update current best
				endif
			endwhile
			song.bars[b].lyric$ = ReplaceString(best$,"|"," ",99999)
		endif
	next b
	
	DeleteText(textObject)																					// Delete working object
endfunction

// ****************************************************************************************************************************************************************
//												Work out upstroke/downstroke for each note
// ****************************************************************************************************************************************************************

function __SONGGetStrokeDirection(song ref as Song)
	for bar = 1 to song.barCount
		for note = 1 to song.bars[bar].noteCount
			pos = song.bars[bar].notes[note].time * song.beats
			pos = mod(pos,1000)
			song.bars[bar].notes[note].isDownStroke = (pos < 490) or (pos > 990)
			//debug$ = debug$ + str(bar)+" "+str(note)+" "+str(pos)+"&"
		next note 
	next bar
endfunction

// ****************************************************************************************************************************************************************
//												See if a bar is strum only (e.g. all chords)
// ****************************************************************************************************************************************************************

function __SONGCheckStrummed(song ref as Song)
	for bar = 1 to song.barCount
		song.bars[bar].isStrummed = (song.bars[bar].noteCount) > 0 											// Can only be strummed if at least one note
		for note = 1 to song.bars[bar].noteCount
			if song.bars[bar].notes[note].name$ = "" then song.bars[bar].isStrummed = 0 					// Clear strummed if no-chord found
		next note 
		//song.bars[bar].isStrummed = 0
	next bar
endfunction

// ****************************************************************************************************************************************************************
// ****************************************************************************************************************************************************************
//
//		File:		player.agc
//		Purpose:	Sound Player
//		Date:		31st October 2016
//		Author:		Paul Robson (paul@robsons.org.uk)
//
// ****************************************************************************************************************************************************************
// ****************************************************************************************************************************************************************

type Channel
	baseSoundID as integer																				// First sound ID (chromatic)
	nextFire as integer																					// Time in milliseconds when it note should be fire (-1 = none pending)
	nextNoteID as integer																				// Sound ID to fire (e.g. fret 1 diatonic would be baseSoundID + 2)
	currentNoteID as integer 																			// Currently played note
	highest as integer 																					// Highest ID available.
endtype

global __PLAYChannels as Channel[4]																		// State of 4 channels (representing 4 strings)

// ****************************************************************************************************************************************************************
//																		Player setup
// ****************************************************************************************************************************************************************

function PLAYSetup(song ref as Song)
	for i = 1 to 199																						// Delete all sounds in use currently
		if GetSoundExists(i) <> 0 then DeleteSound(i)
	next i
	LoadSound(SND_METRONOME,SFXDIR+"metronome.wav")														// Load metronome sound
	for s = 1 to song.strings 																			// For each of 4 strings
		base = (s-1) * 25 + 1
		baseNote = PLAYGetTuning(song,s) 	
		for n = 0 to 24 																				// 25 chromatic notes
			if GetFileExists(SFXDIR+song.typeID+"/"+str(baseNote+n)+".ogg") <> 0
				LoadSoundOGG(base+n,SFXDIR+song.typeID+"/"+str(baseNote+n)+".ogg")
				__PLAYChannels[s].highest = base + n
			endif
		next n
		__PLAYChannels[s].baseSoundID = base															// Initialise channel records
		__PLAYChannels[s].nextFire = -1
		__PLAYChannels[s].currentNoteID = 0
		//debug$ = debug$ + str(s)+" "+str(baseNote)+"&"
	next s
endfunction

// ****************************************************************************************************************************************************************
//															Get tuning 
// ****************************************************************************************************************************************************************

function PLAYGetTuning(song ref as Song,s as integer)
	select song.typeID
		case "m":																						// Mandolin GDAE
			s = (s - 1) * 7 + 1
		endcase		
		case "u":																						// Ukulele GCEA
			s = Val(GetStringToken("8,1,5,10",",",s))
		endcase
		case "d":																						// Dulcimer
			s = __PLAYGetDulcimerTuning(GetStringToken(song.tuning,",",s))
		endcase
	endselect
endfunction s

// ****************************************************************************************************************************************************************
//										Convert tuning (e.g. c3) to a tuning value, dulcimer
// ****************************************************************************************************************************************************************

function __PLAYGetDulcimerTuning(tune as string)
	note$ = left(left(tune,len(tune)-1)+"  ",2)															// Note right padded to 2 charas
	c = FindString("a a#b c c#d d#e f f#g g#",note$)													// Id note
	c = (c - 1) / 2 + 1 - 3 																			// Convert to position in scale adjusted for C3 start
	c = c + (val(right(tune,1))-3) * 12																	// Allow for different octaves
	//debug$ = debug$ + tune + note$ + " " + str(c)+"&"
endfunction c

// ****************************************************************************************************************************************************************
//															Update player
// ****************************************************************************************************************************************************************

function PLAYUpdate(song ref as Song,position# as float,lastPosition# as float)
	
	bar = floor(position#)																				// Bar checked				
	lastBeat = (position# - floor(position#)) * 1000													// Start of check area
	firstBeat = (lastPosition# - floor(lastPosition#)) * 1000											// End of check region
	if firstBeat > lastBeat then firstBeat = 0 															// If new bar, check from start of the new bar.
	if bar > song.barCount then exitfunction
	
	for n = 1 to song.bars[bar].noteCount																// Check notes in bar to see if one is due 
		time = song.bars[bar].notes[n].time																// Time of note
		if time >= firstBeat and time < lastBeat and ctl.musicOn <> 0									// If in range and actually playing
			for s = 1 to song.strings																	// Work through strings
				chromatic = song.bars[bar].notes[n].fret[s]												// Get chromatic value
				if song.typeID = "d" and chromatic <> 99												// Diatonic -> Chromatic for dulcimer
					isHalf = chromatic > 50 
					convert$ = "0,2,4,5,7,9,10,12,14,16,17,19,20,23"
					chromatic = Val(GetStringToken(convert$,",",mod(chromatic,50)+1)) 	
					if isHalf <> 0 then inc chromatic
				endif
				if chromatic <> 99 and chromatic <= __PLAYChannels[s].highest							// If plucked/strummed and note a/v
					__PLAYChannels[s].nextFire = GetMilliseconds()+(song.strings+1-s)*30				// Fire strings
					__PLAYChannels[s].nextNoteID = chromatic + __PLAYChannels[s].baseSoundID					
					//debug$ = debug$ + str(bar)+" "+str(s)+" "+str(chromatic)+"&"
				endif
			next s
		endif
	next n
	
	tMs = GetMilliseconds()	
	for s = 1 to song.strings																			// Check if each due
		if __PLAYChannels[s].nextFire > 0																// Note pending
			if tMs >= __PLAYChannels[s].nextFire														// Time to fire
				if __PLAYChannels[s].currentNoteID > 0 then StopSound(__PLAYChannels[s].currentNoteID)	// Stop any note on this string
				PlaySound(__PLAYChannels[s].nextNoteID)													// Play note
				__PLAYChannels[s].currentNoteID = __PLAYChannels[s].nextNoteID							// Save current note
				__PLAYChannels[s].nextFire = -1															// No note waiting
			endif
		endif
	next s
endfunction

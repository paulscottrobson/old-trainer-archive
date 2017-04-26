// ****************************************************************************************************************************************************************
// ****************************************************************************************************************************************************************
//
//		File:		chord.agc
//		Purpose:	Chord Viewer
//		Date:		4th August 2016
//		Author:		Paul Robson (paul@robsons.org.uk)
//
// ****************************************************************************************************************************************************************
// ****************************************************************************************************************************************************************

#constant CHORD_CHROM 	(11)

// ****************************************************************************************************************************************************************
//																	Create a chord display
// ****************************************************************************************************************************************************************

function CHORDSetup(cv ref as ChordView,x as integer,y as integer,width as integer,height as integer,id as integer,label as String)
	cv.x = x
	cv.y = y
	cv.width = width
	cv.height = height
	cv.id = id
	cv.label = label
	CreateSprite(id,IMG_RECTANGLE)																		// Background
	SetSpritePosition(id,x,y)
	SetSpriteSize(id,width,height)
	SetSpriteColor(id,64,64,64,255)
	SetSpriteDepth(id,DEPTH_CHORD+3)
	CreateText(id,cv.label+"XXX")																		// Label
	SetTextDepth(id,DEPTH_CHORD+3)
	SetTextSize(id,width/9.0)
	SetTextColor(id,0,0,0,255)
	SetTextPosition(id,x,y-GetTextTotalHeight(id))
	for i = 1 to 4																						// Strings
		if i = 4 then y = 3 else y = i
		y1 = __CHORDY(cv,y)
		CreateSprite(id+i,IMG_STRING)
		SetSpriteSize(id+i,width,height/24)
		SetSpriteDepth(id+i,DEPTH_CHORD+1)
		if i < 3 then yo = 0 else yo = (i - 3.5) * height / 16
		SetSpritePosition(id+i,cv.x,y1-GetSpriteHeight(id+i)/2+yo)
		if i < 4 																						// Finger markers
			CreateSprite(id+i+40,IMG_REDSPHERE)
			SetSpritePosition(id+i+40,x+width/2,y1)
			sz = height*20/100
			SetSpriteSize(id+i+40,sz,sz)
			SetSpriteDepth(id+i+40,DEPTH_CHORD)
		endif
	next i
	draw$ = "101011010111"																				//Bars
	for i = 0 to CHORD_CHROM
		if mid(draw$,i+1,1) = "1"
			CreateSprite(id+10+i,IMG_BAR)
			if i > 0 then w = 64 else w = 32
			SetSpriteSize(id+10+i,width/w,height)
			SetSpritePosition(id+10+i,x+width*i/CHORD_CHROM,cv.y)
			SetSpriteDepth(id+10+i,DEPTH_CHORD+2)
		endif
	next i
endfunction

// ****************************************************************************************************************************************************************
//																		Delete a chord display
// ****************************************************************************************************************************************************************

function CHORDDelete(cv ref as ChordView)
	DeleteSprite(cv.id)
	DeleteText(cv.id)
	for i = 1 to 4
		DeleteSprite(cv.id+i)
		if i < 4 then DeleteSprite(cv.id+i+40)
	next i
	for i = 0 to CHORD_CHROM
		if GetSpriteExists(cv.id+10+i) <> 0 then DeleteSprite(cv.id+10+i)
	next i
endfunction

// ****************************************************************************************************************************************************************
//																	Set a chord display to a note
// ****************************************************************************************************************************************************************

function CHORDSetChord(cv ref as ChordView,cev ref as ChordEvent)
	for s = 1 to 3
		SetSpriteVisible(cv.id+s+40,cev.chromatic[s] > 0 and cev.chromatic[s] <= CHORD_CHROM)
		x = cv.x + cv.width * cev.chromatic[s] / CHORD_CHROM - GetSpriteWidth(cv.id+s+40)
		y = __CHORDY(cv,s) - GetSpriteHeight(cv.id+s+40)/2
		SetSpritePosition(cv.id+s+40,x,y)
	next s
	SetTextString(cv.id,cv.label+" : "+upper(left(cev.name$,1))+lower(mid(cev.name$,2,99)))
endfunction

// ****************************************************************************************************************************************************************
//																		Get string vertical
// ****************************************************************************************************************************************************************

function __CHORDY(cv ref as ChordView,y as integer)
	y = cv.y + cv.height / 2 + (y - 2) * cv.height * 30 / 100
endfunction y

// ****************************************************************************************************************************************************************
//																			Set Chord Alpha
// ****************************************************************************************************************************************************************

function CHORDSetAlpha(cv ref as ChordView,alpha as integer)
	SetSpriteColorAlpha(cv.id,alpha)
	SetTextColorAlpha(cv.id,alpha)
	for i = 1 to 4
		SetSpriteColorAlpha(cv.id+i,alpha)
		if i < 4 then SetSpriteColorAlpha(cv.id+i+40,alpha)
	next i
	for i = 0 to CHORD_CHROM
		if GetSpriteExists(cv.id+10+i) <> 0 then SetSpriteColorAlpha(cv.id+10+i,alpha)
	next i
endfunction

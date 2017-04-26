
import os,sys
from PIL import Image,ImageDraw,ImageFont
print("Creating numbers")
w = 46
for isPlus in range(0,2):
	for number in range(0,20):
		image = Image.new("RGBA",(w,64-28),color=(255,255,255,255))

		size = 42
		font = ImageFont.truetype("arial.ttf",size)
		text = str(number % 10)
		size = font.getsize(text)
		d = ImageDraw.Draw(image)
		ofst = 0 if isPlus == 0 else -8
		if number < 10:
			d.text((ofst+w/2-size[0]/2,28-size[1]/2-14),text,font=font,fill=(0,0,0,255))
		else:
			d.text((ofst+1+w/2-size[0]/4,28-size[1]/2-14),text,font=font,fill=(0,0,0,255))
			d.text((ofst+1+w/2-size[0],28-size[1]/2-14),"1",font=font,fill=(0,0,0,255))
		if isPlus != 0:
			d.text((ofst+w-size[0]*0.65,28-size[1]/2-14),"+",font=font,fill=(0,0,0,255))
		target = "source/{0}{1}.png".format(number,"" if isPlus == 0 else "plus")
		print(target)
		image.save(target)

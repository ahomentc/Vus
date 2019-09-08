import sys
import glob
from PIL import Image


# first argument is left or right
arg = sys.argv[1]
if arg == 'left':
	leftSideBlack = False
	rightSideBlack = True
elif arg == 'right':
	leftSideBlack = True
	rightSideBlack = False

# second argument is directory
directory = sys.argv[2]

images=glob.glob(directory + "/*.jpg")
for image in images:
	im = Image.open(image)
	pixels = im.load()
	for i in range(im.size[0]):
		for j in range(int(im.size[1])):
			# make the right side black
			if i > im.size[0]/2 and rightSideBlack:
				pixels[i,j] = (0,0,0)

			# make the left side black
			if i < im.size[0]/2 and leftSideBlack:
				pixels[i,j] = (0,0,0)
	im.save(image, quality=95)
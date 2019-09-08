import sys
import glob
import os

# argument is directory
directory = sys.argv[1]

last_num = 0
skipped = 0


# strips all but the number
# updates the number to be from 1 to x instead of random... to be continuous

images=sorted(glob.glob(directory + "/*.jpg"),key=lambda image: int(image[-7:-4]))
for image in images:
	try:
		number = int(image[-7:-4])
		if number > last_num + 1 + skipped:
			skipped = (number - last_num - 1)
		number -= skipped
		last_num = number

		os.rename(image,directory + "/" + str(number) + ".jpg")
	except:
		pass
import Image

filename = 'state.gif'

base = Image.open(filename)
min, max, step = 10, 500, 10
ext = '.gif'
transparency = base.info["transparency"]
import pdb
#pdb.set_trace()
for width in range(min, max, step):
	for height in range(min, max, step):
		tmpIm = base.resize((width, height), Image.ANTIALIAS)
		name = 'state/state' + str(width) + 'h' + str(height) + ext
		tmpIm.save(name, transparency = transparency)
		

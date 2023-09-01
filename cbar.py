from pylab import *
import cwbplot.cwb_colorbar as cwbcolor

#raincb = cwbcolor.surfT()
raincb = cwbcolor.rain()
#print(raincb)
cmap = raincb['cmap']

for i in range(cmap.N):
	rgba = cmap(i)
	# rgb2hex accepts rgb or rgba
	print("'" + str(raincb['levels'][i]) + "': '" + matplotlib.colors.rgb2hex(rgba) + "',")
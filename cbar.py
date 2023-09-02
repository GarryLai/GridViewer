from pylab import *
import cwbplot.cwb_colorbar as cwbcolor

tempcb = cwbcolor.surfT()
raincb = cwbcolor.rain()
#print(raincb)

def do(raincb):
	cmap = raincb['cmap']
	for i in range(cmap.N):
		rgba = cmap(i)
		# rgb2hex accepts rgb or rgba
		try:
			print("'" + str(raincb['levels'][i+1]) + "': '" + matplotlib.colors.rgb2hex(rgba) + "',")
		except:
			print("'" + str('9999') + "': '" + matplotlib.colors.rgb2hex(rgba) + "',")
			
print('const tempcb = {')
do(tempcb)
print('};')

print('const raincb = {')
do(raincb)
print('};')

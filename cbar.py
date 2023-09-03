from pylab import *
import cwbplot.cwb_colorbar as cwbcolor

def do(raincb):
	cmap = raincb['cmap']
	raincb['levels'][-1] = 9999
	for i in range(cmap.N):
		rgba = cmap(i)
		# rgb2hex accepts rgb or rgba
		try:
			print("'" + str(raincb['levels'][i+1]) + "': '" + matplotlib.colors.rgb2hex(rgba) + "',")
		except:
			print("'" + str('9999') + "': '" + matplotlib.colors.rgb2hex(rgba) + "',")
			
print('const tempcb = {')
do(cwbcolor.surfT())
print('};')

print('const raincb = {')
do(cwbcolor.rain())
print('};')

print('const radarcb = {')
do(cwbcolor.radar())
print('};')
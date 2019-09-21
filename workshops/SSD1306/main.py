from display import SSD1306
import machine

display = SSD1306(height=64, external_vcc=False, i2c_devid=60)
display.poweron()
display.init_display()

adc = machine.ADC()
p1 = adc.channel(pin='P13')

character = [[1],[1],[1],[1],[1],[1],[1],[1]]
ball = [[1,1],[1,1]]
ball_x = 64
ball_y = 32
ball_xs = 1
ball_ys = 1


def draw(display,image,x,y):
	for row, row_set in enumerate(image):
		for col, col_set in enumerate(row_set):
			display.set_pixel(x+col, y+row, col_set==1)

while True:
	display.clear()
	for i in range(64):
		display.set_pixel(64,i,True)

	p1y = int(p1()/18.6182)
	draw(display,character,0,p1y)
	ball_x+=ball_xs
	ball_y+=ball_ys
	if ball_x+2>127:
		ball_x = 125
		ball_xs = -1
	if ball_x<0:
		ball_x = 0
		ball_xs = 1
		if (((p1y+8)<ball_y) | (p1y>(ball_y+2))):
			ball_x = 64
			ball_y = 32
			ball_xs = 1
			ball_ys = 1
	if ball_y+2>63:
		ball_y = 61
		ball_ys = -1
	if ball_y<0:
		ball_y = 0
		ball_ys = 1
	draw(display,ball,ball_x,ball_y)

	display.display()
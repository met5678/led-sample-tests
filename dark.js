var SPI = require("pi-spi");
var tinycolor = require("tinycolor2");

var spi = SPI.initialize("/dev/spidev0.0");

var numLEDs = 106;
var channels = numLEDs*3;

spi.clockSpeed(1e6);

var buf = new Buffer(channels);
buf.fill(0x00);

function noop() {}

	for(var a=0; a<numLEDs; a++) {
		if(a%3 == 0) {
		var color = tinycolor({
			h:240,
			s:0,
			v:.005
		});
		}
		else {
			var color = tinycolor({h:1,s:1,v:0});
		}
		var r = a*3;
		buf[r] = color._r;
		buf[r+1] = color._g;
		buf[r+2] = color._b;
	}

function loop() {
	spi.write(buf,noop);
}

loop();
setInterval(loop,5000);


var SPI = require("pi-spi");
var tinycolor = require("tinycolor2");

var spi = SPI.initialize("/dev/spidev0.0");

var numLEDs = 106;
var channels = numLEDs*3;

spi.clockSpeed(1e6);

var buf = new Buffer(channels);
buf.fill(0x00);

var modNum = Math.floor(Math.random()*3);
var curHue = 0;
var frame = 0;
var numFrames = 1000;
var baseColors = [];
var sinValues = [];

var fadeFrame = 0;
var numFadeFrames = 20;
var fadeFrameMultipliers = [];

var pinkFrame = 0;
var numPinkFrames = 100;
var pinkPercent = .05;
var pinkHueAdditives = [];

function noop() {}

function loop() {
	//var colors = tinycolor.analogous(tinycolor({h:curHue,s:1,v:.05}),numLEDs+1,numLEDs+1);
	//var frameRadians = Math.PI*2*frame/numFrames;

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

	pinkFrame  = (pinkFrame+1)%numPinkFrames;
	spi.write(buf,noop);
}

loop();


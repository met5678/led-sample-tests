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
var curColors = [];

var fadeFrame = 0;
var numFadeFrames = 20;
var fadeFrameMultipliers = [];

var pinkFrame = 0;
var numPinkFrames = 100;
var pinkPercent = .05;
var pinkHueAdditives = [];

function noop() {}

function setup() {
	for(var a=0; a<numFrames; a++) {
		baseColors[a] = 219+Math.floor(a*.1)+Math.random()*70;
	}
	for(var a=0; a<numFrames; a++) {
		sinValues[a] = Math.floor(50+25*Math.sin(Math.PI*2*(a/numFrames)));
		if(sinValues[a] == 1)
			sinValues[a] = 0;
	}
	for(var a=0; a<numFrames; a++) {
		if(a == 0)
			sinValues[a] = Math.floor(Math.random()*100);
		else {
			if(sinValues[a-1] > 99)
				sinValues[a] = 0;
			else
				sinValues[a]++;
		}
	}
	for(var a=0; a<numPinkFrames; a++) {
		if(a < numPinkFrames*pinkPercent)
			pinkHueAdditives[a] = Math.floor(35+35*Math.sin(Math.PI*(a/(numPinkFrames*pinkPercent))));
		else
			pinkHueAdditives[a] = 0;
	}
	for(var a=0; a<numLEDs; a++) {
		curColors[a] = tinycolor({
			h:Math.floor(Math.random()*60),
			s:1,
			v:Math.floor(Math.random()*100)
		});
	}
}

function loop() {
	//var colors = tinycolor.analogous(tinycolor({h:curHue,s:1,v:.05}),numLEDs+1,numLEDs+1);
	//var frameRadians = Math.PI*2*frame/numFrames;

	for(var a=0; a<numLEDs; a++) {
		var color = tinycolor({
			h:baseColors[(a+frame)%numFrames],
			h:Math.random()*50,
			s:100,
			v:100
		});

		
		var color = curColors[a];
		/*if(color.getBrightness() > 235)
			color.brighten(5);
		else if(color.getBrightness() < 20)
			color.darken(5);
		else if(color.getBrightness()%10 == 5)
			color.darken(10);
		else
			color.brighten(10);
		curColors[a] = color;*/
		var r = a*3;
		buf[r] = color._r;
		buf[r+1] = color._g;
		buf[r+2] = color._b;
	}

	frame = (frame+1)%numFrames;
	//fadeFrame = (fadeFrame+1)%numFadeFrames;
	pinkFrame  = (pinkFrame+1)%numPinkFrames;
	//spi.write(buf,loop);
	setTimeout(loop,50);
}

setup();
loop();


var SPI = require("pi-spi");
//var tinycolor = require("tinycolor2");
var Color = require("color");
var Easing = require("easing");

var spi = SPI.initialize("/dev/spidev0.0");
spi.clockSpeed(1e6);

var numLEDs = 106;
var channels = numLEDs*3;

var buf = new Buffer(channels);
buf.fill(0x00);

// Using [composite] as our frame number so that we can loop as many frames as is possible
var composite = 840;
var factors = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 20, 21, 24, 28];
var invFactors = [420, 280, 210, 168, 140, 120, 105, 84, 70, 60, 56, 42, 40, 35, 30];

var ledFrames = [];


var oddBuf = new Buffer(channels);
oddBuf.fill(0x00);

var evenBuf = new Buffer(channels);
evenBuf.fill(0x00);

for ( var led = 0; led < numLEDs; led ++ ) {
	var baseIndex = led * 3;
	if (led % 2) {
		oddBuf[baseIndex] = 0x00;
		oddBuf[baseIndex+1] = 0x00;
		oddBuf[baseIndex+2] = 0xff;
	}
	else {
		evenBuf[baseIndex] = 0xff;
		evenBuf[baseIndex+1] = 0x00;
		evenBuf[baseIndex+2] = 0xff;
	}
}

ledFrames.push(oddBuf);
ledFrames.push(evenBuf);



// var hue = 40;
// // var sat = 100;
// var value = 100;
// var spread = 0;
// var satSpread = 40;
// var easeType = 'circular';
//
// var twoPi = Math.PI*2;




var curFrame = 0;

function noop() {}

function loop() {
	var buf = ledFrames[curFrame];

	if(curFrame < ledFrames.length - 1 )
		curFrame++;
	else
		curFrame = 0;

	spi.write(buf,noop);
}

loop();
// Minimum delay for these lights is 5
setInterval(loop,200);

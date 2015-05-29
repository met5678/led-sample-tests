var SPI = require("pi-spi");
//var tinycolor = require("tinycolor2");
var Color = require("color");
var Easing = require("easing");

var spi = SPI.initialize("/dev/spidev0.0");
spi.clockSpeed(1e6);
//spi.bitOrder(SPI.order.LSB_FIRST);

var numLEDs = 106;
var channels = numLEDs*3;

var buf = new Buffer(channels);
buf.fill(0xFF);

// Using [composite] as our frame number so that we can loop as many frames as is possible
var composite = 40;
var factors = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 20, 21, 24, 28];
var invFactors = [420, 280, 210, 168, 140, 120, 105, 84, 70, 60, 56, 42, 40, 35, 30];

var hue = 30;
// var sat = 100;
var value = 100;
var spread = 0;
var satSpread = 0;
var easeType = 'circular';

var twoPi = Math.PI*2;

// Max 14
var slowestEasingIndex = 0;
var fastestEasingIndex = 14;
var ledFrames = [];

var onFraction = 1;
var divisions = 20;
var bounce = true;
var pointWidth = 1;

var easingLib = [];
for(var easingLibIndex=0, framesIndex = slowestEasingIndex; framesIndex <= fastestEasingIndex;easingLibIndex++,framesIndex++) {
	var numFrames = invFactors[framesIndex];
	var numOnFrames = Math.round(numFrames * onFraction);
	var startingFrame = Math.floor((numFrames-numOnFrames)/2);
	var onEasingFrames = Easing(numOnFrames,easeType,{endToEnd:bounce});
	var easingFrames = [];
	for(var easingFrameIndex=0; easingFrameIndex<numFrames; easingFrameIndex++) {
		if(easingFrameIndex < startingFrame)
			easingFrames[easingFrameIndex] = 0;
		else if(easingFrameIndex < numOnFrames + startingFrame)
			easingFrames[easingFrameIndex] = onEasingFrames[easingFrameIndex-startingFrame];
		else
			easingFrames[easingFrameIndex] = 0;
	}
	easingLib[easingLibIndex] = easingFrames;
}

var getSpreadColor = function() {
	var thisSatSpread = satSpread*Math.pow(Math.random(),3);
	var satValue = Math.round(100-thisSatSpread);

	var thisSpread = Math.random()*spread;
	var hueValue = hue-(spread/2)+thisSpread;
	if(hueValue < 0)
		hueValue += 360;
	else if(hueValue >= 360)
		hueValue -= 360;
	return Color({
		h:hueValue,
		s:satValue,
		v:value
	})
}

var range = numLEDs/divisions;
console.log("range");


var divColors = [];
for(var division=0; division<divisions; division++) {
	divColors[division] = getSpreadColor().values.rgb;
}

for(var frame=0; frame<composite; frame++) {
	var buffer = new Buffer(channels);
	buffer.fill(0x00);

	for(var division=0; division<divisions; division++) {
		var colorRGB = divColors[division];

		var point = range*((frame/composite)+division);
		var divStart = range*division;

		var startLED = Math.floor(point-pointWidth);
		var endLED = Math.ceil(point+pointWidth);

		for(var led=startLED; led<=endLED; led++) {
			var dist = Math.abs(led-point);
			//if(led == 5) console.log(point,led,dist);
			if(dist < pointWidth) {
				if(led < 0)
					var rIndex = (numLEDs+led)*3;
				else if(led >= numLEDs)
					var rIndex = (led-numLEDs)*3;
				else
					var rIndex = led*3;
				var brightness = 1-dist/pointWidth;
				brightness = Math.pow(brightness,2);
				buffer[rIndex] = Math.round(brightness*colorRGB[0]);
				buffer[rIndex+1] = Math.round(brightness*colorRGB[1]);
				buffer[rIndex+2] = Math.round(brightness*colorRGB[2]);
			}
		}
	}
	ledFrames[frame] = buffer;
};

/*
for(var led=0; led<numLEDs; led++) {
	var colorRGB = getSpreadColor().values.rgb;
	var cycleFrames = easingLib[Math.floor(Math.random()*easingLib.length)];
	var cycleFramesNum = cycleFrames.length;
	var offsetNum = Math.floor(Math.random()*cycleFramesNum);

	for(var frame=0; frame<composite; frame++) {
		if(led == 0)
			ledFrames[frame] = new Buffer(channels);

 		var buffer = ledFrames[frame];
		var rIndex = led*3;
		var cycleFrame = cycleFrames[(offsetNum+frame)%cycleFramesNum];

		buffer[rIndex] = Math.round(cycleFrame*colorRGB[0]);
		buffer[rIndex+1] = Math.round(cycleFrame*colorRGB[1]);
		buffer[rIndex+2] = Math.round(cycleFrame*colorRGB[2]);
	}
}*/

var curFrame = 0;

function init() {

}

function noop() {}

function loop() {
	var buffer = ledFrames[curFrame];

	if(curFrame < ledFrames.length-1)
		curFrame++;
	else
		curFrame = 0;

	spi.write(buffer,noop);
	//setImmediate(loop);
}

loop();
// Minimum delay for these lights is 5
setInterval(loop,15);

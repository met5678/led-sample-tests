const SPI = require("pi-spi");
const Color = require("color");
const Easing = require("easing");

const spi = SPI.initialize("/dev/spidev0.0");
spi.clockSpeed(1e6);

const numLEDs = 106;
const hue = 180;
const sat = 100;
const value = 50;
const spread = 360;
const satSpread = 0;
const slowestEasingIndex = 2;
const fastestEasingIndex = 5;
const onFraction = 1;


const channels = numLEDs*3;
const twoPi = Math.PI*2;

// Using [composite] as our frame number so that we can loop as many frames as is possible
const composite = 840;
const factors = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 20, 21, 24, 28];
const invFactors = [420, 280, 210, 168, 140, 120, 105, 84, 70, 60, 56, 42, 40, 35, 30];
const easeType = 'circular';

// Max 14
const ledFrames = [];


var easingLib = [];
for(var easingLibIndex=0, framesIndex = slowestEasingIndex; framesIndex <= fastestEasingIndex;easingLibIndex++,framesIndex++) {
	var numFrames = invFactors[framesIndex];
	var numOnFrames = Math.round(numFrames * onFraction);
	var startingFrame = Math.floor((numFrames-numOnFrames)/2);
	var onEasingFrames = Easing(numOnFrames,easeType,{endToEnd:true});
	var easingFrames = [];
	console.log(numFrames,numOnFrames,startingFrame,onEasingFrames.length);
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

const getSpreadColor = function() {
	var thisSatSpread = satSpread*Math.pow(Math.random(),3);
	var satValue = Math.round(100-thisSatSpread);
	console.log(satValue);


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
}

var curFrame = 0;

function init() {

}

function noop() {}

function loop() {
	var buf = ledFrames[curFrame];

	if(curFrame < composite-1)
		curFrame++;
	else
		curFrame = 0;

	spi.write(buf,noop);
}

loop();
// Minimum delay for these lights is 5
setInterval(loop,33);

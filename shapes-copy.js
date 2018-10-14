/* --------------------------------------------------------------------

AV0 — A framework to experiment live human-computer collaboration in 
the audio visual field
Copyright (C) 2017 Luca De Rosso

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software Foundation,
Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA

-----------------------------------------------------------------------

Author: Luca De Rosso
Website: http://www.lucaderosso.com/

Instagram: @lucaderosso
Twitter: @lucaderosso
Facebook: facebook.com/derossoluca
Pinterest: pinterest.com/lucaderosso
Github: https://github.com/lucaderosso/AV0

---------------------------------------------------------------------*/



// ———————
// GENERAL
// ———————

post("shapes-copy.js loaded \n");

var positions = [-increment, increment];
var decay = 255; // setting 255 (aka sudden decay) because it's my preffered starting setting

var pattern_8_8_8 = [
				1, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 1, 
				1, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 1,
				];

// ———————————————————————————
// Methods to manage allLayers
// ———————————————————————————

function prepareArrayForLayer(layer){	
	var array = [];
	
	switch(layer){
		case "layer1":
			layer1.shapes.length = 0;
			array = layer1.shapes;
		break;
		case "layer2":
			layer2.shapes.length = 0;
			array = layer2.shapes;
		break;
		case "layer3":
			layer3.shapes.length = 0;
			array = layer3.shapes;
		break;
		case "layer4":
			layer4.shapes.length = 0;
			array = layer4.shapes;
		break;
		default:
	}

	return array
}

function getArrayForLayer(layer){	
	var array = [];
	switch(layer){
		case "layer1":
			array = layer1.shapes;
		break;
		case "layer2":
			array = layer2.shapes;
		break;
		case "layer3":
			array = layer3.shapes;
		break;
		case "layer4":
			array = layer4.shapes;
		break;
		default:
	}
	return array
}



// ————————————
// Shape Object
// ————————————

function Shape(xPos, yPos, leftBound, rightBound, bottomBound, topBound, type){	
	this.flashing = false;
	this.fading = true; // objects are all fading by default causing lifespan to decrease and disappear from the window
	this.bouncing = false;
	this.freq = 1;

	this.moving = false;
	this.rotating = false;
	this.scaling = false;

	this.type = type;
	this.ease = updatedEase;
	this.lifespan = 0;
	this.lifeDecay = updatedDecay;

	// the value at generation time. this value must never change so it can be used to recover the initial position or preserve the position given.
	this.locationGenesis = Object.create(Vector);
	this.locationGenesis.x = xPos;
	this.locationGenesis.y = yPos;	
	// this.locationGenesis.z = Math.random();
	this.locationGenesis.z = 0;

	// roaming bounds
	this.boundLeft = leftBound;
	this.boundRight = rightBound;
	this.boundBottom = bottomBound;
	this.boundTop = topBound;

	this.boundsWidth = Math.abs(this.boundLeft - this.boundRight);
	this.boundsHeight = Math.abs(this.boundTop - this.boundBottom);

	this.width = (Math.abs(this.boundRight - this.boundLeft) / 2);
	this.height = (Math.abs(this.boundTop - this.boundBottom) / 2);

	this.location = Object.create(Vector);
	this.location.x = xPos;
	this.location.y = yPos;
	this.location.z = this.locationGenesis.z;
	this.targetLocation = Object.create(Vector);
	this.targetLocation.x = xPos;
	this.targetLocation.y = yPos;

	this.scale = Object.create(Vector);
	this.scale.x = 1;
	this.scale.y = 1;
	this.targetScale = Object.create(Vector);
	this.targetScale.x = 1;
	this.targetScale.y = 1;

	this.rotation = 0;
	this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
	this.targetRotation = 0;

	this.color = Object.create(colorWhite);
}

Shape.prototype.display = function(){
	// REMEMBER — From OpenGL Red Book:
	// If you rotate the object first and then translate it, the rotated object appears on the x-axis.
	// If you translate it down the x-axis first, and then rotate about the origin, the object is on the line y=x. 
	// In general, the order of transformations is critical.
	// Also:
	// mySketch.moveto(0, 0, 0); is used below to center the composition on x,y 0,0.
	// var distort = (1 - (high * dial6));
	var distort = (1 - (allFreq * dial6));
	var alpha = this.lifespan / 255.0;
	mySketch.glcolor(this.color.r, this.color.g, this.color.b, alpha);
	mySketch.gllinewidth(2);

	switch(this.type) {
		// for objects to do something when any pad is pushed they need to include:
		// this.scale.x
		// this.scale.y
		// this.location.x
		// this.location.y
		// this.rotation

		// Notes on commands:
		// - moveto(): if you don't want to use it to actually move objects, then add it to the shape and set it to 0,0,0 to restore the coordinate other shapes might have assigned 

		case "s000": 
			//plane centered scaling both directions
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.locationGenesis.x, this.location.y, this.locationGenesis.z);
			mySketch.moveto(0, 0, 0);
			mySketch.glrotate(this.rotation, 0, 1, 0);
			mySketch.glscale(1, this.scale.y, 1);
			//
			mySketch.gldisable("line_stipple");
			//
			mySketch.cube(this.width * distort - 0.001, this.height * distort - 0.001, 0.01);
			mySketch.glpopmatrix();
		break;

		case "s001": 
			//plane centered scaling both directions
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.locationGenesis.x, this.location.y, this.locationGenesis.z);
			mySketch.moveto(0, 0, 0);
			mySketch.glrotate(90, 1, 0, 0);
			mySketch.glrotate(this.rotation/2, 0, this.rotationDirection, 0);
			//
			mySketch.shapeslice(1, 1);
			mySketch.shapeprim("points");
			mySketch.glpointsize(10);
			//
			mySketch.plane(this.width/2 * this.scale.y, 0); // putting scale.y here to avoid using glscale
			//
			mySketch.glpopmatrix();
		break;

		case "s002":
			mySketch.glpushmatrix();
			mySketch.gltranslate(this.locationGenesis.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation/2, 0, 0, this.rotationDirection);
			// mySketch.glscale(this.scale.x * distort, this.scale.y * distort, 1);
			mySketch.moveto(0, 0, 0);
			//
			mySketch.gllinewidth(4);
			mySketch.framequad((this.width * this.scale.x * distort) - 0.003, this.height/16, 0, (this.width * this.scale.x * distort) - 0.003, -this.height/16, 0, -this.width + 0.003, -this.height/16, 0, -this.width + 0.003, this.height/16, 0);
			mySketch.glpopmatrix();
		break;

		case "s003":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z); // position shape at location
			mySketch.moveto(0, 0, 0);
			mySketch.glrotate(this.rotation/2, 1, 0, 0);
			//
			mySketch.gldisable("line_stipple");
			mySketch.shapeprim("lines");
			mySketch.shapeslice(8, 1);
			mySketch.gllinewidth(4);
			//
			mySketch.plane(this.width, this.height * this.scale.y); // putting scale.y here to avoid using glscale
			mySketch.glpopmatrix();
		break;

		case "s004":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.locationGenesis.x, this.location.y, this.locationGenesis.z); // position shape at location
			mySketch.moveto(0, 0, 0);
			mySketch.glrotate(this.rotation * distort, 0, 1, 0);
			//
			mySketch.shapeprim("lines");
			mySketch.shapeslice(4, 1);
			mySketch.gldisable("line_stipple");
			mySketch.gllinestipple(1, 255);
			mySketch.gllinewidth(4);
			mySketch.plane(this.width, this.height / 2 * this.scale.y); // putting scale.y here to avoid using glscale
			//
			mySketch.glenable("line_stipple");
			mySketch.gllinestipple(1, 3855);
			mySketch.gllinewidth(1);
			//
			mySketch.plane(this.width, this.height); // putting scale.y here to avoid using glscale
			mySketch.glpopmatrix();
		break;

		case "s005":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.locationGenesis.x, this.locationGenesis.y, this.locationGenesis.z); // position shape at location
			// moveto() does not apply to linesegment
			mySketch.glrotate(this.rotation, 0, 0, -1);
			mySketch.glscale(this.scale.x, 1, 1);
			//
			mySketch.gldisable("line_stipple");
			//
			mySketch.linesegment(-this.width / 4  * distort, 0, 0, this.width / 4	  * distort, 0, 0);
			mySketch.glpopmatrix();
		break;

		case "s006":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.locationGenesis.x, this.locationGenesis.y, this.locationGenesis.z); // position shape at location
			mySketch.glscale(this.scale.x, 1, 1);
			//
			mySketch.gllinewidth(2);
			mySketch.glenable("line_stipple");
			mySketch.gllinestipple(2, 3855);
			mySketch.linesegment(-this.width, 0, 0, this.width, 0, 0);
			mySketch.glpopmatrix();
			//
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			//
			mySketch.gllinewidth(8);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z); // position shape at location
			mySketch.moveto(this.location.x, this.locationGenesis.y, this.locationGenesis.z); // position shape at location
			mySketch.glrotate(this.rotation, 0, 0, 1);
			mySketch.glscale(this.scale.x, 1, 1);
			mySketch.gldisable("line_stipple");
			mySketch.linesegment(-this.height * distort, 0, 0, this.height * distort, 0, 0);
			//
			mySketch.glpopmatrix();
		break;

		case "s007":
			mySketch.glpushmatrix();
			mySketch.gltranslate(this.locationGenesis.x, this.location.y * distort, this.locationGenesis.z); // position shape at location
			mySketch.glrotate(this.rotation / 2, 0, 0, this.rotationDirection);
			mySketch.glscale(this.scale.x, 1, 1);
			mySketch.gllinewidth(4);
			mySketch.gldisable("line_stipple");
			mySketch.linesegment(this.width, 0, 0, -this.width, 0, 0);
			mySketch.glpopmatrix();
		break;

		case "s008":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.locationGenesis.x, this.locationGenesis.y * distort, this.locationGenesis.z); // position shape at location
			mySketch.glrotate(this.rotation, 0, 0, 1);	
		
			mySketch.gllinewidth(4);
			mySketch.gllinestipple(2, 3855);
			mySketch.glenable("line_stipple");
			mySketch.linesegment(this.location.x - this.width, this.location.y, 0, this.location.x + this.width, this.location.y, 0);
			mySketch.glpopmatrix();

			mySketch.glpushmatrix();
			mySketch.gltranslate(this.locationGenesis.x, this.locationGenesis.y * distort, 0); // position shape at location
			mySketch.glrotate(this.rotation / 2, 0, 0, this.rotationDirection);
			mySketch.gldisable("line_stipple");
			mySketch.glscale(this.scale.x, 1, 1);
			mySketch.linesegment(this.location.x + this.width, 0, 0, this.location.x - this.width, 0, 0);
			mySketch.glpopmatrix();
		break;

		case "s009":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.moveto(this.locationGenesis.x, this.locationGenesis.y, this.locationGenesis.z); // position shape at location
			mySketch.glrotate(this.rotation / 2, 0, 0, this.rotationDirection);
			mySketch.glscale(this.scale.x, 1, 1);
			//
			//
			mySketch.gllinewidth(Math.ceil(this.scale.x * 20 * distort));
			mySketch.gldisable("line_stipple");
			mySketch.linesegment(this.location.x + this.width, this.location.y, 0, this.location.x - this.width, this.location.y, 0);
			//
			mySketch.glpopmatrix();
			// mySketch.glpushmatrix();
			// mySketch.shapeorient(0, 0, 0);
			// mySketch.gltranslate(this.location.x * distort, this.locationGenesis.y, this.locationGenesis.z); // position shape at location
			// mySketch.linesegment(0, -this.height/2, 0, 0, this.height/2, 0);
			// mySketch.glpopmatrix();

			// mySketch.glpushmatrix();
			// mySketch.gltranslate(this.location.x * distort, this.locationGenesis.y + this.height/2, this.locationGenesis.z);
			// mySketch.glrotate(this.rotation, 1, 0, 0);
			// mySketch.glscale(this.scale.y, this.scale.y, 1);
			// // mySketch.moveto(0, this.height/2, 0);
			// //
			// mySketch.framequad(0.0075, 0.0075, 0, 0.0075, -0.0075, 0, -0.0075, -0.0075, 0, -0.0075, 0.0075, 0);
			// mySketch.glpopmatrix();

			// mySketch.glpushmatrix();
			// mySketch.gltranslate(this.location.x * distort, this.locationGenesis.y - this.height/2, this.locationGenesis.z);
			// mySketch.glrotate(this.rotation, 1, 0, 0);
			// mySketch.glscale(this.scale.y, this.scale.y, 1);
			// // mySketch.moveto(0, this.height/2, 0);
			// //
			// mySketch.framequad(0.0075, 0.0075, 0, 0.0075, -0.0075, 0, -0.0075, -0.0075, 0, -0.0075, 0.0075, 0);
			// mySketch.glpopmatrix();
		break;

		case "s010":
			mySketch.glpushmatrix();
			mySketch.glenable("line_stipple");
			mySketch.gllinestipple(1, 3855);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y * distort, this.locationGenesis.z); // position shape at location			
			mySketch.linesegment(0, this.scale.y * this.height, 0, 0, -(this.scale.y * this.height), 0);
			mySketch.glpopmatrix();
			//
			//
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.shapeorient(0, 0, this.scale.y * 360);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y * distort + (this.scale.y * this.height), this.locationGenesis.z); // position shape at location
			mySketch.plane(0.00625 * this.scale.x, 0.00625);
			mySketch.glpopmatrix();
			//
			//
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.shapeorient(0, 0, this.scale.y * 360);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y  * distort - (this.scale.y * this.height), this.locationGenesis.z); // position shape at location
			mySketch.plane((this.rotation / 1440) + (0.00625 * this.scale.x), 0.00625);
			mySketch.glpopmatrix();
		break;

		case "s011":
			mySketch.glpushmatrix();
			mySketch.glenable("line_stipple");
			mySketch.gllinestipple(1, 3855);
			mySketch.gltranslate(this.locationGenesis.x, this.location.y * distort, this.locationGenesis.z); // position shape at location			
			mySketch.glrotate(this.rotation/2, 0, 1, 0);

			mySketch.gllinewidth(32 * this.scale.y);
			mySketch.linesegment(this.width, 0, 0, -this.width, 0, 0);

			mySketch.glpopmatrix();
		break;

		case "s012":
			mySketch.glpushmatrix();
			mySketch.gldisable("line_stipple");
			//
			mySketch.moveto(0, 0, 0);
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.location.y, this.locationGenesis.z); // position shape at location

			mySketch.glrotate(this.rotation/2, 0, 0, this.rotationDirection);
			mySketch.plane(this.width/2, 0.0015);
			mySketch.glpopmatrix();
			//
			mySketch.glpushmatrix();
			mySketch.gltranslate(this.location.x, this.location.y, this.locationGenesis.z); // position shape at location
			mySketch.plane(0.0125, 0.0125);
			mySketch.glcolor(0, 0, 0, alpha);
			mySketch.plane(0.009375, 0.009375);
			mySketch.glpopmatrix();

		break;

		case "s013": // TBD
			mySketch.glpushmatrix();
			mySketch.gllinewidth(10 * this.scale.x);
			// mySketch.linesegment(this.boundLeft, this.boundBottom, 0, this.locationGenesis.x, this.location.y, 0);
			// mySketch.linesegment(this.locationGenesis.x, this.location.y, 0, this.boundRight, this.boundTop, 0);	
			mySketch.moveto(this.location.x, this.location.y, 0);
			mySketch.shapeorient(0, 0, 0);
			// mySketch.gltranslate(this.location.x, this.location.y, 0);
			mySketch.linesegment(this.boundLeft, this.boundBottom, 0, this.boundRight, this.boundTop, 0);

			mySketch.glpopmatrix();
		break;

		case "s014":
			mySketch.glpushmatrix();
			mySketch.gltranslate(this.locationGenesis.x, this.location.y, this.locationGenesis.z);
			mySketch.moveto(0, 0, 0);
			mySketch.glrotate(this.rotation, 0, 0, 1);
			//
			mySketch.gldisable("line_stipple");
			//
			mySketch.gllinewidth(4);
			mySketch.linesegment(-this.width, 0, 0, this.width, 0, 0);
			mySketch.moveto(0, this.locationGenesis.x * (1 - this.scale.x), this.locationGenesis.z);
			mySketch.glrotate(90, 0, 0, 1);
			mySketch.plane(this.height/16, this.width/128);
			mySketch.glpopmatrix();
		break;

		case "s015":
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
			mySketch.gldisable("line_stipple");
			mySketch.gllinewidth(8 * this.scale.x);
			mySketch.linesegment(0, -this.height, 0, 0, this.height, 0);
			mySketch.glpopmatrix();
			//
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.locationGenesis.x, this.location.y, this.locationGenesis.z);
			mySketch.gldisable("line_stipple");
			mySketch.gllinewidth(8 * this.scale.x);
			mySketch.linesegment(-this.width, 0, 0, this.width, 0, 0);
			mySketch.glpopmatrix();
		break;

		case "s016":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 90);
			mySketch.gltranslate(this.location.x * distort, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
			mySketch.moveto(0, 0, 0);
			//
			mySketch.gllinewidth(2);
			mySketch.gldisable("line_stipple");
			mySketch.shapeslice(20);
			//
			mySketch.glenable("line_stipple");
			
			mySketch.gllinestipple(1, 3855);
			mySketch.circle(0.0025);
			mySketch.shapeslice(3);
			mySketch.framecircle(0.02 / this.scale.y);
			mySketch.glpopmatrix();
		break;

		case "s017":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 45);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 1, 0);
			mySketch.moveto(0, this.locationGenesis.x * (1 - this.scale.x), 0);
			//
			mySketch.gldisable("line_stipple");
			mySketch.shapeslice(4);
			//
			mySketch.framecircle(0.015);
			mySketch.glpopmatrix();
		break;

		case "s018":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 45);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 0, 1);
			mySketch.moveto(0, 0, 0);
			//
			mySketch.gldisable("line_stipple");
			mySketch.shapeslice(24);
			//
			mySketch.circle(0.00375);
			mySketch.glpopmatrix();
			//
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 90);
			mySketch.gltranslate(this.locationGenesis.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 1, 0);
			mySketch.moveto(0, 0, 0);
			mySketch.glscale(1, this.scale.y / distort, 0)
			//
			//
			mySketch.shapeslice(1, 1);
			mySketch.shapeprim("lines");
			mySketch.plane(this.height/2, this.width/2);
			mySketch.glpopmatrix();
		break;

		case "s019":
			mySketch.glpushmatrix();
			mySketch.shapeorient(0, 0, 0);
			mySketch.gltranslate((this.location.x + positions[1]) * distort, this.location.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);			
			mySketch.moveto(positions[0], 0, 0);
			//
			mySketch.shapeslice(24);
			mySketch.circle(0.0075 * this.scale.x);
			mySketch.glpopmatrix();
		break;

		case "s020":
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
			mySketch.gldisable("line_stipple");
			mySketch.gllinewidth(8 * this.scale.x);
			mySketch.linesegment(0, -this.height/2, 0, 0, this.height/2, 0);
			mySketch.glpopmatrix();
		break;

		case "s021":
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation/2, 0, 0, this.rotationDirection);
			mySketch.gldisable("line_stipple");
			
			mySketch.gllinewidth(4);
			mySketch.linesegment(this.height);
			mySketch.glcolor(1, 0.21, 0.3, 1);
			mySketch.shapeslice(60);
			mySketch.framecircle(this.height/2 * this.scale.x * distort);
			mySketch.glpopmatrix();
		break;

		case "s022":
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
			mySketch.gldisable("line_stipple");
			mySketch.gllinewidth(2);
			mySketch.shapeslice(100);
			mySketch.glscale(this.scale.x, this.scale.x, 0);
			mySketch.circle(this.height);
			mySketch.glcolor(0., 0., 0., 1);
			mySketch.linesegment(0, -this.height/4, 0, 0, this.height/4, 0);
			mySketch.glpopmatrix();
		break;

		case "s023":
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
			mySketch.gldisable("line_stipple");
			mySketch.gllinewidth(8 * this.scale.x);
			mySketch.framecircle(this.height/2);
			mySketch.glpopmatrix();
		break;

		case "s024":
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glrotate(this.rotation, 0, 1, 0);
			mySketch.gldisable("line_stipple");
			mySketch.glscale(1, this.scale.x, 1);
			mySketch.cube(this.width/8 * distort, this.height * distort - 0.001, 0.01);
			mySketch.glpopmatrix();
		break;

		case "s025":
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
			mySketch.glscale(this.scale.x, this.scale.x, 0);
			mySketch.glrotate(this.rotation/2, 0, 0, this.rotationDirection);
			
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gldisable("line_stipple");
			mySketch.gllinewidth(4);
			mySketch.linesegment(-this.width, 0, 0, this.width, 0, 0);
			mySketch.glpopmatrix(); 
			
			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(-this.width, 0, this.locationGenesis.z);
			mySketch.linesegment(0, -0.02, 0, 0, 0.02, 0);
			mySketch.glpopmatrix();

			mySketch.glpushmatrix();
			mySketch.moveto(0, 0, 0);
			mySketch.gltranslate(this.width, 0, this.locationGenesis.z);
			mySketch.linesegment(0, -0.02, 0, 0, 0.02, 0);
			mySketch.glpopmatrix();
			mySketch.glpopmatrix();
		break;

		case "s026":
			mySketch.glpushmatrix();

				mySketch.moveto(0, 0, 0);
				mySketch.gltranslate(this.location.x - this.width/2, this.locationGenesis.y, this.locationGenesis.z);
				mySketch.glscale(this.scale.x, this.scale.x, 0);
				mySketch.glrotate(this.rotation/2, 0, 0, 1);
				
				mySketch.glpushmatrix();
					mySketch.moveto(0, 0, 0);
					// mySketch.gltranslate(0, 0, this.locationGenesis.z);			
					mySketch.gldisable("line_stipple");
					mySketch.gllinewidth(4);
					// mySketch.shapeorient(0, 0, 45);
					mySketch.linesegment(0, 0, 0, this.width, 0, 0);
				mySketch.glpopmatrix(); 
				
				mySketch.glpushmatrix();
					mySketch.moveto(0, 0, 0);
					mySketch.gltranslate(this.width + 0.004, 0, this.locationGenesis.z);
					// mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
					// mySketch.linesegment(0, -0.02, 0, 0, 0.02, 0);
					mySketch.shapeslice(30);
					mySketch.framecircle(0.004);
				mySketch.glpopmatrix();
			mySketch.glpopmatrix();
		break;

		case "s027":
			mySketch.glpushmatrix();

				mySketch.moveto(0, 0, 0);
				mySketch.gltranslate(this.locationGenesis.x, this.location.y, this.locationGenesis.z);
				mySketch.glrotate(this.rotation, 0, 1, 0);
			
				mySketch.glpushmatrix();
					mySketch.moveto(0, 0, 0);
					mySketch.gldisable("line_stipple");
					// mySketch.gllinewidth(8 * this.scale.x);
					mySketch.glscale(1, this.scale.y, 1);
					mySketch.cube(this.width - 0.002, 0.01, 0.02);
				mySketch.glpopmatrix();

				mySketch.glpushmatrix();
					mySketch.moveto(0, 0, 0);
					mySketch.gltranslate(this.width - 0.0095, 0, this.locationGenesis.z);
					mySketch.glscale(this.scale.y, this.scale.y, 1);
					mySketch.glcolor(0, 0, 0, 1);
					mySketch.circle(0.005);
				mySketch.glpopmatrix();

			mySketch.glpopmatrix();
		break;

		// case "s028":
		// 	mySketch.glpushmatrix();
		// 	mySketch.moveto(0, 0, 0);
		// 	mySketch.gltranslate(this.locationGenesis.x, this.location.y, this.locationGenesis.z);
		// 	mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
		// 	mySketch.gldisable("line_stipple");
		// 	mySketch.gllinewidth(8 * this.scale.x);
		// 	mySketch.framecircle(this.height/2);
		// 	mySketch.glpopmatrix();
		// break;

		// case "s029":
		// 	mySketch.glpushmatrix();
		// 	mySketch.moveto(0, 0, 0);
		// 	mySketch.gltranslate(this.location.x, this.locationGenesis.y, this.locationGenesis.z);
		// 	mySketch.glrotate(this.rotation, 0, 0, this.rotationDirection);
		// 	mySketch.gldisable("line_stipple");
		// 	mySketch.gllinewidth(8 * this.scale.x);
		// 	mySketch.framecircle(this.height/2);
		// 	mySketch.glpopmatrix();
		// break;

		default:
			// i had something here but then removed it because it was constantly displayed... not sure why. I should check the max patch.
	}

	mySketch.glflush(); // you started testing glflush on jan 14, 2017 to see if it would increase performance.
}

Shape.prototype.update = function(){	
	if(this.moving){
		this.location.x = this.easeValue(this.location.x, this.targetLocation.x, this.moving);
		this.location.y = this.easeValue(this.location.y, this.targetLocation.y, this.moving);		
	}

	if(this.rotating){
		this.rotation = this.easeValue(this.rotation, this.targetRotation, this.rotating);
	}

	if(this.scaling){
		this.scale.x = Math.abs(this.easeValue(this.scale.x, this.targetScale.x, this.scaling));
		this.scale.y = Math.abs(this.easeValue(this.scale.y, this.targetScale.y, this.scaling));
	}

	if(this.fading){
		this.lifespan -= this.lifeDecay;
	}
}

Shape.prototype.run = function(){
	this.update();
	this.display();
}

Shape.prototype.easeValue = function(start, end, easing){
	// similar curve to a easeOutExpo	
	var result = start + ((end - start) * this.ease);
	if(Math.abs(end - start) < 0.0001) {
		result = end;
		type = false;
	}
	return result;
}

Shape.prototype.checkBounds = function(xStep, yStep){
	var x = xStep;
	var y = yStep;

	if(this.targetLocation.x + x < this.boundLeft || this.targetLocation.x + x > this.boundRight){
		x = x * -1;
	}
	if(this.targetLocation.y + y < this.boundBottom || this.targetLocation.y + y > this.boundTop){
		y = y * -1;
	}
	// make the object jump to the previously established targetLocation
	// in this way the next  move will be within the defined grid's increment			
	this.location.x = this.targetLocation.x;
	this.location.y = this.targetLocation.y;
	// update targetLocation to ease to	
	this.targetLocation.x = this.targetLocation.x + x;
	this.targetLocation.y = this.targetLocation.y + y;
}



// ———————————————————————
// Methods to add shapes
// ———————————————————————

function addShapesToLayer(layer, x, y, leftBound, rightBound, bottomBound, topBound, t){
	// given that having a size of zero would make the shape invisible and therefore resul useless, I'm using 0 to enable randomization of size
	layer.push(new Shape(x, y, leftBound, rightBound, bottomBound, topBound, t));
}

function checkColumns(columns, rows){
	// a method to check that the numbers of columns and rows in the grid is never greater than the one allowed: verticalSubdivision / 2 
	var newColumns = columns; //1
	var newRows = rows; //6

	if(columns > (horizontalRes / 2)){ // 1 > 18/2
		newColumns = horizontalRes / 2;
	}

	if(rows > (verticalRes / 2)){ // verticalRes = windowHeight / increment = 6 / 2 
		newRows = verticalRes / 2;
	}
	
	// post("newColumns: " + newColumns + "\n");
	// post("newRows: " + newRows + "\n");
	return [newColumns, newRows];
}

// post("- \n");

function genesis(layer, type, gridColumns, gridRows, items){
	var array = prepareArrayForLayer(layer);
	
	var columnsAndRows = checkColumns(gridColumns, gridRows);
	var columns = columnsAndRows[0];
	var rows = columnsAndRows[1];
	var totalCells = columns * rows;

	var colPace = (windowWidth / columns) / 2;
	var rowPace = (windowHeight / rows) / 2;

	// post("rowPace: " + rowPace + "\n");
	
	var xCoordinates = [];
	var yCoordinates = [];
	var leftBounds = [];
	var rightBounds = [];
	var bottomBounds = [];
	var topBounds = [];

	var cellsIndex = 0; // defines the starting cell in polulating a grid (eg: grid 2coll 2rows cellsIndex = 1, first shape will be in the second cell - bottom right)
	// post("•\n")
	// calculate x and y position for all items
	for (var f = 0; f < rows; f++) {
		// calculate vertical multiplier
		var verticalMultiplier = 1 + (f * 2);		
		var y = viewPortBottom + (rowPace * verticalMultiplier);
		var bottom = y - rowPace;
		var top = y + rowPace;

		for (var g = 0; g < columns; g++) {
			// calculate horizontal multiplier
			var horizontalMultiplier = 1 + (g * 2);
			var x = viewPortLeft + (colPace * horizontalMultiplier);
			var left = x - colPace;
			var right = x + colPace;	
			// populate the arrays with all the coordinates calculated
			yCoordinates.push(y);
			xCoordinates.push(x);
			// post("xCoor: " + x + "| yCoor: " + y + "\n");
			// populate the arrays with all the coordinates to define the roaming areas
			leftBounds.push(left);
			rightBounds.push(right);
			bottomBounds.push(bottom);
			topBounds.push(top);
		}
	}
	
	// check if there is extra room in the grid
	if(items < totalCells && items > 1){
		// calculate extra room
		var emptyCells = totalCells - items;
		// calculate new starting index do that there will be n even number of empty cells at the beginnin and end of the grid
		cellsIndex = Math.floor(emptyCells / 2);
		// post(layer + " cellsIndex: " + cellsIndex + "\n");
	}

	// populate array with shapes
	var populateNormally = Math.random() > 0.5 ? true : false;
	// post("populateNormally: " + populateNormally + "\n");
	if(populateNormally == true){	
		for (var i = cellsIndex; i < (items + cellsIndex); i++) {
			addShapesToLayer(array, xCoordinates[i], yCoordinates[i], leftBounds[i], rightBounds[i], bottomBounds[i], topBounds[i], type);					
		}
	}else{
		for (var i = totalCells - 1; i >= cellsIndex; i--) {
			addShapesToLayer(array, xCoordinates[i], yCoordinates[i], leftBounds[i], rightBounds[i], bottomBounds[i], topBounds[i], type);					
		}
	}

	// post("layer" + layer + "| totalCells: " + totalCells + "| items: " + items + "\n");

}



// ————————————————————————
// Methods to move shapes
// ————————————————————————

var newLifeSpan = 255;

function assignLifeSpanForLayer(value, layer){
	var affectedShapes = layers[layer].shapes;
	// checking for sustain otherwise shapes will flash in an out when turning dials with no pad pressed
	if(layers[layer].sustain == true){
		for(var f = 0; f < affectedShapes.length; f++){
			newLifeSpan = 255 * value;
			affectedShapes[f].lifespan = newLifeSpan;
		}
	}
}

var updatedEase = 0.2;

function assignEase(value){	
	for(var i = 0; i < layers.length; i++){
		for(var f = 0; f < layers[i].shapes.length; f++){
			updatedEase = 1 - value;
			updatedEase = updatedEase  == 0 ? 0.1 : updatedEase;
			layers[i].shapes[f].ease = updatedEase;
		}
	}
}
		
function newLocationTarget(layer, velocity, easeStatus, arrangement){
	// go get the right array for the layer I want to interact with
	var array = getArrayForLayer(layer);	
	updateSustainForLayer(array, velocity);
	// do the following only if the array is populated to avoid errors
	if(array.length > 0){
		// go through each shape in the array
		for(var i = 0; i < array.length; i++){
			// here starts method's specific logic 
			if (velocity > 0){	
				// enable easing for moving
				array[i].moving = easeStatus;
				// assign ease value
				// array[i].ease = velocity / 128;
				// pick a position where to send the object
				switch (arrangement){
					case "roam":
						var locationX = positions[Math.floor((Math.random() * 2))];
						var locationY = positions[Math.floor((Math.random() * 2))];
					break;
					case "reset":
						var locationX = -(array[i].targetLocation.x - array[i].locationGenesis.x);
						var locationY = -(array[i].targetLocation.y - array[i].locationGenesis.y);
						array[i].rotation = 0;
						array[i].targetRotation = 0;
						array[i].scale.x = 1;
						array[i].scale.y = 1;
						array[i].targetScale.x = 1;
						array[i].targetScale.y = 1;
						// array[i].targetSize = array[i].sizeGenesis;
					break;
					default:
				}
				// check bounds. this also assigns the values to the right object properites
				array[i].checkBounds(locationX, locationY);
			}
		}
	}
}

function newRotationTarget(layer, velocity, easeStatus){
	// go get the right array for the layer I want to interact with
	var array = getArrayForLayer(layer);
	// do the following only if the array is populated to avoid errors
	if(array.length > 0){
		// go through each shape in the array
		for(var i = 0; i < array.length; i++){
			// here starts method's specific logic 
			if (velocity > 0){	
				// enable easing for moving
				array[i].rotating = easeStatus;
				// assign ease value
				// array[i].ease = velocity / 128;
				// check bounds. this also assigns the values to the right object properites
				array[i].rotation = array[i].targetRotation;
				// array[i].targetRotation += angle * randomDirection;
				array[i].targetRotation += 90;
			}
		}
	}
}

function newScaleTarget(layer, velocity, easeStatus, arrangement){
	// go get the right array for the layer I want to interact with
	var array = getArrayForLayer(layer);
	// do the following only if the array is populated to avoid errors
	if(array.length > 0){
		// go through each shape in the array
		for(var i = 0; i < array.length; i++){
			// here starts method's specific logic 
			if (velocity > 0){	
				// enable easing for moving
				array[i].scaling = easeStatus;
				// assign ease value
				// array[i].ease = velocity / 128;
				// pick a position where to send the object
				switch (arrangement){
					case "random":
						var scaleWidthRange = array[i].boundsWidth / increment;
						var scaleHeightRange = array[i].boundsHeight / increment;
						// here I'm forcing scale factors to scale the shape so it's always an even multiple of increment
						// this of course creates issues when the bound width or height are only divisible by 2 increments 
						var newWidthScale = (Math.ceil( Math.random() * scaleWidthRange / 2 ) * 2) / scaleWidthRange;
						var newHeightScale = (Math.ceil( Math.random() * scaleHeightRange / 2 ) * 2) / scaleHeightRange;
					break;
					default:
				}
				// check bounds. this also assigns the values to the right object properites
				array[i].targetScale.x = newWidthScale;
				array[i].targetScale.y = newHeightScale;
			}
		}
	}
}

var updatedDecay = 40;

function updateLifeDecay(value){
	updatedDecay = (1.01 - value) * 255;

	if(layer1.shapes.length > 0){
		for(var i = 0; i < layer1.shapes.length; i++){
			layer1.shapes[i].lifeDecay = updatedDecay;
		}
	}
	if(layer2.shapes.length > 0){
		for(var i = 0; i < layer2.shapes.length; i++){
			layer2.shapes[i].lifeDecay = updatedDecay;
		}
	}
	if(layer3.shapes.length > 0){
		for(var i = 0; i < layer3.shapes.length; i++){
			layer3.shapes[i].lifeDecay = updatedDecay;
		}
	}
	if(layer4.shapes.length > 0){
		for(var i = 0; i < layer4.shapes.length; i++){
			layer4.shapes[i].lifeDecay = updatedDecay;
		}
	}
}


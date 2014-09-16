var SD = {};

SD.LINE_SPEC = {
  svgTag: 'g', 
  x1: 10, y1: 20, x2: 80, y2: 90, 
  color: 'black',
  style: '-',
  width: '2px'
}

SD.NUMBER_OF_SEGMENTS_IN_FUNCTIONGRAPH = 600;
SD.FUNCTION_GRAPH_SPEC = {
  f: function(x) {
    return 4*x*(1-x/100)
  },
  numberOfSegments: SD.NUMBER_OF_SEGMENTS_IN_FUNCTIONGRAPH,
  color: 'black',
  style: "-",
  pointSize: "1px",
  width: "2px"
}

SD.generateIdentificator = function() {
  return Math.random().toString();
};

SD.objectCloner = function (objProto, spec) {
  var newObject = Object.create(objProto);
  if (spec) {
    for (var field in spec) {
      newObject[field] = spec[field];
    }
  }
  return newObject;
}

SD.rangeMaker = function(spec) {
  var rangeProto = {
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100
  };
  return SD.objectCloner(rangeProto, spec);
}

SD.elementMaker = function(spec) {
  var elementProto = {
    parent: null,
    children: [],
    range: SD.rangeMaker(),
    color:null,
    svgElement: null,
    svgTag: "g",
    svgAttributes: {},
    htmlClasses: ["Element"]
  }
  elementProto.identificator = SD.generateIdentificator();
  var newElement = SD.objectCloner(elementProto, spec);
  newElement.add = function(element) {
    this.children.push(element);
    element.parent = this;
    return this;
  };
  newElement.removeChild = function(element) {
    var index = this.children.indexOf(element);
    if (index > -1) {
      this.children.splice(index, 1);
      element.parent = null;
    }
  };

  newElement.xRange = function() {return this.range.xMax - this.range.xMin};
  newElement.yRange = function() {return this.range.yMax - this.range.yMin};

  newElement.svgRemoveChild = function(element) {
    if (this.svgElement && element.svgElement && element.svgElement.parentNode == this.svgElement ) {
      this.svgElement.removeChild(element.svgElement) // quita del dibujo
      //this.removeChild(element); // quita de la lista de hijos
    }
  };

  newElement.svgRemoveChildren = function () {
    if(this.svgElement) {
      while (this.svgElement.children.length != 0) {
	this.svgElement.removeChild(this.svgElement.children[0]);
      }
    }
  }

  newElement.updateSVG = function() {
    if (!this.svgElement) {
      this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", this.svgTag);
    }
    this.svgElement.setAttribute('id', this.identificator);
    for (var i=0; i < this.htmlClasses.length; i++) {
      this.svgElement.classList.add(this.htmlClasses[i])
    } 
    for (var attr in this.svgAttributes) {
      this.svgElement.setAttribute(attr, this.svgAttributes[attr]);
    }
    if (this.color) {
      this.svgElement.setAttribute("stroke",this.color);
    }
    
    //if (this.svgElement.parentNode && this.svgElement.tagName != this.svgTag) we should change parentNode.child
    //	var parent = this.svgElement.parentNode;
    //	parent.removeChild(this.svgElement);
    //	this.svgElement = newSVGElement;
    //	parent.appendChild(this.svgElement);
  };
  
  newElement.appendSVG = function(other) {
    if (this.svgElement==null) {
      this.updateSVG();
    }
    if (other.svgElement) {
      this.svgElement.appendChild(other.svgElement);
    }
    else if (other instanceof HTMLElement || other instanceof SVGElement) {
      this.svgElement.appendChild(other);
    };
  };

  newElement.plotSVG = function() {
    this.svgRemoveChildren();
    this.updateSVG();
    //this.children.forEach(function(element) {element.plotSVG()});
    //this.children.forEach(function(element) {this.appendSVG(element)});
    for (var i=0;i<this.children.length;i++) {
      this.children[i].plotSVG();
      this.appendSVG(this.children[i]);
    }
  };
  return newElement;
};

SD.sceneMaker = function(spec) {
  var sceneProto = SD.elementMaker();
  sceneProto.div = null;
  sceneProto.svgTag="svg";
  sceneProto.svgAttributes['style']='max-height:100%; max-width:100%;';

  newScene = SD.objectCloner(sceneProto, spec);

  newScene.updateSVG = function() {
    sceneProto.updateSVG.call(this);
    if (this.div) {
      this.div.appendChild(this.svgElement);
    };
    var viewBox = ''+this.range.xMin+' '+(-this.range.yMax)+' ' +this.xRange() + ' ' +this.yRange(); 
    this.svgElement.setAttribute("viewBox", viewBox);
  }
  return newScene;
};

SD.circleMaker = function(spec) {
  var circleProto = SD.elementMaker();
  circleProto.svgTag = "circle";
  circleProto.x = 50;
  circleProto.y = 50;
  circleProto.r = 50;
  var newCircle = SD.objectCloner(circleProto, spec);

  newCircle.updateSVG = function() {
    circleProto.updateSVG.call(this);
    this.svgElement.setAttribute("cx", this.x);
    this.svgElement.setAttribute("cy", - this.y);
    this.svgElement.setAttribute("r", this.r);
  }
  return newCircle;
}

SD.lineMaker = function(spec) {
  var lineProto = SD.elementMaker(SD.LINE_SPEC);
  var newLine   = SD.objectCloner(lineProto, spec);
  
  newLine.updateSVG = function() {
    lineProto.updateSVG.call(this);

    var line=document.createElementNS("http://www.w3.org/2000/svg", 'line');

    line.setAttribute("vector-effect","non-scaling-stroke");
    line.setAttribute("stroke", this.color);
    line.setAttribute("stroke-width", this.width);
    line.setAttribute("x1", this.x1);
    line.setAttribute("y1", -this.y1);
    line.setAttribute("x2", this.x2);
    line.setAttribute("y2", -this.y2);

    switch (this.style) {
      case '--': case '-->': case '--<': case '<--': case '>--': case '<-->': case '<--<': case '>-->': case 'case: >--<':
      line.setAttribute("stroke-dasharray", "2,2");
      break;
    }

    this.appendSVG(line);

    //////////////// ARROW POINT /////////////////////
    var xRange = this.x2 - this.x1;
    var yRange = this.y2 - this.y1;
    var theta1 = Math.atan2(yRange, xRange) + Math.PI;
    var theta2 = Math.atan2(yRange, xRange);
    var arrowColor;
    var arrowPoint1;
    var arrowPoint2;

    if(this.arrowColor) arrowColor = this.arrowColor;
    else                arrowColor = this.color;

    if(this.arrowSize)  arrowSize  = this.arrowSize;
    else                arrowSize  = 15;

    switch (this.style) {
      case '->':
      case '-->':
        arrowPoint2 = true;
        break;
      case '<-':
      case '<--':
        arrowPoint1 = true;
        break;
      case '-<':
      case '--<':
        arrowPoint2 = true;
        theta2 = theta1;
        break;
      case '>-':
      case '>--':
        arrowPoint1 = true;
        theta1 = theta2;
        break;
      case '<->':
      case '<-->':
        arrowPoint1 = true
        arrowPoint2 = true;
        break;
      case '<-<':
      case '<--<':
        arrowPoint1 = true
        arrowPoint2 = true;
        theta2 = theta1;
        break;
      case '>->':
      case '>-->':
        arrowPoint1 = true
        arrowPoint2 = true;
        theta1 = theta2;
        break;
      case '>-<':
      case '>--<':
        arrowPoint1 = true
        arrowPoint2 = true;
        theta2 = theta1;
        theta1 += Math.PI;
        break;
    }

    if (arrowPoint1) {
      arrowPoint1 = SD.arrowPointMaker({x: this.x1, y: this.y1, theta: theta1, color: arrowColor, size:arrowSize});
      arrowPoint1.plotSVG();
      this.appendSVG(arrowPoint1);
    }
    if (arrowPoint2) {
      arrowPoint2 = SD.arrowPointMaker({x: this.x2, y: this.y2, theta: theta2, color: arrowColor, size:arrowSize});
      arrowPoint2.plotSVG();
      this.appendSVG(arrowPoint2);
    }

  }
  return newLine;
}

SD.arrowPointMaker = function(spec) {
  var arrowPointProto = SD.elementMaker();
  arrowPointProto.x = 50;
  arrowPointProto.y = 50;
  arrowPointProto.theta = 0;
  arrowPointProto.color = 'black';
  arrowPointProto.size = 15;
  var newArrowPoint = SD.objectCloner(arrowPointProto, spec);
  newArrowPoint.updateSVG = function() {
    arrowPointProto.updateSVG.call(this);

    var lineUp=document.createElementNS("http://www.w3.org/2000/svg", 'line');
    var lineDown=document.createElementNS("http://www.w3.org/2000/svg", 'line');

    var alpha = Math.PI/12;
    var betaUp =  alpha + this.theta + Math.PI;
    var betaDown = -alpha + this.theta + Math.PI;

    var x1 = this.x + this.size*Math.cos(betaUp);
    var y1 = this.y + this.size*Math.sin(betaUp);
    var x2 = this.x;
    var y2 = this.y;

    lineUp.setAttribute("vector-effect","non-scaling-stroke");
    lineUp.setAttribute("stroke", this.color);
    lineUp.setAttribute("x1", x1);
    lineUp.setAttribute("y1", -y1);
    lineUp.setAttribute("x2", x2);
    lineUp.setAttribute("y2", -y2);

    var x1 = this.x + this.size*Math.cos(betaDown);
    var y1 = this.y + this.size*Math.sin(betaDown);

    lineDown.setAttribute("vector-effect","non-scaling-stroke");
    lineDown.setAttribute("stroke", this.color);
    lineDown.setAttribute("x1", x1);
    lineDown.setAttribute("y1", -y1);
    lineDown.setAttribute("x2", x2);
    lineDown.setAttribute("y2", -y2);

    this.appendSVG(lineUp);
    this.appendSVG(lineDown);
  }
  return newArrowPoint;
};

SD.pointMaker = function(spec) {
  var pointProto = SD.circleMaker({r:'1'});
  var newPoint=SD.objectCloner(pointProto, spec);
  newPoint.updateSVG = function() {
    pointProto.updateSVG.call(this);
    // this.svgElement.setAttribute("vector-effect", "non-scaling-stroke");
    // this.svgElement.setAttribute("stroke-width", "1px");
    this.svgElement.setAttribute("stroke", "none");
    this.svgElement.setAttribute("fill", this.color);
  }
  return newPoint;
};

SD.functionGraphMaker = function(spec) {
  var functionGraphProto = SD.elementMaker(SD.FUNCTION_GRAPH_SPEC);
  functionGraphProto.htmlClasses.push("FunctionGraph");
  newFunctionGraph = SD.objectCloner(functionGraphProto, spec);

  newFunctionGraph.updateSVG = function() {
    functionGraphProto.updateSVG.call(this);
    var x1, x2, y1, y2;
    x1 = null;

    if (this.style == ".") {
      var point;
      for (var i=0; i<=this.numberOfSegments; i++) {	
	x2 = this.range.xMin + i*this.xRange()/this.numberOfSegments;
	y2 = this.f(x2);
	if (y2 <= this.range.yMax && y2 >= this.range.yMin) {
	  point = SD.circleMaker({x:x2,y:y2, r:this.pointSize, color:this.color});
	  point.plotSVG();
	  this.appendSVG(point);
	}
      }
    }
    else if (this.style == "-") {
      var line;
      for (var i=0; i<=this.numberOfSegments; i++) {
	x2 = this.range.xMin + i*this.xRange()/this.numberOfSegments;
	y2 = this.f(x2);
	if (y2 <= this.range.yMax && y2 >= this.range.yMin) {
	  if (x1 != null) {
	    line = SD.lineMaker({x1:x1,y1:y1,x2:x2,y2:y2, color:this.color, width:this.width});
	    line.plotSVG();
	    this.appendSVG(line);
	  }
	  x1=x2;
	  y1=y2;
	}
	else x1 = null;
      }
    }
    else if (this.style == "-p") {

      var x = this.range.xMin;
      var y = this.f(x);
      var deltaX = this.xRange()/this.numberOfSegments;
      var d = "M" + x + " " + (-y) + " ";
      var jump=true;

      for (var i=1; i<=this.numberOfSegments; i++) {
	x += deltaX;
	y  = this.f(x);

	if (y <= this.range.yMax && y >= this.range.yMin) {
	  if(jump) d += "M";
	  else     d += "L";
	  d += "" + x + " " + (-y) + " ";
	  jump = false;
	}
	else {
	  jump = true;
	}
      }

      var path = SD.elementMaker();
      path.svgTag = "path";
      path.svgAttributes["fill"] = "none";
      path.svgAttributes["d"] = d;
      path.svgAttributes["vector-effect"] = "non-scaling-stroke";
      path.svgAttributes["stroke-width"] = this.width;
      path.color = this.color;
      path.plotSVG();
      this.appendSVG(path);
    }
  }
  return newFunctionGraph;
}



SD.pathMaker = function(spec) {
  var pathProto = SD.elementMaker();
  pathProto.svgAttributes["fill"] = "none";
  pathProto.color = "black";
  pathProto.range = {xMin: 0, xMax:100, yMin: 0, yMax: 100};
  pathProto.x = [10, 90, 50];
  pathProto.y = [10, 10, 90];
  pathProto.width = "2px";
  pathProto.closed = false;
  pathProto.htmlClasses.push("Path");
  newPath = SD.objectCloner(pathProto, spec);

  newPath.updateSVG = function() {
    pathProto.updateSVG.call(this);

    var defs = SD.elementMaker({svgTag: 'defs'});
    var clip = SD.elementMaker({svgTag: 'clipPath'});
    var rect = SD.elementMaker({svgTag: 'rect'});
    var path = SD.elementMaker({svgTag: 'path'});

    var x      =  this.range.xMin;
    var y      = -this.range.yMax;
    var width  =  this.range.xMax - this.range.xMin;
    var height =  this.range.yMax - this.range.yMin;

    rect.svgAttributes["width"]  =  width;
    rect.svgAttributes["height"] =  height;
    rect.svgAttributes["x"]      =  x;
    rect.svgAttributes["y"]      =  y;

    var d = 'M' + this.x[0] + ' ' + (-this.y[0]);
    for(var i=1; i<this.x.length; i++) {
      d+=' L' + this.x[i] + ' ' + (-this.y[i]);
    }
    if(this.closed) d+= 'Z';
    path.svgAttributes["d"] = d;
    path.svgAttributes["clip-path"] = "url(#" + clip.identificator + ")";
    path.svgAttributes["stroke-width"] = this.width;
    path.svgAttributes["stroke"] = this.color;


    defs.plotSVG();
    clip.plotSVG();
    rect.plotSVG();
    path.plotSVG()
    
    this.appendSVG(defs);
    defs.appendSVG(clip);
    clip.appendSVG(rect);
    this.appendSVG(path);

  }
  return newPath;
}

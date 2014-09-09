var SD = {};


SD.LINE_SPEC = {svgTag:"line", x1: 10, y1: 20, x2: 80, y2: 90}

SD.NUMBER_OF_SEGMENTS_IN_FUNCTIONGRAPH = 600;
SD.FUNCTION_GRAPH_SPEC = {
  f: function(x) {
    return 4*x*(1-x/100)
  },
  numberOfSegments: SD.NUMBER_OF_SEGMENTS_IN_FUNCTIONGRAPH,
  color: null,
  style: "-"
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
    this.children.forEach(function(element) {element.plotSVG()});
    //this.children.forEach(function(element) {this.appendSVG(element)});
    for (var i=0;i<this.children.length;i++) {
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
  var newLine = SD.objectCloner(lineProto, spec);
  newLine.color = "black";
  newLine.svgAttributes["vector-effect"]="non-scaling-stroke";
  newLine.updateSVG = function() {
    lineProto.updateSVG.call(this);
    this.svgElement.setAttribute("x1", this.x1);
    this.svgElement.setAttribute("y1", -this.y1);
    this.svgElement.setAttribute("x2", this.x2);
    this.svgElement.setAttribute("y2", -this.y2);
  }
  return newLine;
}

SD.pointMaker = function(spec) {
  var pointProto = SD.circleMaker({r:1});
  var newPoint=SD.objectCloner(pointProto, spec);
  newPoint.updateSVG = function() {
    pointProto.updateSVG.call(this);
    this.svgElement.setAttribute("vector-effect", "non-scaling-stroke");
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
    for (var i=0; i<=this.numberOfSegments; i++) {	
      x2 = this.range.xMin + i*this.xRange()/this.numberOfSegments;
      y2 = this.f(x2);
      if (y2 <= this.range.yMax && y2 >= this.range.yMin) {
	if (this.style == ".") {
	  var point = SD.pointMaker({x:x2,y:y2});
	  if (this.color) {
	    point.color = this.color;
	  }
	  point.plotSVG();
	  this.appendSVG(point);
	  //this.add(point);
	}
	else if (this.style == "-") {
	  if (x1 != null) {
	    var line = SD.lineMaker({x1:x1,y1:y1,x2:x2,y2:y2});
	    if (this.color) {
	      line.color = this.color;
	    }
	    if (this.width) {
	      line.svgAttributes["stroke-width"] = this.width;
	    }
	    line.plotSVG();
	    this.appendSVG(line);
	    //this.add(line);
	  }
	  x1=x2;
	  y1=y2;
	}
      }
      else x1 = null;
    }
  }
  return newFunctionGraph;
}

/////////////////////////////////////////////

function Flecha(x1,y1,x2,y2, identificator) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.xRange = this.x2 - this.x1;
  this.yRange = this.y2 - this.y1;
  this.cosTheta = this.xRange / Math.sqrt(this.xRange*this.xRange + this.yRange*this.yRange);
  this.senTheta = this.yRange / Math.sqrt(this.xRange*this.xRange + this.yRange*this.yRange);
  this.size = 20;
  this.anchura = 1/3;

  this.remove = function() {
    var flecha = this.svg().getElementById('flecha' + identificator);
    if(flecha) { this.svg().removeChild(flecha); };
    var punta1 = this.svg().getElementById('punta1_' + identificator);
    if(punta1) { this.svg().removeChild(punta1); };
    var punta2 = this.svg().getElementById('punta2_' + identificator);
    if(punta2) { this.svg().removeChild(punta2); };
  }

  this.plot = function() {
    this.remove();

    // Esto lo declaro dentro de plot porque sino, los cambios en size no se reflejan
    this.sizeX = this.size * this.cosTheta;
    this.sizeY = this.size * this.senTheta;
    
    // Linea de la flecha
    var flecha =  document.createElementNS("http://www.w3.org/2000/svg", "line");
    flecha.setAttribute('id', 'flecha' + identificator);
    flecha.setAttribute('x1',  this.x1);
    flecha.setAttribute('y1', -this.y1); // Recordar que las coordenadas van al reves
    flecha.setAttribute('x2',  this.x2);
    flecha.setAttribute('y2', -this.y2);
    flecha.setAttribute('style', "stroke:#00aa00;stroke-width:2px");
    
    this.svg().appendChild(flecha);


    // Punta de la flecha
    var punta1 =  document.createElementNS("http://www.w3.org/2000/svg", "line");
    punta1.setAttribute('id',  'punta1_' + identificator);
    punta1.setAttribute('x1',   this.x2-this.sizeX + this.sizeY*this.anchura);
    punta1.setAttribute('y1', -(this.y2-this.sizeY + this.sizeX*this.anchura)); // Recordar que las coordenadas van al reves
    punta1.setAttribute('x2',   this.x2);
    punta1.setAttribute('y2', - this.y2);
    punta1.setAttribute('style', "stroke:#00aa00;stroke-width:2px");

    var punta2 =  document.createElementNS("http://www.w3.org/2000/svg", "line");
    punta2.setAttribute('id',  'punta2_' + identificator);
    punta2.setAttribute('x1',   this.x2-this.sizeX - this.sizeY*this.anchura);
    punta2.setAttribute('y1', -(this.y2-this.sizeY - this.sizeX*this.anchura)); // Recordar que las coordenadas van al reves
    punta2.setAttribute('x2',   this.x2);
    punta2.setAttribute('y2', - this.y2);
    punta2.setAttribute('style', "stroke:#00aa00;stroke-width:2px");
    
    this.svg().appendChild(punta1);
    this.svg().appendChild(punta2);

  }
}

//Flecha.prototype = new SceneElement();


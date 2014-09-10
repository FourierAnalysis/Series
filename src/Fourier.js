var SH_PI = 1/2 * (Math.exp(Math.PI) - Math.exp(-Math.PI));
var CH_PI = 1/2 * (Math.exp(Math.PI) + Math.exp(-Math.PI));
var TOPE_SUPERIOR =30;
var TOPE_INFERIOR = 0;
var OFFSETY2 = 0;

var divEscena = document.getElementById('divEscena');
var divEscenaError = document.getElementById('divEscenaError');
var scene;
var sceneError;
var sceneRange;
var sceneErrorRange;

var ejeY1, ejeY2, ejeX1, ejeX2;
var ejes;

var funcionOriginal;
var specFuncionOriginal;
var funcionAproximacion;
var specFuncionAproximacion;
var funcionError;
var specFuncionError;

var amplitud=3;
var integral; // I = 1/2pi int_-pi^pi f^2, para el error.
var sumaParcial;
var ordenAproximacion;

sceneRange = SD.rangeMaker({xMin: -3*Math.PI+0.1, xMax: 3*Math.PI-0.1, yMin: -5.5, yMax: 5.5});
sceneErrorRange = SD.rangeMaker({xMin: -3*Math.PI+0.1, xMax: 3*Math.PI-0.1, yMin: -1, yMax: 4});

scene = SD.sceneMaker({div: divEscena, range: sceneRange});
sceneError = SD.sceneMaker({div: divEscenaError, range:sceneErrorRange});



// DIBUJO INICIAL
creaEjes();
creaSierra();
creaError();
dibuja();
actualizaTexto();



var aumenta = function () {
  if(funcionAproximacion.ordenAproximacion < TOPE_SUPERIOR)  funcionAproximacion.ordenAproximacion++;

  actualizaTexto();
  scene.plotSVG();
  sceneError.plotSVG();
}


var disminuye = function () {
  if(funcionAproximacion.ordenAproximacion > TOPE_INFERIOR ) funcionAproximacion.ordenAproximacion--;

  actualizaTexto();
  scene.plotSVG();
  sceneError.plotSVG();
}

function aproxima(nombre) {

  borra();

  if      (nombre == 'Tren')
    creaTren();
  else if (nombre == 'Sierra')
    creaSierra();
  else if (nombre == 'Exponencial')
    creaExponencial();

  creaError();
  dibuja();
  actualizaTexto();

}


function creaEjes () {
  ejes1 = SD.elementMaker();
  ejes2 = SD.elementMaker();
  ejeX1 = SD.lineMaker({x1: sceneRange.xMin, x2: sceneRange.xMax, y1: 0 , y2: 0})
  ejeX2 = SD.lineMaker({x1: sceneErrorRange.xMin, x2: sceneErrorRange.xMax, y1: OFFSETY2 , y2: OFFSETY2 });
  ejeY1 = SD.lineMaker({y1: sceneRange.yMin, y2: sceneRange.yMax, x1: 0, x2: 0});
  ejeY2 = SD.lineMaker({y1: sceneErrorRange.yMin, y2: sceneErrorRange.yMax, x1: 0, x2: 0});

  ejeX1.svgAttributes["stroke-dasharray"] = "5,5";
  ejeX2.svgAttributes["stroke-dasharray"] = "5,5";
  ejeY1.svgAttributes ["stroke-dasharray"] = "5,5";
  ejeY2.svgAttributes ["stroke-dasharray"] = "5,5";

  ejes1.add(ejeX1);
  ejes1.add(ejeY1);
  ejes2.add(ejeX2);
  ejes2.add(ejeY2);
}

function creaTren () {


  // Original
  specFuncionOriginal = {
    f: function (x) {
      return amplitud*Math.pow(-1, Math.floor(x/Math.PI));
    },
    integral: 1,
    width: "3px",
    originalCode:"$$f(t) = \\begin{cases} -1 &\\text{si } t\\in\\left[k\\pi,(k+1)\\pi\\right)\\quad\\text{para }k\\in\\mathbb{Z}\\text{ impar}\\\\     +1  & \\text{si } t\\in\\left[k\\pi,(k+1)\\pi\\right)\\quad\\text{para }k\\in\\mathbb{Z}\\text{ par}.  \\end{cases}$$"
  };

  funcionOriginal = SD.elementMaker(specFuncionOriginal);
  funcionOriginal.htmlClasses.push("funcionOriginal");
  
  for(var i=-3; i<3; i++) {
    var linea = SD.lineMaker({x1:i*Math.PI, x2:(i+1)*Math.PI, y1: amplitud*Math.pow(-1, i), y2: amplitud*Math.pow(-1, i) });
   linea.htmlClasses.push("funcionOriginal");
    funcionOriginal.add(linea);
    if(i!=2) {
      linea = SD.lineMaker({x1:(i+1)*Math.PI, x2:(i+1)*Math.PI, y1: -amplitud , y2: amplitud });
      linea.htmlClasses.push("funcionOriginal");
      funcionOriginal.add(linea);
    }
  }


  // Aproximacion
  specFuncionAproximacion = {
    ordenAproximacion: 1,
    a: function(n) {
      if(n==0) return 0;
      else     return 0;
    },
    b: function(n) {
      if(n==0) return 0;
      else     return (n%2)*4/(Math.PI*n);
    },
    initialCode: "\\frac{4}{\\pi} & \\left(  ",
    finalCode: "\\right)",
    anText: function(n) {
      if(n==0) return "";
      else     return "";
    },
    bnText: function(n) {
      if(n==0) return "";
      else 
	if (n%2) {
	  var code;
	  if ((n%6) == 1 && n != 1) code = "\\right. \\\\ & \\  \\left.";
	  else                      code = "";
	  if(n == 1)
	    code += "\\sin(t)";
	  else
	    code += "+\\frac{1}{"+n+"} \\sin("+n+"t)";
	  return code;
	}
        else
	  return "";
    },
    f: function(x) {
      var c = 0;
      for(var i=0; i<= this.ordenAproximacion; i++) {
	c += this.a(i)*Math.cos(i*x) + this.b(i)*Math.sin(i*x);
      }
      return amplitud*c;
    },
    range: sceneRange,
    color: '#1e88ab',
    sumaParcial: function () {
      return sumaParcialCuadrado (this.a, this.b, this.ordenAproximacion);
    },
    width: "3px"
  }

  funcionAproximacion = SD.functionGraphMaker(specFuncionAproximacion);

}


function creaSierra () {

  // Original
  specFuncionOriginal = {
    g: function (x) {
      return x-2*Math.PI*Math.floor((x+Math.PI)/(2*Math.PI))
    },
    f: function (x) {
      return amplitud * this.g(x) / Math.PI;
    },
    integral: Math.PI*Math.PI/3,
    originalCode:"$$f(t) = \\begin{cases} t &\\text{si } t\\in\\left[-\\pi,\\pi\\right)\\\\     f(t+2\\pi)=f(t)  & \\text{en otro caso.}  \\end{cases}$$"
  }
  funcionOriginal = SD.elementMaker(specFuncionOriginal);

  for(var i=0; i<3; i++) {
    var linea = SD.lineMaker({x1:(2*i-3)*Math.PI, x2:(2*i-1)*Math.PI, y1: -amplitud, y2:amplitud});
    linea.htmlClasses.push("funcionOriginal");
    
    funcionOriginal.add(linea);
    if(i!=2) {
      linea = SD.lineMaker({x1:(2*i-1)*Math.PI, x2:(2*i-1)*Math.PI, y1: -amplitud, y2: amplitud});
      linea.htmlClasses.push("funcionOriginal");
      funcionOriginal.add(linea);
    }
  };

  // Aproximacion
  specFuncionAproximacion = {
    ordenAproximacion: 1,
    a: function(n) {
      if(n==0) return   0;
      else     return   0;
    },
    b: function(n) {
      if(n==0) return 0;
      else     return 2*Math.pow(-1, n+1)/n;
    },
    initialCode: "2 & \\left(  ",
    finalCode: "\\right)",
    anText: function(n) {
      if(n==0) return "";
      else     return "";
    },
    bnText: function(n) {
      if(n==0) return "";
      else {
	var code;

	if ((n%4) == 1 && n != 1)  code = "\\right. \\\\ \  & \\left.";
	else                       code = "";

	if(n == 1)
	  code += "\\sin(t)";
	else {
	  if (n % 2)
	    code += "+";
          else
	    code += "-";
	  code += " \\frac{1}{"+n+"} \\sin("+n+"t)";
	}
	return code;
      }
    },
    f: function(x) {
      var a = 0;
      for(var i=0; i<= this.ordenAproximacion; i++) {
	a += this.a(i)*Math.cos(i*x) + this.b(i)*Math.sin(i*x);
      }
      return amplitud/ Math.PI * a;
    },
    range: sceneRange,
    color: "#1e88ab",
    sumaParcial: function () {
      return sumaParcialCuadrado (this.a, this.b, this.ordenAproximacion);
    },
    width: "3px"
  }
  funcionAproximacion = SD.functionGraphMaker(specFuncionAproximacion);
}

function creaExponencial () {

  // Original
  specFuncionOriginal = {
    g: function(x) {
      return  x - 2*Math.PI*Math.floor((x+Math.PI)/(2*Math.PI));
    },
    h: function(x) {
      return Math.exp(x)-SH_PI/Math.PI;
    },
    f: function(x) {
      return 1/4 * this.h( this.g(x) );
    },
    range: sceneRange,
    integral: SH_PI * (Math.PI * CH_PI - SH_PI) / (Math.PI * Math.PI),
    width: "2px",
    color: '#101010',
    originalCode:"$$f(t) = \\begin{cases} e^t - \\frac{\\sinh \\pi}{\\pi} &\\text{si } t\\in\\left[-\\pi,\\pi\\right)\\\\     f(t+2\\pi)=f(t)  & \\text{en otro caso.}  \\end{cases}$$"
  }


  funcionOriginal = SD.functionGraphMaker(specFuncionOriginal);

  // Aproximacion
  specFuncionAproximacion = {
    ordenAproximacion: 1,
    a: function(n) {
      if(n==0) return   0;
      else     return   Math.pow(-1, n)*2*SH_PI / ((n*n+1)*Math.PI);
    },
    b: function(n) {
      if(n==0) return 0;
      else     return - Math.pow(-1, n)*2*n*SH_PI / ((n*n+1)*Math.PI);
    },
    initialCode: "2 \\frac{\\sinh \\pi}{\\pi} & \\left(  ",
    finalCode: "\\right)",
    anText: function(n) {
      if(n==0) return "";
      else  {
	var code;

	if ((n%2) == 1 && n != 1)  code = "\\right. \\\\ \  & \\left.";
	else                       code = "";

	if(n == 1)
	  code += "-\\frac{1}{2}\\cos(t)";
	else {
	  if (n % 2)
	    code += "-";
          else
	    code += "+";
	  code += "\\frac{1}{"+(n*n+1)+"}\\cos("+n+"t)";
	}
	return code;
      }
    },
    bnText: function(n) {
      if(n==0) return "";
      else  {
	var code="";

	if(n == 1)
	  code += "+\\frac{1}{2}\\sin(t)";
	else {
	  if (n % 2)
	    code += "+";
          else
	    code += "-";
	  code += "\\frac{"+n+"}{"+(n*n+1)+"}\\sin("+n+"t)";
	}
	return code;
      }
    },
    f: function(x) {
      var a = 0;
      for(var i=0; i<= this.ordenAproximacion; i++) {
	a += this.a(i)*Math.cos(i*x) + this.b(i)*Math.sin(i*x);
      }
      return 1/4 * a;
    },
    range: sceneRange,
    color: '#1e88ab',
    sumaParcial: function () {
      return sumaParcialCuadrado (this.a, this.b, this.ordenAproximacion);
    },
    width: "3px"
  }
  funcionAproximacion = SD.functionGraphMaker(specFuncionAproximacion);

}


function creaError () {

  var specFuncionError = {
    f: function(x) {
      return Math.abs(funcionAproximacion.f(x) - funcionOriginal.f(x))+OFFSETY2;
    },
    range: sceneRange,
    color: 'DarkViolet',
    width: "2px"
  }
  funcionError = SD.functionGraphMaker(specFuncionError);
  //console.log(errorMedio());
}


function dibuja () {
  scene.add(ejes1);  
  sceneError.add(ejes2);
  scene.add(funcionOriginal);
  scene.add(funcionAproximacion);
  sceneError.add(funcionError);

  scene.plotSVG();
  sceneError.plotSVG();
}

function borra () {
  scene.removeChild(funcionOriginal);
  scene.removeChild(funcionAproximacion);
  sceneError.removeChild(funcionError);
}

function sumaParcialCuadrado (a, b, N) {
  var c = a(0)*a(0);
  for (var i=0; i<= N; i++) {
    c += ( a(i)*a(i) + b(i)*b(i) ) / 2;
  }
  return c;
}

function errorMedio () {
  return funcionOriginal.integral - funcionAproximacion.sumaParcial();
}

function actualizaTexto () {
  var divNumeroTerminos = document.getElementById('divNumeroTerminos');
  var divFormula = document.getElementById('divFormula');
  var divFormulaDefinicion = document.getElementById('divFormulaDefinicion');
  var divErrorMedio = document.getElementById('divErrorMedio');

  var f = funcionOriginal;
  var fN = funcionAproximacion
  var N = fN.ordenAproximacion;

  var aproxCode = "f(t) \\approx f_{"+N+"}(t) = ";
  var errorCode = "$$E_{" + N + "} = \\frac{1}{2\\pi} \\int_{-\\pi}^{\\pi} \\left( f(t)-f_{"+N+"}(t) \\right)^2 \\,\\mathrm{d}t = " + errorMedio().toFixed(3) + "$$";
  
  aproxCode += fN.initialCode;
  for (var i=1; i<=N; i++) {
    aproxCode += fN.anText(i) + fN.bnText(i);
  }
  aproxCode += fN.finalCode;
  
  var formulaCode = "$$ \\begin{align*}" + aproxCode + "\\end{align*} $$";

  divFormula.innerHTML = formulaCode;
  divNumeroTerminos.innerHTML = ""+N;
  divFormulaDefinicion.innerHTML = f.originalCode;
  divErrorMedio.innerHTML = errorCode;

  MathJax.Hub.Typeset(); // para renderizar las formulas nuevas
}

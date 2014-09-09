var div = document.getElementById('divCatenaria');
var scene;

var cable = CableLA56;

var conditions1 = new Conditions();
var conditions2 = new Conditions();



var tramo;
var range;
var sceneRange;
var constantes;
var catenariaInicialGraph;
var catenariaNuevaGraph;
var posteIzquierdoGraph;
var posteDerechoGraph;
var construido = false;


var construirDibujo = function (form) {

  //var botonConstruir = 
  document.getElementById("botonConstruir").style.display = 'none';
  document.getElementById("variaciones").style.display = 'block';
  construido = true;

  var span = form.span.value;
  var temperature = form.temperature.value;
  var windPressure = form.windPressure.value;
  var tension = form.tension.value;

  conditions1.span = span;
  conditions1.temperature = temperature;
  conditions1.windPressure = windPressure;
  conditions1.tension = tension;
  
  conditions2.span = span;
  conditions2.temperature = temperature;
  conditions2.windPressure = windPressure;
  
  range      = SD.rangeMaker({xMin: -conditions1.span/2, xMax: conditions1.span/2, yMin: 0, yMax: 35});
  sceneRange = SD.rangeMaker({xMin: -conditions1.span/2-10, xMax: conditions1.span/2+10, yMin: 0, yMax: 40});

  tramo = new Tramo(cable, conditions1, conditions2);
  tramo.sag();

  constantes = resuelveParabola(tramo.a(), -conditions1.span/2,30, conditions1.span/2, 30);
  catenariaInicialGraph = CD.parabolaGraphMaker({a: tramo.a(), c1: constantes[0], c2: constantes[1], range:range});
  catenariaNuevaGraph   = CD.parabolaGraphMaker({a: tramo.a(), c1: constantes[0], c2: constantes[1], range:range});
  posteIzquierdoGraph   = CD.fancyPoleMaker({x: -conditions1.span/2, height: 30});
  posteDerechoGraph     = CD.fancyPoleMaker({x: +conditions1.span/2, height: 30});
  scene = SD.sceneMaker({div: div, range: sceneRange});

  //console.log(scene);
  //console.log(catenariaInicialGraph);

  scene.add(catenariaInicialGraph);
  scene.add(catenariaNuevaGraph);
  scene.add(posteIzquierdoGraph);
  scene.add(posteDerechoGraph);

  scene.plotSVG(posteIzquierdoGraph);
  
};

var actualizarDibujo = function (form) {

  var temperature = form.temperature2.value;
  var windPressure = form.windPressure2.value;

  tramo.finalConditions.temperature = temperature;
  tramo.finalConditions.windPressure = windPressure;

  tramo.finalConditions.tension = tramo.solveChangeEquation();
  
  constantes = resuelveParabola(tramo.a(), -conditions1.span/2,30, conditions1.span/2, 30);

  catenariaNuevaGraph.a = tramo.a();
  catenariaNuevaGraph.c1 = constantes[0];
  catenariaNuevaGraph.c2 = constantes[1];
  catenariaNuevaGraph.color = "turquoise";

  //console.log('catenaria nueva: ', catenariaNuevaGraph);

  scene.plotSVG();
};      

var tablaConstruida = false;
function tableCreate(){
  tablaConstruida = true;
  var body=document.getElementsByTagName('body')[0];
  var tbl=document.createElement('table');
  tbl.style.width='100%';
  tbl.setAttribute('border','1');
  var tbdy=document.createElement('tbody');
  var outputTable = tramo.table(0,40,5);
  var titulo = ['Temperatura (ºC)', 'Tension (N)', 'Flecha (m)']
  var tr=document.createElement('tr');

  for(var i=-1;i<outputTable.length;i++){
    var tr=document.createElement('tr');
    if(i==-1) {
      for(var j=0;j<titulo.length;j++){
	var td=document.createElement('td');
	td.appendChild(document.createTextNode(titulo[j]))
	tr.appendChild(td)
      }
    }
    else {
      for(var j=0;j<outputTable[i].length;j++){
	var td=document.createElement('td');
	td.appendChild(document.createTextNode(outputTable[i][j].toFixed(2)))
	tr.appendChild(td)
      }
    }
    tbdy.appendChild(tr);
  }
  tbl.appendChild(tbdy);
  body.appendChild(tbl)
}

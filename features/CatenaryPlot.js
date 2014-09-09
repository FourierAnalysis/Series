describe("Feature: creating electric lines. As developer, I want to create a scheme of electric line, in order to have a visual representation", function() {
	var div; 
	describe("Scenario: Drawing parabola", function() {
		div = document.getElementById("div0");
		var scene = SD.sceneMaker({div:div});
		var parabolaGraph = CD.parabolaGraphMaker();
		it("Given instances scene and a graph of catenary created", function() {
			expect(true).toBe(true);
		});
		scene.add(parabolaGraph);
		it("and adding the graph to scene.", function() {

		});		
		scene.plotSVG();
		it("Then scene.plotSVG() should produce a graph of a catenary.", function() {
			//var funEl = scene.svgElement.getElementById(catenaryGraph.identificator);
			//expect(funEl).toBe(catenaryGraph.svgElement);
		});
	});
	describe("Scenario: Drawing catenary", function() {
		div = document.getElementById("div1");
		var scene = SD.sceneMaker({div:div});
		var catenaryGraph = CD.catenariaGraphMaker();
		console.log(catenaryGraph)
		it("Given instances scene and a graph of catenary created", function() {
			expect(true).toBe(true);
		});
		scene.add(catenaryGraph);
		it("and adding the graph to scene.", function() {

		});		
		scene.plotSVG();
		it("Then scene.plotSVG() should produce a graph of a catenary.", function() {
			var funEl = scene.svgElement.getElementById(catenaryGraph.identificator);
			expect(funEl).toBe(catenaryGraph.svgElement);
		});
	});
	
	describe("Scenario: Ploting a pole", function() {
		div = document.getElementById("div2");
		var scene = new Scene(div);
		var pole = new Pole(50,0,80);
		it("Given instances scene and a pole created", function() {
			expect(scene instanceof Scene).toBe(true);
			expect(pole instanceof Pole).toBe(true);
		});
		scene.add(pole);
		it("and adding the graph to scene.", function() {
		});
		scene.plotSVG();
		it("Then scene.plotSVG() should produce a pole.", function() {
			var poleElement = scene.svgElement.getElementById(pole.identificator);
			expect(poleElement).toBe(pole.svgElement);
		});
	});

	describe("Scenario: Ploting a fancy pole", function() {
		div = document.getElementById("div3");
		var scene = new Scene(div);
		var pole = new FancyPole(50,0,80);
		it("Given instances scene and a pole created", function() {
			expect(scene instanceof Scene).toBe(true);
			expect(pole instanceof FancyPole).toBe(true);
		});
		scene.add(pole);
		it("and adding the graph to scene.", function() {
		});
		scene.plotSVG();
		it("Then scene.plotSVG() should produce a pole.", function() {
			var poleElement = scene.svgElement.getElementById(pole.identificator);
			expect(poleElement).toBe(pole.svgElement);
		});
	});


	
})

describe("parabolaGraphMaker", function() {
	var parabolaGraph;
	var spec;
	it("should have "+ spec, function() {
		spec = CD.PARABOLA_GRAPH_SPEC;
		parabolaGraph = CD.parabolaGraphMaker();
		for (var key in spec) {
			expect(parabolaGraph[key]).toBe(spec[key]);
		}
	})
})

describe("catenariaGraphMaker", function() {
	var catenariaGraph;
	var spec;
	it("should have "+ spec, function() {
		spec = CD.PARABOLA_GRAPH_SPEC;
		catenariaGraph = CD.catenariaGraphMaker();
		for (var key in spec) {
			expect(catenariaGraph[key]).toBe(spec[key]);
		}
	})
})


describe("new CatenaryGraph()", function() {
	var catenaryGraph;
	beforeEach(function() {
		catenaryGraph = new CatenaryGraph();
	});
	it("should be instance of FunctionGraph", function() {
		expect(catenaryGraph).toBeInstanceOf(FunctionGraph);
	});
	
	describe("#svgElement", function() {
		describe("after calling #plotSVG", function() {
			describe("without parentSceneNode", function() {
				beforeEach(function() {
					catenaryGraph.plotSVG();
				});
				it("should have a 'catenaryGraph' class", function() {
					expect(catenaryGraph.svgElement).toContainClass("catenaryGraph");
				})
			})
		})
	})
})

describe("new Pole()", function() {
	var pole;
	beforeEach(function() {
		pole = new Pole();
	});
	describe("#identificator", function() {
		it("should be truthy", function() {
			expect(pole.identificator).toBeTruthy();
		})
	});
	describe("#updateSVG",function() {
		describe("without  parentSceneNode",function() {
			beforeEach(function() {
				pole.updateSVG();
			});
			it("should create pole.SVGElement", function() {
				expect(pole.svgElement instanceof SVGElement).toBe(true);
			});
		})
		describe("with  parentSceneNode",function() {
			var elements = {
				svgElement: document.createElementNS("http://www.w3.org/2000/svg","g")
			};
			beforeEach(function() {
				pole.parentSceneElement = elements;
				spyOn(pole.parentSceneElement.svgElement, 'appendChild');
				pole.updateSVG();
			});
			it("should call appendChild", function() {
				expect(pole.parentSceneElement.svgElement.appendChild).toHaveBeenCalled();
			})
		})
	});

	describe("#svgElement", function() {
		it("should be null", function() {
			expect(pole.svgElement).toBeNull();
		});
		describe("after calling #plotSVG()",function() {
			describe("without parentSceneNode", function() {
				beforeEach(function() {
					pole.plotSVG();
				});
				it("should have a 'pole' class", function() {
					expect(pole.svgElement).toContainClass("pole");
				});
				it("should have id attribute", function () {
					expect(pole.svgElement.hasAttribute('id')).toBe(true);
				});
				xit("should not be too hight", function() {
					expect(true).toBe(false);
				});
			});
			describe("with parentSceneNode", function() {
				var elements = {
					svgElement: document.createElementNS("http://www.w3.org/2000/svg","g")
				};
				beforeEach(function() {
					pole.parentSceneElement = elements;
					pole.updateSVG();
				});
				it("should have a SVGElement as its value", function() {
					expect(pole.svgElement instanceof SVGElement).toBe(true);
				});
				it("should have elements#svgElement as parent", function() {
					expect(pole.svgElement.parentNode).toBe(elements.svgElement);
				});
			});
		})
	});
			
  describe("#type", function() {
    it("should be null", function() {
      expect(pole.type).toBeNull();
    })
  })
})

describe("pideLongitud", function() {
	it("llama promp", function() {
		spyOn(window, 'prompt');
		pideLongitud();
		expect(prompt).toHaveBeenCalled();
	})
	it("devuelva valor intorducido", function() {
		spyOn(window, 'prompt').and.returnValue(901);
		expect(pideLongitud()).toBe(901);
	})
})


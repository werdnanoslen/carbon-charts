// D3 Imports
import { select, selectAll, mouse } from "d3-selection";
import { area } from "d3-shape";

import { ScatterChart } from "./scatter-chart";
import * as Configuration from "./configuration";
import { ChartConfig, AreaChartOptions, ChartType } from "./configuration";

import { getD3Curve } from "./services/curves";
import { Tools } from "./tools";

export class AreaChart extends ScatterChart {
	areaGeneratorFill: any;
	areaGeneratorStroke: any;

	options: AreaChartOptions;

	constructor(holder: Element, configs: ChartConfig<AreaChartOptions>) {
		super(holder, configs);

		// initialize options
		if (configs.options) {
			this.options = Tools.merge({}, Configuration.options.AREA, configs.options);
		} else {
			this.options = Tools.merge({}, Configuration.options.AREA);
		}

		this.options.type = ChartType.AREA;
	}

	draw() {
		this.innerWrap.style("width", "100%")
			.style("height", "100%");

		const { line: margins } = Configuration.charts.margin;

		this.innerWrap.style("width", "100%").style("height", "100%");

		this.innerWrap.attr("transform", `translate(${margins.left}, ${margins.top})`);

		let curveName;
		let curveOptions;
		this.options.curve = this.options.curve || "curveLinear";
		if (typeof this.options.curve === "string") { // curve: 'string'
			curveName = this.options.curve;
			curveOptions = {};
		} else { // curve: { name: 'string' }
			curveName = this.options.curve.name || "curveLinear";
			curveOptions = this.options.curve;
			delete curveOptions["name"];
		}

		// D3 area generator function
		this.areaGeneratorFill = area()
			.x((d, i) => this.x(this.displayData.labels[i]) + this.x.step() / 2)
			.y1(this.y(0))
			.y0((d: any) => this.y(d))
			.curve(getD3Curve(curveName, curveOptions));

		this.areaGeneratorStroke = area()
			.x((d, i) => this.x(this.displayData.labels[i]) + this.x.step() / 2)
			.y((d: any) => this.y(d))
			.curve(getD3Curve(curveName, curveOptions));

		const gLines = this.innerWrap.selectAll("g.lines")
			.data(this.displayData.datasets)
			.enter()
				.append("g")
				.classed("lines", true);

		gLines.append("path")
			.attr("stroke", d => this.getStrokeColor(d.label))
			.datum(d => d.data)
			.attr("class", "line")
			.attr("data-area-component", "stroke")
			.attr("d", this.areaGeneratorStroke);

		gLines.append("path")
			.attr("fill", d => this.getStrokeColor(d.label))
			.attr("fill-opacity", 0.3)
			.datum(d => d.data)
			.attr("class", "line")
			.attr("data-area-component", "fill")
			.attr("d", this.areaGeneratorFill);

		super.draw();
	}

	interpolateValues(newData: any) {
		const { line: margins } = Configuration.charts.margin;
		const chartSize = this.getChartSize();
		const width = chartSize.width - margins.left - margins.right;
		const height = chartSize.height - this.getBBox(".x.axis").height;

		this.innerWrap.selectAll(".removed")
			.remove();

		// Apply new data to the lines
		const gLines = this.innerWrap.selectAll("g.lines")
			.data(newData.datasets);

		this.updateElements(true, gLines);

		// Add lines that need to be added now
		const addedLineGroups = gLines.enter()
			.append("g")
			.classed("lines", true);

		addedLineGroups.append("path")
			.attr("stroke", d => this.getStrokeColor(d.label))
			.datum(d => d.data)
			.style("opacity", 0)
			.transition(this.getDefaultTransition())
			.style("opacity", 1)
			.attr("class", "line")
			.attr("d", this.areaGeneratorStroke);

		addedLineGroups.append("path")
			.attr("fill", d => this.getStrokeColor(d.label))
			.attr("fill-opacity", 0.3)
			.datum(d => d.data)
			.style("opacity", 0)
			.transition(this.getDefaultTransition())
			.style("opacity", 1)
			.attr("class", "line")
			.attr("d", this.areaGeneratorFill);

		// Remove lines that are no longer needed
		gLines.exit()
			.classed("removed", true) // mark this element with "removed" class so it isn't reused
			.transition(this.getDefaultTransition())
			.style("opacity", 0)
			.remove();

		super.interpolateValues(newData);
	}

	updateElements(animate: boolean, gLines?: any) {
		if (!gLines) {
			gLines = this.innerWrap.selectAll("g.lines");
		}

		const transitionToUse = animate ? this.getFillTransition() : this.getInstantTransition();
		const self = this;
		gLines.selectAll("path.line[data-area-component='fill']")
			.datum(function(d) {
				const parentDatum = select(this.parentNode).datum() as any;

				return parentDatum.data;
			})
			.transition(transitionToUse)
			.style("opacity", 1)
			.attr("fill", function(d) {
				const parentDatum = select(this.parentNode).datum() as any;
				return self.getStrokeColor(parentDatum.label);
			})
			.attr("class", "line")
			.attr("d", this.areaGeneratorFill);
		gLines.selectAll("path.line[data-area-component='stroke']")
			.datum(function(d) {
				const parentDatum = select(this.parentNode).datum() as any;

				return parentDatum.data;
			})
			.transition(transitionToUse)
			.style("opacity", 1)
			.attr("stroke", function(d) {
				const parentDatum = select(this.parentNode).datum() as any;
				return self.getStrokeColor(parentDatum.label);
			})
			.attr("class", "line")
			.attr("d", this.areaGeneratorStroke);

		super.updateElements(animate);
	}
}
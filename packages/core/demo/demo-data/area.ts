import { colors } from "./colors";
import { getTheme } from "./themes";


export const areaData = {
	labels: ["Qty", "More", "Sold", "Restocking", "Misc"],
	datasets: [
		{
			label: "Dataset 1",
			backgroundColors: [colors[0]],
			data: [
				65000,
				79000,
				49213,
				51213,
				16932
			]
		}
	]
};


export const areaOptions = {
	accessibility: false,
	scales: {
		x: {
			title: "2018 Annual Sales Figures",
		},
		y: {
			title: "Dollars (CAD)",
			yMaxAdjuster: yMax => yMax * 1.2,
			yMinAdjuster: yMin => yMin * 1.2,
			formatter: axisValue => `${axisValue / 1000}k`,
			thresholds: [
				{
					range: [-20000, 30000],
					theme: "success"
				},
				{
					range: [30000, 40000],
					theme: "danger"
				},
				{
					range: [40000, 70000],
					theme: "warning"
				}
			]
		}
	},
	legendClickable: true,
	containerResizable: true,
	title: "Area Chart",
	theme: getTheme()
};

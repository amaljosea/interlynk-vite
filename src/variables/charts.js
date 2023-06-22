export const barChartData = [
  {
    name: "SBOM Activities",
    data: [9, 15, 46, 60, 48],
  },
];

export const barChartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    style: {
      backgroundColor: "red",
      fontSize: "12px",
      fontFamily: undefined,
    },
    onDatasetHover: {
      style: {
        backgroundColor: "red",
        fontSize: "12px",
        fontFamily: undefined,
      },
    },
  },
  xaxis: {
    categories: ["Jan", "Feb", "Mar", "Apr", "May"],
    show: true,
    labels: {
      show: true,
      style: {
        colors: "#fff",
        fontSize: "14px",
        fontStyle: "bold"
      },
    },
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: true,
    },
  },
  yaxis: {
    show: true,
    color: "#fff",
    labels: {
      show: true,
      style: {
        colors: "#fff",
        fontSize: "14px",
        fontStyle: "bold"
      },
    },
  },
  grid: {
    show: true,
  },
  fill: {
    colors: "#fff",
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: "12px",
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 0,
          },
        },
      },
    },
  ],
};

export const lineChartData = [
  {
    name: "Risk Score",
    data: [29, 27, 26, 34, 31, 27, 29, 32, 24],
  }
];

export const lineChartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    theme: "dark",
  },
  dataLabels: {
    enabled: true,
  },
  stroke: {
    curve: "straight",
  },
  xaxis: {
    type: "number",
    categories: [
      "-8 weeks",
      "-7",
      "-6",
      "-5",
      "-4",
      "-3",
      "-2",
      "-1 week",
      "Today",
    ],
    labels: {
      style: {
        colors: "#0077AF",
        fontSize: "14px",
        fontStyle: "bold"
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "#0077AF",
        fontSize: "14px",
        fontStyle: "bold"
      },
    }
  },
  legend: {
    show: false,
  },
  grid: {
    strokeDashArray: 2,
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      shadeIntensity: 0.5,
      gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
      inverseColors: true,
      opacityFrom: 0.8,
      opacityTo: 0,
      stops: [],
    },
    colors: ["#56ABE7", "#0077AF"],
  },
  colors: ["#56ABE7", "#0077AF"],
};

import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { getCSSVariableValue } from '../../../../../../kt/_utils';

@Component({
  selector: 'app-new-charts-widget8',
  templateUrl: './new-charts-widget8.component.html',
  styleUrls: ['./new-charts-widget8.component.scss'],
})
export class NewChartsWidget8Component implements OnInit {
  @ViewChild('dayChart') dayChart!: ElementRef<HTMLDivElement>;
  @ViewChild('weekChart') weekChart!: ElementRef<HTMLDivElement>;
  @ViewChild('monthChart') monthChart!: ElementRef<HTMLDivElement>;

  @Input() chartHeight: string = '425px';
  @Input() chartHeightNumber: number = 425;
  @Input() cssClass: string = '';
  tab: 'Day' | 'Week' | 'Month' = 'Week';
  chart1Options: any = {};
  chart2Options: any = {};
  chart3Options: any = {};
  hadDelay: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupCharts();
  }

  init() {
    this.chart1Options = getChart1Options(this.chartHeightNumber);
    this.chart2Options = getChart2Options(this.chartHeightNumber);
    this.chart3Options = getChart2Options(this.chartHeightNumber);
  }

  setTab(_tab: 'Day' | 'Week' | 'Month') {
    this.tab = _tab;
    if (_tab === 'Day') {
      this.chart3Options = getChart2Options(this.chartHeightNumber);
    }

    if (_tab === 'Week') {
      this.chart2Options = getChart2Options(this.chartHeightNumber);
    }

    if (_tab === 'Month') {
      this.chart1Options = getChart1Options(this.chartHeightNumber);
    }

    this.setupCharts();
  }

  setupCharts() {
    setTimeout(() => {
      this.hadDelay = true;
      this.init();
      this.cdr.detectChanges();
    }, 100);
  }
}

function getChart1Options(chartHeightNumber: number) {
  const data = [
    [[100, 250, 30]],
    [[225, 300, 35]],
    [[300, 350, 25]],
    [[350, 350, 20]],
    [[450, 400, 25]],
    [[550, 350, 35]],
  ];
  const height = chartHeightNumber;
  const borderColor = getCSSVariableValue('--bs-border-dashed-color');
  const labelColor = getCSSVariableValue('--bs-gray-500');
  const baseColor = getCSSVariableValue('--bs-info');
  const lightColor = getCSSVariableValue('--bs-info-light');

  return {
    series: [
      {
        name: 'Net Profit',
        data: [30, 40, 40, 90, 90, 70, 70],
      },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'area',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {},
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'solid',
      opacity: 1,
    },
    stroke: {
      curve: 'smooth',
      show: true,
      width: 3,
      colors: [baseColor],
    },
    xaxis: {
      categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
      crosshairs: {
        position: 'front',
        stroke: {
          color: baseColor,
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: true,
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    states: {
      normal: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: function (val: number) {
          return '$' + val + ' thousands';
        },
      },
    },
    colors: [lightColor],
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    markers: {
      strokeColors: baseColor,
      strokeWidth: 3,
    },
  };
}

function getChart2Options(chartHeightNumber: number) {
  const data = [
    [[125, 300, 40]],
    [[250, 350, 35]],
    [[350, 450, 30]],
    [[450, 250, 25]],
    [[500, 500, 30]],
    [[600, 250, 28]],
  ];
  const height = chartHeightNumber;
  const borderColor = getCSSVariableValue('--bs-border-dashed-color');

  const options = {
    // series: [
    //   {
    //     name: 'Social Campaigns',
    //     data: data[0], // array value is of the format [x, y, z] where x (timestamp) and y are the two axes coordinates,
    //   },
    //   {
    //     name: 'Email Newsletter',
    //     data: data[1],
    //   },
    //   {
    //     name: 'TV Campaign',
    //     data: data[2],
    //   },
    // ],
    chart: {
      fontFamily: 'inherit',
      type: 'bubble',
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bubble: {},
    },
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'numeric',
      tickAmount: 7,
      min: 0,
      max: 700,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: true,
        height: 0,
      },
      labels: {
        show: true,
        trim: true,
        style: {
          colors: getCSSVariableValue('--bs-gray-500'),
          fontSize: '13px',
        },
      },
    },
    yaxis: {
      tickAmount: 7,
      min: 0,
      max: 700,
      labels: {
        style: {
          colors: getCSSVariableValue('--bs-gray-500'),
          fontSize: '13px',
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      x: {
        formatter: function (val: string) {
          return 'Clicks: ' + val;
        },
      },
      y: {
        formatter: function (val: string) {
          return '$' + val + 'K';
        },
      },
      z: {
        title: 'Impression: ',
      },
    },
    crosshairs: {
      show: true,
      position: 'front',
      stroke: {
        color: getCSSVariableValue('--bs-border-dashed-color'),
        width: 1,
        dashArray: 0,
      },
    },
    colors: [
      getCSSVariableValue('--bs-primary'),
      getCSSVariableValue('--bs-success'),
      getCSSVariableValue('--bs-warning'),
      getCSSVariableValue('--bs-danger'),
      getCSSVariableValue('--bs-info'),
      '#43CED7',
    ],
    fill: {
      opacity: 1,
    },
    markers: {
      strokeWidth: 0,
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      padding: {
        right: 20,
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };
  return options;
}

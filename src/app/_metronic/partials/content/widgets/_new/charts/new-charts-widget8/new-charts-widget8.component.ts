import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { getCSSVariableValue } from '../../../../../../kt/_utils';
import { finalize } from 'rxjs/operators';
import { HomeService } from '@app/pages/home/home.service';

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
  tab: 'Package' | 'Passenger' = 'Package';
  chart1Options: any = {};
  chart2Options: any = {};
  hadDelay: boolean = false;

  isLoading = false;
  data: any = [
    {
      name: 'Package Profit',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: 'Passenger Profit',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  constructor(private cdr: ChangeDetectorRef, private homeService: HomeService) {}

  ngOnInit(): void {
    this.getStatistic();
  }

  init(data: any) {
    this.chart1Options = this.getChart1Options(data, this.chartHeightNumber);
    this.chart2Options = getChart2Options(this.chartHeightNumber);
  }

  setTab(_tab: 'Package' | 'Passenger') {
    this.tab = _tab;
    if (_tab === 'Package') {
      this.chart2Options = getChart2Options(this.chartHeightNumber);
    }

    if (_tab === 'Passenger') {
      this.chart1Options = this.getChart1Options(this.data, this.chartHeightNumber);
    }

    this.setupCharts(this.data);
  }

  getStatistic() {
    this.isLoading = true;
    this.homeService
      .statistic()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((resp) => {
        if (resp) {
          this.setupCharts(resp);
        } else {
          this.setupCharts(this.data);
        }

        this.cdr.detectChanges();
      });
  }

  setupCharts(data: any) {
    setTimeout(() => {
      this.hadDelay = true;
      this.init(data);
      this.cdr.detectChanges();
    }, 100);
  }

  getChart1Options(data: any, chartHeightNumber: number) {
    const height = chartHeightNumber;
    const borderColor = getCSSVariableValue('--bs-border-dashed-color');
    const labelColor = getCSSVariableValue('--bs-gray-500');
    const baseColor = getCSSVariableValue('--bs-info');
    const lightColor = getCSSVariableValue('--bs-info-light');
    const orangeColor = getCSSVariableValue('--bs-warning');
    const greenColor = getCSSVariableValue('--bs-success');
    const redColor = getCSSVariableValue('--bs-danger');

    return {
      // series: [
      //   {
      //     name: 'Package Transaction',
      //     data: [30, 40, 40, 90, 90, 70, 70, 100, 120, 0, 0, 0],
      //   },
      //   {
      //     name: 'Passenger Transaction',
      //     data: [10, 10, 20, 50, 60, 1, 20, 0, 0, 80, 0, 0],
      //   },
      // ],
      series: data,
      chart: {
        fontFamily: 'inherit',
        type: 'area',
        height: height,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {},
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        offsetX: 0,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'gradient', // Use gradient fill
        gradient: {
          type: 'vertical', // Gradient direction: 'vertical', 'horizontal', 'diagonal1', 'diagonal2'
          shadeIntensity: 1, // Intensity of the gradient
          gradientToColors: ['#FFC300', '#00BFFF'], // Colors for the gradient transition
          inverseColors: false, // Reverse the gradient colors
          opacityFrom: 1, // Starting opacity of the gradient
          opacityTo: 0.5, // Ending opacity of the gradient
          stops: [0, 100], // Gradient stop positions
        },
      },
      stroke: {
        curve: 'smooth',
        show: false,
        width: 3,
        colors: [baseColor],
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
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
        show: false,
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
            return 'Rp ' + val;
          },
        },
      },
      colors: [redColor, greenColor],
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
    series: [
      {
        name: 'Social Campaigns',
        data: data[0], // array value is of the format [x, y, z] where x (timestamp) and y are the two axes coordinates,
      },
      {
        name: 'Email Newsletter',
        data: data[1],
      },
      {
        name: 'TV Campaign',
        data: data[2],
      },
    ],
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
      show: false,
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

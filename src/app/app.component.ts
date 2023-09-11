import { Component, ViewChild } from '@angular/core';
import { CurrencyService } from '../services/currency.service';
import * as Highcharts from 'highcharts';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CURRENCIES } from 'src/assets/currencies';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Component properties
  title = 'Sturdy Currencies';
  baseCurrency = 'USD';
  currencies = 'EUR,USD,CAD';
  exchangeRates: any; // To store the API response
  amount: number = 1; // Default amount to be multiplied
  currencyList: string[] = CURRENCIES;
  convertedAmount: number | null = null; // Initialize as null
  selectedFromCurrency: string = 'USD';
  selectedToCurrency: string = 'USD';
  exchangeRate: number | null = null;
  showGraph = false; // Initially, the graph is not shown
  historicalRates: any[] = []; // Store fetched data here
  selectedFilter = '7d'; // Track the selected filter ('7d', '1m', '6m', or '')
  displayedColumns: string[] = ['date', 'rate'];
  dataSource = new MatTableDataSource<any>([]);
  hasConvertButtonClicked = false; // Track whether "Convert" button has been clicked

  @ViewChild(MatSort)
  sort: MatSort = new MatSort;

  constructor(private currencyService: CurrencyService) { }

  ngOnInit(): void {
    this.createLineChart();
    this.getExchangeRates(); // Call this once during component initialization
  }

  // Fetch exchange rates
  getExchangeRates() {
    this.currencyService.getCurrencyExchangeRates(this.selectedFromCurrency, this.selectedToCurrency)
      .subscribe(
        (data: any) => {
          const rates = Number(Object.values(data.data)[0]);
          console.log('Exchange Rate:', rates);

          if (!isNaN(rates) && !isNaN(this.amount)) {
            this.exchangeRate = rates;
            this.convertedAmount = this.exchangeRate * this.amount;
            console.log('Converted Amount:', this.convertedAmount);
            this.fetchHistoricalRates('7d');
          } else {
            console.error('Invalid exchange rate or amount.');
          }
        },
        (error) => {
          console.error('Error fetching exchange rates:', error);
        }
      );
  }

  // Fetch historical rates based on filter
  fetchHistoricalRates(filter: string = '7d') {
    // Determine the start and end dates based on the selected filter
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 2);
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (filter) {
      case '7d':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case '6m':
        startDate.setMonth(currentDate.getMonth() - 6);
        break;
      default:
        // Handle the case when no filter is selected
        startDate = new Date(); // Default start date (e.g., 7 days ago)
        break;
    }

    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(currentDate);

    this.currencyService
      .getHistoricalRates(this.selectedFromCurrency, this.selectedToCurrency, formattedStartDate, formattedEndDate)
      .subscribe((data: any) => {
        this.historicalRates = data.data;

        // Update the data source for the table
        this.dataSource.data = this.transformDataForTable(this.historicalRates);

        // Sort the table based on the "date" column
        this.dataSource.sort = this.sort;

        // Create the Highcharts line chart
        this.createLineChart();
      });

    // After fetching data, set showGraph to true to display the graph
    this.showGraph = true;
  }

  // Convert and fetch historical rates
  convertAndFetchHistoricalRates() {
    this.getExchangeRates();
    this.fetchHistoricalRates(this.selectedFilter);
  }

  // Create a Highcharts line chart
  createLineChart() {
    // Prepare data for the chart (e.g., format dates and values)
    const chartData = Object.entries(this.historicalRates).map(([date, rates]) => ({
      name: date,
      y: rates[this.selectedToCurrency],
    }));

    Highcharts.chart('container', {
      title: {
        text: 'Historical Exchange Rates',
      },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        title: {
          text: 'Exchange Rate',
        },
      },
      series: [
        {
          name: 'Exchange Rate',
          data: chartData,
          type: 'line',
        },
      ],
    });
  }

  // Format a Date object as a string
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Transform historical rates data for the table
  transformDataForTable(data: any): any[] {
    // Transform the historical rates object into an array of objects for the table
    return Object.entries(this.historicalRates).map(([date, rates]) => ({
      date,
      rate: rates[this.selectedToCurrency]
    }));
  }
}

import { Component, OnInit } from '@angular/core';
import { AppModule } from 'src/app/app.module';
import { FormControl } from '@angular/forms';
import { MatSelectModule, MatSelectChange } from '@angular/material';
import { SharedService } from 'src/app/shared.service';
import * as arrays from 'src/app/CONSTANTS';
import { UtilityserviceService } from 'src/app/utilityservice.service';
import { LoaderComponent } from 'src/app/loader/loader.component';

@Component({
  selector: 'app-rightbarselections',
  templateUrl: './rightbarselections.component.html',
  styleUrls: ['./rightbarselections.component.css']
})
export class RightbarselectionsComponent {

  selectedYearModel: string;
  selectedOrgUnit: string;
  reportingPeriod: string;
  selectedDataSet: string;
  selectedPeriodType: string;

  years = arrays.years;
  months = arrays.months;
  sixmonths = arrays.sixmonths;
  quarters = arrays.quarters;
  periods = arrays.periods;

  optionvalue: string;
  disable: boolean;



  gotPeriodValue = function (value) {
    if (value == "Monthly") this.options = this.months.map(x => x);
    if (value == "Quarterly") this.options = this.quarters.map(x => x);
    if (value == "Six-monthly") this.options = this.sixmonths.map(x => x);
    if (value == "Weekly") this.getWeeks(value);
  };

  getWeeks = function (type) {
    if (type == "Weekly") {
      var sd = new Date(this.selectedYearModel, 0, 1);
      var ed = new Date(this.selectedYearModel, 11, 31);

      let utility = new UtilityserviceService();
      this.options = utility.getweeks(sd, ed);
    }
  };



  constructor(private callingBridge: SharedService) {

    //method service which gets value from headerseletions
    this.callingBridge.periodValidateServiceMedthod.subscribe(
      (value) => {
        if (value) this.periods = ["Weekly"];
        else {
          this.periods = ["Monthly", "Quarterly", "Six-monthly", "Yearly"];
        }
      }
    );

    //method service which gets selectedOrgUnit from orgunitlibrary
    this.callingBridge.orgUnitServiceMethod.subscribe(
      (ou) => {
        this.selectedOrgUnit = ou;
      }
    );

    // method service which gets selectedDataset from datasetstab
    this.callingBridge.dataSetServiceMethod.subscribe(
      (ds) => {
        if(typeof ds == "object")this.selectedDataSet = ds[0].id;
        if(typeof ds == "string"){
          this.selectedDataSet = ds;
          this.generateReport();
        }
      }
    );
  }

  //function to get reports on table

  generateReport = function () {
    if (this.selectedPeriodType == "Yearly") this.reportingPeriod = this.selectedYearModel;
    else if (this.selectedPeriodType == "Weekly") this.reportingPeriod = this.optionvalue;
    else this.reportingPeriod = this.selectedYearModel + this.optionvalue;
    console.log("Reporting Period: "+this.reportingPeriod+" Selected Orgunit: "+ this.selectedOrgUnit+" Selected Dataset: "+ this.selectedDataSet);
    if(this.selectedYearModel===undefined || (this.optionvalue===undefined && this.selectedPeriodType != "Yearly")){alert("please select period");return;}
    this.callingBridge.callMethodToSendParams([this.selectedOrgUnit,this.reportingPeriod,this.selectedDataSet]);
  };
}

import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { AjaxserviceService } from 'src/app/ajaxservice.service';
import { UtilityserviceService } from 'src/app/utilityservice.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-orgunitlibrary',
  templateUrl: './orgunitlibrary.component.html',
  styleUrls: ['./orgunitlibrary.component.css'],
})


export class OrgunitlibraryComponent implements OnInit {
  displayedColumns = ['id', 'name'];
  ouHeaders = [];
  // row:string;
  constructor(private orgunitService: AjaxserviceService, private onclicks: ElementRef, private util: UtilityserviceService) { }

  ngOnInit() {
    this.setOu();
  }
  selectedOrgUnit: string;
  checked: string;
  previousSelection: typearr = { id: "unknown", style: { color: "black" } };
  hashmapForClasses = [];
  hashmapForOuSelect = [];
  mapClasses() {

    //for expanding tree - class mapping
    var classes = this.onclicks.nativeElement.querySelectorAll('.ouid');
    for (var j = 0; j < classes.length; j++) {
      if (this.hashmapForClasses[classes[j].attributes[2].value]) { }
      else {
        classes[j].addEventListener('click', this.setChildOu.bind(this));
        this.hashmapForClasses[classes[j].attributes[2].value] = true;
      }
    }
    //for selected ou id
    var classesou = this.onclicks.nativeElement.querySelectorAll('.ouselect');
    for (var j = 0; j < classesou.length; j++) {
      if (this.hashmapForOuSelect[classesou[j].attributes[1].value]) { }
      else {
        classesou[j].addEventListener('click', this.ouselect.bind(this));
        this.hashmapForOuSelect[classesou[j].attributes[1].value] = true;
      }
    }

  };

  ouselect(element) {
    var rowid = element.currentTarget.parentElement;
    element.currentTarget.style.color = "#3f51b5";
    this.selectedOrgUnit = rowid.attributes[0].value;
    if (this.previousSelection.id != element.currentTarget.id) {
      this.previousSelection.style.color = "black";
    }
    this.previousSelection = element.currentTarget;
  }

  setOu() {
    this.orgunitService.getUserOu()
      .subscribe(response => {
        for (let i = 0; i < response.organisationUnits.length; i++) {
          let child = false;
          if (response.organisationUnits[i].children.length != 0) { child = true; }
          let name = response.organisationUnits[i].name;
          let id = response.organisationUnits[i].id;
          this.ouHeaders.push({ "name": name, "id": id, "child": child });
        }
      });
    setTimeout(() => {
      this.printTable(this.ouHeaders);
    }, 1000);
  }

  setChildOu(row) {
    if(row.currentTarget.parentElement.rowIndex==0)this.padding=10;
    var ou = row.currentTarget.attributes[2].value;
    var child = row.currentTarget.attributes[3].value;
    this.checked = row.currentTarget.attributes[4].value;
    var rowElement = row.currentTarget;
    var numOfRowToDelete = 0;
    var newou = [];
    this.orgunitService.getChildOu(ou)
      .subscribe(response => {
        if (this.checked == "true") { numOfRowToDelete = response.children.length; }
        else {
          var parent = response.id;
          for (let j = 0; j < response.ancestors.length; j++) {
            parent = parent + " " + response.ancestors[j].id;
          }

          for (let i = 0; i < response.children.length; i++) {
            let child = false;
            if (response.children[i].children.length != 0) { child = true; }
            let name = response.children[i].name;
            let id = response.children[i].id;
            newou.push({ "name": name, "id": id, "child": child, "parent": parent });
          }
        }
      });
    setTimeout(() => {
      if (this.checked == "true") {
        this.deleteRows(rowElement);
        rowElement.attributes[4].value = false;
        this.padding -= 10;
        rowElement.innerHTML = "<i class='fa fa-plus-square-o' aria-hidden='true'></i>";
      }
      else {
        newou.sort(function (a, b) {
          var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
          if (nameA > nameB) //sort string ascending
            return -1
          if (nameA < nameB)
            return 1
          return 0 //default return value (no sorting)
        })
        this.padding += 10;
        this.printOuChild(newou, rowElement);
        rowElement.attributes[4].value = true;
        rowElement.innerHTML = "<i class='fa fa-minus-square-o' aria-hidden='true'></i>";
      }
    }, 1000);
  }


  printTable(head) {
    for (let i = 0; i < head.length; i++) {
      if (head[i].child) var row = '<tr id="' + head[i].id + i + '"><td style="cursor:pointer !important;" class="ouid" value="' + head[i].id + '" child="true" clicked="false"><i class="fa fa-plus-square-o" aria-hidden="true"></i></td><td class="ouselect" value="' + head[i].id + '" style="cursor:pointer !important;" id="' + head[i].id + '">' + head[i].name + '</td></tr>';
      else var row = '<tr id="' + head[i].id + i + '"><td style="cursor:pointer !important;" class="ouid" value="' + head[i].id + '" child="false" clicked="false"></td><td class="ouselect" value="' + head[i].id + '" style="cursor:pointer !important;" id="' + head[i].id + '">' + head[i].name + '</td></tr>';
      $('#outable > tbody').append(row);
      this.hashmapForClasses[head[i].id] = false;
      this.hashmapForOuSelect[head[i].id] = false;
    }
    this.mapClasses();
  }
  padding: any = 0;
  printOuChild(head, rowElement) {
    for (let i = 0; i < head.length; i++) {
      if (head[i].child) var row = '<tr id="' + head[i].id + i + '"  class="' + head[i].parent + '"><td style="cursor:pointer !important;padding-left:' + this.padding + 'px" class="ouid" value="' + head[i].id + '" child="true" clicked="false"><i class="fa fa-plus-square-o" aria-hidden="true"></i></td><td class="ouselect" value="' + head[i].id + '" style="cursor:pointer !important;padding-left:' + this.padding + 'px" id="' + head[i].id + '">' + head[i].name + '</td></tr>';
      else var row = '<tr id="' + head[i].id + i + '" class="' + head[i].parent + '"><td style="cursor:pointer !important;padding-left:' + this.padding + 'px" class="ouid" value="' + head[i].id + '" child="false" clicked="false"></td><td class="ouselect" value="' + head[i].id + '" style="cursor:pointer !important;padding-left:' + this.padding + 'px" id="' + head[i].id + '">' + head[i].name + '</td></tr>';
      var index = rowElement.parentElement.rowIndex;
      $('#outable > tbody > tr').eq(index).after(row);
      this.hashmapForClasses[head[i].id] = false;
      this.hashmapForOuSelect[head[i].id] = false;
    }
    this.mapClasses();
  }

  deleteRows(row) {
    var classname = row.parentElement.children[1].id;
    var allrows = document.getElementsByClassName(classname);
    for (var t = allrows.length - 1; t >= 0; t--) {
      allrows[t].remove();
    }
    // $("#outable tr:gt(" + rowIndex + "):lt(" + (num) + ")").remove();
  }
}

export interface typearr {
  id: string,
  style: typearr2,
}
export interface typearr2 {
  color: string
}
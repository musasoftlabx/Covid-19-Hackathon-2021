<template>
  <div>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card
          dark
          tile
          class="elevation-1 MetricsCard rounded-bl-xl rounded-br-xl"
        >
          <v-img
            height="500px"
            :src="$store.getters.server + 'img/backdrops/bg5.png'"
            gradient="to top right, rgba(39, 40, 39) 0%, rgb(39 99 95) 0%, rgba(13, 135, 185, 0.67) 100%"
          >
            <div
              ref="MetricsChart"
              class="chart"
              style="width: 100%; height: 500px"
            />
          </v-img>
        </v-card>
      </v-col>
    </v-row>
    <v-container fluid :class="$vuetify.breakpoint.smAndUp && 'px-12'">
      <v-row class="mt-5">
        <v-col cols="12" xl="12">
          <v-card
            outline
            dark
            class="elevation-1 rounded-xl FundingCard"
            style="opacity: 1"
          >
            <v-progress-linear
              v-if="progress"
              indeterminate
              absolute
              style="width: 70%; left: 10%; top: 2%"
            />
            <v-row no-gutters class="pt-6 mx-4">
              <v-col cols="8">
                <div class="ml-5 text-overline font-weight-bold">
                  FUNDINGS &amp; EXPENDITURES
                </div>
                <div class="ml-5 mt-1 text-caption yellow--text">
                  Values are indicative of:
                  <v-menu
                    ref="menu"
                    :close-on-content-click="false"
                    :return-value.sync="datepicker.date"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        outlined
                        x-small
                        style="margin-top: -1px"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      >
                        <span class="font-weight-bold">{{
                          datepicker.date
                        }}</span>
                      </v-btn>
                    </template>
                    <v-date-picker
                      v-model="datepicker.date"
                      no-title
                      scrollable
                      @input="
                        $refs.menu.save(datepicker.date);
                        datepicker.visible = false;
                      "
                    />
                  </v-menu>
                </div>
              </v-col>
              <v-col align="end">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      x-small
                      fab
                      text
                      v-bind="attrs"
                      v-on="on"
                      @click="Metrics(datepicker.date)"
                      ><v-icon style="z-index: 1" size="20"
                        >mdi-refresh</v-icon
                      ></v-btn
                    >
                  </template>
                  <span>Refresh</span>
                </v-tooltip>
              </v-col>
              <div
                ref="FundingBarChart"
                class="chart"
                style="width: 100%; height: 440px"
              />
            </v-row>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card
            height="520"
            dark
            outline
            class="pt-3 px-5 pb-3 elevation-1 rounded-xl RegionCard"
            style="opacity: 0.9"
          >
            <div style="position: absolute" class="pa-3">
              <div class="text-overline font-weight-bold">RECEIPIENT</div>
              <div class="mb-4 text-caption yellow--text">
                Allocation between national and county
              </div>
            </div>
            <div ref="RegionChart" style="height: 500px" />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card
            height="520"
            dark
            outline
            class="pt-3 px-5 pb-3 elevation-1 rounded-xl MapCard"
            style="opacity: 0.9"
          >
            <div style="position: absolute" class="pa-3">
              <div class="text-overline font-weight-bold">
                PER COUNTY ALLOCATION
              </div>
              <div class="mb-4 text-caption yellow--text">
                Zoom in to view small counties
              </div>
            </div>
            <div ref="KenyanMap" class="chart" style="height: 500px"></div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4plugins_timeline from "@amcharts/amcharts4/plugins/timeline";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";
import KenyaLow from "@amcharts/amcharts4-geodata/kenyaLow.js";
import fundings from "@/api/funding";
import expenditure from "@/api/expenditure";

import am4themes_dark from "@amcharts/amcharts4/themes/dark";
am4core.useTheme(am4themes_dark);

am4core.useTheme(am4themes_animated);

export default {
  data() {
    return {
      progress: false,
      datepicker: {
        visible: false,
        date: new Date().toISOString().substr(0, 10)
      },
      timeline: null,
      xy: null,
      pie: null,
      map: null
    };
  },
  mounted() {
    this.Metrics(this.datepicker.date);
    this.KenyanMap();
    this.RegionChart();
    this.FundingBarChart();
  },
  watch: {
    "datepicker.date"(v) {
      this.Metrics(v);
    }
  },
  methods: {
    Metrics(date) {
      this.progress = true;
      setTimeout(() => (this.progress = false), 8000);
      let colorSet = new am4core.ColorSet();

      date;
      let cleaned = expenditure.map((obj, i) => ({
        category: "",
        start: obj.period + "00:00",
        end: obj.period + "23:59",
        color: colorSet.getIndex(i),
        donor: obj.fund_source,
        text: "Ksh " + obj.amount_expended,
        textDisabled: true,
        icon:
          obj["expenditure _types"][0] === "Cash"
            ? `${this.$store.getters.server}img/cash.png`
            : obj["expenditure _types"][0] === "PPEs"
            ? `${this.$store.getters.server}img/ppe.png`
            : obj["expenditure _types"][0] === "Service"
            ? `${this.$store.getters.server}img/services.png`
            : `${this.$store.getters.server}img/goods.png`
      }));
      let sorted = cleaned.sort(
        (a, b) => new Date(a.start) - new Date(b.start)
      );
      this.Timeline(sorted);
      //this.FundingBarChart(sorted);
    },
    Timeline(data) {
      /*eslint-disable */
      this.timeline = am4core.create(
        this.$refs.MetricsChart,
        am4plugins_timeline.CurveChart
      );
      this.timeline.logo.disabled = true;
      this.timeline.curveContainer.padding(140, 200, 50, 0);
      this.timeline.maskBullets = false;

      this.timeline.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";
      this.timeline.dateFormatter.dateFormat = "HH";

      this.timeline.data = data;

      this.timeline.fontSize = 12;
      this.timeline.tooltipContainer.fontSize = 12;

      var categoryAxis = this.timeline.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";
      categoryAxis.renderer.grid.template.disabled = true;
      categoryAxis.renderer.labels.template.paddingRight = 25;
      categoryAxis.renderer.minGridDistance = 10;
      categoryAxis.renderer.innerRadius = 10;
      categoryAxis.renderer.radius = 30;

      var dateAxis = this.timeline.xAxes.push(new am4charts.DateAxis());

      dateAxis.renderer.points = getPoints();

      dateAxis.renderer.autoScale = false;
      dateAxis.renderer.autoCenter = false;
      dateAxis.renderer.minGridDistance = 70;
      dateAxis.baseInterval = { count: 1, timeUnit: "time" };
      dateAxis.renderer.tooltipLocation = 0;
      dateAxis.renderer.line.strokeDasharray = "9,4";
      dateAxis.renderer.line.strokeOpacity = 0.9;
      dateAxis.tooltip.background.fillOpacity = 0.2;
      dateAxis.tooltip.background.cornerRadius = 5;
      dateAxis.tooltip.label.fill = new am4core.InterfaceColorSet().getFor(
        "alternativeBackground"
      );
      dateAxis.tooltip.label.paddingTop = 7;
      // change display here
      dateAxis.endLocation = 0;
      dateAxis.startLocation = 0;
      // dateAxis.min = new Date(2019, 0, 9, 23, 55).getTime();
      // dateAxis.max = new Date(2019, 0, 11, 7, 10).getTime();

      var labelTemplate = dateAxis.renderer.labels.template;
      labelTemplate.verticalCenter = "middle";
      labelTemplate.fillOpacity = 0.6;
      labelTemplate.background.fill = new am4core.InterfaceColorSet().getFor(
        "background"
      );
      labelTemplate.background.fillOpacity = 0.1; // opacity of date labels
      labelTemplate.fill = new am4core.InterfaceColorSet().getFor("text");
      labelTemplate.padding(7, 7, 7, 7);

      var series = this.timeline.series.push(
        new am4plugins_timeline.CurveColumnSeries()
      );
      series.columns.template.height = am4core.percent(30);

      series.dataFields.openDateX = "start";
      series.dataFields.dateX = "end";
      series.dataFields.categoryY = "category";
      series.baseAxis = categoryAxis;
      series.columns.template.propertyFields.fill = "color"; // get color from data
      series.columns.template.propertyFields.stroke = "color";
      series.columns.template.strokeOpacity = 0;
      series.columns.template.fillOpacity = 0.6;

      var imageBullet1 = series.bullets.push(
        new am4plugins_bullets.PinBullet()
      );
      imageBullet1.background.radius = 24;
      imageBullet1.locationX = 1;
      imageBullet1.propertyFields.stroke = "color";
      imageBullet1.background.propertyFields.fill = "color";
      imageBullet1.image = new am4core.Image();
      imageBullet1.image.propertyFields.href = "icon";
      imageBullet1.image.scale = 1;
      imageBullet1.circle.radius = am4core.percent(100);
      imageBullet1.background.fillOpacity = 0.8;
      imageBullet1.background.strokeOpacity = 0;
      imageBullet1.dy = -2;
      imageBullet1.background.pointerBaseWidth = 10;
      imageBullet1.background.pointerLength = 10;
      imageBullet1.tooltipText = "[bold]{funder}[/]\n{text}";

      series.tooltip.pointerOrientation = "up";

      imageBullet1.background.adapter.add("pointerAngle", (value, target) => {
        if (target.dataItem) {
          var position = dateAxis.valueToPosition(
            target.dataItem.openDateX.getTime()
          );
          return dateAxis.renderer.positionToAngle(position);
        }
        return value;
      });

      var hs = imageBullet1.states.create("hover");
      hs.properties.scale = 1.3;
      hs.properties.opacity = 1;

      var textBullet = series.bullets.push(new am4charts.LabelBullet());
      textBullet.label.propertyFields.text = "text";
      textBullet.disabled = true;
      textBullet.propertyFields.disabled = "textDisabled";
      textBullet.label.strokeOpacity = 0;
      textBullet.locationX = 1;
      textBullet.dy = -100;
      textBullet.label.textAlign = "middle";

      this.timeline.scrollbarX = new am4core.Scrollbar();
      this.timeline.scrollbarX.align = "center";
      this.timeline.scrollbarX.width = am4core.percent(75);
      this.timeline.scrollbarX.parent = this.timeline.curveContainer;
      this.timeline.scrollbarX.height = 300;
      this.timeline.scrollbarX.orientation = "vertical";
      this.timeline.scrollbarX.x = 128;
      this.timeline.scrollbarX.y = -140;
      this.timeline.scrollbarX.isMeasured = false;
      this.timeline.scrollbarX.opacity = 0.5;

      var cursor = new am4plugins_timeline.CurveCursor();
      this.timeline.cursor = cursor;
      cursor.xAxis = dateAxis;
      cursor.yAxis = categoryAxis;
      cursor.lineY.disabled = true;
      cursor.lineX.disabled = true;

      dateAxis.renderer.tooltipLocation2 = 0;
      categoryAxis.cursorTooltipEnabled = false;

      this.timeline.zoomOutButton.disabled = true;

      var previousBullet;

      this.timeline.events.on("inited", function () {
        setTimeout(function () {
          hoverItem(series.dataItems.getIndex(0));
        }, 2000);
      });

      function hoverItem(dataItem) {
        var bullet = dataItem.bullets.getKey(imageBullet1.uid);
        var index = dataItem.index;

        if (index >= series.dataItems.length - 1) {
          index = -1;
        }

        if (bullet) {
          if (previousBullet) {
            previousBullet.isHover = false;
          }

          bullet.isHover = true;

          previousBullet = bullet;
        }
        setTimeout(function () {
          hoverItem(series.dataItems.getIndex(index + 1));
        }, 1000);
      }

      function getPoints() {
        var points = [
          { x: -1300, y: 200 },
          { x: 0, y: 200 },
        ];

        var w = 400;
        var h = 400;
        var levelCount = 4;

        var radius = am4core.math.min(w / (levelCount - 1) / 2, h / 2);
        var startX = radius;

        for (var i = 0; i < 25; i++) {
          var angle = 0 + (i / 25) * 90;
          var centerPoint = { y: 200 - radius, x: 0 };
          points.push({
            y: centerPoint.y + radius * am4core.math.cos(angle),
            x: centerPoint.x + radius * am4core.math.sin(angle),
          });
        }

        for (var i = 0; i < levelCount; i++) {
          if (i % 2 != 0) {
            points.push({
              y: -h / 2 + radius,
              x: startX + (w / (levelCount - 1)) * i,
            });
            points.push({
              y: h / 2 - radius,
              x: startX + (w / (levelCount - 1)) * i,
            });

            var centerPoint = {
              y: h / 2 - radius,
              x: startX + (w / (levelCount - 1)) * (i + 0.5),
            };
            if (i < levelCount - 1) {
              for (var k = 0; k < 50; k++) {
                var angle = -90 + (k / 50) * 180;
                points.push({
                  y: centerPoint.y + radius * am4core.math.cos(angle),
                  x: centerPoint.x + radius * am4core.math.sin(angle),
                });
              }
            }

            if (i == levelCount - 1) {
              points.pop();
              points.push({
                y: -radius,
                x: startX + (w / (levelCount - 1)) * i,
              });
              var centerPoint = {
                y: -radius,
                x: startX + (w / (levelCount - 1)) * (i + 0.5),
              };
              for (var k = 0; k < 25; k++) {
                var angle = -90 + (k / 25) * 90;
                points.push({
                  y: centerPoint.y + radius * am4core.math.cos(angle),
                  x: centerPoint.x + radius * am4core.math.sin(angle),
                });
              }
              points.push({ y: 0, x: 1300 });
            }
          } else {
            points.push({
              y: h / 2 - radius,
              x: startX + (w / (levelCount - 1)) * i,
            });
            points.push({
              y: -h / 2 + radius,
              x: startX + (w / (levelCount - 1)) * i,
            });
            var centerPoint = {
              y: -h / 2 + radius,
              x: startX + (w / (levelCount - 1)) * (i + 0.5),
            };
            if (i < levelCount - 1) {
              for (var k = 0; k < 50; k++) {
                var angle = -90 - (k / 50) * 180;
                points.push({
                  y: centerPoint.y + radius * am4core.math.cos(angle),
                  x: centerPoint.x + radius * am4core.math.sin(angle),
                });
              }
            }
          }
        }

        return points;
      }

      var label = this.timeline.createChild(am4core.Label);
      label.text =
        "[bold font-size: 30px]Expenditure statistics[/] \n [margin-left: 50px][font-size: 15px yellow]Items spent over a period of time[/][/]";
      label.isMeasured = false;
      label.y = am4core.percent(5);
      label.x = am4core.percent(0);
      label.verticalCenter = "top";
      label.fontSize = 20;

      /*  this.timeline = am4core.create(
        this.$refs.MetricsChart,
        am4plugins_timeline.SerpentineChart
      );
      this.timeline.logo.disabled = true;
      this.timeline.curveContainer.padding(140, 0, 50, 0);
      this.timeline.levelCount = 3;
      this.timeline.yAxisRadius = am4core.percent(20);
      this.timeline.yAxisInnerRadius = am4core.percent(2);
      this.timeline.maskBullets = false;

      this.timeline.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";
      this.timeline.dateFormatter.dateFormat = "HH";

      this.timeline.data = data;

      this.timeline.fontSize = 12;
      this.timeline.tooltipContainer.fontSize = 12;

      var categoryAxis = this.timeline.yAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = "category";
      categoryAxis.renderer.grid.template.disabled = true;
      categoryAxis.renderer.labels.template.paddingRight = 25;
      categoryAxis.renderer.minGridDistance = 10;

      var dateAxis = this.timeline.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 70;
      dateAxis.baseInterval = { count: 1, timeUnit: "date" };
      dateAxis.renderer.tooltipLocation = 0;
      dateAxis.renderer.line.strokeDasharray = "9,9";
      dateAxis.renderer.line.strokeOpacity = 0.9;
      dateAxis.tooltip.background.fillOpacity = 0.2;
      dateAxis.tooltip.background.cornerRadius = 5;
      dateAxis.tooltip.label.fill = new am4core.InterfaceColorSet().getFor(
        "alternativeBackground"
      );
      dateAxis.tooltip.label.paddingTop = 7;
      dateAxis.endLocation = 0;
      dateAxis.startLocation = -0.5;

      var labelTemplate = dateAxis.renderer.labels.template;
      labelTemplate.verticalCenter = "top";
      labelTemplate.fillOpacity = 1;
      labelTemplate.background.fill = new am4core.InterfaceColorSet().getFor(
        "background"
      );
      labelTemplate.background.fillOpacity = 0.2;
      labelTemplate.padding(7, 7, 7, 7);

      var series = this.timeline.series.push(
        new am4plugins_timeline.CurveColumnSeries()
      );
      series.columns.template.height = am4core.percent(15);

      series.dataFields.openDateX = "start";
      series.dataFields.dateX = "end";
      series.dataFields.categoryY = "category";
      series.baseAxis = categoryAxis;
      series.columns.template.propertyFields.fill = "color"; // get color from data
      series.columns.template.propertyFields.stroke = "color";
      series.columns.template.strokeOpacity = 0;
      series.columns.template.fillOpacity = 0.6;

      var imageBullet1 = series.bullets.push(
        new am4plugins_bullets.PinBullet()
      );
      imageBullet1.locationX = 1;
      imageBullet1.propertyFields.stroke = "color";
      imageBullet1.background.propertyFields.fill = "color";
      imageBullet1.image = new am4core.Image();
      imageBullet1.image.propertyFields.href = "icon";
      imageBullet1.image.scale = 1;
      imageBullet1.circle.radius = am4core.percent(100);
      imageBullet1.background.radius = 24;
      imageBullet1.background.fillOpacity = 0.8;
      imageBullet1.background.strokeOpacity = 0;
      imageBullet1.dy = -2;
      imageBullet1.background.pointerBaseWidth = 10;
      imageBullet1.background.pointerLength = 10;
      imageBullet1.tooltipText = "[bold]{donor}[/]\n{category}\n{text}";

      var hs = imageBullet1.states.create("hover");
      hs.properties.scale = 1.3;
      hs.properties.opacity = 1;

      var textBullet = series.bullets.push(new am4charts.LabelBullet());
      textBullet.label.propertyFields.text = "text";
      textBullet.disabled = true;
      textBullet.propertyFields.disabled = "textDisabled";
      textBullet.label.strokeOpacity = 0;
      textBullet.rotation = 0.9;
      textBullet.dy = -100;
      textBullet.label.textAlign = "middle";

      this.timeline.scrollbarX = new am4core.Scrollbar();
      this.timeline.scrollbarX.parent = this.timeline.bottomAxesContainer;
      this.timeline.scrollbarX.align = "center";
      this.timeline.scrollbarX.width = am4core.percent(75);
      this.timeline.scrollbarX.opacity = 1;

      var cursor = new am4plugins_timeline.CurveCursor();
      this.timeline.cursor = cursor;
      cursor.xAxis = dateAxis;
      cursor.yAxis = categoryAxis;
      cursor.lineY.disabled = true;
      cursor.lineX.strokeDasharray = "1,9";
      cursor.lineX.strokeOpacity = 1;

      dateAxis.renderer.tooltipLocation2 = 1;
      categoryAxis.cursorTooltipEnabled = true;

      this.timeline.events.on("inited", function () {
        setTimeout(function () {
          hoverItem(series.dataItems.getIndex(0));
        }, 2000);
      });

      var previousBullet;

      function hoverItem(dataItem) {
        var bullet = dataItem.bullets.getKey(imageBullet1.uid);
        var index = dataItem.index;

        if (index >= series.dataItems.length - 1) {
          index = -1;
        }

        if (bullet) {
          if (previousBullet) {
            previousBullet.isHover = false;
          }

          bullet.isHover = true;

          previousBullet = bullet;
        }
        setTimeout(function () {
          hoverItem(series.dataItems.getIndex(index + 1));
        }, 5000);
      }

      var label = this.timeline.createChild(am4core.Label);
      label.text =
        "[bold font-size: 30px]Funding statistics[/] \n [margin-left: 50px][font-size: 15px yellow]Items funded over a period of time[/][/]";
      label.isMeasured = false;
      label.y = am4core.percent(5);
      label.x = am4core.percent(50);
      label.horizontalCenter = "middle";
      label.verticalCenter = "top";
      label.fontSize = 20; */

      /*eslint-enable*/
    },
    FundingBarChart() {
      this.xy = am4core.create(this.$refs.FundingBarChart, am4charts.XYChart);
      this.xy.logo.disabled = true;
      this.xy.fontSize = 13;

      let dataset = [];

      fundings.map(obj => {
        dataset.push({
          date: obj.date,
          funded: Number.isInteger(obj.amount) ? obj.amount : 0
        });
      });
      expenditure.map(obj => {
        dataset.push({
          date: obj.period,
          spent: Number.isInteger(obj.amount_expended) ? obj.amount_expended : 0
        });
      });

      this.xy.data = dataset.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Create axes
      this.xy.xAxes.push(new am4charts.DateAxis());
      //dateAxis.renderer.grid.template.location = 0;
      //dateAxis.renderer.minGridDistance = 30;

      var valueAxis1 = this.xy.yAxes.push(new am4charts.ValueAxis());
      valueAxis1.title.text = "Amount Funded";

      var valueAxis2 = this.xy.yAxes.push(new am4charts.ValueAxis());
      valueAxis2.title.text = "Amount Spent";
      valueAxis2.renderer.opposite = true;
      valueAxis2.renderer.grid.template.disabled = true;

      // Create series
      var series1 = this.xy.series.push(new am4charts.ColumnSeries());
      series1.dataFields.valueY = "funded";
      series1.dataFields.dateX = "date";
      series1.yAxis = valueAxis1;
      series1.name = "Amount Funded";
      series1.tooltipText = "{name}\n[bold font-size: 14]Ksh {valueY}[/]";
      series1.fill = this.xy.colors.getIndex(0);
      series1.strokeWidth = 0;
      series1.clustered = false;
      series1.columns.template.width = am4core.percent(100);

      var series2 = this.xy.series.push(new am4charts.ColumnSeries());
      series2.dataFields.valueY = "spent";
      series2.dataFields.dateX = "date";
      series2.yAxis = valueAxis1;
      series2.name = "Amount Spent";
      series2.tooltipText = "{name}\n[bold font-size: 14]Ksh {valueY}[/]";
      series2.fill = this.xy.colors.getIndex(0).lighten(0.5);
      series2.strokeWidth = 0;
      series2.clustered = false;
      series2.toBack();

      /*       var series3 = chart.series.push(new am4charts.LineSeries());
      series3.dataFields.valueY = "funded";
      series3.dataFields.dateX = "date";
      series3.name = "Amount Funded";
      series3.strokeWidth = 2;
      series3.tensionX = 0.7;
      series3.yAxis = valueAxis2;
      series3.tooltipText = "{name}\n[bold font-size: 20]{valueY}[/]";

      var bullet3 = series3.bullets.push(new am4charts.CircleBullet());
      bullet3.circle.radius = 3;
      bullet3.circle.strokeWidth = 2;
      bullet3.circle.fill = am4core.color("#fff"); */

      var series4 = this.xy.series.push(new am4charts.LineSeries());
      series4.dataFields.valueY = "spent";
      series4.dataFields.dateX = "date";
      series4.name = "Amount Spent (Trend)";
      series4.strokeWidth = 2;
      series4.tensionX = 0.7;
      series4.yAxis = valueAxis2;
      series4.tooltipText = "{name}\n[bold font-size: 14]Ksh {valueY}[/]";
      series4.stroke = this.xy.colors.getIndex(0).lighten(0.5);
      series4.strokeDasharray = "3,3";

      var bullet4 = series4.bullets.push(new am4charts.CircleBullet());
      bullet4.circle.radius = 3;
      bullet4.circle.strokeWidth = 2;
      bullet4.circle.fill = am4core.color("#fff");

      // Add cursor
      this.xy.cursor = new am4charts.XYCursor();

      // Add legend
      this.xy.legend = new am4charts.Legend();
      this.xy.legend.position = "top";

      // Add scrollbar
      this.xy.scrollbarX = new am4charts.XYChartScrollbar();
      this.xy.scrollbarX.series.push(series1);
      //chart.scrollbarX.series.push(series3);
      this.xy.scrollbarX.parent = this.xy.bottomAxesContainer;
    },
    KenyanMap() {
      this.map = am4core.create(this.$refs.KenyanMap, am4maps.MapChart);
      this.map.logo.disabled = true;
      this.map.padding(60, 0, 30, 0);
      this.map.fontSize = 12;

      // Set map definition
      this.map.geodata = KenyaLow;

      // Set projection
      //chart.projection = new am4maps.projections.AlbersUsa();

      // Create map polygon series
      var polygonSeries = this.map.series.push(new am4maps.MapPolygonSeries());

      //Set min/max fill color for each area
      polygonSeries.heatRules.push({
        property: "fill",
        target: polygonSeries.mapPolygons.template,
        min: this.map.colors.getIndex(1).brighten(1),
        max: this.map.colors.getIndex(1).brighten(-0.3)
      });

      // Make map load polygon data (state shapes and names) from GeoJSON
      polygonSeries.useGeodata = true;

      // Set heatmap values for each state
      polygonSeries.data = [
        {
          id: "KE-28",
          value: 28,
          title: "Nairobi",
          latitude: 1.2921,
          longitude: 36.8219
        },
        { id: "KE-19", value: 19 },
        { id: "KE-39", value: 39 },
        { id: "KE-14", value: 14 },
        { id: "KE-21", value: 21 },
        { id: "KE-23", value: 23 },
        { id: "KE-30", value: 30 },
        { id: "KE-10", value: 10 },
        { id: "KE-22", value: 22 },
        { id: "KE-13", value: 13 },
        { id: "KE-27", value: 27 },
        { id: "KE-29", value: 29 },
        { id: "KE-16", value: 16 },
        { id: "KE-33", value: 33 },
        { id: "KE-34", value: 34 },
        { id: "KE-02", value: 2 },
        { id: "KE-08", value: 8 },
        { id: "KE-06", value: 6 },
        { id: "KE-15", value: 15 },
        { id: "KE-18", value: 18 },
        { id: "KE-40", value: 40 },
        { id: "KE-36", value: 36 },
        { id: "KE-17", value: 17 },
        { id: "KE-12", value: 12 },
        { id: "KE-41", value: 41 },
        { id: "KE-35", value: 35 },
        { id: "KE-45", value: 45 },
        { id: "KE-31", value: 31 },
        { id: "KE-38", value: 38 },
        { id: "KE-32", value: 32 },
        { id: "KE-26", value: 26 },
        { id: "KE-04", value: 4 },
        { id: "KE-20", value: 20 },
        { id: "KE-11", value: 11 },
        { id: "KE-44", value: 44 },
        { id: "KE-07", value: 7 },
        { id: "KE-03", value: 3 },
        { id: "KE-42", value: 42 },
        { id: "KE-05", value: 5 },
        { id: "KE-01", value: 1 },
        { id: "KE-09", value: 9 },
        { id: "KE-37", value: 37 },
        { id: "KE-47", value: 47 },
        { id: "KE-46", value: 46 },
        { id: "KE-24", value: 24 },
        { id: "KE-25", value: 25 },
        { id: "KE-43", value: 43 }
      ];

      // Set up heat legend
      let heatLegend = this.map.createChild(am4maps.HeatLegend);
      heatLegend.series = polygonSeries;
      heatLegend.align = "left";
      heatLegend.valign = "bottom";
      heatLegend.width = am4core.percent(20);
      heatLegend.marginRight = am4core.percent(4);
      heatLegend.minValue = 0;
      heatLegend.maxValue = 40000000;

      // Set up custom heat map legend labels using axis ranges
      var minRange = heatLegend.valueAxis.axisRanges.create();
      minRange.value = heatLegend.minValue;
      minRange.label.text = minRange.value;
      var maxRange = heatLegend.valueAxis.axisRanges.create();
      maxRange.value = heatLegend.maxValue;
      maxRange.label.text = maxRange.value;

      // Blank out internal heat legend value axis labels
      heatLegend.valueAxis.renderer.labels.template.adapter.add(
        "text",
        function() {
          return "";
        }
      );

      // Configure series tooltip
      var polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipText = "{name}: {value}";
      polygonTemplate.nonScalingStroke = true;
      polygonTemplate.strokeWidth = 0.5;

      // Create hover state and set alternative fill color
      var hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color("#3c5bdc");

      // Small map
      this.map.smallMap = new am4maps.SmallMap();
      // Re-position to top right (it defaults to bottom left)
      this.map.smallMap.align = "right";
      this.map.smallMap.valign = "middle";
      this.map.smallMap.series.push(polygonSeries);

      // Zoom control
      this.map.zoomControl = new am4maps.ZoomControl();

      var homeButton = new am4core.Button();
      homeButton.events.on("hit", function() {
        this.map.goHome();
      });

      homeButton.icon = new am4core.Sprite();
      homeButton.padding(7, 5, 7, 5);
      homeButton.width = 30;
      homeButton.icon.path =
        "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
      homeButton.marginBottom = 10;
      homeButton.parent = this.map.zoomControl;
      homeButton.insertBefore(this.map.zoomControl.plusButton);
    },
    RegionChart() {
      this.pie = am4core.create(this.$refs.RegionChart, am4charts.PieChart3D);
      this.pie.hiddenState.properties.opacity = 0; // this creates initial fade-in
      this.pie.logo.disabled = true;
      this.pie.padding(100, 50, 50, 50);
      this.pie.fontSize = 11;

      this.pie.data = [
        {
          recepient: "National Govt",
          count: 7
        },
        {
          recepient: "County Govt",
          count: 3
        }
      ];

      this.pie.legend = new am4charts.Legend();

      // Set inner radius
      this.pie.innerRadius = am4core.percent(60);

      // Add and configure Series
      var pieSeries = this.pie.series.push(new am4charts.PieSeries3D());
      pieSeries.dataFields.value = "count";
      pieSeries.dataFields.category = "recepient";
      pieSeries.slices.template.stroke = am4core.color("#fff");
      pieSeries.slices.template.strokeWidth = 2;
      pieSeries.slices.template.strokeOpacity = 1;

      // This creates initial animation
      pieSeries.hiddenState.properties.opacity = 1;
      pieSeries.hiddenState.properties.endAngle = -45;
      pieSeries.hiddenState.properties.startAngle = -45;
    }
  },
  destroyed() {
    this.timeline.dispose();
    this.xy.dispose();
    this.pie.dispose();
    this.map.dispose();
  }
};
</script>

<style>
.MetricsCard {
  background: linear-gradient(45deg, rgb(85 120 150), rgb(0 31 58));
}
.FundingCard {
  background: linear-gradient(45deg, rgb(87 15 152), rgb(148 130 39));
}
.RegionCard {
  background: linear-gradient(45deg, rgb(3 76 9), rgb(188 118 241));
}
.MapCard {
  background: linear-gradient(45deg, rgb(195 184 44), rgb(41 93 81));
}
.amcharts-amexport-item {
  border: 2px solid #777;
  text-align: center;
  width: 100% !important;
  padding: 3px 5px 0 5px !important;
  _background: green !important;
}
.amcharts-amexport-label {
  font-size: 13px;
  padding: 5px;
  color: black !important;
}
.amcharts-amexport-top .amcharts-amexport-item > .amcharts-amexport-menu {
  top: -30px !important;
  left: -30px !important;
}
</style>

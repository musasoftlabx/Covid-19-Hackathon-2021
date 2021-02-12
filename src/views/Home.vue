<template>
  <section v-resize="OnResize">
    <div
      class="background"
      :style="
        'opacity: .93; z-index: 1; background: linear-gradient(90deg, rgb(39, 40, 39) 0%, rgb(56 166 171) 35%, rgb(39, 40, 39) 100%)'
      "
    />
    <div
      class="background"
      :style="
        'background-image: url(' +
          $store.getters.server +
          'img/backdrops/' +
          background +
          '); z-index: 0;'
      "
    />
    <v-row
      align="center"
      :class="$vuetify.breakpoint.smAndDown ? '' : 'px-6'"
      class="mx-6"
      style="height: 100vh"
    >
      <v-col
        cols="12"
        md="7"
        lg="8"
        class="hidden-sm-and-down"
        style="z-index: 2"
      >
        <div id="chartdiv" />
      </v-col>
      <v-col
        cols="12"
        md="5"
        lg="4"
        :align="$vuetify.breakpoint.smAndDown ? 'center' : 'end'"
        style="z-index: 2"
      >
        <v-card
          width="400"
          raised
          class="mx-5 pt-2 px-5 pb-4 elevation-15 rounded-xl"
          style="opacity: 0.6; border-top: 5px solid #00b7d0"
        >
          <v-row>
            <v-col class="text-center">
              <img
                width="90"
                :src="$store.getters.server + 'img/logo.gif'"
                style="filter: hue-rotate(339deg)"
              />
              <div class="headline">Covid-19 Hackathon</div>
              <div class="mb-2 caption">Click on login to continue</div>
            </v-col>
          </v-row>
          <v-form ref="Login" v-model="login.valid" class="px-5">
            <v-select
              v-model="login.domain"
              :items="login.domains"
              :rules="[validators.required]"
              label="Domain *"
              outlined
              dense
              prepend-inner-icon="mdi-domain"
              :menu-props="{
                maxHeight: 300,
                transition: 'scale-transition',
                offsetY: true
              }"
            />
            <v-text-field
              ref="LoginUsername"
              v-model="login.username"
              :rules="[validators.required]"
              name="username"
              label="Username *"
              outlined
              dense
              disabled
              readonly
              clearable
              autofocus
              prepend-inner-icon="mdi-account-circle"
              @keyup.enter="Login"
            />
            <v-text-field
              v-if="login.domain == 'cd'"
              v-model="login.password"
              name="password"
              label="Password *"
              outlined
              dense
              clearable
              counter
              prepend-inner-icon="mdi-shield-key"
              :append-icon="textpass ? 'mdi-eye' : 'mdi-eye-off'"
              :type="textpass ? 'text' : 'password'"
              :rules="[validators.required]"
              @click:append="TextPass"
              @keyup.enter="Login"
            />
            <div class="mb-8 d-flex justify-center">
              <v-btn
                color="primary"
                width="200"
                :loading="login.loading"
                @click="Login"
                >LOGIN</v-btn
              >
            </div>
            <img width="50%" :src="$store.getters.server + 'img/_logo.svg'" />
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <Alert ref="Alert" />
  </section>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow.js";

export default {
  data() {
    return {
      windowSize: {
        x: 0,
        y: 0
      },
      background: "bg2.jpg",
      login: {
        visible: true,
        valid: false,
        loading: false,
        username: "anonymous",
        password: null,
        domain: localStorage.domain || "ActionForTransparency",
        domains: [
          { text: "Action For Transparency", value: "ActionForTransparency" },
          { text: "Media Tech Hub", value: "MediaTechHub", disabled: false },
          {
            text: "Other Affiliates",
            value: "OtherAffiliates",
            disabled: false
          }
        ]
      },
      OTP: {
        visible: false,
        valid: false,
        loading: false,
        value: "",
        phone: null
      }
    };
  },
  beforeCreate() {
    clearInterval(window.tokenify);
    localStorage.removeItem("ccstoken");
  },
  watch: {
    "login.domain"(v) {
      localStorage.domain = v;
    }
  },
  mounted() {
    /*eslint-disable */
    this.OnResize();
    this.$refs.LoginUsername.$el.focus();

    var backgroundColor = am4core.color("#1e2128");
    var activeColor = am4core.color("#FFEB3B");
    var confirmedColor = am4core.color("#F5F5F5");
    var recoveredColor = am4core.color("#C6FF00");
    var deathsColor = am4core.color("#FF1744");
    var textColor = am4core.color("#ffffff");

    // for an easier access by key
    var colors = {
      active: activeColor,
      confirmed: confirmedColor,
      recovered: recoveredColor,
      deaths: deathsColor,
    };

    var countryColor = am4core.color("#393939");
    var countryStrokeColor = am4core.color("#ffffff");
    var buttonStrokeColor = am4core.color("#ffffff");
    var countryHoverColor = am4core.color("#00b7d0");
    var activeCountryColor = am4core.color("#0f0f0f");

    var currentIndex;
    var currentCountry = "World";

    // last date of the data
    var lastDate = new Date(
      covid_total_timeline[covid_total_timeline.length - 1].date
    );
    var currentDate = lastDate;

    var currentPolygon;

    var countryDataTimeout;

    var sliderAnimation;

    //////////////////////////////////////////////////////////////////////////////
    // PREPARE DATA
    //////////////////////////////////////////////////////////////////////////////

    // make a map of country indexes for later use
    var countryIndexMap = {};
    var list = covid_world_timeline[0].list;
    for (var i = 0; i < list.length; i++) {
      var country = list[i];
      countryIndexMap[country.id] = i;
    }

    // calculated active cases in world data (active = confirmed - recovered)
    for (i = 0; i < covid_total_timeline.length; i++) {
      var di = covid_total_timeline[i];
      di.active = di.confirmed - di.recovered;
    }

    // function that returns current slide
    // if index is not set, get last slide
    function getSlideData(index) {
      if (index == undefined) {
        index = covid_world_timeline.length - 1;
      }

      var data = covid_world_timeline[index];

      return data;
    }

    // get slide data
    var slideData = getSlideData();

    // as we will be modifying raw data, make a copy
    var mapData = JSON.parse(JSON.stringify(slideData.list));
    var max = { confirmed: 0, recovered: 0, deaths: 0 };

    // the last day will have most
    for (i = 0; i < mapData.length; i++) {
      di = mapData[i];
      if (di.confirmed > max.confirmed) {
        max.confirmed = di.confirmed;
      }
      if (di.recovered > max.recovered) {
        max.recovered = di.recovered;
      }
      if (di.deaths > max.deaths) {
        max.deaths = di.deaths;
      }
      max.active = max.confirmed;
    }

    // END OF DATA

    //////////////////////////////////////////////////////////////////////////////
    // LAYOUT & CHARTS
    //////////////////////////////////////////////////////////////////////////////

    // main container
    // https://www.amcharts.com/docs/v4/concepts/svg-engine/containers/
    var container = am4core.create("chartdiv", am4core.Container);
    container.logo.disabled = true;
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);
    container.background.fill = am4core.color("#1e2128");
    container.background.fillOpacity = 0;

    // MAP CHART
    // https://www.amcharts.com/docs/v4/chart-types/map/
    var mapChart = container.createChild(am4maps.MapChart);
    mapChart.height = am4core.percent(80);
    mapChart.zoomControl = new am4maps.ZoomControl();
    mapChart.zoomControl.align = "right";
    mapChart.zoomControl.marginRight = 15;
    mapChart.zoomControl.valign = "middle";

    // by default minus button zooms out by one step, but we modify the behavior so when user clicks on minus, the map would fully zoom-out and show world data
    mapChart.zoomControl.minusButton.events.on("hit", showWorld);
    // clicking on a "sea" will also result a full zoom-out
    mapChart.seriesContainer.background.events.on("hit", showWorld);
    mapChart.seriesContainer.background.events.on("over", resetHover);
    mapChart.seriesContainer.background.fillOpacity = 0;
    mapChart.zoomEasing = am4core.ease.sinOut;

    // https://www.amcharts.com/docs/v4/chart-types/map/#Map_data
    // you can use more accurate world map or map of any other country - a wide selection of maps available at: https://github.com/amcharts/amcharts4-geodata
    mapChart.geodata = am4geodata_worldLow;

    // Set projection
    // https://www.amcharts.com/docs/v4/chart-types/map/#Setting_projection
    // instead of Miller, you can use Mercator or many other projections available: https://www.amcharts.com/demos/map-using-d3-projections/
    mapChart.projection = new am4maps.projections.Miller();
    mapChart.panBehavior = "move";

    // when map is globe, beackground is made visible
    mapChart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.05;
    mapChart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color(
      "#ffffff"
    );
    mapChart.backgroundSeries.hidden = true;

    // Map polygon series (defines how country areas look and behave)
    var polygonSeries = mapChart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.dataFields.id = "id";
    polygonSeries.exclude = ["AQ"]; // Antarctica is excluded in non-globe projection
    polygonSeries.useGeodata = true;
    polygonSeries.nonScalingStroke = true;
    polygonSeries.strokeWidth = 0.5;
    // this helps to place bubbles in the visual middle of the area
    polygonSeries.calculateVisualCenter = true;

    var polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.fill = countryColor;
    polygonTemplate.fillOpacity = 1;
    polygonTemplate.stroke = countryStrokeColor;
    polygonTemplate.strokeOpacity = 0.15;
    polygonTemplate.setStateOnChildren = true;

    polygonTemplate.events.on("hit", handleCountryHit);
    polygonTemplate.events.on("over", handleCountryOver);
    polygonTemplate.events.on("out", handleCountryOut);

    // you can have pacific - centered map if you set this to -154.8
    mapChart.deltaLongitude = -10;

    // polygon states
    var polygonHoverState = polygonTemplate.states.create("hover");
    polygonHoverState.properties.fill = countryHoverColor;

    var polygonActiveState = polygonTemplate.states.create("active");
    polygonActiveState.properties.fill = activeCountryColor;

    // Bubble series
    var bubbleSeries = mapChart.series.push(new am4maps.MapImageSeries());
    bubbleSeries.data = mapData;
    bubbleSeries.dataFields.value = "confirmed";
    bubbleSeries.dataFields.id = "id";

    // adjust tooltip
    bubbleSeries.tooltip.animationDuration = 0;
    bubbleSeries.tooltip.showInViewport = false;
    bubbleSeries.tooltip.background.fillOpacity = 0.2;
    bubbleSeries.tooltip.getStrokeFromObject = true;
    bubbleSeries.tooltip.getFillFromObject = false;
    bubbleSeries.tooltip.background.fillOpacity = 0.2;
    bubbleSeries.tooltip.background.fill = am4core.color("#000000");

    var imageTemplate = bubbleSeries.mapImages.template;
    // if you want bubbles to become bigger when zoomed, set this to false
    imageTemplate.nonScaling = true;
    imageTemplate.strokeOpacity = 0;
    imageTemplate.fillOpacity = 0.5;
    imageTemplate.tooltipText = "{name}: [bold]{value}[/]";
    // this is needed for the tooltip to point to the top of the circle instead of the middle
    imageTemplate.adapter.add("tooltipY", function (tooltipY, target) {
      return -target.children.getIndex(0).radius;
    });

    imageTemplate.events.on("over", handleImageOver);
    imageTemplate.events.on("out", handleImageOut);
    imageTemplate.events.on("hit", handleImageHit);

    // When hovered, circles become non-opaque
    var imageHoverState = imageTemplate.states.create("hover");
    imageHoverState.properties.fillOpacity = 1;

    // add circle inside the image
    var circle = imageTemplate.createChild(am4core.Circle);
    // this makes the circle to pulsate a bit when showing it
    circle.hiddenState.properties.scale = 0.0001;
    circle.hiddenState.transitionDuration = 2000;
    circle.defaultState.transitionDuration = 2000;
    circle.defaultState.transitionEasing = am4core.ease.elasticOut;
    // later we set fill color on template (when changing what type of data the map should show) and all the clones get the color because of this
    circle.applyOnClones = true;

    // heat rule makes the bubbles to be of a different width. Adjust min/max for smaller/bigger radius of a bubble
    bubbleSeries.heatRules.push({
      target: circle,
      property: "radius",
      min: 3,
      max: 30,
      dataField: "value",
    });

    // when data items validated, hide 0 value bubbles (because min size is set)
    bubbleSeries.events.on("dataitemsvalidated", function () {
      bubbleSeries.dataItems.each((dataItem) => {
        var mapImage = dataItem.mapImage;
        var circle = mapImage.children.getIndex(0);
        if (mapImage.dataItem.value == 0) {
          circle.hide(0);
        } else if (circle.isHidden || circle.isHiding) {
          circle.show();
        }
      });
    });

    // this places bubbles at the visual center of a country
    imageTemplate.adapter.add("latitude", function (latitude, target) {
      var polygon = polygonSeries.getPolygonById(target.dataItem.id);
      if (polygon) {
        return polygon.visualLatitude;
      }
      return latitude;
    });

    imageTemplate.adapter.add("longitude", function (longitude, target) {
      var polygon = polygonSeries.getPolygonById(target.dataItem.id);
      if (polygon) {
        return polygon.visualLongitude;
      }
      return longitude;
    });

    // END OF MAP

    // top title
    var title = mapChart.titles.create();
    title.fontSize = "1.5em";
    title.fill = "cyan"; //textColor;
    title.text = "Media Tech Hub";
    title.align = "left";
    title.horizontalCenter = "left";
    title.marginLeft = 20;
    title.paddingBottom = 10;
    title.y = 20;

    // switch between map and globe
    var mapGlobeSwitch = mapChart.createChild(am4core.SwitchButton);
    mapGlobeSwitch.align = "right";
    mapGlobeSwitch.y = 15;
    mapGlobeSwitch.leftLabel.text = "Map";
    mapGlobeSwitch.rightLabel.text = "Globe";
    mapGlobeSwitch.verticalCenter = "top";
    mapGlobeSwitch.leftLabel.fill = "#ffe942"; //textColor;
    mapGlobeSwitch.rightLabel.fill = "cyan"; //textColor;

    mapGlobeSwitch.events.on("toggled", function () {
      if (mapGlobeSwitch.isActive) {
        mapChart.projection = new am4maps.projections.Orthographic();
        mapChart.backgroundSeries.show();
        mapChart.panBehavior = "rotateLongLat";
        polygonSeries.exclude = [];
      } else {
        mapChart.projection = new am4maps.projections.Miller();
        mapChart.backgroundSeries.hide();
        mapChart.panBehavior = "move";
        polygonSeries.data = [];
        polygonSeries.exclude = ["AQ"];
      }
    });

    // buttons & chart container
    var buttonsAndChartContainer = container.createChild(am4core.Container);
    buttonsAndChartContainer.layout = "vertical";
    buttonsAndChartContainer.height = am4core.percent(40); // make this bigger if you want more space for the chart
    buttonsAndChartContainer.width = am4core.percent(100);
    buttonsAndChartContainer.valign = "bottom";

    // country name and buttons container
    var nameAndButtonsContainer = buttonsAndChartContainer.createChild(
      am4core.Container
    );
    nameAndButtonsContainer.width = am4core.percent(100);
    nameAndButtonsContainer.padding(0, 10, 5, 20);
    nameAndButtonsContainer.layout = "horizontal";

    // name of a country and date label
    var countryName = nameAndButtonsContainer.createChild(am4core.Label);
    countryName.fontSize = "1.1em";
    countryName.fill = textColor;
    countryName.valign = "middle";

    // buttons container (active/confirmed/recovered/deaths)
    var buttonsContainer = nameAndButtonsContainer.createChild(
      am4core.Container
    );
    buttonsContainer.layout = "grid";
    buttonsContainer.width = am4core.percent(100);
    buttonsContainer.x = 10;
    buttonsContainer.contentAlign = "right";

    // Chart & slider container
    var chartAndSliderContainer = buttonsAndChartContainer.createChild(
      am4core.Container
    );
    chartAndSliderContainer.layout = "vertical";
    chartAndSliderContainer.height = am4core.percent(100);
    chartAndSliderContainer.width = am4core.percent(100);
    chartAndSliderContainer.background.fill = am4core.color("#000000");
    chartAndSliderContainer.background = new am4core.RoundedRectangle();
    chartAndSliderContainer.background.cornerRadius(30, 30, 0, 0);
    chartAndSliderContainer.background.fillOpacity = 0.15;
    chartAndSliderContainer.background.fill = am4core.color("#000000");
    chartAndSliderContainer.paddingTop = 10;
    chartAndSliderContainer.paddingBottom = 0;

    // Slider container
    var sliderContainer = chartAndSliderContainer.createChild(
      am4core.Container
    );
    sliderContainer.width = am4core.percent(100);
    sliderContainer.padding(0, 15, 15, 10);
    sliderContainer.layout = "horizontal";

    var slider = sliderContainer.createChild(am4core.Slider);
    slider.width = am4core.percent(100);
    slider.valign = "middle";
    slider.background.opacity = 0.4;
    slider.opacity = 0.7;
    slider.background.fill = am4core.color("#ffffff");
    slider.marginLeft = 20;
    slider.marginRight = 35;
    slider.height = 15;
    slider.start = 1;

    // what to do when slider is dragged
    slider.events.on("rangechanged", function () {
      var index = Math.round((covid_world_timeline.length - 1) * slider.start);
      updateMapData(getSlideData(index).list);
      updateTotals(index);
    });
    // stop animation if dragged
    slider.startGrip.events.on("drag", () => {
      stop();
      if (sliderAnimation) {
        sliderAnimation.setProgress(slider.start);
      }
    });

    // play button
    var playButton = sliderContainer.createChild(am4core.PlayButton);
    playButton.valign = "middle";
    // play button behavior
    playButton.events.on("toggled", function (event) {
      if (event.target.isActive) {
        play();
      } else {
        stop();
      }
    });
    // make slider grip look like play button
    slider.startGrip.background.fill = playButton.background.fill;
    slider.startGrip.background.strokeOpacity = 0;
    slider.startGrip.icon.stroke = am4core.color("#ffffff");
    slider.startGrip.background.states.copyFrom(playButton.background.states);

    // play behavior
    function play() {
      if (!sliderAnimation) {
        sliderAnimation = slider
          .animate(
            { property: "start", to: 1, from: 0 },
            50000,
            am4core.ease.linear
          )
          .pause();
        sliderAnimation.events.on("animationended", () => {
          playButton.isActive = false;
        });
      }

      if (slider.start >= 1) {
        slider.start = 0;
        sliderAnimation.start();
      }
      sliderAnimation.resume();
      playButton.isActive = true;
    }

    // stop behavior
    function stop() {
      if (sliderAnimation) {
        sliderAnimation.pause();
      }
      playButton.isActive = false;
    }

    // BOTTOM CHART
    // https://www.amcharts.com/docs/v4/chart-types/xy-chart/
    var lineChart = chartAndSliderContainer.createChild(am4charts.XYChart);
    lineChart.fontSize = "0.8em";
    lineChart.paddingRight = 30;
    lineChart.paddingLeft = 30;
    lineChart.maskBullets = false;
    lineChart.zoomOutButton.disabled = true;
    lineChart.paddingBottom = 3;
    lineChart.paddingTop = 0;

    // make a copy of data as we will be modifying it
    lineChart.data = JSON.parse(JSON.stringify(covid_total_timeline));

    // date axis
    // https://www.amcharts.com/docs/v4/concepts/axes/date-axis/
    var dateAxis = lineChart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;
    dateAxis.renderer.grid.template.stroke = am4core.color("#000000");
    dateAxis.max = lastDate.getTime() + am4core.time.getDuration("day", 3);
    dateAxis.tooltip.label.fontSize = "0.8em";
    dateAxis.renderer.labels.template.fill = textColor;
    dateAxis.tooltip.background.fill = am4core.color("#ff8726");
    dateAxis.tooltip.background.stroke = am4core.color("#ff8726");
    dateAxis.tooltip.label.fill = am4core.color("#000000");

    // value axis
    // https://www.amcharts.com/docs/v4/concepts/axes/value-axis/
    var valueAxis = lineChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.interpolationDuration = 3000;
    valueAxis.renderer.grid.template.stroke = am4core.color("#000000");
    valueAxis.renderer.baseGrid.disabled = true;
    valueAxis.tooltip.disabled = true;
    valueAxis.extraMax = 0.05;
    valueAxis.renderer.inside = true;
    valueAxis.renderer.labels.template.verticalCenter = "bottom";
    valueAxis.renderer.labels.template.padding(2, 2, 2, 2);
    valueAxis.renderer.labels.template.fill = textColor;

    // cursor
    // https://www.amcharts.com/docs/v4/concepts/chart-cursor/
    lineChart.cursor = new am4charts.XYCursor();
    lineChart.cursor.behavior = "none"; // set zoomX for a zooming possibility
    lineChart.cursor.lineY.disabled = true;
    lineChart.cursor.xAxis = dateAxis;
    lineChart.cursor.lineX.stroke = am4core.color("#ff8726");
    // this prevents cursor to move to the clicked location while map is dragged
    am4core
      .getInteraction()
      .body.events.off(
        "down",
        lineChart.cursor.handleCursorDown,
        lineChart.cursor
      );
    am4core
      .getInteraction()
      .body.events.off("up", lineChart.cursor.handleCursorUp, lineChart.cursor);

    // legend
    // https://www.amcharts.com/docs/v4/concepts/legend/
    lineChart.legend = new am4charts.Legend();
    lineChart.legend.parent = lineChart.plotContainer;
    lineChart.legend.labels.template.fill = textColor;

    // create series
    var activeSeries = addSeries("active", activeColor);
    // active series is visible initially
    activeSeries.tooltip.disabled = true;
    activeSeries.hidden = false;

    var confirmedSeries = addSeries("confirmed", confirmedColor);
    var recoveredSeries = addSeries("recovered", recoveredColor);
    var deathsSeries = addSeries("deaths", deathsColor);

    var series = {
      active: activeSeries,
      confirmed: confirmedSeries,
      recovered: recoveredSeries,
      deaths: deathsSeries,
    };
    // add series
    function addSeries(name, color) {
      var series = lineChart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = name;
      series.dataFields.dateX = "date";
      series.name = capitalizeFirstLetter(name);
      series.strokeOpacity = 0.6;
      series.stroke = color;
      series.maskBullets = false;
      series.hidden = true;
      series.minBulletDistance = 10;
      series.hideTooltipWhileZooming = true;
      // series bullet
      var bullet = series.bullets.push(new am4charts.CircleBullet());

      // only needed to pass it to circle
      bullet.states.create("hover");
      bullet.setStateOnChildren = true;

      bullet.circle.fillOpacity = 1;
      bullet.circle.fill = backgroundColor;
      bullet.circle.radius = 2;

      var circleHoverState = bullet.circle.states.create("hover");
      circleHoverState.properties.fillOpacity = 1;
      circleHoverState.properties.fill = color;
      circleHoverState.properties.scale = 1.4;

      // tooltip setup
      series.tooltip.pointerOrientation = "down";
      series.tooltip.getStrokeFromObject = true;
      series.tooltip.getFillFromObject = false;
      series.tooltip.background.fillOpacity = 0.2;
      series.tooltip.background.fill = am4core.color("#000000");
      series.tooltip.dy = -4;
      series.tooltip.fontSize = "0.8em";
      series.tooltipText = "{valueY}";

      return series;
    }

    // BUTTONS
    // create buttons
    var activeButton = addButton("active", activeColor);
    var confirmedButton = addButton("confirmed", confirmedColor);
    var recoveredButton = addButton("recovered", recoveredColor);
    var deathsButton = addButton("deaths", deathsColor);

    var buttons = {
      active: activeButton,
      confirmed: confirmedButton,
      recovered: recoveredButton,
      deaths: deathsButton,
    };

    // add button
    function addButton(name, color) {
      var button = buttonsContainer.createChild(am4core.Button);
      button.label.valign = "middle";
      button.fontSize = "1em";
      button.background.cornerRadius(30, 30, 30, 30);
      button.background.strokeOpacity = 0.3;
      button.background.fillOpacity = 0;
      button.background.stroke = buttonStrokeColor;
      button.background.padding(2, 3, 2, 3);
      button.states.create("active");
      button.setStateOnChildren = true;
      button.label.fill = textColor;

      var activeHoverState = button.background.states.create("hoverActive");
      activeHoverState.properties.fillOpacity = 0;

      var circle = new am4core.Circle();
      circle.radius = 8;
      circle.fillOpacity = 0.3;
      circle.fill = buttonStrokeColor;
      circle.strokeOpacity = 0;
      circle.valign = "middle";
      circle.marginRight = 5;
      button.icon = circle;

      // save name to dummy data for later use
      button.dummyData = name;

      var circleActiveState = circle.states.create("active");
      circleActiveState.properties.fill = color;
      circleActiveState.properties.fillOpacity = 0.5;

      button.events.on("hit", handleButtonClick);

      return button;
    }

    // handle button clikc
    function handleButtonClick(event) {
      // we saved name to dummy data
      changeDataType(event.target.dummyData);
    }

    // change data type (active/confirmed/recovered/deaths)
    function changeDataType(name) {
      // make button active
      var activeButton = buttons[name];
      activeButton.isActive = true;
      // make other buttons inactive
      for (var key in buttons) {
        if (buttons[key] != activeButton) {
          buttons[key].isActive = false;
        }
      }
      // tell series new field name
      bubbleSeries.dataFields.value = name;
      bubbleSeries.invalidateData();
      // change color of bubbles
      // setting colors on mapImage for tooltip colors
      bubbleSeries.mapImages.template.fill = colors[name];
      bubbleSeries.mapImages.template.stroke = colors[name];
      // first child is circle
      bubbleSeries.mapImages.template.children.getIndex(0).fill = colors[name];

      // show series
      var activeSeries = series[name];
      activeSeries.show();
      // hide other series
      for (key in series) {
        if (series[key] != activeSeries) {
          series[key].hide();
        }
      }
      // update heat rule's maxValue
      bubbleSeries.heatRules.getIndex(0).maxValue = max[name];
    }

    // select a country
    function selectCountry(mapPolygon) {
      resetHover();
      polygonSeries.hideTooltip();

      // if the same country is clicked show world
      if (currentPolygon == mapPolygon) {
        currentPolygon.isActive = false;
        currentPolygon = undefined;
        showWorld();
        return;
      }
      // save current polygon
      currentPolygon = mapPolygon;
      var countryIndex = countryIndexMap[mapPolygon.dataItem.id];
      currentCountry = mapPolygon.dataItem.dataContext.name;

      // make others inactive
      polygonSeries.mapPolygons.each(function (polygon) {
        polygon.isActive = false;
      });

      // clear timeout if there is one
      if (countryDataTimeout) {
        clearTimeout(countryDataTimeout);
      }
      // we delay change of data for better performance (so that data is not changed whil zooming)
      countryDataTimeout = setTimeout(function () {
        setCountryData(countryIndex);
      }, 1000); // you can adjust number, 1000 is one second

      updateTotals(currentIndex);
      updateCountryName();

      mapPolygon.isActive = true;
      // meaning it's globe
      if (mapGlobeSwitch.isActive) {
        // animate deltas (results the map to be rotated to the selected country)
        if (mapChart.zoomLevel != 1) {
          mapChart.goHome();
          rotateAndZoom(mapPolygon);
        } else {
          rotateAndZoom(mapPolygon);
        }
      }
      // if it's not a globe, simply zoom to the country
      else {
        mapChart.zoomToMapObject(mapPolygon, getZoomLevel(mapPolygon));
      }
    }

    // change line chart data to the selected countries
    function setCountryData(countryIndex) {
      // instead of setting whole data array, we modify current raw data so that a nice animation would happen
      for (var i = 0; i < lineChart.data.length; i++) {
        var di = covid_world_timeline[i].list;

        var countryData = di[countryIndex];
        var dataContext = lineChart.data[i];
        if (countryData) {
          dataContext.recovered = countryData.recovered;
          dataContext.confirmed = countryData.confirmed;
          dataContext.deaths = countryData.deaths;
          dataContext.active = countryData.confirmed - countryData.recovered;
          valueAxis.min = undefined;
          valueAxis.max = undefined;
        } else {
          dataContext.recovered = 0;
          dataContext.confirmed = 0;
          dataContext.deaths = 0;
          dataContext.active = 0;
          valueAxis.min = 0;
          valueAxis.max = 10;
        }
      }

      lineChart.invalidateRawData();
      updateTotals(currentIndex);
      setTimeout(updateSeriesTooltip, 2000);
    }

    function updateSeriesTooltip() {
      lineChart.cursor.triggerMove(lineChart.cursor.point, "soft", true);
      lineChart.series.each(function (series) {
        if (!series.isHidden) {
          series.tooltip.disabled = false;
          series.showTooltipAtDataItem(series.tooltipDataItem);
        }
      });
    }

    // what happens when a country is rolled-over
    function rollOverCountry(mapPolygon) {
      resetHover();
      if (mapPolygon) {
        mapPolygon.isHover = true;

        // make bubble hovered too
        var image = bubbleSeries.getImageById(mapPolygon.dataItem.id);
        if (image) {
          image.dataItem.dataContext.name =
            mapPolygon.dataItem.dataContext.name;
          image.isHover = true;
        }
      }
    }
    // what happens when a country is rolled-out
    function rollOutCountry(mapPolygon) {
      var image = bubbleSeries.getImageById(mapPolygon.dataItem.id);
      resetHover();
      if (image) {
        image.isHover = false;
      }
    }

    // rotate and zoom
    function rotateAndZoom(mapPolygon) {
      polygonSeries.hideTooltip();
      var animation = mapChart.animate(
        [
          { property: "deltaLongitude", to: -mapPolygon.visualLongitude },
          { property: "deltaLatitude", to: -mapPolygon.visualLatitude },
        ],
        1000
      );
      animation.events.on("animationended", function () {
        mapChart.zoomToMapObject(mapPolygon, getZoomLevel(mapPolygon));
      });
    }

    // calculate zoom level (default is too close)
    function getZoomLevel(mapPolygon) {
      var w = mapPolygon.polygon.bbox.width;
      var h = mapPolygon.polygon.bbox.width;
      // change 2 to smaller walue for a more close zoom
      return Math.min(
        mapChart.seriesWidth / (w * 2),
        mapChart.seriesHeight / (h * 2)
      );
    }

    // show world data
    function showWorld() {
      currentCountry = "World";
      currentPolygon = undefined;
      resetHover();

      if (countryDataTimeout) {
        clearTimeout(countryDataTimeout);
      }

      // make all inactive
      polygonSeries.mapPolygons.each(function (polygon) {
        polygon.isActive = false;
      });

      updateCountryName();

      // update line chart data (again, modifying instead of setting new data for a nice animation)
      for (var i = 0; i < lineChart.data.length; i++) {
        var di = covid_total_timeline[i];
        var dataContext = lineChart.data[i];

        dataContext.recovered = di.recovered;
        dataContext.confirmed = di.confirmed;
        dataContext.deaths = di.deaths;
        dataContext.active = di.confirmed - di.recovered;
        valueAxis.min = undefined;
        valueAxis.max = undefined;
      }

      lineChart.invalidateRawData();

      updateTotals(currentIndex);
      mapChart.goHome();
    }

    // updates country name and date
    function updateCountryName() {
      countryName.text =
        currentCountry +
        ", " +
        mapChart.dateFormatter.format(currentDate, "MMM dd, yyyy");
    }

    // update total values in buttons
    function updateTotals(index) {
      if (!isNaN(index)) {
        var di = covid_total_timeline[index];
        var date = new Date(di.date);
        currentDate = date;

        updateCountryName();

        var position = dateAxis.dateToPosition(date);
        position = dateAxis.toGlobalPosition(position);
        var x = dateAxis.positionToCoordinate(position);

        if (lineChart.cursor) {
          lineChart.cursor.triggerMove({ x: x, y: 0 }, "soft", true);
        }
        for (var key in buttons) {
          buttons[key].label.text =
            capitalizeFirstLetter(key) + ": " + lineChart.data[index][key];
        }
        currentIndex = index;
      }
    }

    // update map data
    function updateMapData(data) {
      //modifying instead of setting new data for a nice animation
      bubbleSeries.dataItems.each(function (dataItem) {
        dataItem.dataContext.confirmed = 0;
        dataItem.dataContext.deaths = 0;
        dataItem.dataContext.recovered = 0;
        dataItem.dataContext.active = 0;
      });

      for (var i = 0; i < data.length; i++) {
        var di = data[i];
        var image = bubbleSeries.getImageById(di.id);
        if (image) {
          image.dataItem.dataContext.confirmed = di.confirmed;
          image.dataItem.dataContext.deaths = di.deaths;
          image.dataItem.dataContext.recovered = di.recovered;
          image.dataItem.dataContext.active = di.confirmed - di.recovered;
        }
      }
      bubbleSeries.invalidateRawData();
    }

    // capitalize first letter
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function handleImageOver(event) {
      rollOverCountry(polygonSeries.getPolygonById(event.target.dataItem.id));
    }

    function handleImageOut(event) {
      rollOutCountry(polygonSeries.getPolygonById(event.target.dataItem.id));
    }

    function handleImageHit(event) {
      selectCountry(polygonSeries.getPolygonById(event.target.dataItem.id));
    }

    function handleCountryHit(event) {
      selectCountry(event.target);
    }

    function handleCountryOver(event) {
      rollOverCountry(event.target);
    }

    function handleCountryOut(event) {
      rollOutCountry(event.target);
    }

    function resetHover() {
      polygonSeries.mapPolygons.each(function (polygon) {
        polygon.isHover = false;
      });

      bubbleSeries.mapImages.each(function (image) {
        image.isHover = false;
      });
    }

    container.events.on("layoutvalidated", function () {
      dateAxis.tooltip.hide();
      lineChart.cursor.hide();
      updateTotals(currentIndex);
    });

    updateCountryName();
    changeDataType("active");

    setTimeout(updateSeriesTooltip, 3000);
    /*eslint-enable */
  },
  methods: {
    OnResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight };
    },
    Login() {
      this.$router.push("/Funding");
      /* let username = this.login.username;
      let password = this.login.password;
      let domain = this.login.domain;
      this.login.loading = true;

      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "Login/", {
          method: "post",
          body: JSON.stringify({
            username,
            password,
            domain,
          }),
        })
      )
        .then((response) => {
          response.text().then((res) => {
            if (response.status > 200) {
              this.$refs.Alert.Alertify({
                visible: true,
                content: res,
                title: "Invalid Credentials",
                icon: "mdi-shield-account",
                color: "error",
              });
            } else {
              localStorage.ccstoken = res;

              if (domain != "Safaricom") {
                this.OTP.visible = true;
                this.OTP.phone = JSON.parse(
                  atob(localStorage.ccstoken.split(".")[1])
                ).data.phone;
              } else {
                localStorage.lastRoute
                  ? this.$router.push(localStorage.lastRoute)
                  : this.$router.push("/");
              }
            }
          });
        })
        .catch(() => {
          this.$refs.Alert.Alertify({
            visible: true,
            content: this.$store.getters.fetchTimeoutError,
            title: "Connection Timeout",
            icon: "mdi-wifi-strength-1-alert",
            color: "error",
          });
        })
        .finally(() => {
          this.login.loading = false;
        }); */
    },
    ValidateOTP() {
      this.OTP.loading = true;
      this.promiseFetch(this.$store.getters.fetchTimeout)(
        fetch(this.$store.getters.endpoint + "OTP/Validate/", {
          method: "post",
          body: JSON.stringify({
            OTP: this.OTP.value,
            phone: this.OTP.phone
          })
        })
      )
        .then(response => {
          response.text().then(res => {
            if (response.status > 200) {
              this.$refs.Alert.Alertify({
                visible: true,
                content: res,
                title: "Invalid OTP",
                icon: "mdi-progress-alert",
                color: "error"
              });
            } else {
              this.$router.push("/");
            }
          });
        })
        .catch(() => {
          this.$refs.Alert.Alertify({
            visible: true,
            content: this.$store.getters.fetchTimeoutError,
            title: "Connection Timeout",
            icon: "mdi-wifi-strength-1-alert",
            color: "error"
          });
        })
        .finally(() => {
          this.OTP.loading = false;
        });
    },
    Close() {
      this.reset.visible = false;
      this.reset.step = 1;
      this.$refs.Username.reset();
      this.reset.OTP.value = null;
      this.reset.password.value = null;
      this.reset.confirm.value = null;
      localStorage.removeItem("_rt");
    }
  },
  destroyed() {}
};
</script>

<style>
html {
  overflow: auto !important;
}
.background {
  position: absolute;
  height: 102%;
  width: 100%;
  background-position: center center;
  background-size: cover;
}
#chartdiv {
  max-width: 100%;
  height: 95vh;
}
</style>

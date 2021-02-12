module.exports = {
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === "production" ? "" : "/",

  pwa: {
    name: "Covid-19 Hackathon",
    themeColor: "#39B54A",
    msTileColor: "#39B54A",
    manifestOptions: {
      background_color: "#39B54A"
    }
  }
};

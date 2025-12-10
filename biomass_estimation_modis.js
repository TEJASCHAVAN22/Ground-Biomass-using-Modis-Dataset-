// ======================================================
// 🌾 Biomass Estimation using MODIS GPP & NPP
// ======================================================
//
// Save this file and paste into the Google Earth Engine Code Editor:
// https://code.earthengine.google.com/
// ------------------------------------------------------

// -----------------------------
// Configuration (edit as needed)
// -----------------------------
var AOI_ASSET = 'projects/gee-trial2/assets/IND_Shapefiles/IND'; // AOI asset path
var AOI_OBJECTID = 30; // filter value for OBJECTID in AOI asset
var START_YEAR = 2023;
var END_YEAR = 2024;
var REPROJECT_CRS = 'EPSG:4326';
var REPROJECT_SCALE = 500; // meters
var BIOMASS_MULTIPLIER = 2.5; // conversion from NPP8 to biomass (empirical)

// ======================================================
// 🔹 Step 1: Define Area of Interest (AOI)
// ======================================================
var aoi = ee.FeatureCollection(AOI_ASSET)
  .filter(ee.Filter.eq('OBJECTID', AOI_OBJECTID));
Map.centerObject(aoi, 7);

// ======================================================
// 🔹 Step 2: Define Time Range
// ======================================================
var startdate = ee.Date.fromYMD(START_YEAR, 1, 1);
var enddate = ee.Date.fromYMD(END_YEAR, 12, 31);

// ======================================================
// 🔹 Step 3: Load MODIS GPP & NPP
// ======================================================
var gpp = ee.ImageCollection("MODIS/061/MOD17A2HGF")
  .filterDate(startdate, enddate)
  .select("Gpp");

var npp = ee.ImageCollection("MODIS/061/MOD17A3HGF")
  .filterDate(startdate, enddate)
  .select("Npp");

// ======================================================
// 🔹 Step 4: Calculate NPP8
// ======================================================
var myNpp = function(myimg) {
  var d = ee.Date(myimg.get('system:time_start'));
  var y = d.get('year').toInt();

  var GPPy = ee.Image(gpp.filter(ee.Filter.calendarRange(y, y, 'year')).sum());
  var NPPy = ee.Image(npp.filter(ee.Filter.calendarRange(y, y, 'year')).mean());

  var npp8 = myimg.expression(
    '(GGP8 / GPPy) * NPPy',
    {GGP8: myimg, GPPy: GPPy, NPPy: NPPy}
  ).rename('NPP8');

  return npp8.copyProperties(myimg, ['system:time_start']);
};

// ======================================================
// 🔹 Step 5: Reproject & Compute NPP8
// ======================================================
var gppReproj = gpp.map(function(img) {
  return img.reproject({crs: REPROJECT_CRS, scale: REPROJECT_SCALE});
});

var npp8Collection = gppReproj.map(myNpp);

// ======================================================
// 🔹 Step 6: Visualize NPP8
// ======================================================
var npp_viz = {min: 0.0, max: 300, palette: ["ff0000", "f0ff00", "004717"]};
Map.addLayer(npp8Collection.mean().clip(aoi), npp_viz, "Mean NPP8");

// ======================================================
// 🔹 Step 7: Convert to Biomass
// ======================================================
var biomassCollection = npp8Collection.map(function(img) {
  return img.multiply(BIOMASS_MULTIPLIER)
            .rename('Biomass')
            .copyProperties(img, ['system:time_start']);
});

var biomassMean = biomassCollection.mean().clip(aoi);

// ======================================================
// 🔹 Step 8: Visualize Biomass
// ======================================================
var biomass_viz = {min: 100, max: 800, palette: ["green", "yellow", "orange", "red"]};
Map.addLayer(biomassMean, biomass_viz, 'Mean Biomass');

// ======================================================
// 🔹 Step 9: Add High–Medium–Low Legend
// ======================================================
function addBiomassLegend() {
  var legend = ui.Panel({
    style: {
      position: 'bottom-left',
      padding: '8px 15px',
      backgroundColor: 'white',
      border: '1px solid black'
    }
  });

  var legendTitle = ui.Label({
    value: 'Ground Biomass Classification',
    style: {fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0'}
  });
  legend.add(legendTitle);

  var categories = [
    {name: 'Low (100–300)', color: 'green'},
    {name: 'Medium (301–600)', color: 'yellow'},
    {name: 'High (601–800)', color: 'red'}
  ];

  categories.forEach(function(cat) {
    var colorBox = ui.Label({
      style: {
        backgroundColor: cat.color,
        padding: '8px',
        margin: '0 0 4px 0'
      }
    });

    var description = ui.Label({
      value: cat.name,
      style: {margin: '0 0 4px 6px'}
    });

    var row = ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')
    });

    legend.add(row);
  });

  Map.add(legend);
}

// Call legend function
addBiomassLegend();

// ======================================================
// 🔹 Step 10: Biomass Time-Series Chart
// ======================================================
var biomassChart = ui.Chart.image.seriesByRegion({
  imageCollection: biomassCollection,
  regions: aoi,
  reducer: ee.Reducer.mean(),
  band: 'Biomass',
  scale: REPROJECT_SCALE,
  seriesProperty: 'system:time_start'
}).setOptions({
  title: 'Biomass Production',
  hAxis: {title: 'Time'},
  vAxis: {title: 'Biomass (Kg/m²)'},
  lineWidth: 2,
  pointSize: 4
});

print(biomassChart);

// ======================================================
// Optional: Export mean biomass to Drive (uncomment to use)
// ======================================================
// Export.image.toDrive({
//   image: biomassMean,
//   description: 'mean_biomass_export',
//   folder: 'EarthEngineExports',
//   fileNamePrefix: 'mean_biomass_' + START_YEAR + '-' + END_YEAR,
//   scale: REPROJECT_SCALE,
//   region: aoi.geometry().bounds(),
//   maxPixels: 1e13
// });
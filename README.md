# 🌾 🚀 Ground Biomass Estimation using MODIS (GPP & NPP)

[![Earth Engine](https://img.shields.io/badge/Google-Earth%20Engine-4285F4?logo=google)](https://earthengine.google.com/)
[![MODIS](https://img.shields.io/badge/MODIS-Datasets-FF6F00?logo=earth))](https://modis.gsfc.nasa.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)]

A clear, well-documented Google Earth Engine (GEE) script to estimate ground biomass using MODIS GPP & NPP products. This repository includes the script, visualization, and guidance to reproduce the biomass map and time-series for a chosen Area of Interest (AOI).

---

Table of contents
- 📌 Introduction
- 🎯 Aim
- 📝 Objectives
- 🧭 Methodology
- 📊 Analysis & Interpretation
- 🖼️ Output & Visualization
- ⚙️ How to Run
- 📚 References
- ✍️ Author
- 🧾 License

---

📌 Introduction
This project estimates ground biomass from MODIS Gross Primary Productivity (GPP) and Net Primary Productivity (NPP) products using a NPP8-based approach and a simple conversion factor to biomass. The script processes imagery for a user-defined AOI, creates maps of mean biomass, and produces a time-series chart for monitoring changes over time.

---

🎯 Aim
To compute and visualize ground biomass (Kg/m²) over a specified AOI using MODIS GPP & NPP products in Google Earth Engine, delivering both spatial maps and temporal charts to aid environmental analysis and decision-making.

---

📝 Objectives
- Load and filter MODIS GPP & NPP imagery for a user-specified time range.
- Compute a derived NPP8 product using published relationships between GPP and NPP.
- Convert NPP8 to a biomass estimate using a scaling factor.
- Visualize mean biomass and classify it into Low / Medium / High categories.
- Produce a time-series chart of biomass for the AOI.

---

🧭 Methodology
1. Define the AOI (FeatureCollection or geometry).  
2. Set the analysis time range (e.g., 2023-01-01 to 2024-12-31).  
3. Load MODIS collections:
   - MODIS/061/MOD17A2HGF (Gpp)
   - MODIS/061/MOD17A3HGF (Npp)
4. For each GPP image, compute NPP8 using the yearly GPP sum and NPP mean:
   - NPP8 = (GGP8 / GPPy) * NPPy
   - Where GGP8 is the input GPP image, GPPy is yearly GPP sum and NPPy is yearly mean NPP.
5. Reproject images to EPSG:4326 at 500 m to ensure consistent scale.
6. Convert NPP8 to Biomass using a multiplier (e.g., 2.5).
7. Compute mean biomass across the period and clip to AOI.
8. Visualize results and create a Low/Medium/High legend and a time-series chart.

---

📊 Analysis & Interpretation
- Mean biomass map: helps identify spatial patterns (high productivity vs. low).
- Classification buckets (example ranges):
  - Low: 100–300 Kg/m² — lower vegetation density or stressed areas.
  - Medium: 301–600 Kg/m² — moderate vegetation cover.
  - High: 601–800 Kg/m² — dense vegetation or productive zones.
- Time-series: reveals seasonal trends, abrupt changes (e.g., disturbance), and inter-annual variability.
- Caveats:
  - The conversion factor (2.5) is empirical — verify against field data.
  - MODIS resolution (500 m) limits detection of small-scale heterogeneity.
  - Cloud/sensor artifacts and landcover changes can influence results.

---

🖼️ Output & Visualization
- Map layers added to the GEE map:
  - Mean NPP8 (visualized)
  - Mean Biomass (visualized with palette: green → yellow → orange → red)
- Legend: a small UI panel showing Low / Medium / High classifications.
- Time-series chart: mean biomass over time for the AOI (line chart).

Example visualization settings used:
- NPP8 viz: min = 0, max = 300, palette = ["ff0000", "f0ff00", "004717"]
- Biomass viz: min = 100, max = 800, palette = ["green", "yellow", "orange", "red"]

---

⚙️ How to Run
1. Open Google Earth Engine Code Editor: https://code.earthengine.google.com/
2. Create or import your AOI asset. Example AOI used in this repo:
   - projects/gee-trial2/assets/IND_Shapefiles/IND (OBJECTID filter used in script)
3. Copy & paste the script from this repository into the GEE editor.
4. Adjust:
   - AOI selector (OBJECTID or geometry)
   - Date range (startdate, enddate)
   - Any visualization parameters or the biomass multiplier
5. Run the script. Use the Map and Console to inspect outputs and the printed chart.

Tip: Export the mean biomass image to your Drive or an asset for offline analysis:
- Export.image.toDrive or Export.image.toAsset in Earth Engine.

---

📚 References
- MODIS MCD17A2HGF / MCD17A3HGF product documentation — NASA & LP DAAC
- Google Earth Engine documentation: https://developers.google.com/earth-engine
- Sample MODIS & productivity studies for NPP-to-biomass conversion (check local literature)

Suggested citation:
Please cite the MODIS product pages and any literature you used for the conversion factor when publishing results.

---

## 🏆 Author

Tejas Chavan  
* GIS Expert at Government Of Maharashtra Revenue & Forest Department  
* tejaskchavan22@gmail.com  
* +91 7028338510  

---

🧾 License
This project is provided under the MIT License — see LICENSE file for details.

---

Appendix — Key script excerpt
```js
// Example snippet (full script in repository)
var aoi = ee.FeatureCollection('projects/gee-trial2/assets/IND_Shapefiles/IND')
             .filter(ee.Filter.eq('OBJECTID', 30));
Map.centerObject(aoi, 7);
// ... load MODIS, compute NPP8, convert to Biomass, add legend and chart ...
```

If you'd like, I can:
- Add the complete script as an example code file in the repo,
- Provide an export snippet to save results to Drive/Assets, or
- Generate a short poster-style README image showing the map + legend.

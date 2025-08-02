# Bioregion Data Directory

## Required Files

### `bioregions.geojson`
This directory should contain the bioregions GeoJSON file for the interactive bioregion explorer.

**Format Expected:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "bioregion_id",
      "properties": {
        "name": "Bioregion Name",
        "description": "Detailed description of the bioregion",
        "biome": "Biome classification",
        "area_km2": 123456,
        "countries": ["United States", "Canada"],
        "climate": "Climate description"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], [lng, lat], ...]]
      }
    }
  ]
}
```

## Data Sources

For authentic bioregion data, consider these sources:

1. **One Earth Navigator**: https://www.oneearth.org/
   - Comprehensive bioregion classification system
   - Global coverage with detailed metadata

2. **WWF Ecoregions**: https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world
   - Terrestrial ecoregion boundaries
   - Scientific classification system

3. **EPA Ecoregions**: https://www.epa.gov/eco-research/ecoregions
   - North American focus
   - Government-maintained datasets

4. **Natural Earth Data**: https://www.naturalearthdata.com/
   - Free vector and raster map data
   - Various administrative and natural boundaries

## Usage

Once `bioregions.geojson` is added to this directory, the Bioregion Explorer will:

1. Load polygon data for interactive mapping
2. Perform point-in-polygon analysis using Turf.js
3. Display detailed bioregion information
4. Enable geographic search by ZIP code or state

## File Size Considerations

Large GeoJSON files (>10MB) may impact performance. Consider:
- Simplifying polygon geometries for faster rendering
- Using TopoJSON format for smaller file sizes
- Implementing lazy loading for large datasets
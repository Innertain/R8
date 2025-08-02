# Bioregion Explorer - Interactive Mapping Platform

A comprehensive disaster response and community resilience platform featuring an interactive bioregion explorer built with React, TypeScript, and advanced mapping capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn package manager

### Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd bioregion-explorer
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5000`

## 🗺️ Bioregion Explorer Features

### Core Functionality
- **ZIP Code Geocoding**: Enter any U.S. ZIP code to find its bioregion
- **State-Based Search**: Search by state name or abbreviation
- **Interactive Mapping**: Visual bioregion boundaries with React-Leaflet
- **Point-in-Polygon Analysis**: Precise location matching using Turf.js
- **Bioregion Details**: Comprehensive information about ecological regions

### Technical Implementation

#### Geocoding System (`src/utils/geocode.ts`)
- **Zippopotam.us API**: Real-time ZIP code to coordinates conversion
- **State Centroids**: Built-in geographic centers for all U.S. states
- **Unified Interface**: Single function handles both ZIP codes and states

#### Interactive Map (`src/components/BioregionExplorer.tsx`)
- **React-Leaflet Integration**: Professional mapping interface
- **OpenStreetMap Tiles**: Free, reliable base map data
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Dynamic Highlighting**: Selected bioregions stand out visually

#### Data Structure (`data/bioregions.geojson`)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "bioregion_unique_id",
      "properties": {
        "name": "Bioregion Name",
        "description": "Detailed ecological description",
        "biome": "Biome classification",
        "area_km2": 123456,
        "countries": ["United States", "Canada"],
        "climate": "Climate characteristics"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], [lng, lat], ...]]
      }
    }
  ]
}
```

## 📦 Dependencies

### Core Framework
- **React 18**: Modern React with TypeScript
- **Vite**: Lightning-fast development and build tool
- **TypeScript**: Type-safe development

### Mapping & Geospatial
- **Leaflet**: Industry-standard mapping library
- **React-Leaflet**: React integration for Leaflet
- **@turf/turf**: Advanced geospatial analysis
- **whatwg-fetch**: Fetch API polyfill

### UI Components
- **shadcn/ui**: Professional component library
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icon library

## 🌍 Data Sources

### Recommended Bioregion Data
1. **One Earth Navigator**: https://www.oneearth.org/
   - Global bioregion classification system
   - Scientific methodology and detailed metadata

2. **WWF Ecoregions**: https://www.worldwildlife.org/publications/terrestrial-ecoregions-of-the-world
   - Terrestrial ecoregion boundaries
   - Conservation-focused approach

3. **EPA Ecoregions**: https://www.epa.gov/eco-research/ecoregions
   - North American focus
   - Government-maintained datasets

### Geocoding Services
- **Zippopotam.us**: Free ZIP code geocoding API
- **Built-in State Data**: No external dependencies for state lookups

## 🏗️ Project Structure

```
├── src/
│   ├── components/
│   │   └── BioregionExplorer.tsx    # Main explorer component
│   ├── pages/
│   │   └── bioregion-explorer.tsx   # Page wrapper
│   ├── utils/
│   │   └── geocode.ts               # Geocoding utilities
│   └── lib/
├── data/
│   ├── bioregions.geojson          # Bioregion polygon data
│   └── README.md                   # Data documentation
├── public/
└── README.md                       # This file
```

## 🔧 Configuration

### Environment Variables
```env
# Required for full functionality
VITE_MAPBOX_TOKEN=your_mapbox_token_here  # Optional: Enhanced mapping
```

### Replit Configuration (`.replit`)
```toml
modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[[ports]]
localPort = 5000
externalPort = 80

[deployment]
run = ["npm", "start"]
build = ["npm", "run", "build"]
```

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Import project to Replit
2. Install dependencies automatically
3. Click "Run" to start development server
4. Use Replit's deployment features for production

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Development

### Adding New Bioregions
1. Update `data/bioregions.geojson` with new polygon data
2. Ensure proper GeoJSON structure with required properties
3. Test point-in-polygon functionality

### Extending Geocoding
1. Add new data sources to `src/utils/geocode.ts`
2. Implement additional location types (counties, cities, etc.)
3. Add error handling and validation

### Customizing Map Display
1. Modify `BioregionExplorer.tsx` for different base maps
2. Adjust polygon styling and interaction behavior
3. Add custom markers or overlays

## 📊 Performance Considerations

### Large GeoJSON Files
- **File Size**: Keep under 10MB for optimal performance
- **Simplification**: Use tools like `mapshaper` to reduce polygon complexity
- **Caching**: Browser caches GeoJSON data automatically
- **Lazy Loading**: Consider progressive loading for large datasets

### Optimization Tips
- **TopoJSON**: More efficient than GeoJSON for complex boundaries
- **Tile Services**: Consider pre-rendered map tiles for large regions
- **API Caching**: Implement caching for geocoding requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check `data/README.md` for data requirements
- **Issues**: Report bugs via GitHub issues
- **Community**: Join discussions in project forums

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
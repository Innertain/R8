# Major Disaster Impact Database - Update System

## Automatic Updates Strategy

### Monthly Data Collection Process
1. **FEMA Disaster Declarations** - Check monthly for new major disasters
2. **State Emergency Management** - Monitor state-level casualty reports  
3. **CDC WONDER Database** - Verify mortality data for disaster-related deaths
4. **Damage Assessment Reports** - NOAA/NWS damage surveys for economic impact

### Update Schedule
- **Monthly Review**: 1st of each month
- **Emergency Updates**: Within 48 hours for disasters with 10+ deaths
- **Annual Verification**: January - full data audit and corrections

### Data Quality Standards
- **No Mock Data**: All events verified from official government sources
- **Casualty Verification**: Cross-reference state health departments + CDC
- **Damage Figures**: Use official NOAA/FEMA damage assessments only
- **Source Attribution**: Every event includes official source documentation

### Automated Collection Sources
1. **FEMA API**: `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries`
2. **NWS Storm Events**: `https://www.ncei.noaa.gov/stormevents/`
3. **USGS Earthquake**: `https://earthquake.usgs.gov/earthquakes/feed/`
4. **InciWeb Wildfires**: `https://inciweb.nwcg.gov/incidents/`

### Implementation Plan

#### Phase 1 (Current)
- Manual curation with monthly updates
- Clear data source transparency 
- User notification of update schedule

#### Phase 2 (Next 3 months)
- Automated FEMA disaster declaration monitoring
- Weekly checks for new major declarations
- Automated casualty data verification

#### Phase 3 (6 months)
- Real-time integration with emergency management APIs
- Automated damage assessment collection
- ML-assisted event significance scoring

## User Transparency

### Data Source Display
- Prominent data source information on all views
- Clear update frequency communication
- "Last Updated" timestamps on all data
- Next scheduled update notifications

### No Mock Data Policy
- Zero tolerance for synthetic/placeholder data
- All events traceable to official government sources
- Explicit labeling if any test data is used temporarily
- Clear documentation of data collection methodology

## Maintenance Responsibilities

### Monthly Tasks
1. Check FEMA disaster declarations for new major events
2. Verify casualty numbers from state health departments
3. Update damage figures from official assessment reports
4. Add new events meeting significance criteria (10+ deaths or $100M+ damage)

### Quality Assurance
- Cross-reference multiple official sources for each event
- Verify geographic data accuracy
- Ensure chronological ordering is maintained
- Test filtering and analysis functions

This system ensures reliable, authentic disaster impact data while maintaining transparency about sources and update processes.
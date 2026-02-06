import { 
  MapPin, 
  Droplets, 
  Ruler, 
  Mountain, 
  Zap, 
  Map, 
  Waves, 
  Wind, 
  Thermometer, 
  Navigation, 
  Trees, 
  Gauge,
  Train,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layers,
  Info
} from 'lucide-react'
import { useState, useEffect } from 'react'

const getIcon = (label) => {
  const lowerLabel = label.toLowerCase()
  if (lowerLabel.includes('state') || lowerLabel.includes('river')) return <MapPin className="w-3 h-3" />
  if (lowerLabel.includes('length') || lowerLabel.includes('km') || lowerLabel.includes('alignment')) return <Ruler className="w-3 h-3" />
  if (lowerLabel.includes('terrain') || lowerLabel.includes('mountainous') || lowerLabel.includes('hilly') || lowerLabel.includes('plain')) return <Mountain className="w-3 h-3" />
  if (lowerLabel.includes('power') || lowerLabel.includes('crossing')) return <Zap className="w-3 h-3" />
  if (lowerLabel.includes('road')) return <Map className="w-3 h-3" />
  if (lowerLabel.includes('river')) return <Waves className="w-3 h-3" />
  if (lowerLabel.includes('wind') || lowerLabel.includes('gust')) return <Wind className="w-3 h-3" />
  if (lowerLabel.includes('temperature')) return <Thermometer className="w-3 h-3" />
  if (lowerLabel.includes('elevation') || lowerLabel.includes('angle')) return <Navigation className="w-3 h-3" />
  if (lowerLabel.includes('forest')) return <Trees className="w-3 h-3" />
  if (lowerLabel.includes('railway')) return <Train className="w-3 h-3" />
  if (lowerLabel.includes('speed') || lowerLabel.includes('span')) return <Gauge className="w-3 h-3" />
  return <AlertCircle className="w-3 h-3" />
}

const getValueColor = (value) => {
  if (value === 'Absence' || value === 'No') return 'text-white'
  if (value === 'Yes' || value === 'Presence') return 'text-white'
  if (typeof value === 'string' && value.includes('°')) return 'text-white'
  if (typeof value === 'string' && (value.includes('KM') || value.includes('M'))) return 'text-white'
  return 'text-white'
}

const getStatusIcon = (value) => {
  if (value === 'Absence' || value === 'No') return ""
  if (value === 'Yes' || value === 'Presence') return <CheckCircle2 className="w-3 h-3 text-green-400" />
  return null
}

function DataPanel({ label, value, header = false, icon, color = 'blue' }) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-600/20 to-blue-800/20',
      border: 'border-blue-500/30',
      hoverBorder: 'hover:border-blue-500/50',
      hoverShadow: 'hover:shadow-blue-500/20'
    },
    green: {
      bg: 'from-green-600/20 to-green-800/20',
      border: 'border-green-500/30',
      hoverBorder: 'hover:border-green-500/50',
      hoverShadow: 'hover:shadow-green-500/20'
    },
    purple: {
      bg: 'from-purple-600/20 to-purple-800/20',
      border: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-500/50',
      hoverShadow: 'hover:shadow-purple-500/20'
    },
    orange: {
      bg: 'from-orange-600/20 to-orange-800/20',
      border: 'border-orange-500/30',
      hoverBorder: 'hover:border-orange-500/50',
      hoverShadow: 'hover:shadow-orange-500/20'
    },
    red: {
      bg: 'from-red-600/20 to-red-800/20',
      border: 'border-red-500/30',
      hoverBorder: 'hover:border-red-500/50',
      hoverShadow: 'hover:shadow-red-500/20'
    },
    yellow: {
      bg: 'from-yellow-600/20 to-yellow-800/20',
      border: 'border-yellow-500/30',
      hoverBorder: 'hover:border-yellow-500/50',
      hoverShadow: 'hover:shadow-yellow-500/20'
    },
  }

  const colorStyle = colorClasses[color] || colorClasses.green

  if (header) {
    return (
      <div className="bg-black  border-l-4 border-blue-500 rounded-lg p-2 mb-2 ">
        <div className="flex items-center gap-1.5 ">
          {icon || <Layers className="w-3.5 h-3.5 text-blue-400" />}
          <div className="text-white font-bold text-sm uppercase tracking-wide">{label}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group relative border rounded-lg p-2 bg-gradient-to-br ${colorStyle.bg} ${colorStyle.border} transition-all duration-300 hover:shadow-xl ${colorStyle.hoverShadow} hover:scale-[1.02] ${colorStyle.hoverBorder} cursor-pointer`}
    >
      <div className="flex flex-col items-center justify-center mb-5">
        <div className="relative flex items-center justify-center">
          {/* Info icon instead of text label */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/50">
            <Info className="w-4 h-4 text-white" />
          </div>
          {/* Tooltip with actual label on hover */}
          <div className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 -translate-x-1/2 max-w-[300px] whitespace-normal break-words rounded-md bg-black px-3 py-1.5 text-[15px] font-semibold text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 text-center">
            {label}
          </div>
        </div>
        {getStatusIcon(value)}
      </div>
      <div
        className={`text-[16px] font-semibold ${getValueColor(value)} transition-colors duration-200 flex items-center justify-center`}
        style={{ color: '#FFFFFF' }}
      >
        {value}
      </div>  
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-900/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}

// Map Soil_Data_10km_1.json flat row to at_X_m_depth shape used by panels
function soilRawToDepthData(raw) {
  if (!raw) return { at_1_m_depth: {}, at_2_m_depth: {}, at_3_m_depth: {}, at_4_m_depth: {} }
  return {
    at_1_m_depth: {
      dry_density_gcc: raw.at_1_m_depth,
      clay: raw.col_5,
      gravel: raw.col_6,
      sand: raw.col_7,
      silt: raw.col_8,
      moisture: raw.col_9,
      bulk_density_gmcc: raw.col_10,
      liquid_limit: raw.col_11,
      plastic_limit: raw.col_12,
      plasticity_index: raw.col_13,
      max_dry_density_gmcc: raw.col_14,
      free_swelling_index: raw.col_15,
      ucs_kgcm: raw.col_16,
      soil_class: raw.col_17,
      specific_gravity: raw.col_18,
      safe_bearing_capacity: raw.col_19,
      sbc: raw.col_19
    },
    at_2_m_depth: {
      dry_density_gcc: raw.at_2_m_depth,
      clay: raw.col_22,
      gravel: raw.col_23,
      sand: raw.col_24,
      silt: raw.col_25,
      moisture: raw.col_26,
      bulk_density_gmcc: raw.col_27,
      liquid_limit: raw.col_28,
      plastic_limit: raw.col_29,
      plasticity_index: raw.col_30,
      max_dry_density_gmcc: raw.col_31,
      free_swelling_index: raw.col_32,
      ucs_kgcm: raw.col_33,
      soil_class: raw.col_34,
      specific_gravity: raw.col_35,
      safe_bearing_capacity: raw.col_36,
      sbc: raw.col_36
    },
    at_3_m_depth: {
      dry_density_gcc: raw.at_3_m_depth,
      clay: raw.col_39,
      gravel: raw.col_40,
      sand: raw.col_41,
      silt: raw.col_42,
      moisture: raw.col_43,
      bulk_density_gmcc: raw.col_44,
      liquid_limit: raw.col_45,
      plastic_limit: raw.col_46,
      plasticity_index: raw.col_47,
      max_dry_density_gmcc: raw.col_48,
      free_swelling_index: raw.col_49,
      ucs_kgcm: raw.col_50,
      soil_class: raw.col_51,
      specific_gravity: raw.col_52,
      safe_bearing_capacity: raw.col_53,
      sbc: raw.col_53
    },
    at_4_m_depth: {
      dry_density_gcc: raw.at_4_m_depth,
      clay: raw.col_57,
      gravel: raw.col_58,
      sand: raw.col_59,
      silt: raw.col_60,
      moisture: raw.col_61,
      bulk_density_gmcc: raw.col_62,
      liquid_limit: raw.col_63,
      plastic_limit: raw.col_64,
      plasticity_index: raw.col_65,
      max_dry_density_gmcc: raw.col_66,
      free_swelling_index: raw.col_67,
      ucs_kgcm: raw.col_68,
      soil_class: raw.col_69,
      specific_gravity: raw.col_70,
      safe_bearing_capacity: raw.col_71,
      sbc: raw.col_71
    }
  }
}

function DataPanels({ projectData, selectedTowerIndices, selectedSoilPoint }) {
  const [detailData, setDetailData] = useState({})
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState([])

  const displayValue = (value) => {
    if (value === undefined || value === null || value === '') return 'N/A'
    return String(value)
  }

  // Load tower details from Power_Grid_Transmission_Line_Details.json
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await fetch('/Power_Grid_Transmission_Line_Details.json')
        if (!res.ok) {
          setDetails([])
          setLoading(false)
          return
        }
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) {
          setDetails([])
          setLoading(false)
          return
        }
        const json = await res.json()
        setDetails(json?.sheets?.Sheet1 || [])
      } catch (error) {
        console.error('Error loading Power_Grid_Transmission_Line_Details.json:', error)
        setDetails([])
      } finally {
        setLoading(false)
      }
    }
    loadDetails()
  }, [])

  // Pick row from details by selected index (from filter/map) or default first row
  useEffect(() => {
    if (details.length === 0) return
    const idx = selectedTowerIndices?.[0] ?? 0
    const row = details[Math.min(idx, details.length - 1)] ?? details[0]
    setDetailData({
      state: row.state ?? '',
      river_name: row.name_of_river ?? '',
      length_km: row.length_km ?? row.line_length_km ?? '',
      plain_terrain_km: row.plain_terrain_km ?? '',
      hilly_terrain_km: row.hilly_terrain_hilly_undulated_terrain_km ?? '',
      mountainous_terrain_km: row.mountaineous_terrain_km ?? '',
      power_line_lt: row.lt ?? '',
      power_line_11kv: row['11kv'] ?? '',
      soil_investigation: row.soil_investigation_all_kind_of_soil_except_fr_hr ?? '',
      rocky_soil: row.rocky_soil ?? '',
      river_crossing_location: row.river_crossing_location ?? '',
      route_alignment_km: row.survey_route_alignment_km ?? '',
      road_crossings: row.road_railway_crossings_road_crossings_nh_sh ?? '',
      river_crossing_span_m: row['crossing_span_bank-bank'] ?? '',
      major_river_crossing: row.river_crossings_major_river_crossing ?? '',
      benching_soil: row.benching_all_kind_of_soil_except_fr_hr ?? '',
      soil_fissured_rock: row.fissured_rock ?? '',
      benching_fissured_rock: row.fissured_rock_1 ?? '',
      benching_hard_rock: row.hard_rock ?? '',
      social_revenue_forest_km: row.social_revenue_forest ?? '',
      other_area_scrubs_km: row['other_area-scrubs'] ?? '',
      polluted_line_km: row.pollution_details_line_stretch_in_polluted_areas_fog_prone_area_near_costal ?? '',
      reserved_protected_forest: row.forest_details_reserved_forest ?? row.protected_forest ?? '',
      railway_crossing_electrified: row['railway_crossing-electrified'] ?? '',
      railway_crossing_nonelectrified: row['railway_crossing-non-_electrified'] ?? '',
      elevation_m: row.elevation_m ?? '',
      angle_of_deflection: row.angle_of_deflection ?? '',
      wind_zone: row.detail_of_wind_zone_lengthwise_wind_zone ?? '',
      terrain: row.terrain ?? '',
      land_use: row.land_use ?? '',
      land_ownership_rou: row.land_ownership_rou ?? row.land_ownership ?? '',
      high_voltage_transmission_corridors: row.high_voltage_transmission_corridors ?? row.power_line_crossings_132kv_above ?? '',
      existing_linear_infrastructure: row.existing_linear_infrastructure ?? '',
      nallahs_minor_drainage: row.nallahs_minor_drainage ?? row.nallahs_and_minor_drainage_channels ?? '',
      low_lying_agricultural_waterlogging: row.low_lying_agricultural_waterlogging ?? row.low_lying_agricultural_areas_seasonal_waterlogging ?? '',
      ground_temperature: row.ground_temperature ?? row.ground_temperature_range ?? '',
      trees_between_route: row.trees_between_route ?? row.trees_between_route_km ?? '',
      population_density: row.population_density ?? '',
      safety_exclusion_zones: row.safety_exclusion_zones ?? '',
      risk_category: row.risk_category ?? '',
      risk_level: row.risk_level ?? '',
      flood_prone_zone: row.flood_prone_zone ?? row.flood_prone_zone_km ?? '',
      at_0_m_depth: row.at_0_m_depth ?? {},
      at_1_m_depth: row.at_1_m_depth ?? {},
      at_2_m_depth: row.at_2_m_depth ?? {}
    })
  }, [selectedTowerIndices, details])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900/50">
        <div className="text-gray-400">Loading data...</div>
      </div>
    )
  }

  const railwayValue =
    detailData.railway_crossing_electrified || detailData.railway_crossing_nonelectrified
      ? `${detailData.railway_crossing_electrified || 'N/A'} / ${detailData.railway_crossing_nonelectrified || 'N/A'}`
      : 'N/A'

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2 bg-gray-900/50">
     

      {/* ROUTE FEASIBILITY ASSESSMENT */}
      <DataPanel label="ROUTE FEASIBILITY ASSESSMENT" header={true} icon={<Layers className="w-3.5 h-3.5 text-amber-400" />} />
      <div className="grid grid-cols-4 gap-2">
        <DataPanel label="Land Use" value={displayValue(detailData.land_use)} color="orange" />
        <DataPanel label="Land Ownership & ROU" value={displayValue(detailData.land_ownership_rou)} color="orange" />
        <DataPanel label="Route Alignment" value={displayValue(detailData.route_alignment_km)} color="orange" />
        <DataPanel label="Road Crossing" value={displayValue(detailData.road_crossings)} color="orange" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <DataPanel label="Railway Crossing" value={displayValue(railwayValue)} color="orange" />
        <DataPanel label="High-voltage Transmission Corridors" value={displayValue(detailData.high_voltage_transmission_corridors)} color="orange" />
        <DataPanel label="Existing linear infrastructure in isolated stretches" value={displayValue(detailData.existing_linear_infrastructure)} color="orange" />
        <DataPanel label="State" value={displayValue(detailData.state)} />
      </div>

      {/* TOPOGRAPHY */}
      <DataPanel label="TOPOGRAPHY" header={true} icon={<Layers className="w-3.5 h-3.5 text-emerald-400" />} />
      <div className="grid grid-cols-1 gap-2">
        <DataPanel label="Terrain" value={displayValue(detailData.terrain)} color="green" />
      </div>

      {/* NATURAL CONSTRAINTS */}
      <DataPanel label="NATURAL CONSTRAINTS" header={true} icon={<Layers className="w-3.5 h-3.5 text-cyan-400" />} />
      <div className="grid grid-cols-3 gap-2">
        <DataPanel label="Major River Crossing" value={displayValue(detailData.major_river_crossing)} color="blue" />
        <DataPanel label="Nallahs and Minor Drainage Channels" value={displayValue(detailData.nallahs_minor_drainage)} color="blue" />
        <DataPanel label="Low-lying Agricultural Areas Seasonal Waterlogging" value={displayValue(detailData.low_lying_agricultural_waterlogging)} color="blue" />
      </div>

      {/* SAFETY & REGULATORY SCREENING */}
      <DataPanel label="SAFETY & REGULATORY SCREENING" header={true} icon={<Layers className="w-3.5 h-3.5 text-red-400" />} />
      <div className="grid grid-cols-5 gap-2">
        <DataPanel label="Ground Elevation" value={displayValue(detailData.elevation_m)} color="red" />
        <DataPanel label="Ground Temperature" value={displayValue(detailData.ground_temperature)} color="red" />
        <DataPanel label="Trees Between Route" value={displayValue(detailData.trees_between_route)} color="red" />
        <DataPanel label="Population density" value={displayValue(detailData.population_density)} color="red" />
        <DataPanel label="Safety Exclusion Zones" value={displayValue(detailData.safety_exclusion_zones)} color="red" />
      </div>

      {/* RISK IDENTIFICATION */}
      <DataPanel label="RISK IDENTIFICATION" header={true} icon={<Layers className="w-3.5 h-3.5 text-yellow-400" />} />
      <div className="grid grid-cols-3 gap-2">
        <DataPanel label="Risk Category" value={displayValue(detailData.risk_category)} color="yellow" />
        <DataPanel label="Risk Level" value={displayValue(detailData.risk_level)} color="yellow" />
        <DataPanel label="Flood Prone Zone" value={displayValue(detailData.flood_prone_zone)} color="yellow" />
      </div>

      {/* Soil At 1/2/3/4 m Depth – visible only when an orange (soil) point is selected on the map */}
      {selectedSoilPoint && (() => {
        const d = soilRawToDepthData(selectedSoilPoint.raw)
        const at1 = d.at_1_m_depth
        const at2 = d.at_2_m_depth
        const at3 = d.at_3_m_depth
        const at4 = d.at_4_m_depth
        return (
          <>
            <DataPanel label="Soil At 1 m Depth" header={true} icon={<Layers className="w-3.5 h-3.5 text-green-400" />} />
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Dry Density (g/cc)" value={at1.dry_density_gcc ?? 'N/A'} color="green" />
              <DataPanel label="Clay %" value={at1.clay ?? 'N/A'} color="green" />
              <DataPanel label="Gravel %" value={at1.gravel ?? 'N/A'} color="green" />
              <DataPanel label="Sand %" value={at1.sand ?? 'N/A'} color="green" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Silt %" value={at1.silt ?? 'N/A'} color="green" />
              <DataPanel label="Moisture %" value={at1.moisture ?? 'N/A'} color="green" />
              <DataPanel label="Bulk Density (gm/cc)" value={at1.bulk_density_gmcc != null ? Number(at1.bulk_density_gmcc).toFixed(2) : 'N/A'} color="green" />
              <DataPanel label="Liquid Limit %" value={at1.liquid_limit ?? 'N/A'} color="green" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Plastic Limit %" value={at1.plastic_limit ?? 'N/A'} color="green" />
              <DataPanel label="Plasticity Index %" value={at1.plasticity_index ?? 'N/A'} color="green" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at1.max_dry_density_gmcc != null ? Number(at1.max_dry_density_gmcc).toFixed(2) : 'N/A'} color="green" />
              <DataPanel label="Free Swelling Index %" value={at1.free_swelling_index != null ? Number(at1.free_swelling_index).toFixed(2) : 'N/A'} color="green" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="UCS (kg/cm²)" value={at1.ucs_kgcm != null ? Number(at1.ucs_kgcm).toFixed(2) : 'N/A'} color="green" />
              <DataPanel label="Soil Class" value={at1.soil_class ?? 'N/A'} color="green" />
              <DataPanel label="Specific Gravity" value={at1.specific_gravity ?? 'N/A'} color="green" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at1.safe_bearing_capacity ?? at1.sbc ?? 'N/A'} color="green" />
            </div>

            <DataPanel label="Soil At 2 m Depth" header={true} icon={<Layers className="w-3.5 h-3.5 text-blue-400" />} />
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Dry Density (g/cc)" value={at2.dry_density_gcc ?? 'N/A'} color="blue" />
              <DataPanel label="Clay %" value={at2.clay ?? 'N/A'} color="blue" />
              <DataPanel label="Gravel %" value={at2.gravel ?? 'N/A'} color="blue" />
              <DataPanel label="Sand %" value={at2.sand ?? 'N/A'} color="blue" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Silt %" value={at2.silt ?? 'N/A'} color="blue" />
              <DataPanel label="Moisture %" value={at2.moisture ?? 'N/A'} color="blue" />
              <DataPanel label="Bulk Density (gm/cc)" value={at2.bulk_density_gmcc != null ? Number(at2.bulk_density_gmcc).toFixed(2) : 'N/A'} color="blue" />
              <DataPanel label="Liquid Limit %" value={at2.liquid_limit ?? 'N/A'} color="blue" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Plastic Limit %" value={at2.plastic_limit ?? 'N/A'} color="blue" />
              <DataPanel label="Plasticity Index %" value={at2.plasticity_index ?? 'N/A'} color="blue" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at2.max_dry_density_gmcc != null ? Number(at2.max_dry_density_gmcc).toFixed(2) : 'N/A'} color="blue" />
              <DataPanel label="Free Swelling Index %" value={at2.free_swelling_index != null ? Number(at2.free_swelling_index).toFixed(2) : 'N/A'} color="blue" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="UCS (kg/cm²)" value={at2.ucs_kgcm != null ? Number(at2.ucs_kgcm).toFixed(2) : 'N/A'} color="blue" />
              <DataPanel label="Soil Class" value={displayValue(at2.soil_class)} color="blue" />
              <DataPanel label="Specific Gravity" value={displayValue(at2.specific_gravity)} color="blue" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at2.safe_bearing_capacity ?? at2.sbc ?? 'N/A'} color="blue" />
            </div>

            <DataPanel label="Soil At 3 m Depth" header={true} icon={<Layers className="w-3.5 h-3.5 text-purple-400" />} />
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Dry Density (g/cc)" value={at3.dry_density_gcc ?? 'N/A'} color="purple" />
              <DataPanel label="Clay %" value={at3.clay ?? 'N/A'} color="purple" />
              <DataPanel label="Gravel %" value={at3.gravel ?? 'N/A'} color="purple" />
              <DataPanel label="Sand %" value={at3.sand ?? 'N/A'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Silt %" value={at3.silt ?? 'N/A'} color="purple" />
              <DataPanel label="Moisture %" value={at3.moisture ?? 'N/A'} color="purple" />
              <DataPanel label="Bulk Density (gm/cc)" value={at3.bulk_density_gmcc != null ? Number(at3.bulk_density_gmcc).toFixed(2) : 'N/A'} color="purple" />
              <DataPanel label="Liquid Limit %" value={at3.liquid_limit ?? 'N/A'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Plastic Limit %" value={at3.plastic_limit ?? 'N/A'} color="purple" />
              <DataPanel label="Plasticity Index %" value={at3.plasticity_index ?? 'N/A'} color="purple" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at3.max_dry_density_gmcc != null ? Number(at3.max_dry_density_gmcc).toFixed(2) : 'N/A'} color="purple" />
              <DataPanel label="Free Swelling Index %" value={at3.free_swelling_index != null ? Number(at3.free_swelling_index).toFixed(2) : 'N/A'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="UCS (kg/cm²)" value={at3.ucs_kgcm != null ? Number(at3.ucs_kgcm).toFixed(2) : 'N/A'} color="purple" />
              <DataPanel label="Soil Class" value={displayValue(at3.soil_class)} color="purple" />
              <DataPanel label="Specific Gravity" value={displayValue(at3.specific_gravity)} color="purple" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at3.safe_bearing_capacity ?? at3.sbc ?? 'N/A'} color="purple" />
            </div>

            <DataPanel label="Soil At 4 m Depth" header={true} icon={<Layers className="w-3.5 h-3.5 text-purple-400" />} />
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Dry Density (g/cc)" value={at4.dry_density_gcc ?? 'N/A'} color="purple" />
              <DataPanel label="Clay %" value={at4.clay ?? 'N/A'} color="purple" />
              <DataPanel label="Gravel %" value={at4.gravel ?? 'N/A'} color="purple" />
              <DataPanel label="Sand %" value={at4.sand ?? 'N/A'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Silt %" value={at4.silt ?? 'N/A'} color="purple" />
              <DataPanel label="Moisture %" value={at4.moisture ?? 'N/A'} color="purple" />
              <DataPanel label="Bulk Density (gm/cc)" value={at4.bulk_density_gmcc != null ? Number(at4.bulk_density_gmcc).toFixed(2) : 'N/A'} color="purple" />
              <DataPanel label="Liquid Limit %" value={at4.liquid_limit ?? 'N/A'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="Plastic Limit %" value={at4.plastic_limit ?? 'N/A'} color="purple" />
              <DataPanel label="Plasticity Index %" value={at4.plasticity_index ?? 'N/A'} color="purple" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at4.max_dry_density_gmcc != null ? Number(at4.max_dry_density_gmcc).toFixed(2) : 'N/A'} color="purple" />
              <DataPanel label="Free Swelling Index %" value={at4.free_swelling_index != null ? Number(at4.free_swelling_index).toFixed(2) : 'N/A'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <DataPanel label="UCS (kg/cm²)" value={at4.ucs_kgcm != null ? Number(at4.ucs_kgcm).toFixed(2) : 'N/A'} color="purple" />
              <DataPanel label="Soil Class" value={displayValue(at4.soil_class)} color="purple" />
              <DataPanel label="Specific Gravity" value={displayValue(at4.specific_gravity)} color="purple" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at4.safe_bearing_capacity ?? at4.sbc ?? 'N/A'} color="purple" />
            </div>
          </>
        )
      })()}
    </div>
  )
}

export default DataPanels


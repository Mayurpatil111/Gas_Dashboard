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
  Info,
  Pin
} from 'lucide-react'
import { useState, useEffect } from 'react'

const getIcon = (label) => {
  const lowerLabel = label.toLowerCase()
  if (lowerLabel.includes('state')) return <MapPin className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('land use') || lowerLabel.includes('land ownership')) return <Map className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('route alignment') || lowerLabel.includes('length') || lowerLabel.includes('alignment')) return <Ruler className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('road crossing')) return <Map className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('railway')) return <Train className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('transmission') || lowerLabel.includes('infrastructure')) return <Zap className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('terrain') || lowerLabel.includes('mountainous') || lowerLabel.includes('hilly') || lowerLabel.includes('plain')) return <Mountain className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('tahasil')) return <MapPin className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('village')) return <MapPin className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('temperature')) return <Thermometer className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('major river') || lowerLabel.includes('river crossing')) return <Waves className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('nallahs') || lowerLabel.includes('drainage') || lowerLabel.includes('waterlogging')) return <Droplets className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('ground elevation') || lowerLabel.includes('elevation')) return <Navigation className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('trees between')) return <Trees className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('population')) return <MapPin className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('safety')) return <AlertCircle className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('risk')) return <AlertCircle className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('flood')) return <Waves className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('clay') || lowerLabel.includes('gravel') || lowerLabel.includes('sand') || lowerLabel.includes('silt') || lowerLabel.includes('soil')) return <Layers className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('density') || lowerLabel.includes('moisture') || lowerLabel.includes('liquid limit') || lowerLabel.includes('plastic') || lowerLabel.includes('ucs') || lowerLabel.includes('bearing') || lowerLabel.includes('gravity') || lowerLabel.includes('swelling')) return <Gauge className="w-4 h-4 text-white/90 shrink-0" />
  if (lowerLabel.includes('soil class')) return <Layers className="w-4 h-4 text-white/90 shrink-0" />
  return <Info className="w-4 h-4 text-white/90 shrink-0" />
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

  const cardIcon = icon != null ? icon : getIcon(label)
  return (
    <div
      className={`group relative border rounded-xl p-4 min-h-[88px] bg-gradient-to-br ${colorStyle.bg} ${colorStyle.border} transition-all duration-300 hover:shadow-xl ${colorStyle.hoverShadow} hover:scale-[1.02] ${colorStyle.hoverBorder} cursor-pointer`}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2 w-full">
          {cardIcon}
          <span className="relative group/pin inline-flex" title={label}>
            <Pin className="w-4 h-4 text-white/80 hover:text-white cursor-help shrink-0" aria-hidden />
            <span className="pointer-events-none absolute left-1/2 bottom-full z-[100] mb-1.5 -translate-x-1/2 max-w-[260px] whitespace-normal break-words rounded-md bg-black/95 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/pin:opacity-100 text-center">
              {label}
            </span>
          </span>
        </div>
        {getStatusIcon(value)}
      </div>
      <div
        className={`text-lg font-semibold mt-2 ${getValueColor(value)} transition-colors duration-200 flex items-center justify-center text-center`}
        style={{ color: '#FFFFFF' }}
      >
        {value}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-gray-900/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}

// Map Soil_Data_10km_1.json flat row to at_X_m_depth shape used by panels
// Supports both legacy (col_5, at_1_m_depth) and Updated Soil Data (clay, at_1_m_depth_dry_density_g_cc, clay_1, etc.)
function soilRawToDepthData(raw) {
  if (!raw) return { at_1_m_depth: {}, at_2_m_depth: {}, at_3_m_depth: {}, at_4_m_depth: {} }
  const isNewFormat = raw.at_1_m_depth_dry_density_g_cc != null || raw.clay != null
  if (isNewFormat) {
    return {
      at_1_m_depth: {
        dry_density_gcc: raw.at_1_m_depth_dry_density_g_cc,
        clay: raw.clay,
        gravel: raw.gravel,
        sand: raw.sand,
        silt: raw.silt,
        moisture: raw.moisture,
        bulk_density_gmcc: raw.bulk_density_gm_cc,
        liquid_limit: raw.liquid_limit,
        plastic_limit: raw.plastic_limit,
        plasticity_index: raw.plasticity_index,
        max_dry_density_gmcc: raw.max_dry_density_gm_cc,
        free_swelling_index: raw.free_swelling_index,
        ucs_kgcm: raw.ucs_kg_cm,
        soil_class: raw.soil_class,
        specific_gravity: raw.specific_gravity,
        safe_bearing_capacity: raw.safe_bearing_capacity_t_m,
        sbc: raw.safe_bearing_capacity_t_m
      },
      at_2_m_depth: {
        dry_density_gcc: raw.at_2_m_depth_dry_density_g_cc,
        clay: raw.clay_1,
        gravel: raw.gravel_1,
        sand: raw.sand_1,
        silt: raw.silt_1,
        moisture: raw.moisture_1,
        bulk_density_gmcc: raw.bulk_density_gm_cc_1,
        liquid_limit: raw.liquid_limit_1,
        plastic_limit: raw.plastic_limit_1,
        plasticity_index: raw.plasticity_index_1,
        max_dry_density_gmcc: raw.max_dry_density_gm_cc_1,
        free_swelling_index: raw.free_swelling_index_1,
        ucs_kgcm: raw.ucs_kg_cm_1,
        soil_class: raw.soil_class_1,
        specific_gravity: raw.specific_gravity_1,
        safe_bearing_capacity: raw.safe_bearing_capacity_t_m_1,
        sbc: raw.safe_bearing_capacity_t_m_1
      },
      at_3_m_depth: {
        dry_density_gcc: raw.at_3_m_depth_dry_density_g_cc,
        clay: raw.clay_2,
        gravel: raw.gravel_2,
        sand: raw.sand_2,
        silt: raw.silt_2,
        moisture: raw.moisture_2,
        bulk_density_gmcc: raw.bulk_density_gm_cc_2,
        liquid_limit: raw.liquid_limit_2,
        plastic_limit: raw.plastic_limit_2,
        plasticity_index: raw.plasticity_index_2,
        max_dry_density_gmcc: raw.max_dry_density_gm_cc_2,
        free_swelling_index: raw.free_swelling_index_2,
        ucs_kgcm: raw.ucs_kg_cm_2,
        soil_class: raw.soil_class_2,
        specific_gravity: raw.specific_gravity_2,
        safe_bearing_capacity: raw.safe_bearing_capacity_t_m_2,
        sbc: raw.safe_bearing_capacity_t_m_2
      },
      at_4_m_depth: {
        dry_density_gcc: raw.at_4_m_depth_dry_density_g_cc,
        clay: raw.clay_3,
        gravel: raw.gravel_3,
        sand: raw.sand_3,
        silt: raw.silt_3,
        moisture: raw.moisture_3,
        bulk_density_gmcc: raw.bulk_density_gm_cc_3,
        liquid_limit: raw.liquid_limit_3,
        plastic_limit: raw.plastic_limit_3,
        plasticity_index: raw.plasticity_index_3,
        max_dry_density_gmcc: raw.max_dry_density_gm_cc_3,
        free_swelling_index: raw.free_swelling_index_3,
        ucs_kgcm: raw.ucs_kg_cm_3,
        soil_class: raw.soil_class_3,
        specific_gravity: raw.specific_gravity_3,
        safe_bearing_capacity: raw.safe_bearing_capacity_t_m_3,
        sbc: raw.safe_bearing_capacity_t_m_3
      }
    }
  }
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

// Get chainage value from a DATA_Gas_Pipeline row (key like chainage_228579000000001)
function getChainageFromGasRow(row) {
  if (!row || typeof row !== 'object') return null
  const key = Object.keys(row).find((k) => k.toLowerCase().startsWith('chainage_'))
  return key ? row[key] : null
}

// Get value from row by key prefix (handles normalized keys like tahasil_forest)
function getRowVal(row, ...keys) {
  if (!row || typeof row !== 'object') return ''
  for (const k of keys) {
    if (row[k] != null && row[k] !== '') return String(row[k])
  }
  const key = Object.keys(row).find((rk) => rk.toLowerCase().includes((keys[0] || '').toLowerCase()))
  return key ? (row[key] != null && row[key] !== '' ? String(row[key]) : '') : ''
}

function gasRowToDetailData(row) {
  if (!row) return {}
  return {
    state: row.state_odisha ?? '',
    land_use: row.land_use_agriculture ?? '',
    land_ownership_rou: row.land_ownership_rou_farm ?? '',
    route_alignment_km: row.distance_0 != null ? `${row.distance_0} km` : '',
    road_crossings: row.road_crossing_absence ?? '',
    railway_crossing_electrified: row.railway_crossing_absence ?? '',
    railway_crossing_nonelectrified: '',
    high_voltage_transmission_corridors: row.transmission_line_crossing_absence ?? '',
    existing_linear_infrastructure: row.infrastruture_absence ?? '',
    terrain: row.terrain_plain ?? '',
    tahasil: getRowVal(row, 'tahasil_forest', 'tahasil'),
    village: getRowVal(row, 'village_forest', 'village'),
    major_river_crossing: row.major_river_crossing_absence ?? '',
    nallahs_minor_drainage: row.nallahs_minor_drainage_absence ?? '',
    low_lying_agricultural_waterlogging: row.waterlogging_area_acres_0 != null ? `${row.waterlogging_area_acres_0} acres` : '',
    elevation_m: row.elevation_1884 ?? '',
    ground_temperature: row.ground_temperature_20c ?? '',
    trees_between_route: row.tress_between_gas_pipeline_8 ?? '',
    population_density: '',
    safety_exclusion_zones: '',
    risk_category: '',
    risk_level: '',
    flood_prone_zone: row.flood_prone_zone_area_acres_0 != null ? `${row.flood_prone_zone_area_acres_0} acres` : '',
    river_name: '',
    length_km: '',
    plain_terrain_km: '',
    hilly_terrain_km: '',
    mountainous_terrain_km: '',
    power_line_lt: '',
    power_line_11kv: '',
    soil_investigation: '',
    rocky_soil: '',
    river_crossing_location: '',
    river_crossing_span_m: '',
    benching_soil: '',
    soil_fissured_rock: '',
    benching_fissured_rock: '',
    benching_hard_rock: '',
    social_revenue_forest_km: '',
    other_area_scrubs_km: '',
    polluted_line_km: '',
    reserved_protected_forest: '',
    angle_of_deflection: '',
    wind_zone: '',
    at_0_m_depth: {},
    at_1_m_depth: {},
    at_2_m_depth: {}
  }
}

function DataPanels({ projectData, selectedTowerIndices, selectedSoilPoint, selectedChainage }) {
  const [detailData, setDetailData] = useState({})
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState([])
  const [gasPipelineRows, setGasPipelineRows] = useState([])

  const displayValue = (value) => {
    if (value === undefined || value === null || value === '') return 'Absence'
    return String(value)
  }

  // Load DATA_Gas_Pipeline.json for chainage-based panel data
  useEffect(() => {
    const loadGasPipeline = async () => {
      try {
        const res = await fetch('/DATA_Gas_Pipeline.json')
        if (!res.ok) return
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const json = await res.json()
        setGasPipelineRows(json?.sheets?.Sheet1 || [])
      } catch (error) {
        console.error('Error loading DATA_Gas_Pipeline.json:', error)
      }
    }
    loadGasPipeline()
  }, [])

  // Load tower details from Power_Grid_Transmission_Line_Details.json (optional)
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

    // When chainage is selected from dropdown: use DATA_Gas_Pipeline row for panel data
  useEffect(() => {
    if (selectedChainage && selectedChainage !== 'All' && gasPipelineRows.length > 0) {
      const chainageNum = parseFloat(selectedChainage)
      let match = gasPipelineRows.find((row) => {
        const rowChainage = getChainageFromGasRow(row)
        if (rowChainage == null) return false
        const rowNum = parseFloat(rowChainage)
        if (Number.isNaN(chainageNum) || Number.isNaN(rowNum)) return false
        return Math.abs(chainageNum - rowNum) < 0.001
      })
      if (!match && !Number.isNaN(chainageNum)) {
        const withNum = gasPipelineRows
          .map((row) => ({ row, chainage: getChainageFromGasRow(row) }))
          .filter((x) => x.chainage != null)
          .map((x) => ({ ...x, num: parseFloat(x.chainage) }))
          .filter((x) => !Number.isNaN(x.num))
        if (withNum.length > 0) {
          const closest = withNum.reduce((best, cur) =>
            Math.abs(cur.num - chainageNum) < Math.abs(best.num - chainageNum) ? cur : best
          )
          match = closest.row
        }
      }
      if (match) {
        setDetailData(gasRowToDetailData(match))
        return
      }
    }

    // Fallback: use Power_Grid details by tower index
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
      tahasil: row.tahasil ?? row.tahasil_forest ?? '',
      village: row.village ?? row.village_forest ?? '',
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
  }, [selectedChainage, gasPipelineRows, selectedTowerIndices, details])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900/50">
        <div className="text-gray-400">Loading data...</div>
      </div>
    )
  }

  const railwayValue =
    detailData.railway_crossing_electrified || detailData.railway_crossing_nonelectrified
      ? `${detailData.railway_crossing_electrified }`
      : ''

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2 bg-gray-900/50">
     

      {/* ROUTE FEASIBILITY ASSESSMENT */}
      <DataPanel label="ROUTE FEASIBILITY ASSESSMENT" header={true} icon={<Layers className="w-3.5 h-3.5 text-amber-400" />} />
      <div className="grid grid-cols-4 gap-1">
        <DataPanel label="Land Use" value={displayValue(detailData.land_use)} color="orange" />
        <DataPanel label="Land Ownership & ROU" value={displayValue(detailData.land_ownership_rou)} color="orange" />
        <DataPanel label="Route Alignment" value={detailData.route_alignment_km != null && detailData.route_alignment_km !== '' ? `${(parseFloat(detailData.route_alignment_km) || 0).toFixed(2)} km` : 'Absence'} color="orange" />
        <DataPanel label="Road Crossing" value={displayValue(detailData.road_crossings)} color="orange" />
      </div>
      <div className="grid grid-cols-4 gap-1">
        <DataPanel label="Railway Crossing" value={displayValue(railwayValue)} color="orange" />
        <DataPanel label="High-voltage Transmission Corridors" value={displayValue(detailData.high_voltage_transmission_corridors)} color="orange" />
        <DataPanel label="Existing linear infrastructure in isolated stretches" value={displayValue(detailData.existing_linear_infrastructure)} color="orange" />
        <DataPanel label="State" value={displayValue(detailData.state)} />
      </div>

      {/* TOPOGRAPHY */}
      <DataPanel label="TOPOGRAPHY" header={true} icon={<Layers className="w-3.5 h-3.5 text-emerald-400" />} />
      <div className="grid grid-cols-4 gap-1" >
        <DataPanel label="Terrain" value={displayValue(detailData.terrain)} color="green" />
        <DataPanel label="Tahasil" value={displayValue(detailData.tahasil)} color="green" />
        <DataPanel label="Village" value={displayValue(detailData.village)} color="green" />
        <DataPanel label="Ground Temperature" value={displayValue(detailData.ground_temperature)} color="green" />
      </div>

      {/* NATURAL CONSTRAINTS */}
      <DataPanel label="NATURAL CONSTRAINTS" header={true} icon={<Layers className="w-3.5 h-3.5 text-cyan-400" />} />
      <div className="grid grid-cols-3 gap-1">
        <DataPanel label="Major River Crossing" value={displayValue(detailData.major_river_crossing)} color="blue" />
        <DataPanel label="Nallahs and Minor Drainage Channels" value={displayValue(detailData.nallahs_minor_drainage)} color="blue" />
        <DataPanel label="Low-lying Agricultural Areas Seasonal Waterlogging" value={displayValue(detailData.low_lying_agricultural_waterlogging)} color="blue" />
      </div>

      {/* SAFETY & REGULATORY SCREENING */}
      <DataPanel label="SAFETY & REGULATORY SCREENING" header={true} icon={<Layers className="w-3.5 h-3.5 text-red-400" />} />
      <div className="grid grid-cols-5 gap-1">
        <DataPanel label="Ground Elevation" value={displayValue(detailData.elevation_m)} color="red" />
        <DataPanel label="Ground Temperature" value={displayValue(detailData.ground_temperature)} color="red" />
        <DataPanel label="Trees Between Route" value={displayValue(detailData.trees_between_route)} color="red" />
        <DataPanel label="Population density" value={displayValue(detailData.population_density)} color="red" />
        <DataPanel label="Safety Exclusion Zones" value={displayValue(detailData.safety_exclusion_zones)} color="red" />
      </div>

      {/* RISK IDENTIFICATION */}
      <DataPanel label="RISK IDENTIFICATION" header={true} icon={<Layers className="w-3.5 h-3.5 text-yellow-400" />} />
      <div className="grid grid-cols-3 gap-1">
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
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at1.dry_density_gcc ?? 'Absence'} color="green" />
              <DataPanel label="Clay %" value={at1.clay ?? 'Absence'} color="green" />
              <DataPanel label="Gravel %" value={at1.gravel ?? 'Absence'} color="green" />
              <DataPanel label="Sand %" value={at1.sand ?? 'Absence'} color="green" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at1.silt ?? 'Absence'} color="green" />
              <DataPanel label="Moisture %" value={at1.moisture ?? 'Absence'} color="green" />
              <DataPanel label="Bulk Density (gm/cc)" value={at1.bulk_density_gmcc != null ? Number(at1.bulk_density_gmcc).toFixed(2) : 'Absence'} color="green" />
              <DataPanel label="Liquid Limit %" value={at1.liquid_limit ?? 'Absence'} color="green" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at1.plastic_limit ?? 'Absence'} color="green" />
              <DataPanel label="Plasticity Index %" value={at1.plasticity_index ?? 'Absence'} color="green" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at1.max_dry_density_gmcc != null ? Number(at1.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="green" />
              <DataPanel label="Free Swelling Index %" value={at1.free_swelling_index != null ? Number(at1.free_swelling_index).toFixed(2) : 'Absence'} color="green" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at1.ucs_kgcm != null ? Number(at1.ucs_kgcm).toFixed(2) : 'Absence'} color="green" />
              <DataPanel label="Soil Class" value={at1.soil_class ?? 'Absence'} color="green" />
              <DataPanel label="Specific Gravity" value={at1.specific_gravity ?? 'Absence'} color="green" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at1.safe_bearing_capacity ?? at1.sbc ?? 'Absence'} color="green" />
            </div>

            <DataPanel label="Soil At 2 m Depth" header={true} icon={<Layers className="w-3.5 h-3.5 text-blue-400" />} />
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at2.dry_density_gcc ?? 'Absence'} color="blue" />
              <DataPanel label="Clay %" value={at2.clay ?? 'Absence'} color="blue" />
              <DataPanel label="Gravel %" value={at2.gravel ?? 'Absence'} color="blue" />
              <DataPanel label="Sand %" value={at2.sand ?? 'Absence'} color="blue" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at2.silt ?? 'Absence'} color="blue" />
              <DataPanel label="Moisture %" value={at2.moisture ?? 'Absence'} color="blue" />
              <DataPanel label="Bulk Density (gm/cc)" value={at2.bulk_density_gmcc != null ? Number(at2.bulk_density_gmcc).toFixed(2) : 'Absence'} color="blue" />
              <DataPanel label="Liquid Limit %" value={at2.liquid_limit ?? 'Absence'} color="blue" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at2.plastic_limit ?? 'Absence'} color="blue" />
              <DataPanel label="Plasticity Index %" value={at2.plasticity_index ?? 'Absence'} color="blue" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at2.max_dry_density_gmcc != null ? Number(at2.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="blue" />
              <DataPanel label="Free Swelling Index %" value={at2.free_swelling_index != null ? Number(at2.free_swelling_index).toFixed(2) : 'Absence'} color="blue" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at2.ucs_kgcm != null ? Number(at2.ucs_kgcm).toFixed(2) : 'Absence'} color="blue" />
              <DataPanel label="Soil Class" value={displayValue(at2.soil_class)} color="blue" />
              <DataPanel label="Specific Gravity" value={displayValue(at2.specific_gravity)} color="blue" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at2.safe_bearing_capacity ?? at2.sbc ?? 'Absence'} color="blue" />
            </div>

            <DataPanel label="Soil At 3 m Depth" header={true} icon={<Layers className="w-3.5 h-3.5 text-purple-400" />} />
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at3.dry_density_gcc ?? 'Absence'} color="purple" />
              <DataPanel label="Clay %" value={at3.clay ?? 'Absence'} color="purple" />
              <DataPanel label="Gravel %" value={at3.gravel ?? 'Absence'} color="purple" />
              <DataPanel label="Sand %" value={at3.sand ?? 'Absence'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at3.silt ?? 'Absence'} color="purple" />
              <DataPanel label="Moisture %" value={at3.moisture ?? 'Absence'} color="purple" />
              <DataPanel label="Bulk Density (gm/cc)" value={at3.bulk_density_gmcc != null ? Number(at3.bulk_density_gmcc).toFixed(2) : 'Absence'} color="purple" />
              <DataPanel label="Liquid Limit %" value={at3.liquid_limit ?? 'Absence'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at3.plastic_limit ?? 'Absence'} color="purple" />
              <DataPanel label="Plasticity Index %" value={at3.plasticity_index ?? 'Absence'} color="purple" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at3.max_dry_density_gmcc != null ? Number(at3.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="purple" />
              <DataPanel label="Free Swelling Index %" value={at3.free_swelling_index != null ? Number(at3.free_swelling_index).toFixed(2) : 'Absence'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at3.ucs_kgcm != null ? Number(at3.ucs_kgcm).toFixed(2) : 'Absence'} color="purple" />
              <DataPanel label="Soil Class" value={displayValue(at3.soil_class)} color="purple" />
              <DataPanel label="Specific Gravity" value={displayValue(at3.specific_gravity)} color="purple" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at3.safe_bearing_capacity ?? at3.sbc ?? 'Absence'} color="purple" />
            </div>

            <DataPanel label="Soil At 4 m Depth" header={true} icon={<Layers className="w-3.5 h-3.5 text-purple-400" />} />
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at4.dry_density_gcc ?? 'Absence'} color="purple" />
              <DataPanel label="Clay %" value={at4.clay ?? 'Absence'} color="purple" />
              <DataPanel label="Gravel %" value={at4.gravel ?? 'Absence'} color="purple" />
              <DataPanel label="Sand %" value={at4.sand ?? 'Absence'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at4.silt ?? 'Absence'} color="purple" />
              <DataPanel label="Moisture %" value={at4.moisture ?? 'Absence'} color="purple" />
              <DataPanel label="Bulk Density (gm/cc)" value={at4.bulk_density_gmcc != null ? Number(at4.bulk_density_gmcc).toFixed(2) : 'Absence'} color="purple" />
              <DataPanel label="Liquid Limit %" value={at4.liquid_limit ?? 'Absence'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at4.plastic_limit ?? 'Absence'} color="purple" />
              <DataPanel label="Plasticity Index %" value={at4.plasticity_index ?? 'Absence'} color="purple" />
              <DataPanel label="Max Dry Density (gm/cc)" value={at4.max_dry_density_gmcc != null ? Number(at4.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="purple" />
              <DataPanel label="Free Swelling Index %" value={at4.free_swelling_index != null ? Number(at4.free_swelling_index).toFixed(2) : 'Absence'} color="purple" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at4.ucs_kgcm != null ? Number(at4.ucs_kgcm).toFixed(2) : 'Absence'} color="purple" />
              <DataPanel label="Soil Class" value={displayValue(at4.soil_class)} color="purple" />
              <DataPanel label="Specific Gravity" value={displayValue(at4.specific_gravity)} color="purple" />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at4.safe_bearing_capacity ?? at4.sbc ?? 'Absence'} color="purple" />
            </div>
          </>
        )
      })()}
    </div>
  )
}

export default DataPanels


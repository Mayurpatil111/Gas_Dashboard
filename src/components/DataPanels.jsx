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
  Pin,
  X
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

// Clean encoding issues - replace corrupted characters with correct ones
const cleanEncoding = (value) => {
  if (typeof value !== 'string') return value
  
  // Replace corrupted degree symbols and other common encoding issues
  // Handle various corrupted degree symbol patterns
  let cleaned = value
    .replace(/\uFFFD/g, '°') // Replace replacement character with degree symbol
    .replace(/[^\x00-\x7F][^\x00-\x7F]/g, '°') // Replace corrupted degree in middle
    .replace(/–/g, '-') // Replace en-dash with hyphen
    .replace(/—/g, '-') // Replace em-dash with hyphen
    .replace(/"/g, '"') // Replace corrupted quotes
    .replace(/'/g, "'") // Replace corrupted apostrophe
    .replace(/…/g, '...') // Replace ellipsis
    .trim()
  
  // Fix common patterns like "20C" -> "20°C" and "20.217248N" -> "20.217248°N"
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)([NS]|C)/g, '$1°$2')
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)([EW])/g, '$1°$2')
  
  return cleaned
}

// Modal component for displaying full values
function ValueModal({ isOpen, onClose, label, value }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{label}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="text-white text-lg whitespace-pre-wrap break-words">
          {value || 'Absence'}
        </div>
      </div>
    </div>
  )
}

function DataPanel({ label, value, header = false, icon, color = 'blue', showLabelText = false, hideIcon = false }) {
  const [showModal, setShowModal] = useState(false)
  const valueStr = String(value || 'Absence')
  const isLongValue = valueStr.length > 30 || valueStr.includes('\n') || valueStr.includes(',')
  
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
      <div className="bg-blue-600 border-l-4 border-blue-500 rounded-lg p-2 mb-2">
        <div className="flex items-center gap-1.5 ">
          {!hideIcon && (icon || <Layers className="w-3.5 h-3.5 text-blue-400" />)}
          {/* Show header text with Times New Roman and normal casing */}
          <div
            className="text-white font-bold text-lg tracking-wide font-medium"
          >
            {label}
          </div>
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
        {showLabelText ? (
          <div className="text-sm font-semibold text-white/90 text-center w-full">
            {label}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full">
            {!hideIcon && cardIcon}
            {!hideIcon && (
              <span className="relative group/pin inline-flex" title={label}>
                <Pin className="w-4 h-4 text-white/80 hover:text-white cursor-help shrink-0" aria-hidden />
                <span className="pointer-events-none absolute left-1/2 bottom-full z-[100] mb-1.5 -translate-x-1/2 max-w-[260px] whitespace-normal break-words rounded-md bg-black/95 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/pin:opacity-100 text-center">
                  {label}
                </span>
              </span>
            )}
          </div>
        )}
        {getStatusIcon(value)}
      </div>
      <div
        className={`text-lg font-semibold mt-2 ${getValueColor(value)} transition-colors duration-200 flex items-center justify-center text-center ${isLongValue ? 'cursor-pointer hover:underline' : ''}`}
        style={{ color: '#FFFFFF' }}
        onClick={isLongValue ? () => setShowModal(true) : undefined}
        title={isLongValue ? 'Click to view full value' : ''}
      >
        {isLongValue ? (
          <span 
            className="break-words overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              maxHeight: '3em',
              lineHeight: '1.5em'
            }}
          >
            {cleanEncoding(valueStr)}
          </span>
        ) : (
          <span className="break-words">{cleanEncoding(valueStr)}</span>
        )}
      </div>
      {isLongValue && (
        <div className="text-xs text-white/60 mt-1">Click to view full</div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-gray-900/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             <ValueModal
               isOpen={showModal}
               onClose={() => setShowModal(false)}
               label={label}
               value={cleanEncoding(valueStr)}
             />
    </div>
  )
}

// Map Soil_Data_10km_1.json flat row to at_X_m_depth shape used by panels
// Supports legacy (col_5, at_1_m_depth), normalized (at_1_m_depth_dry_density_g_cc, clay), and new CSV format ("At 1 m Depth - Dry Density (g/cc)", "Clay %")
function soilRawToDepthData(raw) {
  if (!raw) return { at_1_m_depth: {}, at_2_m_depth: {}, at_3_m_depth: {}, at_4_m_depth: {} }
  
  // Check for new CSV format (has "At 1 m Depth - Dry Density (g/cc)")
  const isNewCsvFormat = raw['At 1 m Depth - Dry Density (g/cc)'] != null
  // Check for normalized format (at_1_m_depth_dry_density_g_cc, clay)
  const isNormalizedFormat = raw.at_1_m_depth_dry_density_g_cc != null || raw.clay != null
  
  if (isNewCsvFormat) {
    // New CSV format with combined headers like "At 1 m Depth - Dry Density (g/cc)"
    return {
      at_1_m_depth: {
        dry_density_gcc: raw['At 1 m Depth - Dry Density (g/cc)'],
        clay: raw['At 1 m Depth - Clay %'],
        gravel: raw['At 1 m Depth - Gravel %'],
        sand: raw['At 1 m Depth - Sand %'],
        silt: raw['At 1 m Depth - Silt %'],
        moisture: raw['At 1 m Depth - Moisture %'],
        bulk_density_gmcc: raw['At 1 m Depth - Bulk Density (gm/cc)'],
        liquid_limit: raw['At 1 m Depth - Liquid Limit %'],
        plastic_limit: raw['At 1 m Depth - Plastic Limit %'],
        plasticity_index: raw['At 1 m Depth - Plasticity Index %'],
        max_dry_density_gmcc: raw['At 1 m Depth - Max. Dry Density (gm/cc)'],
        free_swelling_index: raw['At 1 m Depth - Free Swelling Index %'],
        ucs_kgcm: raw['At 1 m Depth - UCS (kg/cm²)'],
        soil_class: raw['At 1 m Depth - Soil Class'],
        specific_gravity: raw['At 1 m Depth - Specific Gravity'],
        safe_bearing_capacity: raw['At 1 m Depth - Safe Bearing Capacity T/m²'],
        sbc: raw['At 1 m Depth - Safe Bearing Capacity T/m²'],
        cbr_value: raw['At 1 m Depth - CBR (%)'],
        ph: raw['At 1 m Depth - PH Value']
      },
      at_2_m_depth: {
        dry_density_gcc: raw['At 2 m Depth - Dry Density (g/cc)'],
        clay: raw['At 2 m Depth - Clay %'],
        gravel: raw['At 2 m Depth - Gravel %'],
        sand: raw['At 2 m Depth - Sand %'],
        silt: raw['At 2 m Depth - Silt %'],
        moisture: raw['At 2 m Depth - Moisture %'],
        bulk_density_gmcc: raw['At 2 m Depth - Bulk Density (gm/cc)'],
        liquid_limit: raw['At 2 m Depth - Liquid Limit %'],
        plastic_limit: raw['At 2 m Depth - Plastic Limit %'],
        plasticity_index: raw['At 2 m Depth - Plasticity Index %'],
        max_dry_density_gmcc: raw['At 2 m Depth - Max. Dry Density (gm/cc)'],
        free_swelling_index: raw['At 2 m Depth - Free Swelling Index %'],
        ucs_kgcm: raw['At 2 m Depth - UCS (kg/cm²)'],
        soil_class: raw['At 2 m Depth - Soil Class'],
        specific_gravity: raw['At 2 m Depth - Specific Gravity'],
        safe_bearing_capacity: raw['At 2 m Depth - Safe Bearing Capacity T/m²'],
        sbc: raw['At 2 m Depth - Safe Bearing Capacity T/m²'],
        cbr_value: raw['At 2 m Depth - CBR (%)'],
        ph: raw['At 2 m Depth - PH Value']
      },
      at_3_m_depth: {
        dry_density_gcc: raw['At 3 m Depth - Dry Density (g/cc)'],
        clay: raw['At 3 m Depth - Clay %'],
        gravel: raw['At 3 m Depth - Gravel %'],
        sand: raw['At 3 m Depth - Sand %'],
        silt: raw['At 3 m Depth - Silt %'],
        moisture: raw['At 3 m Depth - Moisture %'],
        bulk_density_gmcc: raw['At 3 m Depth - Bulk Density (gm/cc)'],
        liquid_limit: raw['At 3 m Depth - Liquid Limit %'],
        plastic_limit: raw['At 3 m Depth - Plastic Limit %'],
        plasticity_index: raw['At 3 m Depth - Plasticity Index %'],
        max_dry_density_gmcc: raw['At 3 m Depth - Max. Dry Density (gm/cc)'],
        free_swelling_index: raw['At 3 m Depth - Free Swelling Index %'],
        ucs_kgcm: raw['At 3 m Depth - UCS (kg/cm²)'],
        soil_class: raw['At 3 m Depth - Soil Class'],
        specific_gravity: raw['At 3 m Depth - Specific Gravity'],
        safe_bearing_capacity: raw['At 3 m Depth - Safe Bearing Capacity T/m²'],
        sbc: raw['At 3 m Depth - Safe Bearing Capacity T/m²'],
        cbr_value: raw['At 3 m Depth - CBR (%)'],
        ph: raw['At 3 m Depth - PH Value']
      },
      at_4_m_depth: {
        dry_density_gcc: raw['At 4 m Depth - Dry Density (g/cc)'],
        clay: raw['At 4 m Depth - Clay %'],
        gravel: raw['At 4 m Depth - Gravel %'],
        sand: raw['At 4 m Depth - Sand %'],
        silt: raw['At 4 m Depth - Silt %'],
        moisture: raw['At 4 m Depth - Moisture %'],
        bulk_density_gmcc: raw['At 4 m Depth - Bulk Density (gm/cc)'],
        liquid_limit: raw['At 4 m Depth - Liquid Limit %'],
        plastic_limit: raw['At 4 m Depth - Plastic Limit %'],
        plasticity_index: raw['At 4 m Depth - Plasticity Index %'],
        max_dry_density_gmcc: raw['At 4 m Depth - Max. Dry Density (gm/cc)'],
        free_swelling_index: raw['At 4 m Depth - Free Swelling Index %'],
        ucs_kgcm: raw['At 4 m Depth - UCS (kg/cm²)'],
        soil_class: raw['At 4 m Depth - Soil Class'],
        specific_gravity: raw['At 4 m Depth - Specific Gravity'],
        safe_bearing_capacity: raw['At 4 m Depth - Safe Bearing Capacity T/m²'],
        sbc: raw['At 4 m Depth - Safe Bearing Capacity T/m²'],
        cbr_value: raw['At 4 m Depth - CBR (%)'],
        ph: raw['At 4 m Depth - PH Value']
      }
    }
  }
  
  if (isNormalizedFormat) {
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
        sbc: raw.safe_bearing_capacity_t_m,
        cbr_value: raw.cbr
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
        sbc: raw.safe_bearing_capacity_t_m_1,
        cbr_value: raw.cbr_1
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
        sbc: raw.safe_bearing_capacity_t_m_2,
        cbr_value: raw.cbr_2
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
        sbc: raw.safe_bearing_capacity_t_m_3,
        cbr_value: raw.cbr_3
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

// Get chainage value from a DATA_Gas_Pipeline row (supports both old format with chainage_ prefix and new format with "Chainage")
function getChainageFromGasRow(row) {
  if (!row || typeof row !== 'object') return null
  // Try new format first (clean field name)
  if (row.Chainage != null && row.Chainage !== '') return String(row.Chainage)
  // Fallback to old format (normalized key)
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
  
  // Support both new format (clean field names) and old format (normalized keys)
  const getVal = (newKey, ...oldKeys) => {
    if (row[newKey] != null && row[newKey] !== '') return String(row[newKey])
    return getRowVal(row, ...oldKeys)
  }
  
  const distance = getVal('Distance', 'distance_0')
  const waterlogging = getVal('Waterlogging Area (Acres)', 'waterlogging_area_acres_0')
  const floodProne = getVal('Flood Prone Zone Area (Acres)', 'flood_prone_zone_area_acres_0', 'flood_prone_zone', 'flood_prone_zone_km')
  const forestLen = getVal('Pipeline Beetween Forest', 'pipeline_beetween_forest')
  const farmLen = getVal('Pipeline Between Farms', 'pipeline_between_farms')
  
  return {
    state: getVal('State', 'state_odisha'),
    district: getVal('District', 'district_ganjam'),
    land_use: getVal('Land Use', 'land_use_agriculture'),
    land_ownership_rou: getVal('Land Ownership & ROU', 'land_ownership_rou_farm'),
    total_plot_no: `Sr. No ${getVal('Plot/ Survey No.', 'Total Plot No', 'total_plot_no_absence')}`,
    land_area_acres: getVal('Land Area (Acres)', 'land_area_acres'),
    route_alignment_km: distance != null && distance !== '' ? `${distance} km` : '',
    road_crossings: getVal('Road Crossing', 'road_crossing_absence'),
    railway_crossing_electrified: getVal('Railway Crossing', 'railway_crossing_absence'),
    railway_crossing_nonelectrified: '',
    high_voltage_transmission_corridors: getVal('Transmission Line Crossing', 'transmission_line_crossing_absence'),
    existing_linear_infrastructure: getVal('Infrastruture', 'infrastruture_absence'),
    culvert: getVal('Culvert', 'culvert_absence'),
    terrain: getVal('Terrain', 'terrain_plain'),
    tahasil: getVal('Tahasil', 'tahasil_forest', 'tahasil'),
    village: getVal('Village', 'village_forest', 'village'),
    major_river_crossing: getVal('Major River Crossing', 'major_river_crossing_absence'),
    nallahs_minor_drainage: getVal('Nallahs & Minor Drainage', 'nallahs_minor_drainage_absence'),
    low_lying_agricultural_waterlogging: waterlogging != null && waterlogging !== '' && waterlogging !== '0' ? `${waterlogging} acres` : '',
    elevation_m: getVal('Elevation', 'elevation_1884'),
    ground_temperature: getVal('Ground Temperature', 'ground_temperature_20c'),
    trees_between_route: getVal('Tress Between Gas Pipeline', 'tress_between_gas_pipeline_8'),
    forest_area_length_km: forestLen,
    farm_area_length_km: farmLen,
    population_density: '',
    safety_exclusion_zones: '',
    risk_category: '',
    risk_level: '',
    flood_prone_zone: (() => {
      if (!floodProne || floodProne === '' || floodProne === '0') return ''
      // If it's a number, add "acres", otherwise return as is
      const numVal = parseFloat(floodProne)
      if (!isNaN(numVal) && numVal > 0) {
        return `${floodProne} acres`
      }
      return floodProne
    })(),
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
    // Clean encoding issues before displaying
    return cleanEncoding(String(value))
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
     {/* AREA ASSESSMENT */}
     <DataPanel label="Summary" header={true} icon={<Layers className="w-3.5 h-3.5 text-amber-400" />} />

      <div className="grid grid-cols-4 gap-1">
      <DataPanel label="Trees Between Route" value={displayValue(detailData.trees_between_route)} color="purple" />
      <DataPanel label="Road/Pipeline Length" value={displayValue(detailData.route_alignment_km)} color="purple" />
      <DataPanel label="Pipeline Beetween Forest" value={displayValue(detailData.forest_area_length_km)} color="purple" />
      <DataPanel label="Pipeline Between Farms" value={displayValue(detailData.farm_area_length_km)} color="purple" />
      </div>

      {/* ROUTE FEASIBILITY ASSESSMENT */}
      <DataPanel label="Route Feasibility Assessment" header={true} icon={<Layers className="w-3.5 h-3.5 text-amber-400" />} />
      <div className="grid grid-cols-4 gap-1">
      <DataPanel label="State" value={displayValue(detailData.state)} color="green" />
      <DataPanel label="District" value={displayValue(detailData.district)} color="green" />
      <DataPanel label="Tahsil" value={displayValue(detailData.tahasil)} color="green" />
      <DataPanel label="Village" value={displayValue(detailData.village)} color="green" />
        
      </div>
      <div className="grid grid-cols-4 gap-1">
      {/* <DataPanel label="Route Alignment" value={detailData.route_alignment_km != null && detailData.route_alignment_km !== '' ? `${(parseFloat(detailData.route_alignment_km) || 0).toFixed(2)} km` : 'Absence'} color="orange" /> */}
       <DataPanel label="Plot/ Survey No." value={displayValue(detailData.total_plot_no)} color="orange" />
       <DataPanel label="Land Use" value={displayValue(detailData.land_use)} color="orange" />
       <DataPanel label="Land Ownership & ROU" value={displayValue(detailData.land_ownership_rou)} color="orange" />
       <DataPanel label="Land Area (Acres)" value={displayValue(detailData.land_area_acres)} color="orange" />
       </div>
      
      <div className="grid grid-cols-4 gap-1">
        {/* <DataPanel label="Land Use" value={displayValue(detailData.land_use)} color="orange" />
        <DataPanel label="Land Ownership & ROU" value={displayValue(detailData.land_ownership_rou)} color="orange" /> */}
        {/* <DataPanel label="Ground Temperature" value={displayValue(detailData.ground_temperature)} color="green" /> */}
      </div>

      {/* TOPOGRAPHY */}
      <DataPanel label="Topography" header={true} icon={<Layers className="w-3.5 h-3.5 text-emerald-400" />} />
      <div className="grid grid-cols-3 gap-1" >
      <DataPanel
        label="Elevation"
        value={detailData.elevation_m ? `${displayValue(detailData.elevation_m)} m` : displayValue(detailData.elevation_m)}
        color="red"
      />
        <DataPanel label="Terrain" value={displayValue(detailData.terrain)} color="red" />
        <DataPanel label="Ground Temperature" value={displayValue(detailData.ground_temperature)} color="red" />

      </div>

      {/* NATURAL CONSTRAINTS */}
      <DataPanel label="Natural Constraints" header={true} icon={<Layers className="w-3.5 h-3.5 text-cyan-400" />} />
      <div className="grid grid-cols-3 gap-1">
        <DataPanel label="Major River Crossing" value={displayValue(detailData.major_river_crossing)} color="blue" />
        <DataPanel label="Nallahs and Minor Drainage" value={displayValue(detailData.nallahs_minor_drainage)} color="blue" />
        <DataPanel label="Tree Between Route" value={displayValue(detailData.trees_between_route)} color="blue" />
        {/* <DataPanel label="Low-lying Agricultural Areas Seasonal Waterlogging" value={displayValue(detailData.low_lying_agricultural_waterlogging)} color="blue" /> */}
      </div>

      {/* SAFETY & REGULATORY SCREENING */}
      <DataPanel label="Safety & Regulatory Screening" header={true} icon={<Layers className="w-3.5 h-3.5 text-red-400" />} />
      <div className="grid grid-cols-3 gap-1">
      <DataPanel label="Road Crossing" value={displayValue(detailData.road_crossings)} color="yellow" />
      <DataPanel label="Railway Crossing" value={displayValue(railwayValue)} color="yellow" />
      <DataPanel label="Transmission Line Crossing" value={displayValue(detailData.high_voltage_transmission_corridors)} color="yellow" />
      </div>
      <div className="grid grid-cols-2 gap-1">
      <DataPanel label="Infrastructure" value={displayValue(detailData.existing_linear_infrastructure)} color="yellow" />
      <DataPanel label="Culvert" value={displayValue(detailData.culvert)} color="yellow" />
      </div>

      {/* RISK IDENTIFICATION */}
      <DataPanel label="Risk Identification" header={true} icon={<Layers className="w-3.5 h-3.5 text-yellow-400" />} />
      <div className="grid grid-cols-4 gap-1">
      <DataPanel label="Flood Prone Zone" value={displayValue(detailData.flood_prone_zone)} color="red" />
      <DataPanel label="Water Logging" value={displayValue(detailData.low_lying_agricultural_waterlogging)} color="red" />
        <DataPanel label="Risk Category" value={displayValue(detailData.risk_category)} color="red" />
        <DataPanel label="Risk Level" value={displayValue(detailData.risk_level)} color="red" />
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
            <DataPanel label="Soil At 1 m Depth" header={true} showLabelText={true} hideIcon={true} />
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at1.dry_density_gcc ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Clay %" value={at1.clay ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Gravel %" value={at1.gravel ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Sand %" value={at1.sand ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at1.silt ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Moisture %" value={at1.moisture ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Bulk Density (gm/cc)" value={at1.bulk_density_gmcc != null ? Number(at1.bulk_density_gmcc).toFixed(2) : 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Liquid Limit %" value={at1.liquid_limit ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at1.plastic_limit ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Plasticity Index %" value={at1.plasticity_index ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Max Dry Density (gm/cc)" value={at1.max_dry_density_gmcc != null ? Number(at1.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Free Swelling Index %" value={at1.free_swelling_index != null ? Number(at1.free_swelling_index).toFixed(2) : 'Absence'} color="green" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at1.ucs_kgcm != null ? Number(at1.ucs_kgcm).toFixed(2) : 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Soil Class" value={at1.soil_class ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Specific Gravity" value={at1.specific_gravity ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at1.safe_bearing_capacity ?? at1.sbc ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <DataPanel label="CBR (%)" value={at1.cbr_value ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
              <DataPanel label="PH" value={at1.ph ?? 'Absence'} color="green" hideIcon={true} showLabelText={true} />
            </div>

            <DataPanel label="Soil At 2 m Depth" header={true} showLabelText={true} hideIcon={true} />
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at2.dry_density_gcc ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Clay %" value={at2.clay ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Gravel %" value={at2.gravel ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Sand %" value={at2.sand ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at2.silt ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Moisture %" value={at2.moisture ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Bulk Density (gm/cc)" value={at2.bulk_density_gmcc != null ? Number(at2.bulk_density_gmcc).toFixed(2) : 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Liquid Limit %" value={at2.liquid_limit ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at2.plastic_limit ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Plasticity Index %" value={at2.plasticity_index ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Max Dry Density (gm/cc)" value={at2.max_dry_density_gmcc != null ? Number(at2.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Free Swelling Index %" value={at2.free_swelling_index != null ? Number(at2.free_swelling_index).toFixed(2) : 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at2.ucs_kgcm != null ? Number(at2.ucs_kgcm).toFixed(2) : 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Soil Class" value={displayValue(at2.soil_class)} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Specific Gravity" value={displayValue(at2.specific_gravity)} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at2.safe_bearing_capacity ?? at2.sbc ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <DataPanel label="CBR (%)" value={at2.cbr_value ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
              <DataPanel label="PH" value={at2.ph ?? 'Absence'} color="blue" hideIcon={true} showLabelText={true} />
            </div>
            <DataPanel label="Soil At 3 m Depth" header={true} showLabelText={true} hideIcon={true} />
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at3.dry_density_gcc ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Clay %" value={at3.clay ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Gravel %" value={at3.gravel ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Sand %" value={at3.sand ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at3.silt ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Moisture %" value={at3.moisture ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Bulk Density (gm/cc)" value={at3.bulk_density_gmcc != null ? Number(at3.bulk_density_gmcc).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Liquid Limit %" value={at3.liquid_limit ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at3.plastic_limit ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Plasticity Index %" value={at3.plasticity_index ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Max Dry Density (gm/cc)" value={at3.max_dry_density_gmcc != null ? Number(at3.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Free Swelling Index %" value={at3.free_swelling_index != null ? Number(at3.free_swelling_index).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at3.ucs_kgcm != null ? Number(at3.ucs_kgcm).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Soil Class" value={displayValue(at3.soil_class)} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Specific Gravity" value={displayValue(at3.specific_gravity)} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at3.safe_bearing_capacity ?? at3.sbc ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <DataPanel label="CBR (%)" value={at3.cbr_value ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="PH" value={at3.ph ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <DataPanel label="Soil At 4 m Depth" header={true} showLabelText={true} hideIcon={true} />
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Dry Density (g/cc)" value={at4.dry_density_gcc ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Clay %" value={at4.clay ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Gravel %" value={at4.gravel ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Sand %" value={at4.sand ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Silt %" value={at4.silt ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Moisture %" value={at4.moisture ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Bulk Density (gm/cc)" value={at4.bulk_density_gmcc != null ? Number(at4.bulk_density_gmcc).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Liquid Limit %" value={at4.liquid_limit ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="Plastic Limit %" value={at4.plastic_limit ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Plasticity Index %" value={at4.plasticity_index ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Max Dry Density (gm/cc)" value={at4.max_dry_density_gmcc != null ? Number(at4.max_dry_density_gmcc).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Free Swelling Index %" value={at4.free_swelling_index != null ? Number(at4.free_swelling_index).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <DataPanel label="UCS (kg/cm²)" value={at4.ucs_kgcm != null ? Number(at4.ucs_kgcm).toFixed(2) : 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Soil Class" value={displayValue(at4.soil_class)} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Specific Gravity" value={displayValue(at4.specific_gravity)} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="Safe Bearing Capacity (SBC)" value={at4.safe_bearing_capacity ?? at4.sbc ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <DataPanel label="CBR (%)" value={at4.cbr_value ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
              <DataPanel label="PH" value={at4.ph ?? 'Absence'} color="purple" hideIcon={true} showLabelText={true} />
            </div>
          </>
        )
      })()}
    </div>
  )
}

export default DataPanels


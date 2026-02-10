import { useState, useRef, useEffect, Fragment } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, GeoJSON, Circle } from 'react-leaflet'
import L from 'leaflet'
import toGeoJSON from '@mapbox/togeojson'
import { Upload, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapBounds({ geoJsonData }) {
  const map = useMap()

  useEffect(() => {
    if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
      try {
        const geoJsonLayer = L.geoJSON(geoJsonData)
        const bounds = geoJsonLayer.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        }
      } catch (error) {
        console.error('Error fitting bounds:', error)
      }
    }
  }, [geoJsonData, map])

  return null
}

function FitTowerAndTrees({ tower, trees }) {
  const map = useMap()

  useEffect(() => {
    if (tower && trees && trees.length > 0) {
      try {
        const lat = parseFloat(tower.latitude)
        const lng = parseFloat(tower.longitude)
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Create bounds that include tower and all trees
          const bounds = L.latLngBounds([[lat, lng], [lat, lng]])
          
          // Add tower position
          bounds.extend([lat, lng])
          
          // Add all tree positions
          trees.forEach(tree => {
            const treeLat = parseFloat(tree.treelatitude)
            const treeLng = parseFloat(tree.treelongitude)
            if (!isNaN(treeLat) && !isNaN(treeLng)) {
              bounds.extend([treeLat, treeLng])
            }
          })
          
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 })
          }
        }
      } catch (error) {
        console.error('Error fitting bounds for tower and trees:', error)
      }

    }
  }, [tower, trees, map])

  return null
}

function MapCenter({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 15)
    }
  }, [center, zoom, map])

  return null
}

// Fit map to show start and end points with padding
function FitStartEndBounds({ startLatLng, endLatLng }) {
  const map = useMap()
  useEffect(() => {
    if (startLatLng && endLatLng && startLatLng.length === 2 && endLatLng.length === 2) {
      try {
        const bounds = L.latLngBounds([startLatLng, endLatLng])
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 })
        }
      } catch (e) {
        console.error('Error fitting start/end bounds:', e)
      }
    }
  }, [startLatLng, endLatLng, map])
  return null
}

// Fit map to show all selected segments (all start/end points)
function FitMultipleSegments({ segments }) {
  const map = useMap()
  useEffect(() => {
    if (!segments || segments.length === 0) return
    const allPoints = segments.flatMap(s => [s.start, s.end]).filter(Boolean)
    if (allPoints.length === 0) return
    try {
      const bounds = L.latLngBounds(allPoints)
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 })
      }
    } catch (e) {
      console.error('Error fitting multiple segments:', e)
    }
  }, [segments, map])
  return null
}

// Get chainage value from a DATA_Gas_Pipeline row
function getChainageFromGasRow(row) {
  if (!row || typeof row !== 'object') return null
  // Try direct field name first (new CSV format)
  if (row['Chainage'] != null) return row['Chainage']
  // Fallback to old format (key like chainage_228579000000001)
  const key = Object.keys(row).find((k) => k.toLowerCase().startsWith('chainage_'))
  return key ? row[key] : null
}

// Get flood prone zone value from a DATA_Gas_Pipeline row
function getFloodProneZoneFromGasRow(row) {
  if (!row || typeof row !== 'object') return null
  // Try different possible field names (new CSV format first)
  const val = row['Flood Prone Zone Area (Acres)'] ||
              row.flood_prone_zone_area_acres_0 || 
              row.flood_prone_zone || 
              row.flood_prone_zone_km ||
              null
  return val != null && val !== '' && val !== '0' && val !== 'NA' ? String(val) : null
}

// Get start/end [lat, lng] from a DATA_Gas_Pipeline row
function getStartEndFromGasRow(row) {
  if (!row || typeof row !== 'object') return null
  const getVal = (fieldName, prefix) => {
    // Try direct field name first (new CSV format)
    if (row[fieldName] != null) {
      const n = parseFloat(row[fieldName])
      if (!Number.isNaN(n)) return n
    }
    // Fallback to old format (key starting with prefix)
    const key = Object.keys(row).find((k) => k.toLowerCase().startsWith(prefix))
    const v = key ? row[key] : null
    const n = v != null ? parseFloat(v) : NaN
    return Number.isNaN(n) ? null : n
  }
  const startLat = getVal('Start Latitude', 'start_latitude')
  const startLng = getVal('Start Longitude', 'start_longitude')
  const endLat = getVal('End Latitude', 'end_latitude')
  const endLng = getVal('End Longitude', 'end_longitude')
  if (startLat == null || startLng == null || endLat == null || endLng == null) return null
  return { start: [startLat, startLng], end: [endLat, endLng] }
}

// Parse "lat,lng" string to [lat, lng] or null
function parseLatLng(str) {
  if (!str || typeof str !== 'string') return null
  const parts = str.trim().split(/\s*,\s*/)
  if (parts.length < 2) return null
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (isNaN(lat) || isNaN(lng)) return null
  return [lat, lng]
}

// Parse decimal degree location like "20.217248°N 84.734508°E" into [lat, lng]
function parseDecimalDegreeLocation(str) {
  if (!str || typeof str !== 'string') return null
  const match = str.trim().match(/([+-]?\d+\.?\d*)\s*°?\s*([NS])\s+([+-]?\d+\.?\d*)\s*°?\s*([EW])/i)
  if (!match) return null
  let lat = parseFloat(match[1])
  const latHemi = (match[2] || '').toUpperCase()
  let lng = parseFloat(match[3])
  const lngHemi = (match[4] || '').toUpperCase()
  if (isNaN(lat) || isNaN(lng)) return null
  if (latHemi === 'S') lat = -lat
  if (lngHemi === 'W') lng = -lng
  return [lat, lng]
}

// Parse a DMS location string like `20°13'02"N 84°44'03"E` into [lat, lng]
function parseDMSLocation(str) {
  if (!str || typeof str !== 'string') return null
  const decimal = parseDecimalDegreeLocation(str)
  if (decimal) return decimal
  // Split into two parts: lat and lon
  const parts = str.trim().split(/\s+/)
  if (parts.length < 2) return null

  const parseOne = (dms) => {
    const match = dms.match(
      /(\d+)[°:\s]+(\d+)[\'’:\s]+(\d+(?:\.\d+)?)[\"”]?\s*([NSEW])?/i
    )
    if (!match) return null
    const deg = parseFloat(match[1])
    const min = parseFloat(match[2])
    const sec = parseFloat(match[3])
    const hemi = (match[4] || '').toUpperCase()
    if (isNaN(deg) || isNaN(min) || isNaN(sec)) return null
    let dec = deg + min / 60 + sec / 3600
    if (hemi === 'S' || hemi === 'W') dec = -dec
    return dec
  }

  const lat = parseOne(parts[0])
  const lng = parseOne(parts[1])
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null
  return [lat, lng]
}

// Visualize soil profile as a stacked area chart (depth on X, % on Y)
function SoilProfile({ raw }) {
  const depths = ['1 m', '2 m', '3 m', '4 m']
  const xLabels = ['', '', '', '']
  const hasNewCsvFormat =
    raw &&
    (raw['At 1 m Depth - Clay %'] != null ||
      raw['At 1 m Depth - Dry Density (g/cc)'] != null)
  const hasNormalizedFormat =
    raw && (raw.clay != null || raw.at_1_m_depth_dry_density_g_cc != null)

  const layers = hasNewCsvFormat
    ? [
        {
          clay: 'At 1 m Depth - Clay %',
          gravel: 'At 1 m Depth - Gravel %',
          sand: 'At 1 m Depth - Sand %',
          silt: 'At 1 m Depth - Silt %',
        },
        {
          clay: 'At 2 m Depth - Clay %',
          gravel: 'At 2 m Depth - Gravel %',
          sand: 'At 2 m Depth - Sand %',
          silt: 'At 2 m Depth - Silt %',
        },
        {
          clay: 'At 3 m Depth - Clay %',
          gravel: 'At 3 m Depth - Gravel %',
          sand: 'At 3 m Depth - Sand %',
          silt: 'At 3 m Depth - Silt %',
        },
        {
          clay: 'At 4 m Depth - Clay %',
          gravel: 'At 4 m Depth - Gravel %',
          sand: 'At 4 m Depth - Sand %',
          silt: 'At 4 m Depth - Silt %',
        },
      ]
    : hasNormalizedFormat
    ? [
        { clay: 'clay', gravel: 'gravel', sand: 'sand', silt: 'silt' },
        { clay: 'clay_1', gravel: 'gravel_1', sand: 'sand_1', silt: 'silt_1' },
        { clay: 'clay_2', gravel: 'gravel_2', sand: 'sand_2', silt: 'silt_2' },
        { clay: 'clay_3', gravel: 'gravel_3', sand: 'sand_3', silt: 'silt_3' },
      ]
    : [
        { clay: 'col_5', gravel: 'col_6', sand: 'col_7', silt: 'col_8', moisture: 'col_9' },
        { clay: 'col_22', gravel: 'col_23', sand: 'col_24', silt: 'col_25', moisture: 'col_26' },
        { clay: 'col_39', gravel: 'col_40', sand: 'col_41', silt: 'col_42', moisture: 'col_43' },
        { clay: 'col_56', gravel: 'col_57', sand: 'col_58', silt: 'col_59', moisture: 'col_60' },
      ]

  const seriesDefs = [
    { key: 'clay', label: 'Clay', color: '#8b5cf6' },
    { key: 'gravel', label: 'Gravel', color: '#f97316' },
    { key: 'sand', label: 'Sand', color: '#facc15' },
    { key: 'silt', label: 'Silt', color: '#22c55e' },
  ]

  // Build normalized percentages per depth
  const depthValues = layers.map((cfg) => {
    const clay = parseFloat(raw[cfg.clay] ?? '0') || 0
    const gravel = parseFloat(raw[cfg.gravel] ?? '0') || 0
    const sand = parseFloat(raw[cfg.sand] ?? '0') || 0
    const silt = parseFloat(raw[cfg.silt] ?? '0') || 0
    const total = clay + gravel + sand + silt || 1
    return {
      clay: (clay / total) * 100,
      gravel: (gravel / total) * 100,
      sand: (sand / total) * 100,
      silt: (silt / total) * 100,
    }
  })

  const width = 400
  const height = 400
  const paddingX = 23
  const paddingY = 20

  const xs = depths.map((_, i) =>
    paddingX + ((width - 2 * paddingX) * i) / (depths.length - 1 || 1),
  )
  const yFromPct = (pct) =>
    height - paddingY - ((height - 2 * paddingY) * pct) / 100

  const buildPath = (seriesKey) => {
    const upper = []
    const lower = []
    let prevTotals = Array(depthValues.length).fill(0)

    // Compute cumulative stacks at each depth for this and previous series
    depthValues.forEach((vals, i) => {
      const value = vals[seriesKey] || 0
      const low = prevTotals[i]
      const high = low + value
      lower.push({ x: xs[i], y: yFromPct(low) })
      upper.push({ x: xs[i], y: yFromPct(high) })
      prevTotals[i] = high
    })

    const points = []
    upper.forEach((p) => points.push(p))
    for (let i = lower.length - 1; i >= 0; i -= 1) {
      points.push(lower[i])
    }

    if (points.length === 0) return ''

    return (
      'M ' +
      points
        .map((p, idx) => `${idx === 0 ? '' : 'L '}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ') +
      ' Z'
    )
  }

  // Cumulative stacks shared across series
  const cumulative = Array(depthValues.length).fill(0)
  const seriesPaths = seriesDefs.map((s) => {
    const upper = []
    const lower = []
    depthValues.forEach((vals, i) => {
      const value = vals[s.key] || 0
      const low = cumulative[i]
      const high = low + value
      lower.push({ x: xs[i], y: yFromPct(low) })
      upper.push({ x: xs[i], y: yFromPct(high) })
      cumulative[i] = high
    })
    const points = []
    upper.forEach((p) => points.push(p))
    for (let i = lower.length - 1; i >= 0; i -= 1) {
      points.push(lower[i])
    }
    const d =
      points.length === 0
        ? ''
        : 'M ' +
          points
            .map((p, idx) => `${idx === 0 ? '' : 'L '}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(' ') +
          ' Z'
    return { def: s, d }
  })

  return (
    <div className="mt-3 text-[15px] text-gray-800 text-center  font-bold">
      <div className="font-semibold mb-1 flex items-center justify-center gap-2">
        <span className="text-gray-800">→</span>
        <div className="flex-1 h-px bg-gray-800"></div>
        <span>10 m</span>
        <div className="flex-1 h-px bg-gray-800"></div>
        <span className="text-gray-800">←</span>
      </div>
      <svg width={width} height={height} className="border border-gray-300 rounded bg-white">
        {/* Background bands with component labels instead of raw percentages */}
        {[
          { minPct: 75, maxPct: 100, label: '1 m', bg: '#f9fafb' },
          { minPct: 50, maxPct: 75, label: '2 m', bg: '#f3f4f6' },
          { minPct: 25, maxPct: 50, label: '3 m', bg: '#e5e7eb' },
          { minPct: 0, maxPct: 25, label: '4 m',  bg: '#d1d5db' },
        ].map(({ minPct, maxPct, label, bg }) => {
          const yTop = yFromPct(maxPct)
          const yBottom = yFromPct(minPct)
          const midY = (yTop + yBottom) / 2
          return (
            <g key={label}>
              <rect
                x={paddingX}
                y={yTop}
                width={width - 2 * paddingX}
                height={yBottom - yTop}
                fill={bg}
                fillOpacity="0.7"
              />
              <line
                x1={paddingX}
                x2={width - 1 * paddingX}
                y1={yTop}
                y2={yTop}
                stroke="#111827"
                strokeWidth="1.5"
              />
              <text
                x={4}
                y={midY + 3}
                fontSize="9"
                fill="#6b7280"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Stacked area series */}
        {seriesPaths.map(
          (s) =>
            s.d && (
              <path
                key={s.def.key}
                d={s.d}
                fill={s.def.color}
                fillOpacity="0.7"
                stroke={s.def.color}
                strokeWidth="0.5"
              />
            ),
        )}

        {/* Percentage labels for each component at each depth */}
        {seriesDefs.map((seriesDef, seriesIdx) => {
          const cumulative = Array(depthValues.length).fill(0)
          // Calculate cumulative for previous series
          for (let prevIdx = 0; prevIdx < seriesIdx; prevIdx++) {
            depthValues.forEach((vals, depthIdx) => {
              cumulative[depthIdx] += vals[seriesDefs[prevIdx].key] || 0
            })
          }
          
          return depthValues.map((vals, depthIdx) => {
            const value = vals[seriesDef.key] || 0
            if (value < 2) return null // Don't show label if value is too small
            
            const low = cumulative[depthIdx]
            const high = low + value
            const midY = yFromPct((low + high) / 2)
            const x = xs[depthIdx]
            
            return (
              <text
                key={`${seriesDef.key}-${depthIdx}`}
                x={x}
                y={midY}
                fontSize="9"
                fill="#1f2937"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ pointerEvents: 'none' }}
              >
                {value.toFixed(1)}%
              </text>
            )
          })
        })}

        {/* X-axis labels for components */}
        {xLabels.map((label, i) => (
          <text
            key={label}
            x={xs[i]}
            y={height - 10}
            fontSize="11"
            fill="#111827"
            fontWeight="600"
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Simple legend */}
      <div className="mt-1 grid grid-cols-4 gap-x-2 gap-y-0.5 text-[9px] text-gray-700">
        {seriesDefs.map((s) => (
          <div key={s.key} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-2 rounded-sm"
              style={{ backgroundColor: s.color }}
            />  
            <span className="text-center text-xs font-bold">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Fit map to elevation path once on load; do not refit when user clicks chainage (trees) to avoid resize
function FitElevationBounds({ positions, shouldFit }) {
  const map = useMap()
  const hasFitted = useRef(false)
  useEffect(() => {
    if (!positions || positions.length < 2) return
    if (shouldFit) {
      if (hasFitted.current) return
      try {
        const bounds = L.latLngBounds(positions)
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 20 })
        }
        hasFitted.current = true
      } catch (e) {
        console.error('Error fitting elevation bounds:', e)
      }
    } else {
      hasFitted.current = false
    }
  }, [shouldFit, positions, map])
  return null
}

function MapControls({ baseLayer, onBaseLayerChange }) {
  const map = useMap()

  const handleZoomIn = () => {
    map.zoomIn()
  }

  const handleZoomOut = () => {
    map.zoomOut()
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onBaseLayerChange('street')}
          className={`px-3 py-2 bg-gray-800 text-white rounded shadow-lg hover:bg-gray-700 transition text-sm ${
            baseLayer === 'street' ? 'bg-blue-600' : ''
          }`}
        >
          Street
        </button>
        <button
          onClick={() => onBaseLayerChange('satellite')}
          className={`px-3 py-2 bg-gray-800 text-white rounded shadow-lg hover:bg-gray-700 transition text-sm ${
            baseLayer === 'satellite' ? 'bg-blue-600' : ''
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => onBaseLayerChange('terrain')}
          className={`px-3 py-2 bg-gray-800 text-white rounded shadow-lg hover:bg-gray-700 transition text-sm ${
            baseLayer === 'terrain' ? 'bg-blue-600' : ''
          }`}
        >
          Terrain
        </button>
      </div>
      {/* <div className="flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-gray-800 text-white rounded shadow-lg hover:bg-gray-700 transition flex items-center justify-center text-xl"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-gray-800 text-white rounded shadow-lg hover:bg-gray-700 transition flex items-center justify-center text-xl"
        >
          −
        </button>
      </div> */}
    </div>
  )
}

function MapView({ routeData, soilTypes, filters, selectedTowerIndices, selectedSoilPoint, setSelectedSoilPoint }) {
  const [baseLayer, setBaseLayer] = useState('terrain')
  const [kmlData, setKmlData] = useState(null)
  const [kmlFileName, setKmlFileName] = useState(null)
  const [towers, setTowers] = useState([])
  const [treeData, setTreeData] = useState([])
  const [treesForSelectedTowers, setTreesForSelectedTowers] = useState([])
  const [elevationPoints, setElevationPoints] = useState([])
  const [soilPoints, setSoilPoints] = useState([])
  const [selectedElevationPoint, setSelectedElevationPoint] = useState(null)
  const [localSoilPoint, setLocalSoilPoint] = useState(null)
  const selectedSoil = selectedSoilPoint !== undefined ? selectedSoilPoint : localSoilPoint
  const setSelectedSoil = setSelectedSoilPoint || setLocalSoilPoint
  const fileInputRef = useRef(null)
  const [gasPipelineRows, setGasPipelineRows] = useState([])
  const [chainageSegment, setChainageSegment] = useState(null) // { start: [lat,lng], end: [lat,lng] } when a chainage is selected
  const [floodProneZoneSegments, setFloodProneZoneSegments] = useState([]) // Array of segments for flood prone zone filter

  // Load DATA_Gas_Pipeline.json for chainage segment (start→end line)
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

  // Filter gasPipelineRows based on floodProneZone if filter is set
  const filteredGasPipelineRows = (() => {
    if (!filters?.floodProneZone || filters.floodProneZone === 'All' || gasPipelineRows.length === 0) {
      return gasPipelineRows
    }
    return gasPipelineRows.filter((row) => {
      const rowFloodProneZone = getFloodProneZoneFromGasRow(row)
      if (rowFloodProneZone == null) return false
      return String(rowFloodProneZone) === String(filters.floodProneZone)
    })
  })()

  // When chainage is selected, find matching row and set segment for start→end line
  // Note: Search in all gasPipelineRows, not filteredGasPipelineRows, so chainage selection works regardless of flood zone filter
  useEffect(() => {
    if (!filters?.chainage || filters.chainage === 'All' || gasPipelineRows.length === 0) {
      setChainageSegment(null)
      return
    }
    const chainageNum = parseFloat(filters.chainage)
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
    const segment = match ? getStartEndFromGasRow(match) : null
    if (segment) {
      console.log('Chainage segment set:', segment, 'for chainage:', filters.chainage)
    } else {
      console.log('No chainage segment found for chainage:', filters.chainage, 'match:', match, 'total rows:', gasPipelineRows.length)
    }
    setChainageSegment(segment)
  }, [filters?.chainage, gasPipelineRows])

  // When floodProneZone is selected (and no chainage), show all matching segments
  useEffect(() => {
    if (filters?.chainage && filters.chainage !== 'All') {
      // If chainage is selected, don't show flood prone zone segments (chainage takes priority)
      setFloodProneZoneSegments([])
      return
    }
    
    if (!filters?.floodProneZone || filters.floodProneZone === 'All' || filteredGasPipelineRows.length === 0) {
      setFloodProneZoneSegments([])
      return
    }

    // Get all segments that match the flood prone zone filter
    const segments = filteredGasPipelineRows
      .map((row) => getStartEndFromGasRow(row))
      .filter((segment) => segment != null)
    
    setFloodProneZoneSegments(segments)
  }, [filters?.floodProneZone, filters?.chainage, filteredGasPipelineRows])

  // Load Elevation_data_100m_distance.json and build [lat, lng] positions + point info
  useEffect(() => {
    const loadElevation = async () => {
      try {
        const res = await fetch('/Elevation_data_100m_distance.json')
        if (!res.ok) return
        const json = await res.json()
        const rows = json?.sheets?.Sheet1 || []
        const points = rows
          .map((row) => {
            const lat = parseFloat(row.latitude)
            const lng = parseFloat(row.longitude)
            if (isNaN(lat) || isNaN(lng)) return null
            return {
              position: [lat, lng],
              chainage: row.chainage,
              distance: row.distance,
              elevation: row.elevation,
              trees: Array.isArray(row.trees) ? row.trees : [],
            }
          })
          .filter(Boolean)
        setElevationPoints(points)
      } catch (error) {
        console.error('Error loading elevation data:', error)
      }
    }
    loadElevation()
  }, [])

  // Apply chainage filter from filters (if any) to elevation points
  const filteredElevationPoints =
    filters && filters.chainage && filters.chainage !== 'All'
      ? elevationPoints.filter((p) => p.chainage === filters.chainage)
      : elevationPoints

  const elevationPositions = filteredElevationPoints.map((p) => p.position)

  // Trees for selected chainage – show trees from the elevation point for this chainage and the next point
  const chainageTrees = (() => {
    if (!filters?.chainage || filters.chainage === 'All') return []
    if (!elevationPoints || elevationPoints.length === 0) return []

    const filterChainageStr = String(filters.chainage).trim()

    // Find the index of the elevation point whose chainage matches the selected chainage
    const selectedIndex = elevationPoints.findIndex(
      (p) => String(p.chainage).trim() === filterChainageStr,
    )
    if (selectedIndex < 0) return []

    const currentPoint = elevationPoints[selectedIndex]
    const nextPoint =
      selectedIndex < elevationPoints.length - 1
        ? elevationPoints[selectedIndex + 1]
        : null

    let treesToShow = []

    if (currentPoint && Array.isArray(currentPoint.trees)) {
      treesToShow = [...treesToShow, ...currentPoint.trees]
    }

    if (nextPoint && Array.isArray(nextPoint.trees)) {
      treesToShow = [...treesToShow, ...nextPoint.trees]
    }

    return treesToShow
  })()

  // Load soil data points from DATA_Soil.json (Sheet3) - updated CSV format
  useEffect(() => {
    const loadSoil = async () => {
      try {
        // Try new format first (DATA_Soil.json)
        let res = await fetch('/DATA_Soil.json')
        let usingNewFormat = res.ok
        if (!res.ok) {
          // Fallback to old format
          res = await fetch('/Soil_Data_10km_1.json')
          if (!res.ok) return
        }
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const json = await res.json()
        const rows = json?.sheets?.Sheet3 || []

        // Updated Soil Data has no header row; legacy had header at index 0
        const firstLoc = rows[0]?.Locations || rows[0]?.locations
        const looksLikeHeader = firstLoc && typeof firstLoc === 'string' && !firstLoc.match(/\d+\.\d+°?[NS]/i)
        const dataRows = looksLikeHeader ? rows.slice(1) : rows

        const points = dataRows
          .map((row) => {
            // Try new format field name first (Locations), then fallback to old (locations)
            let loc = row.Locations || row.locations

            // Clean common encoding issues so coordinate parser works
            if (typeof loc === 'string') {
              loc = loc
                // Replace replacement character with proper degree symbol
                .replace(/\uFFFD/g, '°')
                // Ensure degree symbol before N/S/C/E/W if it is missing
                .replace(/(\d+(?:\.\d+)?)([NSCEW])/gi, '$1°$2')
            }

            const coords = parseDMSLocation(loc)
            if (!coords) return null
            const [lat, lng] = coords
            return {
              position: [lat, lng],
              raw: row,
            }
          })
          .filter(Boolean)

        setSoilPoints(points)
      } catch (error) {
        console.error('Error loading soil data:', error)
      }
    }
    loadSoil()
  }, [])

  // Load towers from JSON (legacy / fallback; skip if file missing or server returns HTML)
  useEffect(() => {
    const loadTowers = async () => {
      try {
        const response = await fetch('/Power_Grid_Transmission_Line.json')
        if (!response.ok) return
        const ct = response.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const jsonData = await response.json()
        setTowers(jsonData?.sheets?.Sheet1 || [])
      } catch (error) {
        console.error('Error loading towers:', error)
      }
    }
    loadTowers()
  }, [])

  // Load tree data from JSON (optional; skip if file missing or HTML)
  useEffect(() => {
    const loadTreeData = async () => {
      try {
        const response = await fetch('/tree_data.json')
        if (!response.ok) return
        const ct = response.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const jsonData = await response.json()
        setTreeData(jsonData?.data || [])
      } catch (error) {
        console.error('Error loading tree data:', error)
      }
    }
    loadTreeData()
  }, [])

  // Filter trees for selected towers
  useEffect(() => {
    if (selectedTowerIndices && selectedTowerIndices.length > 0 && towers.length > 0 && treeData.length > 0) {
      // Get all selected tower names
      const selectedTowerNames = selectedTowerIndices
        .map(index => towers[index])
        .filter(Boolean)
        .map(tower => tower.tower_name)
      
      // Filter trees that match any of the selected tower names
      const filteredTrees = treeData.filter(tree => 
        selectedTowerNames.includes(tree.towername)
      )
      
      // Also filter by height range if selected
      const finalTrees = filters.heightRange && filters.heightRange !== 'All'
        ? filteredTrees.filter(tree => tree.height_range === filters.heightRange)
        : filteredTrees
      
      setTreesForSelectedTowers(finalTrees)
      console.log(`Found ${finalTrees.length} trees for ${selectedTowerIndices.length} selected tower(s)`)
    } else {
      setTreesForSelectedTowers([])
    }
  }, [selectedTowerIndices, towers, treeData, filters.heightRange])

  // Get towers to display (when no Details selection, show legacy towers)
  const towersToDisplay = selectedTowerIndices && selectedTowerIndices.length > 0
    ? selectedTowerIndices.map(index => towers[index]).filter(Boolean)
    : towers

  // Calculate center point (prefer selected towers, fall back to elevation and legacy towers)
  const getMapCenter = () => {
    if (selectedTowerIndices && selectedTowerIndices.length > 0 && towers.length > 0) {
      const selectedTowers = selectedTowerIndices
        .map(index => towers[index])
        .filter(t => t && t.latitude && t.longitude && 
          !isNaN(parseFloat(t.latitude)) && 
          !isNaN(parseFloat(t.longitude)))
      if (selectedTowers.length > 0) {
        const avgLat = selectedTowers.reduce((sum, t) => sum + parseFloat(t.latitude), 0) / selectedTowers.length
        const avgLng = selectedTowers.reduce((sum, t) => sum + parseFloat(t.longitude), 0) / selectedTowers.length
        return [avgLat, avgLng]
      }
    }
    if (elevationPositions.length > 0) {
      const mid = Math.floor(elevationPositions.length / 2)
      return elevationPositions[mid]
    }
    if (towers.length > 0) {
      const validTowers = towers.filter(t => 
        t.latitude && t.longitude && 
        !isNaN(parseFloat(t.latitude)) && 
        !isNaN(parseFloat(t.longitude))
      )
      if (validTowers.length > 0) {
        const avgLat = validTowers.reduce((sum, t) => sum + parseFloat(t.latitude), 0) / validTowers.length
        const avgLng = validTowers.reduce((sum, t) => sum + parseFloat(t.longitude), 0) / validTowers.length
        return [avgLat, avgLng]
      }
    }
    return [23.2, 69.2] // Default center
  }

  const getSoilColor = (type) => {
    switch (type) {
      case 'Fissured rock': return '#808080'
      case 'Rocky Soil': return '#FFD700'
      case 'Sandy Loam': return '#4169E1'
      default: return '#00FF00'
    }
  }

  const handleKMLUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.kml')) {
      alert('Please upload a KML file (.kml)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const kmlText = e.target.result
        const kml = new DOMParser().parseFromString(kmlText, 'text/xml')
        
        // Check for parsing errors
        const parserError = kml.querySelector('parsererror')
        if (parserError) {
          throw new Error('Invalid KML file format')
        }

        // Convert KML to GeoJSON
        const geoJson = toGeoJSON.kml(kml)
        
        setKmlData(geoJson)
        setKmlFileName(file.name)
      } catch (error) {
        console.error('Error parsing KML:', error)
        alert('Error parsing KML file. Please ensure it is a valid KML file.')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveKML = () => {
    setKmlData(null)
    setKmlFileName(null)
  }

  // Style for GeoJSON layers
  const geoJsonStyle = (feature) => {
    return {
      color: '#FF0000',
      weight: 3,
      opacity: 0.8,
      fillColor: '#FF0000',
      fillOpacity: 0.2,
    }
  }

  return (
    <div className="relative h-full w-full" >
      {/* KML Upload Button */}
      <div className="absolute top-4 left-12 z-[1000] flex flex-col gap-2">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            accept=".kml"
            onChange={handleKMLUpload}
            className="hidden"
            id="kml-upload"
          />
          <label
            htmlFor="kml-upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg cursor-pointer transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload KML
          </label>
        </div>
        
        {kmlFileName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-90 text-black rounded-lg shadow-lg text-xs">
            <span className="truncate max-w-[150px]">{kmlFileName}</span>
            <button
              onClick={handleRemoveKML}
              className="p-1 hover:bg-white text-black rounded transition-colors"
              title="Remove KML"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Soil profile overlay container */}
      {selectedSoil && (
        <div className="absolute bottom-6 left-6 z-[1200] bg-white/95 rounded-xl shadow-2xl border border-gray-300 p-4 w-[450px] max-h-[90%] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] text-gray-700 mb-2">
            {(() => {
              const loc = selectedSoil.raw.Locations || selectedSoil.raw.locations || ''
              // Clean encoding issues
              return typeof loc === 'string' 
                ? loc.replace(/\uFFFD/g, '°').replace(/(\d+(?:\.\d+)?)([NS]|C|[EW])/g, '$1°$2')
                : loc
            })()}
          </div>
            <button 
              className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-500 text-white text-xs hover:bg-blue-600"
              onClick={() => setSelectedSoil(null)}
            >
              ✕
            </button>
          </div>
          <SoilProfile raw={selectedSoil.raw} />
        </div>
      )}

      <MapContainer
        center={getMapCenter()}
        zoom={selectedTowerIndices && selectedTowerIndices.length > 0 ? (selectedTowerIndices.length === 1 ? 15 : 12) : 10}
        style={{ height: '100%', width: '100%',borderRadius: '1.5rem'  }}
        className="z-0"
        key={`${selectedTowerIndices?.join(',') || 'all'}-${getMapCenter()[0]}-${getMapCenter()[1]}`}
      >
        <MapControls baseLayer={baseLayer} onBaseLayerChange={setBaseLayer} />

        {baseLayer === 'satellite' ? (
          <TileLayer
            //attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution= '© Google'
            maxZoom={24}
          />
        ) : baseLayer === 'terrain' ? (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution="Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        
        
        {/* When elevation data loaded: fit to elevation path */}
        {elevationPositions.length > 0 && (
          <FitElevationBounds positions={elevationPositions} shouldFit={true} />
        )}
        {selectedTowerIndices && selectedTowerIndices.length > 0 && (
          <>
            {treesForSelectedTowers.length > 0 && selectedTowerIndices.length === 1 && towers[selectedTowerIndices[0]] && (
              <FitTowerAndTrees 
                tower={towers[selectedTowerIndices[0]]} 
                trees={treesForSelectedTowers} 
              />
            )}
            {treesForSelectedTowers.length === 0 && (
              <MapCenter 
                center={getMapCenter()} 
                zoom={selectedTowerIndices.length === 1 ? 15 : 12} 
              />
            )}
          </>
        )}

        {/* Chainage segment: start→end line + markers when a chainage is selected (from DATA_Gas_Pipeline.json)
            If a Flood Prone Zone filter is selected AND the selected chainage row has the same flood value,
            highlight this single chainage segment in blue. */}
        {chainageSegment && (() => {
          // Determine if this selected chainage belongs to the selected flood prone zone
          let isChainageInSelectedFloodZone = false
          if (filters?.floodProneZone && filters.floodProneZone !== 'All' && gasPipelineRows.length > 0 && filters?.chainage && filters.chainage !== 'All') {
            const filterFloodStr = String(filters.floodProneZone).trim()
            const filterFloodNum = parseFloat(filterFloodStr)
            const chainageNum = parseFloat(filters.chainage)

            const matchingRow = gasPipelineRows.find((row) => {
              const rowChainage = getChainageFromGasRow(row)
              if (rowChainage == null) return false
              const rowChainNum = parseFloat(rowChainage)
              if (Number.isNaN(chainageNum) || Number.isNaN(rowChainNum)) return false
              return Math.abs(rowChainNum - chainageNum) < 0.001
            })

            if (matchingRow) {
              const rowFloodRaw = getFloodProneZoneFromGasRow(matchingRow)
              if (rowFloodRaw != null) {
                const rowFloodStr = String(rowFloodRaw).trim()
                const rowFloodNum = parseFloat(rowFloodStr)

                // Exact string match
                if (rowFloodStr === filterFloodStr) {
                  isChainageInSelectedFloodZone = true
                } else if (!Number.isNaN(rowFloodNum) && !Number.isNaN(filterFloodNum)) {
                  // Numeric match with small tolerance
                  if (Math.abs(rowFloodNum - filterFloodNum) < 1e-6) {
                    isChainageInSelectedFloodZone = true
                  }
                }
              }
            }
          }

          const lineColor = isChainageInSelectedFloodZone ? '#3b82f6' : '#f59e0b'
          const markerGradient = isChainageInSelectedFloodZone
            ? 'linear-gradient(145deg,#3b82f6,#2563eb)'
            : 'linear-gradient(145deg,#ef4444,#dc2626)'

          return (
            <>
              <Polyline
                positions={[chainageSegment.start, chainageSegment.end]}
                pathOptions={{ color: lineColor, weight: 5, opacity: 0.95 }}
              />
              <Marker
                position={chainageSegment.start}
                icon={L.divIcon({
                  className: 'chainage-segment-marker-start',
                  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:linear-gradient(145deg,#10b981,#059669);border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);font-weight:700;color:#fff;font-size:12px;">S</div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                })}
              >
                <Popup>
                  <div className="p-2 min-w-[160px]">
                    <h3 className="font-bold text-sm text-gray-800">Start</h3>
                    <p className="text-xs text-gray-600">
                      Lat, Lon: {chainageSegment.start[0].toFixed(6)}, {chainageSegment.start[1].toFixed(6)}
                    </p>
                    {filters?.chainage && (
                      <p className="text-xs text-gray-600">
                        Chainage: {filters.chainage}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
              <Marker
                position={chainageSegment.end}
                icon={L.divIcon({
                  className: 'chainage-segment-marker',
                  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:${markerGradient};border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);font-weight:700;color:#fff;font-size:12px;">E</div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                })}
              >
                <Popup>
                  <div className="p-2 min-w-[160px]">
                    <h3 className="font-bold text-sm text-gray-800">End</h3>
                    <p className="text-xs text-gray-600">
                      Lat, Lon: {chainageSegment.end[0].toFixed(6)}, {chainageSegment.end[1].toFixed(6)}
                    </p>
                    {isChainageInSelectedFloodZone && (
                      <p className="text-xs text-blue-600 font-semibold">
                        Flood Prone Zone: {filters.floodProneZone}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
              <FitStartEndBounds startLatLng={chainageSegment.start} endLatLng={chainageSegment.end} />
            </>
          )
        })()}

        {/* Flood Prone Zone segments: show all segments matching the flood prone zone filter */}
        {floodProneZoneSegments.length > 0 &&
          floodProneZoneSegments.map((segment, index) => {
            const midLat = (segment.start[0] + segment.end[0]) / 2
            const midLng = (segment.start[1] + segment.end[1]) / 2

            return (
              <Fragment key={`flood-zone-${index}`}>
                {/* Main flood-prone line */}
                <Polyline
                  positions={[segment.start, segment.end]}
                  pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.9 }}
                />
                {/* Highlighted flood area around the segment (few hundred meters) */}
                <Circle
                  center={[midLat, midLng]}
                  radius={300} // metres; adjust if you want a bigger/smaller highlighted area
                  pathOptions={{
                    color: '#2563eb',
                    weight: 1,
                    fillColor: '#60a5fa',
                    fillOpacity: 0.25,
                  }}
                />
              </Fragment>
            )
          })}

        {/* Elevation path: polyline + point markers (from Elevation_data_100m_distance.json) */}
        {elevationPositions.length > 0 && (
          <>
            <Polyline
              positions={elevationPositions}
              pathOptions={{ color: '#10b981', weight: 3, opacity: 0.9 }}
            />
            {filteredElevationPoints.map((point, i) => (
              <Marker
                key={`elev-${i}`}
                position={point.position}
                eventHandlers={{
                  click: () => setSelectedElevationPoint(point),
                }}
                icon={L.divIcon({
                  className: 'elevation-marker',
                  html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:linear-gradient(145deg,#10b981,#059669);border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);"><i class="fa-solid fa-arrow-trend-up" style="color:#fff;font-size:16px;"></i></div>`,
                  iconSize: [28, 28],
                  iconAnchor: [18, 18]
                })}
              >
                <Popup>
                  <div className="p-2 min-w-[140px]">
                    <h3 className="font-bold text-sm text-gray-800">Elevation point</h3>
                    {point.chainage && (
                      <p className="text-xs text-gray-600">Chainage: {point.chainage}</p>
                    )}
                    <p className="text-xs text-gray-600">Distance: {(Number(point.distance) || 0).toFixed(2)} km</p>
                    <p className="text-xs text-gray-600">Elevation: {point.elevation} m</p>
                    <p className="text-xs text-gray-600">
                      Lat, Lng: {point.position[0].toFixed(6)}, {point.position[1].toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* Trees for selected chainage (from elevation data, without clicking) */}
        {filters?.chainage &&
          filters.chainage !== 'All' &&
          chainageTrees.length > 0 &&
          chainageTrees
            .filter((t) => {
              if (!filters?.treeHeight || filters.treeHeight === 'All') return true
              return String(t.height) === String(filters.treeHeight)
            })
            .sort((a, b) => {
              // Sort by height in ascending order
              const heightA = parseFloat(a.height) || 0
              const heightB = parseFloat(b.height) || 0
              return heightA - heightB
            })
            .map((t, index) => {
              const tLat = parseFloat(t.latitude)
              const tLng = parseFloat(t.longitude)
              if (isNaN(tLat) || isNaN(tLng)) return null

              // Icon size based on height
              const treeHeight = parseFloat(t.height) || 1
              const baseSize = 20
              const sizeMultiplier = Math.min(treeHeight / 10, 2)
              const iconSize = Math.max(
                baseSize,
                Math.min(baseSize * (1 + sizeMultiplier * 0.5), 40),
              )
              const fontSize = Math.max(
                10,
                Math.min(iconSize * 0.5, 18),
              )

              const treeIcon = L.divIcon({
                className: 'custom-tree-marker-chainage',
                html: `<div style="display:flex;align-items:center;justify-content:center;width:${iconSize}px;height:${iconSize}px;background:linear-gradient(145deg,#16a34a,#22c55e);border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);"><i class="fa-solid fa-tree" style="color:#fff;font-size:${fontSize}px;"></i></div>`,
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize / 2, iconSize / 2],
              })

              return (
                <Marker
                  key={`chainage-tree-${index}`}
                  position={[tLat, tLng]}
                  icon={treeIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-sm mb-1">Tree (Chainage)</h3>
                      {t.height && (
                        <p className="text-xs text-gray-600">
                          Height: {t.height} m
                        </p>
                      )}
                      {filters?.chainage && (
                        <p className="text-xs text-gray-600">
                          Chainage: {filters.chainage}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">
                        Lat, Lng: {tLat.toFixed(6)}, {tLng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}

        {/* Soil data points (from Soil_Data_10km_1.json using DMS Locations) */}
        {soilPoints.map((pt, index) => (
          <Marker
            key={`soil-${index}`}
            position={pt.position}
            icon={L.divIcon({
              className: 'soil-marker',
              html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:linear-gradient(145deg,#f97316,#ea580c);border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);"><i class="fa-solid fa-earth-americas" style="color:#fff;font-size:16px;"></i></div>`,
              iconSize: [28, 28],
              iconAnchor: [18, 18],
            })}
          >
            <Popup>
              <div className="p-1 min-w-[160px] text-xs text-gray-800">
                <h3 className="font-bold text-sm mb-1">Soil data point</h3>
                <p>Location: {(() => {
                  const loc = pt.raw.Locations || pt.raw.locations || ''
                  // Clean encoding issues
                  return typeof loc === 'string' 
                    ? loc.replace(/\uFFFD/g, '°').replace(/(\d+(?:\.\d+)?)([NS]|C|[EW])/g, '$1°$2')
                    : loc
                })()}</p>
                <p>
                  Lat, Lng: {pt.position[0].toFixed(6)}, {pt.position[1].toFixed(6)}
                </p>
                {/* <p className="mt-1">
                  <span className="font-semibold">Dry density @ 1 m:</span> {pt.raw.at_1_m_depth}
                </p>
                <p>
                  <span className="font-semibold">Dry density @ 2 m:</span> {pt.raw.at_2_m_depth}
                </p>
                <p>
                  <span className="font-semibold">Dry density @ 3 m:</span> {pt.raw.at_3_m_depth}
                </p>
                <p>
                  <span className="font-semibold">Dry density @ 4 m:</span> {pt.raw.at_4_m_depth}
                </p> */}
                <button
                  className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-[10px]"
                  onClick={() => setSelectedSoil(pt)}
                >
                  View soil profile chart
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Tree markers from elevation data between clicked point and next point (filtered by tree height dropdown) */}
        {selectedElevationPoint && (() => {
          // Find the index of the selected elevation point
          const selectedIndex = filteredElevationPoints.findIndex(
            (p) => p.position[0] === selectedElevationPoint.position[0] && 
                   p.position[1] === selectedElevationPoint.position[1]
          )
          
          // Get trees that are between the clicked point and the next point
          let treesToShow = []
          if (selectedIndex >= 0) {
            const currentPoint = filteredElevationPoints[selectedIndex]
            const nextPoint = filteredElevationPoints[selectedIndex + 1]
            
            if (currentPoint) {
              // Get all trees from elevation points between current and next
              const startLat = currentPoint.position[0]
              const startLng = currentPoint.position[1]
              const endLat = nextPoint ? nextPoint.position[0] : startLat
              const endLng = nextPoint ? nextPoint.position[1] : startLng
              
              // Collect trees from current point and all intermediate points
              for (let i = selectedIndex; i <= (nextPoint ? selectedIndex + 1 : selectedIndex); i++) {
                const point = filteredElevationPoints[i]
                if (point && Array.isArray(point.trees)) {
                  // Filter trees that are between the start and end points
                  const filteredTrees = point.trees.filter((t) => {
                    const tLat = parseFloat(t.latitude)
                    const tLng = parseFloat(t.longitude)
                    if (isNaN(tLat) || isNaN(tLng)) return false
                    
                    // Check if tree is between the two elevation points
                    const minLat = Math.min(startLat, endLat)
                    const maxLat = Math.max(startLat, endLat)
                    const minLng = Math.min(startLng, endLng)
                    const maxLng = Math.max(startLng, endLng)
                    
                    return tLat >= minLat && tLat <= maxLat && tLng >= minLng && tLng <= maxLng
                  })
                  treesToShow = [...treesToShow, ...filteredTrees]
                }
              }
            }
          } else {
            // Fallback: use trees from selectedElevationPoint if not found in filteredElevationPoints
            if (Array.isArray(selectedElevationPoint.trees)) {
              treesToShow = [...selectedElevationPoint.trees]
            }
          }
          
          return treesToShow
            .filter((t) => {
              if (!filters?.treeHeight || filters.treeHeight === 'All') return true
              return String(t.height) === String(filters.treeHeight)
            })
            .sort((a, b) => {
              // Sort by height in ascending order (increasing way)
              const heightA = parseFloat(a.height) || 0
              const heightB = parseFloat(b.height) || 0
              return heightA - heightB
            })
            .map((t, index) => {
            const tLat = parseFloat(t.latitude)
            const tLng = parseFloat(t.longitude)
            if (isNaN(tLat) || isNaN(tLng)) return null

            // Calculate icon size based on tree height (increasing size for taller trees)
            const treeHeight = parseFloat(t.height) || 1
            const baseSize = 20
            const sizeMultiplier = Math.min(treeHeight / 10, 2) // Scale up to 2x for very tall trees
            const iconSize = Math.max(baseSize, Math.min(baseSize * (1 + sizeMultiplier * 0.5), 40))
            const fontSize = Math.max(10, Math.min(iconSize * 0.5, 18))

            const treeIcon = L.divIcon({
              className: 'custom-tree-marker-elevation',
              html: `<div style="display:flex;align-items:center;justify-content:center;width:${iconSize}px;height:${iconSize}px;background:linear-gradient(145deg,#16a34a,#22c55e);border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);"><i class="fa-solid fa-tree" style="color:#fff;font-size:${fontSize}px;"></i></div>`,
              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize / 2],
            })

            return (
              <Marker
                key={`elev-tree-${index}`}
                position={[tLat, tLng]}
                icon={treeIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-sm mb-1">Tree</h3>
                    {t.height && (
                      <p className="text-xs text-gray-600">Height: {t.height} m</p>
                    )}
                    {selectedElevationPoint.chainage && (
                      <p className="text-xs text-gray-600">
                        Chainage (segment): {selectedElevationPoint.chainage}
                      </p>
                    )}
                    {(t.chainage_start || t.chainage_end) && (
                      <p className="text-xs text-gray-600">
                        Chainage range: {t.chainage_start} – {t.chainage_end}
                      </p>
                    )}
                    <p className="text-xs text-gray-600">
                      Lat, Lng: {tLat.toFixed(6)}, {tLng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })
        })()}

        {/* Tower Markers */}
        {towersToDisplay.map((tower) => {
          const lat = parseFloat(tower.latitude)
          const lng = parseFloat(tower.longitude)
          
          if (isNaN(lat) || isNaN(lng)) return null
          
          // Find the actual index in the original towers array
          const actualIndex = towers.findIndex(t => t.tower_name === tower.tower_name && t.latitude === tower.latitude)
          const isSelected = selectedTowerIndices && selectedTowerIndices.includes(actualIndex)
          
          // Create custom icon for selected tower
          const icon = isSelected 
            ? L.divIcon({
                className: 'custom-marker-selected',
                html: `<div style="background-color: #FF0000; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255,0,0,0.8);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            : L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })
          
          return (
            <Marker
              key={`tower-${actualIndex}`}
              position={[lat, lng]}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1">{tower.tower_name || `Tower ${actualIndex + 1}`}</h3>
                  <p className="text-xs text-gray-600">
                    Lat, Lng: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                  {tower.ground_elevation && (
                    <p className="text-xs text-gray-600">Elevation: {tower.ground_elevation} m</p>
                  )}
                  {tower.sagging && (
                    <p className="text-xs text-gray-600">Sagging: {tower.sagging}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Tree Markers for Selected Towers */}
        {treesForSelectedTowers.map((tree, index) => {
          const treeLat = parseFloat(tree.treelatitude)
          const treeLng = parseFloat(tree.treelongitude)
          
          if (isNaN(treeLat) || isNaN(treeLng)) return null
          
          // Custom icon for tree (green) – attractive pin style
          const treeIcon = L.divIcon({
            className: 'custom-tree-marker',
            html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:linear-gradient(145deg,#22c55e,#16a34a);border:2px solid rgba(255,255,255,0.95);border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);"><i class="fa-solid fa-seedling" style="color:#fff;font-size:12px;"></i></div>`,
            iconSize: [28, 28],
            iconAnchor: [18, 18]
          })
          
          return (
            <Marker
              key={`tree-${index}`}
              position={[treeLat, treeLng]}
              icon={treeIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1">Tree</h3>
                  <p className="text-xs text-gray-600">Tower: {tree.towername}</p>
                  <p className="text-xs text-gray-600">
                    Lat, Lng: {treeLat.toFixed(6)}, {treeLng.toFixed(6)}
                  </p>
                  {tree.height && (
                    <p className="text-xs text-gray-600">Height: {tree.height} m</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* KML GeoJSON Layer */}
        {kmlData && (
          <>
            <GeoJSON
              data={kmlData}
              style={geoJsonStyle}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  layer.bindPopup(feature.properties.name)
                }
              }}
            />
            <MapBounds geoJsonData={kmlData} />
          </>
        )}
        
       
      </MapContainer>
      
      
    </div>
  )
}

export default MapView


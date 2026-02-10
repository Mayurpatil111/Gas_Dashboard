import { useState, useEffect } from 'react'
import { Ruler } from 'lucide-react'

function RightSideFilters({ filters, onFilterChange }) {
  const [chainages, setChainages] = useState([])
  const [treeHeights, setTreeHeights] = useState([])
  const [floodProneZones, setFloodProneZones] = useState([])

  // Load unique chainage values from Elevation_data_100m_distance.json
  useEffect(() => {
    const loadChainages = async () => {
      try {
        const response = await fetch('/Elevation_data_100m_distance.json')
        if (!response.ok) return
        const ct = response.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const jsonData = await response.json()
        const rows = jsonData?.sheets?.Sheet1 || []
        const uniqueChainages = [...new Set(
          rows
            .map(row => row.chainage)
            .filter(c => c !== '' && c !== null && c !== undefined)
        )]
        setChainages(uniqueChainages)
      } catch (error) {
        console.error('Error loading chainages:', error)
      }
    }
    loadChainages()
  }, [])

  // Load unique tree heights from Trees_odisha.json
  useEffect(() => {
    const loadTreeHeights = async () => {
      try {
        const response = await fetch('/Trees_odisha.json')
        if (!response.ok) return
        const ct = response.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const jsonData = await response.json()
        const rows = jsonData?.sheets?.Sheet1 || []
        const uniqueHeights = [...new Set(
          rows
            .map(row => row.height)
            .filter(h => h !== '' && h !== null && h !== undefined)
        )].sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0))
        setTreeHeights(uniqueHeights)
      } catch (error) {
        console.error('Error loading tree heights:', error)
      }
    }
    loadTreeHeights()
  }, [])

  // Load unique flood prone zone values from DATA_Gas_Pipeline.json
  useEffect(() => {
    const loadFloodProneZones = async () => {
      try {
        const response = await fetch('/DATA_Gas_Pipeline.json')
        if (!response.ok) return
        const ct = response.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const jsonData = await response.json()
        const rows = jsonData?.sheets?.Sheet1 || []
        
        // Get unique flood prone zone values
        const getFloodProneZoneValue = (row) => {
          // Try different possible field names (new CSV format first)
          const val = row['Flood Prone Zone Area (Acres)'] ||
                      row.flood_prone_zone_area_acres_0 || 
                      row.flood_prone_zone || 
                      row.flood_prone_zone_km ||
                      ''
          if (val && val !== '' && val !== null && val !== undefined && val !== '0' && val !== 'NA') {
            return String(val)
          }
          return null
        }
        
        const uniqueZones = [...new Set(
          rows
            .map(getFloodProneZoneValue)
            .filter(z => z !== null && z !== '')
        )].sort()
        
        setFloodProneZones(uniqueZones)
      } catch (error) {
        console.error('Error loading flood prone zones:', error)
      }
    }
    loadFloodProneZones()
  }, [])

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  return (
    <div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chainage Dropdown */}
          <div className="group md:col-span-1">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Ruler className="w-4 h-4 text-green-400" />
              Chainage
            </label>
            <select
              value={filters?.chainage || 'All'}
              onChange={(e) => handleChange('chainage', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-black appearance-none"
              style={{ backgroundColor: 'black', color: 'white', borderColor: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <option value="All">All Chainages</option>
              {chainages.map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Tree Height Dropdown */}
          <div className="group md:col-span-1">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Ruler className="w-4 h-4 text-yellow-400" />
              Tree Height
            </label>
            <select
              value={filters?.treeHeight || 'All'}
              onChange={(e) => handleChange('treeHeight', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:bg-black appearance-none"
              style={{ backgroundColor: 'black', color: 'white', borderColor: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <option value="All">All Heights</option>
              {treeHeights.map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Flood Prone Zone Dropdown */}
          <div className="group md:col-span-1">
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Ruler className="w-4 h-4 text-blue-400" />
              Flood Zone (Acres)
            </label>
            <select
              value={filters?.floodProneZone || 'All'}
              onChange={(e) => handleChange('floodProneZone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-black appearance-none"
              style={{ backgroundColor: 'black', color: 'white', borderColor: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', cursor: 'pointer' }}
            >
              <option value="All">All Flood Prone Zones</option>
              {floodProneZones.map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightSideFilters

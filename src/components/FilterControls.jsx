import { useState, useEffect, useRef } from 'react'
import { Building2, Ruler, X, Check } from 'lucide-react'

function FilterControls({ onFilterChange }) {
  const [filters, setFilters] = useState({
    towerNo: 'All',
    selectedTowers: [], // Array of tower indices
    heightRange: 'All',
    chainage: 'All',
    treeHeight: 'All'
  })

  const [isExpanded, setIsExpanded] = useState(true)
  const [towerNames, setTowerNames] = useState([]) // legacy; no longer loaded from Details file
  const [heightRanges, setHeightRanges] = useState([])
  const [chainages, setChainages] = useState([])
  const [treeHeights, setTreeHeights] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Note: tower names are no longer loaded from Power_Grid_Transmission_Line_Details.json

  // Load unique height ranges from tree_data.json (optional; skip if file missing or HTML)
  useEffect(() => {
    const loadHeightRanges = async () => {
      try {
        const response = await fetch('/tree_data.json')
        if (!response.ok) return
        const ct = response.headers.get('content-type') || ''
        if (!ct.includes('application/json')) return
        const jsonData = await response.json()
        const treeData = jsonData?.data || []
        const uniqueRanges = [...new Set(
          treeData
            .map(row => row.height_range)
            .filter(range => range && range !== '' && range !== null && range !== undefined)
        )].sort()
        setHeightRanges(uniqueRanges)
      } catch (error) {
        console.error('Error loading height ranges:', error)
      }
    }
    loadHeightRanges()
  }, [])

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const handleTowerToggle = (towerIndex) => {
    setFilters(prevFilters => {
      const currentSelected = prevFilters.selectedTowers || []
      const newSelected = currentSelected.includes(towerIndex)
        ? currentSelected.filter(idx => idx !== towerIndex)
        : [...currentSelected, towerIndex]
      
      const newFilters = {
        ...prevFilters,
        selectedTowers: newSelected,
        towerNo: newSelected.length === 0 ? 'All' : newSelected.length === 1 ? newSelected[0].toString() : 'Multiple'
      }
      
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
      return newFilters
    })
  }

  const handleSelectAll = () => {
    const allIndices = filteredTowerNames.map(tower => tower.index)
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        selectedTowers: allIndices,
        towerNo: 'Multiple'
      }
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
      return newFilters
    })
  }

  const handleClearAll = () => {
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        selectedTowers: [],
        towerNo: 'All'
      }
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
      return newFilters
    })
  }

  const handleRemoveTower = (towerIndex, e) => {
    e.stopPropagation()
    setFilters(prevFilters => {
      const newSelected = prevFilters.selectedTowers.filter(idx => idx !== towerIndex)
      const newFilters = {
        ...prevFilters,
        selectedTowers: newSelected,
        towerNo: newSelected.length === 0 ? 'All' : newSelected.length === 1 ? newSelected[0].toString() : 'Multiple'
      }
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
      return newFilters
    })
  }

  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-850 to-gray-800 border-b border-gray-700 shadow-lg">
      <div className="px-6 py-4">
        

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tower Name Multi-Select Dropdown */}
            {/* <div className="group md:col-span-1 relative" ref={dropdownRef}>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <Building2 className="w-4 h-4 text-green-400" />
                 {filters.selectedTowers.length > 0 && `(${filters.selectedTowers.length} selected)`}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-gray-800 flex items-center justify-between"
                  style={{ backgroundColor: 'black', color: 'white', borderColor: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  <span className="truncate">
                    {filters.selectedTowers.length === 0 
                      ? 'All Towers' 
                      : filters.selectedTowers.length === 1
                      ? towerNames.find(t => t.index === filters.selectedTowers[0])?.name || 'Selected Tower'
                      : `${filters.selectedTowers.length} Towers Selected`}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

               

               
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden flex flex-col">

                  
                    <div className="overflow-y-auto max-h-48">
                      {filteredTowerNames.length === 0 ? (
                        <div className="px-4 py-3 text-gray-400 text-sm text-center">No towers found</div>
                      ) : (
                        filteredTowerNames.map((tower) => {
                          const isSelected = filters.selectedTowers.includes(tower.index)
                          return (
                            <label
                              key={tower.index}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700/50 cursor-pointer transition-colors"
                            >
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleTowerToggle(tower.index)}
                                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                                />
                                {isSelected && (
                                  <Check className="absolute left-0 w-4 h-4 text-green-400 pointer-events-none" />
                                )}
                              </div>
                              <span className="text-white text-sm flex-1">{tower.name}</span>
                            </label>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div> */}

            {/* Height Range Dropdown */}
            {/* <div className="group md:col-span-1">
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <Ruler className="w-4 h-4 text-yellow-400" />
                Tree Height Range
              </label>
              <select
                value={filters.heightRange}
                onChange={(e) => handleChange('heightRange', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:bg-black appearance-none "
                style={{ backgroundColor: 'black', color: 'white', borderColor: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                <option value="All">All Height Ranges</option>
                {heightRanges.map((range, index) => (
                  <option key={index} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Chainage Dropdown (from Elevation_data_100m_distance.json) */}
            {/* <div className="group md:col-span-1">
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <Ruler className="w-4 h-4 text-green-400" />
                Chainage
              </label>
              <select
                value={filters.chainage}
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
            </div> */}

            {/* Tree Height Dropdown (from Trees_odisha.json) */}
            {/* <div className="group md:col-span-1">
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <Ruler className="w-4 h-4 text-yellow-400" />
                Tree Height
              </label>
              <select
                value={filters.treeHeight}
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
            </div> */}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterControls


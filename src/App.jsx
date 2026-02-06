import { useState } from 'react'
import FilterControls from './components/FilterControls'
import MapView from './components/MapView'
import DataPanels from './components/DataPanels'
import './App.css'

function App() {
  const [filters, setFilters] = useState({
    towerNo: 'All',
    selectedTowers: [],
    heightRange: 'All',
    chainage: 'All'
  })

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    // Here you would typically filter your data based on the new filters
    console.log('Filters changed:', newFilters)
  }

  // Get selected tower indices (array of indices, or null if 'All')
  const selectedTowerIndices = filters.selectedTowers && filters.selectedTowers.length > 0
    ? filters.selectedTowers
    : null

  // Selected soil point (orange marker) – lifted so DataPanels can show soil sections only when set
  const [selectedSoilPoint, setSelectedSoilPoint] = useState(null)

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Filter Controls Bar */}
      <FilterControls onFilterChange={handleFilterChange} />
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Map */}
        <div className="w-[75%] relative bg-gray-900/50 p-[1rem] rounded-lg">
          <MapView
            filters={filters}
            selectedTowerIndices={selectedTowerIndices}
            selectedSoilPoint={selectedSoilPoint}
            setSelectedSoilPoint={setSelectedSoilPoint}
          />
        </div>
        {/* Right Panel - Data */}
        <div className="w-[25%] border-l border-gray-700/50 shadow-2xl">
          <DataPanels
            projectData={null}
            selectedTowerIndices={selectedTowerIndices}
            selectedSoilPoint={selectedSoilPoint}
          />
        </div>
      </div>
    </div>
  )
}

export default App

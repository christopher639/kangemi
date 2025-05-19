import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Contributions from './Pages/Contributions'
import Topbar from './components/Topbar'
import Members from './Pages/Members'


const App = () => {
  return (
    <>
      <Topbar />
      <Routes>
    
        <Route path="/contributions" element={<Contributions />} />
          <Route path="/members" element={<Members />} />
       
      </Routes>
    </>
  )
}

export default App

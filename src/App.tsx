import { useEffect, useState } from 'react'
import './App.css'
<<<<<<< Updated upstream
import { Channel } from './components/Channel'
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
>>>>>>> Stashed changes

// Components
import Navbar from './components/Navbar'

// Pages
import Research from './pages/Research'
import CaseList from './pages/CaseList'
import CaseDetail from './pages/CaseDetail'

function App() {

  const [initialState, setState] = useState([])
  const url = "http://localhost:5001/api"

  useEffect(()=> {
    fetch(url).then(response => {
      if(response.status == 200){
        return response.json()
      }
    }).then(data => setState(data))
  }, [])

  return (
<<<<<<< Updated upstream
    <div className="w-full bg-gray-100 py-8">
      <Navbar />
      <Channel data={initialState}/>
    </div>
=======
    <Router>
      <div className="w-full bg-gray-100">
        <Navbar />
        <div className="ml-56">
          <Routes>
            <Route path="/research" element={<Research />} />
            <Route path="/case" element={<CaseList />} />
            <Route path="/case/:id" element={<CaseDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
>>>>>>> Stashed changes
  )
}

export default App

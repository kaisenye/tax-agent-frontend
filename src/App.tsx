// import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import Navbar from './components/Navbar'

// Pages
import Research from './pages/Research'
import CaseList from './pages/CaseList'
import CaseDetail from './pages/CaseDetail'

function App() {
  // const [initialState, setState] = useState([])
  // const url = "http://localhost:5001/api"

  // useEffect(()=> {
  //   fetch(url).then(response => {
  //     if(response.status == 200){
  //       return response.json()
  //     }
  //   }).then(data => setState(data))
  // }, [])

  return (
    <Router>
      <div className="w-full">
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
  )
}

export default App

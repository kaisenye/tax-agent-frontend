import { useEffect, useState } from 'react'
import './App.css'
import { Channel } from './components/Channel'

// Components
import Navbar from './components/Navbar'

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
    <div className="w-full bg-gray-100 py-8">
      <Navbar />
      <Channel data={initialState}/>
    </div>
  )
}

export default App

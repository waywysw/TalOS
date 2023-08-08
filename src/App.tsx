import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react'
import ChatNavBar from './components/shared/NavBar';
import './App.scss'
import { ConstructOS } from './components/constructOS';
import { DiscordListeners } from './listeners/discord-listeners';
import AgentsPage from './pages/agents';
import ActionsPage from './pages/actions';
import SettingsPage from './pages/settings';
import DocsPage from './pages/docs';

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  return (
  <div className='App'>
    <DiscordListeners/>
    <ChatNavBar />
    <Router>
      <Routes>
        <Route path='/*' element={<></>} />
        <Route path='/terminal' element={<ConstructOS/>} />
        <Route path='/agents' element={<AgentsPage/>} />
        <Route path='/actions' element={<ActionsPage/>} />
        <Route path='/settings' element={<SettingsPage/>} />
        <Route path='/docs' element={<DocsPage/>} />
      </Routes>
  </Router>
  </div>
  )
}

export default App

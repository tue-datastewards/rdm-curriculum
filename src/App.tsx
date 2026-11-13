import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { OverviewPage } from './pages/OverviewPage'
import { MatrixPage } from './pages/MatrixPage'
import { ModulePage } from './pages/ModulePage'
import { CiloPage } from './pages/CiloPage'
import { NotFoundPage } from './pages/NotFoundPage'

function ScrollBehaviour() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <>
      <ScrollBehaviour />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="matrix" element={<MatrixPage />} />
          <Route path="modules/:moduleId" element={<ModulePage />} />
          <Route path="cilos/:ciloId" element={<CiloPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

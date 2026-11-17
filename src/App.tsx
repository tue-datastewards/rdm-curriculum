import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { StaffLayout } from './components/StaffLayout'
import { HomePage } from './pages/HomePage'
import { ModulesPage } from './pages/ModulesPage'
import { ModulePage } from './pages/ModulePage'
import { AboutPage } from './pages/AboutPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CurriculumPage } from './staff/CurriculumPage'
import { StaffCiloPage } from './staff/StaffCiloPage'
import { EditingGuidePage } from './staff/EditingGuidePage'

function ScrollBehaviour() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1))
      if (element) {
        element.scrollIntoView({ block: 'start' })
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
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="modules/:moduleId" element={<ModulePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="curriculum" element={<StaffLayout />}>
          <Route index element={<CurriculumPage />} />
          <Route path="guide" element={<EditingGuidePage />} />
          <Route path="cilos/:ciloId" element={<StaffCiloPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

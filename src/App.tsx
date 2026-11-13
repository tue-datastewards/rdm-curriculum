import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { OverviewPage } from './pages/OverviewPage'
import { MatrixPage } from './pages/MatrixPage'
import { CiloPage } from './pages/CiloPage'
import { NotFoundPage } from './pages/NotFoundPage'

// The module page carries the markdown renderer; load it on demand so the
// overview and matrix stay light.
const ModulePage = lazy(() =>
  import('./pages/ModulePage').then((module) => ({ default: module.ModulePage })),
)

function PageFallback() {
  return (
    <p className="py-24 text-center text-sm text-slate-500" role="status">
      Loading…
    </p>
  )
}

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
          <Route
            path="modules/:moduleId"
            element={
              <Suspense fallback={<PageFallback />}>
                <ModulePage />
              </Suspense>
            }
          />
          <Route path="cilos/:ciloId" element={<CiloPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

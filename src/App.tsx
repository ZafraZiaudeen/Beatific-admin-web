import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'

import SignInPage from './pages/sign-in.page'
import SignUpPage from './pages/sign-up.page'
import DashboardPage from './pages/dashboard.page'
import TemplatesPage from './pages/templates.page'
import StickersPage from './pages/stickers.page'
import TemplateEditorPage from './pages/template-editor.page'
import StickerEditorPage from './pages/sticker-editor.page'

import RootLayout from './layouts/root.layout'
import AuthLayout from './layouts/auth.layout'
import ProtectedLayout from './layouts/protected.layout'
import AdminLayout from './layouts/admin.layout'
import EditorLayout from './layouts/editor.layout'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>

        {/* Auth routes — redirect away if already logged in */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>

        {/* Protected routes — redirect to /sign-in if not authenticated */}
        <Route element={<ProtectedLayout />}>

          {/* Admin layout: sidebar + header */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/stickers" element={<StickersPage />} />
          </Route>

          {/* Editor layout: fullscreen canvas, no sidebar or header */}
          <Route element={<EditorLayout />}>
            <Route path="/templates/editor" element={<TemplateEditorPage />} />
            <Route path="/templates/editor/:id" element={<TemplateEditorPage />} />
            <Route path="/stickers/editor" element={<StickerEditorPage />} />
            <Route path="/stickers/editor/:id" element={<StickerEditorPage />} />
          </Route>

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/sign-in" replace />} />

      </Route>
    </Routes>
  )
}

export default App

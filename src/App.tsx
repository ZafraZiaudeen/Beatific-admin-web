import './App.css'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import SignInPage from './pages/sign-in.page'
import SignUpPage from './pages/sign-up.page'
import DashboardPage from './pages/dashboard.page'
import ContentPage from './pages/content.page'
import ContentEditorPage from './pages/content-editor.page'
import PagesPage from './pages/pages.page'
import PageEditorPage from './pages/page-editor.page'
import PermissionsPage from './pages/permissions.page'
import UsersPage from './pages/users.page'
import SettingsPage from './pages/settings.page'

import RootLayout from './layouts/root.layout'
import AuthLayout from './layouts/auth.layout'
import ProtectedLayout from './layouts/protected.layout'
import AdminLayout from './layouts/admin.layout'
import EditorLayout from './layouts/editor.layout'

function LegacyEditorRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/content/editor/${id}` : '/content/editor'} replace />
}

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>

        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedLayout />}>

          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/pages" element={<PagesPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/templates" element={<Navigate to="/content?type=template" replace />} />
            <Route path="/stickers"  element={<Navigate to="/content?type=sticker"  replace />} />
          </Route>

          <Route element={<EditorLayout />}>
            <Route path="/content/editor"     element={<ContentEditorPage />} />
            <Route path="/content/editor/:id" element={<ContentEditorPage />} />
            <Route path="/pages/editor"       element={<PageEditorPage />} />
            <Route path="/pages/editor/:id"   element={<PageEditorPage />} />
            <Route path="/templates/editor"       element={<LegacyEditorRedirect />} />
            <Route path="/templates/editor/:id"   element={<LegacyEditorRedirect />} />
            <Route path="/stickers/editor"        element={<LegacyEditorRedirect />} />
            <Route path="/stickers/editor/:id"    element={<LegacyEditorRedirect />} />
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/sign-in" replace />} />

      </Route>
    </Routes>
  )
}

export default App

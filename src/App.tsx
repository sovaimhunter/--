import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import AlgorithmPage from './pages/AlgorithmPage'
import AlgorithmDetailPage from './pages/AlgorithmDetailPage'
import CoursePage from './pages/CoursePage'
import CourseDetailPage from './pages/CourseDetailPage'
import BlogPage from './pages/BlogPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/algorithm" element={<AlgorithmPage />} />
        <Route path="/algorithm/:id" element={<AlgorithmDetailPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/course/:id" element={<CourseDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  )
}

export default App

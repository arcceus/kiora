
import { ThemeProvider } from './components/theme-provider';
import { GalleryView } from './components/GalleryView';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BuilderPage from './builder/BuilderPage';

export default function App() { 

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<GalleryView />} />
          <Route path="/builder" element={<BuilderPage />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};

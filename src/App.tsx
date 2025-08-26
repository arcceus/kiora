
import { ThemeProvider } from './components/theme-provider';
import { GalleryView } from './components/GalleryView';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimpleLayoutEditor } from './components/SimpleLayoutEditor';

export default function App() { 

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route path="/" element={<GalleryView />} />
          <Route path="/builder" element={<SimpleLayoutEditor />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};

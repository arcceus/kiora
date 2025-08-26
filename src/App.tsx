
import { ThemeProvider } from './components/theme-provider';
import { GalleryView } from './components/GalleryView';

export default function App() { 

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <GalleryView />
    </ThemeProvider>
  );
};

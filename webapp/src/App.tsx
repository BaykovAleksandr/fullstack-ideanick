import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TrpcProvider } from './lib/trpc';
import { AllIdeasPage } from './pages/AllIdeasPage';
import { ViewIdeaPage } from './pages/ViewIdeaPage';
import { getAllIdeasRoute, getViewIdeaRoute } from './lib/routes';

export const App = () => {
  return (
    <TrpcProvider>
      <BrowserRouter>
        <Routes>
          <Route path={getAllIdeasRoute()} element={<AllIdeasPage />} />
          <Route path={getViewIdeaRoute({ideaNick: ":ideaNick"})} element={<ViewIdeaPage />} />
        </Routes>
      </BrowserRouter>
    </TrpcProvider>
  );
};

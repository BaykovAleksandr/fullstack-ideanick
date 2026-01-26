import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TrpcProvider } from './lib/trpc';
import { useEffect } from 'react';

import './styles/global.scss';
import { AppContextProvider } from './lib/ctx';
import * as routes from './lib/routes';
import { SignInPage } from './pages/auth/SignInPage';
import { SignOutPage } from './pages/auth/SignOutPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { AllIdeasPage } from './pages/ideas/AllIdeasPage';
import { EditIdeaPage } from './pages/ideas/EditIdeaPage';
import { NewIdeaPage } from './pages/ideas/NewIdeaPage';
import { ViewIdeaPage } from './pages/ideas/ViewIdeaPage';
import { NotFoundPage } from './pages/other/NotFoundPage';
import { EditProfilePage } from './pages/auth/EditProfilePage';
import { HeadProvider } from 'react-head';
import { NotAuthRouteTracker } from './components/NotAuthRouteTracker';
import { Layout } from './components/layout';
import { useTheme } from './lib/useTheme';

const ThemeInitializer = () => {
  const { theme } = useTheme();
  // Тема применяется автоматически через useEffect в useTheme
  return null;
};

export const App = () => {
  return (
    <HeadProvider>
      <ThemeInitializer />
      <TrpcProvider>
        <AppContextProvider>
          <BrowserRouter>
            <NotAuthRouteTracker />
            <Routes>
              <Route path={routes.getSignOutRoute.definition} element={<SignOutPage />} />
              <Route element={<Layout />}>
                <Route path={routes.getSignUpRoute.definition} element={<SignUpPage />} />
                <Route path={routes.getSignInRoute.definition} element={<SignInPage />} />
                <Route path={routes.getEditProfileRoute.definition} element={<EditProfilePage />} />
                <Route path={routes.getAllIdeasRoute.definition} element={<AllIdeasPage />} />
                <Route path={routes.getViewIdeaRoute.definition} element={<ViewIdeaPage />} />
                <Route path={routes.getEditIdeaRoute.definition} element={<EditIdeaPage />} />
                <Route path={routes.getNewIdeaRoute.definition} element={<NewIdeaPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppContextProvider>
      </TrpcProvider>
    </HeadProvider>
  );
};

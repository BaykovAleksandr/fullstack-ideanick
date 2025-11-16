import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TrpcProvider } from './lib/trpc';
import { Layout } from './components/Layout';
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

export const App = () => {
  return (
    <TrpcProvider>
      <AppContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path={routes.getSignOutRoute()} element={<SignOutPage />} />
            <Route element={<Layout />}>
              <Route path={routes.getSignUpRoute()} element={<SignUpPage />} />
              <Route path={routes.getSignInRoute()} element={<SignInPage />} />
              <Route path={routes.getAllIdeasRoute()} element={<AllIdeasPage />} />
              <Route path={routes.getNewIdeaRoute()} element={<NewIdeaPage />} />
              <Route path={routes.getEditProfileRoute()} element={<EditProfilePage />} />
              <Route path={routes.getViewIdeaRoute(routes.viewIdeaRouteParams)} element={<ViewIdeaPage />} />
              <Route path={routes.getEditIdeaRoute(routes.editIdeaRouteParams)} element={<EditIdeaPage />} />
              <Route path="/error404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to={'/error404'} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </TrpcProvider>
  );
};

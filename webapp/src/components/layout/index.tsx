import { Link, Outlet } from 'react-router-dom';
import {
  getAllIdeasRoute,
  getEditProfileRoute,
  getNewIdeaRoute,
  getSignInRoute,
  getSignOutRoute,
  getSignUpRoute,
} from '../../lib/routes';
import { useMe } from '../../lib/ctx';
import css from './index.module.scss';
import { createRef } from 'react';
import Logo from '../../assets/images/logo.svg';

// eslint-disable-next-line react-refresh/only-export-components
export const layoutContentElRef = createRef<HTMLDivElement>();

export const Layout = () => {
  const me = useMe();
  const LogoComponent = Logo as unknown as React.FC<{ className?: string }>;
  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <LogoComponent className={css.logo} />
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getAllIdeasRoute()}>
              All Ideas
            </Link>
          </li>

          {me ? (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getNewIdeaRoute()}>
                  Add Idea
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getEditProfileRoute()}>
                  Edit Profile
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignOutRoute()}>
                  Log Out ({me.nick})
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getSignUpRoute()}>
                  Sign Up
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignInRoute()}>
                  Sign In
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={css.content} ref={layoutContentElRef}>
        <Outlet />
      </div>
    </div>
  );
};

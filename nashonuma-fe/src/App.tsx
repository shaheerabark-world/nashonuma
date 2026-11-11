import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AppView } from '@/components/layout/AppView.generated';
import { buildViewModel } from '@/app/buildViewModel';
import { makeSelf, setNavigator } from '@/app/pageKit';
import { useAppStore } from '@/app/state';
import { useIsMobile } from '@/app/useIsMobile';
import { getLang, subscribeLang } from '@/i18n/lang';
import { reportsStore } from '@/store';
import { NAV, isRole, type Role } from '@/data/mock/app';
import { apiEnabled, logout, session } from '@/api/http';
import { LoginPage } from '@/features/auth/LoginPage';

/** Keys reset when leaving a page (same as go() / role switch in the prototype). */
const RESET_ON_NAV = { open: null, sel: null, wrSel: null, instr: null, mbChild: null, mbRes: null, pr: null, mw: null, mnav: false };

/** Keeps app state in sync with the shared reports store (this tab and other tabs). */
function useLiveReports() {
  useEffect(() => {
    const apply = (s = reportsStore.snapshot()) =>
      useAppStore.setState({ liveP: s.reports, liveW: s.wellbeing, mbKids: s.children, sdqCfg: s.config.sdq ?? null });
    apply();
    return reportsStore.subscribe(apply);
  }, []);
}

function Screen({ role, page }: { role: Role; page: string }) {
  const navigate = useNavigate();
  const st = useAppStore();
  useSyncExternalStore(subscribeLang, getLang, getLang); // re-render on language change
  const isMobile = useIsMobile();

  const route = useRef({ role, page });
  route.current = { role, page };
  const self = useRef(makeSelf(() => route.current)).current;

  useEffect(() => {
    setNavigator((r, p) => navigate(`/${r}/${p ?? NAV[r as Role][0][0]}`));
  }, [navigate]);

  const v = buildViewModel({
    st, self, role, page, isMobile,
    go: p => {
      useAppStore.setState(RESET_ON_NAV);
      navigate(`/${role}/${p}`);
    },
    // With the API, a role is an account: switching role means signing in as someone else.
    switchRole: r => {
      useAppStore.setState({ ...RESET_ON_NAV, roleMenu: false });
      if (apiEnabled) {
        if (r !== role) logout();
        return;
      }
      navigate(`/${r}/${NAV[r][0][0]}`);
    }
  });

  const view = <AppView v={v} />;
  return isMobile ? <div className={'mob ' + v.mnavCls}>{view}</div> : view;
}

/** /:role/:page — unknown roles go to the supervisor overview, unknown pages to the role's first page. */
function RoleRoute() {
  const { role, page } = useParams();
  if (apiEnabled) {
    // Signed-in users only, and each user stays on their own role's pages.
    const user = session.user();
    if (!user || !session.token()) return <Navigate to="/login" replace />;
    if (role !== user.role) return <Navigate to={`/${user.role}/${NAV[user.role][0][0]}`} replace />;
  }
  if (!isRole(role)) return <Navigate to="/supervisor/overview" replace />;
  if (!page || !NAV[role].some(n => n[0] === page)) return <Navigate to={`/${role}/${NAV[role][0][0]}`} replace />;
  return <Screen role={role} page={page} />;
}

export default function App() {
  useLiveReports();
  return (
    <Routes>
      {apiEnabled ? <Route path="/login" element={<LoginPage />} /> : null}
      <Route path="/:role/:page?" element={<RoleRoute />} />
      <Route path="*" element={<Navigate to="/supervisor/overview" replace />} />
    </Routes>
  );
}

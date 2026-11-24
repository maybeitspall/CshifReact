import { Outlet, NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'

// SVG icons inline (sama dengan prototype)
function Icon({ id }: { id: string }) {
  return (
    <svg className="icon" aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  )
}

export default function AppShell() {
  return (
    <>
      {/* Skip link */}
      <a className="skip" href="#main">Lewati ke isi</a>

      {/* SVG sprite — sama dengan prototype */}
      <svg className="sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <symbol id="i-check"    viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
        <symbol id="i-circle"   viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></symbol>
        <symbol id="i-half"     viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /></symbol>
        <symbol id="i-flag"     viewBox="0 0 24 24"><path d="M6 21V4m0 1h11l-2 4 2 4H6" /></symbol>
        <symbol id="i-cross"    viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" /></symbol>
        <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17" /></symbol>
        <symbol id="i-chart"    viewBox="0 0 24 24"><path d="M4 19h16M6 16l4-5 4 3 4-7" /></symbol>
        <symbol id="i-pulse"    viewBox="0 0 24 24"><path d="M3 12h4l2.5-6 4 12 2.5-6h5" /></symbol>
        <symbol id="i-note"     viewBox="0 0 24 24"><path d="M6 3.5h9l4 4V20H6zM15 3.5V8h4M9 12h7M9 16h5" /></symbol>
        <symbol id="i-gear"     viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></symbol>
        <symbol id="i-plus"     viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
        <symbol id="i-prev"     viewBox="0 0 24 24"><path d="M14.5 5.5L8 12l6.5 6.5" /></symbol>
        <symbol id="i-next"     viewBox="0 0 24 24"><path d="M9.5 5.5L16 12l-6.5 6.5" /></symbol>
      </svg>

      <div className="app-shell">
        <header className="topbar">
          <Link className="wordmark" to="/hari-ini" aria-label="Timeblocking SHF-C, ke hari ini">
            Timeblocking SHF-C
          </Link>
          <div className="topbar__right">
            <NavLink className="icon-btn" to="/pengaturan" aria-label="Buka pengaturan">
              <Icon id="i-gear" />
            </NavLink>
          </div>
        </header>

        <main id="main">
          <Outlet />
        </main>

        <nav className="tabs" aria-label="Navigasi utama">
          <NavLink to="/hari-ini"   aria-label="Hari Ini">
            <Icon id="i-check" /><span>Hari Ini</span>
          </NavLink>
          <NavLink to="/kalender"   aria-label="Kalender">
            <Icon id="i-calendar" /><span>Kalender</span>
          </NavLink>
          <NavLink to="/dashboard"  aria-label="Dashboard">
            <Icon id="i-chart" /><span>Dashboard</span>
          </NavLink>
          <NavLink to="/analisis"   aria-label="Analisis">
            <Icon id="i-pulse" /><span>Analisis</span>
          </NavLink>
          <NavLink to="/sintesis"   aria-label="Sintesis">
            <Icon id="i-note" /><span>Sintesis</span>
          </NavLink>
        </nav>
      </div>
    </>
  )
}

import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/doctors', label: 'Doctors', icon: '🩺' },
    { to: '/appointments', label: 'Appointments', icon: '📅' },
];

export default function Layout() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="app-shell">
            <header className="mobile-header">
                <div className="brand">
                    <span className="brand-icon">🦷</span>
                    <span className="brand-name">BrightSmile Clinic</span>
                </div>
                <button
                    type="button"
                    className="menu-toggle"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </header>

            <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-brand">
                    <span className="brand-icon">🦷</span>
                    <div>
                        <h1>BrightSmile</h1>
                        <p>Clinic Management</p>
                    </div>
                </div>

                <nav className="sidebar-nav" aria-label="Main navigation">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'nav-link-active' : ''}`
                            }
                        >
                            <span aria-hidden="true">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
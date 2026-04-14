import { useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
	LayoutDashboard,
	ArrowLeftRight,
	Tag,
	PiggyBank,
	User,
	LogOut,
	X,
	Wallet,
	Menu,
	Bell
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
	{ to: '/dashboard', label: 'Dashboard', mobileLabel: 'Inicio', icon: LayoutDashboard },
	{ to: '/transacciones', label: 'Transacciones', mobileLabel: 'Movs', icon: ArrowLeftRight },
	{ to: '/categorias', label: 'Categorias', mobileLabel: 'Categorias', icon: Tag },
	{ to: '/presupuestos', label: 'Presupuestos', mobileLabel: 'Presupuesto', icon: PiggyBank },
	{ to: '/perfil', label: 'Mi Perfil', mobileLabel: 'Perfil', icon: User }
]

function obtenerSaludo() {
	const h = new Date().getHours()
	if (h < 12) return 'Buenos dias'
	if (h < 18) return 'Buenas tardes'
	return 'Buenas noches'
}

function fechaActualFormateada() {
	return new Intl.DateTimeFormat('es-CO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(new Date())
}

export default function Layout({ children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()
	const { cerrarSesion, usuario } = useAuth()

	const saludo = useMemo(() => obtenerSaludo(), [])
	const fecha = useMemo(() => fechaActualFormateada(), [])

	const userName = useMemo(() => {
		const nombreMetadata = usuario?.user_metadata?.nombre || usuario?.user_metadata?.full_name
		if (nombreMetadata && String(nombreMetadata).trim()) return String(nombreMetadata).trim()
		if (usuario?.email) return usuario.email.split('@')[0]
		return 'Estudiante'
	}, [usuario])

	const handleLogout = async () => {
		try {
			await cerrarSesion()
		} finally {
			navigate('/login', { replace: true })
		}
	}

	const usaAnchoCompleto =
		location.pathname.startsWith('/categorias') ||
		location.pathname.startsWith('/perfil') ||
		location.pathname.startsWith('/presupuestos')

	return (
		<div className="min-h-screen bg-[#f8f9fa] font-body text-[#191c1d]">
			{sidebarOpen && (
				<button
					type="button"
					aria-label="Cerrar menu"
					className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				className={[
					'fixed top-0 left-0 h-full w-[280px] bg-white/95 backdrop-blur-xl border-r border-[#c5c5d4]/20 z-50 flex flex-col',
					'transition-transform duration-300 ease-out lg:translate-x-0',
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				].join(' ')}
			>
				<div className="flex items-center justify-between p-5 border-b border-[#c5c5d4]/20">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl editorial-gradient shadow-lg shadow-[#24389c]/20">
							<Wallet className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-lg font-bold font-headline text-[#24389c] tracking-tight">FinanzasU</h1>
							<p className="text-[10px] text-[#757684] tracking-wider uppercase">Tu dinero, tu control</p>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setSidebarOpen(false)}
						className="lg:hidden p-1.5 rounded-lg hover:bg-[#edeeef] text-[#757684] transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<nav className="flex-1 p-3 space-y-1 overflow-y-auto">
					{NAV_ITEMS.map(({ to, label, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							onClick={() => setSidebarOpen(false)}
							className={({ isActive }) => [
								'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
								isActive
									? 'editorial-gradient text-white shadow-lg shadow-[#24389c]/20'
									: 'text-[#454652] hover:bg-[#edeeef] hover:text-[#191c1d]'
							].join(' ')}
						>
							<Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
							{label}
						</NavLink>
					))}
				</nav>

				<div className="p-3 border-t border-[#c5c5d4]/20">
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6] transition-all duration-200"
					>
						<LogOut className="w-5 h-5" />
						Cerrar sesion
					</button>
				</div>
			</aside>

			<div className="lg:ml-[280px] min-h-screen flex flex-col">
				<header className="sticky top-0 z-30 glass-panel border-b border-[#c5c5d4]/20">
					<div className="flex items-center justify-between px-4 lg:px-8 py-4">
						<div className="flex items-center gap-4">
							<button
								type="button"
								onClick={() => setSidebarOpen(true)}
								className="lg:hidden p-2 rounded-xl hover:bg-[#edeeef] text-[#454652] transition-colors"
							>
								<Menu className="w-5 h-5" />
							</button>

							<div>
								<h2 className="text-lg font-semibold font-headline text-[#191c1d]">
									{saludo}, <span className="text-[#24389c]">{userName}</span>
								</h2>
								<p className="text-xs text-[#757684] capitalize">{fecha}</p>
							</div>
						</div>

						<button type="button" className="p-2 rounded-xl hover:bg-[#edeeef] text-[#454652] transition-colors relative">
							<Bell className="w-5 h-5" />
							<span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
						</button>
					</div>
				</header>

				<main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-6 animate-fade-in">
					<div className={usaAnchoCompleto ? 'w-full' : 'mx-auto w-full max-w-7xl'}>{children}</div>
				</main>
			</div>

			<nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-panel border-t border-[#c5c5d4]/20">
				<div className="flex items-center justify-around py-2 px-1">
					{NAV_ITEMS.map(({ to, mobileLabel, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) => [
								'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-all duration-200',
								isActive ? 'text-[#24389c]' : 'text-[#757684] hover:text-[#454652]'
							].join(' ')}
						>
							{({ isActive }) => (
								<>
									<div className={[
										'p-1 rounded-lg transition-colors',
										isActive ? 'bg-[#dee0ff]' : ''
									].join(' ')}>
										<Icon className="w-5 h-5" />
									</div>
									<span className="text-[10px] font-medium">{mobileLabel}</span>
								</>
							)}
						</NavLink>
					))}
				</div>
			</nav>
		</div>
	)
}

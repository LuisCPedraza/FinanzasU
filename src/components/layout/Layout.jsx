import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
	ChevronsLeftRight,
	CircleUserRound,
	House,
	LogOut,
	Menu,
	ReceiptText,
	Sparkles,
	Wallet
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const sidebarLinks = [
	{
		to: '/dashboard',
		label: 'Inicio',
		Icon: House
	},
	{
		to: '/perfil',
		label: 'Perfil',
		Icon: CircleUserRound
	},
	{
		to: '/transacciones',
		label: 'Nueva transaccion',
		Icon: ReceiptText
	},
	{
		to: '/presupuestos',
		label: 'Presupuestos',
		Icon: Sparkles
	}
]

function SidebarLink({ to, label, icon, compact, onClick }) {
	const Icon = icon

	return (
		<NavLink to={to} onClick={onClick}>
			{({ isActive }) => (
				<div
					className={[
						'group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300',
						isActive
							? 'bg-[#24389c] text-white shadow-lg shadow-[#24389c]/30'
							: 'text-[#454652] hover:bg-white hover:text-[#24389c] hover:shadow-md'
					].join(' ')}
				>
					<Icon className={[
						'h-5 w-5 shrink-0 transition-transform duration-300',
						isActive ? 'scale-110' : 'group-hover:scale-110'
					].join(' ')} />
					<span
						className={[
							'text-sm font-semibold whitespace-nowrap transition-all duration-300',
							compact ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
						].join(' ')}
					>
						{label}
					</span>
					{isActive && !compact && (
						<span className="absolute right-3 h-2 w-2 rounded-full bg-[#83fba5] animate-pulse" />
					)}
				</div>
			)}
		</NavLink>
	)
}

function SidebarContent({ compact, onNavigate, onLogout }) {
	return (
		<>
			<div className="relative overflow-hidden rounded-2xl border border-[#d9dcec] bg-[linear-gradient(160deg,#ffffff_0%,#f5f7ff_100%)] p-4 text-[#1f2f86] shadow-sm">
				<div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_1px_1px,rgba(36,56,156,0.14)_1px,transparent_0)] bg-size-[10px_10px]" />

				<div className="relative z-10 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#cfd5ea] bg-[#e9edff]">
						<Wallet className="h-5 w-5" />
					</div>
					{!compact && (
						<div>
							<p className="font-headline text-lg font-extrabold tracking-tight">FinanzasU</p>
							<p className="text-xs text-[#61657a]">Panel personal</p>
						</div>
					)}
				</div>
			</div>

			<div className="mt-6 flex flex-col gap-2">
				{sidebarLinks.map(({ to, label, Icon }) => (
					<SidebarLink
						key={to}
						to={to}
						label={label}
						icon={Icon}
						compact={compact}
						onClick={onNavigate}
					/>
				))}
			</div>

			<div className="mt-auto space-y-3">
				<button
					type="button"
					onClick={onLogout}
					className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ffd3cf] bg-[#fff6f5] px-3 py-2.5 text-sm font-semibold text-[#a33a30] transition-all duration-200 hover:bg-[#ffe8e5]"
				>
					<LogOut className="h-4 w-4" />
					{!compact && 'Cerrar sesion'}
				</button>
			</div>
		</>
	)
}

export default function Layout({ children }) {
	const [compact, setCompact] = useState(false)
	const [mobileOpen, setMobileOpen] = useState(false)
	const navigate = useNavigate()
	const { cerrarSesion } = useAuth()

	const handleLogout = async () => {
		await cerrarSesion()
		navigate('/login', { replace: true })
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#f8f9fa] text-[#191c1d]">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#e9ecfb] blur-[110px]" />
				<div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#e3f4eb]/60 blur-[110px]" />
			</div>

			<div className="relative z-10 flex min-h-screen">
				<aside
					className={[
						'hidden relative min-h-screen border-r border-[#d9dcec]/80 bg-white/78 px-4 py-5 backdrop-blur-xl md:flex md:flex-col',
						'transition-all duration-300',
						compact ? 'md:w-24' : 'md:w-72'
					].join(' ')}
				>
					<SidebarContent
						compact={compact}
						onNavigate={() => {}}
						onLogout={handleLogout}
					/>

					<button
						type="button"
						onClick={() => setCompact((value) => !value)}
						aria-label={compact ? 'Expandir sidebar' : 'Contraer sidebar'}
						className="absolute -right-2.5 top-1/2 hidden h-16 w-6 -translate-y-1/2 items-center justify-center overflow-hidden rounded-r-xl border border-l-0 border-[#d2d7e8] bg-[#f7f9ff] text-[#4d5aa8] shadow-sm transition-all duration-200 hover:w-7 hover:bg-white md:flex"
					>
						<span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(77,90,168,0.08)_0px,rgba(77,90,168,0.08)_1px,transparent_1px,transparent_5px)]" />
						<span className="pointer-events-none absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-l border-t border-[#d2d7e8] bg-[#f7f9ff]" />
						<ChevronsLeftRight className={[
							'relative z-10 h-3.5 w-3.5 transition-transform duration-200',
							compact ? 'rotate-180' : 'rotate-0'
						].join(' ')} />
					</button>
				</aside>

				<div
					className={[
						'fixed inset-0 z-40 md:hidden transition-all duration-300',
						mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
					].join(' ')}
				>
					<button
						type="button"
						aria-label="Cerrar sidebar"
						onClick={() => setMobileOpen(false)}
						className="absolute inset-0 bg-[#191c1d]/35 backdrop-blur-sm"
					/>

					<aside
						className={[
							'absolute left-0 top-0 h-full w-72 border-r border-[#d9dcec]/80 bg-white/92 p-4 backdrop-blur-xl',
							'transition-transform duration-300',
							mobileOpen ? 'translate-x-0' : '-translate-x-full'
						].join(' ')}
					>
						<SidebarContent
							compact={false}
							onNavigate={() => setMobileOpen(false)}
							onLogout={handleLogout}
						/>
					</aside>
				</div>

				<main className="flex-1 p-4 pb-8 md:p-8">
					<div className="mb-5 flex items-center justify-between rounded-2xl border border-[#c5c5d4]/30 bg-white/70 px-4 py-3 backdrop-blur md:hidden">
						<div className="flex items-center gap-2 text-sm font-semibold text-[#24389c]">
							<Sparkles className="h-4 w-4" />
							Navegacion
						</div>
						<button
							type="button"
							onClick={() => setMobileOpen(true)}
							className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#24389c] text-white shadow-md shadow-[#24389c]/25"
							aria-label="Abrir sidebar"
						>
							<Menu className="h-5 w-5" />
						</button>
					</div>

					<div className="mx-auto h-full w-full max-w-6xl animate-[fadeIn_.35s_ease-out]">
						{children}
					</div>
				</main>
			</div>
		</div>
	)
}

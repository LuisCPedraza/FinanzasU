import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
	User,
	Mail,
	Lock,
	Shield,
	School,
	BellRing,
	Star,
	Trash2,
	Eye,
	EyeOff
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import useLogros from '../hooks/useLogros'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import { EMAIL_REGEX, PASSWORD_MIN_LENGTH } from '../utils/constants'

function ActionButton({
	children,
	variant = 'primary',
	loading = false,
	className = '',
	...props
}) {
	const styles = {
		primary: 'bg-gradient-to-br from-[#24389c] to-[#3f51b5] text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90',
		danger: 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20 hover:bg-[#ba1a1a] hover:text-white',
		ghost: 'bg-transparent border border-[#c5c5d4]/30 text-[#454652] hover:bg-[#edeeef]'
	}

	return (
		<button
			{...props}
			disabled={props.disabled || loading}
			className={[
				'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
				'disabled:opacity-60 disabled:cursor-not-allowed',
				styles[variant],
				className
			].join(' ')}
		>
			{loading ? 'Procesando...' : children}
		</button>
	)
}

function TextInput({
	label,
	icon: Icon,
	error,
	type = 'text',
	className = '',
	id,
	...props
}) {
	const [showPwd, setShowPwd] = useState(false)
	const isPwd = type === 'password'
	const currentType = isPwd ? (showPwd ? 'text' : 'password') : type

	return (
		<div className={['space-y-2', className].join(' ')}>
			{label && <label htmlFor={id} className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] px-1">{label}</label>}
			<div className="relative group">
				{Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757684] group-focus-within:text-[#24389c] transition-colors pointer-events-none" />}
				<input
					id={id}
					type={currentType}
					className={[
						'w-full rounded-xl border bg-white text-[#191c1d] placeholder:text-[#757684]/50',
						'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all duration-200',
						Icon ? 'pl-12' : 'pl-4',
						isPwd ? 'pr-12' : 'pr-4',
						'py-3.5 text-sm',
						error ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
					].join(' ')}
					{...props}
				/>
				{isPwd && (
					<button
						type="button"
						onClick={() => setShowPwd((v) => !v)}
						className="absolute right-4 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#191c1d]"
						tabIndex={-1}
					>
						{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
					</button>
				)}
			</div>
			{error && <p className="text-xs text-[#ba1a1a] ml-1">{error}</p>}
		</div>
	)
}

function Toggle({ enabled, onToggle }) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={[
				'w-10 h-6 rounded-full relative flex-shrink-0 transition-colors',
				enabled ? 'bg-[#006d36]' : 'bg-[#c5c5d4]'
			].join(' ')}
		>
			<span className={['absolute top-1 w-4 h-4 bg-white rounded-full transition-all', enabled ? 'right-1' : 'left-1'].join(' ')} />
		</button>
	)
}

const ETIQUETAS_TIPO_LOGRO = {
	contador: 'Contador',
	umbral: 'Umbral',
	racha: 'Racha',
	porcentaje: 'Porcentaje',
	hito: 'Hito'
}

const ETIQUETAS_CATEGORIA_LOGRO = {
	gasto: 'Gasto',
	ahorro: 'Ahorro',
	presupuesto: 'Presupuesto',
	disciplina: 'Disciplina',
	maestria: 'Maestria',
	especial: 'Especial'
}

function construirLogroConEstado(logro, progresoItem) {
	const meta = Number(logro?.meta || 0)
	const avance = Number(progresoItem?.avance_actual || 0)
	const desbloqueado = progresoItem?.desbloqueado === true || (meta > 0 && avance >= meta)
	const porcentajeCalculado = meta > 0 ? (avance / meta) * 100 : 0
	const porcentajeBase = Number(progresoItem?.porcentaje ?? porcentajeCalculado)
	const porcentaje = Number.isFinite(porcentajeBase)
		? Math.max(0, Math.min(100, Math.round(porcentajeBase * 10) / 10))
		: 0

	let estado = 'bloqueado'
	if (desbloqueado) estado = 'desbloqueado'
	else if (avance > 0) estado = 'en-progreso'

	return {
		...logro,
		meta,
		avance,
		icono: logro?.icono || '🏅',
		desbloqueado,
		estado,
		estadoLabel:
			estado === 'desbloqueado'
				? 'Desbloqueado'
				: estado === 'en-progreso'
					? 'En progreso'
					: 'Bloqueado',
		porcentaje: desbloqueado ? 100 : porcentaje,
		tipoLabel: ETIQUETAS_TIPO_LOGRO[logro?.tipo] || 'Hito',
		categoriaLabel: ETIQUETAS_CATEGORIA_LOGRO[logro?.categoria] || 'General'
	}
}

export default function Perfil() {
	const { usuario, actualizarPerfil, cambiarContrasena } = useAuth()
	const { catalogoLogros, progreso, estadisticas, cargandoLogros, errorLogros, cargarLogros } = useLogros()

	const userName = usuario?.user_metadata?.nombre || 'Nombre Usuario'
	const userEmail = usuario?.email || 'usuario@universidad.edu'

	const [nombre, setNombre] = useState(userName)
	const [email, setEmail] = useState(userEmail)
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [profileLoading, setProfileLoading] = useState(false)
	const [passwordLoading, setPasswordLoading] = useState(false)
	const [profileError, setProfileError] = useState('')
	const [passwordError, setPasswordError] = useState('')

	const { preferencias, cargandoPreferencias, errorPreferencias, actualizarPreferencia } = useNotificationsContext()
	const handleTogglePreferencia = async (campo) => {
		const valorActual = preferencias[campo]
		const { ok, mensaje } = await actualizarPreferencia(campo, !valorActual)
		if (ok) {
			toast.success('Preferencia guardada.')
		} else {
			toast.error(mensaje || 'No se pudo guardar la preferencia.')
		}
	}
	
	const [modalLogrosAbierto, setModalLogrosAbierto] = useState(false)

	const [errors, setErrors] = useState({})
	const primeraCargaLogrosRef = useRef(true)
	const desbloqueadosPreviosRef = useRef(new Set())

	const logrosConEstado = useMemo(() => {
		const progresoPorLogro = new Map(progreso.map((item) => [item.logro_id, item]))

		return [...catalogoLogros]
			.sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
			.map((logro) => construirLogroConEstado(logro, progresoPorLogro.get(logro.id)))
	}, [catalogoLogros, progreso])

	const logrosDestacados = useMemo(() => {
		const prioridadEstado = {
			desbloqueado: 0,
			'en-progreso': 1,
			bloqueado: 2
		}

		return [...logrosConEstado]
			.sort((a, b) => {
				const prioridadA = prioridadEstado[a.estado] ?? 3
				const prioridadB = prioridadEstado[b.estado] ?? 3
				if (prioridadA !== prioridadB) return prioridadA - prioridadB
				return Number(a.orden || 0) - Number(b.orden || 0)
			})
			.slice(0, 4)
	}, [logrosConEstado])

	useEffect(() => {
		primeraCargaLogrosRef.current = true
		desbloqueadosPreviosRef.current = new Set()
	}, [usuario?.id])

	useEffect(() => {
		setNombre(userName)
		setEmail(userEmail)
	}, [userName, userEmail])

	useEffect(() => {
		if (cargandoLogros) return

		const desbloqueadosActuales = new Set(
			logrosConEstado
				.filter((logro) => logro.desbloqueado)
				.map((logro) => logro.id)
		)

		if (primeraCargaLogrosRef.current) {
			desbloqueadosPreviosRef.current = desbloqueadosActuales
			primeraCargaLogrosRef.current = false
			return
		}

		const nuevosLogrosIds = [...desbloqueadosActuales].filter(
			(id) => !desbloqueadosPreviosRef.current.has(id)
		)

		if (nuevosLogrosIds.length === 1) {
			const logroNuevo = logrosConEstado.find((logro) => logro.id === nuevosLogrosIds[0])
			if (logroNuevo) {
				toast.success(`Logro desbloqueado: ${logroNuevo.icono} ${logroNuevo.nombre}`)
			}
		} else if (nuevosLogrosIds.length > 1) {
			toast.success(`Logros desbloqueados: ${nuevosLogrosIds.length}`)
		}

		desbloqueadosPreviosRef.current = desbloqueadosActuales
	}, [cargandoLogros, logrosConEstado])

	const handleSaveProfile = async (e) => {
		e.preventDefault()
		setProfileError('')

		const nextErrors = {}
		if (!nombre.trim()) nextErrors.nombre = 'El nombre no puede estar vacio'
		if (!email.trim()) nextErrors.email = 'El correo es obligatorio'
		else if (!EMAIL_REGEX.test(email.trim())) nextErrors.email = 'Correo no valido'

		setErrors((p) => ({ ...p, ...nextErrors }))
		if (Object.keys(nextErrors).length) return

		try {
			setProfileLoading(true)
			const resultado = await actualizarPerfil({
				nombre: nombre.trim(),
				email: email.trim().toLowerCase()
			})

			if (resultado?.emailPendienteConfirmacion) {
				toast.success('Perfil actualizado. Revisa tu nuevo correo para confirmar el cambio de email.')
			} else {
				toast.success('Perfil actualizado correctamente.')
			}
		} catch (err) {
			const msg = err?.message || 'No fue posible actualizar el perfil.'
			setProfileError(msg)
			toast.error(msg)
		} finally {
			setProfileLoading(false)
		}
	}

	const handlePassword = async (e) => {
		e.preventDefault()
		setPasswordError('')

		const nextErrors = {}
		if (!newPassword) {
			nextErrors.newPassword = 'La nueva contrasena es obligatoria'
		} else if (newPassword.length < PASSWORD_MIN_LENGTH) {
			nextErrors.newPassword = `Minimo ${PASSWORD_MIN_LENGTH} caracteres`
		}

		if (!confirmPassword) {
			nextErrors.confirmPassword = 'Confirma la nueva contrasena'
		} else if (newPassword !== confirmPassword) {
			nextErrors.confirmPassword = 'Las contrasenas no coinciden'
		}

		setErrors((p) => ({ ...p, ...nextErrors }))
		if (Object.keys(nextErrors).length) return

		try {
			setPasswordLoading(true)
			await cambiarContrasena({ newPassword })
			setNewPassword('')
			setConfirmPassword('')
			toast.success('Contrasena actualizada correctamente.')
		} catch (err) {
			const msg = err?.message || 'No fue posible cambiar la contrasena.'
			setPasswordError(msg)
			toast.error(msg)
		} finally {
			setPasswordLoading(false)
		}
	}

	const handleDeleteAccount = () => {
		toast('Accion no disponible por el momento.')
	}

	return (
		<div className="space-y-10 animate-[fadeIn_.35s_ease-out] pb-14 bg-[#f8f9fa] min-h-screen text-[#191c1d]">
			<header className="relative p-6 md:p-8 pb-14 md:pb-16 bg-white overflow-hidden rounded-3xl border border-[#c5c5d4]/20">
				<div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
					<div className="w-full h-full bg-[#24389c] rounded-full blur-[120px] -mr-32 -mt-32" />
				</div>

				<div className="w-full flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 relative z-10 text-center md:text-left">
					<div className="relative group">
						<div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-2xl border-4 border-white md:rotate-3 md:group-hover:rotate-0 transition-transform duration-500 bg-gradient-to-br from-[#24389c] to-[#3f51b5] flex items-center justify-center">
							<span className="text-white text-5xl md:text-6xl font-black">{userName.charAt(0).toUpperCase()}</span>
						</div>
						<div className="absolute -bottom-2 right-1/2 translate-x-1/2 md:translate-x-0 md:-right-2 bg-[#006d36] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter shadow-lg flex items-center gap-1">
							<Star className="w-3.5 h-3.5" /> PREMIUM
						</div>
					</div>

					<div className="flex-1">
						<h1 className="font-black text-4xl md:text-6xl text-[#24389c] tracking-tighter mb-2">{userName}</h1>
						<div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
							<span className="text-[#454652] font-medium flex items-center gap-1 text-sm md:text-base">
								<School className="w-4 h-4" /> Estudiante Universitario
							</span>
							<span className="w-1.5 h-1.5 rounded-full bg-[#c5c5d4] hidden md:block" />
							<span className="text-[#454652] font-medium text-sm md:text-base">FinanzasU</span>
						</div>
					</div>
				</div>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
				<section className="lg:col-span-8 space-y-8">
					<div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-black/5">
						<h3 className="font-bold text-lg md:text-xl flex items-center gap-2 mb-8">
							<User className="w-5 h-5 text-[#24389c]" /> Identidad personal
						</h3>

						<form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<TextInput
								className="sm:col-span-2"
								id="perfil-nombre"
								label="Nombre completo"
								icon={User}
								value={nombre}
								error={errors.nombre}
								onChange={(e) => {
									setNombre(e.target.value)
									setErrors((p) => ({ ...p, nombre: '' }))
								}}
							/>
							<TextInput
								className="sm:col-span-2"
								id="perfil-email"
								label="Correo universitario"
								icon={Mail}
								type="email"
								value={email}
								error={errors.email}
								onChange={(e) => {
									setEmail(e.target.value)
									setErrors((p) => ({ ...p, email: '' }))
								}}
							/>
							{profileError && (
								<p className="sm:col-span-2 text-sm text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">
									{profileError}
								</p>
							)}
							<div className="sm:col-span-2">
								<ActionButton type="submit" loading={profileLoading}>Guardar datos personales</ActionButton>
							</div>
						</form>
					</div>

					<div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-black/5">
						<h3 className="font-bold text-lg md:text-xl mb-8 flex items-center gap-2">
							<School className="w-5 h-5 text-[#24389c]" /> Contexto academico
						</h3>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
							<div className="bg-[#dee0ff]/40 p-6 rounded-3xl border border-[#bac3ff]/40 min-h-[120px]">
								<span className="text-[10px] font-bold text-[#24389c]/70 uppercase tracking-widest">Semestre actual</span>
								<p className="text-2xl font-black text-[#24389c] mt-3">Intermedio</p>
							</div>
							<div className="bg-[#83fba5]/30 p-6 rounded-3xl border border-[#006d36]/20 min-h-[120px]">
								<span className="text-[10px] font-bold text-[#006d36]/70 uppercase tracking-widest">Meta de grado</span>
								<p className="text-2xl font-black text-[#006d36] mt-3">2027</p>
							</div>
							<div className="bg-[#f3f4f5] p-6 rounded-3xl border border-[#c5c5d4]/20 min-h-[120px]">
								<span className="text-[10px] font-bold text-[#757684] uppercase tracking-widest">Estado academico</span>
								<p className="text-2xl font-black text-[#191c1d] mt-3">Activo</p>
							</div>
						</div>
					</div>

					<div className="bg-[#f3f4f5] p-6 md:p-8 rounded-[2rem]">
						<h3 className="font-bold text-lg md:text-xl mb-8 flex items-center gap-2 text-[#24389c]">
							<Shield className="w-5 h-5" /> Seguridad y control
						</h3>

						<form onSubmit={handlePassword} className="space-y-5">
							<TextInput
								id="perfil-new-pwd"
								label="Nueva clave"
								type="password"
								icon={Lock}
								placeholder="Minimo 6 caracteres"
								value={newPassword}
								error={errors.newPassword}
								onChange={(e) => {
									setNewPassword(e.target.value)
									setErrors((p) => ({ ...p, newPassword: '' }))
								}}
							/>
							<TextInput
								id="perfil-confirm-pwd"
								label="Confirmar clave"
								type="password"
								icon={Lock}
								placeholder="Repite tu nueva clave"
								value={confirmPassword}
								error={errors.confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value)
									setErrors((p) => ({ ...p, confirmPassword: '' }))
								}}
							/>

							{passwordError && (
								<p className="text-sm text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">
									{passwordError}
								</p>
							)}

							<div className="flex flex-col md:flex-row md:items-center gap-4 pt-2">
								<ActionButton type="submit" variant="danger" loading={passwordLoading}>Cambiar clave</ActionButton>
								<ActionButton type="button" variant="ghost" onClick={handleDeleteAccount}>
									<Trash2 className="w-4 h-4" /> Cerrar cuenta
								</ActionButton>
							</div>
						</form>
					</div>
				</section>

				<aside className="lg:col-span-4 space-y-8">
					<div className="bg-[#24389c] text-white p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-[#24389c]/20">
						<div className="flex items-start justify-between gap-3 mb-6">
							<h3 className="font-bold text-lg md:text-xl">Insignias de logro</h3>
							{!cargandoLogros && !errorLogros && (
								<span className="text-[10px] font-semibold bg-white/20 px-2 py-1 rounded-full whitespace-nowrap">
									{estadisticas.desbloqueados}/{estadisticas.totalLogros} desbloqueados
								</span>
							)}
						</div>

						{cargandoLogros ? (
							<div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-center space-y-3">
								<Spinner size="md" className="text-white" />
								<p className="text-sm text-white/90">Cargando tus insignias...</p>
							</div>
						) : errorLogros ? (
							<div className="rounded-2xl bg-[#ffdad6]/95 border border-[#ba1a1a]/30 p-4 text-[#410001] space-y-3">
								<p className="text-sm font-semibold">No se pudieron cargar los logros.</p>
								<p className="text-xs opacity-90">{errorLogros}</p>
								<button
									type="button"
									onClick={cargarLogros}
									className="w-full py-2 rounded-lg text-xs font-bold bg-[#ba1a1a] text-white hover:opacity-90 transition-opacity"
								>
									Reintentar carga
								</button>
							</div>
						) : logrosConEstado.length === 0 ? (
							<div className="rounded-2xl bg-white/10 border border-white/20 p-5 text-center">
								<p className="text-sm text-white/90">Aun no hay logros disponibles.</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									{logrosDestacados.map((logro) => (
										<div
											key={logro.id}
											className={[
												'p-4 rounded-2xl flex flex-col items-center text-center gap-2 border transition-all',
												logro.estado === 'desbloqueado'
													? 'bg-[#83fba5]/20 border-[#83fba5]/50'
													: logro.estado === 'en-progreso'
														? 'bg-white/15 border-white/35'
														: 'bg-white/10 border-white/20 opacity-70'
											].join(' ')}
										>
											<span className="text-2xl leading-none" role="img" aria-label={logro.nombre}>{logro.icono}</span>
											<span className="text-[10px] font-bold uppercase leading-tight">{logro.nombre}</span>
											<span className="text-[10px] font-semibold text-white/90">{logro.estadoLabel}</span>
											{!logro.desbloqueado && (
												<>
													<div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
														<div
															className={[
																'h-full rounded-full transition-all duration-500',
																logro.estado === 'en-progreso' ? 'bg-[#83fba5]' : 'bg-white/50'
															].join(' ')}
															style={{ width: `${Math.min(logro.porcentaje, 100)}%` }}
														/>
													</div>
													<span className="text-[10px] text-white/80">{logro.avance}/{logro.meta}</span>
												</>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						<button
							type="button"
							onClick={() => setModalLogrosAbierto(true)}
							className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors"
						>
							Ver todos los logros
						</button>
					</div>
					<div className="bg-[#f3f4f5] p-6 md:p-8 rounded-[2rem]">
  <h3 className="font-bold text-lg md:text-xl mb-6 flex items-center gap-2">
    <BellRing className="w-5 h-5 text-[#24389c]" /> Reglas de notificacion
  </h3>

  {cargandoPreferencias ? (
    <div className="flex items-center gap-3 py-4">
      <Spinner size="sm" className="text-[#24389c]" />
      <p className="text-sm text-[#454652]">Cargando preferencias...</p>
    </div>
  ) : errorPreferencias ? (
    <div className="rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 p-4">
      <p className="text-sm text-[#93000a] font-semibold">No se pudieron cargar las preferencias.</p>
      <p className="text-xs text-[#410001] mt-1">{errorPreferencias}</p>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-sm font-bold truncate">Alertas diarias de presupuesto</p>
          <p className="text-[10px] text-[#454652]">Seguimiento instantaneo de gasto</p>
        </div>
        <Toggle
          enabled={preferencias.alertas_diarias}
          onToggle={() => handleTogglePreferencia('alertas_diarias')}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-sm font-bold truncate">Resumen semanal</p>
          <p className="text-[10px] text-[#454652]">Lunes en la manana</p>
        </div>
        <Toggle
          enabled={preferencias.resumen_semanal}
          onToggle={() => handleTogglePreferencia('resumen_semanal')}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-sm font-bold truncate">Novedades del sistema</p>
          <p className="text-[10px] text-[#454652]">Actualizaciones importantes</p>
        </div>
        <Toggle
          enabled={preferencias.novedades_sistema}
          onToggle={() => handleTogglePreferencia('novedades_sistema')}
        />
      </div>
    </div>
  )}
</div>					
					
</aside>
			</div>

			<Modal
				isOpen={modalLogrosAbierto}
				onClose={() => setModalLogrosAbierto(false)}
				title="Todos tus logros"
				size="lg"
				footer={(
					<ActionButton type="button" variant="ghost" onClick={() => setModalLogrosAbierto(false)}>
						Cerrar
					</ActionButton>
				)}
			>
				{cargandoLogros ? (
					<div className="py-4 text-center space-y-3">
						<Spinner size="md" className="text-[#24389c]" />
						<p className="text-sm text-[#454652]">Cargando listado de logros...</p>
					</div>
				) : errorLogros ? (
					<div className="rounded-xl border border-[#ba1a1a]/20 bg-[#ffdad6] p-4 space-y-3">
						<p className="text-sm font-semibold text-[#93000a]">Hubo un problema al cargar los logros.</p>
						<p className="text-xs text-[#410001]">{errorLogros}</p>
						<ActionButton type="button" variant="danger" onClick={cargarLogros}>Reintentar</ActionButton>
					</div>
				) : logrosConEstado.length === 0 ? (
					<div className="rounded-xl border border-[#c5c5d4]/30 bg-[#f8f9fa] p-4 text-sm text-[#454652]">
						No hay logros configurados en este momento.
					</div>
				) : (
					<div className="space-y-4">
						<div className="rounded-2xl bg-[#f3f4f5] p-4 border border-[#c5c5d4]/20">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-xs uppercase tracking-wider font-bold text-[#757684]">Progreso general</p>
									<p className="text-lg font-black text-[#24389c]">{estadisticas.desbloqueados} de {estadisticas.totalLogros} logros</p>
								</div>
								<p className="text-sm font-bold text-[#006d36]">{estadisticas.porcentajeGeneral}%</p>
							</div>
							<div className="mt-3 h-2 rounded-full bg-white overflow-hidden">
								<div
									className="h-full rounded-full bg-gradient-to-r from-[#24389c] to-[#83fba5] transition-all duration-500"
									style={{ width: `${Math.min(100, Number(estadisticas.porcentajeGeneral || 0))}%` }}
								/>
							</div>
						</div>

						<div className="max-h-[52vh] overflow-y-auto pr-1 space-y-3">
							{logrosConEstado.map((logro) => (
								<div
									key={logro.id}
									className={[
										'rounded-xl border p-4',
										logro.estado === 'desbloqueado'
											? 'bg-[#ecfff2] border-[#006d36]/20'
											: logro.estado === 'en-progreso'
												? 'bg-[#f5f6ff] border-[#24389c]/20'
												: 'bg-[#f8f9fa] border-[#c5c5d4]/30'
									].join(' ')}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex items-start gap-3 min-w-0">
											<span className="text-2xl leading-none pt-0.5" role="img" aria-label={logro.nombre}>{logro.icono}</span>
											<div className="min-w-0">
												<p className="text-sm font-bold text-[#191c1d]">{logro.nombre}</p>
												<p className="text-xs text-[#454652] mt-1">{logro.descripcion}</p>
												<p className="text-[11px] text-[#757684] mt-1">
													{logro.categoriaLabel} · {logro.tipoLabel}
												</p>
											</div>
										</div>
										<span
											className={[
												'text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full whitespace-nowrap',
												logro.estado === 'desbloqueado'
													? 'bg-[#006d36]/15 text-[#006d36]'
													: logro.estado === 'en-progreso'
														? 'bg-[#24389c]/15 text-[#24389c]'
														: 'bg-[#757684]/15 text-[#454652]'
											].join(' ')}
										>
											{logro.estadoLabel}
										</span>
									</div>

									{!logro.desbloqueado ? (
										<div className="mt-3">
											<div className="flex items-center justify-between text-[11px] font-semibold text-[#454652] mb-1">
												<span>Progreso actual</span>
												<span>{logro.avance}/{logro.meta} ({Math.round(logro.porcentaje)}%)</span>
											</div>
											<div className="h-1.5 bg-white rounded-full overflow-hidden">
												<div
													className="h-full rounded-full bg-[#24389c] transition-all duration-500"
													style={{ width: `${Math.min(100, logro.porcentaje)}%` }}
												/>
											</div>
										</div>
									) : (
										<p className="mt-3 text-[11px] font-semibold text-[#006d36]">Meta completada: {logro.meta}/{logro.meta}</p>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</Modal>
		</div>
	)
}

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCategorias } from '../hooks/useCategorias'
import { useTransacciones } from '../hooks/useTransacciones'

function hoyISO() {
	return new Date().toISOString().slice(0, 10)
}

export default function Transacciones() {
	const navigate = useNavigate()
	const { categorias, cargandoDatos, errorGlobal } = useCategorias()
	const { transacciones, crearTransaccion, limpiarError } = useTransacciones()

	const [form, setForm] = useState({
		tipo: 'gasto',
		monto: '',
		descripcion: '',
		categoriaId: '',
		fecha: hoyISO()
	})
	const [guardando, setGuardando] = useState(false)
	const [errorLocal, setErrorLocal] = useState('')

	const categoriasFiltradas = useMemo(
		() => categorias.filter((c) => c.tipo === form.tipo),
		[categorias, form.tipo]
	)

	const handleChange = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setErrorLocal('')
		limpiarError()

		if (!Number(form.monto) || Number(form.monto) <= 0) {
			setErrorLocal('El monto debe ser mayor a 0.')
			return
		}

		setGuardando(true)

		try {
			await crearTransaccion({
				tipo: form.tipo,
				monto: Number(form.monto),
				descripcion: form.descripcion || null,
				categoriaId: form.categoriaId ? Number(form.categoriaId) : null,
				fecha: form.fecha
			})

			navigate('/dashboard')
		} catch (error) {
			setErrorLocal(error.message || 'No se pudo guardar la transaccion.')
		} finally {
			setGuardando(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-indigo-600">Nueva transaccion</h1>
					<Link to="/dashboard" className="text-indigo-600 hover:underline">
						Volver al dashboard
					</Link>
				</div>

				{(errorGlobal || errorLocal) && (
					<p className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
						{errorLocal || errorGlobal}
					</p>
				)}

				<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<label className="flex flex-col gap-1 text-sm">
						Tipo
						<select
							name="tipo"
							value={form.tipo}
							onChange={handleChange}
							className="border rounded-lg px-3 py-2"
						>
							<option value="gasto">Gasto</option>
							<option value="ingreso">Ingreso</option>
						</select>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						Monto
						<input
							name="monto"
							type="number"
							step="0.01"
							min="0"
							value={form.monto}
							onChange={handleChange}
							className="border rounded-lg px-3 py-2"
							required
						/>
					</label>

					<label className="flex flex-col gap-1 text-sm md:col-span-2">
						Descripcion
						<input
							name="descripcion"
							type="text"
							value={form.descripcion}
							onChange={handleChange}
							className="border rounded-lg px-3 py-2"
							placeholder="Ej: Almuerzo en campus"
						/>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						Categoria
						<select
							name="categoriaId"
							value={form.categoriaId}
							onChange={handleChange}
							className="border rounded-lg px-3 py-2"
							disabled={cargandoDatos}
						>
							<option value="">Sin categoria</option>
							{categoriasFiltradas.map((categoria) => (
								<option key={categoria.id} value={categoria.id}>
									{categoria.nombre}
								</option>
							))}
						</select>
					</label>

					<label className="flex flex-col gap-1 text-sm">
						Fecha
						<input
							name="fecha"
							type="date"
							value={form.fecha}
							onChange={handleChange}
							className="border rounded-lg px-3 py-2"
						/>
					</label>

					<button
						type="submit"
						disabled={guardando}
						className="md:col-span-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
					>
						{guardando ? 'Guardando...' : 'Guardar transaccion'}
					</button>
				</form>

				<section>
					<h2 className="font-semibold text-gray-700 mb-3">Ultimas transacciones</h2>
					<div className="space-y-2">
						{transacciones.slice(0, 5).map((tx) => (
							<article key={tx.id} className="border rounded-lg px-4 py-2 flex justify-between text-sm">
								<span>{tx.descripcion || 'Sin descripcion'}</span>
								<span className={tx.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
									{tx.tipo === 'ingreso' ? '+' : '-'}${Number(tx.monto).toFixed(2)}
								</span>
							</article>
						))}
						{!transacciones.length && (
							<p className="text-sm text-gray-500">Aun no tienes transacciones registradas.</p>
						)}
					</div>
				</section>
			</div>
		</div>
	)
}

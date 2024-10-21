'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Copy, Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Turno {
  numero: string;
  nombre: string;
  tiempoRestante: number;
  completado: boolean;
}

interface HistorialDia {
  fechaInicio: Date;
  fechaFin: Date;
  totalTurnos: number;
  totalRecaudado: number;
}

export default function ModernCombinedApp() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'turnos'>('calculator')
  
  // Calculator state
  const [precioBase, setPrecioBase] = useState(25000)
  const [distanciaIda, setDistanciaIda] = useState(0)
  const [consumo, setConsumo] = useState(26.43)
  const [precioNafta, setPrecioNafta] = useState(1135)
  const [dosViajes, setDosViajes] = useState(false)

  // Turnos state
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [nuevoNumero, setNuevoNumero] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [audio] = useState(typeof Audio !== "undefined" ? new Audio("/alarm.mp3") : null)
  const [totalRecaudado, setTotalRecaudado] = useState(0)
  const [diaIniciado, setDiaIniciado] = useState(false)
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
  const [historial, setHistorial] = useState<HistorialDia[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTurnos = localStorage.getItem('turnos')
    const savedTotalRecaudado = localStorage.getItem('totalRecaudado')
    const savedDiaIniciado = localStorage.getItem('diaIniciado')
    const savedFechaInicio = localStorage.getItem('fechaInicio')
    const savedHistorial = localStorage.getItem('historial')

    if (savedTurnos) setTurnos(JSON.parse(savedTurnos))
    if (savedTotalRecaudado) setTotalRecaudado(JSON.parse(savedTotalRecaudado))
    if (savedDiaIniciado) setDiaIniciado(JSON.parse(savedDiaIniciado))
    if (savedFechaInicio) setFechaInicio(new Date(JSON.parse(savedFechaInicio)))
    if (savedHistorial) setHistorial(JSON.parse(savedHistorial))
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('turnos', JSON.stringify(turnos))
    localStorage.setItem('totalRecaudado', JSON.stringify(totalRecaudado))
    localStorage.setItem('diaIniciado', JSON.stringify(diaIniciado))
    localStorage.setItem('fechaInicio', JSON.stringify(fechaInicio))
    localStorage.setItem('historial', JSON.stringify(historial))
  }, [turnos, totalRecaudado, diaIniciado, fechaInicio, historial])

  // Calculator functions
  const calcularCostoTransporte = () => {
    const distanciaTotal = distanciaIda * (dosViajes ? 4 : 2)
    const consumoTotal = (distanciaTotal / 300) * consumo
    const costoNaftaTotal = consumoTotal * precioNafta
    const multiplicador = dosViajes ? 2.5 : 1.5
    return costoNaftaTotal * multiplicador
  }

  const precioTotal = precioBase + calcularCostoTransporte()
  const precioTotalRedondeado = Math.ceil(precioTotal)

  // Turnos functions
  const agregarTurno = () => {
    if (nuevoNumero && nuevoNombre) {
      if (!diaIniciado) {
        setDiaIniciado(true)
        setFechaInicio(new Date())
      }
      setTurnos([...turnos, { numero: nuevoNumero, nombre: nuevoNombre, tiempoRestante: 600, completado: false }])
      setNuevoNumero('')
      setNuevoNombre('')
      setTotalRecaudado(prev => prev + 1000) // Cambiado a 1000
    }
  }

  const eliminarTurno = (numero: string) => {
    setTurnos(turnos.filter(turno => turno.numero !== numero))
  }

  const finalizarDia = () => {
    if (fechaInicio) {
      const nuevoHistorial: HistorialDia = {
        fechaInicio: fechaInicio,
        fechaFin: new Date(),
        totalTurnos: turnos.length,
        totalRecaudado: totalRecaudado
      }
      setHistorial([nuevoHistorial, ...historial])
      setTurnos([])
      setTotalRecaudado(0)
      setDiaIniciado(false)
      setFechaInicio(null)
    }
  }

  const eliminarHistorial = (index: number) => {
    setHistorial(historial.filter((_, i) => i !== index))
  }

  const formatearFecha = (fecha: Date) => {
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`
  }

  const formatearHora = (fecha: Date) => {
    return `${fecha.getHours().toString().padStart(2, '0')}.${fecha.getMinutes().toString().padStart(2, '0')}.${fecha.getSeconds().toString().padStart(2, '0')}`
  }

  const calcularDuracionTotal = (inicio: Date, fin: Date) => {
    const diff = fin.getTime() - inicio.getTime()
    const horas = Math.floor(diff / 3600000)
    const minutos = Math.floor((diff % 3600000) / 60000)
    const segundos = Math.floor((diff % 60000) / 1000)
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  }

  const copiarHistorial = (item: HistorialDia) => {
    const texto = `Fecha Inicio: ${formatearFecha(item.fechaInicio)} ${formatearHora(item.fechaInicio)}\nFecha Fin: ${formatearFecha(item.fechaFin)} ${formatearHora(item.fechaFin)}\nDuración Total: ${calcularDuracionTotal(item.fechaInicio, item.fechaFin)}\nTotal Turnos: ${item.totalTurnos}\nTotal Recaudado: ${item.totalRecaudado}`
    navigator.clipboard.writeText(texto)
    toast.success('Datos copiados al portapapeles', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTurnos(turnosActuales => 
        turnosActuales.map(turno => ({
          ...turno,
          tiempoRestante: Math.max(0, turno.tiempoRestante - 1)
        }))
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    turnos.forEach(turno => {
      if (turno.tiempoRestante === 0 && !turno.completado) {
        audio?.play()
        setTurnos(turnosActuales => 
          turnosActuales.map(t => 
            t.numero === turno.numero ? { ...t, completado: true } : t
          )
        )
      }
    })
  }, [turnos, audio])

  const turnosActivos = turnos.filter(turno => turno.tiempoRestante > 0).length

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      agregarTurno()
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="bg-gray-100 p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-4xl">
        <div className="flex justify-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Dashboard</h1>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base ${
              activeTab === 'calculator'
                ? 'bg-green-500 text-white'
                : 'text-black hover:bg-gray-200'
            } transition-all duration-300 mr-2`}
          >
            Calculadora
          </button>
          <button
            onClick={() => setActiveTab('turnos')}
            className={`px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base ${
              activeTab === 'turnos'
                ? 'bg-green-500 text-white'
                : 'text-black hover:bg-gray-200'
            } transition-all duration-300`}
          >
            Turnos
          </button>
        </div>
        
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Precio Base del Alquiler"
                value={precioBase}
                onChange={(e) => setPrecioBase(Number(e.target.value))}
              />
              <InputField
                label="Distancia de Ida (km)"
                value={distanciaIda}
                onChange={(e) => setDistanciaIda(Number(e.target.value))}
              />
              <InputField
                label="Consumo (L/300km)"
                value={consumo}
                onChange={(e) => setConsumo(Number(e.target.value))}
              />
              <InputField
                label="Precio Nafta (por litro)"
                value={precioNafta}
                onChange={(e) => setPrecioNafta(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="dosViajes"
                checked={dosViajes}
                onChange={(e) => setDosViajes(e.target.checked)}
                className="w-4 h-4 text-green-500 bg-white border-green-500 rounded focus:ring-green-500"
              />
              <label htmlFor="dosViajes" className="text-black">
                Dos idas y vueltas
              </label>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <p className="text-2xl font-bold text-green-500 mb-2">
                Precio Total (redondeado): ${precioTotalRedondeado}
              </p>
              <p className="text-lg text-black mb-1">
                Costo de Transporte: ${calcularCostoTransporte().toFixed(2)}
              </p>
              <p className="text-lg text-black">
                Precio Total (exacto): ${precioTotal.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'turnos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                placeholder="Nombre"
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
              <input
                type="text"
                value={nuevoNumero}
                onChange={(e) => setNuevoNumero(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Número de turno"
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
              <button
                onClick={agregarTurno}
                className="w-full sm:w-auto px-6 py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors duration-300"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-black space-y-2 sm:space-y-0">
              <span className="font-bold">Turnos activos: {turnosActivos}</span>
              <span className="font-bold">Total recaudado: ${totalRecaudado}</span>
            </div>
            <div className="space-y-4">
              {turnos.map(turno => (
                <div key={turno.numero} className="bg-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <span className="font-bold text-black block sm:inline">Turno {turno.numero} - {turno.nombre}</span>
                    <span className="text-gray-600 block sm:inline sm:ml-2">
                      {Math.floor(turno.tiempoRestante / 60)}:
                       
                      {(turno.tiempoRestante % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {turno.tiempoRestante === 0 && <Bell className="text-green-500" />}
                    <button
                      onClick={() => eliminarTurno(turno.numero)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {diaIniciado && (
              <button
                onClick={finalizarDia}
                className="w-full px-6 py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors duration-300"
              >
                Finalizar Día
              </button>
            )}
            <div className="mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">Historial</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-black border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Duración</th>
                      <th className="p-2 text-left">Turnos</th>
                      <th className="p-2 text-left">Recaudado</th>
                      <th className="p-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((item, index) => (
                      <tr key={index} className="border-t border-gray-300">
                        <td className="p-2">{formatearFecha(item.fechaInicio)}</td>
                        <td className="p-2">{calcularDuracionTotal(item.fechaInicio, item.fechaFin)}</td>
                        <td className="p-2">{item.totalTurnos}</td>
                        <td className="p-2">${item.totalRecaudado}</td>
                        <td className="p-2">
                          <button
                            onClick={() => copiarHistorial(item)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-300 mr-2"
                            title="Copiar"
                          >
                            <Copy className="text-black" size={16} />
                          </button>
                          <button
                            onClick={() => eliminarHistorial(index)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-300"
                            title="Eliminar"
                          >
                            <Trash2 className="text-red-500" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}

interface InputFieldProps {
  label: string
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function InputField({ label, value, onChange }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-black">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
      />
    </div>
  )
}
/* 'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Trash2, CheckCircle } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Turno {
  numero: number;
  nombre: string;
  tiempoInicial: number;
  horaInicio: number;
  completado: boolean;
  horaIngreso: string;
}

interface HistorialDia {
  fechaInicio: Date;
  fechaFin: Date;
  totalTurnos: number;
  totalRecaudado: number;
}

export default function Component() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'turnos'>('calculator')
  
  // Calculator state
  const [precioBase, setPrecioBase] = useState(25000)
  const [distanciaIda, setDistanciaIda] = useState(0)
  const [consumo, setConsumo] = useState(26.43)
  const [precioNafta, setPrecioNafta] = useState(1135)
  const [dosViajes, setDosViajes] = useState(false)

  // Turnos state
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [audio] = useState(typeof Audio !== "undefined" ? new Audio("/alarm.mp3") : null)
  const [totalRecaudado, setTotalRecaudado] = useState(0)
  const [diaIniciado, setDiaIniciado] = useState(false)
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
  const [historial, setHistorial] = useState<HistorialDia[]>([])
  const [turnosFinalizados, setTurnosFinalizados] = useState<Turno[]>([])
  const [ultimoNumeroTurno, setUltimoNumeroTurno] = useState(0)

  useEffect(() => {
    // Load data from localStorage
    const savedTurnos = localStorage.getItem('turnos')
    const savedTotalRecaudado = localStorage.getItem('totalRecaudado')
    const savedDiaIniciado = localStorage.getItem('diaIniciado')
    const savedFechaInicio = localStorage.getItem('fechaInicio')
    const savedHistorial = localStorage.getItem('historial')
    const savedTurnosFinalizados = localStorage.getItem('turnosFinalizados')
    const savedUltimoNumeroTurno = localStorage.getItem('ultimoNumeroTurno')

    if (savedTurnos) setTurnos(JSON.parse(savedTurnos))
    if (savedTotalRecaudado) setTotalRecaudado(JSON.parse(savedTotalRecaudado))
    if (savedDiaIniciado) setDiaIniciado(JSON.parse(savedDiaIniciado))
    if (savedFechaInicio) setFechaInicio(new Date(JSON.parse(savedFechaInicio)))
    if (savedHistorial) setHistorial(JSON.parse(savedHistorial))
    if (savedTurnosFinalizados) setTurnosFinalizados(JSON.parse(savedTurnosFinalizados))
    if (savedUltimoNumeroTurno) setUltimoNumeroTurno(JSON.parse(savedUltimoNumeroTurno))
  }, [])

  useEffect(() => {
    // Save data to localStorage
    localStorage.setItem('turnos', JSON.stringify(turnos))
    localStorage.setItem('totalRecaudado', JSON.stringify(totalRecaudado))
    localStorage.setItem('diaIniciado', JSON.stringify(diaIniciado))
    localStorage.setItem('fechaInicio', JSON.stringify(fechaInicio))
    localStorage.setItem('historial', JSON.stringify(historial))
    localStorage.setItem('turnosFinalizados', JSON.stringify(turnosFinalizados))
    localStorage.setItem('ultimoNumeroTurno', JSON.stringify(ultimoNumeroTurno))
  }, [turnos, totalRecaudado, diaIniciado, fechaInicio, historial, turnosFinalizados, ultimoNumeroTurno])

  const calcularCostoTransporte = () => {
    const distanciaTotal = distanciaIda * (dosViajes ? 4 : 2)
    const consumoTotal = (distanciaTotal / 300) * consumo
    const costoNaftaTotal = consumoTotal * precioNafta
    const multiplicador = dosViajes ? 2.5 : 1.5
    return costoNaftaTotal * multiplicador
  }

  const precioTotal = precioBase + calcularCostoTransporte()
  const precioTotalRedondeado = Math.ceil(precioTotal)

  const iniciarDia = () => {
    localStorage.clear()
    setTurnos([])
    setTotalRecaudado(0)
    setDiaIniciado(true)
    setFechaInicio(new Date())
    setHistorial([])
    setTurnosFinalizados([])
    setUltimoNumeroTurno(0)
  }

  const agregarTurno = () => {
    if (!nuevoNombre.trim()) {
      toast.error("El nombre es obligatorio", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    if (diaIniciado) {
      const nuevoNumeroTurno = ultimoNumeroTurno + 1
      const ahora = Date.now()
      const nuevoTurno: Turno = {
        numero: nuevoNumeroTurno,
        nombre: nuevoNombre.trim(),
        tiempoInicial: 600,
        horaInicio: ahora,
        completado: false,
        horaIngreso: new Date(ahora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
      setTurnos([...turnos, nuevoTurno])
      setNuevoNombre('')
      setTotalRecaudado(prev => prev + 1000)
      setUltimoNumeroTurno(nuevoNumeroTurno)
    }
  }

  const eliminarTurno = (numero: number) => {
    setTurnos(turnos.filter(turno => turno.numero !== numero))
    setTotalRecaudado(prev => prev - 1000)
  }

  const finalizarTurno = (numero: number) => {
    const turnoFinalizado = turnos.find(turno => turno.numero === numero)
    if (turnoFinalizado) {
      setTurnosFinalizados(prev => [...prev, { ...turnoFinalizado, completado: true }])
      setTurnos(prev => prev.filter(turno => turno.numero !== numero))
    }
  }

  const finalizarDia = () => {
    if (fechaInicio) {
      const nuevoHistorial: HistorialDia = {
        fechaInicio: fechaInicio,
        fechaFin: new Date(),
        totalTurnos: turnos.length + turnosFinalizados.length,
        totalRecaudado: totalRecaudado
      }
      setHistorial([nuevoHistorial, ...historial])
      setTurnos([])
      setTotalRecaudado(0)
      setDiaIniciado(false)
      setFechaInicio(null)
      setTurnosFinalizados([])
      setUltimoNumeroTurno(0)
    }
  }

  const calcularTiempoRestante = useCallback((turno: Turno) => {
    const tiempoTranscurrido = Math.floor((Date.now() - turno.horaInicio) / 1000)
    return Math.max(0, turno.tiempoInicial - tiempoTranscurrido)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTurnos(turnosActuales => 
        turnosActuales.map(turno => {
          const tiempoRestante = calcularTiempoRestante(turno)
          if (tiempoRestante === 0 && !turno.completado) {
            audio?.play()
            return { ...turno, completado: true }
          }
          return turno
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [calcularTiempoRestante, audio])

  const turnosActivos = turnos.filter(turno => calcularTiempoRestante(turno) > 0).length

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      agregarTurno();
    }
  };

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
            {!diaIniciado ? (
              <button
                onClick={iniciarDia}
                className="w-full px-6 py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors duration-300"
              >
                Iniciar Día
              </button>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nombre"
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
                  <span className="font-bold">Total  recaudado: ${totalRecaudado}</span>
                </div>
                <div className="space-y-4">
                  {turnos.map(turno => {
                    const tiempoRestante = calcularTiempoRestante(turno)
                    return (
                      <div key={turno.numero} className="bg-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">
                            {turno.numero} - {turno.nombre} 
                            {tiempoRestante > 0 ? (
                              <span className="ml-2 text-gray-600">
                                ({Math.floor(tiempoRestante / 60)}:
                                {(tiempoRestante % 60).toString().padStart(2, '0')})
                              </span>
                            ) : (
                              <span className="ml-2 text-green-500">(Tiempo completo)</span>
                            )}
                          </span>
                          <span className="text-gray-600">
                            Ingreso: {turno.horaIngreso}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {tiempoRestante > 0 ? (
                            <>
                              <button
                                onClick={() => finalizarTurno(turno.numero)}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300"
                              >
                                Finalizar turno
                              </button>
                              <button
                                onClick={() => eliminarTurno(turno.numero)}
                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
                                aria-label="Eliminar turno"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => finalizarTurno(turno.numero)}
                              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300"
                              aria-label="Finalizar turno"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">Turnos finalizados</h2>
                  <div className="space-y-4">
                    {turnosFinalizados.map(turno => (
                      <div key={turno.numero} className="bg-white p-4 rounded-xl">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">
                            {turno.numero} - {turno.nombre} 
                            <span className="ml-2 text-green-500">(Tiempo completo)</span>
                          </span>
                          <span className="text-gray-600">Ingreso: {turno.horaIngreso}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={finalizarDia}
                  className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors duration-300"
                >
                  Finalizar Día
                </button>
              </>
            )}
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
} */


  import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
  import Dashboard from './components/Dashboard'
  import Calculadora from './components/Calculadora'
  import Turnos from './components/Turnos'
  
  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/turnos" element={<Turnos />} />
        </Routes>
      </Router>
    )
  }
  
  export default App
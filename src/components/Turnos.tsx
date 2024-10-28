'use client'

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

export default function Turnos() {
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) =>   {
    if (e.key === 'Enter') {
      agregarTurno();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">CONTROL DE TURNOS</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        {!diaIniciado ? (
          <button
            onClick={iniciarDia}
            className="w-full px-6 py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Iniciar Día
          </button>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nombre"
                className="flex-grow px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <button
                onClick={agregarTurno}
                className="px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition-colors duration-300"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-700 space-y-2 sm:space-y-0 mb-4">
              <span className="font-bold">Turnos activos: {turnosActivos}</span>
              <span className="font-bold">Total recaudado: ${totalRecaudado}</span>
            </div>
            <div className="space-y-4 mb-6">
              {turnos.map(turno => {
                const tiempoRestante = calcularTiempoRestante(turno)
                return (
                  <div key={turno.numero} className="bg-gray-50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Turnos Finalizados</h2>
              <div className="space-y-4">
                {turnosFinalizados.map(turno => (
                  <div key={turno.numero} className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">
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
              className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition-colors duration-300 mt-6"
            >
              Finalizar Día
            </button>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  )
}
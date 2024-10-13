'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Copy } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface Turno {
  numero: string;
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
  const [audio] = useState(typeof Audio !== "undefined" ? new Audio("/alarm.mp3") : null)
  const [totalRecaudado, setTotalRecaudado] = useState(0)
  const [diaIniciado, setDiaIniciado] = useState(false)
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null)
  const [historial, setHistorial] = useState<HistorialDia[]>([])

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
    if (nuevoNumero && !diaIniciado) {
      setDiaIniciado(true)
      setFechaInicio(new Date())
    }
    if (nuevoNumero) {
      setTurnos([...turnos, { numero: nuevoNumero, tiempoRestante: 600, completado: false }])
      setNuevoNumero('')
      setTotalRecaudado(prev => prev + 500)
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
    <div className="min-h-screen bg-gradient-to-br from-[#1C2735] to-[#0F1620] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1C2735]/50 backdrop-blur-md border border-[#335CFF]/20 p-8 rounded-2xl shadow-xl w-full max-w-4xl">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-[#FFFFFF]">Dashboard</h1>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-2 rounded-md ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-[#335CFF] to-[#5679FF] text-[#FFFFFF]'
                : 'text-[#A1B1FF] hover:bg-[#1C2735]/30'
            } transition-all duration-300 mr-2`}
          >
            Calculadora
          </button>
          <button
            onClick={() => setActiveTab('turnos')}
            className={`px-6 py-2 rounded-md ${
              activeTab === 'turnos'
                ? 'bg-gradient-to-r from-[#335CFF] to-[#5679FF] text-[#FFFFFF]'
                : 'text-[#A1B1FF] hover:bg-[#1C2735]/30'
            } transition-all duration-300`}
          >
            Turnos
          </button>
        </div>
        
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                className="w-4 h-4 text-[#335CFF] bg-[#1C2735] border-[#335CFF] rounded focus:ring-[#335CFF]"
              />
              <label htmlFor="dosViajes" className="text-[#FFFFFF]">
                Dos idas y vueltas
              </label>
            </div>
            <div className="bg-[#1C2735]/50 p-6 rounded-xl">
              <p className="text-2xl font-bold text-[#335CFF] mb-2">
                Precio Total (redondeado): ${precioTotalRedondeado}
              </p>
              <p className="text-lg text-[#A1B1FF] mb-1">
                Costo de Transporte: ${calcularCostoTransporte().toFixed(2)}
              </p>
              <p className="text-lg text-[#A1B1FF]">
                Precio Total (exacto): ${precioTotal.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'turnos' && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoNumero}
                onChange={(e) => setNuevoNumero(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Número de turno"
                className="flex-grow px-4 py-2 bg-[#1C2735]/50 border border-[#335CFF]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#335CFF] text-[#FFFFFF]"
              />
              <button
                onClick={agregarTurno}
                className="px-6 py-2 bg-gradient-to-r from-[#335CFF] to-[#5679FF] text-[#FFFFFF] font-bold rounded-md hover:opacity-90 transition-opacity duration-300"
              >
                Agregar
              </button>
            </div>
            <div className="flex justify-between items-center text-[#FFFFFF]">
              <span className="font-bold">Turnos activos: {turnosActivos}</span>
              <span className="font-bold">Total recaudado: ${totalRecaudado}</span>
            </div>
            <div className="space-y-4">
              {turnos.map(turno => (
                <div key={turno.numero} className="bg-[#1C2735]/50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#FFFFFF]">Turno {turno.numero}</span>
                    <span className="ml-2 text-[#A1B1FF]">
                      {Math.floor(turno.tiempoRestante / 60)}:
                      {(turno.tiempoRestante % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {turno.tiempoRestante === 0 && <Bell className="text-[#335CFF]" />}
                    <button
                      onClick={() => eliminarTurno(turno.numero)}
                      className="px-3 py-1 bg-[#FF3366] text-[#FFFFFF] rounded-md hover:bg-[#FF3366]/80 transition-colors duration-300"
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
                className="w-full px-6 py-3 bg-gradient-to-r from-[#335CFF] to-[#5679FF] text-[#FFFFFF] font-bold rounded-md hover:opacity-90 transition-opacity duration-300"
              >
                Finalizar Día
              </button>
            )}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">Historial</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[#FFFFFF] border-collapse">
                  <thead>
                    <tr className="bg-[#1C2735]/50">
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Duración</th>
                      <th className="p-2 text-left">Turnos</th>
                      <th className="p-2 text-left">Recaudado</th>
                      <th className="p-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((item, index) => (
                      <tr key={index} className="border-t border-[#335CFF]/20">
                        <td className="p-2">{formatearFecha(item.fechaInicio)}</td>
                        <td className="p-2">{calcularDuracionTotal(item.fechaInicio, item.fechaFin)}</td>
                        <td  className="p-2">{item.totalTurnos}</td>
                        <td className="p-2">${item.totalRecaudado}</td>
                        <td className="p-2">
                          <button
                            onClick={() => copiarHistorial(item)}
                            className="p-1 hover:bg-[#335CFF]/20 rounded-full transition-colors duration-300"
                            title="Copiar"
                          >
                            <Copy className="text-[#FFFFFF]" size={16} />
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
      <label className="block text-sm font-medium text-[#A1B1FF]">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-[#1C2735]/50 border border-[#335CFF]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#335CFF] text-[#FFFFFF]"
      />
    </div>
  )
}
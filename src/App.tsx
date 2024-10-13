'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Bell, Share, Copy } from 'lucide-react'

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

export default function CombinedApp() {
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

  const compartirHistorial = (item: HistorialDia) => {
    const mensaje = `Fecha Inicio: ${formatearFecha(item.fechaInicio)} ${formatearHora(item.fechaInicio)}\nFecha Fin: ${formatearFecha(item.fechaFin)} ${formatearHora(item.fechaFin)}\nDuración Total: ${calcularDuracionTotal(item.fechaInicio, item.fechaFin)}\nTotal Turnos: ${item.totalTurnos}\nTotal Recaudado: $${item.totalRecaudado}`
    // Aquí iría la lógica para enviar el mensaje al número +543624559999
    console.log("Compartiendo:", mensaje)
  }

  const copiarHistorial = (item: HistorialDia) => {
    const texto = `Fecha Inicio: ${formatearFecha(item.fechaInicio)} ${formatearHora(item.fechaInicio)}\nFecha Fin: ${formatearFecha(item.fechaFin)} ${formatearHora(item.fechaFin)}\nDuración Total: ${calcularDuracionTotal(item.fechaInicio, item.fechaFin)}\nTotal Turnos: ${item.totalTurnos}\nTotal Recaudado: $${item.totalRecaudado}`
    navigator.clipboard.writeText(texto)
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

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="bg-[#000000] border border-[#546064] p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-l-md ${activeTab === 'calculator' ? 'bg-[#0a1216] text-[#fffaf2] font-bold' : 'bg-[#000000] text-[#fffaf2]'} border border-[#546064]`}
          >
            Calculadora
          </button>
          <button
            onClick={() => setActiveTab('turnos')}
            className={`px-4 py-2 rounded-r-md ${activeTab === 'turnos' ? 'bg-[#0a1216] text-[#fffaf2] font-bold' : 'bg-[#000000] text-[#fffaf2]'} border border-[#546064] border-l-0`}
          >
            Turnos
          </button>
        </div>

        {activeTab === 'calculator' && (
          <>
            <div className="flex items-center justify-center mb-6">
              <Calculator className="w-10 h-10 text-[#fffaf2] mr-2" />
              <h1 className="text-2xl font-bold text-[#fffaf2]">Calculadora de Precios</h1>
            </div>
            <div className="space-y-4">
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dosViajes"
                  checked={dosViajes}
                  onChange={(e) => setDosViajes(e.target.checked)}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="dosViajes" className="text-[#fffaf2]">
                  Dos idas y vueltas
                </label>
              </div>
            </div>
            <div className="mt-6 p-4 bg-[#0a1216] border border-[#546064] rounded-md">
              <p className="text-xl font-bold text-[#72ff67] mt-2">
                Precio Total (redondeado): ${precioTotalRedondeado}
              </p>
              <p className="text-lg font-semibold text-[#a1afb6] mt-2">
                Costo de Transporte: ${calcularCostoTransporte().toFixed(2)}
              </p>
              <p className="text-lg font-semibold text-[#546064]">
                Precio Total (exacto): ${precioTotal.toFixed(2)}
              </p>
            </div>
          </>
        )}

        {activeTab === 'turnos' && (
          <>
            <h1 className="text-2xl font-bold text-[#fffaf2] mb-6 text-center">Control de Turnos</h1>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                min="1"
                value={nuevoNumero}
                onChange={(e) => setNuevoNumero(Math.floor(Number(e.target.value)).toString())}
                placeholder="Número de turno"
                className="flex-grow px-3 py-2 bg-[#0a1216] border border-[#546064] rounded-md focus:outline-none focus:ring-1 focus:ring-[#72ff67] text-[#fffaf2]"
              />
              <button
                onClick={agregarTurno}
                className="px-4 py-2 bg-[#0a1216] text-[#ffffed] font-bold border border-[#546064] rounded-md hover:bg-[#1a2226]"
              >
                Agregar
              </button>
            </div>
            <div className="mb-4 flex justify-between items-center text-[#fffaf2]">
              <span className="font-bold">Turnos activos: {turnosActivos}</span>
              <span className="font-bold">Total recaudado: ${totalRecaudado}</span>
            </div>
            {turnos.map(turno => (
              <div key={turno.numero} className="mb-2 p-4 bg-[#0a1216] border border-[#546064] rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#fffaf2]">Turno {turno.numero}</span>
                    <span className="ml-2 text-[#a1afb6]">
                      {Math.floor(turno.tiempoRestante / 60)}:
                      {(turno.tiempoRestante % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {turno.tiempoRestante === 0 && <Bell className="text-[#72ff67] mr-2" />}
                    <button
                      onClick={() => eliminarTurno(turno.numero)}
                      className="px-2 py-1 bg-[#000000] text-[#ff6767] border border-[#546064] rounded-md hover:bg-[#1a0000] font-bold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {diaIniciado && (
              <button
                onClick={finalizarDia}
                className="w-full mt-4 px-4 py-2 bg-[#0a1216] text-[#ffffed] font-bold border border-[#546064] rounded-md hover:bg-[#1a2226]"
              >
                Finalizar Día
              </button>
            )}
            <div className="mt-6">
              <h2 className="text-xl font-bold text-[#fffaf2] mb-4">Historial</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[#fffaf2] border-collapse">
                  <thead>
                    <tr className="bg-[#0a1216]">
                      <th className="p-2 border border-[#546064] whitespace-nowrap">Fecha Inicio</th>
                      <th className="p-2 border border-[#546064] whitespace-nowrap">Hora Inicio</th>
                      <th className="p-2 border border-[#546064] whitespace-nowrap">Fecha Fin</th>
                      <th className="p-2 border border-[#546064] whitespace-nowrap">Hora Fin</th>
                      <th className="p-2 border border-[#546064] whitespace-nowrap">Duración Total</th>
                      <th className="p-2 border border-[#546064] whitespace-nowrap">Total Turnos</th>
                      <th className="p-2 border border-[#546064] whitespace-nowrap">Total Recaudado</th>
                      <th  className="p-2 border border-[#546064] whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((item, index) => (
                      <tr key={index} className="bg-[#0a1216]">
                        <td className="p-2 border border-[#546064] whitespace-nowrap">{formatearFecha(item.fechaInicio)}</td>
                        <td className="p-2 border border-[#546064] whitespace-nowrap">{formatearHora(item.fechaInicio)}</td>
                        <td className="p-2 border border-[#546064] whitespace-nowrap">{formatearFecha(item.fechaFin)}</td>
                        <td className="p-2 border border-[#546064] whitespace-nowrap">{formatearHora(item.fechaFin)}</td>
                        <td className="p-2 border border-[#546064] whitespace-nowrap">{calcularDuracionTotal(item.fechaInicio, item.fechaFin)}</td>
                        <td className="p-2 border border-[#546064] whitespace-nowrap">{item.totalTurnos}</td>
                        <td className="p-2 border border-[#546064] whitespace-nowrap">${item.totalRecaudado}</td>
                        <td className="p-2 border border-[#546064] whitespace-nowrap">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => compartirHistorial(item)}
                              className="p-1 hover:bg-[#1a2226] rounded-full"
                              title="Compartir"
                            >
                              <Share className="text-[#fffaf2]" size={16} />
                            </button>
                            <button
                              onClick={() => copiarHistorial(item)}
                              className="p-1 hover:bg-[#1a2226] rounded-full"
                              title="Copiar"
                            >
                              <Copy className="text-[#fffaf2]" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
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
    <div>
      <label className="block text-sm font-medium text-[#fffaf2] mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-[#0a1216] border border-[#546064] rounded-md focus:outline-none focus:ring-1 focus:ring-[#72ff67] text-[#fffaf2]"
      />
    </div>
  )
}
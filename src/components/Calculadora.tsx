'use client'

import React, { useState } from 'react'

export default function Calculadora() {
  const [precioBase, setPrecioBase] = useState(25000)
  const [distanciaIda, setDistanciaIda] = useState(0)
  const [consumo, setConsumo] = useState(26.43)
  const [precioNafta, setPrecioNafta] = useState(1135)
  const [dosViajes, setDosViajes] = useState(false)

  const calcularCostoTransporte = () => {
    const distanciaTotal = distanciaIda * (dosViajes ? 4 : 2)
    const consumoTotal = (distanciaTotal / 300) * consumo
    const costoNaftaTotal = consumoTotal * precioNafta
    const multiplicador = dosViajes ? 2.5 : 1.5
    return costoNaftaTotal * multiplicador
  }

  const precioTotal = precioBase + calcularCostoTransporte()
  const precioTotalRedondeado = Math.ceil(precioTotal)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">CALCULADORA DE PRESUPUESTOS</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
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
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="dosViajes" className="text-gray-700">
              Dos idas y vueltas
            </label>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-2xl font-bold text-green-600 mb-2">
              Precio Total (redondeado): ${precioTotalRedondeado}
            </p>
            <p className="text-lg text-gray-700 mb-1">
              Costo de Transporte: ${calcularCostoTransporte().toFixed(2)}
            </p>
            <p className="text-lg text-gray-700">
              Precio Total (exacto): ${precioTotal.toFixed(2)}
            </p>
          </div>
        </div>
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
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
      />
    </div>
  )
}
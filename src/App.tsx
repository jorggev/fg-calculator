import React, { useState } from 'react'
import { Calculator } from 'lucide-react'

function App() {
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
    <div className="min-h-screen bg-[#000000] flex items-center justify-center">
      <div className="bg-[#000000] border border-[#546064] p-8 rounded-lg shadow-xl w-full max-w-md">
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

export default App
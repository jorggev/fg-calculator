import React from 'react'
import { Link } from 'react-router-dom'
import { Globe, Calculator, Users } from 'lucide-react'
/* import { Globe, Calendar, DollarSign, Book, Calculator, Users } from 'lucide-react' */


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center">Funny Games - Dashboard</h1>
      <h1 className="mb-8 text-center">Beta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardItem icon={<Globe className="w-8 h-8" />} title="Página web" href="/web" />
{/*         <DashboardItem icon={<Calendar className="w-8 h-8" />} title="Agenda y reservas" href="/agenda" />
        <DashboardItem icon={<DollarSign className="w-8 h-8" />} title="Lista de precios" href="/precios" />
        <DashboardItem icon={<Book className="w-8 h-8" />} title="Recetas" href="/recetas" /> */}
        <DashboardItem icon={<Calculator className="w-8 h-8" />} title="Calculadora" href="/calculadora" />
        <DashboardItem icon={<Users className="w-8 h-8" />} title="Turnos app" href="/turnos" />
      </div>
    </div>
  )
}

interface DashboardItemProps {
  icon: React.ReactNode
  title: string
  href: string
}

function DashboardItem({ icon, title, href }: DashboardItemProps) {
  return (
    <Link to={href} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center space-y-4">
      <div className="text-blue-500">{icon}</div>
      <h2 className="text-xl font-semibold text-center">{title}</h2>
    </Link>
  )
}
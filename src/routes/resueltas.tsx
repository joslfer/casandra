import { createFileRoute } from '@tanstack/react-router'
import { ResueltasScreen } from '../screens/ResueltasScreen' 
// Nota: Ajusta esa ruta de importación '../screens...' según dónde tengas tu archivo

export const Route = createFileRoute('/resueltas')({
  component: ResueltasScreen,
})
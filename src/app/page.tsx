import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { Stats } from '@/components/Stats'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <Stats />
      <Features />
    </div>
  )
}
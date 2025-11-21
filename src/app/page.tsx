// app/page.tsx
import { Navbar } from '@/sections/Navbar'
import { Hero } from '@/sections/Hero'
import { TextCarousel } from '@/sections/TextCarousel'
import { ImageCarousel } from '@/sections/ImageCarousel'
import { HowItWorks } from '@/sections/HowItWorks'
import { Footer } from '@/sections/Footer'
import { ProSection } from '@/sections/ProSection'

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      <Hero />
      <TextCarousel texts={[
        'Add Text','Stickers','Resize','Templates','Brand-safe','Share-ready','Fast'
      ]} />
      <HowItWorks />
      <ProSection />
      <ImageCarousel />
      <Footer />
    </main>
  )
}
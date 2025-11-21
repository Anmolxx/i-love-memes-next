import { ImageUpload } from '@/sections/ImageUpload'
import { Navbar } from '@/sections/Navbar'
import { ImageCarousel } from '@/sections/ImageCarousel'
import { Footer } from '@/sections/Footer'
export default function Page() {
  return (
    <main className="min-h-screen bg-white">
        <Navbar />
        <ImageUpload />
        <ImageCarousel />
        <Footer />
    </main>
  )
}

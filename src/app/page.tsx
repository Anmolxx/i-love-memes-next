"use client"; 

import { Navbar } from '@/sections/Navbar';
import { Hero } from '@/sections/Hero';
import { TextCarousel } from '@/sections/TextCarousel';
import { ImageCarousel } from '@/sections/ImageCarousel';
import { HowItWorks } from '@/sections/HowItWorks';
import { Footer } from '@/sections/Footer';
import { ProSection } from '@/sections/ProSection';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { ImageCarouselSkeleton } from '@/sections/skeletons/ImageCarouselSkeleton';
import { FooterSkeleton } from '@/sections/skeletons/FooterSkeleton';
import { HeroSkeleton } from '@/sections/skeletons/HeroSkeleton';
import { HowItWorksSkeleton } from '@/sections/skeletons/HowItWorksSkeleton';
import { ProSectionSkeleton } from '@/sections/skeletons/ProSectionSkeleton';

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      {loading ? <HeroSkeleton /> : <Hero />}
      <TextCarousel
        texts={[
          <>
            Got a Funny idea? Turn it into a meme in 3 easy steps!{' '}
            <Link href="/meme">
              <span className="underline inline-flex items-center gap-1 underline-offset-4">
                Get Started <ArrowRight size={16} />
              </span>
            </Link>
          </>,
          <>
            Join our Meme Community! Share, Vote, and Enjoy the Fun!{' '}
            <Link href="/community">
              <span className="underline inline-flex items-center gap-1 underline-offset-4">
                Explore Now <ArrowRight size={16} />
              </span>
            </Link>
          </>,
          'Create Memes Effortlessly! Use Our enhanced Meme Generator Today!',
        ]}
      />
      {loading ? <HowItWorksSkeleton /> : <HowItWorks />}
      {loading ? <ProSectionSkeleton /> : <ProSection />}
      <Suspense fallback={<ImageCarouselSkeleton />}><ImageCarousel /></Suspense>
      {loading ? <FooterSkeleton /> : <Footer />}
    </main>
  );
}

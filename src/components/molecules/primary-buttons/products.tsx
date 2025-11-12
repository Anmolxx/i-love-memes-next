import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ProductsPrimaryButtons() {
  return (
    <div className='flex gap-2'>
      <Link href='/meme'>
        <Button className='space-x-1'>
          <span>Create</span> <Plus size={18} />
        </Button>
      </Link>
    </div>
  )
}
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import StreamRoom from '@/components/StreamRoom'
import Chat from '@/components/Chat'


const inter = Inter({ subsets: ['latin'] })

export default function StreamThree() {
  return (
    <div>
      <StreamRoom />
    </div>
  )
}

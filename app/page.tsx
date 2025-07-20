import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to products page as the main entry point
  redirect('/products')
}
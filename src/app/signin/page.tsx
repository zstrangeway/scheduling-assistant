import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SignInForm from './signin-form'

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await getServerSession(authOptions)
  const params = await searchParams
  
  if (session) {
    redirect(params.callbackUrl || '/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Availability Helper
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Coordinate schedules with your groups
          </p>
        </div>
        
        <SignInForm callbackUrl={params.callbackUrl || '/'} />
      </div>
    </div>
  )
}
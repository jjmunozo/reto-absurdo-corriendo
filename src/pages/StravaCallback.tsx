
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStravaAuth } from '@/hooks/useStravaAuth'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

const StravaCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { exchangeCodeForToken } = useStravaAuth()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`Strava authorization error: ${error}`)
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state')
        }

        if (!user) {
          throw new Error('User not authenticated')
        }

        console.log('Processing Strava callback...')
        await exchangeCodeForToken(code, state)
        
        toast({
          title: "¡Strava conectado!",
          description: "Tu cuenta de Strava ha sido conectada exitosamente",
        })

        navigate('/')
      } catch (error: any) {
        console.error('Error processing Strava callback:', error)
        toast({
          title: "Error conectando Strava",
          description: error.message || "Hubo un problema conectando tu cuenta",
          variant: "destructive",
        })
        navigate('/')
      } finally {
        setIsProcessing(false)
      }
    }

    if (user) {
      processCallback()
    } else {
      // Si no hay usuario, redirigir al login
      navigate('/auth')
    }
  }, [user, searchParams, exchangeCodeForToken, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-running-primary mx-auto mb-4"></div>
            <p className="text-lg">Conectando con Strava...</p>
            <p className="mt-2 text-sm text-gray-500">
              Procesando tu autorización
            </p>
          </>
        ) : (
          <>
            <p className="text-lg">Redirigiendo...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default StravaCallback

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AuthCallback() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // If router is not ready, return immediately
        if (!router.isReady) return;

        // Get the original redirect target URL (if exists)
        let redirectTo = localStorage.getItem('auth_redirect_to') || '/'

        // Clear the stored redirect URL
        localStorage.removeItem('auth_redirect_to')

        // Clear all parameters from URL and redirect to target page
        const cleanRedirect = redirectTo.split('?')[0].split('#')[0]

        // Delay a bit to ensure authorization is complete
        setTimeout(() => {
            router.replace(cleanRedirect)
                .then(() => {
                    setIsLoading(false)
                })
                .catch(error => {
                    console.error('Redirect error:', error)
                    // On error, default to homepage
                    router.push('/')
                })
        }, 1500)
    }, [router.isReady, router])

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#f5f9ee]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-t-[#1c4c3b] border-r-transparent border-b-[#1c4c3b] border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#1c4c3b] text-lg">Login successful, redirecting...</p>
            </div>
        </div>
    )
} 
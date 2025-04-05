import { Button } from '@nextui-org/react'
import { useAuth } from '@/contexts/AuthContext'
import UserMenu from './UserMenu'

export default function AuthNav() {
    const { user, isLoading, setIsLoginModalOpen, setLoginModalRedirectTo } = useAuth()

    if (isLoading) {
        return <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
    }

    if (user) {
        return <UserMenu />
    }

    return (
        <>
            <div className="flex gap-2">
                <Button
                    color="primary"
                    variant="flat"
                    onClick={() => {
                        console.log(`Clicking sign in button, current window.location.origin is: ${window.location.origin}`)
                        setLoginModalRedirectTo(window.location.origin)
                        setIsLoginModalOpen(true)
                    }}
                    size="sm"
                    className='text-sm md:text-base border-[1px] border-zinc-300 rounded-md'
                >
                    Sign In
                </Button>
            </div>
        </>
    )
} 
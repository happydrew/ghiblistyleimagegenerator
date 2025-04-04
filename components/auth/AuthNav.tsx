import { useState } from 'react'
import { Button } from '@nextui-org/react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'
import UserMenu from './UserMenu'
import { MemoryRouter } from "react-router-dom";

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
                    onClick={() => { setIsLoginModalOpen(true); setLoginModalRedirectTo(window.location.origin) }}
                    size="sm"
                    className='text-sm md:text-base border-[1px] border-zinc-300 rounded-md'
                >
                    Sign In
                </Button>
            </div>
        </>
    )
} 
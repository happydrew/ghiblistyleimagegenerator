import { useAuth } from '@/contexts/AuthContext'
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    User,
    Avatar,
    Button
} from '@nextui-org/react'
import { LuLogOut } from 'react-icons/lu'
import { FaCoins, FaUser } from 'react-icons/fa'
import { useRouter } from 'next/router'

export default function UserMenu() {
    const { user, signOut, credits } = useAuth()
    const router = useRouter()

    if (!user) return null

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button
                    variant="light"
                    className="p-0 hover:bg-gray-200 rounded"
                >
                    <User
                        name={user.email?.split('@')[0]}
                        description={<div className="flex items-center gap-1 text-xs"><FaCoins size={12} className="text-yellow-500" /> {credits} credits</div>}
                        avatarProps={{
                            icon: <FaUser className="h-4 w-4" />,
                            size: "sm",
                            isBordered: true,
                            className: "bg-primary-100 text-black"
                        }}
                        classNames={{
                            name: "text-sm font-semibold",
                            description: "text-xs opacity-90"
                        }}
                    />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="User menu"
                className="p-1 bg-gray-100 dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-b-md rounded-t-none"
                itemClasses={{
                    base: [
                        "rounded-md",
                        "text-sm",
                        "py-2",
                        "transition-opacity",
                        "data-[hover=true]:bg-default-100"
                    ]
                }}
            >
                <DropdownItem
                    key="credits"
                    startContent={<FaCoins className="text-yellow-500" size={16} />}
                    description="View your credits and transaction history"
                    className="text-foreground hover:bg-gray-200"
                    onPress={() => router.push('/credits')}
                >
                    My Credits: {credits}
                </DropdownItem>
                <DropdownItem
                    key="logout"
                    color="danger"
                    startContent={<LuLogOut size={16} />}
                    description="Sign out from your account"
                    className="text-danger hover:bg-gray-200"
                    onPress={() => signOut()}
                >
                    Sign out
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
} 
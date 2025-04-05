import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Divider, Tabs, Tab } from '@nextui-org/react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import SignupVerifyForm from './SignupVerifyForm'
import SignupSuccessForm from './SignupSuccessForm'
import ResetPasswordForm from './ResetPasswordForm'
import ResetPasswordSetpassForm from './ResetPasswordSetpassForm'
import ResetPasswordSuceessForm from './ResetPasswordSuccessForm'
import { Routes, Route, useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';


interface LoginModalProps {
    isOpen: boolean
    onClose: () => void,
    redirectTo?: string,
    defaultPath?: string
}

export default function LoginModal({ isOpen, onClose, redirectTo }: LoginModalProps) {
    const navigate = useNavigate()

    const closeModal = () => {
        onClose()
        navigate('/')
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            placement="center"
            backdrop="blur"
            isDismissable={false}
            closeButton={
                <IconButton
                    aria-label="close"
                    onClick={closeModal}
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                    <CloseIcon />
                </IconButton>
            }
            hideCloseButton={false}
            classNames={{
                backdrop: "bg-gradient-to-t from-zinc-900/60 to-zinc-900/40 z-[9998]",
                base: "max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-teal-50/95 to-amber-50/95 dark:from-zinc-900/95 dark:to-zinc-800/95 border border-amber-200 dark:border-teal-900/30 rounded-xl shadow-xl my-4 z-[9999]",
                header: "border-b-0",
                body: "px-6 py-3",
                footer: "border-t-0",
                wrapper: "flex items-center justify-center min-h-screen p-4 z-[9999]",
                closeButton: "absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            }}
            motionProps={{
                variants: {
                    enter: {
                        opacity: 1,
                        y: 0,
                        scale: 1
                    },
                    exit: {
                        opacity: 0,
                        y: -20,
                        scale: 0.95
                    }
                }
            }}
        >
            <ModalContent>
                <Routes>
                    <Route path="/" element={<LoginForm redirectTo={redirectTo} onLoginSuccess={closeModal} />} ></Route>
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/signup/verify" element={<SignupVerifyForm />} />
                    <Route path="/signup/success" element={<SignupSuccessForm />} />
                    <Route path="/reset-password" element={<ResetPasswordForm />} />
                    <Route path="/reset-password/setpass" element={<ResetPasswordSetpassForm />} />
                    <Route path="/reset-password/success" element={<ResetPasswordSuceessForm />} />
                </Routes>
            </ModalContent>
        </Modal >
    )
} 
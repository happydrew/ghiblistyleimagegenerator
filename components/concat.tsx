import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { CONCAT_URL } from 'gamehome.config';
import { validEmailFormat } from "utils";

export const Concat = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [lastSendTime, setLastSendTime] = useState(0);
    const [notifySendSuccess, setNotifySendSuccess] = useState(false);
    const [notifySendFailure, setNotifySendFailure] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!name || !email || !subject || !message) {
            sendFailed('Please fill all fields');
            return;
        }

        if (!validEmailFormat(email)) {
            sendFailed('Please enter a valid email address!');
            return;
        }

        // Prevent spamming, only allow one message every 60 seconds
        if (Date.now() - lastSendTime < 60000) {
            sendFailed('Please wait at least 1 minute before sending another message');
            return;
        }
        try {
            setIsSending(true);
            const response = await fetch(CONCAT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message
                })
            });
            if (!response.ok) {
                throw new Error(`Failed to send message, response status: ${response.status}`)
            } else {
                console.log('Message sent successfully')
                sendSuccess();
                setLastSendTime(Date.now());
            }
        } catch (error) {
            console.error('Failed to send message', error);
            sendFailed('Failed to send message, please try again later');
        } finally {
            setIsSending(false);
        }
    }

    function sendSuccess() {
        setSendError('');
        setNotifySendSuccess(true);
        setTimeout(() => {
            setNotifySendSuccess(false);
        }, 3000);
    }

    function sendFailed(error: string) {
        setSendError(error);
        setNotifySendFailure(true);
        setTimeout(() => {
            setNotifySendFailure(false);
        }, 3000);
    }

    return (
        <section className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-8 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-6 sm:mb-8 md:mb-12 text-center">
                    <h2 className="max-w-xl mx-auto text-3xl font-bold">Concat Us</h2>
                    <p className="max-w-screen-sm mx-auto text-base text-zinc-400">Have questions, feedback, or need support? We're here to help! Feel free to reach out, and we'll get back to you as soon as possible.</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-lg shadow-lg p-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="p-4 bg-teal-500 text-white rounded-md w-full sm:w-60 md:w-72">
                        <h3 className="text-base font-bold mb-2">Contact Information</h3>
                        <p className="text-sm opacity-70 mb-8">Any questions, feedback, or need support? Feel free to reach out, and we'll get back to you as soon as possible.</p>
                        <ul className="text-sm grid grid-cols-2 sm:grid-cols-1 gap-4">
                            <li>
                                <h4 className="font-medium text-teal-50">Email us :</h4>
                                <p>drewgrant616@gmail.com</p>
                            </li>
                            <li>
                                <h4 className="font-medium text-teal-50">Join our community :</h4>
                                {/* <p>
                                    <a className='text-white underline'
                                        href="https://ezymp3ccyoutubetomp3.quora.com/?invite_code=wJ55ugDw4sbNAOAAmIRs" target='_blank'>
                                        Quaro Space
                                    </a>
                                </p> */}
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 min-w-0">
                        <form className="relative flex flex-col gap-2 sm:gap-4 p-2 sm:p-4 md:p-8" onSubmit={handleSubmit}>
                            {notifySendSuccess && (
                                <div
                                    className='z-[99999] animate-saveSuccessNotification absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-base font-bold text-white px-4 py-0.5 rounded'>
                                    You message has been sent successfully, we will get back to you as soon as possible.
                                </div>
                            )}
                            {notifySendFailure && (
                                <div
                                    className='z-[99999] animate-saveSuccessNotification absolute top-0 left-1/2 transform -translate-x-1/2 bg-red-500 text-base font-bold text-white px-4 py-0.5 rounded'>
                                    {sendError}
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 dark:bg-zinc-900 bg-white border border-solid border-gray-200 rounded-md px-3 mt-1 outline-teal-500 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium">Your Email</label>
                                    <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 dark:bg-zinc-900 bg-white border border-solid border-gray-200 rounded-md px-3 mt-1 outline-teal-500 text-sm" /></div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="text-sm  font-medium">Your Subject</label>
                                <input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-10 dark:bg-zinc-900 bg-white border border-solid border-gray-200 rounded-md px-3 mt-1 outline-teal-500 text-sm" />
                            </div>
                            <div>
                                <label htmlFor="message" className="text-xs font-medium">Message</label>
                                <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full h-24 dark:bg-zinc-900 bg-white border border-solid border-gray-200 rounded-md px-3 py-2 mt-1 outline-teal-500 text-sm"></textarea>
                            </div>
                            <div className="mt-6">
                                <button type='submit'
                                    className="flex justify-center items-center w-full h-12 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-base">
                                    Send Message
                                    <CircularProgress sx={{ color: 'white', ml: 1 }} size={20} thickness={5}
                                        className={`${isSending ? '' : 'invisible '}`} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>)
}
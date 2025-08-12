"use client" // use client in nextjs

import Image from "next/image"
import f1logo from "./assets/f1logo.png"
import { useChat } from '@ai-sdk/react';

// Used chathook from vercel ai allow you to create a conversational user interface for your chat application.

// It enables the streaming of chat messages from your AI providers, manage the state for chat input and update UI automatically as new messages received

import { Message } from "ai"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {
    const {append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat()

    const noMessages = !messages || messages.length === 0

    const handlePrompt = ( promptText ) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg)
    }

    return (
        <main>
            <Image src ={f1logo} width = "250" alt="F1GPT Logo"/>
            {/* Starting the section based on the messages availability */}
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            The Ultimate place for Formula One super fans!
                            Ask F1GPT anything about the fantastic topic of F1 racing and it will come back with the most up-to-date answers. 
                            We hope you enjoy !
                        </p>
                        <br/>
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => (
                        <Bubble key={`message-${index}`} message={message} />
                        ))}
                        {isLoading && <LoadingBubble />}
                    </>
                )}
                <form onSubmit = {handleSubmit}>
                    <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me something..."/>
                    <input type="submit"/>

                </form>
            </section>
        </main>
    )
}

export default Home
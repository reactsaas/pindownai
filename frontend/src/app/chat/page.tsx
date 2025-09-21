'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>
      
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap mb-4">
          <div className="font-semibold">
            {m.role === 'user' ? 'You: ' : 'AI: '}
          </div>
          <div>
            {m.parts.map((part, i) => 
              part.type === 'text' ? part.text : JSON.stringify(part)
            ).join('')}
          </div>
        </div>
      ))}

      <form onSubmit={(e) => {
        e.preventDefault();
        if (input.trim()) {
          sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
          setInput('');
        }
      }} className="mt-4">
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
          disabled={status === 'streaming'}
        />
      </form>
    </div>
  );
}

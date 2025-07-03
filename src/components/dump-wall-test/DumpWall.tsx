"use client";

import { useState } from 'react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'

interface Dump {
  id: string
  content: string
  timestamp: number
  reactions: {
    [key: string]: number
  }
  replies: Dump[]
}

const REACTIONS = ['😂', '😭', '😱', '❤️', '👍', '🔥']

export function DumpWall() {
  const [dumps, setDumps] = useState<Dump[]>([])
  const [newDump, setNewDump] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const handlePostDump = () => {
    if (!newDump.trim()) return

    const dump: Dump = {
      id: Math.random().toString(36).substr(2, 9),
      content: newDump,
      timestamp: Date.now(),
      reactions: {},
      replies: []
    }

    if (replyTo) {
      setDumps(dumps.map(d => {
        if (d.id === replyTo) {
          return { ...d, replies: [...d.replies, dump] }
        }
        return d
      }))
      setReplyTo(null)
    } else {
      setDumps([dump, ...dumps])
    }

    setNewDump('')
  }

  const handleReaction = (dumpId: string, reaction: string) => {
    setDumps(dumps.map(dump => {
      if (dump.id === dumpId) {
        return {
          ...dump,
          reactions: {
            ...dump.reactions,
            [reaction]: (dump.reactions[reaction] || 0) + 1
          }
        }
      }
      return dump
    }))
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dump Wall 💬</h1>
      
      <div className="mb-6">
        <Textarea
          placeholder="What's on your mind? Dump it here..."
          value={newDump}
          onChange={(e) => setNewDump(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handlePostDump} className="w-full">
          Dump it! 🚀
        </Button>
      </div>

      <ScrollArea className="h-[600px]">
        {dumps.map((dump) => (
          <Card key={dump.id} className="mb-4 p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">
                Anonymous • {formatTime(dump.timestamp)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(dump.id)}
              >
                Reply
              </Button>
            </div>
            <p className="mb-2">{dump.content}</p>
            <div className="flex gap-2 flex-wrap">
              {REACTIONS.map((reaction) => (
                <Badge
                  key={reaction}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleReaction(dump.id, reaction)}
                >
                  {reaction} {dump.reactions[reaction] || 0}
                </Badge>
              ))}
            </div>
            
            {dump.replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200">
                {dump.replies.map((reply) => (
                  <Card key={reply.id} className="mb-2 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        Anonymous • {formatTime(reply.timestamp)}
                      </span>
                    </div>
                    <p className="mb-2">{reply.content}</p>
                    <div className="flex gap-2 flex-wrap">
                      {REACTIONS.map((reaction) => (
                        <Badge
                          key={reaction}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleReaction(reply.id, reaction)}
                        >
                          {reaction} {reply.reactions[reaction] || 0}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        ))}
      </ScrollArea>
    </div>
  )
} 
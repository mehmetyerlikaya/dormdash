"use client";

import { useState, useEffect } from "react";
import CardWrapper from "./ui/CardWrapper";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import useSupabaseData from "@/src/hooks/useSupabaseData";
import { formatTimeAgo } from "@/src/utils/timeUtils";
import { getDeviceUserId, getUserDisplayName } from "@/src/utils/userIdentification";

const REACTIONS = ["😂", "😭", "😱", "❤️", "👍", "🔥", "💀", "💯"];

export default function AnonymousChatCard() {
  const {
    anonymousPosts,
    createAnonymousPost,
    deleteAnonymousPost,
    togglePostReaction,
    getPostReplies,
    isLoading,
    error,
  } = useSupabaseData();
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const deviceId = getDeviceUserId();
  const displayName = getUserDisplayName();

  // Handle posting
  const handlePost = async () => {
    setPostError("");
    if (newPost.trim().length < 10 || newPost.trim().length > 250) {
      setPostError("Post must be between 10 and 250 characters.");
      return;
    }
    setPosting(true);
    const res = await createAnonymousPost(newPost, replyTo || undefined);
    setPosting(false);
    if (res.success) {
      setNewPost("");
      setReplyTo(null);
    } else {
      setPostError(res.error || "Failed to post.");
    }
  };

  // Handle reply expand/collapse
  const handleExpandReplies = async (postId: string) => {
    if (!expanded[postId]) {
      // Load replies
      const replyList = await getPostReplies(postId);
      setReplies((prev) => ({ ...prev, [postId]: replyList }));
    }
    setExpanded((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Handle reaction
  const handleReaction = async (postId: string, emoji: string) => {
    await togglePostReaction(postId, emoji);
  };

  // Handle delete
  const handleDelete = async (postId: string) => {
    await deleteAnonymousPost(postId);
  };

  // Render a single post (main or reply)
  const renderPost = (post: any, isReply = false) => (
    <div
      key={post.id}
      className={`mb-4 p-4 rounded-lg border ${isReply ? "ml-6 bg-gray-50" : "bg-white"}`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">
          {post.isOwnPost ? `${displayName} • ` : "Anonymous • "}
          {formatTimeAgo(post.createdAt)}
        </span>
        {post.isOwnPost && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Your post</span>
        )}
      </div>
      <div className="mb-2 text-sm break-words">
        {post.isDeleted ? (
          <span className="italic text-gray-400">[deleted]</span>
        ) : (
          post.content
        )}
      </div>
      
      {/* Mobile-optimized reaction and action system */}
      <div className="flex flex-col gap-2 mb-2">
        {/* Compact reaction display - shows all reactions in a space-efficient way */}
        {post.reactions.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {REACTIONS.map((emoji) => {
                const reactionsForEmoji = post.reactions.filter((r: any) => r.reactionEmoji === emoji);
                const count = reactionsForEmoji.length;
                const hasReacted = reactionsForEmoji.some((r: any) => r.isOwnReaction);
                
                if (count === 0) return null;
                
                return (
                  <div
                    key={emoji}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-sm ${
                      hasReacted 
                        ? "bg-blue-500 text-white ring-2 ring-blue-200" 
                        : "bg-gray-200 text-gray-700"
                    }`}
                    title={`${emoji} ${count} reaction${count > 1 ? 's' : ''}`}
                  >
                    {emoji}
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {post.reactions.length} reaction{post.reactions.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {/* Action buttons - clean, touch-friendly design */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Smart reaction button - opens emoji picker */}
            <div className="relative group">
              <button 
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-sm transition-all duration-200 border border-gray-200"
                title="React to this post"
              >
                👍
              </button>
              {/* Emoji picker popup */}
              <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-3 hidden group-hover:block z-20 min-w-[280px]">
                <div className="text-xs text-gray-500 mb-2 font-medium">React to this post</div>
                <div className="grid grid-cols-4 gap-2">
                  {REACTIONS.map((emoji) => {
                    const hasReacted = post.reactions.some((r: any) => r.reactionEmoji === emoji && r.isOwnReaction);
                    return (
                      <button
                        key={emoji}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                          hasReacted 
                            ? "bg-blue-500 text-white ring-2 ring-blue-200" 
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => handleReaction(post.id, emoji)}
                        title={hasReacted ? `Remove ${emoji}` : `React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Reply button */}
            <button
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
              onClick={() => setReplyTo(post.id)}
            >
              Reply
            </button>
            
            {/* Show replies button */}
            {post.replyCount > 0 && !isReply && (
              <button
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                onClick={() => handleExpandReplies(post.id)}
              >
                {expanded[post.id] === true ? "Hide" : `${post.replyCount} replies`}
              </button>
            )}
          </div>
          
          {/* Delete button - positioned on the right */}
          {post.isOwnPost && !post.isDeleted && (
            <button
              className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
              onClick={() => handleDelete(post.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {/* Replies */}
      {expanded[post.id] && replies[post.id] && (
        <div className="mt-2 border-l-2 border-gray-200 pl-4">
          {replies[post.id].length === 0 ? (
            <div className="text-xs text-gray-400">No replies yet.</div>
          ) : (
            replies[post.id].map((reply) => renderPost(reply, true))
          )}
        </div>
      )}
    </div>
  );

  return (
    <CardWrapper id="anonymous-chat" color="white">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">🔥🆕 Anonymous dorm chat - Share thoughts while you wait! 🧺💬</h2>
      {/* Post composer */}
      <div className="mb-4">
        {replyTo && (
          <div className="mb-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
            Replying to: {(() => {
              const parent = anonymousPosts.find((p) => p.id === replyTo);
              if (!parent) return "[unknown]";
              return parent.content.length > 50 ? parent.content.slice(0, 50) + "..." : parent.content;
            })()}
            <Button variant="ghost" size="sm" className="ml-2 px-2 py-0.5 text-xs" onClick={() => setReplyTo(null)}>
              Cancel
            </Button>
          </div>
        )}
                 <Textarea
           value={newPost}
           onChange={(e) => setNewPost(e.target.value)}
           placeholder={replyTo ? "Write a reply..." : "Share something on your mind...or Never talk! SSH!"}
           maxLength={replyTo !== null ? undefined : 250}
           className={postError ? "border-red-500" : ""}
           disabled={posting}
         />
        <div className="flex justify-between items-center mt-1">
                     <span className={`text-xs ${!replyTo && (newPost.length > 250 || (newPost.length > 0 && newPost.length < 10)) ? "text-red-500" : "text-gray-400"}`}>
             {replyTo ? `${newPost.length} chars` : `${newPost.length}/250`}
           </span>
           <Button 
             onClick={handlePost} 
             disabled={posting || (!replyTo && (newPost.length < 10 || newPost.length > 250)) || (replyTo && newPost.length === 0)}
             className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
           >
            Share it 📤
          </Button>
        </div>
        {postError && <div className="text-xs text-red-600 mt-1">{postError}</div>}
      </div>
      {/* Posts list */}
      <div>
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">Loading chat...</div>
        ) : anonymousPosts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No posts yet! Be the FIRST to share what's on your mind.</div>
        ) : (
          anonymousPosts.map((post) => renderPost(post))
        )}
      </div>
    </CardWrapper>
  );
}
"use client";
import BackendImage from "@/components/shared/BackendImage";
import Link from "next/link";


import { useAuthStore } from "@/lib/store/authStore";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { BiArrowBack, BiLeftArrow, BiRightArrow, BiSearch, BiSend, BiUser, BiReply, BiCheck, BiCheckDouble, BiRefresh, BiSmile } from "react-icons/bi";
import { GoSearch } from "react-icons/go";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { imageUploadMessenger } from "@/src/app/api/img-up/routes";
import { FaImage, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { Bell, BellRing, MessagesSquare } from "lucide-react";
import React from "react";
import PageHelpPanel from "@/components/shared/PageHelpPanel";
import { useTracking } from "@/lib/hooks/useTracking";

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: "😄",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
      "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️",
      "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
      "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓",
      "🤗", "🤔", "🫣", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬",
      "🫨", "🫠", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴",
      "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧",
      "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡",
      "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃"
    ]
  },
  {
    name: "Gestures",
    icon: "👍",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️",
      "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🫶",
      "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "❤️", "🧡", "💛",
      "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️",
      "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "🔥", "✨",
      "🌟", "⭐", "💥", "💯"
    ]
  },
  {
    name: "Animals",
    icon: "🐱",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐒", "🐔", "🐧", "🐦", "🐤",
      "🦅", "🦉", "🦤", "🦢", "🕊️", "🦚", "🦜", "🦆", "🐣", "🐥",
      "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜",
      "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🐙", "🦑", "🦞", "🦀",
      "🐬", "🐳", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🐪",
      "🦒", "🦘", "🐑", "🐐", "🦌", "🐕", "🐈", "🐇", "🐿️"
    ]
  },
  {
    name: "Food",
    icon: "🍔",
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
      "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
      "🥬", "🥒", "🌶️", "🥕", "🌽", "🥔", "🥐", "🥯", "🍞", "🥖",
      "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗",
      "🌭", "🍔", "🍟", "🍕", "🥪", "🌮", "🌯", "🥗", "🍜", "🍲",
      "🍛", "🍣", "🍱", "🍨", "🍩", "🍪", "🍫", "🍬", "🍯", "🥛",
      "☕", "🍵", "🥤", "🍺", "🍷", "🍾"
    ]
  },
  {
    name: "Sports",
    icon: "⚽",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓",
      "🏸", "🏒", "🏏", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋",
      "🛹", "🛼", "⛸️", "🏋️", "🤼", "🤸", "🏄", "🏊", "🚣", "🧗",
      "🚴", "🏆", "🥇", "🥈", "🥉", "🎟️", "🕹️", "🎲", "🎯", "🎳",
      "🎮", "♟️"
    ]
  }
];

const SUGGESTED_MESSAGES = [
  "Hi!",
  "Hello!",
];

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const SOCKET_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:5005";
const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

type Conversation = {
  isGroup?: boolean;
  groupName?: string;
  _id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantImages: Record<string, string | null>;
  lastMessage: string;
  updatedAt: string;
  unreadCount?: number;
  participantDetails?: Record<string, { name: string; image: string | null; plan: string }>;
};

type Message = {
  _id: string;
  conversationId: string;
  senderEmail: string;
  recipientEmail: string;
  message: string;
  img?: string;
  createdAt: string;
  isDeleted?: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
  senderImg?: string;
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
};

const isOnlyEmoji = (str: string) => {
  const trimmed = str.trim();
  if (!trimmed) return false;
  // Matches standard emojis, modifiers, and spaces
  const emojiRegex = /^[\p{Extended_Pictographic}\p{Emoji}\u200d\ufe0f\u200b\u200c\u200e\u200f\ufeff\s]+$/u;
  const hasNormalText = /[a-zA-Z0-9\u0980-\u09ff]/.test(trimmed); // check for English or Bengali word chars
  return emojiRegex.test(trimmed) && !hasNormalText && trimmed.length <= 12;
};

const SwipeableMessage = React.memo(function SwipeableMessage({
  msg,
  isMe,
  isOptimistic,
  isGroup,
  senderName,
  senderImg,
  onReply,
  onDelete,
  onImageClick
}: {
  msg: Message,
  isMe: boolean,
  isOptimistic: boolean,
  isGroup?: boolean,
  senderName?: string,
  senderImg?: string | null,
  onReply: (msg: Message) => void,
  onDelete: (id: string) => void,
  onImageClick: (img: string) => void
}) {
  const scrollToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-blue-900/40', 'transition-colors', 'duration-500');
      setTimeout(() => el.classList.remove('bg-blue-900/40'), 1000);
    }
  };

  const onlyEmoji = !msg.isDeleted && isOnlyEmoji(msg.message);

  return (
    <div
      id={`msg-${msg._id}`}
      className={`flex w-full animate-message items-center gap-2 mt-2 group ${isMe ? "justify-start flex-row-reverse" : "justify-start flex-row"}`}
    >
      <div
        className={`${onlyEmoji
          ? `w-fit text-4xl lg:text-5xl py-1 select-all ${isMe ? "text-right" : "text-left"}`
          : `w-fit min-w-[120px] max-w-[85%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[65%] rounded-2xl px-3.5 py-2.5 text-sm lg:text-[15px] font-hind relative flex flex-col overflow-hidden shadow-lg ${isMe
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-xs shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] border border-blue-400/20"
            : "bg-gray-800/80 backdrop-blur-md border border-white/10 border-t-white/20 border-l-white/20 text-gray-100 rounded-bl-xs shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]"
          }`
          } ${isOptimistic ? "opacity-70" : ""} animate-in slide-in-from-bottom-2 fade-in duration-300`}
      >
        {onlyEmoji ? (
          <div className="flex flex-col items-end w-full">
            <p className="min-w-0 select-all leading-normal py-1 text-white">{msg.message}</p>
            <div className="flex items-center gap-1 mt-0.5 justify-end select-none">
              <span className="text-[9px] font-medium tracking-wider text-gray-500">
                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
              </span>
              {isMe && !isOptimistic && (
                <span className="text-[14px] ml-0.5 flex items-center">
                  {msg.isRead ? (
                    <BiCheckDouble className="text-blue-400 drop-shadow-sm" />
                  ) : msg.isDelivered ? (
                    <BiCheckDouble className="text-blue-100/70" />
                  ) : (
                    <BiCheck className="text-blue-100/70" />
                  )}
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            
            {isGroup && !isMe && (
              <div className="flex items-center gap-1.5 mb-1 opacity-80">
                {senderImg ? (
                  <img src={senderImg} alt={senderName || "User"} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-blue-500/50 flex items-center justify-center text-[8px] text-white font-bold">
                    {(senderName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] font-bold text-gray-300">{senderName}</span>
              </div>
            )}
            {msg.replyTo && (
              <div
                className="reply-block w-0 min-w-full bg-black/20 rounded p-1.5 mb-1 cursor-pointer hover:bg-black/30 border-l-2 border-blue-400 overflow-hidden"
                onClick={() => scrollToMessage(msg.replyTo!.messageId)}
              >
                {/* <p className="text-[10px] font-bold text-blue-200">{msg.replyTo.senderName}</p> */}
                <p className="text-xs text-gray-300 truncate">{msg.replyTo.text}</p>
              </div>
            )}

            <p className={`min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed ${msg.isDeleted ? "italic opacity-70 text-sm" : "text-white"}`}>{msg.message}</p>

            {msg.img && !msg.isDeleted && (
              <div className="mt-2 relative">
                <img
                  src={msg.img}
                  alt="Attachment"
                  className="max-w-[200px] md:max-w-[280px] rounded-md cursor-pointer hover:opacity-90 transition-opacity border border-white/10"
                  onClick={() => onImageClick(msg.img!)}
                />
              </div>
            )}

            <div className={`flex items-center gap-1 justify-end`}>
              <span className={`text-[9px] font-medium tracking-wider ${isMe ? "text-blue-100/70" : "text-gray-500"}`}>
                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
              </span>
              {isMe && !isOptimistic && !msg.isDeleted && (
                <span className="text-[14px] ml-0.5 flex items-center">
                  {msg.isRead ? (
                    <BiCheckDouble className="text-blue-400 drop-shadow-sm" />
                  ) : msg.isDelivered ? (
                    <BiCheckDouble className="text-blue-100/70" />
                  ) : (
                    <BiCheck className="text-blue-100/70" />
                  )}
                </span>
              )}
              {isMe && isOptimistic && (
                <span className="text-[14px] ml-0.5 flex items-center">
                  <BiCheck className="text-blue-100/40" />
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {!msg.isDeleted && (
        <button
          onClick={() => onReply(msg)}
          className="opacity-40 md:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity p-1.5 rounded-full hover:bg-gray-800 shrink-0"
          title="Reply"
        >
          <BiReply size={18} />
        </button>
      )}
    </div>
  );
});

const MessageList = React.memo(({
  messages,
  user,
  hasMore,
  fetchingMore,
  fetchMoreMessages,
  handleReplyMessage,
  handleDeleteMessage,
  setLightboxImage,
  typingUsers,
  recipientEmail,
  participantDetails
}: {
  messages: Message[];
  user: any;
  hasMore: boolean;
  fetchingMore: boolean;
  fetchMoreMessages: () => void;
  handleReplyMessage: (msg: Message) => void;
  handleDeleteMessage: (id: string) => void;
  setLightboxImage: (img: string | null) => void;
  typingUsers: Record<string, boolean>;
  recipientEmail: string | undefined;
  participantDetails?: Record<string, { name: string; image: string | null; plan: string }>;
}) => {
  return (
    <>
      {hasMore && (
        <div className="w-full flex justify-center py-4">
          <button
            onClick={fetchMoreMessages}
            disabled={fetchingMore}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-full border border-gray-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {fetchingMore && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            {fetchingMore ? "Loading..." : "Load More Messages"}
          </button>
        </div>
      )}
      {messages.map((msg, index) => {
        const isMe = msg.senderEmail === user.email;
        const isOptimistic = msg._id.startsWith('temp-');

        const currentMessageDate = new Date(msg.createdAt).toLocaleDateString();
        const previousMessageDate = index > 0 ? new Date(messages[index - 1].createdAt).toLocaleDateString() : null;
        const showDateDivider = currentMessageDate !== previousMessageDate;

        let dateLabel = currentMessageDate;
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
        if (currentMessageDate === today) dateLabel = "Today";
        else if (currentMessageDate === yesterday) dateLabel = "Yesterday";
        else dateLabel = new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

        return (
          <div key={msg._id} className="w-full">
            {showDateDivider && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-800/60 text-gray-400 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-gray-700/50 backdrop-blur-sm shadow-sm">
                  {dateLabel}
                </span>
              </div>
            )}
            <SwipeableMessage
              msg={msg}
              
              isMe={isMe}
              isOptimistic={isOptimistic}
              isGroup={msg.recipientEmail === null}
              senderName={participantDetails?.[msg.senderEmail]?.name || msg.senderEmail.split('@')[0]}
              senderImg={msg.senderImg}
              onReply={handleReplyMessage}
              onDelete={handleDeleteMessage}
              onImageClick={setLightboxImage}
            />
          </div>
        );
      })}

      {recipientEmail && typingUsers[recipientEmail] && (
        <div className="flex w-full animate-message justify-start mt-2">
          <div className="bg-[#1f1f1f] border border-white/5 text-gray-400 rounded-md rounded-bl-none px-3 py-2 text-sm flex items-center gap-1.5 shadow-md">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </>
  );
});

function ChatWorkspace() {
  const { user, fetchUser } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchUserId, setSearchUserId] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [newGroupMemberId, setNewGroupMemberId] = useState("");
  const [addingNewMember, setAddingNewMember] = useState(false);
  const [stagedGroupMembers, setStagedGroupMembers] = useState<{ id: string, name: string, image?: string, isEmail?: boolean }[]>([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [manualGroupId, setManualGroupId] = useState("");


  const { trackFeatureVisit } = useTracking();

  // Track visit
  useEffect(() => {
    trackFeatureVisit("messenger");
  }, [trackFeatureVisit]);

  // Handle start chat from direct url parameter ?email=...
  useEffect(() => {
    const targetEmail = searchParams.get("email");
    if (targetEmail && user && !loadingChats) {
      const existingConv = conversations.find((c) =>
        c.participants.includes(targetEmail)
      );
      if (existingConv) {
        setActiveConversationId(existingConv._id);
        router.replace(`/messages?conversationId=${existingConv._id}`);
      } else {
        handleStartChatWithUser(targetEmail);
      }
    }
  }, [searchParams, user, loadingChats, conversations]);

  // Sync state with URL changes (e.g. Browser Back Button)
  useEffect(() => {
    const convId = searchParams.get("conversationId");
    setActiveConversationId(convId);
  }, [searchParams]);

  // Ensure Back Button always takes user to /messages first
  useEffect(() => {
    if (initialConversationId && typeof window !== "undefined") {
      const state = window.history.state;
      if (!state || !state.hasMessagesBase) {
        // Replace current state with /messages
        window.history.replaceState({ ...state, hasMessagesBase: true }, "", "/messages");
        // Push the conversation URL on top
        window.history.pushState({ ...state, hasMessagesBase: true }, "", `/messages?conversationId=${initialConversationId}`);
      }
    }
  }, [initialConversationId]);

  // New States for Enhancements
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  // Connection Reliability State
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Suggested Contacts State
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch suggested users on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user || user.showSuggestedContacts === false) return;
      setLoadingSuggestions(true);
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/suggestions`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter out logged in user
          const filtered = (Array.isArray(data) ? data : [])
            .filter((u: any) => u.email !== user.email);
          setSuggestedUsers(filtered);
        }
      } catch (err) {
        console.error("Failed to load suggested users", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [user]);

  // Memoized suggested users that excludes those we are already chatting with, sliced to 10
  const filteredSuggestedUsers = useMemo(() => {
    const activeEmails = new Set(
      conversations.flatMap((c) => 
        c.participants.filter((p) => p !== user?.email)
      )
    );
    return suggestedUsers
      .filter((u) => !activeEmails.has(u.email))
      .slice(0, 10);
  }, [suggestedUsers, conversations, user?.email]);

  const chatPartners = useMemo(() => {
    if (!suggestedUsers) return [];
    const partnerEmails = new Set<string>();
    conversations.forEach(c => {
      if (!c.isGroup) {
        c.participants.forEach(p => {
          if (p !== user?.email) partnerEmails.add(p);
        });
      }
    });
    return suggestedUsers.filter(u => partnerEmails.has(u.email));
  }, [suggestedUsers, conversations, user]);

  const handleAddMember = (id: string) => {
    const trimmedId = id.trim();
    if (!trimmedId) return;
    if (selectedGroupMembers.includes(trimmedId)) {
      toast.error("User is already added to the group!");
      return;
    }
    if (selectedGroupMembers.length >= 9) {
      toast.error("Maximum 9 members can be added (Total group size 10)");
      return;
    }
    setSelectedGroupMembers(prev => [...prev, trimmedId]);
    setManualGroupId("");
  };

  const handleRemoveMember = (id: string) => {
    setSelectedGroupMembers(prev => prev.filter(memberId => memberId !== id));
  };

  const handleStageMember = (e?: React.FormEvent, selectedUser?: { id: string, name: string, image?: string, isEmail?: boolean }) => {
    if (e) e.preventDefault();
    const activeConv = conversations.find(c => c._id === activeConversationId);
    if (!activeConv || !activeConv.isGroup) return;

    if (activeConv.participants.length + stagedGroupMembers.length >= 10) {
      toast.error("Group already has the maximum of 10 members");
      return;
    }

    if (selectedUser) {
      if (stagedGroupMembers.some(m => m.id === selectedUser.id)) {
        toast.error("User is already selected");
        return;
      }
      setStagedGroupMembers([...stagedGroupMembers, selectedUser]);
    } else {
      const trimmedId = newGroupMemberId.trim();
      if (!trimmedId) {
        toast.error("Please enter a User ID");
        return;
      }
      if (stagedGroupMembers.some(m => m.id === trimmedId)) {
        toast.error("User is already selected");
        return;
      }
      setStagedGroupMembers([...stagedGroupMembers, { id: trimmedId, name: "User " + trimmedId.substring(0, 5) }]);
      setNewGroupMemberId("");
    }
  };

  const handleRemoveStagedMember = (id: string) => {
    setStagedGroupMembers(stagedGroupMembers.filter(m => m.id !== id));
  };

  const handleSaveGroupMembers = async () => {
    if (stagedGroupMembers.length === 0) return;
    
    setAddingNewMember(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const memberIds = stagedGroupMembers.filter(m => !m.isEmail).map(m => m.id);
      const memberEmails = stagedGroupMembers.filter(m => m.isEmail).map(m => m.id);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/group/${activeConversationId}/add`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberIds, memberEmails }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Members added successfully");
        setStagedGroupMembers([]);
        
        setConversations(prev => prev.map(c => {
          if (c._id === data._id) {
            return {
              ...c,
              participants: data.participants,
              participantNames: data.participantNames,
              participantImages: data.participantImages,
              participantDetails: data.participantDetails || c.participantDetails
            };
          }
          return c;
        }));
      } else {
        toast.error(data.message || "Failed to add members");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error adding members");
    } finally {
      setAddingNewMember(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedGroupMembers.length === 0) {
      toast.error("Please add at least one member");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupName: groupName.trim(), memberIds: selectedGroupMembers }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Group created successfully");
        setShowGroupModal(false);
        setGroupName("");
        setSelectedGroupMembers([]);
        setConversations(prev => [data, ...prev]);
        setActiveConversationId(data._id);
        router.replace(`/messages?conversationId=${data._id}`);
      } else {
        toast.error(data.message || "Failed to create group");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error creating group");
    }
  };

  const handleStartChatWithUser = async (recipientEmail: string) => {
    setSearchingUser(true);
    const token = localStorage.getItem("auth_token");
    try {
      const convRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientEmail }),
      });

      if (convRes.ok) {
        const conversation = await convRes.json();
        setConversations(prev => {
          if (!prev.some(c => c._id === conversation._id)) {
            return [conversation, ...prev];
          }
          return prev;
        });
        setActiveConversationId(conversation._id);
        router.replace(`/messages?conversationId=${conversation._id}`);
      } else {
        toast.error("Failed to connect with user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting with user");
    } finally {
      setSearchingUser(false);
    }
  };

  const handleSendSuggestedMessage = async (msgText: string) => {
    if (!activeConversationId || !user) return;

    const tempId = `temp-${Date.now()}`;
    const replyToPayload = replyingToMessage ? {
      messageId: replyingToMessage._id,
      text: replyingToMessage.message || "📷 Photo",
      senderName: replyingToMessage.senderEmail === user.email
        ? "You"
        : (activeConversation?.participantDetails?.[replyingToMessage.senderEmail]?.name || replyingToMessage.senderEmail.split('@')[0])
    } : undefined;

    const optimisticMsg: Message = {
      _id: tempId,
      conversationId: activeConversationId,
      senderEmail: user.email,
      recipientEmail: activeConversation?.isGroup ? "" : (recipient?.email || ""),
      message: msgText,
      senderImg: user.img,
      replyTo: replyToPayload,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyingToMessage(null);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadScrollCount(0);
    }, 50);

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: msgText,
          senderImg: user.img,
          replyTo: replyToPayload,
        }),
      });

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || "Failed to send message");
      } else {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => (m._id === tempId ? data : m)));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending message");
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  // New States for Scroll Management
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadScrollCount, setUnreadScrollCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New States for Image Upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

  // Emoji States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

  // New States for Push Notifications
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [pushProcessing, setPushProcessing] = useState(false);

  useEffect(() => {
    const checkPushStatus = async () => {
      if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
        if (Notification.permission === "granted") {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              setShowPushBanner(true);
            } else {
              setShowPushBanner(false);
            }
          } catch (e) {
            setShowPushBanner(true);
          }
        } else {
          // 'default' or 'denied'
          setShowPushBanner(true);
        }
      }
    };
    checkPushStatus();
  }, []);

  const handleEnablePush = async () => {
    if (!("Notification" in window)) return;
    setPushProcessing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!VAPID_KEY) throw new Error("VAPID missing");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });

        await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(subscription),
        });
        toast.success("Push notifications enabled!");
        setShowPushBanner(false);
      } else {
        toast.error("Notification permission denied. You can enable it in your browser settings.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not enable notifications.");
    } finally {
      setPushProcessing(false);
    }
  };

  const handleReplyMessage = useCallback((msg: Message) => {
    setReplyingToMessage(msg);
    if (!imagePreview) {
      inputRef.current?.focus();
    }
  }, [imagePreview]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserId.trim() || searchingUser) return;

    setSearchingUser(true);
    try {
      // 1. Fetch user by ID
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/${searchUserId.trim()}`);

      if (!userRes.ok) {
        toast.error("User not found");
        setSearchingUser(false);
        return;
      }

      const userData = await userRes.json();

      if (!userData || !userData.email) {
        toast.error("Invalid user data");
        setSearchingUser(false);
        return;
      }

      // 2. Create or Get Conversation
      const token = localStorage.getItem("auth_token");
      const convRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientEmail: userData.email }),
      });

      if (!convRes.ok) {
        const errData = await convRes.json().catch(() => ({}));
        toast.error(errData.message || "Failed to start conversation");
        setSearchingUser(false);
        return;
      }

      const conversation = await convRes.json();

      // Update conversations list if not present
      setConversations(prev => {
        if (!prev.some(c => c._id === conversation._id)) {
          return [conversation, ...prev];
        }
        return prev;
      });

      setActiveConversationId(conversation._id);
      router.replace(`/messages?conversationId=${conversation._id}`);
      setSearchUserId("");

    } catch (err) {
      console.error(err);
      toast.error("An error occurred while searching");
    } finally {
      setSearchingUser(false);
    }
  };

  // Authenticate user on mount
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Join personal user room on socket connection
  useEffect(() => {
    if (user?.email) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        socket.emit("joinUserRoom", { token });
      }
    }
  }, [user]);

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchConversations();
  }, [user]);

  // Function to mark a conversation as read
  const markConversationAsRead = async (convId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // Optimistically clear local badge
    setConversations((prev) =>
      prev.map((c) => (c._id === convId ? { ...c, unreadCount: 0 } : c))
    );

    try {
      await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/read/${convId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationId || !user) return;
      setLoadingMessages(true);
      setPage(1);
      setHasMore(true);
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/messages/${activeConversationId}?page=1&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          if (data.length < 10) setHasMore(false);
          // Mark as read when successfully opened
          markConversationAsRead(activeConversationId);

          // Force scroll to bottom on initial load
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
            setUnreadScrollCount(0);
          }, 100);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeConversationId, user, refreshTrigger]);

  // Handle Loading More Messages
  const fetchMoreMessages = async () => {
    if (!activeConversationId || !hasMore || fetchingMore) return;
    setFetchingMore(true);
    const nextPage = page + 1;
    const token = localStorage.getItem("auth_token");

    // Save current scroll height to maintain position
    const scrollContainer = chatContainerRef.current;
    const previousScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/messages/${activeConversationId}?page=${nextPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMessages(prev => {
            // Filter out any duplicate messages to prevent UI glitches during live chatting + scrolling
            const newMessages = data.filter((newMsg: Message) => !prev.some(p => p._id === newMsg._id));
            return [...newMessages, ...prev];
          });
          setPage(nextPage);
          if (data.length < 10) setHasMore(false);

          // Restore scroll position so it doesn't jump to top
          setTimeout(() => {
            if (scrollContainer) {
              scrollContainer.scrollTop = scrollContainer.scrollHeight - previousScrollHeight;
            }
          }, 0);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error fetching more messages:", err);
    } finally {
      setFetchingMore(false);
    }
  };

  // Removed IntersectionObserver in favor of manual Load More button

  // Handle incoming live socket messages and read receipts
  useEffect(() => {
    const handleNewMessage = (msg: Message) => {
      // If we receive a message that is not ours, emit message_delivered immediately
      if (user && msg.senderEmail !== user.email) {
        socket.emit("message_delivered", {
          messageId: msg._id,
          senderEmail: msg.senderEmail,
          conversationId: msg.conversationId
        });
      }

      // If we are actively viewing this conversation, mark it as read immediately
      if (msg.conversationId === activeConversationId && msg.recipientEmail === user?.email) {
        markConversationAsRead(activeConversationId);
      }

      // Update conversations sidebar values
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === msg.conversationId);
        if (index === -1) {
          // If conversation isn't listed, trigger reload
          const token = localStorage.getItem("auth_token");
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => setConversations(data))
            .catch((err) => console.error(err));
          return prev;
        }

        const updated = [...prev];
        const isUnread = msg.conversationId !== activeConversationId && msg.recipientEmail === user?.email;
        updated[index] = {
          ...updated[index],
          lastMessage: msg.message,
          updatedAt: new Date().toISOString(),
          unreadCount: isUnread ? (updated[index].unreadCount || 0) + 1 : updated[index].unreadCount,
        };
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      if (msg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;

          const isFromMe = user && msg.senderEmail === user.email;
          if (isFromMe) {
            const tempIndex = prev.findIndex((m) => m._id.startsWith("temp-") && m.message === msg.message);
            if (tempIndex !== -1) {
              const updated = [...prev];
              updated[tempIndex] = msg;
              return updated;
            }
          }
          return [...prev, msg];
        });

        // Auto scroll if near bottom when receiving new message
        setTimeout(() => {
          if (!chatContainerRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
          if (isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setUnreadScrollCount(0);
          } else if (msg.senderEmail !== user?.email) {
            setUnreadScrollCount(prev => prev + 1);
          }
        }, 100);
      }
    };

    const handleMessagesRead = (data: { conversationId: string }) => {
      // Update conversations sidebar unread count
      setConversations((prev) =>
        prev.map((c) => (c._id === data.conversationId ? { ...c, unreadCount: 0 } : c))
      );
      // If this is the active conversation, update all messages to isRead: true
      if (activeConversationId === data.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.recipientEmail !== user?.email ? { ...m, isRead: true, isDelivered: true } : m))
        );
      }
    };

    const handleMessageDelivered = (data: { messageId: string; conversationId: string }) => {
      if (activeConversationId === data.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === data.messageId ? { ...m, isDelivered: true } : m))
        );
      }
    };

    const handleUserStatus = (data: { email: string; isOnline: boolean }) => {
      setOnlineUsers(prev => {
        if (data.isOnline && !prev.includes(data.email)) return [...prev, data.email];
        if (!data.isOnline) return prev.filter(e => e !== data.email);
        return prev;
      });
    };

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    const handleTyping = (data: { senderEmail: string; conversationId: string }) => {
      if (data.conversationId === activeConversationId) {
        setTypingUsers(prev => ({ ...prev, [data.senderEmail]: true }));
      }
    };

    const handleStopTyping = (data: { senderEmail: string; conversationId: string }) => {
      if (data.conversationId === activeConversationId) {
        setTypingUsers(prev => ({ ...prev, [data.senderEmail]: false }));
      }
    };

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, isDeleted: true, message: "This message was deleted" } : m));
    };

    const handleConnect = () => {
      setIsReconnecting(false);
      if (activeConversationId) {
        const token = localStorage.getItem("auth_token");
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/messages/${activeConversationId}?page=1&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setMessages(prev => {
                const missingMessages = data.filter(newMsg => !prev.some(p => p._id === newMsg._id));
                if (missingMessages.length > 0) {
                  const updated = [...prev, ...missingMessages];
                  return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                }
                return prev;
              });
            }
          })
          .catch(err => console.error("Sync error:", err));
      }
    };

    const handleDisconnect = () => setIsReconnecting(true);

    // Request initial online users list on mount/auth
    socket.emit("get_online_users");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("user_status", handleUserStatus);
    socket.on("online_users", handleOnlineUsers);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("user_status", handleUserStatus);
      socket.off("online_users", handleOnlineUsers);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [activeConversationId, user, markConversationAsRead]);

  // Scroll Event Listener to track if user is at bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

      setShowScrollButton(!isNearBottom);
      if (isNearBottom) {
        setUnreadScrollCount(0); // clear unread count when they reach bottom
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, []);



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeConversationId || !user || isUploading) return;

    const messageText = newMessage.trim();
    const imageToSend = selectedImage;

    setNewMessage("");
    setSelectedImage(null);
    setImagePreview(null);
    setUploadProgress(0);

    let uploadedImageUrl = null;

    if (imageToSend) {
      setIsUploading(true);
      try {
        uploadedImageUrl = await imageUploadMessenger(imageToSend, (progress) => {
          setUploadProgress(progress);
        });
      } catch (error) {
        console.error("Image upload failed", error);
        toast.error("Failed to upload image. Please try again.");
        setIsUploading(false);
        setNewMessage(messageText);
        setSelectedImage(imageToSend);
        setImagePreview(URL.createObjectURL(imageToSend));
        return;
      }
      setIsUploading(false);
    }

    const tempId = `temp-${Date.now()}`;
    const replyToPayload = replyingToMessage ? {
      messageId: replyingToMessage._id,
      text: replyingToMessage.message || "📷 Photo",
      senderName: replyingToMessage.senderEmail === user.email
        ? "You"
        : (activeConversation?.participantDetails?.[replyingToMessage.senderEmail]?.name || replyingToMessage.senderEmail.split('@')[0])
    } : undefined;

    const optimisticMsg: Message = {
      _id: tempId,
      conversationId: activeConversationId,
      senderEmail: user.email,
      recipientEmail: recipient?.email || "",
      message: messageText,
      img: uploadedImageUrl || undefined,
      senderImg: user.img,
      replyTo: replyToPayload,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyingToMessage(null); // Clear reply state instantly for UI

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadScrollCount(0);

      // Restore focus to keep keyboard open on mobile and cursor active on desktop
      // Only refocus if we aren't waiting for an image upload
      if (!imageToSend) {
        inputRef.current?.focus();
      }
    }, 50);

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: messageText,
          img: uploadedImageUrl,
          senderImg: user.img,
          replyTo: replyToPayload,
        }),
      });

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || "Failed to send message");
        setNewMessage(messageText);
      } else {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => (m._id === tempId ? data : m)));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending message");
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setNewMessage(messageText);
    }
  };

  const handleSendEmojiDirectly = async (emoji: string) => {
    if (!activeConversationId || !user) return;

    const messageText = emoji;

    const tempId = `temp-${Date.now()}`;
    const replyToPayload = replyingToMessage ? {
      messageId: replyingToMessage._id,
      text: replyingToMessage.message || "📷 Photo",
      senderName: replyingToMessage.senderEmail === user.email
        ? "You"
        : (activeConversation?.participantDetails?.[replyingToMessage.senderEmail]?.name || replyingToMessage.senderEmail.split('@')[0])
    } : undefined;

    const optimisticMsg: Message = {
      _id: tempId,
      conversationId: activeConversationId,
      senderEmail: user.email,
      recipientEmail: recipient?.email || "",
      message: messageText,
      senderImg: user.img,
      replyTo: replyToPayload,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyingToMessage(null);
    setShowEmojiPicker(false);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadScrollCount(0);
    }, 50);

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: messageText,
          senderImg: user.img,
          replyTo: replyToPayload,
        }),
      });

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || "Failed to send emoji");
      } else {
        const data = await res.json();
        setMessages((prev) => prev.map((m) => (m._id === tempId ? data : m)));
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending emoji");
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!activeConversationId) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        toast.error("Failed to delete message");
      } else {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, message: "This message was deleted" } : m));
      }
    } catch (err) {
      toast.error("Error deleting message");
    }
  }, [activeConversationId]);

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Auto-resize the textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    if (!activeConversationId || !recipient?.email) return;

    socket.emit("typing", { recipientEmail: recipient.email, conversationId: activeConversationId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { recipientEmail: recipient.email, conversationId: activeConversationId });
    }, 1500);
  };

  const getRecipientDetails = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return {
        name: conversation.groupName || "Group",
        image: null,
        plan: "normal",
        email: "group"
      };
    }
    const me = user?.email || "";
    const recipientEmail = conversation.participants.find((p) => p !== me) || "";

    if (conversation.participantDetails && conversation.participantDetails[recipientEmail]) {
      const details = conversation.participantDetails[recipientEmail];
      return { name: details.name, email: recipientEmail, image: details.image, plan: details.plan };
    }

    const name = conversation.participantNames?.[recipientEmail] || recipientEmail.split("@")[0];
    const image = conversation.participantImages?.[recipientEmail] || null;
    return { name, email: recipientEmail, image, plan: "normal" };
  };

  const activeConversation = conversations.find((c) => c._id === activeConversationId);
  const recipient = activeConversation ? getRecipientDetails(activeConversation) : null;

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400">Please login to access your messages.</p>
        <Button onClick={() => router.push("/login")}>Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-4 md:py-6 h-[calc(100vh-200px)] min-h-[500px] flex flex-col gap-4">
      {/* Push Notification Banner */}
      {showPushBanner && (
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <Bell size={18} className="shrink-0" />
            <span className="text-sm font-medium flex items-center inter gap-1">
              মেসেজের নোটিফিকেশন চালু করুন
            </span>
          </div>

          <button
            onClick={handleEnablePush}
            disabled={pushProcessing}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-70"
            aria-label="Enable Push Notifications"
            title="Enable Push Notifications"
          >
            {pushProcessing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <BellRing size={18} />
            )}
          </button>
        </div>
      )}

      <div className="flex flex-1 w-full min-h-0 border border-white/5 rounded-2xl overflow-hidden bg-gradient-to-br from-[#09090b]/40 via-[#0a0a0a]/40 to-[#121214]/60 backdrop-blur-2xl shadow-2xl">

        {/* Sidebar - list of chats */}
        <div className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-black/10 relative z-10 ${activeConversationId ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-white/5 flex flex-col gap-4">
            <h1 className="text-lg font-bold text-white font-parkinsans">Conversations</h1>

            
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => setShowGroupModal(true)}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold py-1.5 rounded-lg border border-blue-500/30 transition-colors text-sm"
              >
                + Create Group
              </button>
            </div>

            {showGroupModal && (
              <div className="absolute top-0 left-0 w-full h-full bg-gray-950 z-50 p-4 flex flex-col justify-start overflow-y-auto">
                <h3 className="text-white text-lg font-bold mb-4 text-center">Create Group</h3>
                
                <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g. My Awesome Group"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Add by User ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste User ID here..."
                        value={manualGroupId}
                        onChange={(e) => setManualGroupId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMember(manualGroupId);
                          }
                        }}
                        className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleAddMember(manualGroupId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-semibold text-sm transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {selectedGroupMembers.length > 0 && (
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Selected Members ({selectedGroupMembers.length}/9)</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedGroupMembers.map(id => {
                          const suggestedUser = chatPartners.find(u => u._id === id);
                          return (
                            <div key={id} className="flex items-center gap-1.5 bg-blue-900/40 border border-blue-500/50 text-blue-200 px-2.5 py-1.5 rounded-full text-xs font-medium">
                              <span>{suggestedUser ? suggestedUser.name : id.slice(0,8)+'...'}</span>
                              <button type="button" onClick={() => handleRemoveMember(id)} className="text-blue-400 hover:text-white ml-1 font-bold">×</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {chatPartners.length > 0 && (
                    <div className="mt-2">
                      <label className="text-gray-400 text-xs mb-2 block">Suggestions (People you talked to)</label>
                      <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {chatPartners.map(partner => (
                          <div key={partner._id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg border border-gray-800/50">
                            <div className="flex items-center gap-2">
                              {partner.img ? (
                                <img src={partner.img} alt={partner.name} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-xs">{partner.name.charAt(0).toUpperCase()}</div>
                              )}
                              <span className="text-gray-200 text-sm font-medium">{partner.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleAddMember(partner._id)}
                              disabled={selectedGroupMembers.includes(partner._id)}
                              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${selectedGroupMembers.includes(partner._id) ? "bg-gray-800 text-gray-500" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
                            >
                              {selectedGroupMembers.includes(partner._id) ? "Added" : "Add"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
                    <button type="button" onClick={() => {setShowGroupModal(false); setSelectedGroupMembers([]); setGroupName("");}} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg font-semibold transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors">Create Group</button>
                  </div>
                </form>
              </div>
            )}
            <form onSubmit={handleSearchUser} className="relative">
              <input
                type="text"
                placeholder="Search by User ID..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-800 rounded-lg pl-3 pr-9 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={searchingUser || !searchUserId.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                {searchingUser ? (
                  <div className="w-3.5 h-3.5 border-[1.5px] border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BiSearch size={16} />
                )}
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto  overflow-x-hidden whitespace-nowrap divide-y divide-gray-900/60">
            {/* Suggested Users Row */}
            {filteredSuggestedUsers.length > 0 && user?.showSuggestedContacts !== false && (
              <div className="p-4 flex flex-col gap-2 shrink-0 border-b border-white/5 bg-white/[0.01]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-orbitron">Suggested Contacts</h3>
                <div className="flex gap-3 overflow-x-auto pb-1.5 chat-scroll scrollbar-hide">
                  {filteredSuggestedUsers.map((sUser) => (
                    <button
                      key={sUser._id}
                      onClick={() => handleStartChatWithUser(sUser.email)}
                      className="flex flex-col items-center gap-1 min-w-[56px] cursor-pointer group shrink-0"
                      title={`Chat with ${sUser.name}`}
                    >
                      <div className="relative">
                        {sUser.img ? (
                          <BackendImage
                            src={sUser.img}
                            alt={sUser.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-800 group-hover:border-blue-500 transition-colors"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-semibold border border-gray-800 group-hover:border-blue-500 transition-colors">
                            {sUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {onlineUsers.includes(sUser.email) && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 group-hover:text-white transition-colors truncate max-w-[56px] font-parkinsans leading-none mt-0.5">
                        {sUser.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingChats ? (
              <div className="p-4 text-center text-gray-500 text-sm">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm font-hind">No conversations active.</div>
            ) : (
              conversations.map((chat) => {
                const details = getRecipientDetails(chat);
                const isActive = chat._id === activeConversationId;
                return (
                  <button
                    key={chat._id}
                    onClick={() => {
                      setActiveConversationId(chat._id);
                      router.push(`/messages?conversationId=${chat._id}`);
                    }}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-all duration-300 cursor-pointer hover:scale-[1.01] ${isActive ? "bg-blue-600/15 border-l-4 border-blue-500 shadow-[inset_0_0_30px_rgba(37,99,235,0.1)]" : chat.unreadCount && chat.unreadCount > 0 ? "bg-blue-900/10 hover:bg-blue-900/20 border-l-4 border-blue-500/50" : "hover:bg-white/[0.02] border-l-4 border-transparent"
                      }`}
                  >
                    <div className="relative shrink-0">
                      {details.image ? (
                        <BackendImage
                          src={details.image}
                          alt={details.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-semibold border border-gray-800">
                          {details.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {onlineUsers.includes(details.email) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full shadow-sm z-10"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className={`text-sm truncate font-parkinsans ${chat.unreadCount && chat.unreadCount > 0 ? "text-white font-bold" : "text-gray-200 font-medium"}`}>{details.name}</p>
                          {details.plan === "premium" && (
                            <svg width="12" height="12" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                              <defs><radialGradient id="blue_small"><stop offset="0%" stopColor="#4dabf7" /><stop offset="60%" stopColor="#006aff" /><stop offset="100%" stopColor="#0050cc" /></radialGradient></defs>
                              <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue_small)" />
                              <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                            </svg>
                          )}
                          {details.plan === "owner" && (
                            <svg width="12" height="12" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                              <defs><radialGradient id="gold_small"><stop offset="0%" stopColor="#ffdd80" /><stop offset="60%" stopColor="#ffb516" /><stop offset="100%" stopColor="#e89f00" /></radialGradient></defs>
                              <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold_small)" />
                              <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[10px] flex-shrink-0 ${chat.unreadCount && chat.unreadCount > 0 ? "text-blue-400 font-semibold" : "text-gray-500"}`}>
                          {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-xs truncate font-hind ${chat.unreadCount && chat.unreadCount > 0 ? "text-blue-100 font-medium w-[85%]" : "text-gray-400"}`}>{chat.lastMessage || "No messages yet"}</p>
                        {chat.unreadCount && chat.unreadCount > 0 ? (
                          <div className="bg-blue-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Pane */}
        <div className={`flex-1 flex flex-col bg-transparent relative ${activeConversationId ? "flex" : "hidden md:flex"}`}>
          {activeConversation && recipient ? (
            <>
{(!showGroupInfoModal || !activeConversation?.isGroup) && (
                <>
              {/* Header */}
              <div className="p-2 lg:p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-black/20 backdrop-blur-xl relative z-20 shadow-md">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveConversationId(null);
                      router.replace("/messages");
                    }}
                    className="md:hidden text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-full"
                  >
                    <BiArrowBack size={20} />
                  </button>

                  <div 
                    onClick={() => {
                      if (activeConversation?.isGroup) {
                        setShowGroupInfoModal(true);
                      } else {
                        router.push(`/user/${recipient.email}`);
                      }
                    }} 
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <div className="relative">
                      {recipient.image ? (
                        <BackendImage
                          src={recipient.image}
                          alt={recipient.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-medium">
                          {recipient.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {onlineUsers.includes(recipient.email) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full shadow-sm z-10"></span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <h2 className="text-sm md:text-base font-medium text-white font-parkinsans flex items-center gap-1.5">{recipient.name}
                        {recipient.plan === "premium" && (
                          <svg width="14" height="14" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                            <defs><radialGradient id="blue_header"><stop offset="0%" stopColor="#4dabf7" /><stop offset="60%" stopColor="#006aff" /><stop offset="100%" stopColor="#0050cc" /></radialGradient></defs>
                            <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue_header)" />
                            <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                          </svg>
                        )}
                        {recipient.plan === "owner" && (
                          <svg width="14" height="14" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                            <defs><radialGradient id="gold_header"><stop offset="0%" stopColor="#ffdd80" /><stop offset="60%" stopColor="#ffb516" /><stop offset="100%" stopColor="#e89f00" /></radialGradient></defs>
                            <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold_header)" />
                            <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                          </svg>
                        )}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-hind">
                          {onlineUsers.includes(recipient.email) ? "Online" : "Offline"}
                        </span>
                        {isReconnecting && (
                          <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1.5 border border-orange-500/20 shadow-sm animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Reconnecting...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reload Button */}
                <button
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  disabled={loadingMessages}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                  title="Reload Messages"
                >
                  <BiRefresh size={22} className={loadingMessages ? "animate-spin text-blue-400" : ""} />
                </button>
              </div>
                </>
              )}

{showGroupInfoModal && activeConversation?.isGroup ? (
                              <div className="w-full max-w-[90vw] overflow-y-auto p-4 md:p-6 flex flex-col justify-start bg-gray-950 border-r border-white/10 z-50 animate-in fade-in duration-200 h-full">
                  <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4 gap-4">
                    <h3 className="text-white text-lg font-bold font-orbitron truncate flex-1">{activeConversation.groupName}</h3>
                    <button onClick={() => setShowGroupInfoModal(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors shrink-0">
                      <BiArrowBack size={20} />
                    </button>
                  </div>
                  
                  <div className="mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800 w-full min-w-0">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 font-parkinsans flex justify-between">
                      <span>Group Members</span>
                      <span className="text-blue-400">{activeConversation.participants.length}/10</span>
                    </h4>
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {activeConversation.participants.map(memberId => {
                        const isMe = memberId === user?.email;
                        const details = activeConversation.participantDetails?.[memberId] || { name: memberId, image: "" };
                        return (
                          <div key={memberId} className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-lg transition-colors overflow-hidden group cursor-pointer" onClick={() => {
                            if (!isMe) {
                              setShowGroupInfoModal(false);
                              handleStartChatWithUser(memberId);
                            }
                          }}>
                            <div className="flex items-center gap-3 w-full min-w-0">
                              {details.image ? (
                                <img src={details.image} alt={details.name} className="w-10 h-10 rounded-full object-cover border border-gray-700 shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-semibold border border-gray-700 shrink-0">
                                  {details.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-white text-sm font-medium truncate w-full">
                                  {details.name} {isMe && <span className="text-blue-400 text-xs ml-1">(You)</span>}
                                </span>
                                
                              </div>
                            </div>
                            {!isMe && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowGroupInfoModal(false);
                                  handleStartChatWithUser(memberId);
                                }}
                                className="opacity-100 transition-opacity text-blue-400 hover:text-white p-1.5 rounded-full hover:bg-blue-600/30 ml-2 shrink-0"
                                title="Message"
                              >
                                <MessagesSquare size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {activeConversation.participants.length < 10 && (
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-4 w-full min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-gray-300 font-parkinsans">Add Members</h4>
                        <span className="text-xs text-gray-500">{(activeConversation.participants.length + stagedGroupMembers.length)}/10 Members</span>
                      </div>

                      {/* Staged Members */}
                      {stagedGroupMembers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-black/20 rounded-lg border border-gray-800/50">
                          {stagedGroupMembers.map(m => (
                            <div key={m.id} className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 px-2 py-1.5 rounded-full text-xs">
                              {m.image ? (
                                <img src={m.image} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-blue-500/50 flex items-center justify-center text-white font-bold">{m.name.charAt(0).toUpperCase()}</div>
                              )}
                              <span className="text-blue-100 max-w-[80px] truncate">{m.name}</span>
                              <button type="button" onClick={() => handleRemoveStagedMember(m.id)} className="text-blue-400 hover:text-white p-0.5"><FaTimes size={10} /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add by ID */}
                      <form onSubmit={(e) => handleStageMember(e)} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter User ID..."
                          value={newGroupMemberId}
                          onChange={(e) => setNewGroupMemberId(e.target.value)}
                          className="flex-1 min-w-0 bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                        />
                        <button 
                          type="submit" 
                          disabled={!newGroupMemberId.trim() || activeConversation.participants.length + stagedGroupMembers.length >= 10}
                          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 rounded-lg font-semibold text-sm transition-colors shrink-0"
                        >
                          Select
                        </button>
                      </form>

                      {/* Suggestions */}
                      <div className="mt-2 w-full min-w-0">
                        <h5 className="text-xs text-gray-500 mb-2 font-medium">Suggestions</h5>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {conversations
                            .filter(c => !c.isGroup && c.participants.length === 2 && !activeConversation.participants.includes(c.participants.find(p => p !== user?.email) || ""))
                            .filter(c => {
                               const otherP = c.participants.find(p => p !== user?.email) || "";
                               return !stagedGroupMembers.some(m => m.id === otherP);
                            })
                            .map(c => {
                               const otherP = c.participants.find(p => p !== user?.email) || "";
                               const details = c.participantDetails?.[otherP];
                               if (!details) return null;
                               return (
                                 <button 
                                   key={otherP}
                                   type="button"
                                   onClick={() => handleStageMember(undefined, { id: otherP, name: details.name, image: details.image || undefined, isEmail: true })}
                                   className="flex items-center gap-2 bg-gray-950 border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-full transition-colors shrink-0"
                                 >
                                   {details.image ? (
                                      <img src={details.image} alt={details.name} className="w-5 h-5 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">{details.name.charAt(0).toUpperCase()}</div>
                                    )}
                                   <span className="text-sm text-gray-300 truncate max-w-[100px]">{details.name}</span>
                                 </button>
                               );
                            })}
                        </div>
                      </div>

                      {/* Save Button */}
                      {stagedGroupMembers.length > 0 && (
                        <button 
                          type="button"
                          onClick={handleSaveGroupMembers}
                          disabled={addingNewMember}
                          className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                        >
                          {addingNewMember ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : "Save New Members"}
                        </button>
                      )}
                    </div>
                  )}
                  {activeConversation.participants.length >= 10 && (
                    <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mt-2 text-orange-400 text-sm font-medium">
                      This group has reached its maximum capacity of 10 members.
                    </div>
                  )}
                </div>
              ) : (
                <>
              {/* Messages area */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-3 chat-scroll bg-transparent">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-500 text-sm font-hind">
                    <div className="text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mb-4 border border-gray-800/50">
                        <BiSend size={24} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400">No messages yet.</p>
                      <p className="text-gray-600 text-xs mt-1">Send a message to start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
							<MessageList
                      messages={messages}
                      user={user}
                      hasMore={hasMore}
                      fetchingMore={fetchingMore}
                      fetchMoreMessages={fetchMoreMessages}
                      handleReplyMessage={handleReplyMessage}
                      handleDeleteMessage={handleDeleteMessage}
                      setLightboxImage={setLightboxImage}
                      typingUsers={typingUsers}
                      recipientEmail={recipient?.email}
                      participantDetails={activeConversation?.participantDetails}
                    />
                    <div ref={messagesEndRef} className="h-2" />
                  </>
                )}
              </div>

              {/* Scroll to Bottom Button */}
              {showScrollButton && (
                <div className="absolute bottom-[80px] right-6 z-10">
                  <button
                    onClick={() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                      setUnreadScrollCount(0);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 shadow-lg shadow-blue-900/40 flex items-center gap-2 transition-all group"
                  >
                    {unreadScrollCount > 0 && (
                      <span className="text-xs font-bold bg-white text-blue-600 px-1.5 py-0.5 rounded-full">
                        {unreadScrollCount}
                      </span>
                    )}
                    <span className="text-sm font-medium mr-1 group-hover:scale-105 transition-transform">New Messages</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 lg:p-4 border-t border-white/5 bg-black/20 backdrop-blur-xl relative z-20">

                {/* Suggested Quick Messages */}
                {activeConversationId && messages.length === 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2 chat-scroll scrollbar-hide select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {SUGGESTED_MESSAGES.map((msgText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendSuggestedMessage(msgText)}
                        className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white rounded-full text-xs font-semibold border border-blue-500/20 transition-all shrink-0 cursor-pointer whitespace-nowrap"
                      >
                        {msgText}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reply Preview */}
                {replyingToMessage && (
                  <div className="flex items-center justify-between bg-gray-900/90 border-l-4 border-blue-500 p-2 md:p-3 mb-2 rounded-md rounded-l-none shadow-lg animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col overflow-hidden max-w-[85%]">
                      <span className="text-blue-400 text-xs font-bold mb-0.5">
                        {replyingToMessage.senderEmail === user.email ? "Replying to yourself" : "Replying to message"}
                      </span>
                      <span className="text-gray-300 text-sm truncate">
                        {replyingToMessage.message || "📷 Photo"}
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingToMessage(null)}
                      className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
                      title="Cancel Reply"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                )}

                {/* Image Preview Area */}
                {imagePreview && (
                  <div className="mb-3 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700/50 shadow-lg ml-12">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    {!isUploading && (
                      <button
                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                        className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-white hover:bg-black transition-colors"
                      >
                        <FaTimes size={10} />
                      </button>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] text-white font-bold mt-1">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                )}
              

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full relative">
                  {showEmojiPicker && (
                    <>
                      {/* Backdrop to close picker on tap */}
                      <div
                        className="fixed inset-0 z-30 bg-transparent"
                        onClick={() => setShowEmojiPicker(false)}
                      />

                      <div className="absolute bottom-[65px] right-4 z-40 w-72 bg-gray-950/95 border border-gray-800 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in slide-in-from-bottom-2 duration-200 flex flex-col gap-2">
                        {/* Picker Category Tabs */}
                        <div className="flex justify-between items-center pb-2 border-b border-white/5 gap-1 select-none">
                          <div className="flex gap-1.5">
                            {EMOJI_CATEGORIES.map((cat, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveCategoryIdx(idx)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${activeCategoryIdx === idx ? 'bg-blue-600 text-white' : 'hover:bg-gray-900 text-gray-400 hover:text-white'}`}
                                title={cat.name}
                              >
                                {cat.icon}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors tracking-wide cursor-pointer"
                          >
                            Close
                          </button>
                        </div>

                        {/* Emoji Grid container */}
                        <div className="h-44 overflow-y-auto grid grid-cols-7 gap-1 text-2xl p-1 chat-scroll select-none">
                          {EMOJI_CATEGORIES[activeCategoryIdx].emojis.map((emoji, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendEmojiDirectly(emoji)}
                              className="hover:scale-125 active:scale-90 transition-transform flex items-center justify-center p-1 cursor-pointer w-8 h-8 rounded-lg hover:bg-white/[0.04]"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <label className={`w-7 h-10 shrink-0 rounded-full flex items-center justify-center cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    <FaImage size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleTypingChange}
                    disabled={isUploading}
                    rows={1}
                    placeholder={isUploading ? "Uploading attachment..." : "Type your message here..."}
                    className="flex-1 min-w-0 bg-gray-900/50 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-[24px] px-5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50  ring-2  ring-blue-500/20 transition-all duration-300 disabled:opacity-50 resize-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] min-h-[46px] max-h-[120px] shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if ((newMessage.trim() || selectedImage) && !isUploading) {
                          handleSendMessage(e as any);
                        }
                      }
                    }}
                  />

                  <div
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className=" shrink-0 rounded-full flex items-center justify-center cursor-pointer text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    title="Choose Emoji"
                  >
                    <BiSmile size={24} />
                  </div>
                  <button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedImage) || isUploading}
                    className="h-[46px] w-[46px] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white flex items-center justify-center shrink-0 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    <BiSend size={20} className={(!newMessage.trim() && !selectedImage) || isUploading ? "" : "ml-1"} />
                  </button>
                </form>
              </div>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="w-24 h-24 mb-6 rounded-full bg-gray-900/50 flex items-center justify-center border border-gray-800 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative">
                <MessagesSquare size={40} className="text-gray-500 group-hover:text-blue-400 group-hover:-translate-y-1 transition-all duration-500" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </div>

              <h3 className="text-2xl font-bold font-averia-gruesa-libre text-white mb-2">Your Messages</h3>
              <p className="text-gray-400 text-sm lg:text-base max-w-sm mx-auto leading-relaxed font-parkinsans">
                Connect directly with sellers to negotiate prices, ask questions, or arrange deliveries. Select a chat from the sidebar to continue.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for Fullscreen Image View */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-gray-300 bg-gray-900/50 hover:bg-gray-800 p-2 md:p-3 rounded-full transition-colors"
          >
            <FaTimes size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen View"
            className="max-w-full max-h-[90vh] object-contain rounded-lg border border-gray-800 shadow-2xl"
          />
        </div>
      )}


      {!activeConversationId && <PageHelpPanel pageKey="messenger" />}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-10">Loading messaging workspace...</div>}>
      <ChatWorkspace />
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-message {
          animation: slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        .chat-scroll::-webkit-scrollbar { width: 5px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }

      `}</style>
    </Suspense>
  );
}

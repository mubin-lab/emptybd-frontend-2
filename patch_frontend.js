const fs = require("fs");

let content = fs.readFileSync("src/app/(main-layout)/messages/page.tsx", "utf8");

// 1. Update Conversation type
content = content.replace(
  "type Conversation = {",
  "type Conversation = {\n  isGroup?: boolean;\n  groupName?: string;"
);

// 2. Update SwipeableMessage Props & JSX
content = content.replace(
  "isOptimistic: boolean,",
  "isOptimistic: boolean,\n  isGroup?: boolean,\n  senderName?: string,\n  senderImg?: string | null,"
);

const newSwipeableJSX = `
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
            {msg.replyTo && (`;
content = content.replace("{msg.replyTo && (", newSwipeableJSX);

// 3. Update MessageList mapped props
content = content.replace(
  "msg={msg}",
  "msg={msg}\n              isGroup={user && msg.recipientEmail === null || msg.recipientEmail === undefined /* fallback */} "
);
// Actually, it's better to pass isGroup from the active conversation, but MessageList doesn't have it.
// Let's modify ChatWorkspace where MessageList is called.
content = content.replace(
  "<MessageList",
  "const activeConv = conversations.find(c => c._id === activeConversationId);\n\t\t\t\t\t\t\t<MessageList"
);

content = content.replace(
  "isOptimistic={isOptimistic}",
  "isOptimistic={isOptimistic}\n              isGroup={msg.recipientEmail === null}\n              senderName={msg.senderEmail.split('@')[0]}\n              senderImg={msg.senderImg}"
);
// We don't have senderName easily inside MessageList unless we pass conversation.
// Let's just use email fallback for now since we just need it working.

// 4. Update getRecipientDetails inside ChatWorkspace
const oldGetRecipient = `const getRecipientDetails = (conversation: Conversation) => {
    const me = user?.email || "";
    const recipientEmail = conversation.participants.find((p) => p !== me) || "";`;

const newGetRecipient = `const getRecipientDetails = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return {
        name: conversation.groupName || "Group",
        image: null,
        plan: "normal",
        email: "group"
      };
    }
    const me = user?.email || "";
    const recipientEmail = conversation.participants.find((p) => p !== me) || "";`;

content = content.replace(oldGetRecipient, newGetRecipient);

// 5. Add States and Create Group Handler
const oldStates = `const [searchUserId, setSearchUserId] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);`;

const newStates = `const [searchUserId, setSearchUserId] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState("");

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !groupMemberIds.trim()) {
      toast.error("Group name and at least one member ID are required");
      return;
    }
    const memberIds = groupMemberIds.split(",").map(id => id.trim()).filter(id => id.length > 0);
    if (memberIds.length === 0) {
      toast.error("Please enter valid member IDs");
      return;
    }
    if (memberIds.length > 9) {
      toast.error("Maximum 9 members can be added (Total group size 10)");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(\`\${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/group\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({ groupName: groupName.trim(), memberIds }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Group created successfully");
        setShowGroupModal(false);
        setGroupName("");
        setGroupMemberIds("");
        setConversations(prev => [data, ...prev]);
        setActiveConversationId(data._id);
        router.replace(\`/messages?conversationId=\${data._id}\`);
      } else {
        toast.error(data.message || "Failed to create group");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error creating group");
    }
  };`;

content = content.replace(oldStates, newStates);

// 6. Update Search Bar to include Create Group Button and Modal
const oldSearchBar = `<form onSubmit={handleSearchUser} className="relative">`;
const newSearchBar = `
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={() => setShowGroupModal(true)}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold py-1.5 rounded-lg border border-blue-500/30 transition-colors text-sm"
              >
                + Create Group
              </button>
            </div>

            {showGroupModal && (
              <div className="absolute top-0 left-0 w-full h-full bg-gray-950/95 z-50 p-4 flex flex-col justify-center">
                <h3 className="text-white text-lg font-bold mb-4 text-center">Create Group</h3>
                <form onSubmit={handleCreateGroup} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                  />
                  <textarea
                    placeholder="Enter User IDs (comma separated)"
                    value={groupMemberIds}
                    onChange={(e) => setGroupMemberIds(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none h-24"
                  />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setShowGroupModal(false)} className="flex-1 bg-gray-800 text-gray-300 py-2 rounded-lg">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Create</button>
                  </div>
                </form>
              </div>
            )}
            <form onSubmit={handleSearchUser} className="relative">`;

content = content.replace(oldSearchBar, newSearchBar);

// Update optimistic message generation to set recipientEmail to null if it's a group
content = content.replace(
  "recipientEmail: recipient?.email || \"\",",
  "recipientEmail: conversation?.isGroup ? null : (recipient?.email || \"\"),"
);
content = content.replace(
  "const activeConv = conversations.find((c) => c._id === activeConversationId);",
  "const conversation = conversations.find((c) => c._id === activeConversationId);"
);

fs.writeFileSync("src/app/(main-layout)/messages/page.tsx", content);
console.log("Patched messages/page.tsx successfully.");

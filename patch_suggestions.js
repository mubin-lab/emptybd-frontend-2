const fs = require('fs');

let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

const oldStatesBlock = `const [searchUserId, setSearchUserId] = useState("");
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

const newStatesBlock = `const [searchUserId, setSearchUserId] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [manualGroupId, setManualGroupId] = useState("");

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
      const res = await fetch(\`\${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/group\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
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
        router.replace(\`/messages?conversationId=\${data._id}\`);
      } else {
        toast.error(data.message || "Failed to create group");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error creating group");
    }
  };`;

const oldModalJSX = `{showGroupModal && (
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
            )}`;

const newModalJSX = `{showGroupModal && (
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
                              className={\`px-3 py-1 rounded text-xs font-bold transition-colors \${selectedGroupMembers.includes(partner._id) ? "bg-gray-800 text-gray-500" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}\`}
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
            )}`;

content = content.replace(oldStatesBlock, newStatesBlock);
content = content.replace(oldModalJSX, newModalJSX);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log('Update successful');

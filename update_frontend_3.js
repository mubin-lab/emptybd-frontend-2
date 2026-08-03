const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

// 1. Add stagedMembers state
const stagedMembersStateStr = 'const [addingNewMember, setAddingNewMember] = useState(false);';
const newStates = `const [addingNewMember, setAddingNewMember] = useState(false);
  const [stagedGroupMembers, setStagedGroupMembers] = useState<{ id: string, name: string, image?: string, isEmail?: boolean }[]>([]);`;
content = content.replace(stagedMembersStateStr, newStates);

// 2. Replace handleAddMemberToExistingGroup with staging logic and save logic
const addMemberFuncRegex = /const handleAddMemberToExistingGroup = async \([\s\S]*?setAddingNewMember\(false\);\n\s*\}\n\s*\};\n/m;
const newAddMemberFuncs = `
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
      
      const res = await fetch(\`\${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/group/\${activeConversationId}/add\`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
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
`;

if (content.match(addMemberFuncRegex)) {
  content = content.replace(addMemberFuncRegex, newAddMemberFuncs);
} else {
  console.log("Add Member Function Regex DID NOT MATCH!");
}

// 3. Update the Group Info Modal UI
// Remove the email display
content = content.replace(
  '<span className="text-gray-500 text-[10px] font-mono truncate w-full">{memberId}</span>',
  ''
);

// Update "Add New Member" section to use stagedMembers and suggestions
const fullAddSectionRegex = /\{activeConversation\.participants\.length < 10 && \(\s*<div className="bg-gray-900\/50 p-4 rounded-xl border border-gray-800">[\s\S]*?<\/div>\s*\)\}/m;

const newAddSection = `{activeConversation.participants.length < 10 && (
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col gap-4">
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
                      <div className="mt-2">
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
                                   onClick={() => handleStageMember(undefined, { id: otherP, name: details.name, image: details.image, isEmail: true })}
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
                  )}`;

if (content.match(fullAddSectionRegex)) {
  content = content.replace(fullAddSectionRegex, newAddSection);
} else {
  console.log("Add Section Regex DID NOT MATCH!");
}

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log("Frontend updated!");

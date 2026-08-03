const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('const handleAddMemberToExistingGroup = async'));
const end = lines.findIndex((l, i) => i > start && l.includes('setAddingNewMember(false);')) + 2;

const newAddMemberFuncs = `  const handleStageMember = (e?: React.FormEvent, selectedUser?: { id: string, name: string, image?: string, isEmail?: boolean }) => {
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
  };`;

lines.splice(start, end - start + 1, newAddMemberFuncs);
fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', lines.join('\n'));
console.log("Replaced function correctly!");

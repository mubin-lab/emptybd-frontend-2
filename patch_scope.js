const fs = require('fs');
let content = fs.readFileSync('src/app/(main-layout)/messages/page.tsx', 'utf8');

const targetBlock = `  const chatPartners = useMemo(() => {
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

// Remove the target block from where it is
content = content.replace(targetBlock, '');

// Re-insert it after filteredSuggestedUsers
const anchor = `  }, [suggestedUsers, conversations, user?.email]);`;
content = content.replace(anchor, anchor + "\n\n" + targetBlock);

fs.writeFileSync('src/app/(main-layout)/messages/page.tsx', content);
console.log('Fixed scoping issue');

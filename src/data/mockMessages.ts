export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export const mockMessageThreads: MessageThread[] = [
  {
    id: 'thread1',
    participantId: 'user1',
    participantName: 'Jordan Smith',
    participantAvatar: '🏀',
    lastMessage: 'See you at the court tomorrow!',
    lastMessageTime: '5 mins ago',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'user1',
        senderName: 'Jordan Smith',
        senderAvatar: '🏀',
        content: 'Hey! Want to play some ball tomorrow?',
        timestamp: '10:30 AM',
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '👤',
        content: 'Sure! What time works for you?',
        timestamp: '10:32 AM',
        isRead: true,
      },
      {
        id: 'm3',
        senderId: 'user1',
        senderName: 'Jordan Smith',
        senderAvatar: '🏀',
        content: 'How about 5pm at Venice Beach?',
        timestamp: '10:35 AM',
        isRead: true,
      },
      {
        id: 'm4',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '👤',
        content: 'Perfect! See you there 🏀',
        timestamp: '10:40 AM',
        isRead: true,
      },
      {
        id: 'm5',
        senderId: 'user1',
        senderName: 'Jordan Smith',
        senderAvatar: '🏀',
        content: 'See you at the court tomorrow!',
        timestamp: '11:15 AM',
        isRead: false,
      },
    ],
  },
  {
    id: 'thread2',
    participantId: 'user2',
    participantName: 'Alex Rodriguez',
    participantAvatar: '⚡',
    lastMessage: 'Thanks for the game today!',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm6',
        senderId: 'user2',
        senderName: 'Alex Rodriguez',
        senderAvatar: '⚡',
        content: 'Great game today! You\'ve really improved your three-point shot.',
        timestamp: '3:45 PM',
        isRead: true,
      },
      {
        id: 'm7',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '👤',
        content: 'Thanks! Been practicing a lot. Rematch next week?',
        timestamp: '3:50 PM',
        isRead: true,
      },
      {
        id: 'm8',
        senderId: 'user2',
        senderName: 'Alex Rodriguez',
        senderAvatar: '⚡',
        content: 'Absolutely! I\'ll bring my A-game 💪',
        timestamp: '4:00 PM',
        isRead: true,
      },
    ],
  },
  {
    id: 'thread3',
    participantId: 'user3',
    participantName: 'Maya Johnson',
    participantAvatar: '🌟',
    lastMessage: 'Challenge accepted! 🔥',
    lastMessageTime: '2 hours ago',
    unreadCount: 1,
    messages: [
      {
        id: 'm9',
        senderId: 'me',
        senderName: 'You',
        senderAvatar: '👤',
        content: 'I challenge you to a game of HORSE!',
        timestamp: '2:00 PM',
        isRead: true,
      },
      {
        id: 'm10',
        senderId: 'user3',
        senderName: 'Maya Johnson',
        senderAvatar: '🌟',
        content: 'Challenge accepted! 🔥',
        timestamp: '2:15 PM',
        isRead: false,
      },
    ],
  },
];

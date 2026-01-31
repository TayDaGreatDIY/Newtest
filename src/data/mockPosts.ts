export interface Post {
  id: string;
  type: 'text' | 'image' | 'challenge';
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  imageUrl?: string;
  challengeData?: {
    type: string;
    opponent: string;
  };
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
}

export const mockPosts: Post[] = [
  {
    id: '1',
    type: 'text',
    author: {
      id: 'user1',
      name: 'Jordan Smith',
      avatar: '🏀',
    },
    content: 'Just hit 10 three-pointers in a row at Venice Beach! 🔥 Who wants to challenge me?',
    likes: 42,
    comments: 8,
    shares: 3,
    timestamp: '2 hours ago',
    isLiked: false,
  },
  {
    id: '2',
    type: 'challenge',
    author: {
      id: 'user2',
      name: 'Alex Rodriguez',
      avatar: '⚡',
    },
    content: 'Challenge: 1v1 at Rucker Park tomorrow at 3pm',
    challengeData: {
      type: '1v1',
      opponent: 'Open',
    },
    likes: 28,
    comments: 15,
    shares: 5,
    timestamp: '4 hours ago',
    isLiked: true,
  },
  {
    id: '3',
    type: 'image',
    author: {
      id: 'user3',
      name: 'Maya Johnson',
      avatar: '🌟',
    },
    content: 'Perfect form at the free throw line! Practice makes perfect 💪',
    imageUrl: '[Image Placeholder]',
    likes: 156,
    comments: 23,
    shares: 12,
    timestamp: '6 hours ago',
    isLiked: true,
  },
  {
    id: '4',
    type: 'text',
    author: {
      id: 'user4',
      name: 'Chris Davis',
      avatar: '🎯',
    },
    content: 'New personal record: 85% from the three-point line in practice today!',
    likes: 67,
    comments: 11,
    shares: 4,
    timestamp: '8 hours ago',
    isLiked: false,
  },
];

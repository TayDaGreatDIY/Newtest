export interface Challenge {
  id: string;
  type: '1v1' | '3v3' | 'HORSE' | 'Shooting Contest';
  title: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  opponent?: {
    id: string;
    name: string;
    avatar: string;
  };
  status: 'open' | 'accepted' | 'in-progress' | 'completed';
  location: string;
  dateTime: string;
  stakes?: string;
  description: string;
  score?: {
    player1: number;
    player2: number;
    confirmed: boolean;
  };
}

export const mockChallenges: Challenge[] = [
  {
    id: 'ch1',
    type: '1v1',
    title: 'Street Ball Showdown',
    creator: {
      id: 'user1',
      name: 'Jordan Smith',
      avatar: '🏀',
    },
    status: 'open',
    location: 'Venice Beach Courts',
    dateTime: 'Today, 5:00 PM',
    stakes: 'Winner gets bragging rights',
    description: 'First to 21 points, win by 2. Let\'s see who\'s really got game!',
  },
  {
    id: 'ch2',
    type: '3v3',
    title: 'Team Tournament',
    creator: {
      id: 'user2',
      name: 'Alex Rodriguez',
      avatar: '⚡',
    },
    opponent: {
      id: 'user3',
      name: 'Maya Johnson',
      avatar: '🌟',
    },
    status: 'accepted',
    location: 'Rucker Park',
    dateTime: 'Tomorrow, 3:00 PM',
    stakes: '$50 prize pool',
    description: 'Bring your best squad. 3v3 tournament style.',
  },
  {
    id: 'ch3',
    type: 'HORSE',
    title: 'Classic HORSE Game',
    creator: {
      id: 'user4',
      name: 'Chris Davis',
      avatar: '🎯',
    },
    status: 'open',
    location: 'The Cage',
    dateTime: 'Saturday, 2:00 PM',
    description: 'Who\'s got the best trick shots? Let\'s play HORSE!',
  },
  {
    id: 'ch4',
    type: 'Shooting Contest',
    title: 'Three-Point Shootout',
    creator: {
      id: 'user5',
      name: 'Taylor Brown',
      avatar: '🔥',
    },
    opponent: {
      id: 'user6',
      name: 'Jordan Lee',
      avatar: '🌊',
    },
    status: 'completed',
    location: 'Venice Beach Courts',
    dateTime: 'Yesterday, 4:00 PM',
    description: '5 racks of 5 balls each. Best score wins!',
    score: {
      player1: 23,
      player2: 19,
      confirmed: true,
    },
  },
];

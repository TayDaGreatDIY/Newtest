export interface Court {
  id: string;
  name: string;
  location: string;
  distance: string;
  status: 'available' | 'busy' | 'full';
  currentPlayers: number;
  maxPlayers: number;
  amenities: string[];
  queue: QueueEntry[];
  checkInCode?: string;
}

export interface QueueEntry {
  id: string;
  teamName: string;
  players: string[];
  joinedAt: string;
  position: number;
  waitTime: string;
}

export const mockCourts: Court[] = [
  {
    id: 'court1',
    name: 'Venice Beach Courts',
    location: '1800 Ocean Front Walk, Venice, CA',
    distance: '0.5 miles',
    status: 'available',
    currentPlayers: 6,
    maxPlayers: 10,
    amenities: ['Outdoor', 'Lighting', 'Water Fountain'],
    queue: [
      {
        id: 'q1',
        teamName: 'The Ballers',
        players: ['John D.', 'Mike S.'],
        joinedAt: '10 mins ago',
        position: 1,
        waitTime: '~5 mins',
      },
      {
        id: 'q2',
        teamName: 'Court Kings',
        players: ['Sarah L.', 'Alex M.'],
        joinedAt: '5 mins ago',
        position: 2,
        waitTime: '~15 mins',
      },
    ],
    checkInCode: 'VB2024',
  },
  {
    id: 'court2',
    name: 'Rucker Park',
    location: '155th St & Frederick Douglass Blvd, NY',
    distance: '1.2 miles',
    status: 'busy',
    currentPlayers: 10,
    maxPlayers: 10,
    amenities: ['Outdoor', 'Historic', 'Bleachers'],
    queue: [
      {
        id: 'q3',
        teamName: 'Brooklyn Nets',
        players: ['James H.', 'Kevin D.', 'Kyrie I.'],
        joinedAt: '15 mins ago',
        position: 1,
        waitTime: '~10 mins',
      },
    ],
    checkInCode: 'RK2024',
  },
  {
    id: 'court3',
    name: 'The Cage (West 4th Street)',
    location: 'West 4th St & 6th Ave, NY',
    distance: '2.0 miles',
    status: 'available',
    currentPlayers: 4,
    maxPlayers: 10,
    amenities: ['Outdoor', 'Fenced', 'Street Ball'],
    queue: [],
    checkInCode: 'W42024',
  },
  {
    id: 'court4',
    name: 'Staples Center Practice Court',
    location: '1111 S Figueroa St, Los Angeles, CA',
    distance: '3.5 miles',
    status: 'full',
    currentPlayers: 10,
    maxPlayers: 10,
    amenities: ['Indoor', 'Premium', 'AC', 'Locker Rooms'],
    queue: [
      {
        id: 'q4',
        teamName: 'LA Lakers Jr',
        players: ['LeBron Jr.', 'Anthony D.'],
        joinedAt: '20 mins ago',
        position: 1,
        waitTime: '~20 mins',
      },
      {
        id: 'q5',
        teamName: 'Warriors',
        players: ['Steph C.', 'Klay T.'],
        joinedAt: '10 mins ago',
        position: 2,
        waitTime: '~30 mins',
      },
    ],
    checkInCode: 'SC2024',
  },
];

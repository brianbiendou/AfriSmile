import { KolofapUser, PointsTransaction, PointsRequest, Contact } from '@/types/kolofap';

// Mock data pour le développement
const mockKolofapUsers: KolofapUser[] = [
  {
    id: '1',
    user_id: '00000000-0000-0000-0000-000000000001',
    gamertag: 'marie_k',
    display_name: 'Marie Kouassi',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: '00000000-0000-0000-0000-000000000002',
    gamertag: 'john_doe',
    display_name: 'John Doe',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    user_id: '00000000-0000-0000-0000-000000000003',
    gamertag: 'sarah_m',
    display_name: 'Sarah Martin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockTransactions: PointsTransaction[] = [
  {
    id: '1',
    sender_id: '1',
    receiver_id: '2',
    amount: 5000,
    type: 'transfer',
    status: 'completed',
    message: 'Merci pour le service !',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    sender_id: '2',
    receiver_id: '1',
    amount: 2500,
    type: 'request',
    status: 'pending',
    message: 'Remboursement restaurant',
    created_at: '2024-01-14T16:00:00Z',
    updated_at: '2024-01-14T16:00:00Z',
  },
];

const mockContacts: Contact[] = [
  {
    id: '1',
    user_id: '1',
    contact_user_id: '2',
    contact_gamertag: 'john_doe',
    contact_display_name: 'John Doe',
    is_favorite: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: '1',
    contact_user_id: '3',
    contact_gamertag: 'sarah_m',
    contact_display_name: 'Sarah Martin',
    is_favorite: false,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const getKolofapUser = async (userId: string): Promise<KolofapUser | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockKolofapUsers.find(user => user.user_id === userId) || null;
};

export const createKolofapUser = async (userData: {
  user_id: string;
  gamertag: string;
  display_name: string;
  avatar_url?: string;
}): Promise<KolofapUser> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newUser: KolofapUser = {
    id: `user-${Date.now()}`,
    ...userData,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  mockKolofapUsers.push(newUser);
  return newUser;
};

export const searchUserByGamertag = async (gamertag: string): Promise<KolofapUser | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockKolofapUsers.find(user => 
    user.gamertag.toLowerCase() === gamertag.toLowerCase() && user.is_active
  ) || null;
};

export const sendPoints = async (transactionData: {
  sender_id: string;
  receiver_gamertag: string;
  amount: number;
  message?: string;
}): Promise<PointsTransaction> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const receiver = await searchUserByGamertag(transactionData.receiver_gamertag);
  if (!receiver) {
    throw new Error('Utilisateur introuvable');
  }
  
  const transaction: PointsTransaction = {
    id: `tx-${Date.now()}`,
    sender_id: transactionData.sender_id,
    receiver_id: receiver.id,
    amount: transactionData.amount,
    type: 'transfer',
    status: 'completed',
    message: transactionData.message,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  mockTransactions.push(transaction);
  return transaction;
};

export const requestPoints = async (requestData: {
  requester_id: string;
  target_gamertag: string;
  amount: number;
  message?: string;
}): Promise<PointsRequest> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const target = await searchUserByGamertag(requestData.target_gamertag);
  if (!target) {
    throw new Error('Utilisateur introuvable');
  }
  
  const request: PointsRequest = {
    id: `req-${Date.now()}`,
    requester_id: requestData.requester_id,
    target_id: target.id,
    amount: requestData.amount,
    message: requestData.message,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return request;
};

export const getTransactionHistory = async (userId: string): Promise<PointsTransaction[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockTransactions.filter(tx => 
    tx.sender_id === userId || tx.receiver_id === userId
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getContacts = async (userId: string): Promise<Contact[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockContacts.filter(contact => contact.user_id === userId);
};

export const addContact = async (userId: string, gamertag: string): Promise<Contact> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const user = await searchUserByGamertag(gamertag);
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }
  
  const contact: Contact = {
    id: `contact-${Date.now()}`,
    user_id: userId,
    contact_user_id: user.id,
    contact_gamertag: user.gamertag,
    contact_display_name: user.display_name,
    is_favorite: false,
    created_at: new Date().toISOString(),
  };
  
  mockContacts.push(contact);
  return contact;
};
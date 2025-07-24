import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

// Mock Prisma client
jest.mock('@prisma/client');
jest.mock('../../utils/logger');

const mockPrismaClient = {
  player: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  playerAlias: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  player_Game: {
    updateMany: jest.fn(),
  },
  player_Match: {
    updateMany: jest.fn(),
  },
  tournament_Player: {
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock the PrismaClient constructor to return our mock
(PrismaClient as jest.MockedClass<typeof PrismaClient>).mockImplementation(() => mockPrismaClient as any);

const mockLogger = logger as jest.Mocked<typeof logger>;

// Import after mocking
import { playerData, linkPlayerRecords } from './player.data';

describe('playerData.linkPlayerRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default transaction behavior
    mockPrismaClient.$transaction.mockImplementation((callback) =>
      callback(mockPrismaClient)
    );
  });

  describe('input validation', () => {
    it('should reject empty oldName', async () => {
      const mockFindPlayerByName = jest.fn();
      
      await expect(
        linkPlayerRecords({ oldName: '', newName: 'ValidName' }, mockFindPlayerByName)
      ).rejects.toThrow(
        'Failed to link player records: Both oldName and newName are required and cannot be empty'
      );
    });

    it('should reject empty newName', async () => {
      const mockFindPlayerByName = jest.fn();
      
      await expect(
        linkPlayerRecords({ oldName: 'ValidName', newName: '' }, mockFindPlayerByName)
      ).rejects.toThrow(
        'Failed to link player records: Both oldName and newName are required and cannot be empty'
      );
    });

    it('should reject null oldName', async () => {
      const mockFindPlayerByName = jest.fn();
      
      await expect(
        linkPlayerRecords({
          oldName: null as any,
          newName: 'ValidName',
        }, mockFindPlayerByName)
      ).rejects.toThrow(
        'Failed to link player records: Both oldName and newName are required and cannot be empty'
      );
    });

    it('should reject whitespace-only names', async () => {
      const mockFindPlayerByName = jest.fn();
      
      await expect(
        linkPlayerRecords({ oldName: '   ', newName: 'ValidName' }, mockFindPlayerByName)
      ).rejects.toThrow(
        'Failed to link player records: Both oldName and newName are required and cannot be empty'
      );
    });

    it('should reject identical names', async () => {
      const mockFindPlayerByName = jest.fn();
      
      await expect(
        linkPlayerRecords({
          oldName: 'SameName',
          newName: 'SameName',
        }, mockFindPlayerByName)
      ).rejects.toThrow('Failed to link player records: Cannot link a player to themselves');
    });

    it('should reject identical names with different casing', async () => {
      const mockFindPlayerByName = jest.fn();
      
      await expect(
        linkPlayerRecords({
          oldName: 'PlayerName',
          newName: 'playername',
        }, mockFindPlayerByName)
      ).rejects.toThrow('Failed to link player records: Cannot link a player to themselves');
    });
  });

  describe('player existence validation', () => {
    it('should reject when oldPlayer does not exist', async () => {
      // Create mock function
      const mockFindPlayerByName = jest
        .fn()
        .mockResolvedValueOnce(null) // oldPlayer
        .mockResolvedValueOnce({
          // newPlayer
          id: 'new-player-id',
          currentName: 'NewPlayer',
          aliases: [],
        });

      await expect(
        linkPlayerRecords(
          {
            oldName: 'NonExistent',
            newName: 'NewPlayer',
          },
          mockFindPlayerByName
        )
      ).rejects.toThrow(
        'Failed to link player records: Player with name "NonExistent" not found'
      );
    });

    it('should reject when newPlayer does not exist', async () => {
      // Create mock function
      const mockFindPlayerByName = jest
        .fn()
        .mockResolvedValueOnce({
          // oldPlayer
          id: 'old-player-id',
          currentName: 'OldPlayer',
          aliases: [],
        })
        .mockResolvedValueOnce(null); // newPlayer

      await expect(
        linkPlayerRecords(
          {
            oldName: 'OldPlayer',
            newName: 'NonExistent',
          },
          mockFindPlayerByName
        )
      ).rejects.toThrow(
        'Failed to link player records: Player with name "NonExistent" not found'
      );
    });

    it('should reject when players are already the same record', async () => {
      const samePlayer = {
        id: 'same-player-id',
        currentName: 'PlayerName',
        aliases: ['Alias1'],
      };

      const mockFindPlayerByName = jest.fn().mockResolvedValue(samePlayer);

      await expect(
        linkPlayerRecords({
          oldName: 'PlayerName',
          newName: 'Alias1',
        }, mockFindPlayerByName)
      ).rejects.toThrow(
        'Failed to link player records: Players are already the same record'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Players PlayerName and Alias1 are already the same record'
      );
    });
  });

  describe('successful linking', () => {
    it('should successfully link two different players', async () => {
      const oldPlayer = {
        id: 'old-player-id',
        currentName: 'OldPlayer',
        aliases: ['OldAlias'],
      };
      const newPlayer = {
        id: 'new-player-id',
        currentName: 'NewPlayer',
        aliases: ['NewAlias'],
      };

      const mockFindPlayerByName = jest.fn()
        .mockResolvedValueOnce(oldPlayer)
        .mockResolvedValueOnce(newPlayer);

      // Mock transaction operations
      mockPrismaClient.player_Game.updateMany.mockResolvedValue({ count: 5 });
      mockPrismaClient.player_Match.updateMany.mockResolvedValue({ count: 3 });
      mockPrismaClient.tournament_Player.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaClient.playerAlias.findFirst.mockResolvedValue(null); // No existing alias
      mockPrismaClient.playerAlias.create.mockResolvedValue({
        id: 'alias-id',
        playerId: 'new-player-id',
        name: 'OldPlayer',
      });
      mockPrismaClient.player.delete.mockResolvedValue(oldPlayer);

      const result = await linkPlayerRecords({
        oldName: 'OldPlayer',
        newName: 'NewPlayer',
      }, mockFindPlayerByName);

      // Verify all operations were called correctly
      expect(mockPrismaClient.player_Game.updateMany).toHaveBeenCalledWith({
        where: { playerId: 'old-player-id' },
        data: { playerId: 'new-player-id' },
      });
      expect(mockPrismaClient.player_Match.updateMany).toHaveBeenCalledWith({
        where: { playerId: 'old-player-id' },
        data: { playerId: 'new-player-id' },
      });
      expect(mockPrismaClient.tournament_Player.updateMany).toHaveBeenCalledWith({
        where: { playerId: 'old-player-id' },
        data: { playerId: 'new-player-id' },
      });
      expect(mockPrismaClient.playerAlias.create).toHaveBeenCalledWith({
        data: {
          playerId: 'new-player-id',
          name: 'OldPlayer',
        },
      });
      expect(mockPrismaClient.player.delete).toHaveBeenCalledWith({
        where: { id: 'old-player-id' },
      });

      expect(result).toEqual({
        id: 'new-player-id',
        name: 'NewPlayer',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully linked player records: OldPlayer -> NewPlayer'
      );
    });

    it('should skip creating alias if it already exists', async () => {
      const oldPlayer = {
        id: 'old-player-id',
        currentName: 'OldPlayer',
        aliases: [],
      };
      const newPlayer = {
        id: 'new-player-id',
        currentName: 'NewPlayer',
        aliases: ['OldPlayer'], // Already has this alias
      };

      const mockFindPlayerByName = jest.fn()
        .mockResolvedValueOnce(oldPlayer)
        .mockResolvedValueOnce(newPlayer);

      // Mock existing alias
      mockPrismaClient.playerAlias.findFirst.mockResolvedValue({
        id: 'existing-alias-id',
        playerId: 'new-player-id',
        name: 'OldPlayer',
      });

      mockPrismaClient.player_Game.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaClient.player_Match.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaClient.tournament_Player.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaClient.player.delete.mockResolvedValue(oldPlayer);

      await linkPlayerRecords({
        oldName: 'OldPlayer',
        newName: 'NewPlayer',
      }, mockFindPlayerByName);

      // Verify alias creation was skipped
      expect(mockPrismaClient.playerAlias.create).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle transaction failures', async () => {
      const oldPlayer = {
        id: 'old-player-id',
        currentName: 'OldPlayer',
        aliases: [],
      };
      const newPlayer = {
        id: 'new-player-id',
        currentName: 'NewPlayer',
        aliases: [],
      };

      const mockFindPlayerByName = jest.fn()
        .mockResolvedValueOnce(oldPlayer)
        .mockResolvedValueOnce(newPlayer);

      const transactionError = new Error('Database transaction failed');
      mockPrismaClient.$transaction.mockRejectedValue(transactionError);

      await expect(
        linkPlayerRecords({ oldName: 'OldPlayer', newName: 'NewPlayer' }, mockFindPlayerByName)
      ).rejects.toThrow(
        'Failed to link player records: Database transaction failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to link player records OldPlayer -> NewPlayer:',
        transactionError
      );
    });

    it('should handle unknown errors', async () => {
      const oldPlayer = {
        id: 'old-player-id',
        currentName: 'OldPlayer',
        aliases: [],
      };
      const newPlayer = {
        id: 'new-player-id',
        currentName: 'NewPlayer',
        aliases: [],
      };

      const mockFindPlayerByName = jest.fn()
        .mockResolvedValueOnce(oldPlayer)
        .mockResolvedValueOnce(newPlayer);

      mockPrismaClient.$transaction.mockRejectedValue('Unknown error');

      await expect(
        linkPlayerRecords({ oldName: 'OldPlayer', newName: 'NewPlayer' }, mockFindPlayerByName)
      ).rejects.toThrow('Failed to link player records: Unknown error');
    });
  });

  describe('transaction atomicity', () => {
    it('should ensure all operations are within a single transaction', async () => {
      const oldPlayer = {
        id: 'old-player-id',
        currentName: 'OldPlayer',
        aliases: [],
      };
      const newPlayer = {
        id: 'new-player-id',
        currentName: 'NewPlayer',
        aliases: [],
      };

      const mockFindPlayerByName = jest.fn()
        .mockResolvedValueOnce(oldPlayer)
        .mockResolvedValueOnce(newPlayer);

      mockPrismaClient.player_Game.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaClient.player_Match.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaClient.tournament_Player.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaClient.playerAlias.findFirst.mockResolvedValue(null);
      mockPrismaClient.playerAlias.create.mockResolvedValue({});
      mockPrismaClient.player.delete.mockResolvedValue(oldPlayer);

      await linkPlayerRecords({
        oldName: 'OldPlayer',
        newName: 'NewPlayer',
      }, mockFindPlayerByName);

      // Verify transaction was used
      expect(mockPrismaClient.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});

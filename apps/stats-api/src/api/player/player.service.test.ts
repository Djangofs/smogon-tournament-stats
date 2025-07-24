import { linkPlayerRecords } from './player.service';
import { playerData } from './player.data';
import logger from '../../utils/logger';

// Mock the player data layer
jest.mock('./player.data');
jest.mock('../../utils/logger');

const mockPlayerData = playerData as jest.Mocked<typeof playerData>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('linkPlayerRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful linking', () => {
    it('should successfully link two different players', async () => {
      // Arrange
      const oldName = 'OldPlayer';
      const newName = 'NewPlayer';
      const mockResult = {
        id: 'new-player-id',
        name: 'NewPlayer',
      };
      const mockLinkedPlayer = {
        id: 'new-player-id',
        currentName: 'NewPlayer',
        aliases: ['OldPlayer'],
      };

      mockPlayerData.linkPlayerRecords.mockResolvedValue(mockResult);
      mockPlayerData.findPlayerByName.mockResolvedValue(mockLinkedPlayer);

      // Act
      const result = await linkPlayerRecords({ oldName, newName });

      // Assert
      expect(mockPlayerData.linkPlayerRecords).toHaveBeenCalledWith({
        oldName,
        newName,
      });
      expect(mockPlayerData.findPlayerByName).toHaveBeenCalledWith({
        name: 'NewPlayer',
      });
      expect(result).toEqual({
        id: 'new-player-id',
        name: 'NewPlayer',
        aliases: ['OldPlayer'],
      });
    });

    it('should handle linking when players have existing aliases', async () => {
      // Arrange
      const oldName = 'PlayerAlias1';
      const newName = 'PlayerAlias2';
      const mockResult = {
        id: 'target-player-id',
        name: 'MainPlayerName',
      };
      const mockLinkedPlayer = {
        id: 'target-player-id',
        currentName: 'MainPlayerName',
        aliases: ['PlayerAlias1', 'PlayerAlias2', 'ExistingAlias'],
      };

      mockPlayerData.linkPlayerRecords.mockResolvedValue(mockResult);
      mockPlayerData.findPlayerByName.mockResolvedValue(mockLinkedPlayer);

      // Act
      const result = await linkPlayerRecords({ oldName, newName });

      // Assert
      expect(result).toEqual({
        id: 'target-player-id',
        name: 'MainPlayerName',
        aliases: ['PlayerAlias1', 'PlayerAlias2', 'ExistingAlias'],
      });
    });
  });

  describe('error handling', () => {
    it('should handle data layer errors gracefully', async () => {
      // Arrange
      const oldName = 'OldPlayer';
      const newName = 'NewPlayer';
      const errorMessage = 'Database connection failed';

      mockPlayerData.linkPlayerRecords.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(linkPlayerRecords({ oldName, newName })).rejects.toThrow(
        errorMessage
      );
      expect(mockPlayerData.linkPlayerRecords).toHaveBeenCalledWith({
        oldName,
        newName,
      });
    });

    it('should handle case where linked player cannot be retrieved', async () => {
      // Arrange
      const oldName = 'OldPlayer';
      const newName = 'NewPlayer';
      const mockResult = {
        id: 'new-player-id',
        name: 'NewPlayer',
      };

      mockPlayerData.linkPlayerRecords.mockResolvedValue(mockResult);
      mockPlayerData.findPlayerByName.mockResolvedValue(null);

      // Act & Assert
      await expect(linkPlayerRecords({ oldName, newName })).rejects.toThrow(
        'Failed to retrieve linked player after merge'
      );
    });

    it('should propagate validation errors from data layer', async () => {
      // Arrange
      const oldName = '';
      const newName = 'NewPlayer';

      mockPlayerData.linkPlayerRecords.mockRejectedValue(
        new Error('Both oldName and newName are required and cannot be empty')
      );

      // Act & Assert
      await expect(linkPlayerRecords({ oldName, newName })).rejects.toThrow(
        'Both oldName and newName are required and cannot be empty'
      );
    });

    it('should propagate player not found errors from data layer', async () => {
      // Arrange
      const oldName = 'NonExistentPlayer';
      const newName = 'NewPlayer';

      mockPlayerData.linkPlayerRecords.mockRejectedValue(
        new Error('Player with name "NonExistentPlayer" not found')
      );

      // Act & Assert
      await expect(linkPlayerRecords({ oldName, newName })).rejects.toThrow(
        'Player with name "NonExistentPlayer" not found'
      );
    });
  });

  describe('input validation delegation', () => {
    it('should delegate input validation to data layer', async () => {
      // Arrange
      const oldName = 'Player1';
      const newName = 'Player1'; // Same name

      mockPlayerData.linkPlayerRecords.mockRejectedValue(
        new Error('Cannot link a player to themselves')
      );

      // Act & Assert
      await expect(linkPlayerRecords({ oldName, newName })).rejects.toThrow(
        'Cannot link a player to themselves'
      );
      expect(mockPlayerData.linkPlayerRecords).toHaveBeenCalledWith({
        oldName,
        newName,
      });
    });
  });

  describe('transaction safety', () => {
    it('should handle transaction failures from data layer', async () => {
      // Arrange
      const oldName = 'OldPlayer';
      const newName = 'NewPlayer';

      mockPlayerData.linkPlayerRecords.mockRejectedValue(
        new Error('Failed to link player records: Transaction failed')
      );

      // Act & Assert
      await expect(linkPlayerRecords({ oldName, newName })).rejects.toThrow(
        'Failed to link player records: Transaction failed'
      );
    });
  });
});

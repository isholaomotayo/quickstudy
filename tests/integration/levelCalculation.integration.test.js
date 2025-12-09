/**
 * Integration tests for the complete level calculation flow
 * Tests the interaction between FetchWrapper, API endpoint, and service
 */

// Mock all dependencies first
jest.mock('../../backend/helpers/utils', () => ({
  checkAccess: jest.fn(),
  generateStudentRegNo2: jest.fn(),
  setPaginationHeaders: jest.fn()
}));

jest.mock('../../backend/models/Level', () => ({
  fetchAll: jest.fn()
}));

jest.mock('../../backend/models/Semester', () => ({
  where: jest.fn()
}));

jest.mock('../../backend/models/Student', () => ({
  where: jest.fn()
}));

jest.mock('../../backend/models/StudentGpa', () => ({
  where: jest.fn()
}));

jest.mock('../../backend/models/StudentCourse', () => ({
  where: jest.fn()
}));

jest.mock('../../backend/models/StudentResult', () => ({
  where: jest.fn()
}));

const studentController = require('../../backend/controllers/studentController');
const LevelCalculationService = require('../../backend/services/levelCalculationService');
const Level = require('../../backend/models/Level');
const Semester = require('../../backend/models/Semester');
const { checkAccess } = require('../../backend/helpers/utils');

describe('Level Calculation Integration', () => {
  let mockReq, mockReply;

  // Mock data that represents a realistic database state
  const mockLevels = [
    { get: jest.fn().mockReturnValue(1) }, // Level 1
    { get: jest.fn().mockReturnValue(2) }, // Level 2
    { get: jest.fn().mockReturnValue(3) }, // Level 3
    { get: jest.fn().mockReturnValue(4) }, // Level 4
  ];

  const mockCurrentSemester = {
    get: jest.fn((key) => {
      if (key === 'id') return 8;
      if (key === 'name') return 'Spring 2024';
      return null;
    })
  };

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
      body: {}
    };
    mockReply = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Setup default mocks
    checkAccess.mockReturnValue({
      validatedUser: { institution_id: 1 }
    });

    Level.fetchAll.mockResolvedValue({ models: mockLevels });
    Semester.where.mockReturnValue({
      fetch: jest.fn().mockResolvedValue(mockCurrentSemester)
    });

    jest.clearAllMocks();
  });

  describe('Complete Level Calculation Flow', () => {
    test('should calculate level correctly for new student (first semester)', async () => {
      mockReq.query = {
        student_id: '123',
        semester_admitted_id: '8', // Current semester
        entry_level_id: '1'
      };

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      // New student in current semester: 1 + Math.floor((8-8)/2) = 1 + 0 = 1
      expect(result.levelId).toBe(1);
      expect(result.levelDisplay).toBe(100);
      expect(result.currentSemesterId).toBe(8);
      expect(result.semesterName).toBe('Spring 2024');
    });

    test('should calculate level correctly for second year student', async () => {
      mockReq.query = {
        student_id: '456',
        semester_admitted_id: '4', // 4 semesters ago
        entry_level_id: '1'
      };

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      // Student admitted 4 semesters ago: 1 + Math.floor((8-4)/2) = 1 + 2 = 3
      expect(result.levelId).toBe(3);
      expect(result.levelDisplay).toBe(300);
    });

    test('should calculate level correctly for graduate entry student', async () => {
      mockReq.query = {
        student_id: '789',
        semester_admitted_id: '6', // 2 semesters ago
        entry_level_id: '2' // Started at level 2
      };

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      // Graduate entry student: 2 + Math.floor((8-6)/2) = 2 + 1 = 3
      expect(result.levelId).toBe(3);
      expect(result.levelDisplay).toBe(300);
    });

    test('should handle level that does not exist in database', async () => {
      // Mock levels that only go up to 3
      const limitedLevels = [
        { get: jest.fn().mockReturnValue(1) },
        { get: jest.fn().mockReturnValue(2) },
        { get: jest.fn().mockReturnValue(3) }
      ];
      Level.fetchAll.mockResolvedValue({ models: limitedLevels });

      mockReq.query = {
        student_id: '999',
        semester_admitted_id: '2', // Would calculate to level 4
        entry_level_id: '1'
      };

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      // Calculated level 4 doesn't exist, should use closest level 3
      expect(result.levelId).toBe(3);
      expect(result.levelDisplay).toBe(300);
    });

    test('should ensure minimum level is 1', async () => {
      mockReq.query = {
        student_id: '000',
        semester_admitted_id: '10', // Future semester (negative calculation)
        entry_level_id: '1'
      };

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      // Should enforce minimum level of 1
      expect(result.levelId).toBe(1);
      expect(result.levelDisplay).toBe(100);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle database connection failures', async () => {
      Level.fetchAll.mockRejectedValue(new Error('Database connection failed'));

      mockReq.query = {
        student_id: '123',
        semester_admitted_id: '4',
        entry_level_id: '2'
      };

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      // Should fallback to entry level
      expect(result.levelId).toBe(2);
      expect(result.levelDisplay).toBe(200);
      expect(result.error).toBeDefined();
    });

    test('should handle missing semester data', async () => {
      Semester.where.mockReturnValue({
        fetch: jest.fn().mockResolvedValue(null)
      });

      mockReq.query = {
        student_id: '123',
        semester_admitted_id: '4',
        entry_level_id: '1'
      };

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      // Should fallback to entry level when no active semester
      expect(result.levelId).toBe(1);
      expect(result.levelDisplay).toBe(100);
      expect(result.currentSemesterId).toBe(null);
      expect(result.error).toContain('No active semester found');
    });
  });

  describe('Level Calculation Consistency', () => {
    test('should produce consistent results across multiple calls', async () => {
      const testParams = {
        student_id: '123',
        semester_admitted_id: '4',
        entry_level_id: '1'
      };

      mockReq.query = testParams;

      // Call the function multiple times
      const result1 = await studentController.calculateStudentLevel(mockReq, mockReply);
      const result2 = await studentController.calculateStudentLevel(mockReq, mockReply);
      const result3 = await studentController.calculateStudentLevel(mockReq, mockReply);

      // All results should be identical
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(result1.levelId).toBe(3); // Verify expected calculation
    });

    test('should handle edge case calculations correctly', async () => {
      const testCases = [
        { admitted: 8, entry: 1, expected: 1 }, // Current semester
        { admitted: 7, entry: 1, expected: 1 }, // 1 semester ago (floor(1/2) = 0)
        { admitted: 6, entry: 1, expected: 2 }, // 2 semesters ago (floor(2/2) = 1)
        { admitted: 5, entry: 1, expected: 2 }, // 3 semesters ago (floor(3/2) = 1)
        { admitted: 4, entry: 1, expected: 3 }, // 4 semesters ago (floor(4/2) = 2)
        { admitted: 2, entry: 2, expected: 5 }, // Would calculate to 5, but should use closest (4)
      ];

      for (const testCase of testCases) {
        mockReq.query = {
          student_id: '123',
          semester_admitted_id: testCase.admitted.toString(),
          entry_level_id: testCase.entry.toString()
        };

        const result = await studentController.calculateStudentLevel(mockReq, mockReply);
        
        const expectedLevel = Math.min(testCase.expected, 4); // Max level in our mock data
        expect(result.levelId).toBe(expectedLevel);
        expect(result.levelDisplay).toBe(expectedLevel * 100);
      }
    });
  });
});
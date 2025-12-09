// Mock all dependencies before importing
jest.mock('../../backend/helpers/utils', () => ({
  checkAccess: jest.fn(),
  generateStudentRegNo2: jest.fn(),
  setPaginationHeaders: jest.fn()
}));

jest.mock('../../backend/services/levelCalculationService', () => ({
  calculateStudentCurrentLevel: jest.fn()
}));

jest.mock('../../backend/models/Student', () => ({
  forge: jest.fn(),
  where: jest.fn()
}));

jest.mock('../../backend/models/Semester', () => ({
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
const boom = require('boom');
const { checkAccess } = require('../../backend/helpers/utils');
const LevelCalculationService = require('../../backend/services/levelCalculationService');
const Student = require('../../backend/models/Student');
const Semester = require('../../backend/models/Semester');
const StudentGpa = require('../../backend/models/StudentGpa');
const StudentCourse = require('../../backend/models/StudentCourse');
const StudentResult = require('../../backend/models/StudentResult');

describe('StudentController', () => {
  let mockReq, mockReply;

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
    jest.clearAllMocks();
  });

  describe('calculateStudentLevel', () => {
    beforeEach(() => {
      checkAccess.mockReturnValue({
        validatedUser: { institution_id: 1 }
      });
    });

    test('should calculate student level successfully', async () => {
      mockReq.query = {
        student_id: '123',
        semester_admitted_id: '2',
        entry_level_id: '1'
      };

      const mockLevelInfo = {
        levelId: 2,
        levelDisplay: 200,
        currentSemesterId: 5,
        semesterName: 'Fall 2024'
      };

      LevelCalculationService.calculateStudentCurrentLevel.mockResolvedValue(mockLevelInfo);

      const result = await studentController.calculateStudentLevel(mockReq, mockReply);

      expect(LevelCalculationService.calculateStudentCurrentLevel).toHaveBeenCalledWith(
        123, 2, 1, 1
      );
      expect(result).toEqual(mockLevelInfo);
    });

    test('should throw error for missing parameters', async () => {
      mockReq.query = {
        student_id: '123',
        // Missing semester_admitted_id and entry_level_id
      };

      await expect(studentController.calculateStudentLevel(mockReq, mockReply))
        .rejects.toThrow('Missing required parameters');
    });

    test('should handle service errors', async () => {
      mockReq.query = {
        student_id: '123',
        semester_admitted_id: '2',
        entry_level_id: '1'
      };

      const serviceError = new Error('Service error');
      LevelCalculationService.calculateStudentCurrentLevel.mockRejectedValue(serviceError);

      await expect(studentController.calculateStudentLevel(mockReq, mockReply))
        .rejects.toThrow();
    });

    test('should validate access permissions', async () => {
      checkAccess.mockReturnValue({
        validatedUser: { institution_id: 1 }
      });

      mockReq.query = {
        student_id: '123',
        semester_admitted_id: '2',
        entry_level_id: '1'
      };

      await studentController.calculateStudentLevel(mockReq, mockReply);

      expect(checkAccess).toHaveBeenCalledWith(
        mockReq, 
        mockReply, 
        ["STUDENT", "ADMIN", "SUPERADMIN", "HOD", "STAFF", "LECTURER"]
      );
    });
  });

  describe('getStudentDashboard', () => {
    beforeEach(() => {
      checkAccess.mockReturnValue({
        validatedUser: { 
          institution_id: 1,
          student: { 
            id: 123,
            semester_admitted_id: 2,
            entry_level_id: 1
          }
        }
      });

      // Mock Semester model
      Semester.where.mockReturnValue({
        fetch: jest.fn().mockResolvedValue({
          attributes: { name: 'Fall 2024' }
        })
      });

      // Mock StudentGpa model
      StudentGpa.where.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({
          models: []
        })
      });

      // Mock StudentCourse model
      StudentCourse.where.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({
          models: { length: 0 }
        })
      });
    });

    test('should use centralized level calculation service', async () => {
      const mockLevelInfo = {
        levelId: 2,
        levelDisplay: 200,
        currentSemesterId: 5,
        semesterName: 'Fall 2024'
      };

      LevelCalculationService.calculateStudentCurrentLevel.mockResolvedValue(mockLevelInfo);

      const result = await studentController.getStudentDashboard(mockReq, mockReply);

      expect(LevelCalculationService.calculateStudentCurrentLevel).toHaveBeenCalledWith(
        123, 2, 1, 1
      );
      
      expect(result.student.current_level_id).toBe(2);
      expect(result.student.current_level).toBe(200);
      expect(result.student.current_semester).toBe('Fall 2024');
    });

    test('should handle level calculation errors gracefully', async () => {
      LevelCalculationService.calculateStudentCurrentLevel.mockResolvedValue({
        levelId: 1,
        levelDisplay: 100,
        currentSemesterId: null,
        semesterName: null,
        error: 'Database error'
      });

      const result = await studentController.getStudentDashboard(mockReq, mockReply);

      // Should still return a result with fallback values
      expect(result.student.current_level_id).toBe(1);
      expect(result.student.current_level).toBe(100);
    });

    test('should include all required dashboard data', async () => {
      const mockLevelInfo = {
        levelId: 2,
        levelDisplay: 200,
        currentSemesterId: 5,
        semesterName: 'Fall 2024'
      };

      LevelCalculationService.calculateStudentCurrentLevel.mockResolvedValue(mockLevelInfo);

      const result = await studentController.getStudentDashboard(mockReq, mockReply);

      expect(result).toHaveProperty('student');
      expect(result).toHaveProperty('studentGpa');
      expect(result).toHaveProperty('allStudentResult');
      expect(result).toHaveProperty('approvedRegistrationsSize');
      expect(result).toHaveProperty('unApprovedRegistrationsSize');
    });
  });
});
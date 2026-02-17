/**
 * Unit Tests - Pagination Helper
 * اختبارات وحدة لـ utility ترقيم الصفحات
 */
import { jest } from '@jest/globals';
import { paginate, paginationResponse } from '../../../utils/pagination.js';

describe('Pagination Helper', () => {
  // ------------------------------------------
  // paginate
  // ------------------------------------------
  describe('paginate', () => {
    it('should apply default pagination (page 1, limit 10)', () => {
      const query = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      const req = { query: {} };

      const result = paginate(query, req);

      expect(query.skip).toHaveBeenCalledWith(0);
      expect(query.limit).toHaveBeenCalledWith(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should use custom page and limit from query', () => {
      const query = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      const req = { query: { page: '2', limit: '20' } };

      const result = paginate(query, req);

      expect(query.skip).toHaveBeenCalledWith(20); // (2-1) * 20
      expect(query.limit).toHaveBeenCalledWith(20);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(20);
    });

    it('should use custom default limit', () => {
      const query = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      const req = { query: {} };

      const result = paginate(query, req, 25);

      expect(query.limit).toHaveBeenCalledWith(25);
      expect(result.pagination.limit).toBe(25);
    });

    it('should cap limit at 100', () => {
      const query = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      const req = { query: { limit: '500' } };

      const result = paginate(query, req);

      expect(query.limit).toHaveBeenCalledWith(100);
      expect(result.pagination.limit).toBe(100);
    });

    it('should handle page < 1', () => {
      const query = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      const req = { query: { page: '0' } };

      const result = paginate(query, req);

      expect(result.pagination.page).toBe(1);
      expect(query.skip).toHaveBeenCalledWith(0);
    });

    it('should handle negative limit', () => {
      const query = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      const req = { query: { limit: '-5' } };

      const result = paginate(query, req);

      expect(result.pagination.limit).toBe(10); // defaults to 10
    });
  });

  // ------------------------------------------
  // paginationResponse
  // ------------------------------------------
  describe('paginationResponse', () => {
    it('should create correct response with pagination metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const paginationInfo = { page: 1, limit: 10 };

      const result = paginationResponse(data, 50, paginationInfo);

      expect(result.data).toEqual(data);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(5); // 50 / 10
      expect(result.pagination.totalItems).toBe(50);
      expect(result.pagination.itemsPerPage).toBe(10);
    });

    it('should calculate correct total pages', () => {
      const data = [];
      const paginationInfo = { page: 1, limit: 12 };

      const result = paginationResponse(data, 100, paginationInfo);

      expect(result.pagination.totalPages).toBe(9); // ceil(100/12) = 9
    });

    it('should indicate hasNextPage correctly', () => {
      const data = [];

      const result1 = paginationResponse(data, 50, { page: 1, limit: 10 });
      expect(result1.pagination.hasNextPage).toBe(true);

      const result2 = paginationResponse(data, 50, { page: 5, limit: 10 });
      expect(result2.pagination.hasNextPage).toBe(false);
    });

    it('should indicate hasPrevPage correctly', () => {
      const data = [];

      const result1 = paginationResponse(data, 50, { page: 1, limit: 10 });
      expect(result1.pagination.hasPrevPage).toBe(false);

      const result2 = paginationResponse(data, 50, { page: 3, limit: 10 });
      expect(result2.pagination.hasPrevPage).toBe(true);
    });

    it('should handle zero total', () => {
      const data = [];
      const paginationInfo = { page: 1, limit: 10 };

      const result = paginationResponse(data, 0, paginationInfo);

      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.totalItems).toBe(0);
    });
  });
});

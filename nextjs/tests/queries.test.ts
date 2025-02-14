/**
 * Test suite for database query functions
 * 
 * This suite uses Jest mocks to simulate responses from:
 * - Clerk authentication (@clerk/nextjs/server)
 * - Database queries (db.query)
 * 
 * No actual network calls or database operations are performed.
 * 
 * Tests the following functionality:
 * - Authentication checks for all queries
 * - Project retrieval (single and multiple)
 * - Template retrieval (single and multiple)
 * - Error handling for unauthenticated requests
 * 
 * Mock implementation:
 * - auth() is mocked to return either a valid userId or null
 * - Database queries are mocked to return predefined test data
 * - All external calls are verified using Jest's expect().toHaveBeenCalled()
 */

import { getProjectsForUser, getProject, getTemplatesForUser, getTemplate } from '../server/queries';
import { auth } from "@clerk/nextjs/server";
import { db } from "../server/db";
import { Project, Template } from '../server/db/schema';

// Mock the external dependencies
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn()
}));

jest.mock("../server/db", () => ({
  db: {
    query: {
      projectsTable: {
        findMany: jest.fn(),
        findFirst: jest.fn()
      },
      templatesTable: {
        findMany: jest.fn(),
        findFirst: jest.fn()
      }
    }
  }
}));

// Type the mocked functions
const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockedProjectsFindMany = db.query.projectsTable.findMany as jest.MockedFunction<typeof db.query.projectsTable.findMany>;
const mockedProjectsFindFirst = db.query.projectsTable.findFirst as jest.MockedFunction<typeof db.query.projectsTable.findFirst>;
const mockedTemplatesFindMany = db.query.templatesTable.findMany as jest.MockedFunction<typeof db.query.templatesTable.findMany>;
const mockedTemplatesFindFirst = db.query.templatesTable.findFirst as jest.MockedFunction<typeof db.query.templatesTable.findFirst>;

describe('Queries', () => {
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.mockResolvedValue({ userId: mockUserId });
  });

  describe('getProjectsForUser', () => {
    it('should fetch projects for authenticated user', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', userId: mockUserId },
        { id: '2', name: 'Project 2', userId: mockUserId }
      ];

      mockedProjectsFindMany.mockResolvedValue(mockProjects);

      const result = await getProjectsForUser();

      expect(result).toEqual(mockProjects);
      expect(mockedAuth).toHaveBeenCalled();
      expect(mockedProjectsFindMany).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      mockedAuth.mockResolvedValue({ userId: null });

      await expect(getProjectsForUser()).rejects.toThrow('User not found');
    });
  });

  describe('getProject', () => {
    const projectId = 'test-project-id';

    it('should fetch single project for authenticated user', async () => {
      const mockProject = { id: projectId, name: 'Test Project', userId: mockUserId };
      
      mockedProjectsFindFirst.mockResolvedValue(mockProject);

      const result = await getProject(projectId);

      expect(result).toEqual(mockProject);
      expect(mockedAuth).toHaveBeenCalled();
      expect(mockedProjectsFindFirst).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      mockedAuth.mockResolvedValue({ userId: null });

      await expect(getProject(projectId)).rejects.toThrow('User not found');
    });
  });

  describe('getTemplatesForUser', () => {
    it('should fetch templates for authenticated user', async () => {
      const mockTemplates = [
        { id: '1', name: 'Template 1', userId: mockUserId },
        { id: '2', name: 'Template 2', userId: mockUserId }
      ];

      mockedTemplatesFindMany.mockResolvedValue(mockTemplates);

      const result = await getTemplatesForUser();

      expect(result).toEqual(mockTemplates);
      expect(mockedAuth).toHaveBeenCalled();
      expect(mockedTemplatesFindMany).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      mockedAuth.mockResolvedValue({ userId: null });

      await expect(getTemplatesForUser()).rejects.toThrow('User not found');
    });
  });

  describe('getTemplate', () => {
    const templateId = 'test-template-id';

    it('should fetch single template for authenticated user', async () => {
      const mockTemplate = { id: templateId, name: 'Test Template', userId: mockUserId };
      
      mockedTemplatesFindFirst.mockResolvedValue(mockTemplate);

      const result = await getTemplate(templateId);

      expect(result).toEqual(mockTemplate);
      expect(mockedAuth).toHaveBeenCalled();
      expect(mockedTemplatesFindFirst).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      mockedAuth.mockResolvedValue({ userId: null });

      await expect(getTemplate(templateId)).rejects.toThrow('User not found');
    });
  });
});

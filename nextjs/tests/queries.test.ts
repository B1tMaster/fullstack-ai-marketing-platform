import { getProjectsForUser, getProject, getTemplatesForUser, getTemplate } from '../server/queries';
import { auth } from "@clerk/nextjs/server";
import { db } from "../server/db";

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

describe('Queries', () => {
  const mockUserId = 'test-user-id';
  
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ userId: mockUserId });
  });

  describe('getProjectsForUser', () => {
    it('should fetch projects for authenticated user', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', userId: mockUserId },
        { id: '2', name: 'Project 2', userId: mockUserId }
      ];

      db.query.projectsTable.findMany.mockResolvedValue(mockProjects);

      const result = await getProjectsForUser();

      expect(result).toEqual(mockProjects);
      expect(auth).toHaveBeenCalled();
      expect(db.query.projectsTable.findMany).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      await expect(getProjectsForUser()).rejects.toThrow('User not found');
    });
  });

  describe('getProject', () => {
    const projectId = 'test-project-id';

    it('should fetch single project for authenticated user', async () => {
      const mockProject = { id: projectId, name: 'Test Project', userId: mockUserId };
      
      db.query.projectsTable.findFirst.mockResolvedValue(mockProject);

      const result = await getProject(projectId);

      expect(result).toEqual(mockProject);
      expect(auth).toHaveBeenCalled();
      expect(db.query.projectsTable.findFirst).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      await expect(getProject(projectId)).rejects.toThrow('User not found');
    });
  });

  describe('getTemplatesForUser', () => {
    it('should fetch templates for authenticated user', async () => {
      const mockTemplates = [
        { id: '1', name: 'Template 1', userId: mockUserId },
        { id: '2', name: 'Template 2', userId: mockUserId }
      ];

      db.query.templatesTable.findMany.mockResolvedValue(mockTemplates);

      const result = await getTemplatesForUser();

      expect(result).toEqual(mockTemplates);
      expect(auth).toHaveBeenCalled();
      expect(db.query.templatesTable.findMany).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      await expect(getTemplatesForUser()).rejects.toThrow('User not found');
    });
  });

  describe('getTemplate', () => {
    const templateId = 'test-template-id';

    it('should fetch single template for authenticated user', async () => {
      const mockTemplate = { id: templateId, name: 'Test Template', userId: mockUserId };
      
      db.query.templatesTable.findFirst.mockResolvedValue(mockTemplate);

      const result = await getTemplate(templateId);

      expect(result).toEqual(mockTemplate);
      expect(auth).toHaveBeenCalled();
      expect(db.query.templatesTable.findFirst).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      await expect(getTemplate(templateId)).rejects.toThrow('User not found');
    });
  });
});

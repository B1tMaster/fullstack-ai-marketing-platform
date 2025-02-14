/**
 * Integration tests for database query functions
 * 
 * These tests use:
 * - Real Clerk authentication
 * - Real database connections
 * - Actual data retrieval
 * 
 * Prerequisites:
 * - Valid Clerk credentials
 * - Database connection
 * - Test data in database
 */

import { getProjectsForUser, getProject, getTemplatesForUser, getTemplate } from '../../server/queries';
import { auth } from "@clerk/nextjs/server";
import { db } from "../../server/db";
import { Project, Template, projectsTable, templatesTable } from '../../server/db/schema';

describe('Queries Integration', () => {
  // Test user data - should match a real user in your Clerk instance
  const testUserId = process.env.TEST_USER_ID;
  
  // Test data to be created in DB
  let testProject: Project;
  let testTemplate: Template;

  beforeAll(async () => {
    // Verify we have test credentials
    if (!testUserId) {
      throw new Error('TEST_USER_ID environment variable is required');
    }

    // Create test data
    [testProject] = await db
      .insert(projectsTable)
      .values({
        title: 'Integration Test Project',
        userId: testUserId,
      })
      .returning();

    [testTemplate] = await db
      .insert(templatesTable)
      .values({
        title: 'Integration Test Template',
        userId: testUserId,
        description: 'Test template description',
        isPublic: false,
      })
      .returning();
  });

  afterAll(async () => {
    // Clean up test data
    await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, testProject.id));

    await db
      .delete(templatesTable)
      .where(eq(templatesTable.id, testTemplate.id));
  });

  describe('getProjectsForUser', () => {
    it('should fetch real projects for authenticated user', async () => {
      const projects = await getProjectsForUser();
      
      expect(projects).toBeDefined();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
      
      const project = projects[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('userId', testUserId);
      expect(project).toHaveProperty('createdAt');
      expect(project).toHaveProperty('updatedAt');
    });
  });

  describe('getProject', () => {
    it('should fetch a specific project with all fields', async () => {
      const project = await getProject(testProject.id);
      
      expect(project).toBeDefined();
      expect(project).toHaveProperty('id', testProject.id);
      expect(project).toHaveProperty('title', testProject.title);
      expect(project).toHaveProperty('userId', testUserId);
      expect(project).toHaveProperty('createdAt');
      expect(project).toHaveProperty('updatedAt');
    });

    it('should return undefined for non-existent project', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const project = await getProject(nonExistentId);
      expect(project).toBeUndefined();
    });
  });

  describe('getTemplatesForUser', () => {
    it('should fetch real templates for authenticated user', async () => {
      const templates = await getTemplatesForUser();
      
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      
      const template = templates[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('title');
      expect(template).toHaveProperty('userId', testUserId);
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('isPublic');
      expect(template).toHaveProperty('createdAt');
      expect(template).toHaveProperty('updatedAt');
    });
  });

  describe('getTemplate', () => {
    it('should fetch a specific template with all fields', async () => {
      const template = await getTemplate(testTemplate.id);
      
      expect(template).toBeDefined();
      expect(template).toHaveProperty('id', testTemplate.id);
      expect(template).toHaveProperty('title', testTemplate.title);
      expect(template).toHaveProperty('userId', testUserId);
      expect(template).toHaveProperty('description', testTemplate.description);
      expect(template).toHaveProperty('isPublic', testTemplate.isPublic);
      expect(template).toHaveProperty('createdAt');
      expect(template).toHaveProperty('updatedAt');
    });

    it('should return undefined for non-existent template', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const template = await getTemplate(nonExistentId);
      expect(template).toBeUndefined();
    });
  });
});

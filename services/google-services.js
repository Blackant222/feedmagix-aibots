const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');

class GoogleServices {
  constructor() {
    this.auth = null;
    this.docs = null;
    this.drive = null;
    this.search = null;
    this.genai = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Initialize Google Auth
      this.auth = new GoogleAuth({
        scopes: [
          'https://www.googleapis.com/auth/documents',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/customsearch'
        ],
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || './google-credentials.json'
      });

      // Initialize Google APIs
      this.docs = google.docs({ version: 'v1', auth: this.auth });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.search = google.customsearch({ version: 'v1', auth: this.auth });
      
      // Initialize Gemini AI
      if (process.env.GOOGLE_API_KEY) {
        this.genai = new GoogleGenAI({
          apiKey: process.env.GOOGLE_API_KEY
        });
      }

      this.initialized = true;
      console.log('✅ Google Services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Services:', error.message);
      // Continue without Google services if credentials are missing
      this.initialized = false;
    }
  }

  // Document Creation Methods
  async createDocument(title, content, agentName) {
    if (!this.initialized) {
      throw new Error('Google Services not initialized');
    }

    try {
      // Create a new document
      const doc = await this.docs.documents.create({
        requestBody: {
          title: `${title} - Created by ${agentName}`
        }
      });

      const documentId = doc.data.documentId;

      // Add content to the document
      if (content) {
        await this.docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [{
              insertText: {
                location: {
                  index: 1
                },
                text: content
              }
            }]
          }
        });
      }

      // Make document publicly viewable
      await this.drive.permissions.create({
        fileId: documentId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        documentId,
        url: `https://docs.google.com/document/d/${documentId}/edit`,
        viewUrl: `https://docs.google.com/document/d/${documentId}/view`
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(documentId, content, insertIndex = 1) {
    if (!this.initialized) {
      throw new Error('Google Services not initialized');
    }

    try {
      await this.docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: [{
            insertText: {
              location: {
                index: insertIndex
              },
              text: content
            }
          }]
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Search Methods
  async searchWeb(query, numResults = 5) {
    if (!this.initialized || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
      // Fallback to basic search if Google Custom Search is not configured
      return {
        items: [],
        fallback: true,
        message: 'Google Custom Search not configured, using basic search'
      };
    }

    try {
      const response = await this.search.cse.list({
        cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: numResults
      });

      return {
        items: response.data.items || [],
        totalResults: response.data.searchInformation?.totalResults || 0,
        searchTime: response.data.searchInformation?.searchTime || 0
      };
    } catch (error) {
      console.error('Error searching web:', error);
      return {
        items: [],
        error: error.message
      };
    }
  }

  // Image Generation Methods using Google Imagen API
  async generateImage(prompt, agentName) {
    if (!this.genai) {
      throw new Error('Google Gemini AI not initialized');
    }

    try {
      // Enhanced prompt for better image generation with PetMagix branding
      const enhancedPrompt = `Create a professional, high-quality image for PetMagix company. ${prompt}. Style: modern, clean, pet-friendly, vibrant colors, Persian/Iranian cultural elements if relevant. High resolution, commercial quality. Created by ${agentName}.`;
      
      // Use Google's Imagen through Gemini API
      const model = this.genai.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      // Generate image description and metadata
      const imageRequest = `Generate a detailed image description for: ${enhancedPrompt}. Include specific visual elements, colors, composition, and style details that would create a professional image for PetMagix brand.`;
      
      const result = await model.generateContent(imageRequest);
      const response = await result.response;
      const imageDescription = response.text();
      
      // In a real implementation, you would call Google's Imagen API here
      // For now, we return the enhanced description and metadata
      return {
        success: true,
        prompt: enhancedPrompt,
        description: imageDescription,
        message: `Image concept generated successfully by ${agentName}`,
        agent: agentName,
        service: 'Google Gemini AI',
        timestamp: new Date().toISOString(),
        metadata: {
          style: 'professional, pet-friendly, modern',
          brand: 'PetMagix',
          quality: 'high-resolution, commercial'
        }
      };
    } catch (error) {
      console.error('Error generating image with Google services:', error);
      throw new Error(`Google image generation failed: ${error.message}`);
    }
  }

  // File Management Methods
  async uploadFile(filePath, fileName, mimeType = 'application/octet-stream') {
    if (!this.initialized) {
      throw new Error('Google Services not initialized');
    }

    try {
      const fileMetadata = {
        name: fileName
      };

      const media = {
        mimeType: mimeType,
        body: await fs.readFile(filePath)
      };

      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      // Make file publicly viewable
      await this.drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return {
        fileId: file.data.id,
        url: `https://drive.google.com/file/d/${file.data.id}/view`
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Advanced AI Methods
  async generateContent(prompt, context = {}) {
    if (!this.genai) {
      throw new Error('Gemini AI not initialized');
    }

    try {
      const model = this.genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const enhancedPrompt = `
Context: You are working for PetMagix, an Iranian pet care company.
Company Info: ${JSON.stringify(context.company || {})}
Agent Role: ${context.agentRole || 'Team Member'}
Task: ${prompt}

Provide a professional, helpful response in Persian (Farsi) that reflects your role and company knowledge.`;
      
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      
      return {
        text: response.text(),
        success: true
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  // Utility Methods
  isInitialized() {
    return this.initialized;
  }

  getCapabilities() {
    return {
      documents: this.initialized,
      drive: this.initialized,
      search: this.initialized && !!process.env.GOOGLE_SEARCH_ENGINE_ID,
      ai: !!this.genai,
      imageGeneration: !!this.genai
    };
  }
}

module.exports = GoogleServices;
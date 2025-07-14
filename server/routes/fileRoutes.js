const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
// const { HebrewCalendar, HDate } = require('@hebcal/core');

// Store processing status
let processingStatus = {
  isProcessing: false,
  totalFiles: 0,
  processedFiles: 0,
  currentFile: '',
  errors: []
};

function replaceAsusPath(input) {
  return input.replace(/eDriver\/AsusInsWiz\.exe/g, '\\\\');
};

// Helper function to count total files
async function countFiles(dirPathOriginal) {
  try {
    const dirPath = path.resolve(replaceAsusPath(dirPathOriginal)); // Ensure absolute path
    let count = 0;

    // Check if the directory exists before proceeding
    try {
      await fs.access(dirPath);
    } catch (accessError) {
      throw new Error(`Directory does not exist or is inaccessible: ${dirPath}`);
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        count += await countFiles(fullPath); // Recursively count files in subdirectories
      } else if (entry.isFile()) {
        count++; // Increment count for files
      }
    }

    return count;
  } catch (error) {
    console.error(`Error counting files in directory ${dirPathOriginal}:`, error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// Helper function to process files recursively
async function processDirectory(sourcePath, destinationPath) {
  const entries = await fs.readdir(sourcePath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullSourcePath = path.join(sourcePath, entry.name);
    
    try {
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(fullSourcePath, destinationPath);
      } else {
        processingStatus.currentFile = entry.name;
        
        const stats = await fs.stat(fullSourcePath);
        const fileDate = new Date(stats.birthtime);
        const hDate = new HDate(fileDate);
        
        const hebrewYear = hDate.getFullYear();
        const hebrewMonth = hDate.getMonthName();
        
        const yearPath = path.join(destinationPath, hebrewYear.toString());
        const monthPath = path.join(yearPath, hebrewMonth);
        
        await fs.mkdir(yearPath, { recursive: true });
        await fs.mkdir(monthPath, { recursive: true });
        
        await fs.copyFile(fullSourcePath, path.join(monthPath, entry.name));
        
        processingStatus.processedFiles++;
      }
    } catch (error) {
      processingStatus.errors.push({
        file: entry.name,
        error: error.message
      });
      console.error(`Error processing ${entry.name}:`, error);
    }
  }
}

router.post('/sort-files', async (req, res) => {
  const { sourcePath, destinationPath } = req.body;

  if (processingStatus.isProcessing) {
    return res.status(409).json({
      success: false,
      message: 'Another sorting process is already running'
    });
  }

  try {
    // Reset status
    processingStatus = {
      isProcessing: true,
      totalFiles: 0,
      processedFiles: 0,
      currentFile: '',
      errors: []
    };

    // Count total files first
    processingStatus.totalFiles = await countFiles(sourcePath);
    
    // Process files
    await processDirectory(sourcePath, destinationPath);
    
    const result = {
      success: true,
      message: 'Files sorted successfully',
      stats: {
        totalFiles: processingStatus.totalFiles,
        processedFiles: processingStatus.processedFiles,
        errors: processingStatus.errors
      }
    };

    // Reset status
    processingStatus.isProcessing = false;
    
    res.json(result);
  } catch (error) {
    processingStatus.isProcessing = false;
    console.error('Error processing files:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stats: processingStatus
    });
  }
});

router.get('/sort-status', (req, res) => {
  res.json({
    ...processingStatus,
    progress: processingStatus.totalFiles > 0 
      ? Math.round((processingStatus.processedFiles / processingStatus.totalFiles) * 100)
      : 0
  });
});

module.exports = router;
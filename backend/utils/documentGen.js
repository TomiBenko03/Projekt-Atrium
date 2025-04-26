// for generating documents/getting data
const TemplateMapper = require('./templateMapper')
const fs = require('fs');
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const Transaction = require('../models/Transaction');
const opener = require('opener');
const { Readable } = require('stream');
// for downloading and accessing google drive and templated documents
const { google } = require('googleapis');

// --------------HELPER FUNCTIONS-------------------
async function listDriveFiles(options = {}) {
  try {
    const { driveClient } = await initializeGoogleDrive();
    let nextPageToken = null;
    const allFiles = [];
    
    do {
      const response = await driveClient.files.list({
        q: options.query || "trashed=false",
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink)',
        spaces: 'drive',
        pageToken: nextPageToken,
        pageSize: 100,
      });
      
      const files = response.data.files;
      if (files && files.length > 0) {
        allFiles.push(...files);
      }
      
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken && (!options.maxResults || allFiles.length < options.maxResults));
    
    console.log(`Found ${allFiles.length} files in Google Drive`);
    allFiles.forEach(file => {
      console.log(`ID: ${file.id} | Name: ${file.name} | Type: ${file.mimeType}`);
    });
    
    return allFiles;
  } catch (error) {
    console.error('Error listing files from Google Drive:', error);
    throw error;
  }
}

async function uploadTemplateToGoogleDrive(localTemplatePath, templateName) {
  try {
    const { driveClient } = await initializeGoogleDrive();
    
    // Check if template already exists
    const searchResponse = await driveClient.files.list({
      q: `name='${templateName}'`,
      fields: 'files(id, name)'
    });
    
    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      console.log(`Template ${templateName} already exists with ID: ${searchResponse.data.files[0].id}`);
      return searchResponse.data.files[0].id;
    }
    
    // Create a templates folder if it doesn't exist
    const templatesFolderId = await createOrGetFolder(driveClient, null, 'DocumentTemplates');
    
    // Create metadata for file
    const fileMetadata = {
      name: templateName,
      parents: [templatesFolderId]
    };
    
    // Fix: Use stream-based upload instead of buffer
    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: fs.createReadStream(localTemplatePath)
    };
    
    const uploadedFile = await driveClient.files.create({
      requestBody: fileMetadata,  // Changed from resource to requestBody
      media: media,
      fields: 'id, webViewLink'
    });
    
    console.log(`Template uploaded to Google Drive: ${uploadedFile.data.webViewLink}`);
    console.log(`TEMPLATE ID (SAVE THIS): ${uploadedFile.data.id}`);
    
    return uploadedFile.data.id;
  } catch (error) {
    console.error('Error uploading template:', error);
    throw error;
  }
}

async function uploadTemplates() {
  try {
    // Upload each template
    const templates = [
      //{ path: path.join(__dirname, 'templateProvizije.docx'), name: 'templateProvizije.docx' },
      //{ path: path.join(__dirname, 'templateProdajnaPogodba.docx'), name: 'templateProdajnaPogodba.docx' }
        { path: path.join(__dirname, 'templatePrimopredajniZapisnik.docx'), name: 'templatePrimopredajniZapisnik.docx' }
    ];
    
    for (const template of templates) {
      if (fs.existsSync(template.path)) {
        const templateId = await uploadTemplateToGoogleDrive(template.path, template.name);
        console.log(`Template ${template.name} uploaded with ID: ${templateId}`);
      } else {
        console.error(`Template file ${template.path} does not exist`);
      }
    }
    
    console.log('All templates uploaded successfully');
  } catch (error) {
    console.error('Error uploading templates:', error);
  }
}

async function deleteFileFromDrive(fileId) {
  try {
    const { driveClient } = await initializeGoogleDrive();
    await driveClient.files.delete({ fileId });
    console.log(`File with ID ${fileId} successfully deleted`);
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
    throw error;
  }
}

/**
 * Delete a file from Google Drive by name
 * @param {string} fileName - The name of the file to delete
 * @returns {Promise<void>}
 */
async function deleteFileByName(fileName) {
  try {
    const { driveClient } = await initializeGoogleDrive();
    
    // Search for the file by name
    const response = await driveClient.files.list({
      q: `name='${fileName}'`,
      fields: 'files(id, name)'
    });
    
    if (response.data.files && response.data.files.length > 0) {
      const fileId = response.data.files[0].id;
      await driveClient.files.delete({ fileId });
      console.log(`File '${fileName}' with ID ${fileId} successfully deleted`);
      return true;
    } else {
      console.log(`File '${fileName}' not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting file by name: ${error.message}`);
    throw error;
  }
}


// -----------------------MAIN FUNCTIONS----------------------------
async function initializeGoogleDrive() {
  try {
    // Load service account credentials
    const serviceAccountPath = path.join(__dirname, 'serv_acc_creds.json');
    
    // Set up authentication with service account
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    
    const authClient = await auth.getClient();
    const driveClient = google.drive({ version: 'v3', auth: authClient });
    
    console.log('Service account authentication successful!');
    return { driveClient };
  } catch (error) {
    console.error('Error initializing Google Drive with service account:', error);
    throw error;
  }
}

async function createOrGetFolder(driveClient, parentFolderId, folderName) {
  try {
    const response = await driveClient.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId || 'root'}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    // if folder exists, return its ID
    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // if folder doesn't exist, create it
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : ['root']
    };

    const folder = await driveClient.files.create({
      resource: folderMetadata,
      fields: 'id'
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

const generateCommissionReport = async(transactionId) => {
  /*try {
    const transaction = await Transaction.findById(transactionId)
      .populate('agents')
      .populate('buyers')
      .populate('sellers')
      .populate('property');
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const { driveClient } = await initializeGoogleDrive();
    
    const agent = transaction.agents[0];
    const agentFolderName = `agent_${agent._id}_${agent.firstName}_${agent.lastName}`;
    const agentFolderId = await createOrGetFolder(driveClient, null, agentFolderName);
    
    const transactionFolderName = `transaction_${transaction._id}`;
    const transactionFolderId = await createOrGetFolder(driveClient, agentFolderId, transactionFolderName);
    
    const isBuyerDocument = true; 
    const partyFolderName = isBuyerDocument ? 'buyer' : 'seller';
    const partyFolderId = await createOrGetFolder(driveClient, transactionFolderId, partyFolderName);
    
    const templateFileId = "1ZBqhaxJTicU1feICOABa00Iws9dcL4Yl";
    
    const templatePath = path.join(__dirname, 'templateProvizije.docx');
    const response = await driveClient.files.get(
      { fileId: templateFileId, alt: 'media' },
      { responseType: 'stream' }
    );
    
    // Save the template to a temporary file
    const dest = fs.createWriteStream(templatePath);
    response.data.pipe(dest);
    
    // Wait for the file to be saved
    await new Promise((resolve, reject) => {
      dest.on('finish', resolve);
      dest.on('error', reject);
    });
    
    // Read the template file
    const template = await fs.promises.readFile(templatePath);
    
    // Map transaction data to template variables
    const mappedData = TemplateMapper.mapDataToTemplate(transaction.toObject());
    
    // Create and initialize Docxtemplater
    const zip = new PizZip(template);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Render template with mapped data
    doc.render(mappedData);
    
    // Now doc is defined and can be used
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    const fileName = `commission_report_${transactionId}_${new Date().toISOString().split('T')[0]}.docx`;
    
    const fileMetadata = {
      name: fileName,
      parents: [partyFolderId]
    };
    
    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: buffer
    };
    
    // Note: changed 'resource' to 'requestBody' to match the API
    await driveClient.files.create({
      requestBody: fileMetadata,  // Change resource to requestBody
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: Readable.from(buffer)  // Wrap buffer in a Readable stream
      },
      fields: 'id'
    });
    
    await fs.promises.unlink(templatePath);
    
    return {
      buffer,
      fileName
    };
  } catch (error) {
    console.error('Error generating commission report:', error);
    throw error;
  }*/
 //await deleteFileFromDrive('1oATmumVpuoKJ-eKL_yh4AECG1wThFXCf');
 uploadTemplates();
};

const generateSalesContract = async(transactionId) => {
  try {
      const transaction = await Transaction.findById(transactionId)
          .populate('agents')
          .populate('buyers')
          .populate('sellers')
          .populate('property');
      
      if (!transaction) {
          throw new Error('Transaction not found');
      }

      const { driveClient } = await initializeGoogleDrive();
      
      const agent = transaction.agents[0];
      const agentFolderName = `agent_${agent._id}_${agent.firstName}_${agent.lastName}`;
      const agentFolderId = await createOrGetFolder(driveClient, null, agentFolderName);
      
      const transactionFolderName = `transaction_${transaction._id}`;
      const transactionFolderId = await createOrGetFolder(driveClient, agentFolderId, transactionFolderName);
      
      const partyFolderName = 'legal';  // Legal documents folder
      const partyFolderId = await createOrGetFolder(driveClient, transactionFolderId, partyFolderName);
      
      const templateFileId = "1iYCH59BPYEvVZi4l_GxJaVFw_7qbJ7Fm";
      
      const templatePath = path.join(__dirname, 'templateProdajnaPogodba.docx');
      const response = await driveClient.files.get(
          { fileId: templateFileId, alt: 'media' },
          { responseType: 'stream' }
      );

      const dest = fs.createWriteStream(templatePath);
      response.data.pipe(dest);

      await new Promise((resolve, reject) => {
          dest.on('finish', resolve);
          dest.on('error', reject);
      });

      const template = await fs.promises.readFile(templatePath);

      const mappedData = TemplateMapper.mapDataToTemplate(transaction.toObject());

      const zip = new PizZip(template);
      const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
      });

      doc.render(mappedData);

      const buffer = doc.getZip().generate({ type: 'nodebuffer' });
      const fileName = `sales_contract_${transactionId}_${new Date().toISOString().split('T')[0]}.docx`;
      
      const fileMetadata = {
          name: fileName,
          parents: [partyFolderId]
      };
      
      const media = {
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          body: buffer
      };
      
      const uploadedFile = await driveClient.files.create({
        requestBody: fileMetadata,  // Change resource to requestBody
        media: {
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          body: Readable.from(buffer)  // Wrap buffer in a Readable stream
        },
        fields: 'id, webViewLink'
      });
      
      console.log(`Sales contract uploaded to Google Drive: ${uploadedFile.data.webViewLink}`);

      await fs.promises.unlink(templatePath);

      return {
          buffer,
          fileName
      };
  } catch (error) {
      console.error('Error generating sales contract:', error);
      throw error;
  }
};

async function generatePrimopredajniZapisnik(transactionId) {
  try {
    // 1) Load transaction and populate all needed refs
    const transaction = await Transaction.findById(transactionId)
      .populate('agents')
      .populate('buyers')
      .populate('sellers')
      .populate('property');

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // 2) Init Drive
    const { driveClient } = await initializeGoogleDrive();

    // 3) Build folder structure
    const agent = transaction.agents[0];
    const agentFolderName      = `agent_${agent._id}_${agent.firstName}_${agent.lastName}`;
    const agentFolderId        = await createOrGetFolder(driveClient, null, agentFolderName);
    const transactionFolderName = `transaction_${transaction._id}`;
    const transactionFolderId   = await createOrGetFolder(driveClient, agentFolderId, transactionFolderName);

    const isBuyerDocument = true; 
    const partyFolderName = isBuyerDocument ? 'buyer' : 'seller';
    const partyFolderId        = await createOrGetFolder(driveClient, transactionFolderId, partyFolderName);

    // 4) Fetch the template from Drive
    const templateFileId = '1zjtWSnEyctswOW1tUUTnz7qKhUYGdK5y';
    const templatePath   = path.join(__dirname, 'templatePrimopredajniZapisnik.docx');
    const res = await driveClient.files.get(
      { fileId: templateFileId, alt: 'media' },
      { responseType: 'stream' }
    );
    // save to disk
    await new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(templatePath);
      res.data.pipe(dest);
      dest.on('finish', resolve);
      dest.on('error', reject);
    });

    // 5) Read & render
    const content    = await fs.promises.readFile(templatePath);
    const mappedData = TemplateMapper.mapDataToTemplate(transaction.toObject());
    const zip        = new PizZip(content);
    const doc        = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(mappedData);

    // 6) Generate buffer + filename
    const buffer   = doc.getZip().generate({ type: 'nodebuffer' });
    const date     = new Date().toISOString().split('T')[0];
    const fileName = `primopredajni_zapisnik_${transactionId}_${date}.docx`;

    // 7) Upload back to Drive
    await driveClient.files.create({
      requestBody: {
        name: fileName,
        parents: [partyFolderId]
      },
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: Readable.from(buffer)
      },
      fields: 'id, webViewLink'
    });

    // 8) Cleanup local temp
    await fs.promises.unlink(templatePath);

    return { buffer, fileName };
  } catch (error) {
    console.error('Error generating primopredajni zapisnik:', error);
    throw error;
  }
}

module.exports = { generateCommissionReport, generateSalesContract, generatePrimopredajniZapisnik, createOrGetFolder };

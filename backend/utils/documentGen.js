// for generating documents/getting data
const TemplateMapper = require('./templateMapper')
const fs = require('fs');
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const Transaction = require('../models/Transaction');
const opener = require('opener');

// for downloading and accessing google drive and templated documents
const { google } = require('googleapis');
const readline = require('readline');
const crypto = require('crypto');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');
const algorithm = 'aes-256-cbc';
const password = 'big-huge-calcium-cannons';

/*const decrypt = (file) => {
    const decipher = crypto.createDecipheriv(algorithm, password);
    let decrypted = decipher.update(fs.readFileSync(file, 'utf8'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}*/

//const credentials = JSON.parse(decrypt('credentials.enc'));
const rawData = fs.readFileSync('utils\\creds.json', 'utf8');
const credentials = JSON.parse(rawData);

async function initializeGoogleDrive() {

    // use credentials to use the correct drive
    const oauth2Client = new google.auth.OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        'http://localhost:3001/api/apis/oAuthCallback'
    );

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.readonly'],
        prompt: 'consent',
    });

    //console.log('Authorize this app by visiting this URL:', authUrl);

    opener(authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const code = await new Promise((resolve) => {
        rl.question('Enter the authorization code: ', (code) => {
            rl.close();
            resolve(code);
        });
    });

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('Authentication successful!');

    const driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    return { driveClient };
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
    
    const isBuyerDocument = true; 
    const partyFolderName = isBuyerDocument ? 'buyer' : 'seller';
    const partyFolderId = await createOrGetFolder(driveClient, transactionFolderId, partyFolderName);
    
    const templateFileId = "1duOakJfOR9Cm-jzETM34nU72AtfxLajU";
    
    const templatePath = path.join(__dirname, 'templateProvizije.docx');
    const response = await driveClient.files.get(
      { fileId: templateFileId, alt: 'media' },
      { responseType: 'stream' }
    );
    
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
    
    await driveClient.files.create({
      resource: fileMetadata,
      media: media,
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
  }
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
      
      const templateFileId = "1p7fRJSvBLZcmWR_qMd4d0VgWfelwSMNs";
      
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
          resource: fileMetadata,
          media: media,
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
module.exports = { generateCommissionReport, generateSalesContract, createOrGetFolder };

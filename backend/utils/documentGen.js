// for generating documents/getting data
const TemplateMapper = require('./templateMapper')
const fs = require('fs').promises;
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const Transaction = require('../models/Transaction');

// for downloading and accessing google drive and templated documents
const { google } = require('googleapis');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const password = 'big-huge-calcium-cannons';

/*const decrypt = (file) => {
    const decipher = crypto.createDecipheriv(algorithm, password);
    let decrypted = decipher.update(fs.readFileSync(file, 'utf8'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}*/

//const credentials = JSON.parse(decrypt('credentials.enc'));

async function initializeGoogleDrive() {
    const auth = new google.auth.GoogleAuth({
        keyFile: `${credentials}`,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const driveClient = google.drive({ version: 'v3', auth});
    return {driveClient};
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

        const templatePath = path.join(__dirname, 'templateProvizije.docx');
        const template = await fs.readFile(templatePath);

        const mappedData = TemplateMapper.mapDataToTemplate(transaction.toObject());

        // load the template with docxtemplater
        const zip = new PizZip(template);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // replace placeholders
        doc.setData(mappedData);
        doc.render();

        // generate the output buffer
        const buffer = doc.getZip().generate({ type: 'nodebuffer' });
        const fileName = `commission_report_${transactionId}_${new Date().toISOString().split('T')[0]}.docx`;

        return {
            buffer,
            fileName
        };
    } catch (error) {
        console.error('Error generating commission report:', error);
        throw error;
    }
};

module.exports = { generateCommissionReport };

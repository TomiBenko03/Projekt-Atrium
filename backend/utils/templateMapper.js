const _ = require('lodash');

class TemplateMapper {
    static mappingDefinitions = {
        agent: {
            path: 'agents[0]',
            transforms: {
                name: (agent) => `${agent.firstName} ${agent.lastName}`,
                contactInfo: (agent) => `${agent.email} | ${agent.gsm}`,
            }
        },
        buyer: {
            path: 'buyers[0]',
            transforms: {
                name: (buyer) => `${buyer.firstName} ${buyer.lastName}`,
                fullInfo: (buyer) => `${buyer.firstName} ${buyer.lastName}, ${buyer.address}, ${buyer.emso}, ${buyer.taxNumber}`,
            }
        },
        property: {
            path: 'property',
            transforms: {
                fullAddress: (property) => `${property.address} ${property.mainPropertyId || ''}`,
                priceDetails: (property) => {
                    if (!property.sellingPrice) return 'Ni podatka o ceni';
                    const total = (property.sellingPrice.property || 0) + 
                                (property.sellingPrice.equipment || 0) + 
                                (property.sellingPrice.other || 0);
                    return `Skupaj: ${total}€ (Nepremičnina: ${property.sellingPrice.property || 0}€, ` +
                           `Oprema: ${property.sellingPrice.equipment || 0}€, ` +
                           `Ostalo: ${property.sellingPrice.other || 0}€)`;
                },
                access: (property) => `${property.type === 'Apartment' ? 
                            (property.access || 'Ni podatka o dostopu') : 'Ni relevantno - ne gre za parcelo'}`,
                equipmentDetails: (property) => `${property.equipmentIncluded.join(", ")}`,
                buildingPermit: prop => prop.buildingPermitNumber || 'Ni podatka',
                energyCertificate: prop => prop.energyCertificateNumber || 'Ni podatka',
                intendedUse: prop => prop.intendedUseCertificateNumber || 'Ni podatka',
            }
        },
        seller: {
            path: 'sellers[0]',
            transforms: {
                name: (seller) => `${seller.firstName} ${seller.lastName}`,
                fullInfo: (seller) => `${seller.firstName} ${seller.lastName}, ${seller.address}, ${seller.emso}, ${seller.taxNumber}`,
            }
        },
        transaction: {
            path: '',  // root level
            transforms: {
                handoverDeadline: (data) => new Date(data.handoverDeadline).toLocaleDateString('sl-SI'),
                kwCaresCommission: (data) => (data.commissionGross - 20).toFixed(2),
                isReferral: (data) => `${data.referral? "☒ DA ☐ NE" : "☐ DA ☒ NE"}`,
                contractPreparationDeadline: (data) => new Date(data.contractPreparationDeadline).toLocaleDateString('sl-SI'),
                depositDeadline: (data) => new Date(data.paymentDetails.deposit.deadline).toLocaleDateString('sl-SI'),
                remainingDeadline: (data) => new Date(data.paymentDetails.remaining.deadline).toLocaleDateString('sl-SI'),
                sellerExpensesFull: (data) => {
                    if (!data.sellerExpenses || !Array.isArray(data.sellerExpenses)) {
                        return 'Ni stroškov';
                    }
                    return data.sellerExpenses.map(expense => 
                        `${expense.description}: ${expense.amount}€`
                    ).join(", ") || 'Ni stroškov';
                },
                buyerExpensesFull: (data) => {
                    if (!data.buyerExpenses || !Array.isArray(data.buyerExpenses)) {
                        return 'Ni stroškov';
                    }
                    return data.buyerExpenses.map(expense => 
                        `${expense.description}: ${expense.amount}€`
                    ).join(", ") || 'Ni stroškov';
                },
                isMortgageReleaseProvided: tx => tx.hypothecReleaseDate
                            ? 'Izbrisna pobotnica je bila izdana.'
                            : 'Izbrisna pobotnica ni bila izdana ali pa ni podanega podatka.',
                legalApprovalDecisionNumber: tx => tx.legalApproval?.number || 'Ni podatka',
                legalApprovalDecisionDate:   tx => tx.legalApproval?.date
                    ? new Date(tx.legalApproval.date).toLocaleDateString('sl-SI')
                    : 'Ni podatka',
                contractPrice: tx => {
                const { property } = tx;
                const sum = (property.sellingPrice.property||0)
                            + (property.sellingPrice.equipment||0)
                            + (property.sellingPrice.other||0);
                return sum.toLocaleString('sl-SI') + ' €';
                },
                // dates
                handoverDate: tx => new Date(tx.handoverDate).toLocaleDateString('sl-SI'),
                contractDate: tx => new Date(tx.contractDate).toLocaleDateString('sl-SI'),

                // payer
                payerName: tx => tx.paymentDetails.deposit.alreadyPaid?.account || 'Ni podatka',

                // meter readings
                electricMeterLocation: tx => tx.electricMeterLocation || 'Ni podatka o lokaciji.',
                electricMeterNumber:   tx => tx.electricMeterNumber   || 'Ni podatka o stevcu za elektriko.',
                electricTariff1:       tx => tx.electricTariff1       || 'Ni podatka o prvi tarifi.',
                electricTariff2:       tx => tx.electricTariff2       || 'Ni podatka o drugi tarifi.',
                electricTotal:         tx => tx.electricTotal != null
                                            ? tx.electricTotal
                                            : ((Number(tx.electricTariff1)||0) + (Number(tx.electricTariff2)||0)),

                hotWaterMeterNumber:   tx => tx.hotWaterMeterNumber   || 'Ni podatka o stevcu za vroco vodo.',
                hotWaterReading:       tx => tx.hotWaterReading       || 'Ni podatka o stanju.',

                coldWaterMeterNumber:  tx => tx.coldWaterMeterNumber  || 'Ni podatka o stevcu za mrzlo vodo.',
                coldWaterReading:      tx => tx.coldWaterReading      || 'Ni podatka o stanju.',

                gasMeterNumber:        tx => tx.gasMeterNumber        || 'Ni podatka o stevcu za plin.',
                gasReading:            tx => tx.gasReading            || 'Ni podatka o stanju.',

                heatingReading:        tx => tx.heatingReading        || 'Ni podatka.',

                // transfers
                manager:             tx => tx.manager             || 'Ni podatka.',
                electricityTransfer: tx => tx.electricityTransfer || 'Ni podatka.',
                gasTransfer:         tx => tx.gasTransfer         || 'Ni podatka.',
                waterTransfer:       tx => tx.waterTransfer       || 'Ni podatka.',
                heatingTransfer:     tx => tx.heatingTransfer     || 'Ni podatka.',

                // keys (nested object)
                keys: tx => ({
                    mainEntrance: tx.keys?.mainEntrance || 'Ni podatka.',
                    apartment:    tx.keys?.apartment    || 'Ni podatka.',
                    cellar:       tx.keys?.cellar       || 'Ni podatka.',
                    mailbox:      tx.keys?.mailbox      || 'Ni podatka.',
                    other1:       tx.keys?.other1       || 'Ni podatka.',
                    other2:       tx.keys?.other2       || 'Ni podatka.',
                }),

                // docs, remarks, obligations
                documentationList: tx => Array.isArray(tx.documentationList)
                    ? tx.documentationList.join(', ')
                    : (tx.documentationList || 'Ni podatkov.'),

                buyerRemarks:      tx => tx.buyerRemarks      || 'Ni podatka',
                sellerObligations: tx => tx.sellerObligations || 'Ni podatka',
                obligationsDeadline: tx =>
                    tx.obligationsDeadline
                    ? new Date(tx.obligationsDeadline).toLocaleDateString('sl-SI')
                    : 'Ni podatka.',
            }
        }
    }
    static mapDataToTemplate(data) {
        const mappedData = {};

        // process each mapping definition
        Object.entries(this.mappingDefinitions).forEach(([key, definition]) => {
            const sourceData = definition.path ? _.get(data, definition.path) : data;
            
            // add basic fields - address, gsm, taxNumber, price...
            // very cool
            if (!sourceData) {
                console.warn(`Source data not found for path: ${definition.path}`);
                return;
            }

            mappedData[key] = { ...sourceData };
            // apply transforms - full payment,  kw cares commission, full name...
            if (definition.transforms) {
                Object.entries(definition.transforms).forEach(([transformKey, transformFn]) => {
                    try {
                        _.set(mappedData, `${key}.${transformKey}`, transformFn(sourceData));
                    } catch (error) {
                        console.error(`Error applying transform ${transformKey}:`, error);
                    }
                });
            }
        });

        return mappedData;
    }

    // helper function to replace placeholders in template
    static replacePlaceholders(template, data) {
        return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
            const value = _.get(data, path.trim());
            if (value === undefined) {
                console.warn(`Placeholder not found: ${path}`);
                return match; // Return the original placeholder
            }
            return value;
        });
    }
}

module.exports = TemplateMapper;

const _ = require('lodash');

class TemplateMapper {
    static mappingDefinitions = {
        agent: {
            path: 'agents[0]',
            transforms: {
                name: (agent) => `${agent.firstName} ${agent.lastName}`,
                contactInfo: (agent) => `${agent.email} | ${agent.gsm}`
            }
        },
        buyer: {
            path: 'buyers[0]',
            transforms: {
                name: (buyer) => `${buyer.firstName} ${buyer.lastName}`,
            }
        },
        property: {
            path: 'property',
            transforms: {
                fullAddress: (property) => `${property.address} ${property.mainPropertyId || ''}`,
                priceDetails: (property) => ({
                    total: property.sellingPrice.property + 
                           (property.sellingPrice.equipment || 0) + 
                           (property.sellingPrice.other || 0),
                    breakdown: {
                        property: property.sellingPrice.property,
                        equipment: property.sellingPrice.equipment,
                        other: property.sellingPrice.other
                    }
                })
            }
        },
        seller: {
            path: 'sellers[0]',
            transforms: {
                name: (seller) => `${seller.firstName} ${seller.lastName}`,
            }
        },
        transaction: {
            path: '',  // root level
            transforms: {
                handoverDeadline: (data) => new Date(data.handoverDeadline).toLocaleDateString('sl-SI'),
                kwCaresCommission: (data) => (data.commissionGross - 20).toFixed(2)
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

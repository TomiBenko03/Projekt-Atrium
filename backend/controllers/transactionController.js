const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent');
const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Property = require('../models/Property');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, VerticalAlign, WidthType } = require("docx");

const createTransaction = async (req, res) => {
    try {
        const {
            sellers,
            sellerSurnames,
            buyers,
            buyerSurnames,
            propertyName,
            paymentDetailsDepositAmount,
            paymentDetailsDepositDeadline,
            paymentDetailsDepositAccount,
            paymentDetailsRemainingAmount,
            paymentDetailsRemainingDeadline,
            paymentDetailsRemainingAccount,
            paymentDescriptor,
            buyerMortgage,
            mortgageAmount,
            handoverDeadline,
            sellerExpenses,
            buyerExpenses,
            contractPreparationDeadline,
            contractPreparedBy,
            legalDocuments,
        } = req.body;

        // Find the agent by id
        const agentId = req.session.agentId;
        const agent = await Agent.findById(agentId);
        if (!agent) throw new Error('Agent not found');

        // Resolve sellers by names
        const sellerIds = await Promise.all(
            (sellers || []).map(async (name, index) => {
                const seller = await Seller.findOne({ firstName: name.trim(), lastName: sellerSurnames[index]?.trim(), agentId: agent._id });
                if (!seller) throw new Error(`Seller ${name} ${sellerSurnames[index]} not found`);
                return seller._id;
            })
        );

        // Resolve buyers by names
        const buyerIds = await Promise.all(
            (buyers || []).map(async (name, index) => {
                const buyer = await Buyer.findOne({ firstName: name.trim(), lastName: buyerSurnames[index]?.trim(), agentId: agent._id });
                if (!buyer) throw new Error(`Buyer ${name} ${buyerSurnames[index]} not found`);
                return buyer._id;
            })
        );

        // Find the property by its mainPropertyId
        const property = await Property.findOne({ mainPropertyId: propertyName });
        if (!property) throw new Error('Property not found');

        // Create the transaction
        const newTransaction = new Transaction({
            agent: agent._id,
            sellers: sellerIds,
            buyers: buyerIds,
            property: property._id,
            paymentDetails: {
                deposit: {
                    amount: Number(paymentDetailsDepositAmount) || 0,
                    deadline: paymentDetailsDepositDeadline || null,
                    account: paymentDetailsDepositAccount || '',
                },
                remaining: {
                    amount: Number(paymentDetailsRemainingAmount) || 0,
                    deadline: paymentDetailsRemainingDeadline || null,
                    account: paymentDetailsRemainingAccount || '',
                },
            },
            paymentDescriptor: paymentDescriptor || '',
            buyerMortgage: Boolean(buyerMortgage),
            mortgageAmount: Number(mortgageAmount) || 0,
            handoverDeadline,
            sellerExpenses: sellerExpenses || [],
            buyerExpenses: buyerExpenses || [],
            contractPreparationDeadline,
            contractPreparedBy,
            legalDocuments,
        });

        // Save the transaction
        const savedTransaction = await newTransaction.save();
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: savedTransaction,
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(400).json({
            message: 'Failed to create transaction',
            error: error.message,
        });
    }
};

const searchTransaction = async (req, res) => {
    try {
        console.log('Searching for transaction:', req.params.id); // Debug log¸
        console.log('Searching for transaction:', req.params.id);
        
        // Validate ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid transaction ID format' });
        }

        const transaction = await Transaction.findById(req.params.id)
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property')
            .exec();

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Log successful find
        console.log('Transaction found:', transaction._id);
        
        res.json(transaction);
    } catch (error) {
        console.error('Search error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error searching transaction',
            error: error.message
        });
    }
};

const getAgentTransactions = async (req, res) => {
    try {
        const agentId = req.session.agentId;
        const transactions = await Transaction.find({ agent: agentId })
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property');
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transactions', error });
    }
};

// helper function for generating reports
const formatCheckbox = (value) => {
    return `${value ? '☒' : '☐'} DA ${!value ? '☒' : '☐'} NE`;
  };

// provizijsko porocilo
const generateCommissionReport = async(req, res) => {
    try{
    const transaction = await require('../models/Transaction').findById(req.params.id)
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property');
    if (!transaction){
        return res.status(404).json({message: 'Transaction not found'});
    }

    // some calculations needed for the report
    const commissionPercentage = 4;
    const totalPrice = transaction.property.price;
    const commissionAmount = (totalPrice * commissionPercentage) / 100;
    const kwCaresDeduction = 20;
    const finalCommissionAmount = commissionAmount - kwCaresDeduction;

    // additional services (if data is available)
    const equipmentPrice = transaction.property.sellingPrice?.equipment || 0;
    const otherPrice = transaction.property.sellingPrice?.other || 0;
    const totalAdditionalServices = equipmentPrice + otherPrice;

    // to string
    const additionalServicesString = totalAdditionalServices > 0
      ? `Oprema: ${equipmentPrice}€, Ostalo: ${otherPrice}€, Skupaj: ${totalAdditionalServices}€`
      : 'N/A';

    const today = new Date().toLocaleDateString();

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Calibri",
              size: 22 //11pt
            }
          }
        }
      },

      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(`Agent: ${transaction.agent.firstName} ${transaction.agent.lastName}. `),
              new TextRun(`Datum oddaje obračuna: ${today}`,),
              new TextRun({
                text: `Naslov nepremičnine in ID znak (št. stanovanja): ${transaction.property.address}, ID: ${transaction.property.mainPropertyId}`,
                break: true
              }),
              new TextRun({
                text: "",
                break: true
              })
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Prodajalec: ${transaction.sellers.map(s => `${s.firstName} ${s.lastName}`).join(', ')}. `),
              new TextRun(`Plačnik: ${formatCheckbox(transaction.sellers[0]?.isPayer)}, `),
              new TextRun(`št. računa: ${transaction.sellers[0]?.bankAccount || 'N/A'}`),
              new TextRun({
                text: `plačano: ${formatCheckbox(transaction.sellers[0]?.hasPaid)}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je zastopal prodajalca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Kupec: ${transaction.buyers.map(b => `${b.firstName} ${b.lastName}`).join(', ')}. `),
              new TextRun(`Plačnik: ${formatCheckbox(transaction.buyers[0]?.isPayer)}, `),
              new TextRun(`št. računa: ${transaction.buyers[0]?.bankAccount || 'N/A'}, `),
              new TextRun({
                text: `plačano: ${formatCheckbox(transaction.buyers[0]?.hasPaid)}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je zastopal kupca (ime in priimek agenta): ${transaction.agent.firstName} ${transaction.agent.lastName}.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Prodajna cena: ${transaction.property.price}€. `),
              new TextRun(`Skupaj (%): ${commissionPercentage}%. `),
              new TextRun(`Skupaj provizija znesek: ${commissionAmount}€, `),
              new TextRun({
                text: `(-20 € - KW cares): -${kwCaresDeduction}€`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Znesek provizije, ki vam ga je potrebno nakazati: ${finalCommissionAmount}€. (če gre za delitev potem je to 70%, v kolikor ste capper potem odštejete 10% franšize). `,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `REFERRAL/NAPOTITEV: `,
                bold: true,
                underline: true,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`napotitev ste prejeli: ${transaction.referralReceived ? 'DA' : 'NE'}. `),
              new TextRun(`Kdo vam ga je posredoval: ${transaction.referralFrom || 'N/A'}, `),
              new TextRun(`napotitev ste posredovali: ${transaction.referralGiven ? 'DA' : 'NE'}. `),
              new TextRun(`Komu ste ga posredovali: ${transaction.referralTo || 'N/A'}. `),
              new TextRun({
                text: `Višina dogovorjenega refferal-a za obračun: ${transaction.referralPercentage || '0'}%.`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun(`Interne dodatne storitve: ${additionalServicesString}. `),
              new TextRun(`Zunanji pogodbeni dobavitelji: ${transaction.externalContractors || 'N/A'}. `),
              new TextRun({
                text: `Provizija od dobavitelja: ${transaction.contractorCommission || 'N/A'}. `,
                break: true
              }),

            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Kdo je vodil prodajni postopek (ime in priimek): ${transaction.agent.firstName} ${transaction.agent.lastName}`,
                break: true
              }),

            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Odgovoren za prodajno pogodbo (ime, priimek in naziv družbe): ${transaction.contractPreparedBy || 'N/A'}`,
                break: true
              }),
            ]
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Datum zaključka: ${new Date(transaction.handoverDeadline).toLocaleDateString()}`,
                break: true
              }),
            ]
          }),
        ]
      }]
    })

    const buffer = await Packer.toBuffer(doc);
    const filename = transaction.agent.firstName + "_izplacilo_provizije";

    res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${filename}.docx`,
    })
    res.send(buffer);
    } catch (error){
    console.error(`Error generating report:`, error);
    res.status(500).json({message: `Error generating report`})
  };
}

// zavezujoca ponudba za nakup nepremicnine
const generateBindingOffer = async (req, res) => {
  try{
    const transaction = await require('../models/Transaction').findById(req.params.id)
            .populate('agent')
            .populate('buyers')
            .populate('sellers')
            .populate('property');
    if (!transaction){
        return res.status(404).json({message: 'Transaction not found'});
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Times New Roman",
              size: 24, //11pt,
            },
            paragraph: {
              spacing: {
                line: 276, // 1.15 line spacing
                before: 200,
                after: 200,
              }
            }
          }
        }
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `ZAVEZUJOČA PONUDBA ZA NAKUP NEPREMIČNINE`,
                  bold: true,
                  size: 24,
                })
              ],
            alignment: AlignmentType.CENTER,
            // 20pt spacing after the paragraph
            spacing: {after: 400},
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "1. PRODAJALEC (ime in priimek/firma, naslov, EMŠO/matična, davčna):",
              })
            ],
            spacing: {after: 300},
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${transaction.sellers.map(s => `${s.firstName} ${s.lastName} ${s.address} ${s.emso} ${s.taxNumber}`).join(', ')}`,
              })
            ],
            spacing: {after: 300},
          }),


          new Paragraph({
            children: [
              new TextRun({
                text: "2. PONUDNIK (ime in priimek/firma, naslov, EMŠO/matična, davčna):",
              })
            ],
            spacing: {after: 300},
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${transaction.buyers.map(b => `${b.firstName} ${b.lastName} ${b.address} ${b.emso} ${b.taxNumber}`).join(', ')}`,
              })
            ],
            spacing: {after: 300},
          }),


          new Paragraph({
            children: [
              new TextRun({
                text: "3. PREDMET PONUDBE (nakup nepremičnin):",
              })
            ],
            spacing: {after: 300},
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Predmet ponudbe je nepremicnina ${transaction.property.mainPropertyId} ${transaction.property.address} `,
              }),
              new TextRun({
                text: `z opremo ${transaction.property.equipmentIncluded.join(', ')} (v nadaljevanju predmetna nepremičnina).`,
              })
            ],
            spacing: {after: 300},
          }),


          new Paragraph({
            children: [
              new TextRun({
                text: "4. PONUJENI POGOJI NAKUPA:",
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `   -   ponujena cena ${transaction.property.price}EUR`,
              }),
              new TextRun({
                text: `   -   ponujeni plačilni roki ${
                  transaction.paymentDetails.deposit.deadline
                    ? new Date(transaction.paymentDetails.deposit.deadline).toLocaleDateString("sl-SI") // Format to DD.MM.YYYY
                    : "N/A"
                } za varščino in ${
                  transaction.paymentDetails.remaining.deadline
                    ? new Date(transaction.paymentDetails.remaining.deadline).toLocaleDateString("sl-SI")
                    : "N/A"
                } za preostanek kupnine`,
                break: true,
              }),
              new TextRun({
                text: `   -   prevzem nepremicnine ${transaction.handoverDeadline ? new Date(transaction.handoverDeadline).toLocaleDateString("sl-SI") : "N/A"}`,
                break: true,
              }),
              new TextRun({
                text: `   -   stroski prodajalca${transaction.sellerExpenses.map(e => `${e.description} ${e.amount}`).join(', ')}, stroski kupca${transaction.buyerExpenses.map(e => `${e.description} ${e.amount}`).join(', ')}`,
                break: true,
              }),
              new TextRun({
                text: `   -   dodatno (oprema itd.) ${transaction.property.equipmentIncluded.join(', ')}`,
                break: true,
              })
            ],
            spacing: {after: 300},
          }),


          new Paragraph({
            children: [
              new TextRun({
                text: "5. NARAVA PONUDBE:",
              })
            ],
            spacing: {after: 300},
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ponudba je zavezujoča in velja za čas ______ dni do podpisa te ponudbe.`,
              }),
              new TextRun({
                text: "",
                break: true,
              }),
              new TextRun({
                text: `Pogodbeni stranki se dogovorita, da ponudba velja pod odložnim pogojem, in sicer da ponudnik v roku 3. dni po oddaji zavezujoče ponudbe ne bo ugotovil stvarnih in pravnih napak na predmetni nepremičnini. V kolikor v roku 3 dni ponudnik prodajalca ali njegovega pooblaščenca pisno ne obvesti o ugotovljenih napakah, se šteje da ponudnik priznava, da se nepremičnina prodaja po načelu videno-kupljeno.`,
                break: true,
              }),
              new TextRun({
                text: "",
                break: true,
              }),
              new TextRun({
                text: `Ponudnik je seznanjen, da gre za zavezujočo ponudbo, kar pomeni, da je v primeru sprejema ponudbe s strani prodajalca, pogodba med strankama glede bistvenih sestavin sklenjena. Stranske točke pa bosta pogodbeni stranki uredili v prodajni pogodbi.`,
                 break: true,
              }),
            ]
          }),


          new Paragraph({
            children: [
              new TextRun({
                text: "6. VARŠČINA:",
              })
            ],
            spacing: {after: 300},
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ponudnik plača varščino v znesku ________% prodajne cene kar znaša ${transaction.paymentDetails.deposit.amount}EUR na dan podpisa na fiduciarni račun nepremičninske družbe`,
              }),
              new TextRun({
                text: ` Market center Omnis d.o.o., Partizanska cesta 26, 2000 Maribor, št. fid. rač. SI56 6100 0002 4255 779, odprt pri Delavska hranilnica Ljubljana d.d., sklic: 00 ${transaction.property.mainPropertyId}, pod namen: varščina med ${transaction.buyers.map(b => `${b.firstName} ${b.lastName}`).join(', ')} in ${transaction.sellers.map(s => `${s.firstName} ${s.lastName}`).join(', ')}`,
                bold: true,
              }),
              new TextRun({
                text: " s čimer utrdi svojo obveznost skleniti prodajno pogodbo, če bo v postopku zbiranja ponudb uspel."
              }),
              new TextRun({
                text: ` Če ponudnik v postopku zbiranja ne uspe, mu nepremičninska družba vrne znesek varščine v roku treh delovnih dni po poteku roka za izjavo prodajalca o izbiri ponudnika na ponudnikov`,
              }),
              new TextRun({
                text: ` TRR ${transaction.buyers[0]?.bankAccount || 'N/A'} odprt pri banki ${transaction.buyers[0]?.bankName || 'N/A'}`,
                bold: true,
              }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Če ponudnik v postopku zbiranja ponudb uspe in sklene prodajno pogodbo, plačilo varščine velja za plačilo are ki se všteje v kupnino.",
                break: true,
              }),
              new TextRun({
                text: "",
                break: true,
              }),
              new TextRun({
                text: "Če ponudnik kasneje brez razloga odstopi od sklenjene pogodbe in ne izpolni svoje glavne obveznosti plačila kupnine, je prodajalec po lastni izbiri upravičen bodisi zahtevati izpolnitev pogodbe, če je to še mogoče in povrnitev škode, aro pa všteti v odškodnino, bodisi se zadovoljiti s prejeto aro. Družba Market center Omnis d.o.o. si je v tem primeru upravičena zadržati znesek, ki ustreza stroškom posredovanja po pogodbi o posredovanju, morebiten preostanek varščine pa nakaže na prodajalčev TRR najkasneje 3 dni od prejema podatkov prodajalca za nakazilo.",
                break: true,
              }),
              new TextRun({
                text: "",
                break: true,
              }),
              new TextRun({
                text: "Če prodajalec po sprejemu ponudbe odstopi od sklenjene pogodbe in ne izpolni svoje glavne obveznosti izročitve nepremičnine, je ponudnik upravičen po lastni izbiri zahtevati bodisi izpolnitev pogodbe, če je to še mogoče, bodisi povrnitev škode in vrnitev are, bodisi vrnitev dvojne are. Družba Market center Omnis d.o.o. si je v tem primeru iz sredstev varščine, ki je bila plačana s strani ponudnika, upravičena zadržati znesek, ki ustreza stroškom posredovanja po pogodbi o posredovanju, preostanek varščine pa je dolžna vrniti ponudniku  najkasneje v roku 3. dni.",
                break: true,
              }),
            ],
          }),


          new Paragraph({
            children: [
              new TextRun({
                text: "7. IZJAVE PONUDNIKA:",
              })
            ],
            spacing: {after: 300},
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ponudnik še dodatno izjavlja:`,
              }),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "   -   da se strinja s pogoji prodaje in pravili postopka prodaje;",
              }),
              new TextRun({
                text: "   -   da je seznanjen z vsebino Izjave prodajalca o stanju predmetne nepremičnine;",
                break: true,
              }),
              new TextRun({
                text: "   -   da jamči, da so podatki v ponudbi resnični in točni;",
                break: true,
              }),
              new TextRun({
                text: "   -   da lahko prodajalec obdeluje v tej ponudbi zapisane osebne podatke za namen izvedbe predmetnega postopka prodaje",
                break: true,
              })
            ]
          }),


          new Paragraph({
            children: [
              new TextRun({
                text: "8. KRAJ IN DATUM: ________________________________",
              })
            ],
            spacing: {after: 300},
          }),

          
          new Paragraph({
            children: [
              new TextRun({
                text: "9. PODPIS PONUDNIKA (in žig pravne osebe):",
              }),
              new TextRun({
                text: "_______________________________",
                break: true,
              })
            ],
            spacing: {after: 300},
          }),

         ],
        }
      ],

    })


  const buffer = await Packer.toBuffer(doc);
  const filename = transaction.agent.firstName + "_zavezujoca_ponudba";

  res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=${filename}.docx`,
  })
  res.send(buffer);
  } catch (error){
  console.error(`Error generating report:`, error);
  res.status(500).json({message: `Error generating report`})
};
}

module.exports = {
    createTransaction,
    searchTransaction,
    getAgentTransactions,
    generateCommissionReport,
    generateBindingOffer,
};

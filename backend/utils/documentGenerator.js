const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const ExcelJS = require('exceljs');
const Transaction = require('../models/Transaction');

// helper function for generating reports
const formatCheckbox = (value) => {
    return `${value ? '☒' : '☐'} DA ${!value ? '☒' : '☐'} NE`;
  };

// provizijsko porocilo
const generateCommissionReport = async(transactionId) => {
    const transaction = await Transaction.findById(transactionId)
            .populate('_id')
            .populate('agents')
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
              new TextRun(`Agent: ${transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}. `),
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
                text: `Kdo je zastopal prodajalca (ime in priimek agenta):${transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}.`,
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
                text: `Kdo je zastopal kupca (ime in priimek agenta): ${transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}.`,
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
                text: `Kdo je vodil prodajni postopek (ime in priimek):  ${transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}`,
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
    return {
        buffer,
        filename: ` ${transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}_izplacilo_provizije`
    }
}

// zavezujoca ponudba za nakup nepremicnine
const generateBindingOffer = async (transactionId) => {
    const transaction = await Transaction.findById(transactionId)
            .populate('agents')
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
  const filename =  transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_zavezujoca_ponudba";

    return {
        buffer,
        filename
    }
};

/*
Tukaj polno informacij manjka za vpis v dokument:
- dostop do nepremicnine
- izjava o izdaji izbrisne pobotnice(? dafuq is this tho)
- uporabno/gradbeno dovoljenje
- energetska izkaznica
- potrdilo o namenski rabi
- st odlocbe in datum izdaje za odobritev pravnega posla
- Način (hipotekarni kredit, lastna sredstva, nehipotekarni kredit) 
  in roki plačila (koliko dni od overitve koliko kupnine in koliko are je že bilo nakazano)
*/
const generateSalesContract = async (transactionId) => {
    const transaction = await Transaction.findById(transactionId)
        .populate('agents')
        .populate('buyers')
        .populate('sellers')
        .populate('property');

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
      sections: [{
        properties: {},
        children: [
            new Paragraph({
                children:[
                    new TextRun({
                        text: "Narocilo prodajne pogodbe",
                        bold: true,
                    }),
                ]
            }),
            
            new Paragraph({
                children:[
                    new TextRun({
                        text: '   -   1. Ime, priimek, naslov stalnega prebivališča, EMŠO, davčna št. prodajalca in kupca:',
                        break: true,
                    })
                ]
            }),

            new Paragraph({
                children:[
                    new TextRun({
                        text: `         ${transaction.buyers[0]?.firstName} ${transaction.buyers[0]?.lastName}, ${transaction.buyers[0]?.address}, ${transaction.buyers[0]?.emso}, ${transaction.buyers[0]?.taxNumber}`,
                    }),
                    new TextRun({
                        text: `         ${transaction.sellers[0]?.firstName} ${transaction.sellers[0]?.lastName}, ${transaction.sellers[0]?.address}, ${transaction.sellers[0]?.emso}, ${transaction.sellers[0]?.taxNumber}`,
                        break: true
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   2. ID znak nepremičnine:',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         ${transaction.property.mainPropertyId}`,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   3. Dostop do predmetne nepremičnine (če gre za parcelo):',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         ${transaction.property.type === 'Apartment' ? 
                            (transaction.property.access || 'Ni podatka o dostopu') : 'Ni relevantno - ne gre za parcelo'}`,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   4. Izjave o izdaji izbrisne pobotnice (če je vknjižena hipoteka):',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         Ni vknjizene hipoteke.`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   5. Uporabno/gradbeno dovoljenje:',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         Ni vknjizenega uporabnega/gradbenega dovoljenja.`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   6. Energetska izkaznica (stanovanje, hiša):',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         Ni vknjizene energetske izkaznice.`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   7. Potrdilo o namenski rabi:',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         Ni vknjizenega potrdila o namenski rabi.`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   8. Št. odločbe in datum izdaje za odobritev pravnega posla (kmetijsko zemljišče):',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         Ni vknjizenega potrdila o namenski rabi.`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   9. Pogodbena cena, cena nepremičnine (če se bo v pogodbi ločevalo ceno nepremičnin in opreme):',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                    new TextRun({
                        text: `         Skupna pogodbena cena: ${transaction.property.price.toLocaleString('sl-SI')}€`,
                    }),
                    new TextRun({
                        text: `         Cena nepremičnine: ${(transaction.property.price - (transaction.property.sellingPrice?.equipment || 0)).toLocaleString('sl-SI')}€`,
                        break: true
                    }),
                    transaction.property.sellingPrice?.equipment > 0 && new TextRun({
                        text: `         Cena opreme: ${transaction.property.sellingPrice.equipment.toLocaleString('sl-SI')}€`,
                        break: true
                    }),
                    transaction.property.sellingPrice?.other > 0 && new TextRun({
                        text: `         Ostali stroški: ${transaction.property.sellingPrice.other.toLocaleString('sl-SI')}€`,
                        break: true
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   10. Katera oprema se prodaja:',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         ${transaction.property.equipmentIncluded.join(", ")}`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   11. Način (hipotekarni kredit, lastna sredstva, nehipotekarni kredit) in roki plačila(koliko dni od overitve koliko kupnine in koliko are je že bilo nakazano):',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                    new TextRun({
                        text: `         Nacin placila: ${transaction.paymentDescriptor}`,
                    }),
                    new TextRun({
                        text: `         Že vplačana ara: ${transaction.paymentDetails.deposit.amount}`,
                        break: true,
                    }),
                    new TextRun({
                        text: `         Datum vplačila are: ${new Date(transaction.paymentDetails.deposit.deadline).toLocaleDateString('sl-SI')}`,
                        break: true,
                    }),
                    new TextRun({
                        text: `         Preostali znesek: ${transaction.paymentDetails.remaining.amount}`,
                        break: true,
                    }),
                    new TextRun({
                        text: `         Stevilo dni do overitve: ${new Date(transaction.paymentDetails.remaining.deadline).toLocaleDateString('sl-SI')}`,
                        break: true,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   12. Št. TRR-ja prodajalca in pri kateri banki je le-ta odprt (oz. TRR od osebe kamor se bo kupnina nakazovala):',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         ${transaction.buyers[0]?.bankAccount}, ${transaction.buyers[0]?.bankName}`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   13. Rok za izročitev po plačilu celotne kupnine:',
                        break: true,
                    })                   
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         ${new Date(transaction.handoverDeadline).toLocaleDateString('sl-SI')}`,
                    })
                ]
            }),

            new Paragraph({
                children:[
                     new TextRun({
                        text: '   -   14. Stroški prodajalca (in kateri se poplačajo iz are) ter stroški kupca:',
                        break: true,
                    })                   
                ]
            }),           

            new Paragraph({
                children:[
                     new TextRun({
                        text: `         Stroski prodajalca - ${transaction.sellerExpenses.map(e => `${e.description} ${e.amount}`).join(', ')}`,
                    }),
                    new TextRun({
                        text: `         Stroski kupca - ${transaction.buyerExpenses.map(e => `${e.description} ${e.amount}`).join(', ')}`,
                        break: true,
                    })
                ]
            }),

            new Paragraph({
                children: [
                    new TextRun({
                        text: 'PRODAJALEC                  KUPEC                   POSREDNIK',
                        break: true,
                        bold: true,
                        size: 28,
                    }),
                ],
                alignment: AlignmentType.LEFT, 
            }),
        ]
      }]      
    })

  const buffer = await Packer.toBuffer(doc);
  const filename =transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_narocilo_prodajne_pogodbe";

    return {
        buffer,
        filename
    }
}

const generateCalculationOfRealEstateCosts = async (transactionId) => {
    const transaction = await Transaction.findById(transactionId)
        .populate('agents')
        .populate('buyers')
        .populate('sellers')
        .populate('property');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OBRAČUN');
    
    worksheet.columns = [
      {width: 9},  // A
      {width: 4}, // B
      {width: 15}, // C
      {width: 9}, // D
      {width: 12}, // E
      {width: 12}, // F
      {width: 7}, // G
      {width: 12}, // H
    ]

    worksheet.rows = [
      {height: 45}, // 1
      {height: 30}, // 2
      {height: 30}, // 3
      {height: 30}, // 4
      {height: 30}, // 5
      {height: 33}, // 6
      {height: 22}, // 7
      {height: 31}, // 8

      {height: 15}, // 9
      {height: 15}, // 10
      {height: 15}, // 11
      {height: 15}, // 12
      {height: 15}, // 13
      {height: 15}, // 14
      {height: 15}, // 15
      {height: 15}, // 16
      {height: 15}, // 17
      {height: 15}, // 18
      {height: 15}, // 19

      {height: 20}, // 20
      {height: 30}, // 21
      {height: 25}, // 22
      {height: 25}, // 23
      {height: 25}, // 24
      {height: 20}, // 25
      {height: 15}, // 26
      {height: 15}, // 27
    ];
    // START / TITLE
    worksheet.mergeCells("A1:H1");
    worksheet.getCell("A1").value = "KW SLOVENIA";
    worksheet.getCell("A1").font = {size: 14, bold: true};

    worksheet.mergeCells("A2:H2");
    worksheet.getCell("A2").value = "OBRAČUN STROŠKOV PRODAJE NEPREMIČNINE";
    worksheet.getCell("A2").alignment = {horizontal: 'center'};
    worksheet.getCell("A2").font = {size: 14, bold: true};

    worksheet.mergeCells("A3:H3");
    worksheet.getCell("A4").value = "STRANKA";
    worksheet.getCell("A4").font = {bold: true};

    worksheet.mergeCells("A4:H4");
    worksheet.getCell("A5").value = `${transaction.buyers[0]?.firstName} ${transaction.buyers[0]?.lastName}, ${transaction.buyers[0]?.address}`;

    worksheet.mergeCells("A5:H5");
    worksheet.getCell("A6").value = `Za nepremičnino: ${transaction.property.mainPropertyId} na naslovu ${transaction.property.address}`;
    worksheet.getCell("A6").font = {underline: true};

    worksheet.mergeCells("A6:H6");
    worksheet.mergeCells("A7:H7");

    // HEADERS FOR TABLE
    worksheet.getCell("A8").value = "Zap. Št.";
    worksheet.getCell("A8").alignment = {vertical: 'middle', horizontal: 'center'};
  
    worksheet.mergeCells("B8:E8");
    worksheet.getCell("B8").value = "STORITEV";
    worksheet.getCell("B8").alignment = {horizontal: 'center'};

    worksheet.getCell("F8").value = "PRODAJNA CENA";
    worksheet.getCell("F8").alignment = {vertical: 'middle', horizontal: 'center'};

    worksheet.getCell("G8").value = "količina";
    worksheet.getCell("G8").alignment = {vertical: 'middle', horizontal: 'center'};

    worksheet.getCell("H8").value = "ZNESEK";
    worksheet.getCell("H8").alignment = {vertical: 'middle', horizontal: 'center'};

    // ROW 1
    worksheet.mergeCells("B9:E9");
    worksheet.getCell("B9").value = "ZNESEK PLAČANE ARE na FTRR";
    worksheet.getCell("B9").alignment = { horizontal: 'center' };
    worksheet.getCell("B9").font = { bold: true };

    worksheet.getCell("F9").value = transaction.property.price;
    worksheet.getCell("F9").font = { bold: true };

    worksheet.getCell("G9").value = "10.00%";
    worksheet.getCell("G9").font = { bold: true };

    const areAmount = transaction.property.price * 0.1;
    worksheet.getCell("H9").value = areAmount;
    worksheet.getCell("H9").font = { bold: true };

    // ROW 2
    worksheet.getCell("A10").value = "1.";
    worksheet.mergeCells("B10:E10");
    worksheet.getCell("B10").value = "storitev posredovanja";

    worksheet.getCell("G10").value = "4.00%";

    const commissionAmount = transaction.property.price * 0.04;
    worksheet.getCell("H10").value = commissionAmount;

    // ROW 3
    worksheet.getCell("A11").value = "2.";
    worksheet.mergeCells("B11:F11");
    worksheet.getCell("B11").value = "DDV na storitev";
    worksheet.getCell("G11").value = "22.00%";

    const vatAmount = commissionAmount * 0.22;
    worksheet.getCell("H11").value = vatAmount;

    // ROW 4
    worksheet.getCell("A12").value = "3.";
    worksheet.mergeCells("B12:E12");
    worksheet.getCell("B12").value = "DDV - davek na promet nepremičnin";
    worksheet.getCell("G12").value = "2.00%";

    const propertyTaxAmount = transaction.property.price * 0.02;
    worksheet.getCell("H12").value = propertyTaxAmount;

    // ROW 5
    worksheet.getCell("A13").value = "4.";
    worksheet.mergeCells("B13:E13");
    worksheet.getCell("B13").value = "Hramba are na fiduciarnem računu";

    worksheet.getCell("F13").value = transaction.fiduciaryAccount || 0.0;
    worksheet.getCell("G13").value = transaction.fiduciaryAccount ? 1 : 0;
    worksheet.getCell("H13").value = transaction.fiduciaryAccount || 0.0;

    // ROW 6
    worksheet.getCell("A14").value = "5.";
    worksheet.mergeCells("B14:E14");
    worksheet.getCell("B14").value = "Drugo: pogodbe, PNR, notar...";

    worksheet.getCell("F14").value = transaction.otherExpenses || 0.0;
    worksheet.getCell("G14").value = transaction.otherExpenses ? 1 : 0;
    worksheet.getCell("H14").value = transaction.otherExpenses || 0.0;

    worksheet.mergeCells("A20:G20");
    worksheet.getCell("A20").value = "ostanek are";
    worksheet.getCell("A20").font = { bold: true };
    worksheet.getCell("A20").alignment = { horizontal: 'right' };

    worksheet.getCell("H20").value = { formula: "H9-H21" };

    worksheet.mergeCells("A21:G21");
    worksheet.getCell("A21").value = "ZA PLAČILO";
    worksheet.getCell("A21").alignment = { horizontal: 'right' };

    worksheet.getCell("H21").value = { formula: "SUM(H10:H19)" };

    worksheet.mergeCells("A22:H22");
    worksheet.getCell("A22").value = `ostanek are nakazati na TRR prodajalca št.: ${transaction.sellers[0]?.taxNumber}`;

    worksheet.getCell("A24").value = `Kraj in datum: ____________________________`;

    worksheet.mergeCells("A26:F26");
    worksheet.getCell("A26").value = "Posrednik:";
    worksheet.mergeCells("G26:H26");
    worksheet.getCell("G26").value = "Stranka, naročnik:";

    worksheet.mergeCells("A27:C27");
    worksheet.getCell("A27").value = ` ${transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}`;
    worksheet.mergeCells("G27:H27");
    worksheet.getCell("G27").value = `${transaction.buyers[0]?.firstName} ${transaction.buyers[0]?.lastName}`;

    worksheet.getColumn('F').numFmt = '#,##0.00 €';
    worksheet.getColumn('H').numFmt = '#,##0.00 €';
    worksheet.getColumn('G').numFmt = '#,##0.00 €';

    const buffer = await workbook.xlsx.writeBuffer();
    const filename =  transaction.agents.map(s => `${s.firstName} ${s.lastName}`).join(', ') + "_obracun_stroskov_prodaje_nepremicnine";

    return {
        buffer,
        filename
    }
}


module.exports = {
    generateBindingOffer,
    generateCommissionReport,
    generateSalesContract,
    generateCalculationOfRealEstateCosts
};
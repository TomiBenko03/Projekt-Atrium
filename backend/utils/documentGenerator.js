const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const Transaction = require('../models/Transaction');

// helper function for generating reports
const formatCheckbox = (value) => {
    return `${value ? '☒' : '☐'} DA ${!value ? '☒' : '☐'} NE`;
  };

// provizijsko porocilo
const generateCommissionReport = async(transactionId) => {
    const transaction = await Transaction.findById(transactionId)
            .populate('_id')
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
    return {
        buffer,
        filename: `${transaction.agent.firstName}_izplacilo_provizije`
    }
}

// zavezujoca ponudba za nakup nepremicnine
const generateBindingOffer = async (transactionId) => {
    const transaction = await Transaction.findById(transactionId)
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
        .populate('agent')
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
  const filename = transaction.agent.firstName + "_narocilo_prodajne_pogodbe";

    return {
        buffer,
        filename
    }
}


module.exports = {
    generateBindingOffer,
    generateCommissionReport,
    generateSalesContract,
};
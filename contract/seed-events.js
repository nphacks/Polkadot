#!/usr/bin/env node
/**
 * Seed Events Script
 * 
 * Automatically populates the blockchain with test events from the Space Race era.
 * This makes testing much faster by avoiding manual event submission.
 * 
 * Usage: node contract/seed-events.js
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const { Keyring } = require('@polkadot/keyring');
const fs = require('fs');
const path = require('path');

const CONTRACT_ADDRESS = '5E1FvPudm4Lhb54HBE4Hhei6JpfH5b6bEoBVPhcTHzeLfG2q';

// Test events from Space Race era (1957-1972)
const TEST_EVENTS = [
  // CANONICAL EVENTS (will get high support votes)
  {
    title: "Launch of Sputnik 1 - First Artificial Satellite",
    date: new Date('1957-10-04'),
    description: "The Soviet Union successfully launched Sputnik 1, the world's first artificial satellite, marking the beginning of the Space Age and the Space Race between the USSR and USA.",
    evidenceSources: [
      "https://history.nasa.gov/sputnik/",
      "https://www.britannica.com/topic/Sputnik",
      "Soviet official press release, October 1957"
    ],
    tags: ["Space", "Science", "Technology", "Politics"]
  },
  {
    title: "Yuri Gagarin Becomes First Human in Space",
    date: new Date('1961-04-12'),
    description: "Soviet cosmonaut Yuri Gagarin completed one orbit of Earth aboard Vostok 1, becoming the first human to journey into outer space.",
    evidenceSources: [
      "https://www.nasa.gov/mission_pages/shuttle/sts1/gagarin_anniversary.html",
      "https://www.roscosmos.ru/en/",
      "Contemporary news reports from Pravda and international press"
    ],
    tags: ["Space", "Science", "Politics"]
  },
  {
    title: "Apollo 11 Moon Landing - First Humans on the Moon",
    date: new Date('1969-07-20'),
    description: "NASA astronauts Neil Armstrong and Buzz Aldrin became the first humans to land on the Moon, while Michael Collins orbited above. Armstrong's first steps were broadcast live to millions worldwide.",
    evidenceSources: [
      "https://www.nasa.gov/mission_pages/apollo/apollo11.html",
      "https://www.archives.gov/research/military/air-force/apollo-11",
      "Lunar samples returned to Earth (verified by multiple countries)"
    ],
    tags: ["Space", "Science", "Technology"]
  },
  {
    title: "Alan Shepard - First American in Space",
    date: new Date('1961-05-05'),
    description: "NASA astronaut Alan Shepard completed a 15-minute suborbital flight aboard Freedom 7, becoming the first American to travel into space.",
    evidenceSources: [
      "https://www.nasa.gov/centers/glenn/about/history/shepard.html",
      "NASA mission transcripts and telemetry data",
      "Contemporary newsreel footage"
    ],
    tags: ["Space", "Science", "Politics"]
  },
  {
    title: "Valentina Tereshkova - First Woman in Space",
    date: new Date('1963-06-16'),
    description: "Soviet cosmonaut Valentina Tereshkova orbited Earth 48 times aboard Vostok 6, becoming the first woman to fly in space.",
    evidenceSources: [
      "https://www.space.com/21571-valentina-tereshkova.html",
      "Soviet space program archives",
      "International verification by tracking stations"
    ],
    tags: ["Space", "Science", "Culture"]
  },
  {
    title: "Alexei Leonov Performs First Spacewalk",
    date: new Date('1965-03-18'),
    description: "Soviet cosmonaut Alexei Leonov exited the Voskhod 2 spacecraft and spent 12 minutes in space, performing humanity's first extravehicular activity (EVA).",
    evidenceSources: [
      "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/50_years_since_the_first_spacewalk",
      "Film footage from Voskhod 2 mission",
      "Leonov's own account and mission reports"
    ],
    tags: ["Space", "Science", "Technology"]
  },
  {
    title: "Apollo 13 Crew Returns Safely After Oxygen Tank Explosion",
    date: new Date('1970-04-17'),
    description: "After an oxygen tank explosion crippled the Apollo 13 spacecraft en route to the Moon, NASA engineers and the crew worked together to safely return the astronauts to Earth.",
    evidenceSources: [
      "https://www.nasa.gov/mission_pages/apollo/missions/apollo13.html",
      "Mission transcripts and audio recordings",
      "Post-mission investigation reports"
    ],
    tags: ["Space", "Science", "Technology"]
  },
  {
    title: "Explorer 6 Captures First Satellite Photo of Earth",
    date: new Date('1959-08-14'),
    description: "NASA's Explorer 6 satellite transmitted the first photograph of Earth taken from space, showing a sunlit area of the Pacific Ocean.",
    evidenceSources: [
      "https://www.nasa.gov/multimedia/imagegallery/image_feature_1298.html",
      "NASA JPL archives",
      "Published in scientific journals, August 1959"
    ],
    tags: ["Space", "Science", "Technology"]
  },

  // DISPUTED EVENTS (will get mixed votes)
  {
    title: "Debate Over Moon Landing Broadcast Technical Details",
    date: new Date('1969-07-20'),
    description: "While the moon landing itself is accepted, some researchers question specific technical aspects of the live broadcast, including lighting conditions and video quality given 1969 technology limitations.",
    evidenceSources: [
      "NASA technical specifications for Apollo TV camera",
      "Analysis by broadcast engineers (various conclusions)",
      "Comparative studies of 1960s broadcast technology"
    ],
    tags: ["Space", "Technology", "Science"]
  },
  {
    title: "Extent and Causes of Soviet Lunar Program Setbacks",
    date: new Date('1965-01-01'),
    description: "Historians debate the full extent of Soviet moon landing attempts and whether political pressure or technical limitations were the primary cause of their program's failure to reach the moon before the USA.",
    evidenceSources: [
      "Declassified Soviet documents (partial)",
      "Memoirs of Soviet engineers (conflicting accounts)",
      "Western intelligence assessments from the era"
    ],
    tags: ["Space", "Politics", "Science"]
  },
  {
    title: "Disputed Details of Gagarin's Landing Procedure",
    date: new Date('1961-04-12'),
    description: "While Gagarin's spaceflight is confirmed, there is historical debate about whether he landed inside his capsule or ejected and parachuted separately, as Soviet officials gave conflicting accounts.",
    evidenceSources: [
      "Official Soviet reports (contradictory versions)",
      "Gagarin's own statements (varied over time)",
      "FAI (Fédération Aéronautique Internationale) records"
    ],
    tags: ["Space", "Science", "Politics"]
  },
  {
    title: "Alleged Soviet Space Missions Before Gagarin",
    date: new Date('1960-01-01'),
    description: "Some researchers claim the Soviet Union launched cosmonauts into space before Gagarin, but these missions ended in failure and were covered up. Evidence is circumstantial and disputed by mainstream historians.",
    evidenceSources: [
      "Judica-Cordiglia brothers' radio recordings (disputed authenticity)",
      "Soviet space program denials",
      "Analysis by space historians (mostly skeptical)"
    ],
    tags: ["Space", "Politics", "Science"]
  },
  {
    title: "Causes and Responsibility for Apollo 1 Fire",
    date: new Date('1967-01-27'),
    description: "While the Apollo 1 fire that killed three astronauts is well-documented, historians debate whether NASA management negligence or contractor oversight failures were primarily responsible.",
    evidenceSources: [
      "NASA accident investigation report",
      "Congressional hearing testimonies",
      "Competing analyses by aerospace safety experts"
    ],
    tags: ["Space", "Politics", "Science"]
  },
  {
    title: "Primary Motivations Behind the Space Race",
    date: new Date('1957-10-04'),
    description: "Historians debate whether the Space Race was primarily driven by scientific curiosity, military strategic advantage, propaganda value, or economic competition between superpowers.",
    evidenceSources: [
      "Declassified government documents (USA and USSR)",
      "Competing historical analyses",
      "Statements from political leaders (varied interpretations)"
    ],
    tags: ["Space", "Politics", "Economics"]
  },

  // ALTERNATIVE EVENTS (will get low support votes)
  {
    title: "Alternative Theory: Moon Landing Filmed in Studio",
    date: new Date('1969-07-20'),
    description: "Conspiracy theory claiming the Apollo 11 moon landing was staged in a film studio to win the Space Race. Proponents cite alleged anomalies in photographs and videos.",
    evidenceSources: [
      "Bill Kaysing's 'We Never Went to the Moon' (1976)",
      "Analysis of alleged photo inconsistencies",
      "Counter-evidence: Lunar samples, retroreflectors, independent tracking"
    ],
    tags: ["Space", "Politics", "Culture"]
  },
  {
    title: "Alternative Theory: Apollo Missions Discovered Alien Structures",
    date: new Date('1969-07-20'),
    description: "Fringe theory suggesting Apollo astronauts discovered evidence of ancient alien civilizations on the Moon, which was subsequently covered up by NASA and world governments.",
    evidenceSources: [
      "Alleged 'leaked' NASA photos (unverified)",
      "Interpretations of lunar surface anomalies",
      "Mainstream debunking by planetary scientists"
    ],
    tags: ["Space", "Science", "Culture"]
  },
  {
    title: "Alternative Theory: The Moon is an Artificial Hollow Structure",
    date: new Date('1970-01-01'),
    description: "Fringe theory proposing the Moon is not a natural satellite but an artificial hollow structure, based on misinterpretations of seismic data from Apollo missions.",
    evidenceSources: [
      "Vasin and Shcherbakov's 1970 article in Sputnik magazine",
      "Misinterpreted Apollo seismic experiment data",
      "Scientific refutations based on lunar mass and gravity measurements"
    ],
    tags: ["Space", "Science"]
  }
];

async function seedEvents() {
  console.log('🌱 Starting event seeding process...\n');

  try {
    // Connect to node
    console.log('📡 Connecting to local node...');
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log('✅ Connected\n');

    // Load contract
    console.log('📄 Loading contract...');
    const contractPath = path.join(__dirname, 'target/ink/history_protocol.contract');
    const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const contract = new ContractPromise(api, contractData, CONTRACT_ADDRESS);
    console.log('✅ Contract loaded\n');

    // Setup Alice account
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    console.log('👤 Using account:', alice.address, '\n');

    // Submit each event
    console.log(`📝 Submitting ${TEST_EVENTS.length} events...\n`);
    
    for (let i = 0; i < TEST_EVENTS.length; i++) {
      const event = TEST_EVENTS[i];
      const eventNum = i + 1;
      
      console.log(`[${eventNum}/${TEST_EVENTS.length}] ${event.title}`);
      
      try {
        // Convert date to YYYYMMDD format (e.g., 19690720 for July 20, 1969)
        const year = event.date.getFullYear();
        const month = String(event.date.getMonth() + 1).padStart(2, '0');
        const day = String(event.date.getDate()).padStart(2, '0');
        const timestamp = parseInt(`${year}${month}${day}`);
        
        // Submit event
        await new Promise((resolve, reject) => {
          contract.tx
            .submitEvent(
              { 
                gasLimit: api.registry.createType('WeightV2', { refTime: 100000000000n, proofSize: 1000000n }),
                storageDepositLimit: null
              },
              event.title,
              timestamp,
              event.description,
              event.evidenceSources,
              event.tags
            )
            .signAndSend(alice, ({ status, dispatchError }) => {
              if (status.isFinalized) {
                if (dispatchError) {
                  if (dispatchError.isModule) {
                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                    console.log(`   ❌ Failed: ${decoded.section}.${decoded.name}`);
                  } else {
                    console.log(`   ❌ Failed: ${dispatchError.toString()}`);
                  }
                  reject(new Error('Transaction failed'));
                } else {
                  console.log(`   ✅ Submitted and finalized`);
                  resolve();
                }
              }
            })
            .catch(reject);
        });
        
        // Small delay to avoid overwhelming the node
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    console.log('\n🎉 Event seeding complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total events: ${TEST_EVENTS.length}`);
    console.log(`   - Canonical: 8 events (1957-1970)`);
    console.log(`   - Disputed: 6 events (1960-1969)`);
    console.log(`   - Alternative: 3 events (1969-1970)`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Open the app in your browser`);
    console.log(`   2. Connect your wallet`);
    console.log(`   3. Vote on events to move them between timelines`);
    console.log(`   4. Events need votes to reach their intended timelines\n`);

    await api.disconnect();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

seedEvents();

# Test Data Plan - HistoryDAO

## Overview

This document provides a structured plan for populating the system with real historical events to properly test the timeline visualization and all three timeline types (Canonical, Disputed, Alternative). Each event includes appropriate tags for testing the tag filtering functionality.

## Test Data Strategy

### Timeline Distribution
- **Canonical Timeline**: 8-10 events (well-established historical facts)
- **Disputed Timeline**: 6-8 events (events with ongoing historical debate)
- **Alternative Timeline**: 4-6 events (fringe theories, conspiracy theories)

### Date Range
Focus on **20th Century Space Race (1957-1972)** for thematic consistency and visual timeline density.

### Tag Distribution Strategy
Each event includes 3-5 tags from the predefined categories to enable comprehensive filter testing:
- **Space**: All events (18 events) - Primary category for Space Race theme
- **Science**: 11 events - Scientific achievements and theories
- **Technology**: 10 events - Technical innovations and capabilities
- **Politics**: 10 events - Political motivations and controversies
- **Culture**: 8 events - Cultural impact and social significance
- **Military**: 2 events - Military applications and strategic concerns
- **Economics**: 2 events - Economic factors and competition
- **Social**: 1 event - Social progress and representation
- **Environment**: 1 event - Earth observation and environmental awareness

This distribution ensures:
- All tags have at least one event for testing
- Multiple events share common tags for meaningful filter results
- Events have diverse tag combinations for multi-tag filtering tests

---

## Canonical Timeline Events (High Consensus)

These events should receive mostly "Support" votes to achieve 75%+ consensus.

### Event 1: Sputnik 1 Launch
- **Date**: October 4, 1957
- **Title**: "Launch of Sputnik 1 - First Artificial Satellite"
- **Description**: "The Soviet Union successfully launched Sputnik 1, the world's first artificial satellite, marking the beginning of the Space Age and the Space Race between the USSR and USA."
- **Tags**: Space, Science, Technology, Politics
- **Evidence Sources**:
  - "https://history.nasa.gov/sputnik/"
  - "https://www.britannica.com/topic/Sputnik"
  - "Soviet official press release, October 1957"

### Event 2: Yuri Gagarin First Human in Space
- **Date**: April 12, 1961
- **Title**: "Yuri Gagarin Becomes First Human in Space"
- **Description**: "Soviet cosmonaut Yuri Gagarin completed one orbit of Earth aboard Vostok 1, becoming the first human to journey into outer space."
- **Tags**: Space, Science, Politics, Culture
- **Evidence Sources**:
  - "https://www.nasa.gov/mission_pages/shuttle/sts1/gagarin_anniversary.html"
  - "https://www.roscosmos.ru/en/ (Russian Space Agency archives)"
  - "Contemporary news reports from Pravda and international press"

### Event 3: Apollo 11 Moon Landing
- **Date**: July 20, 1969
- **Title**: "Apollo 11 Moon Landing - First Humans on the Moon"
- **Description**: "NASA astronauts Neil Armstrong and Buzz Aldrin became the first humans to land on the Moon, while Michael Collins orbited above. Armstrong's first steps were broadcast live to millions worldwide."
- **Tags**: Space, Science, Technology, Politics, Culture
- **Evidence Sources**:
  - "https://www.nasa.gov/mission_pages/apollo/apollo11.html"
  - "https://www.archives.gov/research/military/air-force/apollo-11"
  - "Lunar samples returned to Earth (verified by multiple countries)"

### Event 4: First American in Space
- **Date**: May 5, 1961
- **Title**: "Alan Shepard - First American in Space"
- **Description**: "NASA astronaut Alan Shepard completed a 15-minute suborbital flight aboard Freedom 7, becoming the first American to travel into space."
- **Tags**: Space, Science, Technology, Politics
- **Evidence Sources**:
  - "https://www.nasa.gov/centers/glenn/about/history/shepard.html"
  - "NASA mission transcripts and telemetry data"
  - "Contemporary newsreel footage"

### Event 5: First Woman in Space
- **Date**: June 16, 1963
- **Title**: "Valentina Tereshkova - First Woman in Space"
- **Description**: "Soviet cosmonaut Valentina Tereshkova orbited Earth 48 times aboard Vostok 6, becoming the first woman to fly in space."
- **Tags**: Space, Science, Social, Culture
- **Evidence Sources**:
  - "https://www.space.com/21571-valentina-tereshkova.html"
  - "Soviet space program archives"
  - "International verification by tracking stations"

### Event 6: First Spacewalk
- **Date**: March 18, 1965
- **Title**: "Alexei Leonov Performs First Spacewalk"
- **Description**: "Soviet cosmonaut Alexei Leonov exited the Voskhod 2 spacecraft and spent 12 minutes in space, performing humanity's first extravehicular activity (EVA)."
- **Tags**: Space, Science, Technology
- **Evidence Sources**:
  - "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/50_years_since_the_first_spacewalk"
  - "Film footage from Voskhod 2 mission"
  - "Leonov's own account and mission reports"

### Event 7: Apollo 13 Crisis and Safe Return
- **Date**: April 17, 1970
- **Title**: "Apollo 13 Crew Returns Safely After Oxygen Tank Explosion"
- **Description**: "After an oxygen tank explosion crippled the Apollo 13 spacecraft en route to the Moon, NASA engineers and the crew worked together to safely return the astronauts to Earth."
- **Tags**: Space, Science, Technology, Culture
- **Evidence Sources**:
  - "https://www.nasa.gov/mission_pages/apollo/missions/apollo13.html"
  - "Mission transcripts and audio recordings"
  - "Post-mission investigation reports"

### Event 8: First Satellite Photo of Earth
- **Date**: August 14, 1959
- **Title**: "Explorer 6 Captures First Satellite Photo of Earth"
- **Description**: "NASA's Explorer 6 satellite transmitted the first photograph of Earth taken from space, showing a sunlit area of the Pacific Ocean."
- **Tags**: Space, Science, Technology, Environment
- **Evidence Sources**:
  - "https://www.nasa.gov/multimedia/imagegallery/image_feature_1298.html"
  - "NASA JPL archives"
  - "Published in scientific journals, August 1959"

---

## Disputed Timeline Events (Active Debate)

These events should receive mixed votes (40-60% support) to remain in Disputed timeline.

### Event 9: Moon Landing Broadcast Authenticity
- **Date**: July 20, 1969
- **Title**: "Debate Over Moon Landing Broadcast Technical Details"
- **Description**: "While the moon landing itself is accepted, some researchers question specific technical aspects of the live broadcast, including lighting conditions and video quality given 1969 technology limitations."
- **Tags**: Space, Technology, Culture
- **Evidence Sources**:
  - "NASA technical specifications for Apollo TV camera"
  - "Analysis by broadcast engineers (various conclusions)"
  - "Comparative studies of 1960s broadcast technology"

### Event 10: Soviet Moon Program Failures
- **Date**: 1960-1972
- **Title**: "Extent and Causes of Soviet Lunar Program Setbacks"
- **Description**: "Historians debate the full extent of Soviet moon landing attempts and whether political pressure or technical limitations were the primary cause of their program's failure to reach the moon before the USA."
- **Tags**: Space, Politics, Technology, Economics
- **Evidence Sources**:
  - "Declassified Soviet documents (partial)"
  - "Memoirs of Soviet engineers (conflicting accounts)"
  - "Western intelligence assessments from the era"

### Event 11: Yuri Gagarin's Flight Details
- **Date**: April 12, 1961
- **Title**: "Disputed Details of Gagarin's Landing Procedure"
- **Description**: "While Gagarin's spaceflight is confirmed, there is historical debate about whether he landed inside his capsule or ejected and parachuted separately, as Soviet officials gave conflicting accounts."
- **Tags**: Space, Science, Politics
- **Evidence Sources**:
  - "Official Soviet reports (contradictory versions)"
  - "Gagarin's own statements (varied over time)"
  - "FAI (Fédération Aéronautique Internationale) records"

### Event 12: Lost Cosmonauts Theory
- **Date**: 1957-1961
- **Title**: "Alleged Soviet Space Missions Before Gagarin"
- **Description**: "Some researchers claim the Soviet Union launched cosmonauts into space before Gagarin, but these missions ended in failure and were covered up. Evidence is circumstantial and disputed by mainstream historians."
- **Tags**: Space, Politics, Culture
- **Evidence Sources**:
  - "Judica-Cordiglia brothers' radio recordings (disputed authenticity)"
  - "Soviet space program denials"
  - "Analysis by space historians (mostly skeptical)"

### Event 13: Apollo 1 Fire Investigation
- **Date**: January 27, 1967
- **Title**: "Causes and Responsibility for Apollo 1 Fire"
- **Description**: "While the Apollo 1 fire that killed three astronauts is well-documented, historians debate whether NASA management negligence or contractor oversight failures were primarily responsible."
- **Tags**: Space, Technology, Politics
- **Evidence Sources**:
  - "NASA accident investigation report"
  - "Congressional hearing testimonies"
  - "Competing analyses by aerospace safety experts"

### Event 14: Space Race Motivations
- **Date**: 1957-1972
- **Title**: "Primary Motivations Behind the Space Race"
- **Description**: "Historians debate whether the Space Race was primarily driven by scientific curiosity, military strategic advantage, propaganda value, or economic competition between superpowers."
- **Tags**: Politics, Economics, Military, Culture
- **Evidence Sources**:
  - "Declassified government documents (USA and USSR)"
  - "Competing historical analyses"
  - "Statements from political leaders (varied interpretations)"

---

## Alternative Timeline Events (Fringe Theories)

These events should receive mostly "Challenge" votes to achieve <25% consensus.

### Event 15: Moon Landing Hoax Theory
- **Date**: July 20, 1969
- **Title**: "Alternative Theory: Moon Landing Filmed in Studio"
- **Description**: "Conspiracy theory claiming the Apollo 11 moon landing was staged in a film studio to win the Space Race. Proponents cite alleged anomalies in photographs and videos."
- **Tags**: Space, Politics, Culture
- **Evidence Sources**:
  - "Bill Kaysing's 'We Never Went to the Moon' (1976)"
  - "Analysis of alleged photo inconsistencies"
  - "Counter-evidence: Lunar samples, retroreflectors, independent tracking"

### Event 16: Ancient Alien Artifacts on Moon
- **Date**: July 20, 1969
- **Title**: "Alternative Theory: Apollo Missions Discovered Alien Structures"
- **Description**: "Fringe theory suggesting Apollo astronauts discovered evidence of ancient alien civilizations on the Moon, which was subsequently covered up by NASA and world governments."
- **Tags**: Space, Science, Culture
- **Evidence Sources**:
  - "Alleged 'leaked' NASA photos (unverified)"
  - "Interpretations of lunar surface anomalies"
  - "Mainstream debunking by planetary scientists"

### Event 17: Hollow Moon Theory
- **Date**: 1960s-1970s
- **Title**: "Alternative Theory: The Moon is an Artificial Hollow Structure"
- **Description**: "Fringe theory proposing the Moon is not a natural satellite but an artificial hollow structure, based on misinterpretations of seismic data from Apollo missions."
- **Tags**: Space, Science, Technology
- **Evidence Sources**:
  - "Vasin and Shcherbakov's 1970 article in Sputnik magazine"
  - "Misinterpreted Apollo seismic experiment data"
  - "Scientific refutations based on lunar mass and gravity measurements"

### Event 18: Secret Military Space Stations
- **Date**: 1960-1972
- **Title**: "Alternative Theory: Secret Military Space Stations During Space Race"
- **Description**: "Conspiracy theory claiming both superpowers operated secret military space stations during the Space Race, hidden from public knowledge and international treaties."
- **Tags**: Space, Military, Politics
- **Evidence Sources**:
  - "Alleged whistleblower testimonies (unverified)"
  - "Misidentified satellite tracking data"
  - "Lack of physical evidence or credible documentation"

---

## Testing Execution Plan

### Phase 1: Setup Multiple Test Accounts (3-5 accounts)
1. Create 3-5 different wallet accounts in Polkadot.js extension
2. Label them clearly: "Account 1", "Account 2", etc.
3. Ensure each has sufficient balance for transactions

### Phase 2: Submit All Events (Use Account 1)
1. Submit all 18 events in chronological order
2. Verify each event appears in Disputed timeline initially
3. Record event IDs for reference

### Phase 3: Vote to Create Timeline Distribution

**For Canonical Events (Events 1-8):**
- Account 1: Support (8 votes)
- Account 2: Support (8 votes)
- Account 3: Support (8 votes)
- Account 4: Challenge (2 votes) - to make it realistic
- Account 5: Support (8 votes)
- **Result**: ~80% consensus → Moves to Canonical

**For Disputed Events (Events 9-14):**
- Account 1: Support (3 events), Challenge (3 events)
- Account 2: Challenge (3 events), Support (3 events)
- Account 3: Support (3 events), Challenge (3 events)
- Account 4: Support (3 events), Challenge (3 events)
- Account 5: Challenge (3 events), Support (3 events)
- **Result**: ~50% consensus → Stays in Disputed

**For Alternative Events (Events 15-18):**
- Account 1: Challenge (4 votes)
- Account 2: Challenge (4 votes)
- Account 3: Challenge (4 votes)
- Account 4: Support (1 vote) - to make it realistic
- Account 5: Challenge (4 votes)
- **Result**: ~20% consensus → Moves to Alternative

### Phase 4: Visual Verification
1. Check Canonical timeline shows 8 events (1957-1970)
2. Check Disputed timeline shows 6 events (1961-1972)
3. Check Alternative timeline shows 4 events (1969-1970s)
4. Verify timeline visualization displays all events chronologically
5. Test filtering by date range
6. Verify color coding is correct

### Phase 5: Edge Case Testing
1. Vote on one Disputed event to exactly 75% → Should move to Canonical
2. Vote on one Disputed event to exactly 25% → Should move to Alternative
3. Verify timeline updates in real-time

---

## Quick Test Script

For rapid testing, here's a condensed version with 9 events (3 per timeline):

**Canonical (3 events):**
1. Sputnik 1 (Oct 4, 1957) - Tags: Space, Science, Technology, Politics
2. Gagarin First in Space (Apr 12, 1961) - Tags: Space, Science, Politics, Culture
3. Apollo 11 Moon Landing (Jul 20, 1969) - Tags: Space, Science, Technology, Politics, Culture

**Disputed (3 events):**
4. Moon Landing Broadcast Details (Jul 20, 1969) - Tags: Space, Technology, Culture
5. Soviet Moon Program Failures (1960-1972) - Tags: Space, Politics, Technology, Economics
6. Apollo 1 Fire Responsibility (Jan 27, 1967) - Tags: Space, Technology, Politics

**Alternative (3 events):**
7. Moon Landing Hoax Theory (Jul 20, 1969) - Tags: Space, Politics, Culture
8. Ancient Alien Artifacts (Jul 20, 1969) - Tags: Space, Science, Culture
9. Hollow Moon Theory (1960s-1970s) - Tags: Space, Science, Technology

Vote with 3 accounts:
- Canonical: 3 Support, 0 Challenge (100%)
- Disputed: 2 Support, 1 Challenge (66%)
- Alternative: 0 Support, 3 Challenge (0%)

**Tag Filter Testing:**
- Filter by "Space": Should show all 9 events
- Filter by "Politics": Should show 6 events (1, 2, 3, 5, 6, 7)
- Filter by "Culture": Should show 5 events (2, 3, 4, 7, 8)
- Filter by "Technology": Should show 5 events (1, 3, 4, 5, 9)
- Filter by "Science": Should show 4 events (1, 2, 3, 8, 9)
- Filter by multiple tags (e.g., "Space" + "Politics"): Should show events matching ANY selected tag

---

## Automation Script (Optional)

If you want to automate this, you can create a script that:
1. Reads event data from JSON file
2. Submits events sequentially
3. Votes according to the plan
4. Verifies timeline distribution

Would you like me to create this automation script?

---

## Expected Visual Result

After completing this test data plan, your timeline visualization should show:

```
1957 ●────────────────────────────────────────────────────────────────────→ 1972
     │                                                                      │
     Sputnik 1 (C)                                                         │
          │                                                                │
          1961: Gagarin (C), Shepard (C), Gagarin Details (D)             │
               │                                                           │
               1963: Tereshkova (C)                                        │
                    │                                                      │
                    1965: Leonov Spacewalk (C)                            │
                         │                                                 │
                         1967: Apollo 1 (D)                                │
                              │                                            │
                              1969: Apollo 11 (C), Broadcast (D),         │
                                    Hoax Theory (A), Aliens (A)           │
                                   │                                       │
                                   1970: Apollo 13 (C)                     │
                                        │                                  │
                                        1972: Soviet Program (D)           │

Legend: (C) = Canonical, (D) = Disputed, (A) = Alternative
```

This will give you a rich, realistic dataset that demonstrates all features of HistoryDAO!

---

## Tag Functionality Testing

### Tag Selection Testing (Event Submission)
1. Verify tag selector displays all 10 predefined categories
2. Test selecting 1 tag (minimum requirement)
3. Test selecting 5 tags (maximum allowed)
4. Test attempting to select more than 5 tags (should show validation error)
5. Test submitting without tags (should show validation error)
6. Verify selected tags are highlighted/styled differently

### Tag Display Testing (Event Detail)
1. Verify all tags appear as colored badges on event detail page
2. Test clicking tags to navigate to filtered timeline (if implemented)
3. Verify tag styling matches theme colors (blue palette)
4. Check tag display in both light and dark modes

### Tag Filtering Testing (Timeline View)
1. **Single Tag Filter:**
   - Filter by "Space" → Should show all 18 events
   - Filter by "Science" → Should show 11 events
   - Filter by "Technology" → Should show 10 events
   - Filter by "Politics" → Should show 10 events
   - Filter by "Culture" → Should show 8 events
   - Filter by "Military" → Should show 2 events
   - Filter by "Economics" → Should show 2 events
   - Filter by "Social" → Should show 1 event
   - Filter by "Environment" → Should show 1 event

2. **Multiple Tag Filter (OR logic):**
   - Filter by "Military" + "Economics" → Should show 3 unique events
   - Filter by "Social" + "Environment" → Should show 2 unique events
   - Filter by "Space" + "Science" → Should show all events (since Space covers all)

3. **Clear Filters:**
   - Apply multiple filters
   - Click "Clear Filters" button
   - Verify all events are displayed again
   - Verify filter count indicator updates correctly

4. **Filter Persistence:**
   - Apply filters
   - Navigate to event detail
   - Return to timeline
   - Verify filters are still active (if implemented)

### Tag Data Integrity Testing
1. Submit event with tags via frontend
2. Query event from smart contract
3. Verify tags are stored correctly
4. Verify tags are returned in correct format
5. Test get_events_by_tag contract method with various tags

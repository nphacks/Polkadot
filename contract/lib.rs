#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod history_protocol {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    /// Defines the timeline categories for historical events
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode, Clone, Copy)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Timeline {
        Canonical,
        Disputed,
        Alternative,
    }

    /// Represents a historical event with all metadata
    #[derive(Debug, scale::Encode, scale::Decode, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct HistoricalEvent {
        pub id: u64,
        pub title: String,
        pub date: u64,
        pub description: String,
        pub evidence_sources: Vec<String>,
        pub tags: Vec<String>,
        pub submitter: AccountId,
        pub timeline: Timeline,
        pub consensus_score: u8,
        pub support_votes: u32,
        pub challenge_votes: u32,
        pub created_at: u64,
    }

    /// Represents a vote on a historical event
    #[derive(Debug, scale::Encode, scale::Decode, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Vote {
        pub voter: AccountId,
        pub event_id: u64,
        pub support: bool,
        pub timestamp: u64,
    }

    /// Contract errors
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        EventNotFound,
        AlreadyVoted,
        InvalidEventData,
    }

    /// The main contract storage
    #[ink(storage)]
    pub struct HistoryProtocol {
        events: Mapping<u64, HistoricalEvent>,
        event_count: u64,
        votes: Mapping<(u64, AccountId), Vote>,
        timeline_events: Mapping<Timeline, Vec<u64>>,
        user_events: Mapping<AccountId, Vec<u64>>,
    }

    impl HistoryProtocol {
        /// Constructor that initializes the contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                events: Mapping::default(),
                event_count: 0,
                votes: Mapping::default(),
                timeline_events: Mapping::default(),
                user_events: Mapping::default(),
            }
        }

        /// Submits a new historical event to the protocol
        /// 
        /// # Arguments
        /// * `title` - The title of the historical event
        /// * `date` - Unix timestamp of when the event occurred
        /// * `description` - Detailed description of the event
        /// * `evidence_sources` - Vector of evidence URLs or references
        /// * `tags` - Vector of category tags (minimum 1, maximum 5)
        /// 
        /// # Returns
        /// * `Ok(u64)` - The unique event ID if successful
        /// * `Err(Error::InvalidEventData)` - If validation fails
        #[ink(message)]
        pub fn submit_event(
            &mut self,
            title: String,
            date: u64,
            description: String,
            evidence_sources: Vec<String>,
            tags: Vec<String>,
        ) -> Result<u64, Error> {
            // Validate required fields
            if title.is_empty() {
                return Err(Error::InvalidEventData);
            }
            if description.is_empty() {
                return Err(Error::InvalidEventData);
            }
            if evidence_sources.is_empty() {
                return Err(Error::InvalidEventData);
            }
            
            // Validate tags: require at least 1 tag, maximum 5 tags
            if tags.is_empty() {
                return Err(Error::InvalidEventData);
            }
            if tags.len() > 5 {
                return Err(Error::InvalidEventData);
            }

            // Generate unique event ID
            let event_id = self.generate_event_id();
            
            // Get current timestamp and caller
            let caller = self.env().caller();
            let now = self.env().block_timestamp();

            // Create HistoricalEvent with initial Disputed timeline and 0 consensus score
            let event = HistoricalEvent {
                id: event_id,
                title,
                date,
                description,
                evidence_sources,
                tags,
                submitter: caller,
                timeline: Timeline::Disputed,
                consensus_score: 0,
                support_votes: 0,
                challenge_votes: 0,
                created_at: now,
            };

            // Store event in events mapping
            self.events.insert(event_id, &event);

            // Store event ID in timeline_events mapping
            let mut timeline_events = self.timeline_events.get(Timeline::Disputed).unwrap_or_default();
            timeline_events.push(event_id);
            self.timeline_events.insert(Timeline::Disputed, &timeline_events);

            // Track event in user_events mapping
            let mut user_events = self.user_events.get(caller).unwrap_or_default();
            user_events.push(event_id);
            self.user_events.insert(caller, &user_events);

            Ok(event_id)
        }

        /// Generates a unique event ID by incrementing the counter
        fn generate_event_id(&mut self) -> u64 {
            self.event_count = self.event_count.saturating_add(1);
            self.event_count
        }

        /// Checks if a voter has already voted on a specific event
        /// 
        /// # Arguments
        /// * `event_id` - The ID of the event to check
        /// * `voter` - The account address of the voter
        /// 
        /// # Returns
        /// * `true` if the voter has already voted on this event
        /// * `false` if the voter has not voted on this event
        #[ink(message)]
        pub fn has_voted(&self, event_id: u64, voter: AccountId) -> bool {
            self.votes.get((event_id, voter)).is_some()
        }

        /// Records a vote on a historical event
        /// 
        /// # Arguments
        /// * `event_id` - The ID of the event to vote on
        /// * `support` - true for support vote, false for challenge vote
        /// 
        /// # Returns
        /// * `Ok(())` if the vote was recorded successfully
        /// * `Err(Error::EventNotFound)` if the event doesn't exist
        /// * `Err(Error::AlreadyVoted)` if the user has already voted on this event
        #[ink(message)]
        pub fn vote(&mut self, event_id: u64, support: bool) -> Result<(), Error> {
            // Validate event exists
            let mut event = self.events.get(event_id).ok_or(Error::EventNotFound)?;

            // Check if user has already voted (prevent duplicates)
            let caller = self.env().caller();
            if self.has_voted(event_id, caller) {
                return Err(Error::AlreadyVoted);
            }

            // Record vote in votes mapping
            let now = self.env().block_timestamp();
            let vote = Vote {
                voter: caller,
                event_id,
                support,
                timestamp: now,
            };
            self.votes.insert((event_id, caller), &vote);

            // Update event's support_votes or challenge_votes count
            if support {
                event.support_votes = event.support_votes.saturating_add(1);
            } else {
                event.challenge_votes = event.challenge_votes.saturating_add(1);
            }

            // Call calculate_consensus_score
            self.calculate_consensus_score(&mut event);

            // Call check_timeline_movement
            self.check_timeline_movement(&mut event);

            // Store updated event
            self.events.insert(event_id, &event);

            Ok(())
        }

        /// Calculates the consensus score for an event based on votes
        /// 
        /// # Arguments
        /// * `event` - Mutable reference to the event to calculate score for
        /// 
        /// Formula: (support_votes * 100) / total_votes
        fn calculate_consensus_score(&self, event: &mut HistoricalEvent) {
            let total_votes = event.support_votes.saturating_add(event.challenge_votes);
            
            if total_votes == 0 {
                event.consensus_score = 0;
            } else {
                // Calculate percentage using integer arithmetic: (support_votes * 100) / total_votes
                let numerator = event.support_votes.saturating_mul(100);
                let score = numerator.checked_div(total_votes).unwrap_or(0);
                event.consensus_score = score.min(100) as u8;
            }
        }

        /// Checks if an event should move between timelines based on consensus score
        /// 
        /// # Arguments
        /// * `event` - Mutable reference to the event to check
        /// 
        /// Timeline movement rules:
        /// - Score >= 75: Move to Canonical timeline
        /// - Score <= 25: Move to Alternative timeline
        /// - Score 26-74: Remain in Disputed timeline
        fn check_timeline_movement(&mut self, event: &mut HistoricalEvent) {
            let old_timeline = event.timeline;
            let new_timeline = if event.consensus_score >= 75 {
                Timeline::Canonical
            } else if event.consensus_score <= 25 {
                Timeline::Alternative
            } else {
                Timeline::Disputed
            };

            // Only update if timeline changed
            if old_timeline != new_timeline {
                // Remove from old timeline
                if let Some(mut old_events) = self.timeline_events.get(old_timeline) {
                    old_events.retain(|&id| id != event.id);
                    self.timeline_events.insert(old_timeline, &old_events);
                }

                // Add to new timeline
                let mut new_events = self.timeline_events.get(new_timeline).unwrap_or_default();
                new_events.push(event.id);
                self.timeline_events.insert(new_timeline, &new_events);

                // Update event's timeline
                event.timeline = new_timeline;
            }
        }

        /// Retrieves a historical event by its ID
        /// 
        /// # Arguments
        /// * `event_id` - The unique ID of the event to retrieve
        /// 
        /// # Returns
        /// * `Some(HistoricalEvent)` if the event exists
        /// * `None` if the event doesn't exist
        #[ink(message)]
        pub fn get_event(&self, event_id: u64) -> Option<HistoricalEvent> {
            self.events.get(event_id)
        }

        /// Retrieves all events in a specific timeline
        /// 
        /// # Arguments
        /// * `timeline` - The timeline to retrieve events from (Canonical, Disputed, or Alternative)
        /// 
        /// # Returns
        /// * `Vec<HistoricalEvent>` - Vector of all events in the specified timeline
        #[ink(message)]
        pub fn get_events_by_timeline(&self, timeline: Timeline) -> Vec<HistoricalEvent> {
            // Retrieve event IDs from timeline_events mapping
            let event_ids = self.timeline_events.get(timeline).unwrap_or_default();
            
            // Fetch full event data for each ID
            let mut events = Vec::new();
            for event_id in event_ids.iter() {
                if let Some(event) = self.events.get(*event_id) {
                    events.push(event);
                }
            }
            
            events
        }

        /// Retrieves all events submitted by a specific user
        /// 
        /// # Arguments
        /// * `user` - The account address of the user
        /// 
        /// # Returns
        /// * `Vec<HistoricalEvent>` - Vector of all events submitted by the user
        #[ink(message)]
        pub fn get_user_events(&self, user: AccountId) -> Vec<HistoricalEvent> {
            // Retrieve event IDs from user_events mapping
            let event_ids = self.user_events.get(user).unwrap_or_default();
            
            // Fetch full event data for each ID
            let mut events = Vec::new();
            for event_id in event_ids.iter() {
                if let Some(event) = self.events.get(*event_id) {
                    events.push(event);
                }
            }
            
            events
        }

        /// Retrieves all events that contain a specific tag
        /// 
        /// # Arguments
        /// * `tag` - The tag to filter events by
        /// 
        /// # Returns
        /// * `Vec<HistoricalEvent>` - Vector of all events containing the specified tag
        #[ink(message)]
        pub fn get_events_by_tag(&self, tag: String) -> Vec<HistoricalEvent> {
            let mut matching_events = Vec::new();
            
            // Iterate through all events
            for event_id in 1..=self.event_count {
                if let Some(event) = self.events.get(event_id) {
                    // Check if event contains the specified tag
                    if event.tags.contains(&tag) {
                        matching_events.push(event);
                    }
                }
            }
            
            matching_events
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let contract = HistoryProtocol::new();
            assert_eq!(contract.event_count, 0);
        }

        #[ink::test]
        fn submit_event_works() {
            let mut contract = HistoryProtocol::new();
            
            let title = String::from("First Moon Landing");
            let date = 1969_07_20u64;
            let description = String::from("Apollo 11 successfully landed on the moon");
            let evidence = vec![
                String::from("https://nasa.gov/apollo11"),
                String::from("https://archive.org/moon-landing")
            ];
            let tags = vec![
                String::from("Space"),
                String::from("Science")
            ];

            let result = contract.submit_event(
                title.clone(),
                date,
                description.clone(),
                evidence.clone(),
                tags.clone()
            );

            assert!(result.is_ok());
            let event_id = result.unwrap();
            assert_eq!(event_id, 1);
            assert_eq!(contract.event_count, 1);

            // Verify event was stored correctly
            let stored_event = contract.events.get(event_id);
            assert!(stored_event.is_some());
            
            let event = stored_event.unwrap();
            assert_eq!(event.id, event_id);
            assert_eq!(event.title, title);
            assert_eq!(event.date, date);
            assert_eq!(event.description, description);
            assert_eq!(event.evidence_sources, evidence);
            assert_eq!(event.tags, tags);
            assert_eq!(event.timeline, Timeline::Disputed);
            assert_eq!(event.consensus_score, 0);
            assert_eq!(event.support_votes, 0);
            assert_eq!(event.challenge_votes, 0);
        }

        #[ink::test]
        fn submit_event_fails_with_empty_title() {
            let mut contract = HistoryProtocol::new();
            
            let result = contract.submit_event(
                String::from(""),
                1969_07_20u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            );

            assert_eq!(result, Err(Error::InvalidEventData));
            assert_eq!(contract.event_count, 0);
        }

        #[ink::test]
        fn submit_event_fails_with_empty_description() {
            let mut contract = HistoryProtocol::new();
            
            let result = contract.submit_event(
                String::from("Title"),
                1969_07_20u64,
                String::from(""),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            );

            assert_eq!(result, Err(Error::InvalidEventData));
            assert_eq!(contract.event_count, 0);
        }

        #[ink::test]
        fn submit_event_fails_with_no_evidence() {
            let mut contract = HistoryProtocol::new();
            
            let result = contract.submit_event(
                String::from("Title"),
                1969_07_20u64,
                String::from("Description"),
                vec![],
                vec![String::from("Science")]
            );

            assert_eq!(result, Err(Error::InvalidEventData));
            assert_eq!(contract.event_count, 0);
        }

        #[ink::test]
        fn event_id_generation_is_unique() {
            let mut contract = HistoryProtocol::new();
            
            let title = String::from("Event");
            let date = 1000u64;
            let description = String::from("Description");
            let evidence = vec![String::from("evidence")];
            let tags = vec![String::from("Science")];

            // Submit first event
            let result1 = contract.submit_event(
                title.clone(),
                date,
                description.clone(),
                evidence.clone(),
                tags.clone()
            );
            assert!(result1.is_ok());
            let event_id1 = result1.unwrap();

            // Submit second event
            let result2 = contract.submit_event(
                title.clone(),
                date,
                description.clone(),
                evidence.clone(),
                tags.clone()
            );
            assert!(result2.is_ok());
            let event_id2 = result2.unwrap();

            // Verify IDs are unique
            assert_eq!(event_id1, 1);
            assert_eq!(event_id2, 2);
            assert_ne!(event_id1, event_id2);
            assert_eq!(contract.event_count, 2);
        }

        #[ink::test]
        fn vote_works() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event first
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // Vote on the event
            let result = contract.vote(event_id, true);
            assert!(result.is_ok());

            // Verify vote was recorded
            let caller = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().alice;
            assert!(contract.has_voted(event_id, caller));

            // Verify vote counts updated
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.support_votes, 1);
            assert_eq!(event.challenge_votes, 0);
            assert_eq!(event.consensus_score, 100);
        }

        #[ink::test]
        fn vote_prevents_duplicate_voting() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // First vote should succeed
            let result1 = contract.vote(event_id, true);
            assert!(result1.is_ok());

            // Second vote from same user should fail
            let result2 = contract.vote(event_id, false);
            assert_eq!(result2, Err(Error::AlreadyVoted));

            // Verify only one vote was counted
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.support_votes, 1);
            assert_eq!(event.challenge_votes, 0);
        }

        #[ink::test]
        fn vote_fails_on_nonexistent_event() {
            let mut contract = HistoryProtocol::new();
            
            // Try to vote on non-existent event
            let result = contract.vote(999, true);
            assert_eq!(result, Err(Error::EventNotFound));
        }

        #[ink::test]
        fn has_voted_returns_false_for_new_voter() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            let caller = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().alice;
            assert!(!contract.has_voted(event_id, caller));
        }

        #[ink::test]
        fn consensus_score_calculation_works() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // Vote with support
            contract.vote(event_id, true).unwrap();
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.consensus_score, 100); // 1/1 = 100%

            // Change caller and vote with challenge
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(
                ink::env::test::default_accounts::<ink::env::DefaultEnvironment>().bob
            );
            contract.vote(event_id, false).unwrap();
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.consensus_score, 50); // 1/2 = 50%
        }

        #[ink::test]
        fn timeline_movement_to_canonical_works() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // Initial timeline should be Disputed
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.timeline, Timeline::Disputed);

            // Add 3 support votes to reach 75%+ consensus
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.vote(event_id, true).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            contract.vote(event_id, true).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            contract.vote(event_id, true).unwrap();

            // Should move to Canonical (3/3 = 100%)
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.timeline, Timeline::Canonical);
            assert_eq!(event.consensus_score, 100);
        }

        #[ink::test]
        fn timeline_movement_to_alternative_works() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // Add 3 challenge votes to reach 25% or less consensus
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.vote(event_id, false).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            contract.vote(event_id, false).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            contract.vote(event_id, false).unwrap();

            // Should move to Alternative (0/3 = 0%)
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.timeline, Timeline::Alternative);
            assert_eq!(event.consensus_score, 0);
        }

        #[ink::test]
        fn timeline_stays_disputed_for_mixed_votes() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // Add mixed votes to keep in Disputed range (26-74%)
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.vote(event_id, true).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            contract.vote(event_id, false).unwrap();

            // Should stay in Disputed (1/2 = 50%)
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.timeline, Timeline::Disputed);
            assert_eq!(event.consensus_score, 50);
        }

        #[ink::test]
        fn get_event_returns_existing_event() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let title = String::from("Test Event");
            let date = 1000u64;
            let description = String::from("Test Description");
            let evidence = vec![String::from("evidence1")];
            let tags = vec![String::from("Science")];
            
            let event_id = contract.submit_event(
                title.clone(),
                date,
                description.clone(),
                evidence.clone(),
                tags.clone()
            ).unwrap();

            // Retrieve the event
            let retrieved_event = contract.get_event(event_id);
            assert!(retrieved_event.is_some());
            
            let event = retrieved_event.unwrap();
            assert_eq!(event.id, event_id);
            assert_eq!(event.title, title);
            assert_eq!(event.date, date);
            assert_eq!(event.description, description);
            assert_eq!(event.evidence_sources, evidence);
            assert_eq!(event.tags, tags);
        }

        #[ink::test]
        fn get_event_returns_none_for_nonexistent_event() {
            let contract = HistoryProtocol::new();
            
            // Try to retrieve non-existent event
            let retrieved_event = contract.get_event(999);
            assert!(retrieved_event.is_none());
        }

        #[ink::test]
        fn get_events_by_timeline_returns_disputed_events() {
            let mut contract = HistoryProtocol::new();
            
            // Submit multiple events (all start in Disputed timeline)
            let event_id1 = contract.submit_event(
                String::from("Event 1"),
                1000u64,
                String::from("Description 1"),
                vec![String::from("evidence1")],
                vec![String::from("Science")]
            ).unwrap();
            
            let event_id2 = contract.submit_event(
                String::from("Event 2"),
                2000u64,
                String::from("Description 2"),
                vec![String::from("evidence2")],
                vec![String::from("Technology")]
            ).unwrap();

            // Retrieve events from Disputed timeline
            let disputed_events = contract.get_events_by_timeline(Timeline::Disputed);
            assert_eq!(disputed_events.len(), 2);
            
            // Verify both events are present
            assert!(disputed_events.iter().any(|e| e.id == event_id1));
            assert!(disputed_events.iter().any(|e| e.id == event_id2));
        }

        #[ink::test]
        fn get_events_by_timeline_returns_canonical_events() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // Vote to move to Canonical timeline (3 support votes = 100%)
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.vote(event_id, true).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            contract.vote(event_id, true).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            contract.vote(event_id, true).unwrap();

            // Retrieve events from Canonical timeline
            let canonical_events = contract.get_events_by_timeline(Timeline::Canonical);
            assert_eq!(canonical_events.len(), 1);
            assert_eq!(canonical_events[0].id, event_id);
            assert_eq!(canonical_events[0].timeline, Timeline::Canonical);

            // Disputed timeline should now be empty
            let disputed_events = contract.get_events_by_timeline(Timeline::Disputed);
            assert_eq!(disputed_events.len(), 0);
        }

        #[ink::test]
        fn get_events_by_timeline_returns_alternative_events() {
            let mut contract = HistoryProtocol::new();
            
            // Submit an event
            let event_id = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![String::from("Science")]
            ).unwrap();

            // Vote to move to Alternative timeline (3 challenge votes = 0%)
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            contract.vote(event_id, false).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            contract.vote(event_id, false).unwrap();
            
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            contract.vote(event_id, false).unwrap();

            // Retrieve events from Alternative timeline
            let alternative_events = contract.get_events_by_timeline(Timeline::Alternative);
            assert_eq!(alternative_events.len(), 1);
            assert_eq!(alternative_events[0].id, event_id);
            assert_eq!(alternative_events[0].timeline, Timeline::Alternative);

            // Disputed timeline should now be empty
            let disputed_events = contract.get_events_by_timeline(Timeline::Disputed);
            assert_eq!(disputed_events.len(), 0);
        }

        #[ink::test]
        fn get_events_by_timeline_returns_empty_for_empty_timeline() {
            let contract = HistoryProtocol::new();
            
            // All timelines should be empty initially
            let canonical_events = contract.get_events_by_timeline(Timeline::Canonical);
            assert_eq!(canonical_events.len(), 0);
            
            let disputed_events = contract.get_events_by_timeline(Timeline::Disputed);
            assert_eq!(disputed_events.len(), 0);
            
            let alternative_events = contract.get_events_by_timeline(Timeline::Alternative);
            assert_eq!(alternative_events.len(), 0);
        }

        #[ink::test]
        fn get_user_events_returns_user_submitted_events() {
            let mut contract = HistoryProtocol::new();
            
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            // Alice submits two events
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let event_id1 = contract.submit_event(
                String::from("Alice Event 1"),
                1000u64,
                String::from("Description 1"),
                vec![String::from("evidence1")],
                vec![String::from("Science")]
            ).unwrap();
            
            let event_id2 = contract.submit_event(
                String::from("Alice Event 2"),
                2000u64,
                String::from("Description 2"),
                vec![String::from("evidence2")],
                vec![String::from("Technology")]
            ).unwrap();

            // Bob submits one event
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            let event_id3 = contract.submit_event(
                String::from("Bob Event"),
                3000u64,
                String::from("Description 3"),
                vec![String::from("evidence3")],
                vec![String::from("Politics")]
            ).unwrap();

            // Retrieve Alice's events
            let alice_events = contract.get_user_events(accounts.alice);
            assert_eq!(alice_events.len(), 2);
            assert!(alice_events.iter().any(|e| e.id == event_id1));
            assert!(alice_events.iter().any(|e| e.id == event_id2));
            assert!(!alice_events.iter().any(|e| e.id == event_id3));

            // Retrieve Bob's events
            let bob_events = contract.get_user_events(accounts.bob);
            assert_eq!(bob_events.len(), 1);
            assert_eq!(bob_events[0].id, event_id3);
        }

        #[ink::test]
        fn get_user_events_returns_empty_for_user_with_no_events() {
            let contract = HistoryProtocol::new();
            
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            
            // Charlie has not submitted any events
            let charlie_events = contract.get_user_events(accounts.charlie);
            assert_eq!(charlie_events.len(), 0);
        }

        #[ink::test]
        fn submit_event_with_tags_works() {
            let mut contract = HistoryProtocol::new();
            
            let tags = vec![
                String::from("Science"),
                String::from("Technology"),
                String::from("Space")
            ];

            let result = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                tags.clone()
            );

            assert!(result.is_ok());
            let event_id = result.unwrap();
            
            let event = contract.events.get(event_id).unwrap();
            assert_eq!(event.tags, tags);
        }

        #[ink::test]
        fn submit_event_fails_with_empty_tags() {
            let mut contract = HistoryProtocol::new();
            
            let result = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                vec![]
            );

            assert_eq!(result, Err(Error::InvalidEventData));
        }

        #[ink::test]
        fn submit_event_fails_with_too_many_tags() {
            let mut contract = HistoryProtocol::new();
            
            let tags = vec![
                String::from("Tag1"),
                String::from("Tag2"),
                String::from("Tag3"),
                String::from("Tag4"),
                String::from("Tag5"),
                String::from("Tag6")
            ];

            let result = contract.submit_event(
                String::from("Test Event"),
                1000u64,
                String::from("Description"),
                vec![String::from("evidence")],
                tags
            );

            assert_eq!(result, Err(Error::InvalidEventData));
        }

        #[ink::test]
        fn get_events_by_tag_returns_matching_events() {
            let mut contract = HistoryProtocol::new();
            
            // Submit events with different tags
            let event_id1 = contract.submit_event(
                String::from("Science Event"),
                1000u64,
                String::from("Description 1"),
                vec![String::from("evidence1")],
                vec![String::from("Science"), String::from("Technology")]
            ).unwrap();
            
            let event_id2 = contract.submit_event(
                String::from("Politics Event"),
                2000u64,
                String::from("Description 2"),
                vec![String::from("evidence2")],
                vec![String::from("Politics")]
            ).unwrap();
            
            let event_id3 = contract.submit_event(
                String::from("Another Science Event"),
                3000u64,
                String::from("Description 3"),
                vec![String::from("evidence3")],
                vec![String::from("Science"), String::from("Space")]
            ).unwrap();

            // Query events by "Science" tag
            let science_events = contract.get_events_by_tag(String::from("Science"));
            assert_eq!(science_events.len(), 2);
            assert!(science_events.iter().any(|e| e.id == event_id1));
            assert!(science_events.iter().any(|e| e.id == event_id3));
            assert!(!science_events.iter().any(|e| e.id == event_id2));

            // Query events by "Politics" tag
            let politics_events = contract.get_events_by_tag(String::from("Politics"));
            assert_eq!(politics_events.len(), 1);
            assert_eq!(politics_events[0].id, event_id2);
        }
    }
}

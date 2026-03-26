I wrote it as a document you can hand to an AI coding agent so it behaves like a Warcraft III–aware engineer, not just a generic app generator.

A few domain facts that shape this spec: Warcraft III has four core competitive races, neutral buildings are strategically important on melee maps, replay parsing is possible because .w3g stores structured game data rather than video, and replay compatibility can vary by patch/version. Map files such as .w3x are commonly treated as archive/container formats by the community tooling ecosystem.  ￼

⸻

Technical Specification

Project: Warcraft III 1v1 Replay & Map Intelligence Platform

1. Product Overview

1.1 Working Title

Warcraft III Replay & Strategy Intelligence Platform

1.2 Product Vision

Build a web application focused on Warcraft III 1v1 melee that allows a player to:
	•	upload and analyze replay files
	•	upload and analyze melee maps
	•	inspect the full game timeline
	•	click any timestamp and see the reconstructed game state
	•	receive AI recommendations based on matchup, map, timing, army strength, heroes, items, economy, tech, and creeping flow
	•	maintain a private personal knowledge base of replays, units, heroes, buildings, items, maps, neutral camps, and strategic patterns

This product is intended to become a personal Warcraft III intelligence system for learning, reviewing, and improving decision-making.

⸻

2. Core Product Philosophy

This project must be built with the following mindset:
	1.	Warcraft III domain-first
The system must understand the game as a Warcraft III player would, not as a generic analytics app.
	2.	Replay intelligence, not replay storage only
A replay is not just a file to archive. It must become a navigable source of strategic truth.
	3.	AI must think like a Warcraft III player
Any AI that writes code, generates logic, or explains strategy must behave like someone who understands:
	•	race matchups
	•	build orders
	•	creeping routes
	•	hero timings
	•	expansion timing
	•	power spikes
	•	item impact
	•	army composition interactions
	•	map control
	•	scouting and tempo
	4.	All meaningful game factors must be modeled
The system must account for as many variables as possible that improve or worsen play quality, including:
	•	economy
	•	army value
	•	tech timing
	•	upgrades
	•	hero levels
	•	items
	•	neutral buildings
	•	creeping efficiency
	•	resource float
	•	map position
	•	matchup context
	•	timing windows
	•	losses and trades
	•	pressure and initiative
	5.	Private personal database
All uploaded and derived data must be stored in a private, user-owned database structure. This is not just a stateless parser app.

⸻

3. Vibe-Coding / AI Coding Constraints

This section is critical because you said you will use vibe-coding.

3.1 AI Coding Agent Role

The AI coding assistant working on this project must act as:

A senior software engineer + experienced Warcraft III 1v1 player + replay analyst

It must not write code as a generic CRUD assistant.

3.2 AI Coding Rules

When generating architecture, database schemas, parsers, logic, analytics, and recommendations, the AI must:
	•	reason in Warcraft III terms
	•	prefer explicit domain models over vague abstractions
	•	preserve replay accuracy over speed shortcuts
	•	explain tradeoffs in terms of game analysis value
	•	avoid fake certainty where replay data is incomplete
	•	separate deterministic game logic from LLM-generated explanation
	•	avoid “just use open source everywhere” as the default answer

3.3 AI Output Expectations

The AI should produce:
	•	production-minded code
	•	typed models
	•	modular parsers
	•	auditable analytics logic
	•	explainable recommendation logic
	•	testable domain services
	•	comments that reflect Warcraft III context

3.4 Open-Source Policy

The product should be designed so that replay and map parsing can be implemented without mandatory dependence on open-source parsers.

Open-source tools may be used only for:
	•	reference
	•	validation
	•	comparison
	•	testing correctness

A modern TypeScript replay parser such as w3gjs demonstrates that .w3g parsing is feasible and that support may vary by older game versions, but this project should be architected so a custom parser can replace third-party parsing entirely.  ￼

⸻

4. Product Scope

4.1 In Scope
	•	Warcraft III 1v1 melee only
	•	replay upload and analysis
	•	map upload and analysis
	•	private replay library
	•	knowledge base of game entities
	•	game-state reconstruction by timeline
	•	AI recommendations and post-game insights
	•	strategic comparison across replays
	•	user-owned data storage

4.2 Out of Scope for Initial Version
	•	custom games
	•	team games
	•	campaign analysis
	•	arcade maps
	•	live in-game overlay
	•	automatic ladder sync
	•	cross-title support
	•	all historical patch compatibility

⸻

5. Supported Domain

5.1 Competitive Focus

The application is focused on Warcraft III competitive 1v1 melee.

5.2 Core Race Coverage

The product must support all four competitive races:
	•	Human
	•	Orc
	•	Night Elf
	•	Undead

These are the four core Warcraft III races recognized in official game materials.  ￼

5.3 Map Context Requirements

The application must understand melee map structure, including:
	•	starting positions
	•	gold mines
	•	creep camps
	•	item drops
	•	neutral buildings
	•	tavern access
	•	Goblin Merchant access
	•	Mercenary Camp access
	•	Goblin Laboratory access
	•	contested zones
	•	expansion safety
	•	route options

Neutral buildings are strategically important in official Warcraft III references, including Tavern, Goblin Merchant, Goblin Laboratory, Mercenary Camp, Marketplace, and similar neutral map structures.  ￼

⸻

6. High-Level System Modules

The system must be split into the following major modules:

6.1 Knowledge Base Module

Stores and serves all structured game data:
	•	races
	•	units
	•	heroes
	•	buildings
	•	items
	•	upgrades
	•	abilities
	•	creeps
	•	creep camps
	•	neutral buildings
	•	maps
	•	matchup notes

6.2 Replay Upload & Parsing Module

Handles:
	•	replay upload
	•	format validation
	•	patch/version detection
	•	replay parsing
	•	normalization into internal event format

6.3 Game State Reconstruction Engine

Transforms replay events into timestamp-based game state snapshots.

6.4 Map Analysis Module

Parses uploaded maps and extracts strategic geometry and neutral data.

6.5 Analytics Engine

Computes:
	•	economy metrics
	•	tech progression
	•	build order
	•	creep efficiency
	•	fight windows
	•	army strength
	•	hero progression
	•	item impact
	•	power spikes
	•	matchup-specific evaluations

6.6 AI Coach Module

Produces:
	•	tactical advice
	•	strategic advice
	•	mistake detection
	•	timing recommendations
	•	next-step recommendations
	•	post-game summaries

6.7 Personal Replay Vault

Stores:
	•	original replay files
	•	parsed data
	•	generated snapshots
	•	derived analysis
	•	personal notes
	•	tags
	•	search indexes

⸻

7. Functional Requirements

7.1 Replay Upload

The user must be able to upload a Warcraft III replay file.

Requirements
	•	accept .w3g
	•	validate file type and signature
	•	detect replay metadata
	•	reject unsupported formats
	•	detect replay patch/version where possible
	•	store original file in private storage
	•	create replay analysis job

Replay parsing is technically feasible because .w3g replay files can be parsed into structured data rather than treated as video; community parsers and replay tooling exist for this purpose.  ￼

⸻

7.2 Replay Parsing

The system must parse replay files into normalized internal structures.

Parsed Data Targets
	•	replay metadata
	•	map name
	•	game duration
	•	player names
	•	race selection
	•	winner if inferable
	•	action stream
	•	chat log if available
	•	timestamps
	•	event blocks

Internal Replay Event Types

At minimum, normalize to:
	•	GAME_START
	•	PLAYER_INFO
	•	BUILD_START
	•	BUILD_COMPLETE
	•	UNIT_TRAIN_START
	•	UNIT_TRAIN_COMPLETE
	•	HERO_TRAINED
	•	HERO_REVIVED
	•	HERO_LEVEL_UP
	•	ABILITY_LEARNED
	•	ITEM_BOUGHT
	•	ITEM_PICKED
	•	ITEM_DROPPED
	•	UPGRADE_START
	•	UPGRADE_COMPLETE
	•	UNIT_DEATH
	•	HERO_DEATH
	•	EXPANSION_STARTED
	•	CREEP_ENGAGEMENT
	•	FIGHT_WINDOW
	•	RESOURCE_UPDATE_ESTIMATE
	•	SCOUTING_SIGNAL
	•	GAME_END

Notes

Not every event may exist explicitly in replay data. Some events may need to be inferred by reconstruction logic.

⸻

7.3 Timeline Viewer

The user must be able to inspect the replay timeline.

Required UX
	•	show full match duration
	•	show key events on the timeline
	•	allow click on any timestamp
	•	load the reconstructed state for that moment
	•	show event density and major fight markers
	•	allow stepping forward/backward by fixed time increments

Example

At 07:00, the user should see:
	•	current heroes
	•	hero levels
	•	inventory
	•	army composition
	•	active buildings
	•	upgrades completed
	•	current food
	•	estimated gold/lumber status
	•	expansion count
	•	recent losses
	•	current army strength score
	•	AI advice for that exact moment

⸻

7.4 Game State Reconstruction

The system must reconstruct the game state from replay events.

Purpose

Replay data is not enough by itself for the user experience you want. The application must maintain an internal simulation-like representation of the match state over time.

Snapshot Frequency

Support:
	•	every 1 second for premium accuracy mode, or
	•	every 3–5 seconds for default mode,
with the ability to derive exact clicked timestamp state from nearest stored snapshots + event replay delta.

Snapshot Contents

For each player:
	•	race
	•	current heroes
	•	hero levels
	•	hero hp/mana if recoverable or estimable
	•	hero inventory
	•	current units
	•	active army supply
	•	worker count
	•	active buildings
	•	current tier state
	•	upgrades complete
	•	upgrades in progress
	•	resource estimates
	•	expansions
	•	summon state if available
	•	known neutral building usage
	•	recent unit losses
	•	recent tech transitions

Reconstruction Quality Rule

Where the replay does not provide exact information, the system must:
	•	mark values as estimated
	•	document the estimation logic
	•	never present uncertain values as guaranteed facts

⸻

7.5 Personal Database / Private Vault

The system must maintain a private persistent database of all uploaded and derived game information.

Data Categories
	•	replays
	•	maps
	•	players
	•	races
	•	units
	•	heroes
	•	buildings
	•	items
	•	upgrades
	•	creeps
	•	creep camps
	•	neutral buildings
	•	matchup rules
	•	strategic tags
	•	AI-generated notes
	•	user notes
	•	snapshot records
	•	event records
	•	aggregated player trends

Privacy Requirement

All replay and analysis data must be private by default.

⸻

7.6 Map Upload and Parsing

The user must be able to upload Warcraft III map files for analysis.

Supported Formats
	•	.w3x
	•	optionally .w3m later

Community documentation and tooling commonly treat .w3x/.w3m as Warcraft III map container/archive formats with extractable internal files and metadata.  ￼

Map Data Extraction Goals
	•	map metadata
	•	size
	•	tileset
	•	starting locations
	•	gold mine positions
	•	neutral building positions
	•	preplaced units
	•	creep camp groups
	•	item drops where available
	•	choke points
	•	route candidates
	•	expansion locations

Map Analysis Outputs
	•	safe early creeping routes by race
	•	contested camp recommendations
	•	expansion safety score
	•	tavern timing value
	•	merchant access score
	•	rush distance notes
	•	air mobility notes
	•	matchup-specific route suggestions

⸻

7.7 Knowledge Base

The application must contain its own internal Warcraft III database.

Required Entity Types
	•	Race
	•	Unit
	•	Hero
	•	Building
	•	Item
	•	Upgrade
	•	Ability
	•	Creep
	•	CreepCamp
	•	NeutralBuilding
	•	Map
	•	MatchupRule
	•	StrategyPattern

Important Rule

This database is first-party product data.
It must not depend on runtime scraping.

Example Data for Units
	•	id
	•	name
	•	race
	•	tier
	•	cost
	•	supply
	•	build time
	•	hp
	•	mana
	•	armor
	•	damage min/max
	•	attack type
	•	armor type
	•	move speed
	•	attack cooldown
	•	range
	•	abilities
	•	upgrades affecting unit
	•	counters
	•	synergy tags

Official Warcraft III references expose unit stats and race-specific unit data, which supports the requirement for a structured internal game database.  ￼

⸻

7.8 AI Recommendation System

The AI must analyze the current game state and recommend actions.

Examples of AI Questions
	•	Should I attack now?
	•	Should I creep instead?
	•	Should I expand?
	•	Am I behind?
	•	Did I miss a timing window?
	•	Is this army good against the opponent’s current composition?
	•	Which route is safest on this map versus this race?
	•	What was my first major mistake in this replay?

Recommendation Inputs

The AI must consider:
	•	race matchup
	•	map
	•	game phase
	•	current tech state
	•	hero levels
	•	hero items
	•	army composition
	•	total army strength
	•	anti-air availability
	•	dispel availability
	•	mana pool
	•	healing/sustain
	•	upgrades
	•	expansion status
	•	recent fights
	•	recent losses
	•	creeping efficiency
	•	tempo
	•	scouting signals
	•	map control
	•	neutral building access
	•	resource float
	•	idle production
	•	supply block patterns

AI Output Types
	•	immediate next-step recommendation
	•	tactical warning
	•	strategic correction
	•	matchup-specific advice
	•	power-spike alert
	•	missed-opportunity alert
	•	post-game summary
	•	mistake ranking

⸻

8. Analytics Model

8.1 Game Phase Detection

The system must classify game state into:
	•	opening
	•	early game
	•	early-mid game
	•	mid game
	•	mid-late game
	•	late game

Game phase must be inferred from:
	•	time
	•	tier progression
	•	hero count
	•	expansion count
	•	supply
	•	upgrades
	•	map access
	•	army composition maturity

⸻

8.2 Economy Metrics

The system must calculate or estimate:
	•	current gold
	•	current lumber
	•	gold mined
	•	lumber gathered
	•	worker count
	•	idle worker suspicion
	•	expansion income status
	•	resource float
	•	spending efficiency
	•	production uptime

⸻

8.3 Hero Metrics

For each hero:
	•	hero level
	•	xp progression if possible
	•	inventory value
	•	item synergy
	•	mana-based impact
	•	spell timing relevance
	•	survivability index
	•	comeback value
	•	matchup pressure value

⸻

8.4 Army Metrics

The system must compute:
	•	army supply
	•	army value
	•	total hp pool
	•	effective hp
	•	ground dps
	•	air dps
	•	anti-air coverage
	•	siege potential
	•	disable potential
	•	dispel availability
	•	healing/sustain
	•	summon contribution
	•	mobility
	•	detection
	•	burst potential

⸻

8.5 Tech Metrics

The system must track:
	•	tech building timing
	•	tier advancement timing
	•	upgrade timing
	•	delayed tech
	•	greedy tech
	•	matchup-appropriate tech rating

⸻

8.6 Creeping Metrics

The system must track:
	•	first creep timing
	•	route quality
	•	camp difficulty pacing
	•	hero xp efficiency
	•	item route efficiency
	•	camp steal opportunities
	•	missed neutral opportunities

⸻

8.7 Combat Metrics

The system must detect:
	•	first engagement
	•	major fight windows
	•	overcommitment
	•	favorable / unfavorable trades
	•	fight readiness
	•	army advantage / disadvantage
	•	pre-fight and post-fight state delta

⸻

9. Army Strength Model

The army strength model must not be a naive “supply only” metric.

9.1 Required Formula Inputs

Army evaluation must consider:
	•	unit composition
	•	hero levels
	•	hero mana
	•	hero items
	•	upgrades
	•	hp state if available
	•	armor types
	•	attack types
	•	matchup-specific counters
	•	dispel
	•	summons
	•	anti-air
	•	sustain
	•	map position if known
	•	power-spike timing

9.2 Score Layers

The system must produce at least:
	•	absolute army score
	•	relative matchup army score
	•	attack-now confidence
	•	do-not-fight warning level

9.3 Version 1 Approach

Use a deterministic weighted model first:
	•	UnitScore
	•	HeroScore
	•	ItemScore
	•	UpgradeScore
	•	TempoModifier
	•	PositionModifier
	•	MatchupModifier

Do not start with an opaque machine-learning-only combat model.

⸻

10. AI Architecture

The AI system must be layered.

10.1 Layer A — Deterministic Rule Engine

This is the primary source of truth.

Responsibilities:
	•	compare state
	•	detect deficits
	•	detect spikes
	•	detect strategic errors
	•	generate recommendation primitives

10.2 Layer B — Matchup Knowledge Base

Stores authored Warcraft III strategic logic:
	•	Human vs Orc
	•	Human vs Undead
	•	Human vs Night Elf
	•	Orc vs Undead
	•	Orc vs Night Elf
	•	Undead vs Night Elf
	•	mirrors

10.3 Layer C — Explanation Layer

An LLM may convert the deterministic output into:
	•	human-readable analysis
	•	coaching tone
	•	concise tactical advice
	•	beginner or advanced explanations

Hard Requirement

The LLM must not be the sole decision-maker for strategic truth.

⸻

11. Data Model

11.1 Main Entities
	•	User
	•	Replay
	•	ReplayFile
	•	ReplayEvent
	•	ReplaySnapshot
	•	ReplayAnalysis
	•	ReplayTag
	•	Map
	•	MapFile
	•	MapCamp
	•	NeutralBuilding
	•	UnitDefinition
	•	HeroDefinition
	•	ItemDefinition
	•	BuildingDefinition
	•	UpgradeDefinition
	•	AbilityDefinition
	•	CreepDefinition
	•	MatchupRule
	•	Recommendation
	•	UserNote

11.2 Replay Entity Example

Fields:
	•	id
	•	userId
	•	originalFilePath
	•	replayVersion
	•	patchVersion
	•	mapName
	•	durationSeconds
	•	gameMode
	•	player1Name
	•	player2Name
	•	player1Race
	•	player2Race
	•	winner
	•	parseStatus
	•	analysisStatus
	•	createdAt

11.3 Replay Snapshot Example

Fields:
	•	id
	•	replayId
	•	timestampSeconds
	•	player1StateJson
	•	player2StateJson
	•	armyComparisonJson
	•	economyComparisonJson
	•	heroComparisonJson
	•	aiSummaryJson
	•	uncertaintyFlagsJson

⸻

12. Architecture Requirements

12.1 Recommended Stack

Because you are using vibe-coding and want fast iteration:

Frontend
	•	Next.js
	•	React
	•	TypeScript
	•	Tailwind CSS

Backend / API
	•	Next.js API routes or separate Node.js service
	•	TypeScript
	•	PostgreSQL
	•	Redis for jobs
	•	object storage for uploaded files

Analysis Services
	•	custom replay parser service
	•	custom map parser service
	•	snapshot generation worker
	•	analytics engine service
	•	AI orchestration service

Recommendation

Start with TypeScript end-to-end for speed and AI-assisted coding flow.

⸻

12.2 Service Separation

Recommended modules:
	•	web-app
	•	api
	•	replay-parser
	•	map-parser
	•	state-engine
	•	analytics-engine
	•	ai-coach
	•	database
	•	worker

⸻

13. Parser Requirements

13.1 Replay Parser

The replay parser should be built as a custom internal module.

Goals
	•	parse .w3g
	•	extract replay metadata
	•	extract player data
	•	extract action blocks
	•	normalize action stream
	•	support incremental parser improvements
	•	support test fixtures

Parser Design Rules
	•	no business logic inside byte reader
	•	separate low-level binary parsing from domain normalization
	•	preserve raw parsed tokens for debugging
	•	produce structured parser diagnostics
	•	expose replay version compatibility information

Testing

The parser must be tested against:
	•	known valid replays
	•	corrupted replay files
	•	unsupported versions
	•	different race matchups
	•	short and long games

⸻

13.2 Map Parser

The map parser should be an internal module that can analyze melee maps.

Goals
	•	parse .w3x
	•	extract strategic structures
	•	identify camps
	•	identify neutral buildings
	•	identify expansions
	•	produce route graph / camp graph

Design Rules
	•	preserve source map metadata
	•	separate extraction from strategic evaluation
	•	support future pathing analysis upgrades

⸻

14. User Flows

14.1 Replay Analysis Flow
	1.	user uploads replay
	2.	system validates file
	3.	system stores original replay
	4.	parser extracts structured events
	5.	reconstruction engine builds snapshots
	6.	analytics engine computes metrics
	7.	AI coach generates recommendations
	8.	replay becomes searchable in private vault

14.2 Timestamp Inspection Flow
	1.	user opens replay page
	2.	user clicks timestamp
	3.	system loads nearest snapshot
	4.	system resolves exact state
	5.	UI shows both players’ state
	6.	AI panel explains what is happening and what should be done

14.3 Map Strategy Flow
	1.	user uploads map
	2.	map parser extracts camps/buildings/expansions
	3.	analytics engine scores routes
	4.	AI explains good openings by race and matchup

⸻

15. UI Requirements

15.1 Replay Screen

Must include:
	•	match summary header
	•	player info
	•	map info
	•	clickable timeline
	•	key events stream
	•	selected timestamp state panel
	•	hero/item panel
	•	army panel
	•	economy panel
	•	AI advice panel

15.2 Map Screen

Must include:
	•	map overview
	•	camp markers
	•	neutral building markers
	•	start positions
	•	route overlays
	•	matchup recommendation panel

15.3 Knowledge Base Screens

Must include searchable pages for:
	•	units
	•	heroes
	•	items
	•	buildings
	•	maps
	•	races
	•	matchups

⸻

16. Non-Functional Requirements

Performance
	•	replay upload feedback must be immediate
	•	background analysis must be asynchronous
	•	snapshot loading must feel fast
	•	timestamp click response should be near-instant after analysis is complete

Explainability
	•	AI advice must reference concrete reasons
	•	uncertain data must be labeled
	•	derived scores must be interpretable

Testability
	•	parsers must have fixture-based tests
	•	analytics formulas must have deterministic tests
	•	AI prompts must be versioned

Extensibility
	•	support future additional patch families
	•	support deeper map pathing logic later
	•	support future replay comparison features

Privacy
	•	all replay data private by default
	•	no public sharing unless explicitly added later

⸻

17. Risks and Constraints

17.1 Replay Version Compatibility

Replay behavior and usability can vary by patch/version, and community discussion around Warcraft III regularly notes replay compatibility issues across updates. This must be treated as a product constraint from day one.  ￼

17.2 Reconstruction Accuracy

Some values may need estimation rather than direct extraction.

17.3 Custom Parser Complexity

Building an in-house parser gives control and long-term product value, but increases implementation complexity and testing needs.

17.4 AI Hallucination Risk

Strategy explanations must always be grounded in deterministic analytics.

17.5 Map Extraction Complexity

Map formats are structured containers, so extraction depth may vary depending on what internal map data is available and how robust the parser becomes.  ￼

⸻

18. Development Priorities

Phase 1 — Foundation
	•	knowledge base schema
	•	replay upload
	•	custom replay parser prototype
	•	replay metadata extraction
	•	event normalization
	•	replay vault

Phase 2 — Intelligence Core
	•	state reconstruction engine
	•	timestamp snapshots
	•	army score v1
	•	hero/item/economy analytics
	•	replay screen UI

Phase 3 — AI Coach
	•	deterministic rule engine
	•	matchup rule system
	•	explanation layer
	•	post-game summary

Phase 4 — Map Intelligence
	•	custom map parser
	•	camp graph extraction
	•	neutral building analysis
	•	route recommendation logic

Phase 5 — Advanced Personal Intelligence
	•	replay comparison
	•	trend detection across many replays
	•	player-specific weakness analysis
	•	personalized training recommendations

⸻

19. Final Implementation Guideline for AI Coding Agent

Use this instruction verbatim as the project coding posture:

Build this product as if you are both a senior full-stack engineer and an experienced competitive Warcraft III 1v1 player.
Do not generate shallow generic analytics.
Model the real game.
Prefer deterministic, testable domain logic.
Treat replay parsing, game-state reconstruction, army evaluation, and matchup-aware recommendations as core product intelligence.
Store all meaningful game data in the project’s own database.
Open-source parsers may be used only as references or validation tools, not as mandatory architecture.
Every major technical decision should improve Warcraft III replay understanding, learning value, and strategic accuracy.

⸻

20. Short Product Summary

This application is a private Warcraft III 1v1 analysis platform that combines:
	•	personal replay storage
	•	internal game database
	•	custom parsing
	•	timeline-driven game-state reconstruction
	•	matchup-aware analytics
	•	AI coaching that thinks like a Warcraft III player

The first version must prioritize accuracy, structured data, explainability, and strong foundations over flashy features.

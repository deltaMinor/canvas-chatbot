# Changelog

All notable changes to this project will be documented in this file.

## [unreleased]

### 🐛 Bug Fixes

- Update shared_libs version in env file
- DatabaseModel model_dump, remove dump_id param;
- Repository update_single _id
- _id payload ValueError bug

### 📚 Documentation

- Update changelog

## [shared_libs/v1.4.2] - 2024-05-09

### 🚀 Releases

- Shared_libs/v1.4.2

### 🐛 Bug Fixes

- Modify attack flow view label to keyRisk
- Accounted for bidirectional edges in project graph for attack flow
- Applicability_is_fixed
- Risk level permissions and others_stats in history util
- Stats to take residual risk level instead of default
- Renamed attributes in explanationForGenerationRule
- Forward/backward direct edge not to have other non-condition nodes in between
- Update shared_libs changelog script and update shared_libs changelog; add raise_exception decorators in risk engine;
- Update tosca-builtins.xml
- Showing applicability and priority in project risk scenario
- Rapids_stat
- Counts of project history register stats
- Remove attack flow scenario when attack path is removed
- Remove logger in project model
- Identified root cause bug with isin_ont; minor refactoring of risk engine;
- Isin_ont bug;
- Remove logs
- Update tosca config
- Bug with ObjectId serialization
- Serialization error of _id in register tasks
- DatabaseModel serialization ignore _id by default unless dump_id is set True in model_dump()

### 📚 Documentation

- Update shared_libs, environment

## [shared_libs/v1.4.1] - 2024-05-08

### 🚀 Releases

- Shared_libs v1.4.1

### 🐛 Bug Fixes

- Change dataStored to data_stored
- Added key risk to attack flow risk scenario
- ExplanationForGenerationRule
- Added others_stats
- Attack bundle schema error; outstanding issue with risk scenario generator unresolved;
- Temp disable some attack flows using PREAPPROVED_STIX_BUNDLES in lib_config.py
- Update attack bundle json
- Bug with atk generation
- Add GenericCodePipeline cluster_node
- Fix schema warning in StixExtensionDefinition

### 📚 Documentation

- Update shared_libs changelog

## [shared_libs/v1.4.0] - 2024-05-06

### 🚀 Features

- Display attack flow scenarios in project register

### 🐛 Bug Fixes

- Patch diagram endpoint returning "canvas" value as list instead of dict
- Update requirements. bump pydantic version to fix bug.
- Remove CanvasAttackMapping BaseModel
- Renamed data_store to data_stored
- Minor fixes in risk register service
- Remove node/edge from canvas when the user story card is removed
- Add attack_mapping ref; add new enum types; update base_model; add Subnet, Router tosca;
- Remove unused import
- Update card ref of data flow view when creating canvas
- Update card ref of existing data flow view when submitting questionnaire
- Sort attack paths by name; add Ontology type hints;
- Prevent adding tags to user added risk scenarios
- Remove log; update shared_libs changelog
- Add grouping label
- Setup script
- Relrease shared_libs v1.4.0; update env; add missing keys in ProjectStatusBaseModel;

### 🚜 Refactor

- Shared_libs, rename databases

### 📚 Documentation

- Update shared_libs changelog

## [shared_libs/v1.3.0] - 2024-04-29

### 🚀 Features

- First iteration supporting attack path diagram views
- Updated tosca type in attack flow

### 🐛 Bug Fixes

- Add view_only attribute to CanvasViewBaseModel
- Node id list of existing canvas view is now getting updated when new submission is made
- RegisterUtil bug
- Modify ProjectStatusBaseModel, remove resolve issues status;
- Re-added the reset_url to fix the send_email block and removed _init_ block for send_feedback_email
- Changed organization to employment type in risk register files
- Changed  organization to employment type in risk register files (more)
- Cache risk scenario bug
- Project register history update
- Updated overall statistics to design and compliance
- Added assign_applicability function to risk scenario class
- Minor fixes in risk register service
- Standardized rapidsCategory to rapids_category
- Updated codepipeline to DeploymentService tosca_config.py
- Update attack_flow_1.json
- Merge fix for base_models.py
- Merge fixes
- Gitignore
- Remove build dir
- Release shared_libs/v1.3.0

### 🚜 Refactor

- Email sending portion included in FeedbackFormApplicationService, FeedbackFormAPIView in views.py cleaned up

### 📚 Documentation

- Update shared_libs changelog

### ⚡ Performance

- Feedback model implemented into FeedbackFormApplicationService

### 🎨 Styling

- Space added in feedback_id included in the email subject

## [shared_libs/v1.2.1] - 2024-04-26

### 🐛 Bug Fixes

- No node id is added for interface node
- Fix view name not getting updated
- Store user node ids into node id list for each new canvas view after the diagram is generated
- Ensure card node not being overwritten when making new submission
- Change email sender to tm_support
- Release shared_libs/v1.2.1

### 🚜 Refactor

- Project register scenario generation (application layer)

### 📚 Documentation

- Update v1.2.0 changelog
- Update README for gpg setup

## [shared_libs/v1.2.0] - 2024-04-25

### 🚀 Features

- Updated EmailFeedbackService to allow email subject and content to be sent to my IARCS email as temporary solution
- Updated email subject and email content to reflect user information in EmailFeedbackService

### 🐛 Bug Fixes

- Repeated register generation in project register application service
- Merge edits
- Updated email addresses and email service in service.py and lib_config.py in email_service
- Add new KnowledgeBaseSource enum values
- Save user added project scenarios after regeneration
- Last login time on user console; store datetime in utc;
- Temporary solution; updated our sender email address to my work email address for EmailService
- Storing datetime as utc string
- Datetime bug with jwt
- Update kill script to kill mongod processes
- Remove attack bundle redis caching; update attack_bundle.json, update diagram template;
- Fix empty user story card crashes the editor
- Update card_id_affiliations when resubmit questionnaire with new user story card
- Cluster node tosca type
- Attack_bundle update; fix rapids_category field;
- Update attack bundle iarcs.User to arcs.nodes.User
- Final commit after resolving minor conflicts on git pull origin dev
- Reset password flow; refactor send_plaintext_email method in shared_libs; advance shared_libs version to 1.2.0; update whl;

### 🚜 Refactor

- Risk scenario generator wip
- Work in progress. debugging

### 📚 Documentation

- Update CHANGELOG shared_libs/v1.1.0

## [shared_libs/v1.1.0] - 2024-04-22

### 🚀 Features

- Attack path generation through register generation endpoint

### 🐛 Bug Fixes

- Docker setup services
- Docker_deploy_network dir
- Docker restart command
- Add exec permissions
- Update Dockerfile duration-seconds to 1800
- Update file paths and import statements
- Modify StixBundle model, add name field;
- Update cliff toml
- Attack_path output wip; last_login tz revert to utc;
- Get_explanation_for_generation_rule
- Remove attach_paths fields from ProjectRiskScenario

### 🚜 Refactor

- Risk_scenario_generator

### 🚜 Update

- AttackBundleService; fix and rename __init to __init__
- Rebuild shared_libs whl

### 📚 Documentation

- Update shared_libs/1.0.1 release CHANGELOG

## [shared_libs/v1.0.1] - 2024-04-20

### 🚀 Features

- Successful run with no known issues

### 🐛 Bug Fixes

- Attack_paths missing in ProjectRiskScenario; get_generated_risk_scenario_models return typing; minor refactoring;
- Risk scenario generator with uninitiated archi diag
- Typing error for explanationForGenerationRule
- Bump whl version to v1.0.1

### 📚 Documentation

- Update v1.0.0 CHANGELOG

## [shared_libs/v1.0.0] - 2024-04-19

### 🐛 Bug Fixes

- Replace whl file, following git tag version
- Remove outdated whl
- Update gitignore
- Update v1.0.0 whl

### 📚 Documentation

- Update module changelog and README.md

### ⚙️ Miscellaneous Tasks

- Submit project cq, trigger project status update failure;
- Run asssement trigger error related to function naming conflict;
- Application store imports trigger backend start server failure;
- Update project status
- Upload file n modules error in bytestring conversion
- Mkdocs server deployment on docker;
- ResourceTagManager missing methods
- Resource_tag (admin) not returning correct values
- Tm_docs, docker build;
- Setup venv with whl
- Complete
- Shared_libs requirements
- Prelimnary implementation of EmailFeedbackService
- Prelimnary implementation of EmailFeedbackService

<!-- generated by git-cliff -->

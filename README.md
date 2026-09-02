# Brand Navigator AI

Build the foundation of an AI Content Intelligence and Personal Brand Automation platform for Ntein Praises, an AI Automation Engineer.

IMPORTANT:

Use my connected Supabase project.

Create the required Supabase database schema as part of this project.

Do not use mock data for the actual application data.

The application will later connect to n8n automation workflows, so design the database to be easy for n8n to read and update.

========================================

DATABASE TABLES

========================================

Create these tables:

1. brand_profiles

Fields:

- id UUID primary key

- user_id UUID

- name

- professional_title

- positioning

- bio

- services JSONB

- expertise JSONB

- industries JSONB

- tone

- writing_style

- words_to_avoid JSONB

- settings JSONB

- created_at

- updated_at

2. audiences

Fields:

- id UUID primary key

- name

- description

- pain_points JSONB

- goals JSONB

- industries JSONB

- preferred_topics JSONB

- created_at

- updated_at

3. content_pillars

Fields:

- id UUID primary key

- name

- description

- objectives JSONB

- created_at

- updated_at

4. content_calendar

Fields:

- id UUID primary key

- user_id UUID

- scheduled_date DATE

- audience_id UUID

- pillar_id UUID

- topic

- objective

- format

- status

- opportunity_id UUID nullable

- draft_id UUID nullable

- visual_prompt_id UUID nullable

- created_at

- updated_at

5. research_items

Fields:

- id UUID primary key

- source_name

- source_type

- url

- title

- published_at

- summary

- content

- category

- extracted_facts JSONB

- relevance_score

- credibility_score

- hash

- created_at

6. content_opportunities

Fields:

- id UUID primary key

- research_item_id UUID nullable

- audience_id UUID

- pillar_id UUID

- topic

- why_it_matters

- key_insight

- supporting_evidence JSONB

- statistics JSONB

- business_implication

- suggested_angle

- suggested_hook

- recommended_format

- relevance_score

- timeliness_score

- business_value_score

- originality_score

- evidence_score

- overall_score

- status

- created_at

7. content_drafts

Fields:

- id UUID primary key

- calendar_id UUID nullable

- opportunity_id UUID nullable

- title

- hook

- body

- cta

- closing

- hashtags JSONB

- full_post

- status

- ai_model

- generation_metadata JSONB

- created_at

- updated_at

8. content_versions

Fields:

- id UUID primary key

- draft_id UUID

- version_number

- content

- change_reason

- created_at

9. visual_prompts

Fields:

- id UUID primary key

- draft_id UUID

- visual_type

- concept

- layout

- required_elements JSONB

- visual_text

- style

- aspect_ratio

- gamma_prompt

- status

- created_at

10. gamma_generations

Fields:

- id UUID primary key

- visual_prompt_id UUID

- gamma_generation_id

- gamma_url

- status

- response JSONB

- created_at

- updated_at

11. personal_stories

Fields:

- id UUID primary key

- user_id UUID

- title

- story

- lesson

- topics JSONB

- audiences JSONB

- pillars JSONB

- created_at

- updated_at

12. case_studies

Fields:

- id UUID primary key

- user_id UUID

- title

- client_or_project

- problem

- solution

- technologies JSONB

- results

- metrics JSONB

- lessons

- industries JSONB

- created_at

- updated_at

13. content_analytics

Fields:

- id UUID primary key

- draft_id UUID

- published_at

- impressions

- reactions

- comments

- reposts

- saves

- profile_visits

- followers_gained

- leads

- meetings_booked

- notes

- created_at

14. automation_runs

Fields:

- id UUID primary key

- workflow_name

- run_date

- status

- started_at

- completed_at

- error_message

- metadata JSONB

- created_at

========================================

DATABASE RELATIONSHIPS

========================================

Create appropriate foreign keys between:

audiences → content_calendar

content_pillars → content_calendar

content_calendar → content_opportunities

content_calendar → content_drafts

content_opportunities → research_items

content_drafts → content_opportunities

content_drafts → content_versions

content_drafts → visual_prompts

visual_prompts → gamma_generations

content_drafts → content_analytics

Create indexes for commonly queried fields.

Prevent duplicate research items using the hash field.

Use timestamps.

Add appropriate Row Level Security policies so authenticated users can access their own application data.

========================================

APPLICATION FOUNDATION

========================================

Create a clean professional SaaS dashboard.

Main navigation:

- Dashboard

- Content Calendar

- Research

- Content Opportunities

- Drafts

- Visuals

- Analytics

- Brand Profile

- Settings

Dashboard should initially display:

- Today's content

- Today's audience

- Today's pillar

- Current topic

- Opportunity score

- Draft status

- Visual status

- Recent research

- Recent automation runs

Use a modern professional design appropriate for an AI automation/productivity platform.

Do not build advanced features yet.

Focus on:

1. database

2. Supabase connection

3. authentication structure

4. application layout

5. dashboard foundation

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d3acc056-87a8-49d0-97d5-937243ca5569).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

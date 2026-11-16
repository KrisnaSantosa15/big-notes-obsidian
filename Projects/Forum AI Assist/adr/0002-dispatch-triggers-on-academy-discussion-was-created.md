# Dispatch listens to AcademyDiscussionWasCreated, not NewCourseDiscussionWasCreated

The listener that queues an AI request reacts to `AcademyDiscussionWasCreated`, raised by `NewDiscussionRepository::saveNewDiscussion()` after the insert returns an id. It carries only `discussion_id`, so the listener looks the discussion row up to get everything else.

`NewCourseDiscussionWasCreated` was the intuitive choice and is wrong. It is raised inside the aggregate at `NewDiscussion.php:76`, from `$this->createdDiscussion->toArray()` — *before* the row is persisted — so there is no id yet, and its payload is limited to `course_id`, `tutorial_id`, `creator_id`, `title`. Since `discussion_id` is the correlation key for the entire feature (the AI request body, the webhook callback, the unique FK on `forum_ai_assist_answers`), an event that cannot supply it is unusable no matter how well-named it is. `AcademyDiscussionWasCreated` had zero listeners before this feature; we are the first consumer.

The lookup is not a cost we grudgingly accept — it is cheaper than the alternative. One query yields `ai_assist_enabled`, `course_id`, `tutorial_id`, `creator_id`, `title` and `question` together, which is exactly the dispatch payload. It also lets the listener return early for non-opted-in discussions, so the large majority of discussion creations never enqueue a job at all.

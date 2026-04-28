CREATE TABLE IF NOT EXISTS `todos` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `completed` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL
);

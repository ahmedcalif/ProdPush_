CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`owner_id` text NOT NULL,
	`status` text,
	`due_date` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`project_id` integer NOT NULL,
	`assigned_to` text,
	`status` text,
	`priority` text,
	`due_date` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`sub` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`picture` text,
	`given_name` text,
	`family_name` text,
	`updated_at` integer NOT NULL,
	`email_verified` integer NOT NULL,
	`preferred_username` text
);

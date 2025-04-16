ALTER TABLE `users` RENAME COLUMN "preferred_username" TO "username";--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `sub`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `picture`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `given_name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `family_name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email_verified`;
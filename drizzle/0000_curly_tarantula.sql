CREATE TABLE `MONBUIS` (
	`ID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`MON_ID` integer NOT NULL,
	`BUI_NAME` text NOT NULL,
	`NIKU_ZAN` integer DEFAULT 0,
	`NIKU_DA` integer DEFAULT 0,
	`NIKU_DAN` integer DEFAULT 0,
	`NIKU_HI` integer DEFAULT 0,
	`NIKU_MIZU` integer DEFAULT 0,
	`NIKU_RAI` integer DEFAULT 0,
	`NIKU_KORI` integer DEFAULT 0,
	`NIKU_RYU` integer DEFAULT 0,
	`CREATED_AT` integer DEFAULT (strftime('%s', 'now')),
	`UPDATED_AT` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `MONSTERS` (
	`ID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`MON_TYPE` text,
	`MON_NAME` text NOT NULL,
	`CREATED_AT` integer DEFAULT (strftime('%s', 'now')),
	`UPDATED_AT` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `MOTIONS` (
	`ID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`WEAPON_TYPE` text DEFAULT '片手剣',
	`MOTION_NAME` text NOT NULL,
	`MOTION_VALUE` integer DEFAULT 0,
	`ZOKUSEI_RITSU` real DEFAULT 0,
	`ZAN_DA_DAN` text,
	`CREATED_AT` integer DEFAULT (strftime('%s', 'now')),
	`UPDATED_AT` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `WEAPONS` (
	`ID` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`WEAPON_TYPE` text DEFAULT '片手剣',
	`WEAPON_NAME` text NOT NULL,
	`ZOKUSEI_TYPE` text DEFAULT '無',
	`KOUGEKI_RYOKU` integer DEFAULT 0,
	`ZOKUSEI_RYOKU` integer DEFAULT 0,
	`KAIHO_FLG` integer DEFAULT false,
	`ZOKUSEI_KAIHO` integer DEFAULT 0,
	`KIREAJI_HOSEI` real DEFAULT 0,
	`KAISHIN_RITSU` real DEFAULT 0,
	`CREATED_AT` integer DEFAULT (strftime('%s', 'now')),
	`UPDATED_AT` integer DEFAULT (strftime('%s', 'now'))
);

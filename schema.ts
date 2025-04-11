import { sql, eq, lt, gte, ne } from "drizzle-orm";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const weaponsTable = sqliteTable("WEAPONS", {
  id: integer("ID", { mode: "number" }).primaryKey({ autoIncrement: true }),
  weaponType: text("WEAPON_TYPE", { enum: ["太刀", "片手剣", "大剣", "双剣", "ハンマー", "狩猟笛", "操虫棍", "ランス", "ガンランス", "スラッシュアックス", "チャージアックス", "弓", "ライトボウガン", "ヘビーボウガン"] }).default("片手剣"),
  weaponName: text("WEAPON_NAME").notNull(),
  zokuseiType: text("ZOKUSEI_TYPE", { enum: ["無", "火", "水", "雷", "氷", "龍"] }).default("無"),
  kougekiRyoku: integer("KOUGEKI_RYOKU", { mode: "number" }).default(0),
  zokuseiRyoku: integer("ZOKUSEI_RYOKU", { mode: "number" }).default(0),
  kaihoFlg: integer("KAIHO_FLG", { mode: "boolean" }).default(false),
  zokuseiKaiho: integer("ZOKUSEI_KAIHO", { mode: "number" }).default(0),
  kireajiHosei: real("KIREAJI_HOSEI").default(0.0),
  kireajiHoseiZokusei: real("KIREAJI_HOSEI_ZOKUSEI").default(0.0),
  kaishinRitsu: real("KAISHIN_RITSU").default(0.0),
  createdAt: integer("CREATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("UPDATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const motionsTable = sqliteTable("MOTIONS", {
  id: integer("ID", { mode: "number" }).primaryKey({ autoIncrement: true }),
  weaponType: text("WEAPON_TYPE", { enum: ["太刀", "片手剣", "大剣", "双剣", "ハンマー", "狩猟笛", "操虫棍", "ランス", "ガンランス", "スラッシュアックス", "チャージアックス", "弓", "ライトボウガン", "ヘビーボウガン"] }).default("片手剣"),
  motionName: text("MOTION_NAME").notNull(),
  motionValue: integer("MOTION_VALUE", { mode: "number" }).default(0),
  zokuseiRitsu: real("ZOKUSEI_RITSU").default(0.0),
  zanDaDan: text("ZAN_DA_DAN", { enum:["斬","打","弾"]}),
  createdAt: integer("CREATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("UPDATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const monstersTable = sqliteTable("MONSTERS", {
  id: integer("ID", { mode: "number" }).primaryKey({ autoIncrement: true }),
  monsterType: text("MON_TYPE", { enum: ["飛竜種", "獣竜種", "牙竜種", "魚竜種", "鳥竜種", "牙獣種", "古龍種"]}),
  monsterName: text("MON_NAME").notNull(),
  createdAt: integer("CREATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("UPDATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const monBuiTable = sqliteTable("MONBUIS", {
  id: integer("ID", { mode: "number" }).primaryKey({ autoIncrement: true }),
  monsterId: integer("MON_ID", { mode: "number" }).notNull(),
  buiName: text("BUI_NAME").notNull(),
  nikuZan: integer("NIKU_ZAN", { mode: "number" }).default(0),
  nikuDa: integer("NIKU_DA", { mode: "number" }).default(0),
  nikuDan: integer("NIKU_DAN", { mode: "number" }).default(0),
  nikuHi: integer("NIKU_HI", { mode: "number" }).default(0),
  nikuMizu: integer("NIKU_MIZU", { mode: "number" }).default(0),
  nikuRai: integer("NIKU_RAI", { mode: "number" }).default(0),
  nikuKori: integer("NIKU_KORI", { mode: "number" }).default(0),
  nikuRyu: integer("NIKU_RYU", { mode: "number" }).default(0),
  createdAt: integer("CREATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("UPDATED_AT", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});
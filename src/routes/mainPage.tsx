import { Hono } from 'hono'

import { css, cx, keyframes, Style } from 'hono/css'

import { drizzle } from 'drizzle-orm/d1'
import { sql } from "drizzle-orm"
import { monstersTable } from '../../schema'
import { monBuiTable } from '../../schema'
import { weaponsTable } from '../../schema'
import { motionsTable } from '../../schema'

import GraphView from './Graph'

type Bindings = {
  DB: D1Database;
};

const mainPageRouter = new Hono<{ Bindings: Bindings }>();

//モンスター種別のドロップダウンリスト
const monsterTypes = ['全て', '飛竜種', '獣竜種', '牙竜種', '魚竜種', '鳥竜種', '牙獣種', '古龍種']
const monsterTypeList = monsterTypes.map((montype, index) =>
  <option value={montype}>{montype}</option>
)

//属性のドロップダウンリスト
const zokuseis = ['全て', '無', '火', '水', '雷', '氷', '龍', '毒', '睡眠', '麻痺', '爆破']
const zokuseiList = zokuseis.map((zokus, index) =>
  <option value={zokus}>{zokus}</option>
)

//武器種のドロップダウンリスト
const weaponTypes = ['片手剣', '太刀', '大剣', '双剣', 'ハンマー', '狩猟笛', '操虫棍', 'ランス', 'ガンランス', 'スラッシュアックス', 'チャージアックス', '弓', 'ライトボウガン', 'ヘビーボウガン']
const weaponTypeList = weaponTypes.map((bukits, index) =>
  <option value={bukits}>{bukits}</option>
)


//
// 初期表示
//
mainPageRouter.get('/', async (c) => {

  //データベースから値を取得
  const db = drizzle(c.env.DB);

  //モンスターのドロップダウンリスト
  const dbResultMonsters = await db.select().from(monstersTable).all();
  const monsterList = dbResultMonsters.map((monster) =>
    <option value={monster.id}>{monster.monsterName}</option>
  )

  //モンスター部位のドロップダウンリスト
  const dbResultMonsterBuis = await db.select().from(monBuiTable).where(sql`${monBuiTable.monsterId} = 1`);
  const monsterPartsList = dbResultMonsterBuis.map((monBui) =>
    <option value={monBui.id}>{monBui.buiName}</option>
  )

  //武器のドロップダウンリスト
  const dbResultWeapons = await db.select().from(weaponsTable).all();
  const weaponList = dbResultWeapons.map((weapon) => {
    if (weapon.kaihoFlg === true) {
      return <option value={weapon.id}>{weapon.weaponName} : {weapon.zokuseiType}(解放)</option>
    } else {
      return <option value={weapon.id}>{weapon.weaponName} : {weapon.zokuseiType}</option>
    }
  })

  //モーションのドロップダウンリスト
  const dbResultMotions = await db.select().from(motionsTable).all();
  const motionList = dbResultMotions.map((motion) =>
    <option value={motion.id}>{motion.motionName}</option>
  )

  const bodyStyle = css`
      background-color: #181309;
      color: #DCDCDC;
    `

  return c.html(
    <html lang="ja">
      <head>
        <Style />
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src='https://unpkg.com/htmx.org@1.6.1'/>
        <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css' rel='stylesheet' integrity='sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC' crossorigin='anonymous' />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"/>
        <script>
        </script>

      </head>
      <body class={bodyStyle}>

        <p class="display-3 ">MONSTER HUNTER DAMAGE SIM.</p>

        <hr />

        <div class="container">
          <div class="row">
            <div class="col">
              <form hx-post='/submit' hx-target='#calc'>

                <div class="container">
                  <div class="row">
                    <div class="col">{/* モンスター入力 */}
                      <label class="form-label">種別</label>
                      <select class="form-select" id='monsterType' name='monsterType' hx-get='/mons-type' hx-trigger='change' hx-target='#monster' hx-swap='innerHTML' required>
                        {monsterTypeList}
                      </select>
                      <label class="form-label">モンスター</label>
                      <select class="form-select" id='monster' name='monster' hx-get='/mons-bui' hx-trigger='change' hx-target='#monsterParts' hx-swap='innerHTML' required>
                        {monsterList}
                      </select>
                      <label class="form-label">部位</label>
                      <select class="form-select" id='monsterParts' name='monsterParts' required>
                        {monsterPartsList}
                      </select>
                    </div>{/* モンスター入力 */}
                    <div class="col">{/* 武器入力 */}
                      <label class="form-label">武器種</label>
                      <select class="form-select" id='weaponType' name='weaponType' hx-get='/weapon-type' hx-trigger='change' hx-target='#weapon-motion' hx-swap='innerHTML' required>
                        {weaponTypeList}
                      </select>
                      <label class="form-label">属性</label>
                      <select class="form-select" id='zokuseiType' name='zokuseiType' hx-get='/zokusei' hx-trigger='change' hx-target='#weaponName' hx-swap='innerHTML' hx-include='[name=weaponType]' required>
                        {zokuseiList}
                      </select>
                      <div id="weapon-motion" name="weapon-motion">
                        <label class="form-label">武器名　</label>
                        <input type="checkbox"/><label>最終形態のみ</label>
                        <select class="form-select" id='weaponName' name='weaponName' required>
                          {weaponList}
                        </select>
                        <label class="form-label">モーション</label>
                        <select class="form-select" id='motionName' name='motionName' hx-swap-oob="true" required>
                          {motionList}
                        </select>
                      </div>
                    </div>{/* 武器入力 */}
                  </div>{/*row*/}
                </div>{/*container*/}
                <button class="btn btn-primary" type='submit'>
                  GO
                </button>
              </form>
            </div>


            <div class="col">
              <p id='calc' class='display-6'>
                RANKING<br/>
                BEST WEAPON<br/>
                DETAILS
              </p>
            </div>

          </div>{/*row*/}
        </div>{/*container*/}

        <script src='https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js' integrity='sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM' crossorigin='anonymous'></script>
      </body>
    </html>
  );
});

//
// モンスター種別を変更した時
//
mainPageRouter.get('/mons-type', async (c) => {

  //データベースから値を取得
  const db = drizzle(c.env.DB);
  const selectValue = c.req.query('monsterType');
  let dbResultMonsters = null;
  if (selectValue === "全て") {
    dbResultMonsters = await db.select().from(monstersTable).all();
  } else {
    dbResultMonsters = await db.select().from(monstersTable).where(sql`${monstersTable.monsterType} = ${selectValue}`);
  }

  let options = '';
  const monsterList = dbResultMonsters.map((monster) =>
    options = options + <option value={monster.id}>{monster.monsterName}</option>
  )
  return c.html(
    options
  );
});

//
// モンスターを変更した時
//
mainPageRouter.get('/mons-bui', async (c) => {

  //データベースから値を取得
  const db = drizzle(c.env.DB);
  const selectValue = c.req.query('monster');
  let dbResultMonsterBuis = null;
  if (selectValue === "全て") {
    dbResultMonsterBuis = await db.select().from(monBuiTable).all();
  } else {
    dbResultMonsterBuis = await db.select().from(monBuiTable).where(sql`${monBuiTable.monsterId} = ${selectValue}`);
  }

  let options = '';
  const monsterBuiList = dbResultMonsterBuis.map((monsterBui) =>
    options = options + <option value={monsterBui.id}>{monsterBui.buiName}</option>
  )

  return c.html(
    options
  );
});

//
// 武器種を変更した時=>武器名,モーション変更
//
mainPageRouter.get('/weapon-type', async (c) => {

  //データベースから値を取得
  const db = drizzle(c.env.DB);
  const selectValue = c.req.query('weaponType');
  let dbResultWeapons = null;
  let dbResultMotions = null;
  dbResultWeapons = await db.select().from(weaponsTable).where(sql`${weaponsTable.weaponType} = ${selectValue}`);
  dbResultMotions = await db.select().from(motionsTable).where(sql`${motionsTable.weaponType} = ${selectValue}`);

  let options1 = "<label class='form-label'>武器名</label><select class='form-select' id='weaponName' name='weaponName' required>";
  const weaponList = dbResultWeapons.map((weapon) =>
    options1 = options1 + <option value={weapon.id}>{weapon.weaponName} : {weapon.zokuseiType}</option>
  )
  options1 += '</select>'

  let options2 = "<label class='form-label'>モーション</label><select class='form-select' id='motionName' name='motionName' required>";
  const motionList = dbResultMotions.map((motion) =>
    options2 = options2 + <option value={motion.id}>{motion.motionName}</option>
  )
  options2 += '</select>'

  return c.html(
    options1 + options2
  );
});

//
// 属性を変更した時
//
mainPageRouter.get('/zokusei', async (c) => {

  //データベースから値を取得
  const db = drizzle(c.env.DB);
  const selectWeaponType = c.req.query('weaponType');
  const selectZokusei = c.req.query('zokuseiType');

  let dbResultWeapons = null;

  if (selectZokusei === "全て") {
    dbResultWeapons = await db.select().from(weaponsTable).all();
  } else {
    dbResultWeapons = await db.select().from(weaponsTable).where(sql`${weaponsTable.weaponType} = ${selectWeaponType} AND ${weaponsTable.zokuseiType} = ${selectZokusei}`);
  }


  let options1 = "";
  const weaponList = dbResultWeapons.map((weapon) => {
    if (weapon.kaihoFlg === true) {
      options1 += <option value={weapon.id}>{weapon.weaponName} : {weapon.zokuseiType}(解放)</option>
    } else {
      options1 += <option value={weapon.id}>{weapon.weaponName} : {weapon.zokuseiType}</option>
    }
  })

  return c.html(
    options1
  );
});

//
// 計算ボタン
//
mainPageRouter.post('/submit', async (c) => {

  console.log("計算処理");

  const font_colorStyle = css`
      color: #DCDCDC;
    `

  // 画面からの入力
  const formData = await c.req.parseBody();

  // DB検索
  const db = drizzle(c.env.DB);

  //モンスターテーブル取得
  let dbMonsters = null;
  dbMonsters = await db.select().from(monstersTable).where(sql`${monstersTable.id} = ${formData.monster}`)
  //武器テーブル取得
  let dbWeapons = null;
  if(formData.weaponName === "1") {
    console.log("kotti?");
    dbWeapons = await db.select().from(weaponsTable).all();
  } else {
    dbWeapons = await db.select().from(weaponsTable).where(sql`${weaponsTable.weaponType} = ${formData.weaponName}`);
  }
  //モーションテーブル取得
  let dbMotions = null;
  dbMotions = await db.select().from(motionsTable).where(sql`${motionsTable.weaponType} = ${formData.weaponType}`);
  let motionValue = (dbMotions[0].motionValue === null) ? 0 : dbMotions[0].motionValue;

  const weaponList = dbWeapons.map((weapon) => {
    if(weapon.weaponName !== "全て") {

      let bukiBairitu = (weapon.kougekiRyoku === null) ? 0 : weapon.kougekiRyoku;
      let kireaji = (weapon.kireajiHosei === null) ? 0 : weapon.kireajiHosei;

      //物理ダメージ ＝ 武器倍率 × モーション値 × 斬れ味補正 × 会心補正 × 武器補正 × 物理肉質
      let damage = bukiBairitu * motionValue * 1;

      return (<tr class={font_colorStyle}>
        <td>{weapon.weaponName}</td>
        <td>{weapon.zokuseiType}</td>
        <td>{damage}</td>
      </tr>)
    }
  })


  return c.html(
    <div class="bd-example" >

      <table class="table table-hover">
        <thead>
          <tr class={font_colorStyle}>
            <th scope="col">武器名</th>
            <th scope="col">属性</th>
            <th scope="col">ダメージ</th>
          </tr>
        </thead>
        <tbody>
          {weaponList}
        </tbody>
      </table>

      <GraphView />

    </div>
  );
});

export default mainPageRouter;

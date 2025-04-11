import { Hono } from 'hono'

import { css, cx, keyframes, Style } from 'hono/css'
import { html } from 'hono/html'

import { drizzle } from 'drizzle-orm/d1'
import { sql } from "drizzle-orm"

import { monstersTable } from '../../../schema'
import { monBuiTable } from '../../../schema'
import { weaponsTable } from '../../../schema'
import { motionsTable } from '../../../schema'

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

// サンプルデータエンドポイント
mainPageRouter.get('/data', (c) => {
  const suggestions = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape'];
  return c.json(suggestions); // JSON形式でデータを返す
})

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
  const suggestCss = css`
    /* スタイルの例 */
    #suggestion-list {
      list-style-type: none;
      padding: 0;
    }
    #suggestion-list li {
      padding: 5px;
      cursor: pointer;
    }
    #suggestion-list li:hover {
      background-color: #ddd;
    }
  `

  return c.html(
    <html lang="ja">
      <head>
        <Style/>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src='https://unpkg.com/htmx.org@1.6.1'/>
        <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css' rel='stylesheet' integrity='sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC' crossorigin='anonymous' />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"/>

        {/* オートコンプリート */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@10.2.3/dist/css/autoComplete.min.css"/>

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
                      <input id="autoComplete" type="text" placeholder="Type something..." />
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

                  <br></br>

                  {/* スキルアコーディオン */}
                  <div class="bd-example m-0 border-0">
                    <div class="accordion" id="accordionExample">
                      <div class="accordion-item">
                        <h4 class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="false" aria-controls="collapseOne">
                            装備スキル【武器】
                          </button> 
                        </h4>
                        <div id="collapse1" class="accordion-collapse collapse" data-bs-pareant="#accordionExample">
                          <div class="accordion-body">
                            <select class="form-select is-invalid" type="checkbox" value="" id="">
                              <option class="form-select disabled value">攻撃力UP</option>
                              <option class="form-select disabled value">Lv1：攻撃+3</option>
                              <option class="form-select disabled value">Lv2：攻撃+5</option>
                              <option class="form-select disabled value">Lv3：攻撃+7</option>
                              <option class="form-select disabled value">Lv4：攻撃 X 1.02 + 8</option>
                              <option class="form-select disabled value">Lv5：攻撃 X 1.04 + 9</option>
                            </select>
                            <select class="form-select is-invalid" type="checkbox" value="" id="">
                              <option class="form-select disabled value">フルチャージ</option>
                              <option class="form-select disabled value">Lv1：攻撃+3</option>
                              <option class="form-select disabled value">Lv2：攻撃+6</option>
                              <option class="form-select disabled value">Lv3：攻撃+10</option>
                              <option class="form-select disabled value">Lv4：攻撃+15</option>
                              <option class="form-select disabled value">Lv5：攻撃+20</option>
                            </select>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">双剣の鬼人身躱し状態</label>
                            <label>　</label>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">狩猟笛の旋律</label>
                            <br></br>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">狩猟笛の自分強化</label>
                            <label>　</label>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">スラッシュアックスの斧強化_強撃ビン</label>
                          </div>{/*accordion-body*/}
                        </div>
                      </div>{/*accordion-item*/}

                      <div class="accordion-item">
                        <h4 class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapseOne">
                            装備スキル【防具】
                          </button> 
                        </h4>
                        <div id="collapse2" class="accordion-collapse collapse" data-bs-pareant="#accordionExample">
                          <div class="accordion-body">
                            <select class="form-select is-invalid" type="checkbox" value="" id="">
                              <option class="form-select disabled value">太刀の練気補正</option>
                              <option class="form-select disabled value">赤色：1.1倍</option>
                              <option class="form-select disabled value">黄色：1.05倍</option>
                              <option class="form-select disabled value">白色：1.025倍</option>
                            </select>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">双剣の鬼人身躱し状態</label>
                            <label>　</label>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">狩猟笛の旋律</label>
                            <br></br>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">狩猟笛の自分強化</label>
                            <label>　</label>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">スラッシュアックスの斧強化_強撃ビン</label>
                          </div>{/*accordion-body*/}
                        </div>
                      </div>{/*accordion-item*/}
                      
                      <div class="accordion-item">
                        <h4 class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapseOne">
                            武器固有の特性
                          </button> 
                        </h4>
                        <div id="collapse3" class="accordion-collapse collapse" data-bs-pareant="#accordionExample">
                          <div class="accordion-body">
                            <select class="form-select is-invalid" type="checkbox" value="" id="">
                              <option class="form-select disabled value">太刀の練気補正</option>
                              <option class="form-select disabled value">赤色：1.1倍</option>
                              <option class="form-select disabled value">黄色：1.05倍</option>
                              <option class="form-select disabled value">白色：1.025倍</option>
                            </select>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">双剣の鬼人身躱し状態</label>
                            <label>　</label>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">狩猟笛の旋律</label>
                            <br></br>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">狩猟笛の自分強化</label>
                            <label>　</label>
                            <input class="form-check-input is-invalid" type="checkbox" value="" id=""/>
                            <label class="form-check-label" for="invalidCheck3">スラッシュアックスの斧強化_強撃ビン</label>
                          </div>{/*accordion-body*/}
                        </div>
                      </div>{/*accordion-item*/}                      
                    </div>
                  </div>{/* アコーディオン */}

                </div>{/*container*/}

                <br></br>

                <button class="btn btn-primary" type='submit'>
                  GO
                </button>
              </form>
            </div>


            <div class="col">
              <p id='calc' class='display-6'>
                RANKING<br/>
                BEST of WEAPONS<br/>
                DETAILS
              </p>
            </div>

          </div>{/*row*/}
        </div>{/*container*/}

        <script src="https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@10.2.7/dist/autoComplete.min.js"/>

        {html`
          <script>

            const autoCompleteJS = new autoComplete({
              name: "autoComplete",
              selector: "#autoComplete",
              wrapper: true,
              data: {
                src: [
                  "豚骨ラーメン",
                  "醤油ラーメン",
                  "味噌ラーメン",
                  "塩ラーメン",
                  "つけ麺",
                  "博多ラーメン",
                  "札幌ラーメン",
                  "東京ラーメン",
                  "熊本ラーメン",
                  "鹿児島ラーメン",
                  "担々麺",
                  "冷やし中華",
                  "Tonkotsu Ramen",
                  "Shoyu Ramen",
                  "Miso Ramen",
                  "Shio Ramen",
                  "Tsukemen",
                  "Hakata Ramen",
                  "Sapporo Ramen",
                  "Tokyo Ramen",
                  "Kumamoto Ramen",
                  "Kagoshima Ramen",
                  "Tantanmen",
                  "Hiyashi Chuka"
                ],
                cache: true,
              },
              trigger: (query) => {
                return query.replace(/ /g, "").length > 0; // Returns "Boolean"
              },
              query: (input) => {
                return input.replace("lamen", "ラーメン");
              },
              placeHolder: "モンスターを選んでください...",
              threshold: 2,
              debounce: 300, // Milliseconds value
              searchEngine: "loose",
              diacritics: true,
              resultItem: {
                highlight: true
              },
              submit: true,
              events: {
                input: {
                  selection: (event) => {
                    const selection = event.detail.selection.value;
                    autoCompleteJS.input.value = selection;
                  }
                }
              }
            });

          </script>        
        `}

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
    dbWeapons = await db.select().from(weaponsTable).all();
  } else {
    dbWeapons = await db.select().from(weaponsTable).where(sql`${weaponsTable.weaponType} = ${formData.weaponName}`);
  }
  //モーションテーブル取得
  let dbMotions = null;
  dbMotions = await db.select().from(motionsTable).where(sql`${motionsTable.weaponType} = ${formData.weaponType}`);
  //部位テーブル取得
  let dbBui = null;
  dbBui = await db.select().from(monBuiTable).where(sql`${monBuiTable.id} = ${formData.monsterParts}`);
  const weaponList = dbWeapons.map((weapon) => {
    if(weapon.weaponName !== "全て") {

      let 本来の攻撃力 = (weapon.kougekiRyoku === null) ? 0 : weapon.kougekiRyoku;//武器テーブル
      let 太刀の練気補正 = 1.1; //画面入力　赤 = 1.1, 黄色 = 1.05, 白 = 1.025
      let 双剣の鬼人身躱し状態 = 1;//画面入力
      let 狩猟笛の旋律 = 1;//画面入力
      let 狩猟笛の自分強化 = 1;//画面入力
      let スラッシュアックスの斧強化_強撃ビン = 1;//画面入力
      let 操虫棍のエキス = 1;//画面入力
      let オトモの鬼人笛 = 1;//画面入力
      let 加算補正 = 1;//??

      //-------武器倍率計算式-------

      //（本来の攻撃力ｘ太刀の練気補正ｘ双剣の鬼人身躱し状態ｘ狩猟笛の旋律ｘ狩猟笛の自分強化ｘスラッシュアックスの斧強化、強撃ビンｘ操虫棍のエキスｘオトモの鬼人笛）+ 加算補正
      //小数点はそのまま使われます
      let 武器倍率 = (本来の攻撃力 * 太刀の練気補正 * 双剣の鬼人身躱し状態 * 狩猟笛の旋律 * 狩猟笛の自分強化 * スラッシュアックスの斧強化_強撃ビン * 操虫棍のエキス * オトモの鬼人笛) + 加算補正;
      
      //-------ダメージ計算式-------
      let モーション値 = (dbMotions[0].motionValue === null) ? 0 : dbMotions[0].motionValue;//モーションテーブル
      let モーションタイプ = (dbMotions[0].zanDaDan === null) ? 0 : dbMotions[0].zanDaDan;//モーションテーブル
      let 斬れ味補正 = (weapon.kireajiHosei === null) ? 0 : weapon.kireajiHosei;//武器テーブル
      let 肉質 = 1;//部位テーブル
      if(モーションタイプ === "斬") {
        肉質 = (dbBui[0].nikuZan === null) ? 0 : dbBui[0].nikuZan;
      } else if(モーションタイプ === "打") {
        肉質 = (dbBui[0].nikuDa === null) ? 0 : dbBui[0].nikuDa;
      } else {
        肉質 = (dbBui[0].nikuDan === null) ? 0 : dbBui[0].nikuDan;
      }
      let チャージアックスの斧強化 = 1;//画面
      let 属性値 = (weapon.zokuseiRyoku === null) ? 0: weapon.zokuseiRyoku;//武器テーブル
      let 属性種別 = (weapon.zokuseiType === null) ? 0 : weapon.zokuseiType;//武器テーブル
      let 属性肉質 = 1;//部位テーブル
      switch(属性種別)
      {
        case "火": 属性肉質 = (dbBui[0].nikuHi === null) ? 0 : dbBui[0].nikuHi; break;
        case "水": 属性肉質 = (dbBui[0].nikuMizu === null) ? 0 : dbBui[0].nikuMizu; break;
        case "雷": 属性肉質 = (dbBui[0].nikuRai === null) ? 0 : dbBui[0].nikuRai; break;
        case "氷": 属性肉質 = (dbBui[0].nikuKori === null) ? 0 : dbBui[0].nikuKori; break;
        case "龍": 属性肉質 = (dbBui[0].nikuRyu === null) ? 0 : dbBui[0].nikuRyu; break;
        case "無": 属性肉質 = 1; break;
      }
      let 属性補正 = (weapon.kireajiHoseiZokusei === null) ? 1 : weapon.kireajiHoseiZokusei;//武器テーブル
      let 属性への乗算補正 = 1;//??
      let 属性値への加算補正 = 1;//?
      let ライトボウガン専用のマイナス・速射・チェイスショットの補正 = 1;//画面
      let 属性ダメージ = 0;

      //・物理ダメージ
      //モーション値ｘ本来の攻撃力÷100ｘ斬れ味補正ｘ肉質ｘチャージアックスの斧強化
      let 物理ダメージ = モーション値 * 本来の攻撃力/100 * 斬れ味補正 * 肉質 * チャージアックスの斧強化;
      
      if(formData.weaponType == "ライトボウガン" || formData.weaponType == "ヘビィボウガン" ) {
        //・属性ダメージ（ボウガン）
        //((属性値÷10ｘ属性への乗算補正×ライトボウガン専用のマイナス・速射・チェイスショットの補正)+属性値への加算補正÷10)ｘ属性肉質÷100
        属性ダメージ = ((属性値/10*属性への乗算補正*ライトボウガン専用のマイナス・速射・チェイスショットの補正) + 属性値への加算補正/10) * 属性肉質/100;

      } else {
        //・属性ダメージ（ボウガン以外）
        //属性値÷100ｘ属性肉質ｘ属性補正
        属性ダメージ = 属性値/100 * 属性肉質 * 属性補正;

      }
      
      //・合計ダメージ
      //()の部分で小数点第二位を四捨五入
      //(物理ダメージ)+(属性ダメージ) 
      物理ダメージ = Math.round(物理ダメージ * 100) / 100;
      属性ダメージ = Math.round(属性ダメージ * 100) / 100;
      console.log("物理:"+ 物理ダメージ);
      console.log("属性:"+ 属性ダメージ);
      let 合計ダメージ = 物理ダメージ + 属性ダメージ;
      let str合計ダメージ = 合計ダメージ.toFixed(2);

      return (<tr class={font_colorStyle}>
        <td>{weapon.weaponName}</td>
        <td>{weapon.zokuseiType}</td>
        <td>{str合計ダメージ}</td>
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

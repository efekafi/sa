
import { Enemy, LocationId, DialogueNode, MapDefinition } from './types';

export const INITIAL_PLAYER_STATS = {
  hp: 20,
  maxHp: 20,
  lv: 1,
  xp: 0,
  items: ["Eski Nokia", "Bayat Simit"],
  gold: 0,
  name: "Ahmet"
};

// --- MAPS ---
// 0: Floor, 1: Wall, 9: Door trigger
const TILE_SIZE = 40;

export const MAPS: Record<LocationId, MapDefinition> = {
  [LocationId.BEDROOM]: {
    id: LocationId.BEDROOM,
    width: 10,
    height: 8,
    tileSize: TILE_SIZE,
    // 10x8 Room
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1], // Bed & Desk area
      [1, 0, 1, 1, 0, 0, 0, 0, 0, 1], // Bed area
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Open space
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Open space
      [1, 0, 0, 0, 9, 9, 0, 0, 0, 1], // Door at bottom
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    doors: [
      { x: 4, y: 6, target: LocationId.DOLANDIRICILAR_SOKAGI, targetX: 2, targetY: 2 },
      { x: 5, y: 6, target: LocationId.DOLANDIRICILAR_SOKAGI, targetX: 2, targetY: 2 }
    ],
    npcs: [
        { id: 'WALTEY_INTRO', x: 5, y: 2, sprite: '🤕' }
    ],
    playerStart: { x: 5, y: 4 } // Düzeltildi: Artık boş alanda doğuyor
  },
  [LocationId.DOLANDIRICILAR_SOKAGI]: {
    id: LocationId.DOLANDIRICILAR_SOKAGI,
    width: 12,
    height: 12,
    tileSize: TILE_SIZE,
    layout: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1], // Buildings
        [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Street
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 9, 9, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    doors: [
        { x: 5, y: 10, target: LocationId.KARANLIK_ARACI_PAZARI, targetX: 1, targetY: 5 },
        { x: 6, y: 10, target: LocationId.KARANLIK_ARACI_PAZARI, targetX: 1, targetY: 5 }
    ],
    npcs: [
        { id: 'YUSUF', x: 8, y: 7, sprite: '🤢' }
    ],
    playerStart: { x: 2, y: 2 }
  },
  [LocationId.KARANLIK_ARACI_PAZARI]: {
    id: LocationId.KARANLIK_ARACI_PAZARI,
    width: 10,
    height: 10,
    tileSize: TILE_SIZE,
    layout: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1], // Stalls
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Wide area
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 9, 9, 0, 0, 0, 0, 9, 9, 1], // Exits (Left back, Right fwd)
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    doors: [
        { x: 1, y: 8, target: LocationId.DOLANDIRICILAR_SOKAGI, targetX: 5, targetY: 9 },
        { x: 2, y: 8, target: LocationId.DOLANDIRICILAR_SOKAGI, targetX: 5, targetY: 9 },
        { x: 7, y: 8, target: LocationId.SMS_MAGARASI, targetX: 2, targetY: 2 },
        { x: 8, y: 8, target: LocationId.SMS_MAGARASI, targetX: 2, targetY: 2 }
    ],
    npcs: [
        { id: 'WATE', x: 5, y: 5, sprite: '😎' }
    ],
    playerStart: { x: 1, y: 1 }
  },
  [LocationId.SMS_MAGARASI]: {
    id: LocationId.SMS_MAGARASI,
    width: 8,
    height: 15, // Long corridor
    tileSize: TILE_SIZE,
    layout: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 0, 1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 9, 9, 9, 9, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    doors: [
        { x: 2, y: 13, target: LocationId.WEXA_OFIS, targetX: 5, targetY: 8 },
        { x: 3, y: 13, target: LocationId.WEXA_OFIS, targetX: 5, targetY: 8 },
        { x: 4, y: 13, target: LocationId.WEXA_OFIS, targetX: 5, targetY: 8 },
        { x: 5, y: 13, target: LocationId.WEXA_OFIS, targetX: 5, targetY: 8 }
    ],
    npcs: [
        { id: 'TELEGRAM_TEYZE', x: 3, y: 7, sprite: '👵' }
    ],
    playerStart: { x: 3, y: 2 }
  },
  [LocationId.WEXA_OFIS]: {
    id: LocationId.WEXA_OFIS,
    width: 11,
    height: 11,
    tileSize: TILE_SIZE,
    layout: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1], // Throne area
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // Pillars
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 9, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    doors: [
        { x: 5, y: 9, target: LocationId.SMS_MAGARASI, targetX: 3, targetY: 12 }
    ],
    npcs: [
        { id: 'WEXA', x: 5, y: 2, sprite: '👹' }
    ],
    playerStart: { x: 5, y: 8 }
  }
};

// --- DIALOGUES ---

export const DIALOGUES: Record<string, DialogueNode[]> = {
  'INTRO': [
    { id: '1', speaker: 'Ahmet', text: 'LLa nerdeyim ben amına koyim?', face: '😨', next: '2' },
    { id: '2', speaker: 'Ahmet', text: 'EEn son tabağa doğru 31 çekiyodum niiş la', face: '🤔', next: '3' },
    { id: '3', speaker: 'Ahmet', text: 'BBabam görüp beni öldürdü mü yoksa', face: '😨', next: '4' },
    { id: '4', speaker: '???', text: 'LLan hoop bana bak hele', face: '🤕', next: '5' },
    { id: '5', speaker: 'Ahmet', text: 'SSen kimsin orospu çocuğu?', face: '😡', next: '6' },
    { id: '6', speaker: '???', text: 'NNe sövüyon yarram geldiğimde burdaydın.', face: '🤕', next: '7' },
    { id: '7', speaker: 'Ahmet', text: 'SSen kimsin amına koyım odamda ne işin var', face: '🤨', next: '8' },
    { id: '8', speaker: 'Waltey', text: 'WWaltey knk ben hatırlamadın mı?', face: '🤕', next: '9' },
    { id: '9', speaker: 'Waltey', text: 'BBurasi bizim dünya değil. Orospu çocuğu dolandırıcı evreni".', face: '🤕', next: '10' },
    { id: '10', speaker: 'Ahmet', text: 'DDolandırıcı mı? Ne diyon amına koyim ya', face: '😵', next: '11' },
    { id: '11', speaker: 'Waltey', text: 'NNe bilim knk burayı WEXA yaratmış bizi de buraya tıkmış', face: '🤕', next: '12' },
    { id: '12', speaker: 'Waltey', text: 'BBurdan çıkmak için WEXAyı bulman lazım', face: '🤕', next: '13' },
    { id: '13', speaker: 'Waltey', text: 'DDışarıda herkes birbirini tokatlayıp sikme derdinde kimseye güvenme', face: '🤕', next: '14' },
    { id: '14', speaker: 'Ahmet', text: 'SSana bile mi?', face: '🤔', next: '15' },
    { id: '15', speaker: 'Waltey', text: 'GGüzel soru. Seni sikip sikmeyeceğim belli olmaz. Sen her şeye karşı dikkatli ol. ', face: '🤕', next: 'end' }
  ],
  'WALTEY_INTRO': [
    { id: 'w1', speaker: 'Waltey', text: 'LLa oğlum siktir git şurdan allahını sikerim ha', face: '🤕', next: 'w2' },
    { id: 'w2', speaker: 'Ahmet', text: 'KKanka kapıyı bulamadım aptal fare olduğum için mb', face: '🥺', next: 'w3' },
    { id: 'w3', speaker: 'Waltey', text: 'SSeninle gelmek isterdim ama WEXA hwid ban atmış çıkamıyom burdan 4 ay sonra artık.', face: '🤕', next: 'w4' },
    { id: 'w4', speaker: 'Waltey', text: 'BBi de yusuf sana knk log açmış WEXA falan derse ciddiye alma', face: '🤕', next: 'end' }
  ],
  'YUSUF': [
    { id: 'y1', speaker: 'Yusuf', text: 'OOoo ahmet naber kanka çar vuruyoz mu bugün', face: '🤢', next: 'y2' },
    { id: 'y2', speaker: 'Ahmet', text: 'NNaber la ezik türeme oç', face: '😐', next: 'y3' },
    { id: 'y3', speaker: 'Yusuf', text: 'İİyi knk nolsun', face: '🤢', next: 'y4' },
    { id: 'y4', speaker: 'Yusuf', text: 'KKnk geçen WEXA geldi log açtım ahmeti bırak gel benim loga vur dedi haberin olsun', face: '🤢', next: 'y5' },
    { id: 'y5', speaker: 'Ahmet', text: 'SSiktir la kolpacı allahını sikerim kaybol', face: '🤨', next: 'y6' },
    { id: 'y6', speaker: 'Yusuf', text: 'KKnk ne sövüyon ya hep manitam yüzünden oluyo kusura bakma orospu cocugu dog köpeğin tekiyim biliyon', face: '🤢', next: 'y7' },
    { id: 'y7', speaker: 'Ahmet', text: 'BBiliyom knk allah kurtarsın', face: '😒', next: 'y8' },
    { id: 'y8', speaker: 'Yusuf', text: 'NNe demek biliyom lan şişko piç', face: '😡', next: 'y9' },
    { id: 'y9', speaker: 'Yusuf', text: 'MManitam hakkında sadece ben konuşabilirim gel buraya seni bi boyun kilidine alayım', face: '😡', triggerBattle: 'YUSUF' }
  ],
  'WATE': [
    { id: 'wa1', speaker: 'Wate', text: 'KKnk wexa ortaokulda hiç kavga etmedi haberin olsun', face: '😎', next: 'wa2' },
    { id: 'wa2', speaker: 'Ahmet', text: 'NNe alaka amına koyım şimdi', face: '🙄', next: 'wa3' },
    { id: 'wa3', speaker: 'Wate', text: 'SSöylüyom sadece knk bi kere ittim yere tostu yere düştü amk', face: '😎', next: 'wa4' },
    { id: 'wa4', speaker: 'Wate', text: 'TTam mal amına koyım ya salak salak şakalar yapıyodu', face: '😎', next: 'wa5' },
    { id: 'wa5', speaker: 'Ahmet', text: 'OOlm sus bak bedirhanı çağırtma bana', face: '😐', next: 'wa6' },
    { id: 'wa6', speaker: 'Wate', text: 'BBedirhan kim amına koyim tek tokatta bayıltırım onu valla', face: '😎', next: 'wa7' },
    { id: 'wa7', speaker: 'Wate', text: '(ppanik içinde) Neyse sen onu çağıramadan ben seni döveyim en iyisi', face: '😎', triggerBattle: 'WATE' }
  ],
  'TELEGRAM_TEYZE': [
    { id: 't1', speaker: 'Tabak', text: 'NNeden yaptın', face: '🍽️', next: 't2' },
    { id: 't2', speaker: 'Ahmet', text: 'NNeyi neden yaptım', face: '🤔', next: 't3' },
    { id: 't3', speaker: 'Tabak', text: 'NNe yaptığını biliyosun tacizci oç', face: '🍽️', next: 't4' },
    { id: 't4', speaker: 'Ahmet', text: 'SSen nasıl konuşuyon amk tabağı', face: '🤔', next: 't5' },
    { id: 't5', speaker: 'Tabak', text: 'AAllahını sikeyim o günler aklımdan çıkmıyor çocukluğumu mahvettin', face: '🍽️', next: 't6' },
    { id: 't6', speaker: 'Ahmet', text: 'KKnk çok özür dilerim', face: '😟', next: 't7' },
    { id: 't7', speaker: 'Tabak', text: 'LLan sus şehitlerini tepelerim amına kodumun cocu', face: '🍽️', next: 't8' },
    { id: 't8', speaker: 'Tabak', text: 'ÜÜstüne attırma sırası bende amına kodumunun oğlu', face: '🍽️', triggerBattle: 'TELEGRAM_TEYZE' }
  ],
  'WEXA': [
    { id: 'wx1', speaker: 'Wexa', text: 'HHoş geldin knk', face: '👹', next: 'wx2' },
    { id: 'wx2', speaker: 'Ahmet', text: 'OOrospu cocu beni niye çektin buraya bızır buzur 31 çekiyodum', face: '😡', next: 'wx3' },
    { id: 'wx3', speaker: 'Wexa', text: 'PPardon knk tahmin edemedim', face: '😈', next: 'wx4' },
    { id: 'wx4', speaker: 'Wexa', text: 'GGruptan robuxu habersiz çekince dellendim napayım', face: '👹', next: 'wx5' },
    { id: 'wx5', speaker: 'Wexa', text: 'AArtık yapcak bi şey yok o robuxun hesabını verecen kardeş', face: '😈', next: 'wx6' },
    { id: 'wx6', speaker: 'Ahmet', text: 'OO robuxu sana verirsem anamı siksinler iyi ki tokatlamışım seni aptal oç', face: '😡', next: 'wx7' },
    { id: 'wx7', speaker: 'Wexa', text: 'KKalbimi kırıyosun knk ben naptım sana', face: '👹', next: 'wx8' },
    { id: 'wx8', speaker: 'Wexa', text: 'İİyi ki kendi logumu açmışım zamanında bencil oç gel hel eline verim', face: '😈', triggerBattle: 'WEXA' }
  ]
};


export const ENEMIES: Record<string, Enemy> = {
  'YUSUF': {
    id: 'YUSUF',
    name: 'Türeme OÇ',
    hp: 40,
    maxHp: 40,
    atk: 2,
    def: 0,
    description: "MMotorla kaza yapmış, kaburgaları ve yarrak iliği hasarlı.",
    spriteColor: 'bg-green-500',
    bulletPattern: 'SIMPLE',
    spared: false,
    dialogues: ["BBilmiyom knk ", "YYarranı yalarım ", "AAnnemin sütyeni giydim bugün", "SSik büyütücü krem biliyon mu knk"],
    acts: [
      { name: 'Sorgula (enson tıkla)', description: 'Wexayı neden sevmediğini sor', response: 'KKnk valla manitam kızıyo yemin ederim, yarranı yalarım nolur savaşmayalım.', effect: 'SPARE_READY' },
      { name: 'Gül', description: 'Tipine gül.', response: 'NNe gülüyon allahını sikerim valla', effect: 'ANNOY' },
      { name: 'Fiyat Sor', description: 'Logu kaça açtın diye sor', response: 'YYusuf hesap yaparken kafası karıştı.', effect: 'NOTHING' }
    ]
  },
  'WATE': {
    id: 'WATE',
    name: 'FLEX MASTER',
    hp: 100,
    maxHp: 100,
    atk: 5,
    def: 5,
    description: "5500 Dolar tokatlandığından haberi yok gibi gözüküyor.",
    spriteColor: 'bg-purple-600',
    bulletPattern: 'WAVE',
    spared: false,
    dialogues: ["KKnk o adamı nasıl kaçırdın ya 500 dolar çöp oldu.", "AAldığın saat iyiymiş knk kaça aldın", "OOf çok yakışıklıyım.", "KKeşke bedirhana sataşmasaydım..."],
    acts: [
      { name: 'Tehdit et (en son tıkla)', description: 'Bedirhanı çağır', response: 'Wate: "KKnk tamam yapma pes ediyorum affet."', effect: 'SPARE_READY' },
      { name: 'Tokatla', description: 'Bir 500 dolar daha tokat at', response: 'Wate: "OOrospu cocuğuuuu çaldığını biliyodum ananı sikim', effect: 'ANNOY' },
      { name: 'Soru Sor', description: 'Yusufun manitayi niye çaldığını sorgula', response: 'KKnk 2 tane babam var biliyo musun', effect: 'NOTHING' }
    ]
  },
  'TELEGRAM_TEYZE': {
    id: 'TELEGRAM_TEYZE',
    name: 'DÖLLÜ TABAK',
    hp: 60,
    maxHp: 60,
    atk: 4,
    def: 2,
    description: "SSiki dimdik ve attırmaya hazır",
    spriteColor: 'bg-yellow-500',
    bulletPattern: 'CHASING',
    spared: false,
    dialogues: ["Üstüm başım döl oldu", "AAnnenin her şeyden haberi var", "KKeşke tabak yerine allah olsaydım", "Kazanmak ister misin?"],
    acts: [
      { name: 'Temizle', description: 'Döllü tabağı suya tut', response: 'Tabak: "KKeşke bunu en başında yapsaydın. Artık savaşmamıza gerek yok.', effect: 'SPARE_READY' },
      { name: 'Attır', description: 'Üstüne daha fazla attır', response: 'TABAK ÇILGINA DÖNDÜ SİKİ BIZIR BIZIR TİTRİYOR : ULAN OROSPU COCUGU SENIN ANANI SIKECEGIM GORECEKSIN', effect: 'ANNOY' }
    ]
  },
  'WEXA': {
    id: 'WEXA',
    name: 'Wexallah',
    hp: 300,
    maxHp: 300,
    atk: 8,
    def: 10,
    description: "Dövüşmek istemiyor ama robuxunu geri istiyor",
    spriteColor: 'bg-red-700',
    bulletPattern: 'RANDOM_BOX',
    spared: false,
    dialogues: ["hher şeyin bir bedeli var.", "kknk robuxumu geri versene", "wwalla wateye her şeyi söylerim", "ggel knk watenin arkasından konuşak"],
    acts: [
      { name: 'Teklif', description: 'Robuxu geri vermeyi teklif et', response: 'WWexa masaya vurdu dellendi fıttırdı: "DDalga mı geçiyon kurnaz oç allahını tırla ezerim', effect: 'ANNOY' },
      { name: 'Af dile', description: 'Logu üstüne yapmayı teklif et', response: 'Wexa: "YYaw şunu baştan desene kardeşim benim ya"', effect: 'SPARE_READY' },
      { name: 'Otur', description: 'Wexanın üstüne oturup yumruklamaya başla', response: 'WWexa allahını kaybetti ama hala ayakta. Yalnızca bir süre allahını araması gerekiyor. (umarım bulur)', effect: 'NOTHING' }
    ]
  }
};
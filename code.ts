// Easy Tag — auto-generates searchable description tags for icon components.
// Select icon master components (or frames containing them), click "Generate",
// and each component gets up to MAX_TAGS synonym tags in its description so
// designers can find icons by related keywords in the asset panel.

const MAX_TAGS = 5;
const VI_MAX_TAGS = 5;
const TAG_SEPARATOR = ', ';

// Words stripped from icon names before tag generation (prefixes, sizes, styles).
const STOP_WORDS = new Set([
  'icon', 'icons', 'ic', 'icn', 'glyph', 'px', 'dp', 'size', 'style', 'type',
  'filled', 'fill', 'outline', 'outlined', 'stroke', 'solid', 'linear', 'line',
  'bold', 'regular', 'thin', 'light', 'duotone', 'twotone', 'sharp', 'rounded',
  'mini', 'micro', 'small', 'medium', 'large', 'default', 'variant', 'alt',
]);

// Synonyms for common icon vocabulary. Key: single lowercase word from the
// icon name. Values: related search terms (never include the key itself).
const SYNONYMS: Record<string, string[]> = {
  home: ['house', 'main', 'start', 'dashboard', 'homepage'],
  search: ['find', 'magnifier', 'magnifying glass', 'lookup', 'explore'],
  arrow: ['direction', 'pointer', 'navigate', 'move'],
  chevron: ['arrow', 'caret', 'expand', 'direction'],
  caret: ['arrow', 'chevron', 'dropdown', 'triangle'],
  left: ['back', 'previous', 'west', 'before'],
  right: ['forward', 'next', 'east', 'after'],
  up: ['top', 'above', 'north', 'ascend'],
  down: ['bottom', 'below', 'south', 'descend'],
  back: ['return', 'previous', 'arrow left', 'undo'],
  forward: ['next', 'arrow right', 'advance', 'redo'],
  user: ['person', 'profile', 'account', 'avatar', 'member'],
  users: ['people', 'group', 'team', 'community', 'members'],
  person: ['user', 'profile', 'account', 'human', 'avatar'],
  people: ['users', 'group', 'team', 'community', 'crowd'],
  profile: ['user', 'account', 'person', 'avatar', 'identity'],
  account: ['user', 'profile', 'person', 'member'],
  settings: ['gear', 'preferences', 'configuration', 'options', 'cog'],
  setting: ['gear', 'preferences', 'configuration', 'options', 'cog'],
  gear: ['settings', 'cog', 'preferences', 'configuration'],
  cog: ['settings', 'gear', 'preferences', 'machine'],
  trash: ['delete', 'bin', 'remove', 'garbage', 'waste'],
  delete: ['trash', 'remove', 'bin', 'erase', 'clear'],
  remove: ['delete', 'trash', 'minus', 'clear'],
  bin: ['trash', 'delete', 'garbage', 'waste'],
  edit: ['pencil', 'write', 'modify', 'compose', 'change'],
  pencil: ['edit', 'write', 'draw', 'compose'],
  pen: ['edit', 'write', 'draw', 'signature'],
  write: ['edit', 'pencil', 'compose', 'note'],
  heart: ['love', 'like', 'favorite', 'wishlist', 'health'],
  like: ['heart', 'favorite', 'thumbs up', 'love'],
  favorite: ['star', 'heart', 'like', 'bookmark', 'saved'],
  star: ['favorite', 'rating', 'bookmark', 'featured', 'rate'],
  bell: ['notification', 'alert', 'alarm', 'reminder', 'ring'],
  notification: ['bell', 'alert', 'reminder', 'badge'],
  alert: ['warning', 'notification', 'caution', 'attention'],
  alarm: ['clock', 'bell', 'reminder', 'timer', 'wake'],
  mail: ['email', 'envelope', 'message', 'inbox', 'letter'],
  email: ['mail', 'envelope', 'message', 'inbox', 'contact'],
  envelope: ['mail', 'email', 'message', 'letter'],
  inbox: ['mail', 'email', 'message', 'tray', 'receive'],
  phone: ['call', 'telephone', 'mobile', 'contact', 'dial'],
  call: ['phone', 'telephone', 'dial', 'contact'],
  mobile: ['phone', 'smartphone', 'device', 'cellphone'],
  camera: ['photo', 'picture', 'capture', 'snapshot', 'photography'],
  photo: ['image', 'picture', 'camera', 'gallery', 'snapshot'],
  image: ['photo', 'picture', 'gallery', 'media', 'graphic'],
  picture: ['image', 'photo', 'gallery', 'media'],
  gallery: ['photos', 'images', 'album', 'collection', 'media'],
  video: ['movie', 'film', 'media', 'play', 'clip'],
  film: ['video', 'movie', 'cinema', 'media'],
  music: ['audio', 'song', 'sound', 'melody', 'note'],
  audio: ['sound', 'music', 'speaker', 'volume'],
  sound: ['audio', 'volume', 'speaker', 'music'],
  volume: ['sound', 'audio', 'speaker', 'loud'],
  speaker: ['volume', 'sound', 'audio', 'loud'],
  mute: ['silent', 'volume off', 'sound off', 'quiet'],
  mic: ['microphone', 'record', 'voice', 'audio', 'speak'],
  microphone: ['mic', 'record', 'voice', 'audio', 'speak'],
  headphones: ['audio', 'music', 'listen', 'headset'],
  play: ['start', 'video', 'media', 'resume', 'triangle'],
  pause: ['stop', 'break', 'hold', 'media', 'wait'],
  stop: ['end', 'halt', 'square', 'media', 'cancel'],
  record: ['capture', 'audio', 'video', 'rec'],
  skip: ['next', 'forward', 'jump', 'media'],
  rewind: ['back', 'previous', 'backward', 'media'],
  lock: ['security', 'password', 'private', 'secure', 'protected'],
  unlock: ['open', 'access', 'security', 'unlocked'],
  key: ['password', 'access', 'security', 'unlock', 'login'],
  shield: ['security', 'protection', 'safety', 'privacy', 'guard'],
  security: ['shield', 'lock', 'protection', 'safety', 'privacy'],
  password: ['lock', 'key', 'security', 'secret', 'credentials'],
  eye: ['view', 'visibility', 'show', 'preview', 'watch'],
  view: ['eye', 'see', 'show', 'preview', 'visibility'],
  hide: ['invisible', 'eye off', 'conceal', 'hidden'],
  show: ['view', 'eye', 'visible', 'display', 'reveal'],
  calendar: ['date', 'schedule', 'event', 'month', 'planner'],
  date: ['calendar', 'schedule', 'day', 'time'],
  schedule: ['calendar', 'time', 'planner', 'agenda', 'event'],
  event: ['calendar', 'date', 'schedule', 'occasion'],
  clock: ['time', 'watch', 'hour', 'schedule', 'timer'],
  time: ['clock', 'watch', 'hour', 'schedule', 'duration'],
  timer: ['stopwatch', 'countdown', 'clock', 'time', 'duration'],
  watch: ['clock', 'time', 'wristwatch', 'wearable'],
  history: ['past', 'recent', 'time', 'clock', 'log'],
  hourglass: ['time', 'waiting', 'loading', 'timer', 'sand'],
  download: ['save', 'import', 'arrow down', 'get', 'receive'],
  upload: ['send', 'export', 'arrow up', 'share', 'submit'],
  import: ['download', 'input', 'load', 'insert'],
  export: ['upload', 'output', 'share', 'send', 'extract'],
  save: ['download', 'disk', 'store', 'keep', 'floppy'],
  share: ['send', 'export', 'social', 'forward', 'distribute'],
  send: ['share', 'submit', 'paper plane', 'deliver', 'message'],
  link: ['url', 'chain', 'hyperlink', 'connect', 'attach'],
  attachment: ['clip', 'paperclip', 'file', 'attach', 'document'],
  clip: ['attachment', 'paperclip', 'attach', 'fasten'],
  paperclip: ['attachment', 'clip', 'attach', 'file'],
  file: ['document', 'paper', 'page', 'attachment', 'data'],
  files: ['documents', 'papers', 'folder', 'data'],
  document: ['file', 'paper', 'page', 'text', 'doc'],
  folder: ['directory', 'file', 'archive', 'organize', 'storage'],
  archive: ['box', 'storage', 'folder', 'backup', 'compress'],
  copy: ['duplicate', 'clone', 'clipboard', 'paste'],
  paste: ['clipboard', 'copy', 'insert', 'apply'],
  clipboard: ['copy', 'paste', 'notes', 'tasks', 'board'],
  duplicate: ['copy', 'clone', 'double', 'repeat'],
  cut: ['scissors', 'trim', 'clip', 'remove'],
  scissors: ['cut', 'trim', 'clip', 'crop'],
  print: ['printer', 'paper', 'document', 'output'],
  printer: ['print', 'paper', 'document', 'device'],
  chat: ['message', 'conversation', 'talk', 'bubble', 'comment'],
  message: ['chat', 'text', 'sms', 'conversation', 'bubble'],
  comment: ['chat', 'message', 'feedback', 'reply', 'bubble'],
  bubble: ['chat', 'message', 'speech', 'talk', 'comment'],
  reply: ['respond', 'answer', 'message', 'arrow', 'back'],
  plus: ['add', 'new', 'create', 'increase', 'more'],
  add: ['plus', 'new', 'create', 'insert', 'increase'],
  minus: ['remove', 'subtract', 'decrease', 'less', 'collapse'],
  close: ['x', 'cancel', 'exit', 'dismiss', 'remove'],
  cancel: ['close', 'x', 'stop', 'dismiss', 'abort'],
  check: ['tick', 'done', 'confirm', 'success', 'complete'],
  checkmark: ['tick', 'done', 'confirm', 'success', 'approve'],
  tick: ['check', 'done', 'confirm', 'success'],
  done: ['check', 'complete', 'finished', 'success', 'tick'],
  info: ['information', 'about', 'help', 'detail', 'tooltip'],
  information: ['info', 'about', 'help', 'detail'],
  warning: ['alert', 'caution', 'danger', 'attention', 'exclamation'],
  error: ['warning', 'alert', 'danger', 'fail', 'problem'],
  danger: ['warning', 'alert', 'caution', 'hazard', 'risk'],
  question: ['help', 'faq', 'support', 'ask', 'unknown'],
  help: ['question', 'support', 'faq', 'assist', 'info'],
  support: ['help', 'assist', 'service', 'customer', 'headset'],
  cart: ['shopping', 'basket', 'buy', 'checkout', 'ecommerce'],
  basket: ['cart', 'shopping', 'buy', 'bag'],
  shopping: ['cart', 'buy', 'store', 'purchase', 'ecommerce'],
  bag: ['shopping', 'purchase', 'handbag', 'buy', 'store'],
  shop: ['store', 'shopping', 'buy', 'market', 'ecommerce'],
  store: ['shop', 'market', 'buy', 'building', 'retail'],
  money: ['cash', 'currency', 'payment', 'dollar', 'finance'],
  dollar: ['money', 'cash', 'currency', 'usd', 'price'],
  coin: ['money', 'cash', 'currency', 'payment', 'crypto'],
  cash: ['money', 'dollar', 'currency', 'payment', 'bill'],
  payment: ['money', 'pay', 'card', 'transaction', 'checkout'],
  card: ['credit', 'payment', 'debit', 'bank', 'wallet'],
  credit: ['card', 'payment', 'bank', 'finance', 'loan'],
  wallet: ['money', 'payment', 'purse', 'cash', 'finance'],
  bank: ['money', 'finance', 'building', 'savings', 'institution'],
  receipt: ['invoice', 'bill', 'payment', 'transaction', 'paper'],
  invoice: ['receipt', 'bill', 'payment', 'document', 'finance'],
  tag: ['label', 'price', 'category', 'badge', 'ticket'],
  ticket: ['coupon', 'voucher', 'pass', 'event', 'admission'],
  discount: ['sale', 'percent', 'offer', 'deal', 'coupon'],
  percent: ['percentage', 'discount', 'sale', 'rate', 'ratio'],
  gift: ['present', 'box', 'reward', 'surprise', 'bonus'],
  location: ['pin', 'map', 'place', 'gps', 'marker'],
  pin: ['location', 'map', 'marker', 'place', 'gps'],
  map: ['location', 'navigation', 'gps', 'directions', 'place'],
  marker: ['pin', 'location', 'map', 'place'],
  gps: ['location', 'navigation', 'map', 'position', 'tracking'],
  navigation: ['compass', 'direction', 'map', 'gps', 'route'],
  compass: ['navigation', 'direction', 'explore', 'discover', 'north'],
  globe: ['world', 'earth', 'international', 'web', 'language'],
  world: ['globe', 'earth', 'global', 'international', 'planet'],
  earth: ['globe', 'world', 'planet', 'global'],
  flag: ['report', 'country', 'mark', 'milestone', 'banner'],
  wifi: ['internet', 'wireless', 'network', 'signal', 'connection'],
  bluetooth: ['wireless', 'connection', 'device', 'pairing'],
  battery: ['power', 'charge', 'energy', 'level'],
  signal: ['network', 'connection', 'wifi', 'strength', 'bars'],
  network: ['internet', 'connection', 'wifi', 'nodes', 'web'],
  internet: ['web', 'network', 'online', 'globe', 'wifi'],
  cloud: ['storage', 'weather', 'sync', 'server', 'online'],
  server: ['database', 'hosting', 'storage', 'cloud', 'data'],
  database: ['storage', 'data', 'server', 'sql', 'records'],
  refresh: ['reload', 'sync', 'update', 'rotate', 'retry'],
  reload: ['refresh', 'sync', 'update', 'retry'],
  sync: ['refresh', 'update', 'synchronize', 'cloud', 'reload'],
  update: ['refresh', 'sync', 'upgrade', 'new version'],
  loading: ['spinner', 'progress', 'wait', 'buffering'],
  filter: ['sort', 'funnel', 'refine', 'search', 'options'],
  sort: ['filter', 'order', 'arrange', 'organize', 'rank'],
  menu: ['hamburger', 'navigation', 'list', 'options', 'sidebar'],
  hamburger: ['menu', 'navigation', 'lines', 'options'],
  more: ['dots', 'options', 'ellipsis', 'extra', 'menu'],
  dots: ['more', 'options', 'ellipsis', 'menu'],
  ellipsis: ['more', 'dots', 'options', 'menu'],
  grid: ['layout', 'gallery', 'tiles', 'apps', 'table'],
  list: ['menu', 'items', 'rows', 'bullet', 'tasks'],
  table: ['grid', 'spreadsheet', 'data', 'rows', 'columns'],
  layout: ['grid', 'template', 'structure', 'design', 'arrange'],
  dashboard: ['home', 'overview', 'analytics', 'panel', 'stats'],
  bookmark: ['save', 'favorite', 'ribbon', 'marker', 'read later'],
  fire: ['flame', 'hot', 'trending', 'burn', 'popular'],
  flame: ['fire', 'hot', 'trending', 'burn'],
  trending: ['popular', 'hot', 'chart', 'growth', 'viral'],
  chart: ['graph', 'analytics', 'statistics', 'data', 'report'],
  graph: ['chart', 'analytics', 'statistics', 'data', 'diagram'],
  analytics: ['chart', 'statistics', 'data', 'insights', 'metrics'],
  statistics: ['chart', 'analytics', 'data', 'stats', 'metrics'],
  report: ['document', 'chart', 'analytics', 'summary', 'file'],
  activity: ['pulse', 'chart', 'health', 'monitor', 'feed'],
  target: ['goal', 'aim', 'bullseye', 'objective', 'focus'],
  award: ['trophy', 'medal', 'achievement', 'prize', 'badge'],
  trophy: ['award', 'winner', 'achievement', 'prize', 'champion'],
  medal: ['award', 'achievement', 'winner', 'badge', 'prize'],
  badge: ['award', 'achievement', 'label', 'verification', 'shield'],
  crown: ['king', 'premium', 'vip', 'royal', 'winner'],
  diamond: ['gem', 'premium', 'jewel', 'luxury', 'valuable'],
  rocket: ['launch', 'startup', 'boost', 'fast', 'space'],
  lightning: ['bolt', 'flash', 'fast', 'power', 'energy'],
  bolt: ['lightning', 'flash', 'fast', 'power', 'energy'],
  flash: ['lightning', 'bolt', 'fast', 'camera', 'quick'],
  zap: ['lightning', 'bolt', 'energy', 'fast', 'power'],
  sun: ['light', 'day', 'brightness', 'weather', 'sunny'],
  moon: ['night', 'dark', 'sleep', 'dark mode', 'lunar'],
  night: ['moon', 'dark', 'sleep', 'evening'],
  weather: ['cloud', 'sun', 'rain', 'forecast', 'climate'],
  rain: ['weather', 'cloud', 'water', 'drop', 'storm'],
  snow: ['weather', 'winter', 'cold', 'snowflake', 'frost'],
  wind: ['weather', 'air', 'breeze', 'storm'],
  drop: ['water', 'liquid', 'rain', 'blood', 'droplet'],
  water: ['drop', 'liquid', 'rain', 'wave', 'hydration'],
  leaf: ['nature', 'eco', 'plant', 'green', 'organic'],
  tree: ['nature', 'plant', 'forest', 'eco', 'green'],
  plant: ['nature', 'leaf', 'growth', 'eco', 'garden'],
  flower: ['plant', 'nature', 'bloom', 'garden', 'floral'],
  bug: ['insect', 'error', 'debug', 'issue', 'problem'],
  paw: ['pet', 'animal', 'dog', 'cat', 'footprint'],
  car: ['vehicle', 'auto', 'transport', 'drive', 'automobile'],
  truck: ['delivery', 'shipping', 'vehicle', 'transport', 'lorry'],
  bus: ['transport', 'vehicle', 'transit', 'travel', 'public'],
  bike: ['bicycle', 'cycling', 'transport', 'ride', 'sport'],
  train: ['transport', 'railway', 'transit', 'travel', 'subway'],
  plane: ['airplane', 'flight', 'travel', 'airport', 'aviation'],
  airplane: ['plane', 'flight', 'travel', 'airport', 'aviation'],
  flight: ['plane', 'airplane', 'travel', 'airport', 'trip'],
  ship: ['boat', 'shipping', 'sea', 'transport', 'cruise'],
  boat: ['ship', 'sea', 'sail', 'transport', 'water'],
  anchor: ['ship', 'boat', 'marine', 'harbor', 'fixed'],
  rocket_launch: ['startup', 'launch', 'boost', 'space'],
  building: ['office', 'company', 'city', 'architecture', 'business'],
  office: ['building', 'work', 'business', 'company', 'workplace'],
  city: ['building', 'urban', 'town', 'skyline', 'metropolis'],
  hospital: ['medical', 'health', 'clinic', 'emergency', 'building'],
  school: ['education', 'learning', 'building', 'student', 'university'],
  book: ['read', 'library', 'education', 'learning', 'literature'],
  library: ['books', 'read', 'education', 'collection', 'archive'],
  education: ['school', 'learning', 'book', 'graduation', 'study'],
  graduation: ['education', 'degree', 'cap', 'school', 'diploma'],
  news: ['newspaper', 'article', 'media', 'press', 'feed'],
  newspaper: ['news', 'article', 'media', 'press', 'read'],
  briefcase: ['work', 'business', 'job', 'office', 'portfolio'],
  work: ['briefcase', 'job', 'business', 'office', 'career'],
  tool: ['wrench', 'settings', 'repair', 'utility', 'fix'],
  tools: ['wrench', 'settings', 'repair', 'utilities', 'fix'],
  wrench: ['tool', 'repair', 'settings', 'fix', 'maintenance'],
  hammer: ['tool', 'build', 'repair', 'construction', 'fix'],
  brush: ['paint', 'design', 'art', 'color', 'style'],
  paint: ['brush', 'color', 'art', 'design', 'palette'],
  palette: ['color', 'paint', 'art', 'design', 'theme'],
  color: ['palette', 'paint', 'theme', 'swatch', 'hue'],
  magic: ['wand', 'sparkle', 'auto', 'ai', 'effect'],
  wand: ['magic', 'sparkle', 'auto', 'effect', 'tool'],
  sparkle: ['magic', 'ai', 'star', 'shine', 'new'],
  sparkles: ['magic', 'ai', 'stars', 'shine', 'new'],
  ai: ['artificial intelligence', 'magic', 'sparkle', 'auto', 'smart'],
  robot: ['ai', 'bot', 'automation', 'machine', 'android'],
  bot: ['robot', 'ai', 'automation', 'chatbot', 'assistant'],
  chip: ['processor', 'cpu', 'hardware', 'technology', 'semiconductor'],
  cpu: ['chip', 'processor', 'hardware', 'computer', 'technology'],
  code: ['programming', 'developer', 'brackets', 'script', 'software'],
  terminal: ['console', 'command', 'code', 'shell', 'cli'],
  bracket: ['code', 'programming', 'developer', 'syntax'],
  git: ['version control', 'branch', 'code', 'repository', 'developer'],
  branch: ['git', 'fork', 'version', 'tree', 'split'],
  bug_report: ['debug', 'issue', 'error', 'problem'],
  computer: ['desktop', 'pc', 'monitor', 'device', 'screen'],
  desktop: ['computer', 'monitor', 'pc', 'screen', 'device'],
  laptop: ['computer', 'notebook', 'device', 'macbook', 'portable'],
  monitor: ['screen', 'display', 'computer', 'desktop', 'tv'],
  screen: ['monitor', 'display', 'device', 'window'],
  tablet: ['ipad', 'device', 'touchscreen', 'mobile'],
  keyboard: ['typing', 'input', 'keys', 'device', 'computer'],
  mouse: ['cursor', 'click', 'pointer', 'input', 'device'],
  cursor: ['pointer', 'mouse', 'click', 'arrow', 'select'],
  tv: ['television', 'screen', 'monitor', 'media', 'display'],
  gamepad: ['game', 'controller', 'gaming', 'play', 'joystick'],
  game: ['gamepad', 'play', 'gaming', 'controller', 'entertainment'],
  dice: ['game', 'random', 'gambling', 'chance', 'play'],
  puzzle: ['game', 'piece', 'plugin', 'extension', 'solve'],
  login: ['sign in', 'enter', 'access', 'authenticate', 'account'],
  logout: ['sign out', 'exit', 'leave', 'quit', 'account'],
  signin: ['login', 'enter', 'access', 'authenticate'],
  signout: ['logout', 'exit', 'leave', 'quit'],
  exit: ['logout', 'close', 'leave', 'quit', 'door'],
  enter: ['login', 'arrow', 'input', 'access', 'return'],
  door: ['exit', 'enter', 'entrance', 'room', 'access'],
  expand: ['fullscreen', 'maximize', 'enlarge', 'grow', 'open'],
  collapse: ['minimize', 'shrink', 'fold', 'close', 'reduce'],
  maximize: ['expand', 'fullscreen', 'enlarge', 'window'],
  minimize: ['collapse', 'shrink', 'reduce', 'window'],
  fullscreen: ['expand', 'maximize', 'enlarge', 'screen'],
  resize: ['scale', 'adjust', 'expand', 'shrink', 'dimension'],
  move: ['drag', 'arrows', 'reposition', 'transfer', 'relocate'],
  drag: ['move', 'reorder', 'handle', 'grab', 'swipe'],
  swap: ['exchange', 'switch', 'trade', 'replace', 'transfer'],
  switch: ['toggle', 'swap', 'change', 'on off', 'exchange'],
  toggle: ['switch', 'on off', 'enable', 'disable', 'control'],
  rotate: ['turn', 'refresh', 'spin', 'orientation', 'flip'],
  flip: ['rotate', 'mirror', 'turn', 'reverse', 'swap'],
  crop: ['trim', 'cut', 'resize', 'edit', 'frame'],
  zoom: ['magnify', 'enlarge', 'scale', 'search', 'focus'],
  undo: ['back', 'revert', 'reverse', 'cancel', 'restore'],
  redo: ['forward', 'repeat', 'restore', 'again'],
  reset: ['restore', 'refresh', 'undo', 'default', 'restart'],
  restore: ['reset', 'undo', 'recover', 'backup', 'revert'],
  external: ['link', 'open', 'new tab', 'outside', 'arrow'],
  open: ['external', 'launch', 'unfold', 'expand', 'access'],
  new: ['plus', 'add', 'create', 'fresh', 'recent'],
  create: ['add', 'plus', 'new', 'make', 'compose'],
  upload_file: ['import', 'attach', 'document', 'send'],
  text: ['font', 'typography', 'type', 'letter', 'write'],
  font: ['text', 'typography', 'typeface', 'letter', 'style'],
  align: ['alignment', 'text', 'layout', 'arrange', 'position'],
  quote: ['quotation', 'citation', 'blockquote', 'testimonial', 'speech'],
  translate: ['language', 'globe', 'localization', 'convert', 'international'],
  language: ['translate', 'globe', 'international', 'localization', 'speech'],
  hash: ['hashtag', 'number', 'pound', 'tag', 'channel'],
  hashtag: ['hash', 'tag', 'social', 'trending', 'topic'],
  at: ['mention', 'email', 'username', 'address', 'tag'],
  mention: ['at', 'tag', 'notify', 'reference', 'username'],
  emoji: ['smiley', 'face', 'reaction', 'emotion', 'sticker'],
  smile: ['happy', 'emoji', 'face', 'positive', 'joy'],
  sad: ['unhappy', 'emoji', 'face', 'negative', 'frown'],
  laugh: ['happy', 'emoji', 'funny', 'joy', 'lol'],
  thumbs: ['like', 'approve', 'vote', 'feedback', 'hand'],
  hand: ['gesture', 'touch', 'stop', 'wave', 'palm'],
  wave: ['hand', 'hello', 'greeting', 'gesture', 'hi'],
  touch: ['tap', 'finger', 'gesture', 'press', 'interact'],
  fingerprint: ['biometric', 'security', 'identity', 'touch id', 'authentication'],
  face: ['smiley', 'emoji', 'person', 'face id', 'avatar'],
  scan: ['qr', 'barcode', 'scanner', 'camera', 'read'],
  qr: ['scan', 'barcode', 'code', 'camera', 'link'],
  barcode: ['scan', 'qr', 'code', 'product', 'label'],
  box: ['package', 'container', 'archive', 'delivery', 'storage'],
  package: ['box', 'delivery', 'shipping', 'parcel', 'order'],
  delivery: ['shipping', 'truck', 'package', 'courier', 'transport'],
  shipping: ['delivery', 'truck', 'package', 'transport', 'freight'],
  food: ['meal', 'restaurant', 'eat', 'dining', 'cuisine'],
  restaurant: ['food', 'dining', 'eat', 'meal', 'cutlery'],
  coffee: ['cup', 'drink', 'cafe', 'beverage', 'break'],
  cup: ['coffee', 'drink', 'mug', 'beverage', 'tea'],
  pizza: ['food', 'meal', 'restaurant', 'slice', 'italian'],
  cake: ['birthday', 'dessert', 'celebration', 'food', 'sweet'],
  wine: ['drink', 'glass', 'alcohol', 'beverage', 'bar'],
  beer: ['drink', 'alcohol', 'beverage', 'bar', 'pub'],
  medicine: ['pill', 'health', 'medical', 'drug', 'pharmacy'],
  pill: ['medicine', 'health', 'medical', 'drug', 'capsule'],
  health: ['medical', 'heart', 'wellness', 'fitness', 'care'],
  medical: ['health', 'hospital', 'doctor', 'medicine', 'care'],
  doctor: ['medical', 'health', 'physician', 'hospital', 'stethoscope'],
  stethoscope: ['doctor', 'medical', 'health', 'hospital', 'checkup'],
  bandage: ['medical', 'health', 'injury', 'first aid', 'patch'],
  dna: ['genetics', 'biology', 'science', 'medical', 'helix'],
  atom: ['science', 'physics', 'chemistry', 'molecule', 'nuclear'],
  flask: ['science', 'chemistry', 'lab', 'experiment', 'beaker'],
  fitness: ['gym', 'exercise', 'health', 'workout', 'sport'],
  gym: ['fitness', 'exercise', 'workout', 'dumbbell', 'sport'],
  dumbbell: ['gym', 'fitness', 'weight', 'exercise', 'workout'],
  run: ['running', 'exercise', 'fitness', 'sport', 'fast'],
  sport: ['fitness', 'exercise', 'game', 'athletic', 'activity'],
  football: ['soccer', 'sport', 'ball', 'game', 'league'],
  basketball: ['sport', 'ball', 'game', 'hoop', 'nba'],
  bed: ['sleep', 'hotel', 'rest', 'bedroom', 'night'],
  sleep: ['bed', 'night', 'moon', 'rest', 'zzz'],
  hotel: ['bed', 'travel', 'accommodation', 'building', 'stay'],
  umbrella: ['rain', 'weather', 'protection', 'insurance', 'cover'],
  glasses: ['eyewear', 'vision', 'read', 'sunglasses', 'view'],
  shirt: ['clothing', 'fashion', 'apparel', 'tshirt', 'wear'],
  wifi_off: ['offline', 'no internet', 'disconnected', 'no connection'],
  offline: ['no internet', 'disconnected', 'wifi off', 'unavailable'],
  online: ['internet', 'connected', 'available', 'active', 'web'],
  power: ['on off', 'energy', 'battery', 'start', 'shutdown'],
  plug: ['power', 'electricity', 'charge', 'connect', 'socket'],
  bulb: ['idea', 'light', 'lamp', 'innovation', 'tip'],
  idea: ['bulb', 'light', 'innovation', 'creative', 'thought'],
  lamp: ['light', 'bulb', 'lighting', 'desk', 'illumination'],
  brain: ['mind', 'intelligence', 'think', 'ai', 'smart'],
  infinity: ['loop', 'endless', 'unlimited', 'forever', 'infinite'],
  loop: ['repeat', 'cycle', 'infinity', 'refresh', 'iteration'],
  repeat: ['loop', 'refresh', 'again', 'cycle', 'replay'],
  shuffle: ['random', 'mix', 'crossing arrows', 'randomize'],
  layers: ['stack', 'levels', 'sheets', 'design', 'overlap'],
  stack: ['layers', 'pile', 'collection', 'queue'],
  component: ['element', 'module', 'widget', 'block', 'part'],
  widget: ['component', 'element', 'module', 'app', 'block'],
  plugin: ['extension', 'addon', 'puzzle', 'integration', 'module'],
  api: ['integration', 'code', 'developer', 'interface', 'connection'],
  window: ['browser', 'screen', 'frame', 'application', 'panel'],
  browser: ['web', 'internet', 'window', 'chrome', 'explorer'],
  frame: ['border', 'window', 'container', 'layout', 'artboard'],
  slider: ['control', 'range', 'adjust', 'settings', 'level'],
  slideshow: ['presentation', 'carousel', 'gallery', 'slides'],
  presentation: ['slides', 'slideshow', 'chart', 'meeting', 'projector'],
  projector: ['presentation', 'movie', 'meeting', 'display'],
  megaphone: ['announcement', 'marketing', 'promotion', 'loud', 'campaign'],
  announcement: ['megaphone', 'news', 'notification', 'broadcast', 'alert'],
  broadcast: ['radio', 'signal', 'announcement', 'live', 'stream'],
  radio: ['broadcast', 'audio', 'music', 'signal', 'station'],
  podcast: ['audio', 'mic', 'radio', 'broadcast', 'episode'],
  stream: ['live', 'video', 'broadcast', 'play', 'media'],
  live: ['stream', 'broadcast', 'online', 'real time', 'active'],
  verify: ['check', 'badge', 'confirm', 'authentic', 'approved'],
  verified: ['check', 'badge', 'confirmed', 'authentic', 'approved'],
  certificate: ['award', 'diploma', 'document', 'achievement', 'license'],
  contract: ['document', 'agreement', 'signature', 'legal', 'paper'],
  signature: ['sign', 'autograph', 'contract', 'pen', 'approval'],
  law: ['legal', 'justice', 'court', 'scale', 'rules'],
  scale: ['balance', 'law', 'justice', 'weight', 'measure'],
  ruler: ['measure', 'size', 'length', 'design', 'scale'],
  eyedropper: ['color picker', 'pipette', 'sample', 'color', 'pick'],
  vector: ['pen tool', 'path', 'bezier', 'design', 'curve'],
  shapes: ['geometry', 'square', 'circle', 'triangle', 'design'],
  circle: ['round', 'shape', 'ellipse', 'ring', 'dot'],
  square: ['shape', 'box', 'rectangle', 'block'],
  triangle: ['shape', 'arrow', 'warning', 'play', 'delta'],
  hexagon: ['shape', 'polygon', 'geometry', 'honeycomb'],
  ring: ['circle', 'loop', 'round', 'jewelry', 'notification'],
  cube: ['box', '3d', 'block', 'package', 'dimension'],
  sticker: ['emoji', 'label', 'decal', 'decoration', 'badge'],
  crop_free: ['fullscreen', 'expand', 'scan', 'frame'],
  accessibility: ['a11y', 'person', 'disability', 'inclusive', 'universal'],
  child: ['kid', 'baby', 'family', 'person', 'young'],
  baby: ['child', 'infant', 'family', 'newborn', 'kid'],
  family: ['people', 'group', 'parents', 'children', 'home'],
  pet: ['animal', 'dog', 'cat', 'paw', 'companion'],
  dog: ['pet', 'animal', 'paw', 'puppy', 'canine'],
  cat: ['pet', 'animal', 'paw', 'kitten', 'feline'],
  bird: ['animal', 'fly', 'tweet', 'wing', 'nature'],
  fish: ['animal', 'sea', 'aquarium', 'seafood', 'ocean'],
  ghost: ['spooky', 'halloween', 'spirit', 'invisible', 'boo'],
  skull: ['death', 'danger', 'halloween', 'poison', 'pirate'],
  crosshair: ['target', 'aim', 'focus', 'precision', 'center'],
  focus: ['target', 'center', 'crosshair', 'attention', 'sharp'],
  eye_off: ['hide', 'invisible', 'hidden', 'privacy'],
  visibility: ['eye', 'view', 'show', 'see', 'preview'],
  key_off: ['no access', 'locked', 'restricted'],
  block: ['ban', 'forbidden', 'stop', 'prohibited', 'restrict'],
  ban: ['block', 'forbidden', 'prohibited', 'stop', 'restrict'],
  spam: ['junk', 'block', 'unwanted', 'mail', 'report'],
  report_problem: ['warning', 'alert', 'issue', 'flag'],
  thumb_up: ['like', 'approve', 'positive', 'vote'],
  thumb_down: ['dislike', 'disapprove', 'negative', 'vote'],
  emergency: ['alert', 'urgent', 'sos', 'help', 'siren'],
  sos: ['emergency', 'help', 'urgent', 'rescue', 'distress'],
  siren: ['emergency', 'alarm', 'police', 'alert', 'warning'],
  police: ['security', 'law', 'officer', 'emergency', 'badge'],
  key_visualizer: ['keyboard', 'shortcut', 'keys'],
  extension: ['plugin', 'addon', 'puzzle', 'module', 'integration'],
  apps: ['grid', 'applications', 'menu', 'programs', 'launcher'],
  workflow: ['process', 'flow', 'diagram', 'automation', 'steps'],
  process: ['workflow', 'gear', 'steps', 'procedure', 'operation'],
  automation: ['robot', 'workflow', 'auto', 'process', 'bot'],
  connect: ['link', 'plug', 'join', 'integration', 'attach'],
  disconnect: ['unlink', 'unplug', 'separate', 'detach', 'offline'],
  merge: ['combine', 'join', 'union', 'git', 'converge'],
  split: ['divide', 'separate', 'branch', 'fork', 'partition'],
  share_screen: ['present', 'display', 'meeting', 'cast'],
  cast: ['screen', 'chromecast', 'stream', 'tv', 'mirror'],
  mirror: ['reflect', 'flip', 'duplicate', 'cast', 'symmetry'],
  contrast: ['brightness', 'theme', 'adjust', 'display', 'accessibility'],
  brightness: ['sun', 'light', 'display', 'adjust', 'luminosity'],
  theme: ['color', 'palette', 'appearance', 'style', 'dark mode'],
  moon_star: ['night', 'dark mode', 'sleep'],
  vacation: ['travel', 'holiday', 'beach', 'trip', 'leisure'],
  travel: ['trip', 'vacation', 'plane', 'journey', 'tourism'],
  beach: ['vacation', 'sea', 'summer', 'sand', 'holiday'],
  mountain: ['nature', 'hiking', 'peak', 'landscape', 'outdoor'],
  camping: ['tent', 'outdoor', 'nature', 'adventure', 'campfire'],
  tent: ['camping', 'outdoor', 'shelter', 'adventure'],
  luggage: ['suitcase', 'travel', 'baggage', 'trip', 'vacation'],
  suitcase: ['luggage', 'travel', 'baggage', 'trip', 'briefcase'],
  passport: ['travel', 'identity', 'document', 'international', 'visa'],
};

// Whole-name matches take priority over per-word synonyms. Keys are the
// cleaned icon name words joined by '-'.
const COMPOUNDS: Record<string, string[]> = {
  'arrow-left': ['back', 'previous', 'return', 'west', 'before'],
  'arrow-right': ['forward', 'next', 'continue', 'east', 'after'],
  'arrow-up': ['top', 'above', 'ascend', 'north', 'increase'],
  'arrow-down': ['bottom', 'below', 'descend', 'south', 'decrease'],
  'chevron-left': ['back', 'previous', 'collapse', 'arrow'],
  'chevron-right': ['forward', 'next', 'expand', 'arrow'],
  'chevron-up': ['collapse', 'top', 'arrow', 'close'],
  'chevron-down': ['expand', 'dropdown', 'arrow', 'open'],
  'eye-off': ['hide', 'invisible', 'hidden', 'privacy', 'conceal'],
  'eye-slash': ['hide', 'invisible', 'hidden', 'privacy', 'conceal'],
  'volume-off': ['mute', 'silent', 'quiet', 'sound off'],
  'volume-mute': ['silent', 'quiet', 'sound off', 'audio off'],
  'bell-off': ['mute', 'silent', 'no notification', 'do not disturb'],
  'mic-off': ['mute', 'silent', 'no audio', 'voice off'],
  'wifi-off': ['offline', 'disconnected', 'no internet', 'no connection'],
  'cloud-off': ['offline', 'disconnected', 'no sync', 'local'],
  'user-plus': ['add user', 'invite', 'new member', 'follow', 'register'],
  'user-minus': ['remove user', 'unfollow', 'delete member', 'kick'],
  'user-check': ['verified user', 'approved', 'confirmed member', 'accepted'],
  'user-x': ['remove user', 'blocked', 'rejected', 'banned'],
  'log-in': ['sign in', 'enter', 'access', 'authenticate'],
  'log-out': ['sign out', 'exit', 'leave', 'quit'],
  'shopping-cart': ['buy', 'checkout', 'basket', 'ecommerce', 'purchase'],
  'shopping-bag': ['purchase', 'buy', 'store', 'ecommerce', 'retail'],
  'credit-card': ['payment', 'bank', 'money', 'checkout', 'debit'],
  'check-circle': ['success', 'done', 'complete', 'approved', 'confirmed'],
  'x-circle': ['error', 'fail', 'close', 'cancel', 'rejected'],
  'alert-circle': ['warning', 'error', 'attention', 'caution', 'important'],
  'alert-triangle': ['warning', 'caution', 'danger', 'attention', 'hazard'],
  'info-circle': ['information', 'about', 'help', 'detail', 'tooltip'],
  'question-circle': ['help', 'faq', 'support', 'ask', 'unknown'],
  'plus-circle': ['add', 'new', 'create', 'insert', 'increase'],
  'minus-circle': ['remove', 'subtract', 'decrease', 'delete'],
  'external-link': ['open', 'new tab', 'outside', 'redirect', 'visit'],
  'paper-plane': ['send', 'submit', 'message', 'deliver', 'share'],
  'thumbs-up': ['like', 'approve', 'positive', 'vote', 'agree'],
  'thumbs-down': ['dislike', 'disapprove', 'negative', 'vote', 'disagree'],
  'more-horizontal': ['options', 'menu', 'ellipsis', 'dots', 'extra'],
  'more-vertical': ['options', 'menu', 'kebab', 'dots', 'extra'],
  'trending-up': ['growth', 'increase', 'chart', 'popular', 'rise'],
  'trending-down': ['decline', 'decrease', 'chart', 'fall', 'loss'],
  'sort-asc': ['ascending', 'order', 'arrange', 'a to z'],
  'sort-desc': ['descending', 'order', 'arrange', 'z to a'],
  'zoom-in': ['magnify', 'enlarge', 'closer', 'plus', 'scale up'],
  'zoom-out': ['shrink', 'reduce', 'further', 'minus', 'scale down'],
  'dark-mode': ['night', 'moon', 'theme', 'appearance'],
  'light-mode': ['day', 'sun', 'brightness', 'theme', 'appearance'],
  'first-aid': ['medical', 'health', 'emergency', 'kit', 'cross'],
  'floppy-disk': ['save', 'store', 'disk', 'memory'],
  'open-book': ['read', 'library', 'education', 'learning', 'pages'],
  'phone-call': ['dial', 'telephone', 'contact', 'ring', 'talk'],
  'phone-off': ['end call', 'hang up', 'decline', 'mute'],
  'map-pin': ['location', 'place', 'marker', 'gps', 'address'],
  'file-text': ['document', 'notes', 'article', 'paper', 'doc'],
  'file-plus': ['new document', 'add file', 'create', 'new'],
  'folder-open': ['directory', 'browse', 'files', 'explore'],
  'folder-plus': ['new folder', 'add directory', 'create', 'organize'],
  'cloud-upload': ['backup', 'sync', 'send', 'save online', 'export'],
  'cloud-download': ['restore', 'sync', 'get', 'fetch', 'import'],
  'rotate-cw': ['clockwise', 'redo', 'refresh', 'turn right'],
  'rotate-ccw': ['counterclockwise', 'undo', 'reset', 'turn left'],
  'corner-up-left': ['reply', 'back', 'return', 'undo'],
  'corner-up-right': ['forward', 'redirect', 'share', 'redo'],
  'double-check': ['read', 'delivered', 'seen', 'complete'],
  'heart-off': ['unlike', 'unfavorite', 'remove from wishlist'],
  'star-off': ['unfavorite', 'unrate', 'remove rating'],
  'battery-low': ['power', 'charge needed', 'energy', 'warning'],
  'battery-full': ['power', 'charged', 'energy', 'complete'],
  'battery-charging': ['power', 'charging', 'energy', 'plugged'],
  'lock-open': ['unlock', 'access', 'unlocked', 'available'],
  'shield-check': ['secure', 'protected', 'verified', 'safe', 'trusted'],
  'shield-off': ['unprotected', 'insecure', 'vulnerable', 'disabled'],
  'message-circle': ['chat', 'comment', 'talk', 'bubble', 'conversation'],
  'message-square': ['chat', 'comment', 'talk', 'bubble', 'conversation'],
  'menu-open': ['sidebar', 'navigation', 'expand', 'drawer'],
  'grid-view': ['gallery', 'tiles', 'layout', 'thumbnails'],
  'list-view': ['rows', 'table', 'layout', 'items'],
  'play-circle': ['start', 'video', 'media', 'watch', 'resume'],
  'pause-circle': ['break', 'hold', 'media', 'wait'],
  'stop-circle': ['end', 'halt', 'media', 'finish'],
  'skip-forward': ['next', 'media', 'jump', 'advance'],
  'skip-back': ['previous', 'media', 'jump back', 'restart'],
  'fast-forward': ['skip', 'speed', 'next', 'media', 'advance'],
};

// Vietnamese tags, keyed by the SAME English icon-name words as SYNONYMS.
// These are product/UI-context translations of each icon *concept* (written by
// Claude), not word-by-word dictionary translations — e.g. "cart" → "giỏ hàng"
// (shopping cart), not "xe bò". Used when the user picks Vietnamese output.
const VI_SYNONYMS: Record<string, string[]> = {
  home: ['trang chủ', 'nhà', 'màn hình chính'],
  search: ['tìm kiếm', 'tra cứu', 'tìm'],
  arrow: ['mũi tên', 'hướng', 'con trỏ'],
  chevron: ['mũi tên', 'mở rộng', 'hướng'],
  caret: ['mũi tên', 'tam giác', 'thả xuống'],
  left: ['trái', 'quay lại', 'trước'],
  right: ['phải', 'tiếp theo', 'sau'],
  up: ['lên', 'trên', 'tăng'],
  down: ['xuống', 'dưới', 'giảm'],
  back: ['quay lại', 'trở lại', 'hoàn tác'],
  forward: ['tiếp theo', 'chuyển tiếp', 'tiến'],
  user: ['người dùng', 'tài khoản', 'hồ sơ', 'thành viên'],
  users: ['người dùng', 'nhóm', 'thành viên', 'mọi người'],
  person: ['người', 'cá nhân', 'hồ sơ', 'tài khoản'],
  people: ['mọi người', 'nhóm', 'cộng đồng', 'thành viên'],
  profile: ['hồ sơ', 'trang cá nhân', 'tài khoản'],
  account: ['tài khoản', 'hồ sơ', 'thành viên'],
  settings: ['cài đặt', 'thiết lập', 'tùy chỉnh', 'cấu hình'],
  setting: ['cài đặt', 'thiết lập', 'tùy chỉnh'],
  gear: ['bánh răng', 'cài đặt', 'thiết lập'],
  cog: ['bánh răng', 'cài đặt', 'thiết lập'],
  trash: ['thùng rác', 'xoá', 'xoá bỏ', 'loại bỏ'],
  delete: ['xoá', 'xoá bỏ', 'loại bỏ'],
  remove: ['xoá', 'loại bỏ', 'gỡ bỏ'],
  bin: ['thùng rác', 'xoá', 'loại bỏ'],
  edit: ['chỉnh sửa', 'sửa', 'biên tập'],
  pencil: ['bút chì', 'chỉnh sửa', 'viết'],
  pen: ['bút', 'viết', 'chỉnh sửa'],
  write: ['viết', 'soạn', 'ghi'],
  heart: ['trái tim', 'yêu thích', 'thích'],
  like: ['thích', 'yêu thích', 'tán thành'],
  favorite: ['yêu thích', 'ưa thích', 'đánh dấu'],
  star: ['sao', 'ngôi sao', 'đánh giá', 'yêu thích'],
  bell: ['chuông', 'thông báo', 'nhắc nhở'],
  notification: ['thông báo', 'nhắc nhở', 'tin báo'],
  alert: ['cảnh báo', 'chú ý', 'lưu ý'],
  alarm: ['báo thức', 'chuông', 'nhắc nhở'],
  mail: ['thư', 'email', 'hộp thư'],
  email: ['email', 'thư điện tử', 'hộp thư'],
  envelope: ['phong bì', 'thư', 'email'],
  inbox: ['hộp thư', 'thư đến', 'tin nhắn'],
  phone: ['điện thoại', 'gọi', 'liên hệ'],
  call: ['gọi', 'cuộc gọi', 'liên hệ'],
  mobile: ['điện thoại', 'di động', 'smartphone'],
  camera: ['máy ảnh', 'chụp ảnh', 'chụp hình'],
  photo: ['ảnh', 'hình ảnh', 'chụp ảnh'],
  image: ['hình ảnh', 'ảnh', 'hình'],
  picture: ['hình ảnh', 'ảnh', 'tranh'],
  gallery: ['thư viện ảnh', 'bộ sưu tập', 'ảnh'],
  video: ['video', 'phim', 'quay phim'],
  film: ['phim', 'video', 'điện ảnh'],
  music: ['nhạc', 'âm nhạc', 'bài hát'],
  audio: ['âm thanh', 'âm nhạc', 'loa'],
  sound: ['âm thanh', 'tiếng', 'âm lượng'],
  volume: ['âm lượng', 'âm thanh', 'loa'],
  speaker: ['loa', 'âm thanh', 'âm lượng'],
  mute: ['tắt tiếng', 'im lặng', 'tắt âm'],
  mic: ['micro', 'ghi âm', 'thu âm'],
  microphone: ['micro', 'ghi âm', 'thu âm'],
  headphones: ['tai nghe', 'âm thanh', 'nghe nhạc'],
  play: ['phát', 'chạy', 'bắt đầu'],
  pause: ['tạm dừng', 'dừng', 'ngừng'],
  stop: ['dừng', 'ngừng', 'kết thúc'],
  record: ['ghi âm', 'thu', 'ghi hình'],
  skip: ['bỏ qua', 'tiếp theo'],
  rewind: ['tua lại', 'quay lại'],
  lock: ['khoá', 'bảo mật', 'riêng tư'],
  unlock: ['mở khoá', 'truy cập'],
  key: ['chìa khoá', 'mật khẩu', 'khoá'],
  shield: ['khiên', 'bảo mật', 'bảo vệ', 'an toàn'],
  security: ['bảo mật', 'an ninh', 'an toàn', 'bảo vệ'],
  password: ['mật khẩu', 'khoá', 'bảo mật'],
  eye: ['mắt', 'xem', 'hiển thị', 'xem trước'],
  view: ['xem', 'hiển thị', 'xem trước'],
  hide: ['ẩn', 'che', 'giấu'],
  show: ['hiện', 'hiển thị', 'xem'],
  calendar: ['lịch', 'ngày', 'sự kiện', 'lịch trình'],
  date: ['ngày', 'lịch', 'thời gian'],
  schedule: ['lịch trình', 'lịch', 'kế hoạch'],
  event: ['sự kiện', 'lịch', 'hoạt động'],
  clock: ['đồng hồ', 'thời gian', 'giờ'],
  time: ['thời gian', 'giờ', 'đồng hồ'],
  timer: ['hẹn giờ', 'bấm giờ', 'đếm giờ'],
  watch: ['đồng hồ', 'thời gian', 'xem'],
  history: ['lịch sử', 'gần đây', 'nhật ký'],
  hourglass: ['đồng hồ cát', 'chờ', 'đang tải', 'thời gian'],
  download: ['tải xuống', 'tải về'],
  upload: ['tải lên', 'đăng tải'],
  import: ['nhập', 'nhập khẩu', 'tải vào'],
  export: ['xuất', 'xuất khẩu', 'chia sẻ'],
  save: ['lưu', 'lưu lại', 'ghi'],
  share: ['chia sẻ', 'gửi', 'đăng'],
  send: ['gửi', 'gửi đi', 'chia sẻ'],
  link: ['liên kết', 'đường dẫn', 'kết nối'],
  attachment: ['đính kèm', 'tệp đính kèm', 'ghim'],
  clip: ['kẹp', 'đính kèm', 'ghim'],
  paperclip: ['kẹp giấy', 'đính kèm', 'tệp'],
  file: ['tệp', 'tài liệu', 'hồ sơ'],
  files: ['tệp', 'tài liệu', 'thư mục'],
  document: ['tài liệu', 'văn bản', 'tệp'],
  folder: ['thư mục', 'tệp', 'lưu trữ'],
  archive: ['lưu trữ', 'hộp', 'sao lưu'],
  copy: ['sao chép', 'nhân bản'],
  paste: ['dán', 'sao chép'],
  clipboard: ['bảng tạm', 'sao chép', 'ghi chú'],
  duplicate: ['nhân bản', 'sao chép', 'gấp đôi'],
  cut: ['cắt', 'kéo cắt'],
  scissors: ['kéo', 'cắt'],
  print: ['in', 'in ấn'],
  printer: ['máy in', 'in'],
  chat: ['trò chuyện', 'tin nhắn', 'nhắn tin'],
  message: ['tin nhắn', 'trò chuyện', 'nhắn tin'],
  comment: ['bình luận', 'nhận xét', 'phản hồi'],
  bubble: ['bong bóng chat', 'tin nhắn', 'trò chuyện'],
  reply: ['trả lời', 'phản hồi', 'hồi đáp'],
  plus: ['thêm', 'thêm mới', 'tạo'],
  add: ['thêm', 'thêm mới', 'tạo'],
  minus: ['bớt', 'giảm', 'trừ'],
  close: ['đóng', 'huỷ', 'thoát'],
  cancel: ['huỷ', 'đóng', 'bỏ'],
  check: ['đánh dấu', 'xong', 'xác nhận'],
  checkmark: ['dấu tích', 'xong', 'xác nhận'],
  tick: ['dấu tích', 'xong', 'xác nhận'],
  done: ['xong', 'hoàn thành', 'xác nhận'],
  info: ['thông tin', 'chi tiết', 'trợ giúp'],
  information: ['thông tin', 'chi tiết'],
  warning: ['cảnh báo', 'chú ý', 'lưu ý'],
  error: ['lỗi', 'cảnh báo', 'sự cố'],
  danger: ['nguy hiểm', 'cảnh báo', 'rủi ro'],
  question: ['câu hỏi', 'trợ giúp', 'hỏi'],
  help: ['trợ giúp', 'hỗ trợ', 'giúp đỡ'],
  support: ['hỗ trợ', 'trợ giúp', 'chăm sóc'],
  cart: ['giỏ hàng', 'mua hàng', 'thanh toán'],
  basket: ['giỏ hàng', 'giỏ', 'mua hàng'],
  shopping: ['mua sắm', 'giỏ hàng', 'mua hàng'],
  bag: ['túi', 'giỏ hàng', 'mua sắm'],
  shop: ['cửa hàng', 'gian hàng', 'mua sắm'],
  store: ['cửa hàng', 'gian hàng', 'mua sắm'],
  money: ['tiền', 'tiền mặt', 'tài chính'],
  dollar: ['tiền', 'đô la', 'giá'],
  coin: ['xu', 'tiền xu', 'tiền'],
  cash: ['tiền mặt', 'tiền', 'thanh toán'],
  payment: ['thanh toán', 'chi trả', 'giao dịch'],
  card: ['thẻ', 'thanh toán', 'thẻ ngân hàng'],
  credit: ['thẻ tín dụng', 'tín dụng', 'thanh toán'],
  wallet: ['ví', 'ví tiền', 'thanh toán'],
  bank: ['ngân hàng', 'tài chính', 'tiền'],
  receipt: ['hoá đơn', 'biên lai', 'chứng từ'],
  invoice: ['hoá đơn', 'biên lai', 'chứng từ'],
  tag: ['nhãn', 'thẻ', 'gắn thẻ'],
  ticket: ['vé', 'phiếu', 'thẻ'],
  discount: ['giảm giá', 'khuyến mãi', 'ưu đãi'],
  percent: ['phần trăm', 'tỷ lệ', 'giảm giá'],
  gift: ['quà', 'quà tặng', 'phần thưởng'],
  location: ['vị trí', 'địa điểm', 'bản đồ', 'định vị'],
  pin: ['ghim', 'vị trí', 'đánh dấu'],
  map: ['bản đồ', 'vị trí', 'chỉ đường'],
  marker: ['điểm đánh dấu', 'vị trí', 'ghim'],
  gps: ['định vị', 'bản đồ', 'vị trí'],
  navigation: ['điều hướng', 'chỉ đường', 'la bàn'],
  compass: ['la bàn', 'phương hướng', 'khám phá'],
  globe: ['quả địa cầu', 'thế giới', 'toàn cầu'],
  world: ['thế giới', 'toàn cầu', 'quả địa cầu'],
  earth: ['trái đất', 'thế giới', 'toàn cầu'],
  flag: ['cờ', 'đánh dấu', 'báo cáo'],
  wifi: ['wifi', 'mạng', 'kết nối', 'không dây'],
  bluetooth: ['bluetooth', 'kết nối', 'không dây'],
  battery: ['pin', 'năng lượng', 'dung lượng'],
  signal: ['tín hiệu', 'mạng', 'sóng'],
  network: ['mạng', 'kết nối', 'internet'],
  internet: ['internet', 'mạng', 'trực tuyến'],
  cloud: ['đám mây', 'lưu trữ', 'mây'],
  server: ['máy chủ', 'lưu trữ', 'dữ liệu'],
  database: ['cơ sở dữ liệu', 'dữ liệu', 'lưu trữ'],
  refresh: ['làm mới', 'tải lại', 'cập nhật'],
  reload: ['tải lại', 'làm mới'],
  sync: ['đồng bộ', 'làm mới', 'cập nhật'],
  update: ['cập nhật', 'nâng cấp', 'làm mới'],
  loading: ['đang tải', 'chờ', 'xử lý'],
  filter: ['bộ lọc', 'lọc', 'sàng lọc'],
  sort: ['sắp xếp', 'thứ tự', 'lọc'],
  menu: ['menu', 'danh mục', 'thực đơn'],
  hamburger: ['menu', 'danh mục', 'điều hướng'],
  more: ['thêm', 'tùy chọn', 'xem thêm'],
  dots: ['tùy chọn', 'thêm', 'menu'],
  ellipsis: ['tùy chọn', 'thêm', 'menu'],
  grid: ['lưới', 'bố cục', 'ô'],
  list: ['danh sách', 'liệt kê', 'mục'],
  table: ['bảng', 'bảng biểu', 'dữ liệu'],
  layout: ['bố cục', 'giao diện', 'thiết kế'],
  dashboard: ['bảng điều khiển', 'tổng quan', 'thống kê'],
  bookmark: ['đánh dấu', 'lưu', 'dấu trang'],
  fire: ['lửa', 'ngọn lửa', 'nổi bật'],
  flame: ['lửa', 'ngọn lửa', 'nổi bật'],
  trending: ['xu hướng', 'thịnh hành', 'phổ biến'],
  chart: ['biểu đồ', 'đồ thị', 'thống kê'],
  graph: ['đồ thị', 'biểu đồ', 'thống kê'],
  analytics: ['phân tích', 'thống kê', 'số liệu'],
  statistics: ['thống kê', 'số liệu', 'phân tích'],
  report: ['báo cáo', 'thống kê', 'tài liệu'],
  activity: ['hoạt động', 'nhật ký', 'theo dõi'],
  target: ['mục tiêu', 'đích', 'tập trung'],
  award: ['giải thưởng', 'thành tích', 'phần thưởng'],
  trophy: ['cúp', 'giải thưởng', 'chiến thắng'],
  medal: ['huy chương', 'giải thưởng', 'thành tích'],
  badge: ['huy hiệu', 'nhãn', 'chứng nhận'],
  crown: ['vương miện', 'cao cấp', 'hoàng gia'],
  diamond: ['kim cương', 'cao cấp', 'quý giá'],
  rocket: ['tên lửa', 'khởi động', 'tăng tốc'],
  lightning: ['tia chớp', 'sấm sét', 'nhanh'],
  bolt: ['tia chớp', 'sấm sét', 'năng lượng'],
  flash: ['đèn flash', 'tia chớp', 'nhanh'],
  zap: ['tia chớp', 'năng lượng', 'nhanh'],
  sun: ['mặt trời', 'sáng', 'ban ngày'],
  moon: ['mặt trăng', 'ban đêm', 'chế độ tối'],
  night: ['ban đêm', 'mặt trăng', 'tối'],
  weather: ['thời tiết', 'dự báo', 'khí hậu'],
  rain: ['mưa', 'thời tiết', 'nước'],
  snow: ['tuyết', 'thời tiết', 'lạnh'],
  wind: ['gió', 'thời tiết', 'không khí'],
  drop: ['giọt', 'nước', 'giọt nước'],
  water: ['nước', 'giọt nước', 'chất lỏng'],
  leaf: ['lá', 'cây', 'thiên nhiên'],
  tree: ['cây', 'thiên nhiên', 'cây xanh'],
  plant: ['cây', 'thực vật', 'thiên nhiên'],
  flower: ['hoa', 'bông hoa', 'thiên nhiên'],
  bug: ['lỗi', 'con bọ', 'sâu'],
  paw: ['chân thú', 'thú cưng', 'động vật'],
  car: ['xe hơi', 'ô tô', 'phương tiện'],
  truck: ['xe tải', 'giao hàng', 'vận chuyển'],
  bus: ['xe buýt', 'phương tiện', 'giao thông'],
  bike: ['xe đạp', 'đạp xe', 'phương tiện'],
  train: ['tàu hoả', 'tàu điện', 'giao thông'],
  plane: ['máy bay', 'chuyến bay', 'du lịch'],
  airplane: ['máy bay', 'chuyến bay', 'du lịch'],
  flight: ['chuyến bay', 'máy bay', 'du lịch'],
  ship: ['tàu', 'thuyền', 'vận chuyển'],
  boat: ['thuyền', 'tàu', 'nước'],
  anchor: ['mỏ neo', 'tàu thuyền', 'cố định'],
  building: ['toà nhà', 'công ty', 'kiến trúc'],
  office: ['văn phòng', 'công ty', 'làm việc'],
  city: ['thành phố', 'đô thị', 'toà nhà'],
  hospital: ['bệnh viện', 'y tế', 'cấp cứu'],
  school: ['trường học', 'giáo dục', 'học tập'],
  book: ['sách', 'đọc', 'học tập'],
  library: ['thư viện', 'sách', 'bộ sưu tập'],
  education: ['giáo dục', 'học tập', 'đào tạo'],
  graduation: ['tốt nghiệp', 'giáo dục', 'bằng cấp'],
  news: ['tin tức', 'bản tin', 'báo'],
  newspaper: ['báo', 'tin tức', 'bản tin'],
  briefcase: ['cặp', 'công việc', 'kinh doanh'],
  work: ['công việc', 'làm việc', 'kinh doanh'],
  tool: ['công cụ', 'dụng cụ', 'sửa chữa'],
  tools: ['công cụ', 'dụng cụ', 'sửa chữa'],
  wrench: ['cờ lê', 'công cụ', 'sửa chữa'],
  hammer: ['búa', 'công cụ', 'xây dựng'],
  brush: ['cọ', 'sơn', 'vẽ'],
  paint: ['sơn', 'vẽ', 'màu'],
  palette: ['bảng màu', 'màu sắc', 'thiết kế'],
  color: ['màu sắc', 'màu', 'bảng màu'],
  magic: ['phép thuật', 'ma thuật', 'hiệu ứng'],
  wand: ['đũa thần', 'phép thuật', 'hiệu ứng'],
  sparkle: ['lấp lánh', 'hiệu ứng', 'mới'],
  sparkles: ['lấp lánh', 'hiệu ứng', 'mới'],
  ai: ['trí tuệ nhân tạo', 'thông minh', 'tự động'],
  robot: ['robot', 'người máy', 'tự động'],
  bot: ['bot', 'robot', 'tự động'],
  chip: ['chip', 'vi xử lý', 'phần cứng'],
  cpu: ['vi xử lý', 'chip', 'máy tính'],
  code: ['mã', 'lập trình', 'code'],
  terminal: ['cửa sổ lệnh', 'dòng lệnh', 'code'],
  bracket: ['dấu ngoặc', 'mã', 'lập trình'],
  git: ['quản lý mã', 'nhánh', 'kho lưu trữ'],
  branch: ['nhánh', 'phân nhánh', 'git'],
  computer: ['máy tính', 'thiết bị', 'màn hình'],
  desktop: ['máy tính để bàn', 'máy tính', 'màn hình'],
  laptop: ['máy tính xách tay', 'máy tính', 'thiết bị'],
  monitor: ['màn hình', 'hiển thị', 'máy tính'],
  screen: ['màn hình', 'hiển thị', 'thiết bị'],
  tablet: ['máy tính bảng', 'thiết bị', 'màn hình'],
  keyboard: ['bàn phím', 'nhập liệu', 'phím'],
  mouse: ['chuột', 'con trỏ', 'nhấp'],
  cursor: ['con trỏ', 'chuột', 'chọn'],
  tv: ['tivi', 'màn hình', 'truyền hình'],
  gamepad: ['tay cầm', 'trò chơi', 'chơi game'],
  game: ['trò chơi', 'chơi game', 'giải trí'],
  dice: ['xúc xắc', 'trò chơi', 'ngẫu nhiên'],
  puzzle: ['câu đố', 'mảnh ghép', 'tiện ích'],
  login: ['đăng nhập', 'vào', 'truy cập'],
  logout: ['đăng xuất', 'thoát', 'ra'],
  signin: ['đăng nhập', 'vào', 'truy cập'],
  signout: ['đăng xuất', 'thoát', 'ra'],
  exit: ['thoát', 'lối ra', 'ra'],
  enter: ['nhập', 'vào', 'truy cập'],
  door: ['cửa', 'lối ra', 'phòng'],
  expand: ['mở rộng', 'phóng to', 'mở'],
  collapse: ['thu gọn', 'thu nhỏ', 'đóng'],
  maximize: ['phóng to', 'mở rộng', 'toàn màn hình'],
  minimize: ['thu nhỏ', 'thu gọn', 'giảm'],
  fullscreen: ['toàn màn hình', 'phóng to', 'mở rộng'],
  resize: ['thay đổi kích thước', 'điều chỉnh', 'co giãn'],
  move: ['di chuyển', 'kéo', 'dời'],
  drag: ['kéo', 'kéo thả', 'di chuyển'],
  swap: ['hoán đổi', 'đổi', 'chuyển'],
  switch: ['chuyển đổi', 'đổi', 'bật tắt'],
  toggle: ['bật tắt', 'chuyển', 'công tắc'],
  rotate: ['xoay', 'quay', 'xoay chiều'],
  flip: ['lật', 'đảo', 'xoay'],
  crop: ['cắt', 'cắt xén', 'chỉnh'],
  zoom: ['thu phóng', 'phóng to', 'tỷ lệ'],
  undo: ['hoàn tác', 'quay lại', 'huỷ'],
  redo: ['làm lại', 'lặp lại', 'khôi phục'],
  reset: ['đặt lại', 'khôi phục', 'làm mới'],
  restore: ['khôi phục', 'đặt lại', 'phục hồi'],
  external: ['liên kết ngoài', 'mở', 'chuyển hướng'],
  open: ['mở', 'khởi động', 'truy cập'],
  new: ['mới', 'thêm mới', 'tạo'],
  create: ['tạo', 'thêm', 'tạo mới'],
  text: ['văn bản', 'chữ', 'kiểu chữ'],
  font: ['phông chữ', 'kiểu chữ', 'chữ'],
  align: ['căn chỉnh', 'căn lề', 'bố cục'],
  quote: ['trích dẫn', 'dẫn lời', 'câu nói'],
  translate: ['dịch', 'ngôn ngữ', 'phiên dịch'],
  language: ['ngôn ngữ', 'dịch', 'quốc tế'],
  hash: ['dấu thăng', 'số', 'thẻ'],
  hashtag: ['hashtag', 'thẻ', 'xu hướng'],
  at: ['nhắc đến', 'email', 'tên người dùng'],
  mention: ['nhắc đến', 'gắn thẻ', 'thông báo'],
  emoji: ['biểu tượng cảm xúc', 'mặt cười', 'cảm xúc'],
  smile: ['mặt cười', 'vui', 'cảm xúc'],
  sad: ['buồn', 'mặt buồn', 'cảm xúc'],
  laugh: ['cười', 'vui', 'hài hước'],
  thumbs: ['thích', 'tán thành', 'đánh giá'],
  hand: ['bàn tay', 'tay', 'cử chỉ'],
  wave: ['vẫy tay', 'chào', 'cử chỉ'],
  touch: ['chạm', 'cảm ứng', 'nhấn'],
  fingerprint: ['vân tay', 'sinh trắc học', 'bảo mật'],
  face: ['khuôn mặt', 'mặt', 'gương mặt'],
  scan: ['quét', 'mã', 'camera'],
  qr: ['mã qr', 'quét', 'mã'],
  barcode: ['mã vạch', 'quét', 'sản phẩm'],
  box: ['hộp', 'gói', 'lưu trữ'],
  package: ['gói', 'kiện hàng', 'giao hàng'],
  delivery: ['giao hàng', 'vận chuyển', 'ship'],
  shipping: ['vận chuyển', 'giao hàng', 'ship'],
  food: ['thức ăn', 'đồ ăn', 'món ăn'],
  restaurant: ['nhà hàng', 'ẩm thực', 'đồ ăn'],
  coffee: ['cà phê', 'đồ uống', 'ly'],
  cup: ['cốc', 'ly', 'đồ uống'],
  pizza: ['pizza', 'đồ ăn', 'món ăn'],
  cake: ['bánh', 'sinh nhật', 'tráng miệng'],
  wine: ['rượu vang', 'đồ uống', 'ly'],
  beer: ['bia', 'đồ uống', 'quán'],
  medicine: ['thuốc', 'y tế', 'sức khoẻ'],
  pill: ['viên thuốc', 'thuốc', 'y tế'],
  health: ['sức khoẻ', 'y tế', 'chăm sóc'],
  medical: ['y tế', 'sức khoẻ', 'khám bệnh'],
  doctor: ['bác sĩ', 'y tế', 'khám bệnh'],
  stethoscope: ['ống nghe', 'bác sĩ', 'y tế'],
  bandage: ['băng gạc', 'y tế', 'sơ cứu'],
  dna: ['adn', 'di truyền', 'sinh học'],
  atom: ['nguyên tử', 'khoa học', 'vật lý'],
  flask: ['bình thí nghiệm', 'khoa học', 'hoá học'],
  fitness: ['thể dục', 'tập luyện', 'sức khoẻ'],
  gym: ['phòng gym', 'thể hình', 'tập luyện'],
  dumbbell: ['tạ', 'thể hình', 'tập luyện'],
  run: ['chạy', 'chạy bộ', 'thể dục'],
  sport: ['thể thao', 'thể dục', 'vận động'],
  football: ['bóng đá', 'thể thao', 'bóng'],
  basketball: ['bóng rổ', 'thể thao', 'bóng'],
  bed: ['giường', 'ngủ', 'nghỉ ngơi'],
  sleep: ['ngủ', 'nghỉ ngơi', 'ban đêm'],
  hotel: ['khách sạn', 'lưu trú', 'du lịch'],
  umbrella: ['ô', 'dù', 'mưa'],
  glasses: ['kính', 'kính mắt', 'nhìn'],
  shirt: ['áo', 'quần áo', 'thời trang'],
  offline: ['ngoại tuyến', 'mất kết nối', 'không có mạng'],
  online: ['trực tuyến', 'kết nối', 'hoạt động'],
  power: ['nguồn', 'bật tắt', 'năng lượng'],
  plug: ['phích cắm', 'sạc', 'ổ điện'],
  bulb: ['bóng đèn', 'ý tưởng', 'đèn'],
  idea: ['ý tưởng', 'sáng kiến', 'bóng đèn'],
  lamp: ['đèn', 'bóng đèn', 'chiếu sáng'],
  brain: ['não', 'trí tuệ', 'thông minh'],
  infinity: ['vô cực', 'vô hạn', 'mãi mãi'],
  loop: ['lặp', 'vòng lặp', 'chu kỳ'],
  repeat: ['lặp lại', 'lặp', 'phát lại'],
  shuffle: ['xáo trộn', 'ngẫu nhiên', 'trộn'],
  layers: ['lớp', 'tầng', 'chồng lớp'],
  stack: ['chồng', 'ngăn xếp', 'bộ sưu tập'],
  component: ['thành phần', 'khối', 'mô đun'],
  widget: ['tiện ích', 'thành phần', 'khối'],
  plugin: ['tiện ích', 'tiện ích mở rộng', 'mô đun'],
  api: ['giao diện lập trình', 'tích hợp', 'kết nối'],
  window: ['cửa sổ', 'trình duyệt', 'giao diện'],
  browser: ['trình duyệt', 'web', 'internet'],
  frame: ['khung', 'cửa sổ', 'bố cục'],
  slider: ['thanh trượt', 'điều chỉnh', 'mức'],
  slideshow: ['trình chiếu', 'bộ ảnh', 'thư viện'],
  presentation: ['trình chiếu', 'thuyết trình', 'slide'],
  projector: ['máy chiếu', 'trình chiếu', 'hiển thị'],
  megaphone: ['loa phóng thanh', 'thông báo', 'quảng bá'],
  announcement: ['thông báo', 'tin tức', 'phát đi'],
  broadcast: ['phát sóng', 'phát trực tiếp', 'tín hiệu'],
  radio: ['radio', 'phát thanh', 'âm thanh'],
  podcast: ['podcast', 'âm thanh', 'phát thanh'],
  stream: ['phát trực tiếp', 'video', 'trực tuyến'],
  live: ['trực tiếp', 'phát sóng', 'trực tuyến'],
  verify: ['xác minh', 'xác thực', 'xác nhận'],
  verified: ['đã xác minh', 'xác thực', 'xác nhận'],
  certificate: ['chứng chỉ', 'chứng nhận', 'bằng cấp'],
  contract: ['hợp đồng', 'tài liệu', 'thoả thuận'],
  signature: ['chữ ký', 'ký', 'ký tên'],
  law: ['luật', 'pháp lý', 'công lý'],
  scale: ['cân', 'cân bằng', 'đo lường'],
  ruler: ['thước', 'đo', 'kích thước'],
  eyedropper: ['ống hút màu', 'chọn màu', 'lấy màu'],
  vector: ['vector', 'đường dẫn', 'thiết kế'],
  shapes: ['hình khối', 'hình dạng', 'thiết kế'],
  circle: ['hình tròn', 'vòng tròn', 'tròn'],
  square: ['hình vuông', 'ô vuông', 'khối'],
  triangle: ['hình tam giác', 'tam giác', 'cảnh báo'],
  hexagon: ['hình lục giác', 'lục giác', 'hình khối'],
  ring: ['vòng', 'nhẫn', 'thông báo'],
  cube: ['khối lập phương', 'hộp', 'ba chiều'],
  sticker: ['nhãn dán', 'sticker', 'trang trí'],
  accessibility: ['khả năng tiếp cận', 'hỗ trợ', 'hoà nhập'],
  child: ['trẻ em', 'trẻ nhỏ', 'gia đình'],
  baby: ['em bé', 'trẻ sơ sinh', 'gia đình'],
  family: ['gia đình', 'mọi người', 'cha mẹ'],
  pet: ['thú cưng', 'động vật', 'chó mèo'],
  dog: ['chó', 'thú cưng', 'động vật'],
  cat: ['mèo', 'thú cưng', 'động vật'],
  bird: ['chim', 'động vật', 'bay'],
  fish: ['cá', 'động vật', 'biển'],
  ghost: ['bóng ma', 'ma', 'halloween'],
  skull: ['đầu lâu', 'nguy hiểm', 'halloween'],
  crosshair: ['tâm ngắm', 'mục tiêu', 'tập trung'],
  focus: ['lấy nét', 'tập trung', 'trung tâm'],
  visibility: ['hiển thị', 'xem', 'hiện'],
  block: ['chặn', 'cấm', 'ngăn'],
  ban: ['cấm', 'chặn', 'ngăn'],
  spam: ['thư rác', 'chặn', 'không mong muốn'],
  emergency: ['khẩn cấp', 'cấp cứu', 'cứu trợ'],
  sos: ['khẩn cấp', 'cứu hộ', 'cầu cứu'],
  siren: ['còi báo', 'khẩn cấp', 'cảnh báo'],
  police: ['cảnh sát', 'an ninh', 'pháp luật'],
  extension: ['tiện ích mở rộng', 'tiện ích', 'mô đun'],
  apps: ['ứng dụng', 'lưới', 'menu'],
  workflow: ['quy trình', 'luồng', 'tự động hoá'],
  process: ['quy trình', 'xử lý', 'tiến trình'],
  automation: ['tự động hoá', 'tự động', 'quy trình'],
  connect: ['kết nối', 'liên kết', 'ghép nối'],
  disconnect: ['ngắt kết nối', 'tách', 'ngoại tuyến'],
  merge: ['hợp nhất', 'gộp', 'kết hợp'],
  split: ['chia', 'tách', 'phân chia'],
  cast: ['truyền', 'phát', 'trình chiếu'],
  mirror: ['phản chiếu', 'gương', 'sao chép'],
  contrast: ['độ tương phản', 'độ sáng', 'hiển thị'],
  brightness: ['độ sáng', 'sáng', 'hiển thị'],
  theme: ['giao diện', 'chủ đề', 'màu sắc'],
  vacation: ['kỳ nghỉ', 'du lịch', 'nghỉ dưỡng'],
  travel: ['du lịch', 'chuyến đi', 'hành trình'],
  beach: ['bãi biển', 'biển', 'mùa hè'],
  mountain: ['núi', 'thiên nhiên', 'leo núi'],
  camping: ['cắm trại', 'dã ngoại', 'thiên nhiên'],
  tent: ['lều', 'cắm trại', 'dã ngoại'],
  luggage: ['hành lý', 'va li', 'du lịch'],
  suitcase: ['va li', 'hành lý', 'du lịch'],
  passport: ['hộ chiếu', 'du lịch', 'giấy tờ'],
};

// Vietnamese compound overrides, keyed like COMPOUNDS.
const VI_COMPOUNDS: Record<string, string[]> = {
  'arrow-left': ['quay lại', 'trước', 'lùi'],
  'arrow-right': ['tiếp theo', 'tiến', 'kế tiếp'],
  'arrow-up': ['lên', 'trên', 'tăng'],
  'arrow-down': ['xuống', 'dưới', 'giảm'],
  'chevron-left': ['quay lại', 'trước', 'thu gọn'],
  'chevron-right': ['tiếp theo', 'mở rộng', 'sau'],
  'chevron-up': ['thu gọn', 'lên', 'đóng'],
  'chevron-down': ['mở rộng', 'thả xuống', 'xuống'],
  'eye-off': ['ẩn', 'không hiển thị', 'riêng tư'],
  'eye-slash': ['ẩn', 'không hiển thị', 'riêng tư'],
  'volume-off': ['tắt tiếng', 'im lặng', 'tắt âm'],
  'volume-mute': ['tắt tiếng', 'im lặng', 'tắt âm'],
  'bell-off': ['tắt thông báo', 'im lặng', 'không làm phiền'],
  'mic-off': ['tắt micro', 'im lặng', 'không thu âm'],
  'wifi-off': ['mất kết nối', 'ngoại tuyến', 'không có mạng'],
  'cloud-off': ['ngoại tuyến', 'ngắt kết nối', 'không đồng bộ'],
  'user-plus': ['thêm người dùng', 'mời', 'kết bạn'],
  'user-minus': ['xoá người dùng', 'huỷ theo dõi', 'bỏ thành viên'],
  'user-check': ['xác minh người dùng', 'đã duyệt', 'chấp nhận'],
  'user-x': ['xoá người dùng', 'chặn', 'từ chối'],
  'log-in': ['đăng nhập', 'vào', 'truy cập'],
  'log-out': ['đăng xuất', 'thoát', 'ra'],
  'shopping-cart': ['giỏ hàng', 'mua hàng', 'thanh toán'],
  'shopping-bag': ['túi mua sắm', 'mua hàng', 'cửa hàng'],
  'credit-card': ['thẻ tín dụng', 'thanh toán', 'ngân hàng'],
  'check-circle': ['thành công', 'hoàn thành', 'xác nhận'],
  'x-circle': ['lỗi', 'đóng', 'huỷ'],
  'alert-circle': ['cảnh báo', 'chú ý', 'lưu ý'],
  'alert-triangle': ['cảnh báo', 'chú ý', 'nguy hiểm'],
  'info-circle': ['thông tin', 'chi tiết', 'trợ giúp'],
  'question-circle': ['trợ giúp', 'câu hỏi', 'hỗ trợ'],
  'plus-circle': ['thêm', 'tạo mới', 'thêm mới'],
  'minus-circle': ['bớt', 'xoá', 'giảm'],
  'external-link': ['mở', 'liên kết ngoài', 'chuyển hướng'],
  'paper-plane': ['gửi', 'gửi đi', 'tin nhắn'],
  'thumbs-up': ['thích', 'đồng ý', 'tán thành'],
  'thumbs-down': ['không thích', 'phản đối', 'không đồng ý'],
  'more-horizontal': ['tùy chọn', 'menu', 'thêm'],
  'more-vertical': ['tùy chọn', 'menu', 'thêm'],
  'trending-up': ['tăng trưởng', 'đi lên', 'phổ biến'],
  'trending-down': ['giảm', 'đi xuống', 'sụt giảm'],
  'sort-asc': ['sắp xếp tăng', 'thứ tự', 'lọc'],
  'sort-desc': ['sắp xếp giảm', 'thứ tự', 'lọc'],
  'zoom-in': ['phóng to', 'thu phóng', 'gần hơn'],
  'zoom-out': ['thu nhỏ', 'thu phóng', 'xa hơn'],
  'dark-mode': ['chế độ tối', 'ban đêm', 'giao diện'],
  'light-mode': ['chế độ sáng', 'ban ngày', 'giao diện'],
  'first-aid': ['sơ cứu', 'y tế', 'cấp cứu'],
  'floppy-disk': ['lưu', 'lưu trữ', 'đĩa'],
  'open-book': ['đọc', 'sách', 'học tập'],
  'phone-call': ['gọi', 'cuộc gọi', 'liên hệ'],
  'phone-off': ['kết thúc cuộc gọi', 'tắt máy', 'từ chối'],
  'map-pin': ['vị trí', 'địa điểm', 'ghim'],
  'file-text': ['tài liệu', 'văn bản', 'ghi chú'],
  'file-plus': ['tài liệu mới', 'thêm tệp', 'tạo'],
  'folder-open': ['mở thư mục', 'duyệt', 'tệp'],
  'folder-plus': ['thư mục mới', 'thêm thư mục', 'tạo'],
  'cloud-upload': ['sao lưu', 'đồng bộ', 'tải lên'],
  'cloud-download': ['khôi phục', 'đồng bộ', 'tải xuống'],
  'rotate-cw': ['xoay phải', 'làm lại', 'quay'],
  'rotate-ccw': ['xoay trái', 'hoàn tác', 'quay'],
  'corner-up-left': ['trả lời', 'quay lại', 'hoàn tác'],
  'corner-up-right': ['chuyển tiếp', 'chia sẻ', 'làm lại'],
  'double-check': ['đã đọc', 'đã gửi', 'hoàn thành'],
  'heart-off': ['bỏ thích', 'bỏ yêu thích', 'xoá'],
  'star-off': ['bỏ đánh giá', 'bỏ yêu thích', 'xoá'],
  'battery-low': ['pin yếu', 'sắp hết pin', 'năng lượng'],
  'battery-full': ['pin đầy', 'đã sạc', 'năng lượng'],
  'battery-charging': ['đang sạc', 'năng lượng', 'pin'],
  'lock-open': ['mở khoá', 'truy cập', 'đã mở'],
  'shield-check': ['an toàn', 'bảo vệ', 'đã xác minh'],
  'shield-off': ['không bảo vệ', 'không an toàn', 'đã tắt'],
  'message-circle': ['trò chuyện', 'tin nhắn', 'bình luận'],
  'message-square': ['trò chuyện', 'tin nhắn', 'bình luận'],
  'menu-open': ['thanh bên', 'điều hướng', 'mở rộng'],
  'grid-view': ['dạng lưới', 'bố cục', 'hình thu nhỏ'],
  'list-view': ['dạng danh sách', 'bảng', 'mục'],
  'play-circle': ['phát', 'video', 'xem'],
  'pause-circle': ['tạm dừng', 'dừng', 'chờ'],
  'stop-circle': ['dừng', 'kết thúc', 'ngừng'],
  'skip-forward': ['tiếp theo', 'bỏ qua', 'tua tới'],
  'skip-back': ['trước đó', 'tua lại', 'bắt đầu lại'],
  'fast-forward': ['tua nhanh', 'tiếp theo', 'tăng tốc'],
};

const MEANINGLESS = /^\d+(px|dp)?$/;

function wordsOf(segment: string): string[] {
  return segment
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    // Split on non-letter/digit runs but keep Unicode letters (incl. Vietnamese
    // diacritics) intact, so "giỏ hàng" → ["giỏ", "hàng"] not ["gi","h","ng"].
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 0 && !MEANINGLESS.test(w));
}

// Fold a string to a diacritic-free, punctuation-free ASCII key for matching
// (e.g. "Giỏ Hàng" and "gio-hang" both → "giohang"). Lets a Vietnamese name —
// with or without diacritics — resolve against the Vietnamese dictionaries.
function foldVi(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '');
}

// Vietnamese-specific characters — a reliable signal the name is Vietnamese
// (English icon names never carry diacritics).
const VN_MARKS = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
function isVietnameseName(rawName: string): boolean {
  return VN_MARKS.test(rawName);
}

// Split an icon name into meaningful lowercase words, dropping prefixes,
// sizes, and style words. Walks '/' segments from the end and uses the first
// one that still has meaningful words, so both "Icons/Nav/arrow-left" and
// "credit-card/outline" resolve to the icon name itself.
function cleanWords(rawName: string): string[] {
  const segments = rawName.split('/');
  for (let i = segments.length - 1; i >= 0; i--) {
    const meaningful = wordsOf(segments[i]).filter((w) => !STOP_WORDS.has(w));
    if (meaningful.length > 0) return meaningful;
  }
  // Nothing meaningful anywhere (e.g. component named just "Icon") —
  // fall back to whatever words the last segment has.
  return wordsOf(segments[segments.length - 1]);
}

type Lang = 'en' | 'vi';

// Reverse indexes: Vietnamese term → English concept key. Lets a Vietnamese
// icon name resolve to a concept ("cart") so we can emit tags for it in
// whichever language the user picked. Two indexes:
//  - VI_EXACT keeps diacritics ("giỏ hàng"), so "giỏ" (basket) and "giờ"
//    (hour) don't collide — used when the name is written with diacritics.
//  - VI_FOLD strips diacritics ("giohang"), so a diacritic-free name
//    ("gio-hang") still resolves, at the cost of some ambiguity.
// Built in two passes so each concept's PRIMARY (first) term wins over another
// concept's secondary term — e.g. "báo cáo" maps to `report` (its primary),
// not `flag` (where it's only a synonym).
const VI_EXACT: Record<string, string> = {};
const VI_FOLD: Record<string, string> = {};
function viNorm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}
(function buildViIndex() {
  const maps: Record<string, string[]>[] = [VI_SYNONYMS, VI_COMPOUNDS];
  for (let pass = 0; pass < 2; pass++) {
    for (const map of maps) {
      for (const key of Object.keys(map)) {
        const terms = map[key];
        for (let i = 0; i < terms.length; i++) {
          const isPrimary = i === 0;
          if (pass === 0 ? !isPrimary : isPrimary) continue;
          const ex = viNorm(terms[i]);
          if (ex && !(ex in VI_EXACT)) VI_EXACT[ex] = key;
          const f = foldVi(terms[i]);
          if (f.length >= 2 && !(f in VI_FOLD)) VI_FOLD[f] = key;
        }
      }
    }
  }
})();

function viKey(term: string): string | undefined {
  return VI_EXACT[viNorm(term)] || VI_FOLD[foldVi(term)];
}

// Resolve an icon name's words to English concept keys. A whole-phrase match
// (English compound or a Vietnamese phrase) is the most specific, so it wins as
// a single concept; otherwise we accumulate per-word/pair concepts.
function resolveConcepts(words: string[]): string[] {
  // Vietnamese whole phrase — one specific concept, no multi-word noise.
  const phraseKey = viKey(words.join(' '));
  if (phraseKey) return [phraseKey];

  const keys: string[] = [];
  const add = (k?: string) => {
    if (k && keys.indexOf(k) === -1) keys.push(k);
  };

  // English: whole compound, adjacent pairs, then single-word keys.
  if (COMPOUNDS[words.join('-')]) add(words.join('-'));
  for (let i = 0; i + 1 < words.length; i++) {
    const pair = words[i] + '-' + words[i + 1];
    if (COMPOUNDS[pair]) add(pair);
  }
  for (const word of words) {
    if (SYNONYMS[word]) add(word);
  }
  if (keys.length > 0) return keys;

  // Vietnamese per-word / pair fallback (multi-word names not matched whole).
  for (let i = 0; i + 1 < words.length; i++) {
    add(viKey(words[i] + ' ' + words[i + 1]));
  }
  for (const word of words) {
    add(viKey(word));
  }

  return keys;
}

function generateTags(rawName: string, lang: Lang): string[] {
  const words = cleanWords(rawName);
  const concepts = resolveConcepts(words);
  const synonyms = lang === 'vi' ? VI_SYNONYMS : SYNONYMS;
  const compounds = lang === 'vi' ? VI_COMPOUNDS : COMPOUNDS;
  const limit = lang === 'vi' ? VI_MAX_TAGS : MAX_TAGS;

  // Exclude the icon's own name (folded) so we never echo it back as a tag —
  // e.g. a component named "giỏ hàng" shouldn't get "giỏ hàng" as a tag.
  const nameFolds = new Set<string>([foldVi(words.join(' '))]);
  for (const word of words) nameFolds.add(foldVi(word));

  const tags: string[] = [];
  const push = (tag: string) => {
    const t = tag.toLowerCase().trim();
    if (t && !nameFolds.has(foldVi(t)) && tags.indexOf(t) === -1 && tags.length < limit) {
      tags.push(t);
    }
  };

  for (const key of concepts) {
    const vals = compounds[key] || synonyms[key];
    if (vals) vals.forEach(push);
  }

  return tags;
}

// Datamuse ("means like") — free, keyless thesaurus API used to fill remaining
// tag slots for names the dictionary doesn't fully cover. Queries each cleaned
// name word (single-word queries give far better results than phrases) and
// returns extra tags not already present. Never throws — a network failure just
// yields no extra tags so the plugin degrades to dictionary-only.
const DATAMUSE_URL = 'https://api.datamuse.com/words';
const MAX_QUERY_WORDS = 3; // bound network calls per icon

async function fetchOnlineTags(words: string[], exclude: string[]): Promise<string[]> {
  if (words.length === 0) return [];
  const nameWords = new Set(words);
  const taken = new Set(exclude);
  const extra: string[] = [];

  for (const word of words.slice(0, MAX_QUERY_WORDS)) {
    if (extra.length + exclude.length >= MAX_TAGS) break;
    try {
      const res = await fetch(`${DATAMUSE_URL}?ml=${encodeURIComponent(word)}&max=12`);
      // Guard defensively: only bail on an explicit failure status, since
      // Figma's main-thread fetch response shape can vary.
      if (res.ok === false) continue;
      const data = (await res.json()) as Array<{ word?: string }>;
      if (!Array.isArray(data)) continue;
      for (const item of data) {
        const w = (item.word || '').toLowerCase().trim();
        // Letters/spaces/hyphens only; skip single chars, name words, dupes.
        if (!/^[a-z][a-z '-]*$/.test(w) || w.length < 2) continue;
        if (nameWords.has(w) || taken.has(w)) continue;
        taken.add(w);
        extra.push(w);
        if (extra.length + exclude.length >= MAX_TAGS) break;
      }
    } catch (_e) {
      // Ignore network/parse errors — treat as "no extra tags".
    }
  }

  return extra;
}

// dict.minhqnd.com — free, keyless Vietnamese dictionary. Given an English icon
// word it returns Vietnamese definitions; we mine the short comma-separated
// glosses (which read as synonym lists) for Vietnamese tags. Used as the online
// fallback for Vietnamese output, mirroring fetchOnlineTags for English.
const VIDICT_URL = 'https://dict.minhqnd.com/api/v1/lookup';
// Leading classifiers/nominalizers to strip so "sự điều tra" → "điều tra".
const VI_LEADING_STRIP = new Set(['sự', 'việc', 'cái']);
// Connective/filler words that mark a gloss as a phrase, not a clean tag.
const VI_FILLER = new Set([
  'để', 'vào', 'qua', 'như', 'cho', 'bằng', 'mà', 'khi', 'hoặc', 'của',
  'một', 'các', 'những', 'coi', 'rồi', 'thì', 'là', 'có', 'không', 'với',
]);

interface ViMeaning {
  definition?: string;
  definition_lang?: string;
  links?: string[];
}
interface ViTranslation {
  lang_code?: string;
  translation?: string;
}
interface ViRelation {
  related_word?: string;
  relation_type?: string;
}
interface ViResult {
  lang_code?: string;
  meanings?: ViMeaning[];
  translations?: ViTranslation[];
  relations?: ViRelation[];
}
interface ViResponse {
  exists?: boolean;
  results?: ViResult[];
}

async function fetchVietnameseTags(words: string[], exclude: string[]): Promise<string[]> {
  if (words.length === 0) return [];
  const taken = new Set(exclude);
  const extra: string[] = [];

  for (const word of words.slice(0, MAX_QUERY_WORDS)) {
    if (extra.length + exclude.length >= VI_MAX_TAGS) break;
    try {
      const res = await fetch(`${VIDICT_URL}?word=${encodeURIComponent(word)}&lang=en`);
      if (res.ok === false) continue;
      const data = (await res.json()) as ViResponse;
      if (!data || data.exists === false || !Array.isArray(data.results)) continue;

      for (const r of data.results) {
        if (r.lang_code !== 'en' || !Array.isArray(r.meanings)) continue;
        for (const m of r.meanings) {
          if (m.definition_lang !== 'vi') continue;
          const def = (m.definition || '').trim().replace(/\.+$/, '');
          if (!def || def.length > 45) continue; // long gloss = sentence, not synonyms

          for (const part of def.split(/[;,]/)) {
            let tokens = part.trim().toLowerCase().split(/\s+/).filter(Boolean);
            while (tokens.length > 1 && VI_LEADING_STRIP.has(tokens[0])) tokens = tokens.slice(1);
            if (tokens.length === 0 || tokens.length > 3) continue;
            if (tokens.some((t) => VI_FILLER.has(t))) continue;
            const tag = tokens.join(' ');
            if (/[0-9()[\]{}/\\]/.test(tag)) continue;
            if (taken.has(tag) || extra.indexOf(tag) !== -1) continue;
            taken.add(tag);
            extra.push(tag);
            if (extra.length + exclude.length >= VI_MAX_TAGS) break;
          }
          if (extra.length + exclude.length >= VI_MAX_TAGS) break;
        }
        if (extra.length + exclude.length >= VI_MAX_TAGS) break;
      }
    } catch (_e) {
      // Ignore network/parse errors — treat as "no extra tags".
    }
  }

  return extra;
}

// Online fallback for a *Vietnamese-named* icon that isn't in the dictionary.
// Looks the whole Vietnamese phrase up on dict.minhqnd.com (lang=vi) and, for
// Vietnamese output, mines synonyms ("Đồng nghĩa" relations + related links);
// for English output, uses the English translations. Best-effort — returns []
// on any failure so the plugin degrades gracefully.
async function fetchVietnameseNameTags(phrase: string, lang: Lang): Promise<string[]> {
  const q = phrase.trim();
  if (!q) return [];
  const limit = lang === 'vi' ? VI_MAX_TAGS : MAX_TAGS;
  const taken = new Set<string>([foldVi(q)]);
  const out: string[] = [];

  const add = (raw?: string) => {
    const t = (raw || '').trim().toLowerCase();
    if (!t || out.length >= limit) return;
    if (t.split(/\s+/).length > 3) return;
    if (/[0-9()[\]{}/\\]/.test(t)) return;
    const f = foldVi(t);
    if (taken.has(f) || out.indexOf(t) !== -1) return;
    taken.add(f);
    out.push(t);
  };

  try {
    const res = await fetch(`${VIDICT_URL}?word=${encodeURIComponent(q)}&lang=vi`);
    if (res.ok === false) return [];
    const data = (await res.json()) as ViResponse;
    if (!data || data.exists === false || !Array.isArray(data.results)) return [];

    for (const r of data.results) {
      if (r.lang_code !== 'vi') continue;
      if (lang === 'en') {
        for (const tr of r.translations || []) {
          if (tr.lang_code === 'en') add(tr.translation);
        }
      } else {
        for (const rel of r.relations || []) add(rel.related_word);
        for (const m of r.meanings || []) {
          for (const link of m.links || []) add(link);
        }
      }
      if (out.length >= limit) break;
    }
  } catch (_e) {
    // Ignore network/parse errors — treat as "no tags".
  }

  return out;
}

type Target = ComponentNode | ComponentSetNode;

// Collect master components from the selection. Variants inside a component
// set resolve to the set itself (that's where the description lives).
// Frames/groups/sections are searched recursively so users can select a
// whole icon sheet.
function collectTargets(selection: readonly SceneNode[]): Target[] {
  const targets = new Map<string, Target>();

  const addNode = (node: BaseNode) => {
    if (node.type === 'COMPONENT_SET') {
      targets.set(node.id, node);
    } else if (node.type === 'COMPONENT') {
      if (node.parent && node.parent.type === 'COMPONENT_SET') {
        targets.set(node.parent.id, node.parent);
      } else {
        targets.set(node.id, node);
      }
    }
  };

  for (const node of selection) {
    addNode(node);
    if (node.type !== 'COMPONENT' && node.type !== 'INSTANCE' && 'findAllWithCriteria' in node) {
      const found = node.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] });
      for (const f of found) addNode(f);
    }
  }

  return Array.from(targets.values());
}

interface ResultRow {
  name: string;
  tags: string[];
  status: 'updated' | 'skipped-existing' | 'no-tags' | 'cleared' | 'already-empty';
  source?: 'dictionary' | 'online' | 'mixed';
}

function sendSelectionUpdate() {
  const targets = collectTargets(figma.currentPage.selection);
  figma.ui.postMessage({ type: 'selection', count: targets.length });
}

const UI_WIDTH = 320;
const UI_MIN_HEIGHT = 240;
// High enough that the window always fits (chrome + the capped #rows list),
// so the plugin window itself never needs a scrollbar — only #rows scrolls.
const UI_MAX_HEIGHT = 820;

figma.skipInvisibleInstanceChildren = true;
// Initial height is a starting point; the UI measures its content and asks to
// resize (see the 'resize' message below) once loaded and whenever it changes.
figma.showUI(__html__, { width: UI_WIDTH, height: 300, themeColors: true });

sendSelectionUpdate();
figma.on('selectionchange', sendSelectionUpdate);

figma.ui.onmessage = async (msg: { type: string; overwrite?: boolean; online?: boolean; lang?: string; height?: number }) => {
  // The UI measures its own content and asks to grow/shrink the window
  // (e.g. when the details list is expanded).
  if (msg.type === 'resize' && typeof msg.height === 'number') {
    const h = Math.max(UI_MIN_HEIGHT, Math.min(UI_MAX_HEIGHT, Math.round(msg.height)));
    figma.ui.resize(UI_WIDTH, h);
    return;
  }

  if (msg.type === 'generate') {
    const targets = collectTargets(figma.currentPage.selection);

    if (targets.length === 0) {
      figma.notify('Select at least one icon component first');
      figma.ui.postMessage({ type: 'results', results: [] });
      return;
    }

    const lang: Lang = msg.lang === 'vi' ? 'vi' : 'en';
    const useOnline = msg.online !== false;
    const limit = lang === 'vi' ? VI_MAX_TAGS : MAX_TAGS;
    const results: ResultRow[] = [];

    for (const target of targets) {
      if (!msg.overwrite && target.description.trim() !== '') {
        results.push({ name: target.name, tags: [], status: 'skipped-existing' });
        continue;
      }

      const dictTags = generateTags(target.name, lang);
      let tags = dictTags;
      let source: ResultRow['source'] = 'dictionary';

      // Go online only when the name isn't in the dictionary at all (keeps
      // curated tags clean). Route by whether the *name* is Vietnamese or
      // English, independent of the chosen output language:
      //  - Vietnamese name  → dict.minhqnd.com, look up the whole phrase.
      //  - English name + VI → dict.minhqnd.com, translate each English word.
      //  - English name + EN → Datamuse synonyms.
      if (useOnline && dictTags.length === 0) {
        const words = cleanWords(target.name);
        let extra: string[];
        if (isVietnameseName(target.name)) {
          extra = await fetchVietnameseNameTags(words.join(' '), lang);
        } else if (lang === 'vi') {
          extra = await fetchVietnameseTags(words, []);
        } else {
          extra = await fetchOnlineTags(words, []);
        }
        if (extra.length > 0) {
          tags = extra.slice(0, limit);
          source = 'online';
        }
      }

      if (tags.length === 0) {
        results.push({ name: target.name, tags: [], status: 'no-tags' });
        continue;
      }

      target.description = tags.join(TAG_SEPARATOR);
      results.push({ name: target.name, tags, status: 'updated', source });
    }

    const updated = results.filter((r) => r.status === 'updated').length;
    figma.notify(`Easy Tag: updated ${updated} of ${targets.length} component${targets.length === 1 ? '' : 's'}`);
    figma.ui.postMessage({ type: 'results', results });
  }

  if (msg.type === 'clear') {
    const targets = collectTargets(figma.currentPage.selection);

    if (targets.length === 0) {
      figma.notify('Select at least one icon component first');
      figma.ui.postMessage({ type: 'results', results: [] });
      return;
    }

    const results: ResultRow[] = [];
    let cleared = 0;

    for (const target of targets) {
      if (target.description.trim() === '') {
        results.push({ name: target.name, tags: [], status: 'already-empty' });
        continue;
      }
      target.description = '';
      cleared++;
      results.push({ name: target.name, tags: [], status: 'cleared' });
    }

    figma.notify(`Easy Tag: cleared ${cleared} of ${targets.length} component${targets.length === 1 ? '' : 's'}`);
    figma.ui.postMessage({ type: 'results', results });
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

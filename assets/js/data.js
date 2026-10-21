/*
 * 每日 Raid Bounty 的单一数据源。
 * 顺序以 Guild Wars 2 Wiki 的 Daily Raid Bounties 为准。
 * 数据锚点：2026-10-15 UTC = 第 1 天。
 * 修改轮换顺序时请同步核对官方游戏更新及 Wiki。
 */
(function () {
  'use strict';

  const ENCOUNTERS = {
    shiverpeaks: { bounty: 'Shiverpeaks Pass', boss: 'Legendary Icebrood Construct', instance: 'Shiverpeaks Pass', wing: null },
    'voice-claw': { bounty: 'Voice and Claw of the Fallen', boss: 'Voice of the Fallen · Claw of the Fallen', instance: 'Voice of the Fallen and Claw of the Fallen', wing: null },
    fraenir: { bounty: 'Fraenir of Jormag', boss: 'Fraenir of Jormag', instance: 'Fraenir of Jormag', wing: null },
    gorseval: { bounty: 'Gorseval', boss: 'Gorseval', instance: 'Spirit Vale', wing: 1 },
    cairn: { bounty: 'Cairn', boss: 'Cairn', instance: 'Bastion of the Penitent', wing: 4 },
    mursaat: { bounty: 'Mursaat Overseer', boss: 'Mursaat Overseer', instance: 'Bastion of the Penitent', wing: 4 },

    aetherblade: { bounty: 'Aetherblade Hideout', boss: 'Captain Mai Trin · Echo of Scarlet Briar', instance: 'Aetherblade Hideout', wing: null },
    sabir: { bounty: 'Cardinal Sabir', boss: 'Cardinal Sabir', instance: 'The Key of Ahdashim', wing: 7 },
    whisper: { bounty: 'Whisper of Jormag', boss: 'Whisper of Jormag', instance: 'Whisper of Jormag', wing: null },
    vale: { bounty: 'Vale Guardian', boss: 'Vale Guardian', instance: 'Spirit Vale', wing: 1 },
    cosmic: { bounty: 'Cosmic Observatory', boss: 'Dagda', instance: 'Cosmic Observatory', wing: null },
    coldwar: { bounty: 'Cold War', boss: 'Varinia Stormsounder (Minister of Morale)', instance: 'Cold War', wing: null },
    boneskinner: { bounty: 'Boneskinner', boss: 'Boneskinner', instance: 'Boneskinner', wing: null },
    sabetha: { bounty: 'Sabetha', boss: 'Sabetha the Saboteur', instance: 'Spirit Vale', wing: 1 },
    xunlai: { bounty: 'Xunlai Jade Junkyard', boss: 'Ankka', instance: 'Xunlai Jade Junkyard', wing: null },
    febe: { bounty: 'Temple of Febe', boss: 'Cerus', instance: 'Temple of Febe', wing: null },
    construct: { bounty: 'Keep Construct', boss: 'Keep Construct', instance: 'Stronghold of the Faithful', wing: 3 },
    kela: { bounty: 'Kela', boss: 'Kela, Seneschal of Waves', instance: "Guardian's Glade", wing: null },

    slothasor: { bounty: 'Slothasor', boss: 'Slothasor', instance: 'Salvation Pass', wing: 2 },
    matthias: { bounty: 'Matthias', boss: 'Matthias Gabrel', instance: 'Salvation Pass', wing: 2 },
    xera: { bounty: 'Xera', boss: 'Xera', instance: 'Stronghold of the Faithful', wing: 3 },
    samarog: { bounty: 'Samarog', boss: 'Samarog', instance: 'Bastion of the Penitent', wing: 4 },
    amalgamate: { bounty: 'Conjured Amalgamate', boss: 'Conjured Amalgamate', instance: 'Mythwright Gambit', wing: 6 },
    largos: { bounty: 'Twin Largos', boss: 'Nikare · Kenut', instance: 'Mythwright Gambit', wing: 6 },
    decima: { bounty: 'Decima', boss: 'Decima, the Stormsinger', instance: 'Mount Balrior', wing: 8 },
    adina: { bounty: 'Cardinal Adina', boss: 'Cardinal Adina', instance: 'The Key of Ahdashim', wing: 7 },
    olc: { bounty: "Old Lion's Court", boss: 'Watchknight Triumvirate', instance: "Old Lion's Court", wing: null },
    ura: { bounty: 'Ura', boss: 'Ura, the Steamshrieker', instance: 'Mount Balrior', wing: 8 },
    kaineng: { bounty: 'Kaineng Overlook', boss: 'Minister Li', instance: 'Kaineng Overlook', wing: null },
    deimos: { bounty: 'Deimos', boss: 'Deimos', instance: 'Bastion of the Penitent', wing: 4 },

    qadim: { bounty: 'Qadim', boss: 'Qadim (Q1)', instance: 'Mythwright Gambit', wing: 6 },
    qtp: { bounty: 'Qadim the Peerless', boss: 'Qadim the Peerless (Q2)', instance: 'The Key of Ahdashim', wing: 7 },
    soulless: { bounty: 'Soulless Horror', boss: 'Soulless Horror', instance: 'Hall of Chains', wing: 5 },
    harvest: { bounty: 'Harvest Temple', boss: 'The Dragonvoid', instance: 'Harvest Temple', wing: null },
    dhuum: { bounty: 'Dhuum', boss: 'Dhuum', instance: 'Hall of Chains', wing: 5 },
    greer: { bounty: 'Greer', boss: 'Greer, the Blightbringer', instance: 'Mount Balrior', wing: 8 }
  };

  const GROUPS = [
    ['shiverpeaks', 'voice-claw', 'fraenir', 'gorseval', 'cairn', 'mursaat'],
    ['aetherblade', 'sabir', 'whisper', 'vale', 'cosmic', 'coldwar', 'boneskinner', 'sabetha', 'xunlai', 'febe', 'construct', 'kela'],
    ['slothasor', 'matthias', 'xera', 'samarog', 'amalgamate', 'largos', 'decima', 'adina', 'olc', 'ura', 'kaineng', 'deimos'],
    ['qadim', 'qtp', 'soulless', 'harvest', 'dhuum', 'greer']
  ];

  globalThis.GW2_DATA = Object.freeze({
    anchorDate: '2026-10-15',
    source: 'https://wiki.guildwars2.com/wiki/Daily_Raid_Bounties',
    verifiedAt: '2026-10-21',
    encounters: Object.freeze(ENCOUNTERS),
    groups: Object.freeze(GROUPS.map((g) => Object.freeze([...g])))
  });
})();

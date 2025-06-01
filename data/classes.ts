import { PlayerClass } from '../types';

export const PLAYER_CLASSES: PlayerClass[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Masters of physical combat, wielding strength and endurance to overcome their foes.',
    specializations: [
      {
        id: 'berserker',
        name: 'Berserker',
        description: 'Unleashes primal fury in battle, trading defense for devastating attacks.',
        bonuses: {
          body: 3,
          maxHp: 15,
          reflex: -1
        }
      },
      {
        id: 'guardian',
        name: 'Guardian',
        description: 'Protects allies and withstands punishment with superior defense.',
        bonuses: {
          body: 2,
          maxHp: 25,
          maxEp: 10
        }
      },
      {
        id: 'weaponmaster',
        name: 'Weapon Master',
        description: 'Achieves perfect balance between offense and defense through weapon mastery.',
        bonuses: {
          body: 2,
          reflex: 1,
          maxHp: 10
        }
      }
    ]
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Scholars of the arcane arts, manipulating magical forces to devastating effect.',
    specializations: [
      {
        id: 'elementalist',
        name: 'Elementalist',
        description: 'Commands the primal forces of fire, ice, and lightning.',
        bonuses: {
          mind: 3,
          maxMp: 20,
          body: -1
        }
      },
      {
        id: 'enchanter',
        name: 'Enchanter',
        description: 'Weaves subtle magics to enhance allies and confound enemies.',
        bonuses: {
          mind: 2,
          maxMp: 15,
          maxEp: 5
        }
      },
      {
        id: 'battlemage',
        name: 'Battle Mage',
        description: 'Combines martial prowess with magical might.',
        bonuses: {
          mind: 2,
          body: 1,
          maxMp: 10
        }
      }
    ]
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'Swift and cunning, striking from the shadows with precision and guile.',
    specializations: [
      {
        id: 'assassin',
        name: 'Assassin',
        description: 'Delivers death from the shadows with lethal precision.',
        bonuses: {
          reflex: 3,
          maxEp: 15,
          mind: -1
        }
      },
      {
        id: 'scout',
        name: 'Scout',
        description: 'Masters of stealth and reconnaissance, always one step ahead.',
        bonuses: {
          reflex: 2,
          mind: 1,
          maxEp: 10
        }
      },
      {
        id: 'trickster',
        name: 'Trickster',
        description: 'Uses cunning and misdirection to overcome challenges.',
        bonuses: {
          reflex: 2,
          maxEp: 10,
          maxMp: 5
        }
      }
    ]
  },
  {
    id: 'mystic',
    name: 'Mystic',
    description: 'Balanced practitioners who harmonize body, mind, and spirit.',
    specializations: [
      {
        id: 'monk',
        name: 'Monk',
        description: 'Achieves perfection through discipline and inner harmony.',
        bonuses: {
          body: 1,
          mind: 1,
          reflex: 1,
          maxEp: 15
        }
      },
      {
        id: 'druid',
        name: 'Druid',
        description: 'Channels the power of nature and the natural world.',
        bonuses: {
          mind: 2,
          body: 1,
          maxMp: 10,
          maxHp: 15
        }
      },
      {
        id: 'sage',
        name: 'Sage',
        description: 'Seeks knowledge and wisdom to unlock hidden potential.',
        bonuses: {
          mind: 2,
          reflex: 1,
          maxMp: 15,
          maxEp: 10
        }
      }
    ]
  }
];

export const getClassById = (classId: string): PlayerClass | undefined => {
  return PLAYER_CLASSES.find(cls => cls.id === classId);
};

export const getSpecializationById = (classId: string, specializationId: string) => {
  const playerClass = getClassById(classId);
  return playerClass?.specializations.find(spec => spec.id === specializationId);
}; 
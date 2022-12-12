export class BggGame {
  objectid = "";
  objecttype = "";
  subtype = "";
  image = "";
  name = "";
  status = "";
  thumbnail = "";
  yearpublished = "";

  constructor(init: Partial<BggGame> & { objectid: string }) {
    if (init) Object.assign(this, init);
  }

  static fromDetail = ({ id, name, image, thumbnail, yearpublished }: BggGameDetail) => {
    return new BggGame({
      objectid: id,
      name: Array.isArray(name) ? name[0].value : name.value,
      image,
      thumbnail,
      yearpublished,
    });
  };
}

type SimpleValueObject = { value: string };
type DynamicValueArray = SimpleValueObject | SimpleValueObject[];

interface BggLink {
  type: keyof BggLinkData;
  id: string;
  value: string;
}

export class BggLinkData {
  boardgameartist?: string[];
  boardgamecategory?: string[];
  boardgamedesigner?: string[];
  boardgameexpansion?: string[];
  boardgamefamily?: string[];
  boardgameimplementation?: string[];
  boardgameintegration?: string[];
  boardgamemechanic?: string[];
  boardgamepublisher?: string[];

  constructor(link: BggLink[]) {
    link.forEach((e) => {
      const key = e.type;
      if (this[key]) this[key]?.push(e.value);
      else this[key] = [e.value];
    });

    return this;
  }
}

export class BggGameDetail {
  id = "";
  image = "";
  name: DynamicValueArray = { value: "" };
  thumbnail = "";
  yearpublished = "";
  description = "";
  maxplayers = { value: "" };
  minplayers = { value: "" };
  maxplaytime = { value: "" };
  minplaytime = { value: "" };
  statistics = { ratings: { averageweight: { value: "" } } };
  link: BggLink[] = [];

  constructor(init: Partial<BggGameDetail> & { id: string }) {
    if (init) Object.assign(this, init);
  }
}

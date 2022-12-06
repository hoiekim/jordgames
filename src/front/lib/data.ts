export class BggGame {
  objectid = "";
  objecttype = "";
  subtype = "";
  image = "";
  name = "";
  status = "";
  thumbnail = "";
  yearpublished = "";

  constructor(init: Partial<BggGame> & { id: string }) {
    if (init) Object.assign(this, init);
  }
}

type SimpleValueObject = { value: string };
type DynamicValueArray = SimpleValueObject | SimpleValueObject[];

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

  constructor(init: Partial<BggGameDetail> & { id: string }) {
    if (init) Object.assign(this, init);
  }
}

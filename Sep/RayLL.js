import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";

const getAllEntities = () =>
["overworld", "nether", "the_end"].flatMap((dim) => world.getDimension(dim).getEntities({families:['enchant']}));


const enchantments = [
  { names: ['Smelting', 'Deep Breaker'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:pickaxe' },
  { names: ['Double Jump'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:boots' },
  { names: ['Fire Charge'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:crossbow' },
  { names: ['Glowing Aura'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:helmet' },
  { names: ['Spikes'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:shield' },
  { names: ['Soul Fire', 'Sweeping Edge'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:sword' },
  { names: ['Vitality'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:chestplate' },
  { names: ['Wind Charge'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:elytra' },
  { names: ['Boomshot'], command: 'event entity @e[r=1,type=raiyon:shape_entity] raiyon:bow' },
];


system.runInterval(() => {
const AllEntities = getAllEntities();

AllEntities.forEach((entity) => {
const nearPlayer = entity.dimension.getPlayers({maxDistance:20,location:entity.location});



if(nearPlayer.length === 0) return;

if(entity.typeId === 'raiyon:shape_entity' && entity.dimension.getBlock({x:entity.location.x,y:entity.location.y -1,z:entity.location.z}).typeId !== 'raiyon:enchantment_table'){
  entity.remove();
}

if (entity?.typeId === "raiyon:enchant_entity") {
if(!entity?.getComponent('is_sheared')){
  entity.runCommand('event entity @e[r=1,type=raiyon:shape_entity] raiyon:enchant_entity_despawn');

}

const properties = entity.getDynamicPropertyIds();

properties.forEach((prop) => {
if (prop.startsWith("rme")) {
entity.nameTag = extractNameMaxAndId(prop).name + " " + intToRoman(entity.getDynamicProperty(prop)).toUpperCase();




const nameEnchantment = extractNameMaxAndId(prop).name;
let commandExecuted = false;

for (const enchantment of enchantments) {
    if (enchantment.names.some(name => nameEnchantment.includes(name))) {
        entity.runCommand(enchantment.command);
        commandExecuted = true;
        break;
    }
}





}
});
if (properties.length === 0) {
entity.nameTag = "";
entity.runCommand('event entity @e[r=1,type=raiyon:shape_entity] raiyon:shape_loop');
} else {
  let soundScore = entity.soundScore;

  if (soundScore === undefined || soundScore === null) {
      soundScore = 0;
  }
  
  soundScore += 1;
  
  if (soundScore >= 40) {
      entity.runCommand('playsound beacon.ambient @a[r=5] ~ ~ ~ 1 1.3');
      soundScore = 0;
  }
  
entity.soundScore = soundScore;
entity?.dimension?.spawnParticle("raiyon:enchanting_table_particle_powered", entity?.location);
}

if (entity.dimension.getBlock(entity.location).typeId !== "raiyon:enchantment_table") {
const properties = entity.getDynamicPropertyIds();

properties.forEach((prop) => {
if (prop.startsWith("rme")) {


entity.dimension.spawnItem(new ItemStack(extractNameMaxAndId(prop).id), entity.location);
}
});
entity.remove();
}
}
});
});
function MaxLevelEnchantments(typeId) {
const getMaxLevel = {
vitality: 5,
smelting: 2,
soul_fire: 2,
glowing_aura: 2,
mining_speed: 3,
double_jump: 2,
sweeping_edge: 3,
wind_charge: 2,
spikes: 2,
deep_breaker: 2,
boomshot:2
};

for (let key in getMaxLevel) {
if (typeId.includes(key)) {
return getMaxLevel[key];
}
}

return 0;
}

function enchanting(entity) {
const vec = entity.location;
entity.dimension.spawnParticle("enchanting:succesfull", { x: vec.x + -0.5, y: vec.y, z: vec.z - 0.6 });
entity.runCommand("playsound block.enchanting_table.use @a[r=5] ~ ~ ~ 1 1.3");
}

function enchanting_book(entity) {
  const vec = entity.location;
  entity.dimension.spawnParticle("enchanting:succesfull_book", { x: vec.x + -0.5, y: vec.y +1, z: vec.z - 0.6 });
  entity.runCommand("playsound beacon.power @a[r=5] ~ ~ ~ 1 0.9");
}


world.afterEvents.entityHitEntity.subscribe(({ hitEntity, damagingEntity }) => {
if(damagingEntity.typeId !== 'minecraft:player') return;
//Equipeable
const equippable = damagingEntity?.getComponent("equippable");
const mainHand = equippable?.getEquipment(EquipmentSlot.Mainhand);
//Enchantment Name
const name = "§r§7" + formatString(mainHand?.typeId);

//Enchantment Level

const level = mainHand?.typeId.endsWith("_i")
? 1
: mainHand?.typeId.endsWith("_ii")
  ? 2
  : mainHand?.typeId.endsWith("_iii")
    ? 3
    : mainHand?.typeId.endsWith("_iv")
      ? 4
      : mainHand?.typeId.endsWith("_v")
        ? 5
        : 0;
const maxLevel = MaxLevelEnchantments(mainHand?.typeId);

const dynamicProperty = hitEntity.getDynamicProperty(`rme:name:${name},max:${maxLevel},id:${mainHand.typeId}`);
const IdsProperty = hitEntity.getDynamicPropertyIds();
const sameProperty = IdsProperty.find((property) => property.includes(name));

if (hitEntity?.typeId === "raiyon:enchant_entity" && mainHand?.typeId.startsWith("book:")) {

if (!sameProperty) {
equippable.setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:air"));
enchanting_book(hitEntity);
hitEntity.setDynamicProperty(`rme:name:${name},max:${maxLevel},id:${mainHand.typeId}`, level);
} else if (dynamicProperty === level && level < maxLevel && sameProperty) {

equippable.setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:air"));
enchanting_book(hitEntity);
hitEntity.setDynamicProperty(`rme:name:${name},max:${maxLevel},id:${mainHand.typeId}`, undefined);
hitEntity.setDynamicProperty(
`rme:name:${name},max:${maxLevel},id:${getBookName(mainHand.typeId, level + 1)}`,
level + 1,
);
hitEntity.removeTag("rme:alreadyEnchanted");
}
const currentEnchantments = hitEntity.getDynamicPropertyIds();

currentEnchantments.forEach((enchantment) => {
const Data = extractNameMaxAndId(enchantment);
if (Data.name !== name) {
equippable.setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:air"));

hitEntity.setDynamicProperty(`rme:name:${name},max:${maxLevel},id:${mainHand.typeId}`, level);

system.runTimeout(() => {
hitEntity.dimension.spawnItem(new ItemStack(Data.id), hitEntity.location);
}, 1);

system.runTimeout(() => {
hitEntity.setDynamicProperty(enchantment, undefined);
}, 1);
}

if (Data.name === name && level > hitEntity.getDynamicProperty(enchantment)) {
equippable.setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:air"));
hitEntity.setDynamicProperty(`rme:name:${name},max:${maxLevel},id:${mainHand.typeId}`, level);
system.runTimeout(() => {
hitEntity.dimension.spawnItem(new ItemStack(Data.id), hitEntity.location);
}, 1);

system.runTimeout(() => {
hitEntity.setDynamicProperty(enchantment, undefined);
}, 1);
}
});
}
if (hitEntity?.typeId === "raiyon:enchant_entity" && mainHand) {
const currentEnchantments = hitEntity.getDynamicPropertyIds();

currentEnchantments.forEach((enchantment) => {
const Data = extractNameMaxAndId(enchantment);
const entityEnchantmentLevel = hitEntity.getDynamicProperty(enchantment);
let lores = mainHand.getLore() || [];
let existingLore = lores.find((lore) => lore.startsWith(Data.name));
let existingLoreLevel = existingLore ? RomanToInt(getLoreLevel(existingLore)) : 0;
const enchantmentAdded = (enchantments, tools) => {
return containsAnyWords(enchantments, tools, enchantment, mainHand);
};

if (
enchantmentAdded(bow_enchantments, [":bow"]) ||
enchantmentAdded(boot_enchantments, ["boot"]) ||
enchantmentAdded(trident_enchantments, ["trident"]) ||
enchantmentAdded(shield_enchantments, ["shield"]) ||
enchantmentAdded(multi_mining_enchantments, multi_mining_tools) ||
enchantmentAdded(sword_enchantments, ["sword"]) ||
enchantmentAdded(elytra_enchantments, ["elytra"]) ||
enchantmentAdded(crossbow_enchantments, ["crossbow"]) ||
enchantmentAdded(helmet_enchantments, ["helmet"]) ||
enchantmentAdded(chestplate_enchantments, chestplate_tools)
) {
// Case 1: Entity enchantment level is greater than existing enchantment level
if (entityEnchantmentLevel > existingLoreLevel) {
if (existingLore) {
damagingEntity.addTag(`rmeR:${existingLore}`);
enchanting(hitEntity);
}
damagingEntity.addTag(
`rme:${Data.name + (entityEnchantmentLevel > 0 ? " " + toRoman(entityEnchantmentLevel) : "")}`,
);
enchanting(hitEntity);
hitEntity.setDynamicProperty(enchantment, undefined);
}
// Case 2: Entity enchantment level is equal to existing enchantment level
else if (entityEnchantmentLevel === existingLoreLevel && existingLoreLevel !== 0) {
const newLevel = entityEnchantmentLevel + 1;
if (newLevel <= Data.max) {
damagingEntity.addTag(`rmeR:${existingLore}`);
damagingEntity.addTag(`rme:${Data.name + (newLevel > 0 ? " " + toRoman(newLevel) : "")}`);
enchanting(hitEntity);
hitEntity.setDynamicProperty(enchantment, undefined);
}
}
// Case 3: No existing lore and entity enchantment level is 0
else if (!existingLore) {
damagingEntity.addTag(`rme:${Data.name}`);
enchanting(hitEntity);
hitEntity.setDynamicProperty(enchantment, undefined);
}
}
});
}
});
function getLoreLevel(lore) {
// Dividimos la cadena en espacios y tomamos la última parte
const parts = lore.split(" ");
const level = parts[parts.length - 1];
// Devolvemos el nivel en minúsculas

return level;
}

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
if (block.typeId === "raiyon:enchantment_table") {
block.dimension.spawnEntity("raiyon:enchant_entity", {
x: block.location.x + 0.5,
y: block.location.y + 0.6,
z: block.location.z + 0.5,
});
}
});

function formatString(s) {
let parts = s?.split(":");

let subString = parts[1];

subString = subString.replace(/_/g, " ");

subString = subString.replace(/\b(?:[ivxlcdmIVXLCDM]+|\d+)\b/g, "").trim();

let words = subString?.split(" ").map((word) => {
return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
});

return words.join(" ");
}

function extractNameMaxAndId(inputString) {
const nameRegex = /name:([^,]+)/;
const maxRegex = /max:(\d+)/;
const idRegex = /id:([^,]+)/;

const nameMatch = inputString.match(nameRegex);
const name = nameMatch ? nameMatch[1].trim() : null;

const maxMatch = inputString.match(maxRegex);
const max = maxMatch ? parseInt(maxMatch[1].trim(), 10) : null;

const idMatch = inputString.match(idRegex);
const id = idMatch ? idMatch[1].trim() : null;

return { name, max, id };
}

function toRoman(num) {
switch (num) {
case 1:
return "I";
case 2:
return "II";
case 3:
return "III";
case 4:
return "IV";
case 5:
return "V";
default:
return "";
}
}
function RomanToInt(roman) {
switch (roman.toUpperCase()) {
case "I":
return 1;
case "II":
return 2;
case "III":
return 3;
case "IV":
return 4;
case "V":
return 5;
default:
return 0;
}
}
function intToRoman(num) {
const romanNumerals = [
{ value: 5, symbol: "v" },
{ value: 4, symbol: "iv" },
{ value: 3, symbol: "iii" },
{ value: 2, symbol: "ii" },
{ value: 1, symbol: "i" },
];

let roman = "";

for (const { value, symbol } of romanNumerals) {
while (num >= value) {
roman += symbol;
num -= value;
}
}

return roman;
}

// Función para generar el nombre del libro con la numeración romana
function getBookName(baseName, num) {
if (num < 1 || num > 5) {
throw new Error("Number must be between 1 and 5");
}
const romanNum = intToRoman(num);
// Eliminar cualquier numeración romana existente del nombre base
const baseNameWithoutLevel = baseName.replace(/_i{1,3}|_iv|_v/, "");
return `${baseNameWithoutLevel}_${romanNum}`;
}

let currentLore = "";

system.runInterval(() => {
const players = world.getAllPlayers();
players.forEach((player) => {
// Equipment
const equippable = player.getComponent("equippable");
const mainhandItem = equippable.getEquipment(EquipmentSlot.Mainhand);
const tags = player.getTags();
const addLoreTag = tags.find((tag) => tag.startsWith("rme:"));
const removeLoreTag = tags.find((tag) => tag.startsWith("rmeR:"));

// Add Lore
if (addLoreTag && mainhandItem) {
const loreToAdd = addLoreTag.split(":")[1];
let lore = mainhandItem.getLore() || [];
if (!lore.includes(loreToAdd)) {
lore.push(loreToAdd);
mainhandItem.setLore(lore);
equippable.setEquipment(EquipmentSlot.Mainhand, mainhandItem);
currentLore = lore.join(" ");
}
player.removeTag(addLoreTag);
}

// Remove Lore
if (removeLoreTag && mainhandItem) {
const loreToRemove = removeLoreTag.split(":")[1];
let lore = mainhandItem.getLore() || [];
const updatedLore = lore.filter((loreItem) => loreItem !== loreToRemove);
if (updatedLore.length !== lore.length) {
mainhandItem.setLore(updatedLore);
equippable.setEquipment(EquipmentSlot.Mainhand, mainhandItem);
currentLore = updatedLore.join(" ");
}
player.removeTag(removeLoreTag);
} else if (mainhandItem) {
let lore = mainhandItem.getLore() || [];
currentLore = lore.join(" ");
}
});
});

function containsAnyWords(enchantments, tools, tag, mainhandItem) {
return (
tools.some((tool) => mainhandItem.typeId.includes(tool)) &&
enchantments.some((enchantment) => tag.includes(enchantment))
);
}

let crossbow_enchantments = ["fire_charge", "illager_loyalty"];
let multi_mining_enchantments = ["mining_speed","smelting","deep_breaker"];
let helmet_enchantments = ["glowing_aura"];
let chestplate_enchantments = ["vitality"];
let elytra_enchantments = ["hot_breeze", "wind_charge"];
let sword_enchantments = ["sweeping_edge", "soul_fire"];
let shield_enchantments = ["slime_push","spikes"];
let boot_enchantments = ["double_jump"];
let trident_enchantments = ["fire_riptide"];
//Tools
let multi_mining_tools = ["shovel", "pickaxe"];
let chestplate_tools = ["elytra", "chestplate"];

let bow_enchantments = ["boomshot"];

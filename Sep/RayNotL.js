import { world, system, EquipmentSlot, ItemStack, Player } from "@minecraft/server";
let currentLore;


system.runInterval(() => {

const players = world.getAllPlayers();

players.forEach(player => {
    
    const v = player?.location;
    const Equipment = player?.getComponent('equippable');

    const Mainhand = Equipment.getEquipment(EquipmentSlot.Mainhand);
    const Offhand = Equipment.getEquipment(EquipmentSlot.Offhand);

    //Const Inventory
 






    const handlore = Mainhand?.getLore() || [];
    const offlore = Offhand?.getLore() || [];


    //Shield 

    // Verificar el lore "Shield Spikes" en la mainhand
    let mainhandShieldSpikes = handlore?.find((lore) => lore.includes('Spikes'));
    
    // Verificar si la offhand tiene un escudo sin el lore "Shield Spikes"
    let isOffhandShieldWithoutSpikes = Offhand?.typeId !== 'minecraft:shield' && !offlore?.find((lore) => lore.includes('Spikes'));
    
    let shieldSpikeslore = mainhandShieldSpikes && isOffhandShieldWithoutSpikes ? mainhandShieldSpikes : !isOffhandShieldWithoutSpikes ?offlore?.find((lore) => lore.includes('Spikes')) : null;

    let shieldSpikesl = l(shieldSpikeslore);

    if (shieldSpikesl) {
        player.addTag(`sp:e${shieldSpikesl}`);
    }
    
    for (let i = 1; i <= 2; i++) {
        if (!shieldSpikesl || i !== shieldSpikesl) {
            player.removeTag(`sp:e${i}`);
        }
    }


    //Helmet

    const Helmet = Equipment?.getEquipment(EquipmentSlot.Head);

    const headlore = Helmet?.getLore() || [];


    //Glowin Aura
    let glowing = headlore?.find((lore) => lore.includes('Glowing Aura'));
    let glowingl = l(glowing);

    if (glowingl) {
        player.addTag(`ga:e${glowingl}`);
    }
    
    for (let i = 1; i <= 2; i++) {
        if (!glowingl || i !== glowingl) {
            player.removeTag(`ga:e${i}`);
        }
    }

    //Mainhand
 
    //Sweeping Edge

    let sweeping = handlore?.find((lore) => lore.includes('Sweeping Edge'));
    let sweep = l(sweeping);
    
    if (sweep) {
        player.addTag(`se:e${sweep}`);
    }
    
    for (let i = 1; i <= 3; i++) {
        if (!sweep || i !== sweep) {
            player.removeTag(`se:e${i}`);
        }
    }

    //Deep Breaker
    let deep_breaker = handlore?.find((lore) => lore.includes('Deep Breaker'));
    let deep = l(deep_breaker);

    if (deep) {
        player.addTag(`dp:e${deep}`);
    }
    
    for (let i = 1; i <= 2; i++) {
        if (!deep || i !== deep) {
            player.removeTag(`dp:e${i}`);
        }
    }


    //Smelting
    let smelting = handlore?.find((lore) => lore.includes('Smelting'));
    let smelt = l(smelting);
    
    if(smelt === 1){
    
        player.addTag(`sm:e1`);
    } else {
      
        player.removeTag('sm:e1');
    }

    if(smelt === 2){
    
        player.addTag(`sm:e2`);
    } else {
      
        player.removeTag('sm:e2');
    }


    //Soul Fire
    let soulFire = handlore?.find((lore) => lore.includes('Soul Fire'));
    let sl = l(soulFire);
    if(sl === 1){
    
        player.addTag(`sf:e1`);
    } else {
      
        player.removeTag('sf:e1');
    }
    

    if(sl === 2){
    
        player.addTag(`sf:e2`);
    } else {
      
        player.removeTag('sf:e2');
    }

     //Fire Riptide
     let fireRiptide = handlore?.find((lore) => lore.includes('Fire Riptide'));
     if(fireRiptide){
         player.addTag('fr:e');
     } else {
         player.removeTag('fr:e');
     }

    //Fire Charge
    let fireCharge = handlore?.find((lore) => lore.includes('Fire Charge'));
    if(fireCharge){
        player.addTag('fc:e');
    } else {
        player.removeTag('fc:e');
    }

     //Boomshot
     let boomShot = handlore?.find((lore) => lore.includes('Boomshot'));
     let bl = l(boomShot);
     if(bl === 1){
     
         player.addTag(`bs:e1`);
     } else {
       
         player.removeTag('bs:e1');
     }
     
 
     if(bl === 2){
     
         player.addTag(`bs:e2`);
     } else {
       
         player.removeTag('bs:e2');
     }

    //Chest

    const Chestplate = Equipment.getEquipment(EquipmentSlot.Chest);
    const chestLore = Chestplate?.getLore() || [];

    //Vitality
    let vitality = chestLore?.find((lore) => lore.includes('Vitality'));
    let vl = l(vitality);

    if(vitality){
        player.addEffect('health_boost',20,{amplifier:vl -1,showParticles:false});
    }

    //Wind Charge

    let windCharge = chestLore?.find((lore) => lore.includes('Wind Charge'));

    if(windCharge && player.isOnGround){
       player.removeTag('wc:g');

    } else if(windCharge && player.isGliding && !player.hasTag('wc:g')){
        player.addTag('wc:g');
        player.runCommand('particle minecraft:breeze_wind_explosion_emitter ^^^4');
        player.dimension.playSound('breeze_wind_charge.burst',player.location);
        const getViewDirection = player.getViewDirection();
        player.applyKnockback(getViewDirection.x, getViewDirection.z,windCharge.endsWith('II') ? 3.5 : 2.5, 0.7);
    }

    //Boots
    const Boots = Equipment.getEquipment(EquipmentSlot.Feet);
    
    //Double Jump
    const bootsLore = Boots?.getLore() || [];

    let doubleJump = bootsLore.find((lore) => lore.includes('Double Jump'));
    
    if(doubleJump && player.isOnGround){
        system.runTimeout(() => {

        if(player?.isJumping){
        player.addTag('dj:g');
            }
        },1);
    } else if(player?.isJumping && doubleJump && player.hasTag('dj:g') && player.isFalling){
        player.dimension.spawnParticle('double_jump:dust',{x:v.x,y:v.y,z:v.z});
        player.playSound('mob.witch.throw',{location:player.location,volume:0.3,pitch:0.9});
        player.applyKnockback(v.x,v.z,0,doubleJump.endsWith('II') ? 1.05 : 0.85);
        player.removeTag('dj:g');
 
        system.runTimeout(() => {
            player.addEffect('slow_falling',15);

        },doubleJump.endsWith('II') ? 18 : 10)
    }

    

    });
});

world.afterEvents.playerBreakBlock.subscribe(({ player, block, brokenBlockPermutation }) => {
    if (player.hasTag("sm:e1") || player.hasTag("sm:e2")) {
        handleOreSmelting(block, player, brokenBlockPermutation);
    }
});



function handleOreSmelting(block, player, brokenBlockPermutation) {
    const blockTypesOres = [
        "minecraft:sand",
        "minecraft:iron_ore",
        "minecraft:deepslate_iron_ore",
        "minecraft:copper_ore",
        "minecraft:deepslate_copper_ore",
        "minecraft:gold_ore",
        "minecraft:deepslate_gold_ore",
        "minecraft:ancient_debris"

    ];

    if (blockTypesOres.some(type => brokenBlockPermutation.matches(type))) {
        system.runTimeout(() => {
            let entities = player.dimension.getEntities();
            entities.forEach(entity => {
                if (entity.hasComponent("minecraft:item")) {
                    const itemComponent = entity.getComponent("minecraft:item");
                    const itemStack = itemComponent.itemStack;
                    const itemStackAmount = itemComponent.itemStack.amount;
                    const netherite_scrap = new ItemStack("minecraft:netherite_scrap", itemStackAmount);
                    const glass = new ItemStack("minecraft:glass", itemStackAmount);
                    const ironIngot = new ItemStack("minecraft:iron_ingot", itemStackAmount);
                    const copperIngot = new ItemStack("minecraft:copper_ingot", itemStackAmount);
                    const goldIngot = new ItemStack("minecraft:gold_ingot", itemStackAmount);

                    if (['minecraft:sand', 'minecraft:raw_iron', 'minecraft:raw_copper', 'minecraft:raw_gold',"minecraft:ancient_debris"].includes(itemStack.typeId)) {
                        entity.addTag("raiyon:raw_ore");
                    }

                    player.runCommand(`execute at @s positioned ${block.location.x} ${block.location.y} ${block.location.z} run tag @e[r=2,tag=raiyon:raw_ore] add raiyon:smelting_ore`);

                    if (entity.hasTag("raiyon:smelting_ore")) {
                        let smeltedItem;
                        let particleType = "minecraft:basic_flame_particle";
                        let playSound = true;

                        if (itemStack.typeId === 'minecraft:raw_iron') {
                            smeltedItem = ironIngot;
                        } else if (itemStack.typeId === 'minecraft:raw_copper') {
                            smeltedItem = copperIngot;
                        } else if (itemStack.typeId === 'minecraft:raw_gold') {
                            smeltedItem = goldIngot;
                        } else if (itemStack.typeId === 'minecraft:sand') {
                            smeltedItem = glass;
                        }
                        else if (itemStack.typeId === 'minecraft:ancient_debris') {
                            smeltedItem = netherite_scrap;
                        }

                        if (smeltedItem) {
                            entity.dimension.spawnItem(smeltedItem, entity.location);

                            // Nivel 2: Probabilidad de doble resultado y partícula azul
                            if (player.hasTag("sm:e2") && Math.random() <= 0.3) {
                                if (itemStack.typeId === 'minecraft:raw_iron') {
                                    entity.dimension.spawnItem(ironIngot, entity.location); // Doble resultado de hierro
                                } else if (itemStack.typeId === 'minecraft:raw_copper') {
                                    entity.dimension.spawnItem(copperIngot, entity.location); // Doble resultado de cobre
                                } else if (itemStack.typeId === 'minecraft:raw_gold') {
                                    entity.dimension.spawnItem(goldIngot, entity.location); // Doble resultado de oro
                                }
                                else if (itemStack.typeId === 'minecraft:ancient_debris') {
                                    entity.dimension.spawnItem(netherite_scrap, entity.location); // Doble resultado de oro
                                }
                                particleType = "minecraft:blue_flame_particle"; // Partícula azul
                            }

                            if (playSound) {
                                player.playSound("fire.fire", { volume: 0.3, pitch: 1.5 });
                            }
                            entity.dimension.spawnEntity("minecraft:xp_orb", entity.location);
                            entity.dimension.spawnParticle(particleType, entity.location);
                            entity.kill();
                        }
                    }
                }
            });
        }, 1);
    }
}
world.afterEvents.projectileHitBlock.subscribe(({source,projectile,hitVector,location}) => {
if(source?.hasTag('bs:e1') || source?.hasTag('bs:e2')){
    projectile.dimension.spawnParticle('minecraft:large_explosion',projectile.location);
    projectile.dimension.playSound('random.explode',location);
    source.runCommand(`execute positioned ${location.x.toFixed(0)} ${location.y.toFixed(0)} ${location.z.toFixed(0)} run damage @e[r=3] ${source.hasTag('bs:e1') ? 4 : 5} projectile entity @s`);
    system.runTimeout(() => {
    projectile.remove();
    },4);
}

});

world.afterEvents.projectileHitEntity.subscribe(({projectile,source,hitVector,location,getEntityHit}) => {

    if(source?.hasTag('bs:e1') || source?.hasTag('bs:e2')){
        source.dimension.spawnParticle('minecraft:large_explosion',location);
        source.dimension.playSound('random.explode',location);
        source.runCommand(`execute positioned ${location.x.toFixed(0)} ${location.y.toFixed(0)} ${location.z.toFixed(0)} run damage @e[r=3] ${source.hasTag('bs:e1') ? 4 : 5} projectile entity @s`);
    }
});

world.afterEvents.entitySpawn.subscribe(({entity}) => {
if(entity.typeId === 'minecraft:arrow' && entity?.getComponent('variant')?.value === 1){
    entity.setOnFire(6);
}

});

world.afterEvents.entityHurt.subscribe(({ damageSource, hurtEntity }) => {
    let damagingEntityTags = damageSource?.damagingEntity?.getTags();
    if(damageSource.cause !== 'entityAttack') return;

    //Sweeping Edge
    let sweepingEdge = damagingEntityTags?.filter(tag => tag.startsWith("se:e"));
    if(sweepingEdge?.length > 0 && damageSource?.damagingEntity?.isOnGround){
    damageSource.damagingEntity.runCommand('particle raiyon:sweep ^-0.2 ^1.2 ^3');
    damageSource.damagingEntity.runCommand(`execute at @s positioned ^^1^2.5 run damage @e[r=2,type=!item] ${getLastNumberFromTag(sweepingEdge[0]) +1} entity_attack entity @s`);
    damageSource.damagingEntity.dimension.playSound('sweep',damageSource.damagingEntity.location);
    }
    

    //Fire Soul
    const sft = hurtEntity?.getDynamicProperty('sf:t');
    const playSoundAndReset = (tag) => {
        hurtEntity.addTag(tag);
        if (sft > 0) hurtEntity.setDynamicProperty('sf:t', 0);

        if (sft === undefined) hurtEntity.dimension.playSound('particle.soul_escape',hurtEntity.location);
    };

    if (damageSource?.damagingEntity?.hasTag('sf:e1')) playSoundAndReset('sf:t1');
    if (damageSource?.damagingEntity?.hasTag('sf:e2')) playSoundAndReset('sf:t2');
});





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

function l(inputString) {
    const romanToStringMap = {
      'I': 1,
      'II': 2,
      'III': 3,
      'IV': 4,
      'V': 5
    };
  
    const suffix = inputString?.split(' ').pop();
  
    return romanToStringMap[suffix] || 0;
  }
  
const getAllEntities = () =>
    ["overworld", "nether", "the_end"].flatMap((dim) => world.getDimension(dim).getEntities());

system.runInterval(() => {
    const AllEntities = getAllEntities();
    
    AllEntities.forEach((entity) => {

      

        if(entity?.hasTag('sf:t1') || entity?.hasTag('sf:t2')){

            const sft = entity.getDynamicProperty('sf:t');

            if(sft === undefined){
            entity.setDynamicProperty('sf:t',0);
            const sfE = entity.dimension.spawnEntity('raiyon:sf',entity.location);
            sfE.addTag(entity.id);

            } else {
            if(sft === 20 || sft === 40 || sft === 60 || sft === 80 || sft === 100 || sft === 120 || sft === 140){
            entity.applyDamage(0.5,{cause:'entityAttack'});

            
            }
            const sfET = entity.dimension.getEntities({tags:[entity.id]});

            sfET.forEach(sE => {
            sE.clearVelocity();
            sE.teleport(entity.location);
            });

            entity.extinguishFire(false);

            entity.addEffect('slowness',20,{showParticles:true,amplifier:2});
            entity.setDynamicProperty('sf:t',sft + 1);
            if ((entity?.hasTag('sf:t1') && sft >= 60) || (!entity?.hasTag('sf:t1') && sft >= 145) || entity?.isInWater.valueOf()) {
            entity.removeTag('sf:t1');
            entity.removeTag('sf:t2');
            entity.setDynamicProperty('sf:t',undefined);
                if(entity?.isInWater.valueOf()){
                    entity.dimension.playSound('random.fizz',entity.location);
                    entity.dimension.spawnParticle('minecraft:water_evaporation_bucket_emitter',entity.location);
                }

                }
            }

            
        }
        if(entity.typeId === 'raiyon:sf'){
            const tags = entity.getTags();
            const getSource = world.getEntity(tags.toString());
            if((!getSource?.hasTag('sf:t1') && !getSource?.hasTag('sf:t2')) || !getSource.isValid()){
                entity.remove();
            }
        }

    })
})

function getLastNumberFromTag(tag) {
    let match = tag.match(/(\d+)$/); // Busca uno o más dígitos al final de la etiqueta
    return match ? parseInt(match[1], 10) : null; // Devuelve el número encontrado o null si no hay coincidencia
}

world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
	if (hurtEntity.typeId === "minecraft:player" && damageSource.cause === "entityAttack") {
		hurtEntity.addTag("raiyon:EntityAttacked");

		system.runTimeout(() => {
			hurtEntity.removeTag("raiyon:EntityAttacked");
		}, 2);
	}

});



world.afterEvents.entityHitEntity.subscribe(({hitEntity,damagingEntity}) => {
  
    system.runTimeout(() => {
  
    if(hitEntity.typeId === 'minecraft:player'){

        

        if(hitEntity.hasTag('sp:e1') && Math.random() <= 0.5 && !hitEntity.hasTag("raiyon:EntityAttacked")){
        damagingEntity.applyDamage(2,{damagingEntity:hitEntity,cause:'none'});
        damagingEntity.dimension.playSound('damage.thorns',damagingEntity.location);

            }
        if(hitEntity.hasTag('sp:e2') && Math.random() <= 0.7 && !hitEntity.hasTag("raiyon:EntityAttacked")){
            damagingEntity.applyDamage(4,{damagingEntity:hitEntity,cause:'none'});
            damagingEntity.dimension.playSound('damage.thorns',damagingEntity.location);
            }
    
    }
    
    },1);
   } );




   world.afterEvents.playerBreakBlock.subscribe(({ player, block, brokenBlockPermutation }) => {
    if (player.isSneaking && (player.hasTag("dp:e1") || player.hasTag("dp:e2"))) {

  
        const blockTypes = [
            "minecraft:stone", 
            "minecraft:end_stone", 
            "minecraft:netherrack", 
            "minecraft:deepslate"
        ];

        if (blockTypes.some(type => brokenBlockPermutation.matches(type))) {
            const blockLocation = block.location;
            const playerDirection = player.getViewDirection();
            
            const behindX = blockLocation.x + Math.round(playerDirection.x);
            const behindY = blockLocation.y + Math.round(playerDirection.y);
            const behindZ = blockLocation.z + Math.round(playerDirection.z);
            const centerBlockLocation = { x: behindX, y: behindY, z: behindZ };

            // Dividir el área 3x3 en grupos más pequeños
            const groups = [
                [{ x: -1, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }],
                [{ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }],
                [{ x: -1, y: -1, z: 0 }, { x: 0, y: -1, z: 0 }, { x: 1, y: -1, z: 0 }],
            
                [{ x: -1, y: 1, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }],
                [{ x: -1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }],
                [{ x: -1, y: -1, z: 1 }, { x: 0, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }],
            
                [{ x: -1, y: 1, z: -1 }, { x: 0, y: 1, z: -1 }, { x: 1, y: 1, z: -1 }],
                [{ x: -1, y: 0, z: -1 }, { x: 0, y: 0, z: -1 }, { x: 1, y: 0, z: -1 }],
                [{ x: -1, y: -1, z: -1 }, { x: 0, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }]
            ];
            const silk_touch = player.getComponent('equippable').getEquipment(EquipmentSlot.Mainhand).getComponent('enchantable').getEnchantment('silk_touch')?.type.id === 'silk_touch';
            const maxBlocksPerEvent = 10; 
            let blocksProcessed = 0;

            function destroyBlockGroup() {
                const group = groups[blocksProcessed];
                let breakCount = 0;

                group.forEach(offset => {
                    const checkX = centerBlockLocation.x + offset.x;
                    const checkY = centerBlockLocation.y + offset.y;
                    const checkZ = centerBlockLocation.z + offset.z;

                    const surroundingBlock = block.dimension.getBlock({ x: checkX, y: checkY, z: checkZ });
                    const surroundingBlockPermutation = surroundingBlock.permutation;
                    
                    if (blockTypes.some(type => surroundingBlockPermutation.matches(type))) {
                        breakCount++;
                    let test = !silk_touch && surroundingBlock.getItemStack().typeId === 'minecraft:stone' ? 'minecraft:cobblestone' : surroundingBlock.getItemStack().typeId;
                    
                    player.dimension.spawnItem(new ItemStack(test),surroundingBlock.location);

                     surroundingBlock.setType('minecraft:air');
                    }
                });

                blocksProcessed++;

                if (blocksProcessed < groups.length && breakCount < maxBlocksPerEvent) {
                    player.playSound("dig.stone",player.location);

                    const delayTicks = 1; // Ajusta según sea necesario
                    system.runTimeout(destroyBlockGroup, delayTicks);
                } else {
                    if (player.isSneaking && player.hasTag("dp:e1")) {
                        player.addEffect("mining_fatigue", 30, { amplifier: 0 });
                    }

                    if (player.isSneaking && player.hasTag("dp:e2")) {
                        player.addEffect("mining_fatigue", 15, { amplifier: 0 });
                    }
                }
            }

            destroyBlockGroup();
        }
    }
});
import {world, system} from "@minecraft/server";

system.runInterval(() => {
    let entities = world.getAllPlayers();

    entities.forEach(entity => {

        if(world.getDimension(entity.dimension.id).getBlock(entity.location) !== undefined){
        let x = Math.floor(entity.location.x);
        let z = Math.floor(entity.location.z);

        let y = Math.floor(
        (world.getDimension(entity.dimension.id).getBlock({x:x,y:entity.location.y +1,z:z}).typeId === 'minecraft:air' ||
        world.getDimension(entity.dimension.id).getBlock({x:x,y:entity.location.y +1,z:z}).typeId === 'minecraft:light_block') ? entity.location.y + 1 :
    
        (world.getDimension(entity.dimension.id).getBlock({x:x,y:entity.location.y +2,z:z}).typeId === 'minecraft:air' ||
        world.getDimension(entity.dimension.id).getBlock({x:x,y:entity.location.y +2,z:z}).typeId === 'minecraft:light_block') ? entity.location.y +2 : null)

        if(y !== null) {
   
    

     

   
        if (entity?.hasTag('ga:e1')) {
            world.setDynamicProperty(`rdl_pos:z:${x}y:${y}z:${z},dimension:${entity.dimension.id}`, 11);
        } else
        if(entity?.hasTag('ga:e2')){
            world.setDynamicProperty(`rdl_pos:z:${x}y:${y}z:${z},dimension:${entity.dimension.id}`, 15);
        }
       

            }
        }
    });

    const getLightProperties = world.getDynamicPropertyIds();
    getLightProperties.forEach(property => {
        if (property.includes('rdl_pos')) {


    
            const data = extractValues(property);
            if(world.getDimension(data.dimension).getBlock({x:data.x,z:data.z,y:data.y}) !== undefined) {     
            if (world.getDynamicProperty(property) === 0) {

                if (
                    (world.getDimension(data.dimension).getBlock({ x: data.x, y: data.y + 1, z: data.z }).typeId === 'minecraft:water' ||
                    world.getDimension(data.dimension).getBlock({ x: data.x, y: data.y + 1, z: data.z }).typeId === 'minecraft:flowing_water') &&
                    (world.getDimension(data.dimension).getBlock({ x: data.x, y: data.y - 1, z: data.z }).typeId === 'minecraft:water' ||
                    world.getDimension(data.dimension).getBlock({ x: data.x, y: data.y - 1, z: data.z }).typeId === 'minecraft:flowing_water')
                ) {
                    world.getDimension(data.dimension).runCommand(`fill ${data.x} ${data.y} ${data.z} ${data.x} ${data.y} ${data.z} water replace light_block`);
                } else {
                    world.getDimension(data.dimension).runCommand(`fill ${data.x} ${data.y} ${data.z} ${data.x} ${data.y} ${data.z} air replace light_block`);
                }
                    world.setDynamicProperty(property, undefined);
            } else {
                world.getDimension(data.dimension).runCommand(`fill ${data.x} ${data.y} ${data.z} ${data.x} ${data.y} ${data.z} light_block ["block_light_level" =  ${world.getDynamicProperty(property) === 14 ? 15 : world.getDynamicProperty(property)}] replace ${world.getDynamicProperty(property) === 14 ? 'flowing_water' : 'light_block'}`);
                world.getDimension(data.dimension).runCommand(`fill ${data.x} ${data.y} ${data.z} ${data.x} ${data.y} ${data.z} light_block ["block_light_level" = ${world.getDynamicProperty(property) === 14 ? 15 : world.getDynamicProperty(property)}] replace ${world.getDynamicProperty(property) === 14 ? 'water' : 'light_block'}`);
                world.getDimension(data.dimension).runCommand(`fill ${data.x} ${data.y} ${data.z} ${data.x} ${data.y} ${data.z} light_block ["block_light_level" =  ${world.getDynamicProperty(property) === 14 ? 15 : world.getDynamicProperty(property)}] replace ${world.getDynamicProperty(property) === 14 ? 'flowing_water' : 'air'}`);
                world.getDimension(data.dimension).runCommand(`fill ${data.x} ${data.y} ${data.z} ${data.x} ${data.y} ${data.z} light_block ["block_light_level" = ${world.getDynamicProperty(property) === 14 ? 15 : world.getDynamicProperty(property)}] replace ${world.getDynamicProperty(property) === 14 ? 'water' : 'air'}`);
            } 

            
            if (world.getDynamicProperty(property) !== undefined) {

        

            world.setDynamicProperty(property, 0);
                
        
                }

            }
        }
    });
});

function extractValues(propertyName) {
    let match = propertyName.match(/rdl_pos:z:(-?\d+)y:(-?\d+)z:(-?\d+),dimension:(.+)/);
    if (match) {
        let x = parseInt(match[1]);
        let y = parseInt(match[2]);
        let z = parseInt(match[3]);
        let dimension = match[4];

        return { x, y, z, dimension };
    } else {
        return null;
    }
}



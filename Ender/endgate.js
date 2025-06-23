import { world, DimensionLocation, EquipmentSlot, EntityComponentTypes, Vector3 } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

// Store named gates as an array of objects: { name, x, y, z, dimension }.
let endGates = [];

// Load persisted gate data on world initialization
world.afterEvents.worldInitialize.subscribe(() => {
  const saved = world.getDynamicProperty("myaddon:endGates");
  if (saved) {
    try {
      endGates = JSON.parse(saved);
    } catch {
      endGates = [];
    }
  }
});

// Register the block custom component for End Gate
world.beforeEvents.worldInitialize.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("myaddon:end_gate", {
    onPlayerInteract: (evt) => {
      const player = evt.player;
      const block = evt.block;
      const dimension = evt.dimension;
      const loc = block.location;
      
      // Determine item in main hand
      const equippable = player.getComponent(EntityComponentTypes.Equippable);
      let heldItem = null;
      if (equippable) {
        heldItem = equippable.getEquipment(EquipmentSlot.Mainhand);
      }
      const typeId = heldItem ? heldItem.typeId : null;

      // 1) Empty hand: set spawn point to this block
      if (!heldItem) {
        player.setSpawnPoint({dimension: dimension, ...loc});  // set player spawn here:contentReference[oaicite:0]{index=0}
        player.sendMessage(`Spawn point set to End Gate at (${loc.x}, ${loc.y}, ${loc.z})`);
        return;
      }

      // 2) Holding Ender Pearl: show list of gates and teleport
      if (typeId === "minecraft:ender_pearl") {
        if (endGates.length === 0) {
          // No named gates: show simple message
          const noForm = new MessageFormData()
            .title("End Gates")
            .body("No End Gates have been named yet.")
            .button1("OK");
          noForm.show(player);
          return;
        }
        // Build action form with gate names
        const form = new ActionFormData()
          .title("End Gates")
          .body("Select a gate to teleport:");
        endGates.forEach(gate => form.button(gate.name));
        form.show(player).then(response => {
          if (response.canceled) return;
          const target = endGates[response.selection];
          // Teleport logic
          const from = player.location;
          const dx = target.x - from.x;
          const dy = target.y - from.y;
          const dz = target.z - from.z;
          const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

          // Check dimension match; treat as out-of-range if different
          if (target.dimension !== dimension.id) {
            player.sendMessage("Target gate is in a different dimension!");
          }

          // Within range: direct teleport
          if (target.dimension === dimension.id && distance <= 400) {
            dimension.runCommand(`tp ${player.name} ${target.x} ${target.y} ${target.z}`);
          } else {
            // Too far: pick random point between gates, 99% to be on ground
            const t = Math.random();
            const xRand = from.x + (target.x - from.x) * t;
            const zRand = from.z + (target.z - from.z) * t;
            // Get highest block below (xRand, zRand)
            const high = 320;
            const belowBlock = dimension.getBlockBelow({x: xRand, y: high, z: zRand});
            if (belowBlock) {
              const groundY = belowBlock.location.y + 1;
              dimension.runCommand(`tp ${player.name} ${xRand.toFixed(1)} ${groundY} ${zRand.toFixed(1)}`);
            }
            player.sendMessage("End Gate is too far! Teleporting to a random location between gates.");
          }
        });
        return;
      }

      // 3) Holding Paper: open naming UI
      if (typeId === "minecraft:paper") {
        // Find this gate in the list (or add if new)
        let gate = endGates.find(g => 
          g.x === loc.x && g.y === loc.y && g.z === loc.z && g.dimension === dimension.id
        );
        if (!gate) {
          gate = { name: "", x: loc.x, y: loc.y, z: loc.z, dimension: dimension.id };
          endGates.push(gate);
        }
        // Show Modal Form to rename
        const nameForm = new ModalFormData()
          .title("Name End Gate")
          .textField("Enter gate name:", "Gate Name", gate.name || "");
        nameForm.show(player).then(res => {
          if (res.canceled) return;
          const newName = res.formValues[0]?.trim();
          if (newName && newName.length > 0) {
            gate.name = newName;
            // Save global gates list (shared with all players) persistently
            world.setDynamicProperty("myaddon:endGates", JSON.stringify(endGates));
            player.sendMessage(`End Gate at (${loc.x}, ${loc.y}, ${loc.z}) named "${newName}".`);
          } else {
            player.sendMessage("Gate name cannot be empty.");
          }
        });
        return;
      }

      // Otherwise: do nothing special
    }
  });
});

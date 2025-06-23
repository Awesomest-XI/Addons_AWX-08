import {
  world,
  DimensionLocation,
  EquipmentSlot,
  EntityComponentTypes,
  Vector3
} from "@minecraft/server";
import {
  MinecraftItemTypes
} from "@minecraft/vanilla-data";
import {
  ActionFormData,
  ModalFormData,
  MessageFormData
} from "@minecraft/server-ui";

// --------------------------
// Part 1: Teleport Sword
// --------------------------
world.beforeEvents.worldInitialize.subscribe(initEvent => {
  const registry = initEvent.itemComponentRegistry;
  registry.registerCustomComponent("custom:tele_sword", {
    onCompleteUse(event) {
      const user = event.source;
      const all = world.getPlayers();
      const nearest = all
        .filter(p => p.name !== user.name)
        .sort((a, b) =>
          a.location.distance(user.location) -
          b.location.distance(user.location)
        )[0];
      if (!nearest) return;

      const yawRad = (nearest.rotation.yaw + 180) * (Math.PI / 180);
      const behindX = nearest.location.x + Math.sin(yawRad);
      const behindY = nearest.location.y;
      const behindZ = nearest.location.z + Math.cos(yawRad);

      const overworld = world.getDimension("overworld");
      overworld.runCommand(
        `tp "${user.name}" ${behindX} ${behindY} ${behindZ}`
      );
      overworld.runCommand(
        `effect "${user.name}" strength 2 5 true`
      );

      const stack = event.itemStack;
      stack.setDamage(stack.getDamage() + 1);
    },

    onHitEntity(event) {
      const user = event.source;
      world
        .getDimension("overworld")
        .runCommand(`effect "${user.name}" weakness 2 5 true`);
    }
  });
});

// --------------------------
// Part 2: End Gate System
// --------------------------

// In‐memory store (will load/save via dynamic property)
let endGates = [];

// Load persisted gate data on world init
world.afterEvents.worldInitialize.subscribe(() => {
  const saved = world.getDynamicProperty("myaddon:endGates");
  if (typeof saved === "string") {
    try {
      endGates = JSON.parse(saved);
    } catch {
      endGates = [];
    }
  }
});

// Helper to find ground Y at (x,z)
function findGroundY(dimension, x, z) {
  for (let y = 320; y >= 0; y--) {
    const block = dimension.getBlock({ x, y, z });
    if (!block.isAir()) return y + 1;
  }
  return 1;
}

// Register the End Gate block component
world.beforeEvents.worldInitialize.subscribe(evt => {
  evt.blockComponentRegistry.registerCustomComponent("myaddon:end_gate", {
    onPlayerInteract(event) {
      const player = event.player;
      const dim = event.dimension;
      const loc = event.block.location;

      // What the player is holding
      const eq = player.getComponent(EntityComponentTypes.Equippable);
      const stack = eq?.getEquipment(EquipmentSlot.Mainhand);
      const heldId = stack?.typeId;

      // 1) Empty hand: set spawn point
      if (!stack) {
        player.setSpawnPoint({ dimension: dim, ...loc });
        player.sendMessage(
          `Spawn set at End Gate (${loc.x},${loc.y},${loc.z})`
        );
        return;
      }

      // 2) Holding Ender Pearl: show teleport menu
      if (heldId === "minecraft:ender_pearl") {
        if (endGates.length === 0) {
          new MessageFormData()
            .title("End Gates")
            .body("No gates named yet.")
            .button1("OK")
            .show(player);
          return;
        }
        const form = new ActionFormData()
          .title("End Gates")
          .body("Select a gate to teleport:");
        endGates.forEach(g => form.button(g.name));

        form.show(player).then(res => {
          if (res.canceled) return;
          const target = endGates[res.selection];

          // Different dimension?
          if (target.dimension !== dim.id) {
            player.sendMessage(
              "That gate lives in another dimension!"
            );
            return;
          }

          // Distance check
          const dx = target.x - loc.x,
            dy = target.y - loc.y,
            dz = target.z - loc.z;
          const dist = Math.hypot(dx, dy, dz);

          if (dist <= 400) {
            // direct teleport
            dim.runCommand(
              `tp "${player.name}" ${target.x} ${target.y} ${target.z}`
            );
          } else {
            // fallback: random point between
            const t = Math.random();
            const xRand = loc.x + dx * t;
            const zRand = loc.z + dz * t;
            let yRand;
            if (Math.random() < 0.99) {
              yRand = findGroundY(dim, xRand, zRand);
            } else {
              yRand = Math.floor(Math.random() * 320) + 1;
            }
            dim.runCommand(
              `tp "${player.name}" ${xRand.toFixed(1)} ${yRand} ${zRand.toFixed(1)}`
            );
            player.sendMessage(
              "Too far! Teleporting to a random spot between gates."
            );
          }
        });
        return;
      }

      // 3) Holding Paper: name/rename gate
      if (heldId === "minecraft:paper") {
        let gate = endGates.find(
          g =>
            g.x === loc.x &&
            g.y === loc.y &&
            g.z === loc.z &&
            g.dimension === dim.id
        );
        if (!gate) {
          gate = {
            name: "",
            x: loc.x,
            y: loc.y,
            z: loc.z,
            dimension: dim.id
          };
          endGates.push(gate);
        }
        new ModalFormData()
          .title("Name this End Gate")
          .textField("Gate Name:", "Name", gate.name)
          .show(player)
          .then(res => {
            if (res.canceled) return;
            const val = res.formValues[0].trim();
            if (val) {
              gate.name = val;
              world.setDynamicProperty(
                "myaddon:endGates",
                JSON.stringify(endGates)
              );
              player.sendMessage(
                `Gate named “${val}” at (${loc.x},${loc.y},${loc.z}).`
              );
            } else {
              player.sendMessage("Name cannot be empty.");
            }
          });
        return;
      }

      // Otherwise: do nothing
    }
  });
});

/**
 * BaseQuestCore migration — snapshot every user from the OLD core contract
 * into the freshly-deployed NEW core contract.
 *
 * Usage:
 *   OLD_CORE=0x...   the previous (live) BaseQuestCore on Base mainnet
 *   NEW_CORE=0x...   the new BaseQuestCore deployed by scripts/deploy.js
 *   npx hardhat run scripts/migrate.js --network base
 */
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const OLD_ABI = [
  "function getTotalUsers() view returns (uint256)",
  "function allUsers(uint256) view returns (address)",
  "function getUserProfile(address) view returns (uint256 totalXP, string username, bool usernameSet, uint256 tasksCompleted, uint256 joinedAt, uint256 streakCount)",
  "function profileTaskDone(address) view returns (bool)",
  "function dailyTasks(address) view returns (uint256 bits, uint256 day)",
];

const NEW_ABI = [
  "function batchMigrateUsers(address[] users, uint256[] xps, uint256[] tasksCompletedArr, uint256[] streakArr, uint256[] lastActivityDayArr, uint256[] joinedAtArr, string[] usernames, bool[] profileDoneArr) external",
  "function isRegistered(address) view returns (bool)",
  "function getTotalUsers() view returns (uint256)",
];

const BATCH = 25;

async function main() {
  const oldAddr = process.env.OLD_CORE;
  const newAddr = process.env.NEW_CORE;
  if (!oldAddr || !newAddr) throw new Error("Set OLD_CORE and NEW_CORE env vars");

  const [signer] = await ethers.getSigners();
  console.log("Migrator:", signer.address);
  console.log("OLD_CORE:", oldAddr);
  console.log("NEW_CORE:", newAddr);

  const oldCore = new ethers.Contract(oldAddr, OLD_ABI, signer);
  const newCore = new ethers.Contract(newAddr, NEW_ABI, signer);

  const total = Number(await oldCore.getTotalUsers());
  console.log(`Total users to snapshot: ${total}`);

  const snapshot = [];
  for (let i = 0; i < total; i++) {
    const user = await oldCore.allUsers(i);
    const p    = await oldCore.getUserProfile(user);
    const pd   = await oldCore.profileTaskDone(user);
    const dt   = await oldCore.dailyTasks(user);

    snapshot.push({
      user,
      totalXP:         p.totalXP.toString(),
      username:        p.username,
      usernameSet:     p.usernameSet,
      tasksCompleted:  p.tasksCompleted.toString(),
      joinedAt:        p.joinedAt.toString(),
      streakCount:     p.streakCount.toString(),
      lastActivityDay: dt.day.toString(),
      profileDone:     pd,
    });
    console.log(`  [${i + 1}/${total}] ${user}  XP=${p.totalXP}  tasks=${p.tasksCompleted}  streak=${p.streakCount}  user=${p.username || "-"}`);
  }

  // Persist for audit / re-runs.
  const out = path.join(__dirname, "..", "migration-snapshot.json");
  fs.writeFileSync(out, JSON.stringify({ oldCore: oldAddr, newCore: newAddr, takenAt: new Date().toISOString(), users: snapshot }, null, 2));
  console.log(`\nSnapshot written to ${out}`);

  // Push to new contract in chunks.
  for (let i = 0; i < snapshot.length; i += BATCH) {
    const chunk = snapshot.slice(i, i + BATCH);
    const tx = await newCore.batchMigrateUsers(
      chunk.map(u => u.user),
      chunk.map(u => u.totalXP),
      chunk.map(u => u.tasksCompleted),
      chunk.map(u => u.streakCount),
      chunk.map(u => u.lastActivityDay),
      chunk.map(u => u.joinedAt),
      chunk.map(u => u.username || ""),
      chunk.map(u => u.profileDone),
    );
    console.log(`Batch ${i / BATCH + 1}: tx ${tx.hash}`);
    await tx.wait();
  }

  const newTotal = Number(await newCore.getTotalUsers());
  console.log(`\nDone. NEW_CORE now has ${newTotal} registered users.`);
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

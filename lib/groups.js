function makeGroupResolver(sock) {
  let nameToJid = new Map();

  async function refresh() {
    const groups = await sock.groupFetchAllParticipating();
    nameToJid = new Map(
      Object.values(groups).map((g) => [g.subject.trim().toLowerCase(), g.id])
    );
    console.log(`Loaded ${nameToJid.size} WhatsApp groups.`);
  }

  function resolve(groupName) {
    const jid = nameToJid.get(groupName.trim().toLowerCase());
    if (!jid) {
      throw new Error(`No WhatsApp group found matching "${groupName}"`);
    }
    return jid;
  }

  return { refresh, resolve };
}

module.exports = { makeGroupResolver };

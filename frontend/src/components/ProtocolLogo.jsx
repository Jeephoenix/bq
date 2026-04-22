import { useState } from "react";

const LOGO_URLS = {
  base:      "https://icons.llamao.fi/icons/chains/rsz_base",
  uniswap:   "https://icons.llamao.fi/icons/protocols/uniswap",
  aerodrome: "https://icons.llamao.fi/icons/protocols/aerodrome-v2",
  layerzero: "https://icons.llamao.fi/icons/protocols/layerzero",
  wormhole:  "https://icons.llamao.fi/icons/protocols/wormhole",
  stargate:  "https://icons.llamao.fi/icons/protocols/stargate",
  across:    "https://icons.llamao.fi/icons/protocols/across",
  hop:       "https://icons.llamao.fi/icons/protocols/hop-protocol",
  synapse:   "https://icons.llamao.fi/icons/protocols/synapse",
  orbiter:   "https://icons.llamao.fi/icons/protocols/orbiter-finance",
  celer:     "https://icons.llamao.fi/icons/protocols/cbridge",
  lifi:      "https://icons.llamao.fi/icons/protocols/lifi",
  socket:    "https://icons.llamao.fi/icons/protocols/socket",
  debridge:  "https://icons.llamao.fi/icons/protocols/debridge",
  axelar:    "https://icons.llamao.fi/icons/protocols/axelar",
  chainlink: "https://icons.llamao.fi/icons/protocols/chainlink",
  owlto:     "https://icons.llamao.fi/icons/protocols/owlto-finance",
  rhino:     "https://icons.llamao.fi/icons/protocols/rhino.fi",
  relay:     "https://icons.llamao.fi/icons/protocols/relay-bridge",
};

const FALLBACK_COLORS = {
  base:      "#0052ff",
  uniswap:   "#ff007a",
  aerodrome: "#0052ff",
  layerzero: "#a855f7",
  wormhole:  "#00d4ff",
  stargate:  "#f59e0b",
  across:    "#00c853",
  hop:       "#e040fb",
  synapse:   "#a855f7",
  orbiter:   "#00d4ff",
  celer:     "#f59e0b",
  lifi:      "#0052ff",
  socket:    "#00d4ff",
  debridge:  "#a855f7",
  axelar:    "#00c853",
  chainlink: "#375bd2",
  owlto:     "#f59e0b",
  rhino:     "#a855f7",
  relay:     "#64748b",
};

const INITIALS = {
  base:      "B",
  uniswap:   "U",
  aerodrome: "A",
  layerzero: "L",
  wormhole:  "W",
  stargate:  "S",
  across:    "A",
  hop:       "H",
  synapse:   "SY",
  orbiter:   "O",
  celer:     "C",
  lifi:      "LI",
  socket:    "SO",
  debridge:  "dB",
  axelar:    "AX",
  chainlink: "CL",
  owlto:     "OW",
  rhino:     "RH",
  relay:     "RE",
};

export default function ProtocolLogo({ id, size = 32 }) {
  const [failed, setFailed] = useState(false);
  const url    = LOGO_URLS[id];
  const color  = FALLBACK_COLORS[id] || "#64748b";
  const letter = INITIALS[id] || (id ? id[0].toUpperCase() : "?");

  if (!url || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `${color}22`,
        border: `1.5px solid ${color}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: size * 0.38, fontWeight: "700", color, lineHeight: 1 }}>{letter}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={id}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        borderRadius: "50%",
        flexShrink: 0,
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

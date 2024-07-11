export interface VPSDto {
  region: string;
  region_slug: string;
  status: string;
  memory: number;
  disk: number;
  vcpu: number;
  price_monthly: number;
  price_hourly: number;
  operating_system: string;
  ipv4_private?: string;
  ipv4_public?: string;
  ipv6: string;
}

export const vpsSchema = {
  type: "object",
  required: [
    "region",
    "region_slug",
    "status",
    "memory",
    "disk",
    "vcpu",
    "price_monthly",
    "price_hourly",
    "operating_system",
    "ipv4_private",
    "ipv4_public",
    "ipv6",
  ],
  properties: {
    region: { type: "string" },
    region_slug: { type: "string" },
    memory: { type: "number" },
    disk: { type: "number" },
    vcpu: { type: "number" },
    price_monthly: { type: "number" },
    price_hourly: { type: "number" },
    operating_system: { type: "string" },
    ipv4: { type: "string" },
    ipv6: { type: "string" },
  },
};

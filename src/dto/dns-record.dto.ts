export interface DnsRecordDto {
  name: string;
  type: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  domainId: string;
}

export const dnsRecordSchema = {
  type: "object",
  required: ["name", "type", "content", "proxiable", "proxied", "domainId"],
  properties: {
    name: { type: "string" },
    type: { type: "string" },
    content: { type: "string" },
    proxiable: { type: "boolean" },
    proxied: { type: "boolean" },
    domainId: { type: "string" },
  },
};

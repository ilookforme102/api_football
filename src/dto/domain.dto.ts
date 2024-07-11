export interface DomainDto {
  id: string;
  cf_account_email: string;
  domain: string;
  name_servers: string[];
  hosted_vps_id?: number;
}

export const domainSchema = {
  type: "object",
  required: ["cf_account_email", "domain", "name_servers"],
  properties: {
    cf_account_email: { type: "string" },
    domain: { type: "string" },
    name_servers: { type: "array", items: { type: "string" } },
    hosted_vps_id: { type: "string" },
  },
};

export interface SubdomainDto {
  name: string;
  root_domain_id: string;
  hosted_vps_id?: number;
}

export const subdomainSchema = {
  type: "object",
  required: ["name", "root_domain_id"],
  properties: {
    name: { type: "string" },
    hosted_vps_id: { type: "number" },
    root_domain_id: { type: "string" },
  },
};

export interface RedirectDto {
  target_domain: string;
  current_domain_id: string;
}

export const redirectDomainSchema = {
  type: "object",
  required: ["target_domain", "current_domain_id"],
  properties: {
    target_domain: { type: "string" },
    current_domain_id: { type: "string" },
  },
};

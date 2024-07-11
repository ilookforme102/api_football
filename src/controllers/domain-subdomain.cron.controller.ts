import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
const whois = require("whois");
export interface DomainInfor {
  id: string;
  domain: string;
  cf_account_email: string | null;
  cf_account: {
    auth_key: string | null;
  };
}
interface DnsByWebsite {
  result: any[];
  success: boolean;
  errors: any[];
  result_info: {
    page: number;
    per_page: number;
    count: number;
    total_count: number;
    total_pages: number;
  };
}
const CLOUDFLARE_API_URL: string = "https://api.cloudflare.com/client/v4/zones";
export const get_domain_cf_info = async () => {
  try {
    const domains = await db.domain.findMany({
      select: {
        id: true,
        domain: true,
        cf_account_email: true,
        cf_account: {
          select: {
            auth_key: true,
          },
        },
      },
      where: {
        cf_account_email: {
          not: null,
        },
      },
    });
    return domains;
  } catch (error) {
    console.log(error);
  }
};
// const data = await get_domain_f_info();
// for (const domain of data) {
//     console.log(domain.cf_account?.auth_key);
// }

function extractProviderName(data: string): string | null {
  // This regex pattern might need to be adjusted based on the actual format of the whois data
  const providerPattern = /org-name:\s*(.+)/i;
  const match = data.match(providerPattern);
  return match ? match[1].replaceAll(/company|limited|inc/gi, "").trim() : null;
}

function lookupDomain(domain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    whois.lookup(domain, (err: Error, data: string) => {
      if (err) {
        reject(null);
      } else {
        resolve(extractProviderName(data) as any);
      }
    });
  });
}
export const get_sub_domain_table = async (
  domain: any,
  rep: FastifyReply
  // req:FastifyRequest
) => {
  const page = 1;
  const per_page = 100;
  const url = `${CLOUDFLARE_API_URL}/${domain.id}/dns_records?page=${page}&per_page=${per_page}`;
  try {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Email": domain.cf_account_email,
        "X-Auth-Key": domain.cf_account.auth_key,
        "Content-Type": "application/json",
      },
    });
    const data = (await response.json()) as DnsByWebsite;
    const currentSubDomains: string[] = [];
    if (data.success) {
      for (const record of data.result) {
        // Check if the record is a subdomain
        if (record.name == domain.domain) {
          const domain = await db.domain.findFirst({
            where: {
              domain: record.name,
            },
          });
          if (domain) {
            if (
              domain.hosted_vps_id == null ||
              domain.hosted_vps_id !== record.content
            ) {
              const hosted_vps_id = await db.vps.findFirst({
                where: {
                  ipv4_public: record.content,
                },
              });

              if (hosted_vps_id) {
                await db.domain.update({
                  where: {
                    domain: record.name,
                  },
                  data: {
                    hosted_vps_id: hosted_vps_id?.id,
                  },
                });
              }

              if (
                !hosted_vps_id &&
                !record.name.includes("www") &&
                record.type == "A"
              ) {
                const provider_name = await lookupDomain(record.content);
                if (provider_name) {
                  let vps = null;
                  const is_vps_acc_exist = await db.vps_account.findFirst({
                    where: { provider_name: provider_name },
                  });
                  if (!is_vps_acc_exist) {
                    const vps_acc = await db.vps_account.create({
                      data: { provider_name },
                    });
                    vps = await db.vps.create({
                      data: {
                        vps_account_id: vps_acc.id,
                        ipv4_public: record.content,
                      },
                    });
                  } else {
                    vps = await db.vps.create({
                      data: {
                        vps_account_id: is_vps_acc_exist.id,
                        ipv4_public: record.content,
                      },
                    });
                  }

                  await db.domain.update({
                    where: {
                      domain: record.name,
                    },
                    data: {
                      hosted_vps_id: vps?.id,
                    },
                  });
                }
              }
            }
          }
        }
        // console.log("Sub Maybe domain: ",record.name);
        // console.log("Root Domain: ",domain.domain);
        // console.log("Id: ",domain.id);
        // console.log(
        //   record.name !== domain.domain &&
        //     !record.name.includes("www") &&
        //     record.type == "A"
        // );
        // Run update or create new dns record
        const DnsRecordExist = await db.dns_record.findFirst({
          select: {
            id: true,
            dns_id: true,
            name: true,
            type: true,
            content: true,
            proxiable: true,
            proxied: true,
            domain: true,
          },
          where: {
            dns_id: record.id,
          },
        });
        if (DnsRecordExist) {
          if (
            DnsRecordExist.id !== record.id ||
            DnsRecordExist.type !== record.type ||
            DnsRecordExist.name !== record.name ||
            DnsRecordExist.content !== record.content ||
            DnsRecordExist.proxiable !== record.proxiable ||
            DnsRecordExist.proxied !== record.proxied
          ) {
            try {
              await db.dns_record.update({
                where: {
                  dns_id: record.id,
                },
                data: {
                  type: record.type,
                  name: record.name,
                  content: record.content,
                  proxiable: record.proxiable,
                  proxied: record.proxied,
                  domainId: domain.id,
                },
              });
            } catch (error) {
              console.log(error);
            }
          }
        } else {
          await db.dns_record.create({
            data: {
              dns_id: record.id,
              name: record.name,
              type: record.type,
              content: record.content,
              proxiable: record.proxiable,
              proxied: record.proxied,
              domainId: domain.id,
            },
          });
        }
        // console.log("Is sub domain existed", DnsRecordExist);
        // console.log("Subdomain created", record.name);
        // filter out subdomain from data returned from cloudflare
        // name can only be consider as dubomain if it
        // 1: diferent from root domain
        // 2: not include www
        // 3: type is A
        if (
          record.name !== domain.domain &&
          !record.name.includes("www") &&
          record.type == "A"
        ) {
          let vps = await db.vps.findFirst({
            where: {
              ipv4_public: record.content,
            },
          });

          if (!vps) {
            const provider_name = await lookupDomain(record.content);
            if (provider_name) {
              const is_vps_acc_exist = await db.vps_account.findFirst({
                where: { provider_name: provider_name },
              });
              if (!is_vps_acc_exist) {
                const vps_acc = await db.vps_account.create({
                  data: { provider_name },
                });
                vps = await db.vps.create({
                  data: {
                    vps_account_id: vps_acc.id,
                    ipv4_public: record.content,
                  },
                });
              } else {
                vps = await db.vps.create({
                  data: {
                    vps_account_id: is_vps_acc_exist.id,
                    ipv4_public: record.content,
                  },
                });
              }
            }
          }

          currentSubDomains.push(record.name);
          const vpsId = vps?.id;
          // console.log("VPS ID", vpsId);
          // Check if the subdomain exists before creating it
          const subDomainExists = await db.sub_domain.findFirst({
            select: {
              hosted_vps_id: true,
              name: true,
            },
            where: {
              name: record.name,
            },
          });
          // If the subdomain exists, check if it is hosted on the same VPS
          if (subDomainExists) {
            if (subDomainExists.hosted_vps_id !== vpsId) {
              try {
                await db.sub_domain.update({
                  where: {
                    name: record.name,
                  },
                  data: {
                    hosted_vps_id: vpsId,
                  },
                });
              } catch (error) {
                console.log(error);
                console.log("Subdomain updated", record.name);
              }
            }
          }

          // If the subdomain does not exist, create it
          else {
            try {
              await db.sub_domain.create({
                data: {
                  name: record.name,
                  root_domain_id: domain.id,
                  row_id: domain.row_id,
                  hosted_vps_id: vpsId,
                },
              });
              console.log("Subdomain created", record.name);
              console.log("Root Domain", domain.domain);
              console.log("VPS ID", vpsId);
            } catch (error) {
              console.log(error);
            }
          }
          // console.log("Is sub domain existed",subDomainExists)
        } else {
          console.log("No valid subdomain found to update");
        }
      }
      ////
      const subDomains = await db.sub_domain.findMany({
        where: {
          root_domain_id: domain.id,
        },
      });
      const subDomainsArr: string[] = subDomains.map(
        (subDomain) => subDomain.name
      );
      // Check if the subdomain exists in the database but not in Cloudflare
      const subDomainsToDelete = subDomainsArr.filter(
        (subDomain) => !currentSubDomains.includes(subDomain)
      );
      for (const subDomain of subDomainsToDelete) {
        await db.sub_domain.delete({
          where: {
            name: subDomain,
          },
        });
      }
    }
  } catch (error: any) {
    errorHandler(error, rep);
  }
};
